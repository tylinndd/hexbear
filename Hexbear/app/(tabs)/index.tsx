import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MagicColors, Fonts, FontWeights, FontSizes } from '@/constants/theme';
import { SpellCard } from '@/components/SpellCard';
import { PointsDisplay } from '@/components/PointsDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LottieAnimation } from '@/components/LottieAnimation';
import { HOME_QUOTES, getRandomItem } from '@/constants/eco-facts';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const randomQuote = useMemo(() => getRandomItem(HOME_QUOTES), []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>
                Welcome back,{' '}
                <Text style={styles.wizardName}>
                  {profile?.wizard_name || 'Apprentice'}
                </Text>
              </Text>
              <Text style={styles.headerSubtitle}>
                Your Grimoire of Spells
              </Text>
            </View>
            <View style={styles.rabbitAnimation}>
              <LottieAnimation
                source={require('@/assets/animations/magic-rabbit.json')}
                loop={true}
                autoPlay={true}
                style={styles.rabbitLottie}
              />
            </View>
          </View>
        </View>

        {/* Points Display */}
        <PointsDisplay totalPoints={profile?.total_points || 0} />

        {/* Mission Banner */}
        <View style={styles.missionBanner}>
          <View style={styles.missionIconContainer}>
            <Ionicons name="flame" size={32} color={MagicColors.textLight} />
          </View>
          <View style={styles.missionText}>
            <Text style={styles.missionTitle}>Daily Quest Active!</Text>
            <Text style={styles.missionDescription}>
              Cast 3 spells today to earn a bonus 100 GHG points
            </Text>
          </View>
        </View>

        {/* Spells Section */}
        <View style={styles.spellsHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="book" size={24} color={MagicColors.textPrimary} />
            <Text style={styles.sectionTitle}>Available Spells</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Tap a spell to cast it and earn GHG points
          </Text>
        </View>

        <SpellCard
          title="Recyclify Reveal"
          subtitle="Recycling Identification Spell"
          description="Scan items with your camera to discover their recyclability and earn points."
          iconName="leaf"
          color={MagicColors.recycleGreen}
          onPress={() => router.push('/(tabs)/recycle')}
          delay={100}
        />

        <SpellCard
          title="WattSaver Charm"
          subtitle="Energy Conservation Spell"
          description="Track your energy usage and earn points by reducing consumption."
          iconName="flash"
          color={MagicColors.energyYellow}
          onPress={() => router.push('/(tabs)/energy')}
          delay={200}
        />

        <SpellCard
          title="Food Rescue Portal"
          subtitle="Community Food Sharing Spell"
          description="Find nearby donation sites and rescue food from going to waste."
          iconName="heart"
          color={MagicColors.donateRose}
          onPress={() => router.push('/(tabs)/donate')}
          delay={300}
        />

        {/* Impact Stats */}
        <View style={styles.impactSection}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="earth" size={24} color={MagicColors.textPrimary} />
            <Text style={styles.sectionTitle}>Your Impact</Text>
          </View>
          <View style={styles.impactGrid}>
            <View style={[styles.impactCard, styles.impactCardEmerald]}>
              <Ionicons name="leaf-outline" size={24} color={MagicColors.emeraldDeep} style={styles.impactIcon} />
              <Text style={styles.impactValue}>
                {((profile?.total_points || 0) * 0.1).toFixed(1)}
              </Text>
              <Text style={styles.impactLabel}>kg CO₂ Saved</Text>
            </View>
            <View style={[styles.impactCard, styles.impactCardPurple]}>
              <Ionicons name="sparkles-outline" size={24} color={MagicColors.purple} style={styles.impactIcon} />
              <Text style={styles.impactValue}>
                {Math.floor((profile?.total_points || 0) / 5)}
              </Text>
              <Text style={styles.impactLabel}>Spells Cast</Text>
            </View>
            <View style={[styles.impactCard, styles.impactCardGold]}>
              <Ionicons name="trophy-outline" size={24} color={MagicColors.goldDark} style={styles.impactIcon} />
              <Text style={styles.impactValue}>
                {profile?.level || 1}
              </Text>
              <Text style={styles.impactLabel}>Wizard Level</Text>
            </View>
          </View>
        </View>

        {/* Bottom Quote */}
        <View style={styles.quoteBox}>
          <Text style={styles.quoteText}>
            "{randomQuote.text}"
          </Text>
          <Text style={styles.quoteAuthor}>— {randomQuote.author}</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MagicColors.parchment,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rabbitAnimation: {
    width: 80,
    height: 80,
  },
  rabbitLottie: {
    width: 80,
    height: 80,
  },
  greeting: {
    fontSize: 16,
    color: MagicColors.textSecondary,
    fontFamily: Fonts.body,
  },
  wizardName: {
    color: MagicColors.emeraldDeep,
    fontWeight: FontWeights.bold,
  },
  headerSubtitle: {
    fontSize: 26,
    fontWeight: FontWeights.extrabold,
    color: MagicColors.textPrimary,
    marginTop: 4,
    fontFamily: Fonts.heading,
  },

  // Mission Banner
  missionBanner: {
    flexDirection: 'row',
    backgroundColor: MagicColors.goldAmber,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
    borderWidth: 0,
    alignItems: 'center',
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
  missionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  missionText: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 17,
    fontWeight: FontWeights.bold,
    color: MagicColors.textLight,
    fontFamily: Fonts.heading,
  },
  missionDescription: {
    fontSize: 13,
    color: MagicColors.textLight,
    marginTop: 4,
    lineHeight: 18,
    fontFamily: Fonts.body,
    opacity: 0.9,
  },

  // Spells Section
  spellsHeader: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: FontSizes.sectionHeader,
    fontWeight: FontWeights.bold,
    color: MagicColors.textPrimary,
    fontFamily: Fonts.heading,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: MagicColors.textSecondary,
    marginTop: 4,
    fontFamily: Fonts.body,
  },

  // Impact Stats
  impactSection: {
    marginTop: 8,
    paddingHorizontal: 24,
  },
  impactGrid: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },
  impactCard: {
    flex: 1,
    backgroundColor: MagicColors.offWhiteSolid,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
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
  impactCardEmerald: {
    borderColor: MagicColors.borderEmerald,
  },
  impactCardPurple: {
    borderColor: MagicColors.borderPurple,
  },
  impactCardGold: {
    borderColor: MagicColors.borderAmber,
  },
  impactIcon: {
    marginBottom: 8,
  },
  impactValue: {
    fontSize: 24,
    fontWeight: FontWeights.extrabold,
    color: MagicColors.textPrimary,
    fontFamily: Fonts.mono,
  },
  impactLabel: {
    fontSize: 11,
    color: MagicColors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    fontFamily: Fonts.body,
  },

  // Quote
  quoteBox: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: MagicColors.cream,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: MagicColors.gold,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 1,
      },
    }),
  },
  quoteText: {
    fontSize: 14,
    color: MagicColors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 21,
    fontFamily: Fonts.body,
  },
  quoteAuthor: {
    fontSize: 12,
    color: MagicColors.goldDark,
    marginTop: 8,
    fontWeight: FontWeights.semibold,
    fontFamily: Fonts.heading,
  },
});
