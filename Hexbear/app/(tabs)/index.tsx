import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MagicColors } from '@/constants/theme';
import { SpellCard } from '@/components/SpellCard';
import { PointsDisplay } from '@/components/PointsDisplay';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuth();

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
                Your Grimoire of Eco-Spells
              </Text>
            </View>
            <Text style={styles.headerIcon}>{'🐻'}</Text>
          </View>
        </View>

        {/* Points Display */}
        <PointsDisplay totalPoints={profile?.total_points || 0} />

        {/* Mission Banner */}
        <View style={styles.missionBanner}>
          <Text style={styles.missionIcon}>{'🐉'}</Text>
          <View style={styles.missionText}>
            <Text style={styles.missionTitle}>Daily Quest</Text>
            <Text style={styles.missionDescription}>
              Cast spells to save the community from the Climate Dragon!
            </Text>
          </View>
        </View>

        {/* Spells Section */}
        <View style={styles.spellsHeader}>
          <Text style={styles.sectionTitle}>{'📜'}  Available Spells</Text>
          <Text style={styles.sectionSubtitle}>
            Tap a spell to cast it and earn GHG points
          </Text>
        </View>

        <SpellCard
          title="Recyclify Reveal"
          subtitle="Recycling Identification Spell"
          description="Scan items with your camera to discover their recyclability and earn points."
          icon="♻️"
          color={MagicColors.recycleGreen}
          onPress={() => router.push('/(tabs)/recycle')}
          delay={100}
        />

        <SpellCard
          title="WattSaver Charm"
          subtitle="Energy Conservation Spell"
          description="Track your energy usage and earn points by reducing consumption."
          icon="⚡"
          color={MagicColors.energyYellow}
          onPress={() => router.push('/(tabs)/energy')}
          delay={200}
        />

        <SpellCard
          title="Food Rescue Portal"
          subtitle="Community Food Sharing Spell"
          description="Find nearby donation sites and rescue food from going to waste."
          icon="🍞"
          color={MagicColors.donateRose}
          onPress={() => router.push('/(tabs)/donate')}
          delay={300}
        />

        {/* Impact Stats */}
        <View style={styles.impactSection}>
          <Text style={styles.sectionTitle}>{'🌍'}  Your Impact</Text>
          <View style={styles.impactGrid}>
            <View style={styles.impactCard}>
              <Text style={styles.impactValue}>
                {((profile?.total_points || 0) * 0.1).toFixed(1)}
              </Text>
              <Text style={styles.impactLabel}>kg CO₂ Saved</Text>
            </View>
            <View style={styles.impactCard}>
              <Text style={styles.impactValue}>
                {Math.floor((profile?.total_points || 0) / 5)}
              </Text>
              <Text style={styles.impactLabel}>Spells Cast</Text>
            </View>
            <View style={styles.impactCard}>
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
            {'"Every spell you cast brings us closer to a world where nature thrives. Keep casting, Eco-Wizard!"'}
          </Text>
          <Text style={styles.quoteAuthor}>— The Grand EcoMage</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MagicColors.darkBg,
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
  greeting: {
    fontSize: 16,
    color: MagicColors.textSecondary,
  },
  wizardName: {
    color: MagicColors.gold,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 26,
    fontWeight: '800',
    color: MagicColors.textPrimary,
    marginTop: 4,
  },
  headerIcon: {
    fontSize: 40,
  },

  // Mission Banner
  missionBanner: {
    flexDirection: 'row',
    backgroundColor: MagicColors.emeraldDeep + '40',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: MagicColors.emeraldDark + '50',
    alignItems: 'center',
  },
  missionIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  missionText: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: MagicColors.emerald,
  },
  missionDescription: {
    fontSize: 13,
    color: MagicColors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },

  // Spells Section
  spellsHeader: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MagicColors.textPrimary,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: MagicColors.textSecondary,
    marginTop: 4,
  },

  // Impact Stats
  impactSection: {
    marginTop: 8,
  },
  impactGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 12,
    gap: 10,
  },
  impactCard: {
    flex: 1,
    backgroundColor: MagicColors.darkCard,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: MagicColors.border,
  },
  impactValue: {
    fontSize: 24,
    fontWeight: '800',
    color: MagicColors.emerald,
  },
  impactLabel: {
    fontSize: 11,
    color: MagicColors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },

  // Quote
  quoteBox: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: MagicColors.darkCard,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 3,
    borderLeftColor: MagicColors.gold,
  },
  quoteText: {
    fontSize: 14,
    color: MagicColors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 21,
  },
  quoteAuthor: {
    fontSize: 12,
    color: MagicColors.goldDark,
    marginTop: 8,
    fontWeight: '600',
  },
});
