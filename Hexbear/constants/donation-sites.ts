/**
 * Donation sites for the Food Rescue Portal spell.
 *
 * Supports two modes:
 *   1) Live search via Google Places API (Nearby Search) — returns real
 *      food banks, food pantries, shelters, and community fridges near the
 *      user's current location.
 *   2) Hardcoded demo sites (Athens, GA) used as a fallback when the API
 *      is unavailable or the key doesn't have the Places API enabled.
 */

import { GOOGLE_PLACES_API_KEY } from '@/lib/supabase';

export interface DonationSite {
  id: string;
  name: string;
  address: string;
  type: 'food_bank' | 'community_fridge' | 'shelter' | 'pantry';
  distance?: string;
  latitude: number;
  longitude: number;
  hours: string;
  phone?: string;
  acceptedItems: string[];
  description: string;
}

// Demo sites (Athens, GA area – for hackathon demo)
export const DEMO_DONATION_SITES: DonationSite[] = [
  {
    id: '1',
    name: 'Athens Community Fridge',
    address: '199 Prince Ave, Athens, GA 30601',
    type: 'community_fridge',
    latitude: 33.9607,
    longitude: -83.3831,
    hours: 'Open 24/7',
    acceptedItems: [
      'Prepared foods',
      'Fresh produce',
      'Packaged snacks',
      'Beverages',
    ],
    description:
      'A free community fridge where anyone can leave or take food. No questions asked!',
  },
  {
    id: '2',
    name: 'Food Bank of Northeast Georgia',
    address: '861 Newton Bridge Rd, Athens, GA 30607',
    type: 'food_bank',
    latitude: 33.9753,
    longitude: -83.4076,
    hours: 'Mon-Fri 8AM-4PM',
    phone: '(706) 354-8191',
    acceptedItems: [
      'Canned goods',
      'Dry goods',
      'Fresh produce',
      'Frozen meats',
      'Dairy',
    ],
    description:
      'Serving 14 counties in Northeast Georgia. Your donation feeds families in need.',
  },
  {
    id: '3',
    name: 'Campus Kitchen at UGA',
    address: '280 E Broad St, Athens, GA 30601',
    type: 'pantry',
    latitude: 33.9544,
    longitude: -83.3737,
    hours: 'Mon-Thu 11AM-2PM',
    acceptedItems: [
      'Leftover catering food',
      'Fresh produce',
      'Prepared meals',
    ],
    description:
      'Student-run program that recovers surplus food from campus dining halls and transforms it into meals for the community.',
  },
  {
    id: '4',
    name: 'Our Daily Bread Soup Kitchen',
    address: '90 N Church St, Athens, GA 30601',
    type: 'shelter',
    latitude: 33.9612,
    longitude: -83.3774,
    hours: 'Daily 11AM-1PM',
    phone: '(706) 353-1076',
    acceptedItems: [
      'Hot meals',
      'Fresh bread',
      'Canned soups',
      'Fresh vegetables',
    ],
    description:
      'Providing hot meals to those in need in the Athens community since 1983.',
  },
  {
    id: '5',
    name: 'Salvation Army Athens',
    address: '345 N Lumpkin St, Athens, GA 30601',
    type: 'shelter',
    latitude: 33.9623,
    longitude: -83.3821,
    hours: 'Mon-Fri 9AM-5PM',
    phone: '(706) 543-3294',
    acceptedItems: [
      'Non-perishable foods',
      'Canned goods',
      'Bottled water',
      'Snacks',
    ],
    description:
      'Community center offering meals, shelter, and support services to those in need.',
  },
];

/**
 * Get the type label for a donation site
 */
export function getSiteTypeLabel(type: DonationSite['type']): string {
  switch (type) {
    case 'food_bank':
      return 'Food Bank';
    case 'community_fridge':
      return 'Community Fridge';
    case 'shelter':
      return 'Shelter';
    case 'pantry':
      return 'Food Pantry';
  }
}

/**
 * Get icon name for site type (Ionicons)
 */
export function getSiteTypeIcon(type: DonationSite['type']): string {
  switch (type) {
    case 'food_bank':
      return 'business';
    case 'community_fridge':
      return 'cube';
    case 'shelter':
      return 'home';
    case 'pantry':
      return 'basket';
  }
}

/**
 * Food waste impact constants
 */
export const FOOD_WASTE_STATS = {
  co2PerDonation: 2.5, // kg CO₂ equivalent saved per donation
  pointsPerDonation: 30,
  mealsPerDonation: 5, // estimated meals per average donation
  methaneMultiplier: 25, // methane is 25x more potent than CO₂
};

