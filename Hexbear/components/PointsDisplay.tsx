import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MagicColors } from '@/constants/theme';
import {
  getWizardLevel,
  getNextLevel,
  getLevelProgress,
} from '@/constants/levels';

interface PointsDisplayProps {
  totalPoints: number;
  compact?: boolean;
}

export function PointsDisplay({
  totalPoints,
  compact = false,
}: PointsDisplayProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const currentLevel = getWizardLevel(totalPoints);
  const nextLevel = getNextLevel(totalPoints);
  const progress = getLevelProgress(totalPoints);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [progress, progressAnim, glowAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactIcon}>{currentLevel.icon}</Text>
        <Text style={styles.compactPoints}>{totalPoints}</Text>
        <Text style={styles.compactLabel}>pts</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.levelHeader}>
        <Text style={styles.levelIcon}>{currentLevel.icon}</Text>
        <View style={styles.levelInfo}>
          <Text style={styles.levelTitle}>{currentLevel.title}</Text>
          <Text style={styles.levelNumber}>Level {currentLevel.level}</Text>
        </View>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsValue}>{totalPoints}</Text>
          <Text style={styles.pointsLabel}>GHG pts</Text>
        </View>
      </View>

      {nextLevel && (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progressWidth },
              ]}
            />
            <Animated.View
              style={[
                styles.progressGlow,
                { width: progressWidth, opacity: glowOpacity },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {totalPoints - currentLevel.minPoints} /{' '}
            {nextLevel.minPoints - currentLevel.minPoints} to{' '}
            {nextLevel.title}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: MagicColors.darkCard,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: MagicColors.border,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelIcon: {
    fontSize: 40,
  },
  levelInfo: {
    flex: 1,
    marginLeft: 12,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MagicColors.textPrimary,
  },
  levelNumber: {
    fontSize: 13,
    color: MagicColors.textSecondary,
    marginTop: 2,
  },
  pointsBadge: {
    backgroundColor: MagicColors.gold + '20',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  pointsValue: {
    fontSize: 22,
    fontWeight: '800',
    color: MagicColors.gold,
  },
  pointsLabel: {
    fontSize: 10,
    color: MagicColors.goldDark,
    fontWeight: '600',
    marginTop: 1,
  },
  progressSection: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: MagicColors.darkElevated,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: MagicColors.gold,
    borderRadius: 4,
  },
  progressGlow: {
    position: 'absolute',
    height: '100%',
    backgroundColor: MagicColors.goldLight,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: MagicColors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },

  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MagicColors.gold + '15',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  compactIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  compactPoints: {
    fontSize: 15,
    fontWeight: '800',
    color: MagicColors.gold,
  },
  compactLabel: {
    fontSize: 11,
    color: MagicColors.goldDark,
    marginLeft: 3,
  },
});
