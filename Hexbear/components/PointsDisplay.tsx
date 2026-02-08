import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { MagicColors, Fonts, FontWeights, FontSizes } from '@/constants/theme';
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
    backgroundColor: MagicColors.offWhiteSolid,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    borderWidth: 2,
    borderColor: MagicColors.borderPurple,
    ...Platform.select({
      web: {
        boxShadow: '0px 0px 20px rgba(124, 77, 255, 0.15)',
      },
      default: {
        shadowColor: MagicColors.purple,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 5,
      },
    }),
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
    fontSize: FontSizes.cardTitle,
    fontWeight: FontWeights.bold,
    color: MagicColors.textPrimary,
    fontFamily: Fonts.heading,
  },
  levelNumber: {
    fontSize: 13,
    color: MagicColors.textSecondary,
    marginTop: 2,
    fontFamily: Fonts.body,
  },
  pointsBadge: {
    backgroundColor: MagicColors.gold + '20',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MagicColors.borderAmber,
  },
  pointsValue: {
    fontSize: 22,
    fontWeight: FontWeights.extrabold,
    color: MagicColors.gold,
    fontFamily: Fonts.mono,
  },
  pointsLabel: {
    fontSize: 10,
    color: MagicColors.goldDark,
    fontWeight: FontWeights.semibold,
    marginTop: 1,
    fontFamily: Fonts.body,
  },
  progressSection: {
    marginTop: 16,
  },
  progressBar: {
    height: 10,
    backgroundColor: MagicColors.parchmentDark,
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: MagicColors.borderLight,
  },
  progressFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: MagicColors.gold,
    borderRadius: 5,
  },
  progressGlow: {
    position: 'absolute',
    height: '100%',
    backgroundColor: MagicColors.goldLight,
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: MagicColors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: Fonts.body,
  },

  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MagicColors.gold + '15',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: MagicColors.borderAmber,
  },
  compactIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  compactPoints: {
    fontSize: 15,
    fontWeight: FontWeights.extrabold,
    color: MagicColors.gold,
    fontFamily: Fonts.mono,
  },
  compactLabel: {
    fontSize: 11,
    color: MagicColors.goldDark,
    marginLeft: 3,
    fontFamily: Fonts.body,
  },
});
