import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { MagicColors, Fonts, FontWeights, FontSizes } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface SpellCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon?: string; // Legacy emoji support
  iconName?: keyof typeof Ionicons.glyphMap; // Expo icon name
  color: string;
  onPress: () => void;
  delay?: number;
}

export function SpellCard({
  title,
  subtitle,
  description,
  icon,
  iconName,
  color,
  onPress,
  delay = 0,
}: SpellCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, fadeAnim, slideAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  // Determine border color based on spell color
  const getBorderColor = () => {
    if (color === MagicColors.recycleGreen || color === MagicColors.emerald) {
      return MagicColors.borderEmerald;
    } else if (color === MagicColors.energyYellow || color === MagicColors.gold) {
      return MagicColors.borderAmber;
    } else if (color === MagicColors.profilePurple || color === MagicColors.purple) {
      return MagicColors.borderPurple;
    }
    return MagicColors.borderEmerald;
  };

  // Determine vibrant background color for card
  const getCardBackgroundColor = () => {
    if (color === MagicColors.recycleGreen || color === MagicColors.recycleGreen) {
      return MagicColors.cardGreen;
    } else if (color === MagicColors.energyYellow) {
      return MagicColors.cardPurple;
    } else if (color === MagicColors.donateRose) {
      return MagicColors.cardOrange;
    } else if (color === MagicColors.profilePurple || color === MagicColors.purple) {
      return MagicColors.cardPurple;
    }
    return MagicColors.cardGreen;
  };

  // Determine icon background color (lighter version)
  const getIconBackgroundColor = () => {
    return 'rgba(255, 255, 255, 0.2)';
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.touchable,
          {
            backgroundColor: getCardBackgroundColor(),
          },
        ]}
      >
        <View style={styles.cardContent}>
          <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor() }]}>
            {iconName ? (
              <Ionicons name={iconName} size={36} color={MagicColors.textLight} />
            ) : icon ? (
              <Text style={styles.icon}>{icon}</Text>
            ) : null}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={[styles.subtitle, { color: MagicColors.textLight }]}>{subtitle}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          </View>
          <View style={styles.arrow}>
            <Ionicons name="chevron-forward" size={24} color={MagicColors.textLight} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 8,
  },
  touchable: {
    borderRadius: 20,
    borderWidth: 0,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.3)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  icon: {
    fontSize: 32,
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: FontWeights.bold,
    color: MagicColors.textLight,
    fontFamily: Fonts.heading,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: FontWeights.semibold,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: Fonts.body,
    opacity: 0.9,
  },
  description: {
    fontSize: FontSizes.body,
    color: MagicColors.textLight,
    marginTop: 6,
    lineHeight: 20,
    fontFamily: Fonts.body,
    opacity: 0.85,
  },
  arrow: {
    marginLeft: 8,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 12,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: FontWeights.bold,
    color: MagicColors.goldVibrant,
    marginLeft: 6,
    fontFamily: Fonts.mono,
  },
});
