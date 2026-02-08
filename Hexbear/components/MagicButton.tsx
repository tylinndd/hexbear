import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MagicColors } from '@/constants/theme';

interface MagicButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function MagicButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  disabled = false,
  loading = false,
  style,
  textStyle,
}: MagicButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
        };
      case 'outline':
        return {
          container: styles.outlineContainer,
          text: styles.outlineText,
        };
      case 'danger':
        return {
          container: styles.dangerContainer,
          text: styles.dangerText,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { container: styles.smallContainer, text: styles.smallText };
      case 'medium':
        return { container: styles.mediumContainer, text: styles.mediumText };
      case 'large':
        return { container: styles.largeContainer, text: styles.largeText };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          styles.base,
          variantStyles.container,
          sizeStyles.container,
          disabled && styles.disabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={
              variant === 'outline'
                ? MagicColors.gold
                : MagicColors.darkBg
            }
          />
        ) : (
          <Text
            style={[
              styles.baseText,
              variantStyles.text,
              sizeStyles.text,
              textStyle,
            ]}
          >
            {icon ? `${icon}  ${title}` : title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: `0px 2px 8px rgba(241, 196, 15, 0.2)`,
      },
      default: {
        shadowColor: MagicColors.gold,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  baseText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },

  // Variants
  primaryContainer: {
    backgroundColor: MagicColors.gold,
  },
  primaryText: {
    color: MagicColors.darkBg,
  },
  secondaryContainer: {
    backgroundColor: MagicColors.emeraldDark,
  },
  secondaryText: {
    color: MagicColors.textPrimary,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: MagicColors.gold,
  },
  outlineText: {
    color: MagicColors.gold,
  },
  dangerContainer: {
    backgroundColor: MagicColors.error,
  },
  dangerText: {
    color: '#fff',
  },

  // Sizes
  smallContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  smallText: {
    fontSize: 13,
  },
  mediumContainer: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeContainer: {
    paddingHorizontal: 32,
    paddingVertical: 18,
  },
  largeText: {
    fontSize: 18,
  },
});
