/**
 * Demo donation sites for the Food Rescue Portal spell.
 * In production, these would come from the Google Places API.
 */

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
