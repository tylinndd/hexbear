import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { MagicColors, Fonts, FontWeights, FontSizes } from '@/constants/theme';
import { MagicButton } from '@/components/MagicButton';
import { SuccessModal } from '@/components/SuccessModal';
import { useAuth } from '@/contexts/AuthContext';
import {
  DEMO_DONATION_SITES,
  DonationSite,
  getSiteTypeLabel,
  getSiteTypeIcon,
  FOOD_WASTE_STATS,
  fetchNearbyDonationSites,
} from '@/constants/donation-sites';
import { Ionicons } from '@expo/vector-icons';
import { DONATION_FACTS, getRandomItem } from '@/constants/eco-facts';

export default function DonateScreen() {
  const randomDonationFact = useMemo(() => getRandomItem(DONATION_FACTS), []);
  const [sites, setSites] = useState<DonationSite[]>(DEMO_DONATION_SITES);
  const [selectedSite, setSelectedSite] = useState<DonationSite | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [usingLiveData, setUsingLiveData] = useState(false);
  const [loadingSites, setLoadingSites] = useState(false);
  const { logAction } = useAuth();

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setUserLocation({ latitude, longitude });
      setLoadingSites(true);

      // ── Try Google Places API first for real nearby sites ──
      const liveSites = await fetchNearbyDonationSites(latitude, longitude);

      if (liveSites && liveSites.length > 0) {
        console.log(`Places API returned ${liveSites.length} real sites`);
        setSites(liveSites);
        setUsingLiveData(true);
        setLoadingSites(false);
        return;
      }

      // ── Fallback: use demo data sorted by distance ──
      console.log('Falling back to demo donation sites');
      const sorted = [...DEMO_DONATION_SITES].map((site) => ({
        ...site,
        distance: calculateDistance(latitude, longitude, site.latitude, site.longitude),
      }));
      sorted.sort(
        (a, b) =>
          parseFloat(a.distance || '999') - parseFloat(b.distance || '999')
      );
      setSites(sorted);
      setLoadingSites(false);
    } catch (err) {
      console.log('Location error:', err);
      setLoadingSites(false);
    }
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): string => {
    const R = 3959; // Earth radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(1);
  };

  const openDirections = (site: DonationSite) => {
    // For live data (Google Places) the coordinates are accurate, so use
    // them directly. For demo/fallback data use the address string because
    // the hardcoded coordinates may be imprecise.
    const destination = usingLiveData
      ? `${site.latitude},${site.longitude}`
      : encodeURIComponent(site.address);

    const url = Platform.select({
      ios: `maps://app?daddr=${destination}`,
      android: `google.navigation:q=${destination}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
    });

    if (url) {
      Linking.openURL(url).catch(() => {
        // Fallback: always try the address string via Google Maps web
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
            site.address
          )}`
        );
      });
    }
  };

  const confirmDonation = async () => {
    if (!selectedSite) return;

    await logAction(
      'donate',
      {
        site_name: selectedSite.name,
        site_type: selectedSite.type,
        co2_saved: FOOD_WASTE_STATS.co2PerDonation,
        meals_provided: FOOD_WASTE_STATS.mealsPerDonation,
      },
      FOOD_WASTE_STATS.pointsPerDonation
    );

    setShowSuccess(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.spellIconContainer}>
            <Ionicons name="heart" size={56} color={MagicColors.textLight} />
          </View>
          <Text style={styles.spellTitle}>Food Rescue Portal</Text>
          <Text style={styles.spellSubtitle}>
            Community Food Sharing Spell
          </Text>
          <Text style={styles.spellDescription}>
            Rescue surplus food from going to waste by donating to nearby food
            banks and community fridges. Feed people, fight climate change!
          </Text>
        </View>

        {/* Impact Banner */}
        <View style={styles.impactBanner}>
          <View style={styles.impactStat}>
            <Text style={styles.impactStatValue}>8%</Text>
            <Text style={styles.impactStatLabel}>
              of global emissions come from food waste
            </Text>
          </View>
          <View style={styles.impactDivider} />
          <View style={styles.impactStat}>
            <Text style={styles.impactStatValue}>25x</Text>
            <Text style={styles.impactStatLabel}>
              methane is more potent than CO₂
            </Text>
          </View>
        </View>

        {/* Selected Site Detail */}
        {selectedSite && (
          <View style={styles.selectedCard}>
            <View style={styles.selectedHeader}>
              <View style={styles.selectedIconContainer}>
                <Ionicons 
                  name={getSiteTypeIcon(selectedSite.type) as any} 
                  size={32} 
                  color={MagicColors.donateRose}
                />
              </View>
              <View style={styles.selectedInfo}>
                <Text style={styles.selectedName}>{selectedSite.name}</Text>
                <Text style={styles.selectedType}>
                  {getSiteTypeLabel(selectedSite.type)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedSite(null)}>
                <Ionicons name="close-circle" size={28} color={MagicColors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.selectedAddressRow}>
              <Ionicons name="location" size={16} color={MagicColors.textSecondary} />
              <Text style={styles.selectedAddress}>{selectedSite.address}</Text>
            </View>
            <View style={styles.selectedAddressRow}>
              <Ionicons name="time" size={16} color={MagicColors.textSecondary} />
              <Text style={styles.selectedHours}>{selectedSite.hours}</Text>
            </View>
            {selectedSite.phone && (
              <View style={styles.selectedAddressRow}>
                <Ionicons name="call" size={16} color={MagicColors.textSecondary} />
                <Text style={styles.selectedPhone}>{selectedSite.phone}</Text>
              </View>
            )}

            <Text style={styles.selectedDescription}>
              {selectedSite.description}
            </Text>

            <Text style={styles.acceptedTitle}>Accepted Items:</Text>
            <View style={styles.acceptedList}>
              {selectedSite.acceptedItems.map((item, index) => (
                <View key={index} style={styles.acceptedItem}>
                  <Text style={styles.acceptedItemText}>{'✦'} {item}</Text>
                </View>
              ))}
            </View>

            <View style={styles.selectedActions}>
              <MagicButton
                title="Get Directions"
                iconName="map"
                variant="outline"
                onPress={() => openDirections(selectedSite)}
                size="medium"
                style={{ flex: 1, marginRight: 8 }}
              />
              <MagicButton
                title="Donated!"
                iconName="checkmark-circle"
                onPress={confirmDonation}
                size="medium"
                style={{ flex: 1 }}
              />
            </View>

            <View style={styles.rewardPreview}>
              <Ionicons name="star" size={20} color={MagicColors.gold} style={{ marginRight: 8 }} />
              <Text style={styles.rewardText}>
                Completing this spell awards{' '}
                <Text style={{ color: MagicColors.gold, fontWeight: FontWeights.extrabold }}>
                  +{FOOD_WASTE_STATS.pointsPerDonation} GHG points
                </Text>{' '}
                and saves ~{FOOD_WASTE_STATS.co2PerDonation} kg CO₂!
              </Text>
            </View>
          </View>
        )}

        {/* Nearby Sites List */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="map" size={24} color={MagicColors.textPrimary} />
            <Text style={styles.sectionTitle}>
              Nearby Portals
            </Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            {usingLiveData
              ? 'Real donation sites found near you'
              : 'Select a donation site to begin the spell'}
          </Text>
          {!usingLiveData && !loadingSites && (
            <View style={styles.demoBanner}>
              <Ionicons name="information-circle" size={16} color={MagicColors.goldDark} />
              <Text style={styles.demoBannerText}>
                Showing demo sites (Athens, GA). Enable the Places API on your Google Cloud project for live results near you.
              </Text>
            </View>
          )}
        </View>

        {loadingSites && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={MagicColors.donateRose} />
            <Text style={styles.loadingText}>Searching for nearby portals...</Text>
          </View>
        )}

        {!loadingSites && sites.map((site) => (
          <TouchableOpacity
            key={site.id}
            style={[
              styles.siteCard,
              selectedSite?.id === site.id && styles.siteCardSelected,
            ]}
            onPress={() => setSelectedSite(site)}
            activeOpacity={0.85}
          >
            <View style={styles.siteIconContainer}>
              <Ionicons 
                name={getSiteTypeIcon(site.type) as any} 
                size={28} 
                color={MagicColors.donateRose}
              />
            </View>
            <View style={styles.siteContent}>
              <Text style={styles.siteName}>{site.name}</Text>
              <Text style={styles.siteType}>
                {getSiteTypeLabel(site.type)}
              </Text>
              <Text style={styles.siteAddress}>{site.address}</Text>
            </View>
            {site.distance && (
              <View style={styles.distanceBadge}>
                <Text style={styles.distanceValue}>{site.distance}</Text>
                <Text style={styles.distanceUnit}>mi</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* No sites fallback — only shown when not loading */}
        {!loadingSites && sites.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="compass-outline" size={48} color={MagicColors.textMuted} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No Portals Found</Text>
            <Text style={styles.emptyText}>
              No nearby donation sites found. But fear not! You can directly
              call local shelters or share food with a neighbor in need.
            </Text>
          </View>
        )}


        {/* Food waste info */}
        <View style={styles.infoCard}>
          <View style={styles.infoTitleRow}>
            <Ionicons name="earth" size={20} color={MagicColors.emerald} style={{ marginRight: 8 }} />
            <Text style={styles.infoTitle}>Why Food Rescue Matters</Text>
          </View>
          <Text style={styles.infoText}>
            If food waste were its own country, it would be the third-largest
            emitter of greenhouse gases after China and the USA. By rescuing
            food, you prevent methane emissions from landfills and help feed
            your community. Truly the most magical transformation!
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccess}
        title="Food Rescue Complete!"
        message={`You donated food to ${
          selectedSite?.name || 'a local organization'
        }! This could feed ~${FOOD_WASTE_STATS.mealsPerDonation} people today.`}
        pointsAwarded={FOOD_WASTE_STATS.pointsPerDonation}
        co2Saved={`${FOOD_WASTE_STATS.co2PerDonation} kg`}
        funFact={randomDonationFact}
        onClose={() => {
          setShowSuccess(false);
          setSelectedSite(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MagicColors.parchment,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 16,
  },
  spellIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: MagicColors.cardOrange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 0,
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.25)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 6,
      },
    }),
  },
  spellTitle: {
    fontSize: FontSizes.pageTitle,
    fontWeight: FontWeights.extrabold,
    color: MagicColors.textPrimary,
    fontFamily: Fonts.heading,
  },
  spellSubtitle: {
    fontSize: 14,
    color: MagicColors.donateRose,
    fontWeight: FontWeights.semibold,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: Fonts.body,
  },
  spellDescription: {
    fontSize: 14,
    color: MagicColors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    fontFamily: Fonts.body,
  },

  // Impact Banner
  impactBanner: {
    flexDirection: 'row',
    backgroundColor: MagicColors.cardOrange,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 0,
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.25)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 6,
      },
    }),
  },
  impactStat: {
    flex: 1,
    alignItems: 'center',
  },
  impactStatValue: {
    fontSize: 28,
    fontWeight: FontWeights.extrabold,
    color: MagicColors.textLight,
    fontFamily: Fonts.mono,
  },
  impactStatLabel: {
    fontSize: 11,
    color: MagicColors.textLight,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 15,
    fontFamily: Fonts.body,
    opacity: 0.9,
  },
  impactDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 12,
  },

  // Selected Site
  selectedCard: {
    backgroundColor: MagicColors.offWhiteSolid,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: MagicColors.donateRose + '50',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
      },
    }),
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: MagicColors.donateRose + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedName: {
    fontSize: 18,
    fontWeight: '700',
    color: MagicColors.textPrimary,
  },
  selectedType: {
    fontSize: 13,
    color: MagicColors.donateRose,
    fontWeight: '600',
    marginTop: 2,
  },
  closeButton: {
    fontSize: 20,
    color: MagicColors.textMuted,
    padding: 8,
  },
  selectedAddress: {
    fontSize: 14,
    color: MagicColors.textSecondary,
    marginBottom: 4,
  },
  selectedHours: {
    fontSize: 14,
    color: MagicColors.textSecondary,
    marginBottom: 4,
  },
  selectedPhone: {
    fontSize: 14,
    color: MagicColors.info,
    marginBottom: 8,
  },
  selectedDescription: {
    fontSize: 14,
    color: MagicColors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  acceptedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: MagicColors.textPrimary,
    marginBottom: 8,
  },
  acceptedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  acceptedItem: {
    backgroundColor: MagicColors.donateRose + '15',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: MagicColors.donateRose + '30',
  },
  acceptedItemText: {
    fontSize: 12,
    color: MagicColors.textPrimary,
  },
  selectedActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  rewardPreview: {
    backgroundColor: MagicColors.gold + '10',
    borderRadius: 12,
    padding: 12,
  },
  rewardText: {
    fontSize: 13,
    color: MagicColors.textSecondary,
    lineHeight: 18,
  },

  // Section
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MagicColors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: MagicColors.textSecondary,
    marginTop: 2,
  },

  // Site Cards
  siteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MagicColors.offWhiteSolid,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: MagicColors.donateRose + '30',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  siteCardSelected: {
    borderColor: MagicColors.donateRose,
    backgroundColor: MagicColors.donateRose + '15',
    borderWidth: 2,
  },
  siteIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: MagicColors.donateRose + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  siteContent: {
    flex: 1,
  },
  siteName: {
    fontSize: 15,
    fontWeight: '600',
    color: MagicColors.textPrimary,
  },
  siteType: {
    fontSize: 12,
    color: MagicColors.donateRose,
    fontWeight: '600',
    marginTop: 1,
  },
  siteAddress: {
    fontSize: 12,
    color: MagicColors.textSecondary,
    marginTop: 2,
  },
  distanceBadge: {
    alignItems: 'center',
    backgroundColor: MagicColors.donateRose + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MagicColors.donateRose + '30',
  },
  distanceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: MagicColors.donateRose,
  },
  distanceUnit: {
    fontSize: 10,
    color: MagicColors.donateRose,
    opacity: 0.7,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: MagicColors.offWhiteSolid,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: MagicColors.borderLight,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MagicColors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: MagicColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: MagicColors.offWhiteSolid,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: MagicColors.borderLight,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 15,
    color: MagicColors.textSecondary,
    marginTop: 12,
    fontFamily: Fonts.body,
  },

  // Demo banner
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 8,
    backgroundColor: MagicColors.gold + '15',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MagicColors.borderAmber,
  },
  demoBannerText: {
    flex: 1,
    fontSize: 12,
    color: MagicColors.goldDark,
    lineHeight: 17,
    fontFamily: Fonts.body,
  },

  // Section title row
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Info card
  infoCard: {
    backgroundColor: MagicColors.emeraldDeep + '25',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: MagicColors.emeraldDark + '30',
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: MagicColors.emerald,
  },
  infoText: {
    fontSize: 13,
    color: MagicColors.textSecondary,
    lineHeight: 19,
  },
});
