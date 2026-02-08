import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Platform } from 'react-native';
import { MagicColors } from '@/constants/theme';

interface LogoMarkProps {
  size: 'large' | 'small';
}

/**
 * Reusable LogoMark component.
 * - size="large" (160-200px): Splash/Login screen only, with glow + fade-in animation
 * - size="small" (36px): Dashboard header only
 *
 * STRICT: Only used in 2 places: Login/Splash screen + Dashboard header.
 */
export function LogoMark({ size }: LogoMarkProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const dimension = size === 'large' ? 180 : 36;

  useEffect(() => {
    if (size === 'large') {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
    }
  }, [size, fadeAnim, scaleAnim]);

  return (
    <Animated.View
      style={[
        size === 'large' ? styles.largeContainer : styles.smallContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {size === 'large' && <View style={styles.glow} />}
      <Image
        source={require('@/assets/images/hexbear-logo.png')}
        style={{
          width: dimension,
          height: dimension,
        }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  largeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  smallContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: MagicColors.emerald,
    opacity: 0.12,
    ...Platform.select({
      web: {
        boxShadow: `0 0 60px 30px rgba(126, 217, 87, 0.15)`,
      },
      default: {
        shadowColor: MagicColors.emerald,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 40,
        elevation: 10,
      },
    }),
  },
});
