import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import * as Location from 'expo-location';
import { MagicColors } from '@/constants/theme';
import { MagicButton } from '@/components/MagicButton';
import { SuccessModal } from '@/components/SuccessModal';
import { useAuth } from '@/contexts/AuthContext';
import {
  DEMO_DONATION_SITES,
  DonationSite,
  getSiteTypeLabel,
  getSiteTypeIcon,
  FOOD_WASTE_STATS,
} from '@/constants/donation-sites';

export default function DonateScreen() {
  const [sites, setSites] = useState<DonationSite[]>(DEMO_DONATION_SITES);
  const [selectedSite, setSelectedSite] = useState<DonationSite | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
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
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Sort sites by distance from user
      const sorted = [...DEMO_DONATION_SITES].map((site) => ({
        ...site,
        distance: calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          site.latitude,
          site.longitude
        ),
      }));
      sorted.sort(
        (a, b) =>
          parseFloat(a.distance || '999') - parseFloat(b.distance || '999')
      );
      setSites(sorted);
    } catch (err) {
      console.log('Location error:', err);
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
    const url = Platform.select({
      ios: `maps://app?daddr=${site.latitude},${site.longitude}`,
      android: `google.navigation:q=${site.latitude},${site.longitude}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${site.latitude},${site.longitude}`,
    });

    if (url) {
      Linking.openURL(url).catch(() => {
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
          <Text style={styles.spellIcon}>{'🍞'}</Text>
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
              <Text style={styles.selectedIcon}>
                {getSiteTypeIcon(selectedSite.type)}
              </Text>
              <View style={styles.selectedInfo}>
                <Text style={styles.selectedName}>{selectedSite.name}</Text>
                <Text style={styles.selectedType}>
                  {getSiteTypeLabel(selectedSite.type)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedSite(null)}>
                <Text style={styles.closeButton}>{'✕'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.selectedAddress}>
              {'📍'} {selectedSite.address}
            </Text>
            <Text style={styles.selectedHours}>
              {'🕐'} {selectedSite.hours}
            </Text>
            {selectedSite.phone && (
              <Text style={styles.selectedPhone}>
                {'📞'} {selectedSite.phone}
              </Text>
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
                icon="🗺️"
                variant="outline"
                onPress={() => openDirections(selectedSite)}
                size="medium"
                style={{ flex: 1, marginRight: 8 }}
              />
              <MagicButton
                title="Donated!"
                icon="✨"
                onPress={confirmDonation}
                size="medium"
                style={{ flex: 1 }}
              />
            </View>

            <View style={styles.rewardPreview}>
              <Text style={styles.rewardText}>
                {'🌟'} Completing this spell awards{' '}
                <Text style={{ color: MagicColors.gold, fontWeight: '800' }}>
                  +{FOOD_WASTE_STATS.pointsPerDonation} GHG points
                </Text>{' '}
                and saves ~{FOOD_WASTE_STATS.co2PerDonation} kg CO₂!
              </Text>
            </View>
          </View>
        )}

        {/* Nearby Sites List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {'🗺️'}  Nearby Portals
          </Text>
          <Text style={styles.sectionSubtitle}>
            Select a donation site to begin the spell
          </Text>
        </View>

        {sites.map((site) => (
          <TouchableOpacity
            key={site.id}
            style={[
              styles.siteCard,
              selectedSite?.id === site.id && styles.siteCardSelected,
            ]}
            onPress={() => setSelectedSite(site)}
            activeOpacity={0.85}
          >
            <Text style={styles.siteIcon}>
              {getSiteTypeIcon(site.type)}
            </Text>
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

        {/* No sites fallback */}
        {sites.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>{'🌀'}</Text>
            <Text style={styles.emptyTitle}>No Portals Found</Text>
            <Text style={styles.emptyText}>
              No nearby donation sites found. But fear not! You can directly
              call local shelters or share food with a neighbor in need.
            </Text>
          </View>
        )}

        {/* Food waste info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            {'🌍'}  Why Food Rescue Matters
          </Text>
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
        funFact="Uneaten food in landfills accounts for 8% of global emissions. Thank you for being part of the solution!"
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
    backgroundColor: MagicColors.darkBg,
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
  spellIcon: {
    fontSize: 56,
    marginBottom: 8,
  },
  spellTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: MagicColors.textPrimary,
  },
  spellSubtitle: {
    fontSize: 14,
    color: MagicColors.donateRose,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  spellDescription: {
    fontSize: 14,
    color: MagicColors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },

  // Impact Banner
  impactBanner: {
    flexDirection: 'row',
    backgroundColor: MagicColors.donateRose + '15',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: MagicColors.donateRose + '25',
  },
  impactStat: {
    flex: 1,
    alignItems: 'center',
  },
  impactStatValue: {
    fontSize: 28,
    fontWeight: '800',
    color: MagicColors.donateRose,
  },
  impactStatLabel: {
    fontSize: 11,
    color: MagicColors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 15,
  },
  impactDivider: {
    width: 1,
    backgroundColor: MagicColors.donateRose + '30',
    marginHorizontal: 12,
  },

  // Selected Site
  selectedCard: {
    backgroundColor: MagicColors.darkCard,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: MagicColors.donateRose + '50',
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedIcon: {
    fontSize: 36,
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
    backgroundColor: MagicColors.darkElevated,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  acceptedItemText: {
    fontSize: 12,
    color: MagicColors.textSecondary,
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
    backgroundColor: MagicColors.darkCard,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: MagicColors.border,
  },
  siteCardSelected: {
    borderColor: MagicColors.donateRose + '60',
    backgroundColor: MagicColors.donateRose + '08',
  },
  siteIcon: {
    fontSize: 32,
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
    backgroundColor: MagicColors.darkElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  distanceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: MagicColors.textPrimary,
  },
  distanceUnit: {
    fontSize: 10,
    color: MagicColors.textSecondary,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: MagicColors.darkCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: MagicColors.border,
  },
  emptyIcon: {
    fontSize: 48,
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

  // Info card
  infoCard: {
    backgroundColor: MagicColors.emeraldDeep + '25',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: MagicColors.emeraldDark + '30',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: MagicColors.emerald,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: MagicColors.textSecondary,
    lineHeight: 19,
  },
});
