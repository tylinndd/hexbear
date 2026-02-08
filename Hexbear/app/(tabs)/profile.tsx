import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MagicColors } from '@/constants/theme';
import { MagicButton } from '@/components/MagicButton';
import { PointsDisplay } from '@/components/PointsDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { getWizardLevel, WIZARD_LEVELS } from '@/constants/levels';
import { supabase } from '@/lib/supabase';

interface LeaderboardEntry {
  wizard_name: string;
  total_points: number;
  level: number;
  title: string;
}

interface ActionLog {
  id: string;
  type: 'recycle' | 'energy' | 'donate';
  points_awarded: number;
  created_at: string;
  details: Record<string, unknown>;
}

export default function ProfileScreen() {
  const { profile, user, signOut } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [recentActions, setRecentActions] = useState<ActionLog[]>([]);

  useEffect(() => {
    fetchLeaderboard();
    fetchRecentActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('wizard_name, total_points, level, title')
        .order('total_points', { ascending: false })
        .limit(10);

      if (!error && data) {
        setLeaderboard(data as LeaderboardEntry[]);
      } else {
        // Use demo data
        setLeaderboard([
          {
            wizard_name: profile?.wizard_name || 'You',
            total_points: profile?.total_points || 0,
            level: profile?.level || 1,
            title: getWizardLevel(profile?.total_points || 0).title,
          },
          {
            wizard_name: 'GreenWizard42',
            total_points: 340,
            level: 4,
            title: 'Nature Warlock',
          },
          {
            wizard_name: 'EcoSorceress',
            total_points: 220,
            level: 3,
            title: 'Green Guardian',
          },
          {
            wizard_name: 'RecycleMage',
            total_points: 185,
            level: 3,
            title: 'Green Guardian',
          },
          {
            wizard_name: 'ClimateHero',
            total_points: 120,
            level: 2,
            title: 'Climate Conjurer',
          },
        ]);
      }
    } catch {
      // Use demo leaderboard
      setLeaderboard([
        {
          wizard_name: profile?.wizard_name || 'You',
          total_points: profile?.total_points || 0,
          level: profile?.level || 1,
          title: getWizardLevel(profile?.total_points || 0).title,
        },
      ]);
    }
  };

  const fetchRecentActions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('actions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setRecentActions(data as ActionLog[]);
      }
    } catch {
      // No recent actions to show
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Leave the Sanctum?',
      'Are you sure you want to log out?',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'recycle':
        return 'leaf';
      case 'energy':
        return 'flash';
      case 'donate':
        return 'heart';
      default:
        return 'sparkles';
    }
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'recycle':
        return 'Recyclify Reveal';
      case 'energy':
        return 'WattSaver Charm';
      case 'donate':
        return 'Food Rescue Portal';
      default:
        return 'Eco Spell';
    }
  };

  const currentLevel = getWizardLevel(profile?.total_points || 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color={MagicColors.gold} />
          </View>
          <Text style={styles.wizardName}>
            {profile?.wizard_name || 'Apprentice'}
          </Text>
          <Text style={styles.wizardTitle}>{currentLevel.title}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
        </View>

        {/* Points & Level */}
        <PointsDisplay totalPoints={profile?.total_points || 0} />

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {((profile?.total_points || 0) * 0.1).toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>kg CO₂ Saved</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Math.floor((profile?.total_points || 0) / 5)}
            </Text>
            <Text style={styles.statLabel}>Total Spells</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{currentLevel.level}</Text>
            <Text style={styles.statLabel}>Wizard Level</Text>
          </View>
        </View>

        {/* Leaderboard */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="trophy" size={24} color={MagicColors.textPrimary} style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Community Leaderboard</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Top EcoMages in the community
          </Text>
        </View>

        <View style={styles.leaderboardCard}>
          {leaderboard.map((entry, index) => {
            const entryLevel = getWizardLevel(entry.total_points);
            const isCurrentUser =
              entry.wizard_name === profile?.wizard_name;

            return (
              <View
                key={index}
                style={[
                  styles.leaderboardRow,
                  isCurrentUser && styles.leaderboardRowHighlight,
                  index < leaderboard.length - 1 && styles.leaderboardBorder,
                ]}
              >
                <View style={styles.rankBadge}>
                  {index < 3 ? (
                    <Ionicons 
                      name="medal" 
                      size={20} 
                      color={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'}
                    />
                  ) : (
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  )}
                </View>
                <Ionicons name="person-circle" size={24} color={MagicColors.textMuted} style={{ marginHorizontal: 8 }} />
                <View style={styles.leaderInfo}>
                  <Text
                    style={[
                      styles.leaderName,
                      isCurrentUser && styles.leaderNameHighlight,
                    ]}
                  >
                    {entry.wizard_name}
                    {isCurrentUser ? ' (You)' : ''}
                  </Text>
                  <Text style={styles.leaderTitle}>{entryLevel.title}</Text>
                </View>
                <Text style={styles.leaderPoints}>
                  {entry.total_points} pts
                </Text>
              </View>
            );
          })}
        </View>

        {/* Recent Actions */}
        {recentActions.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="list" size={24} color={MagicColors.textPrimary} style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Spell History</Text>
              </View>
            </View>

            <View style={styles.actionsCard}>
              {recentActions.map((action, index) => (
                <View
                  key={action.id || index}
                  style={[
                    styles.actionRow,
                    index < recentActions.length - 1 && styles.actionBorder,
                  ]}
                >
                  <Ionicons 
                    name={getActionIcon(action.type) as any} 
                    size={24} 
                    color={MagicColors.emerald}
                    style={styles.actionIcon}
                  />
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionName}>
                      {getActionLabel(action.type)}
                    </Text>
                    <Text style={styles.actionDate}>
                      {new Date(action.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.actionPoints}>
                    +{action.points_awarded}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Level Progression */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="school" size={24} color={MagicColors.textPrimary} style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Wizard Ranks</Text>
          </View>
        </View>

        <View style={styles.ranksCard}>
          {WIZARD_LEVELS.map((level) => {
            const isUnlocked = (profile?.total_points || 0) >= level.minPoints;
            const isCurrent = currentLevel.level === level.level;

            return (
              <View
                key={level.level}
                style={[
                  styles.rankRow,
                  isCurrent && styles.rankRowCurrent,
                ]}
              >
                <View style={styles.rankIconContainer}>
                  <Ionicons
                    name={isUnlocked ? "star" : "lock-closed"}
                    size={24}
                    color={isUnlocked ? MagicColors.gold : MagicColors.textMuted}
                    style={styles.rankIcon}
                  />
                </View>
                <View style={styles.rankInfo}>
                  <Text
                    style={[
                      styles.rankTitle,
                      !isUnlocked && styles.rankTitleLocked,
                    ]}
                  >
                    Lvl {level.level}: {level.title}
                  </Text>
                  <Text style={styles.rankRequirement}>
                    {level.minPoints} points required
                  </Text>
                </View>
                {isUnlocked && (
                  <Ionicons name="checkmark-circle" size={20} color={MagicColors.successGreen} />
                )}
              </View>
            );
          })}
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <MagicButton
            title="Leave the Sanctum"
            iconName="log-out"
            variant="danger"
            onPress={handleLogout}
            size="medium"
            style={{ width: '100%' }}
          />
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
    padding: 20,
    paddingBottom: 40,
  },

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: MagicColors.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: MagicColors.gold + '40',
    marginBottom: 12,
  },
  wizardName: {
    fontSize: 24,
    fontWeight: '800',
    color: MagicColors.textPrimary,
  },
  wizardTitle: {
    fontSize: 14,
    color: MagicColors.gold,
    fontWeight: '600',
    marginTop: 4,
  },
  email: {
    fontSize: 13,
    color: MagicColors.textMuted,
    marginTop: 4,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: MagicColors.offWhiteSolid,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
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
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: MagicColors.emerald,
  },
  statLabel: {
    fontSize: 11,
    color: MagicColors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },

  // Section
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
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

  // Leaderboard
  leaderboardCard: {
    backgroundColor: MagicColors.offWhiteSolid,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: MagicColors.borderLight,
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
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  leaderboardRowHighlight: {
    backgroundColor: MagicColors.gold + '10',
  },
  leaderboardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: MagicColors.separator,
  },
  rankBadge: {
    width: 32,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: MagicColors.textSecondary,
  },
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    fontSize: 15,
    fontWeight: '600',
    color: MagicColors.textPrimary,
  },
  leaderNameHighlight: {
    color: MagicColors.gold,
  },
  leaderTitle: {
    fontSize: 12,
    color: MagicColors.textSecondary,
    marginTop: 1,
  },
  leaderPoints: {
    fontSize: 15,
    fontWeight: '700',
    color: MagicColors.emerald,
  },

  // Recent Actions
  actionsCard: {
    backgroundColor: MagicColors.offWhiteSolid,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: MagicColors.borderLight,
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  actionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: MagicColors.separator,
  },
  actionIcon: {
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionName: {
    fontSize: 14,
    fontWeight: '600',
    color: MagicColors.textPrimary,
  },
  actionDate: {
    fontSize: 12,
    color: MagicColors.textSecondary,
    marginTop: 2,
  },
  actionPoints: {
    fontSize: 15,
    fontWeight: '700',
    color: MagicColors.gold,
  },

  // Ranks
  ranksCard: {
    backgroundColor: MagicColors.offWhiteSolid,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: MagicColors.borderLight,
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
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: MagicColors.separator,
  },
  rankRowCurrent: {
    backgroundColor: MagicColors.gold + '10',
  },
  rankIconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  rankIcon: {
  },
  rankInfo: {
    flex: 1,
  },
  rankTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: MagicColors.textPrimary,
  },
  rankTitleLocked: {
    color: MagicColors.textMuted,
  },
  rankRequirement: {
    fontSize: 12,
    color: MagicColors.textSecondary,
    marginTop: 1,
  },

  // Logout
  logoutSection: {
    marginTop: 32,
  },
});