// ─── Google Places API integration ────────────────────────────────────

/**
 * Search keywords we cycle through to find food-donation-related places.
 * Each keyword produces a separate Nearby Search request; results are
 * merged and deduplicated by place_id.
 */
const DONATION_SEARCH_KEYWORDS = [
  'food bank',
  'food pantry',
  'community fridge',
  'food donation',
  'soup kitchen',
  'homeless shelter food',
];

/** Radius in metres (~10 miles) */
const SEARCH_RADIUS_M = 16000;

/** Default accepted items when the Places API doesn't tell us */
const DEFAULT_ACCEPTED_ITEMS = [
  'Canned goods',
  'Fresh produce',
  'Packaged foods',
  'Non-perishable items',
];

/**
 * Classify a Google Places result into one of the app's site types based
 * on its name and the keyword that matched it.
 */
function classifySiteType(
  name: string,
  keyword: string
): DonationSite['type'] {
  const lower = (name + ' ' + keyword).toLowerCase();
  if (lower.includes('fridge')) return 'community_fridge';
  if (lower.includes('pantry')) return 'pantry';
  if (lower.includes('shelter') || lower.includes('salvation') || lower.includes('soup'))
    return 'shelter';
  return 'food_bank';
}

/**
 * Build a short description from the place name and type.
 */
function buildDescription(name: string, type: DonationSite['type']): string {
  switch (type) {
    case 'community_fridge':
      return `${name} is a community fridge where anyone can leave or take food.`;
    case 'pantry':
      return `${name} provides food assistance to individuals and families in the area.`;
    case 'shelter':
      return `${name} offers meals and support services to those in need.`;
    case 'food_bank':
    default:
      return `${name} collects and distributes food to those in need in the community.`;
  }
}

/**
 * Fetch real nearby donation sites using Google Places API (Nearby Search).
 *
 * Returns an array of `DonationSite` objects sorted by distance from the
 * user.  Falls back to `null` on any error so the caller can use the demo
 * data instead.
 *
 * Requires the **Places API** to be enabled on the same Google Cloud
 * project as the Vision API key.
 */
export async function fetchNearbyDonationSites(
  latitude: number,
  longitude: number
): Promise<DonationSite[] | null> {
  try {
    // Fire requests for each keyword in parallel
    const allResults: Map<string, { place: any; keyword: string }> = new Map();

    await Promise.all(
      DONATION_SEARCH_KEYWORDS.map(async (keyword) => {
        const url =
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
          `?location=${latitude},${longitude}` +
          `&radius=${SEARCH_RADIUS_M}` +
          `&keyword=${encodeURIComponent(keyword)}` +
          `&key=${GOOGLE_PLACES_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'REQUEST_DENIED') {
          // API key doesn't have Places API enabled
          console.log(
            `Places API denied for keyword "${keyword}":`,
            data.error_message
          );
          return;
        }

        if (data.results && Array.isArray(data.results)) {
          for (const place of data.results) {
            if (!allResults.has(place.place_id)) {
              allResults.set(place.place_id, { place, keyword });
            }
          }
        }
      })
    );

    if (allResults.size === 0) {
      console.log('Places API returned no results (API may not be enabled)');
      return null;
    }

    // Convert Google Places results → DonationSite[]
    const sites: DonationSite[] = [];

    for (const [placeId, { place, keyword }] of allResults) {
      const type = classifySiteType(place.name || '', keyword);

      sites.push({
        id: placeId,
        name: place.name || 'Unknown Site',
        address: place.vicinity || place.formatted_address || 'Address unavailable',
        type,
        latitude: place.geometry?.location?.lat ?? 0,
        longitude: place.geometry?.location?.lng ?? 0,
        hours: place.opening_hours?.open_now
          ? 'Open now'
          : place.opening_hours
          ? 'Currently closed'
          : 'Hours not available',
        phone: undefined, // Nearby Search doesn't return phone; Place Details would
        acceptedItems: DEFAULT_ACCEPTED_ITEMS,
        description: buildDescription(place.name || 'This site', type),
      });
    }

    // Sort by distance from user
    sites.sort((a, b) => {
      const distA = haversine(latitude, longitude, a.latitude, a.longitude);
      const distB = haversine(latitude, longitude, b.latitude, b.longitude);
      return distA - distB;
    });

    // Attach readable distance strings
    for (const site of sites) {
      const miles = haversine(latitude, longitude, site.latitude, site.longitude);
      site.distance = miles.toFixed(1);
    }

    return sites;
  } catch (err) {
    console.log('fetchNearbyDonationSites error:', err);
    return null;
  }
}

/** Haversine distance in miles */
function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
