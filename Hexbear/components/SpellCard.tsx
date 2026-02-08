import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { MagicColors } from '@/constants/theme';

interface SpellCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  onPress: () => void;
  delay?: number;
}

export function SpellCard({
  title,
  subtitle,
  description,
  icon,
  color,
  onPress,
  delay = 0,
}: SpellCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={styles.touchable}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.subtitle, { color }]}>{subtitle}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        </View>
        <View style={styles.arrow}>
          <Text style={[styles.arrowText, { color }]}>{'>'}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MagicColors.darkCard,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: MagicColors.border,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: MagicColors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 13,
    color: MagicColors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  arrow: {
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 20,
    fontWeight: '700',
  },
});
