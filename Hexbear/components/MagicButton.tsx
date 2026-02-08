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
  View,
} from 'react-native';
import { MagicColors, Fonts, FontWeights } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface MagicButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'emerald' | 'purple';
  size?: 'small' | 'medium' | 'large';
  icon?: string; // For backward compatibility with emojis (will be phased out)
  iconName?: keyof typeof Ionicons.glyphMap; // Expo icon name
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
  iconName,
  disabled = false,
  loading = false,
  style,
  textStyle,
}: MagicButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
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

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
          iconColor: MagicColors.textPrimary,
        };
      case 'emerald':
        return {
          container: styles.emeraldContainer,
          text: styles.emeraldText,
          iconColor: MagicColors.textLight,
        };
      case 'purple':
        return {
          container: styles.purpleContainer,
          text: styles.purpleText,
          iconColor: MagicColors.textLight,
        };
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
          iconColor: MagicColors.textLight,
        };
      case 'outline':
        return {
          container: styles.outlineContainer,
          text: styles.outlineText,
          iconColor: MagicColors.emeraldDeep,
        };
      case 'danger':
        return {
          container: styles.dangerContainer,
          text: styles.dangerText,
          iconColor: MagicColors.textLight,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { 
          container: styles.smallContainer, 
          text: styles.smallText,
          iconSize: 16 as const,
        };
      case 'medium':
        return { 
          container: styles.mediumContainer, 
          text: styles.mediumText,
          iconSize: 20 as const,
        };
      case 'large':
        return { 
          container: styles.largeContainer, 
          text: styles.largeText,
          iconSize: 24 as const,
        };
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
        activeOpacity={0.85}
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
                ? MagicColors.emeraldDeep
                : MagicColors.textLight
            }
          />
        ) : (
          <View style={styles.contentRow}>
            {iconName && (
              <Ionicons
                name={iconName}
                size={sizeStyles.iconSize}
                color={variantStyles.iconColor}
                style={styles.iconSpacing}
              />
            )}
            <Text
              style={[
                styles.baseText,
                variantStyles.text,
                sizeStyles.text,
                textStyle,
              ]}
            >
              {icon ? `${icon} ${title}` : title}
            </Text>
          </View>
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
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
      },
    }),
  },
  baseText: {
    fontWeight: FontWeights.bold,
    textAlign: 'center',
    fontFamily: Fonts.body,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSpacing: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.5,
  },

  // Variants - Following design guide colors
  primaryContainer: {
    backgroundColor: MagicColors.gold,
    borderWidth: 2,
    borderColor: MagicColors.goldDark,
  },
  primaryText: {
    color: MagicColors.textPrimary,
  },
  emeraldContainer: {
    backgroundColor: MagicColors.emeraldDeep,
    borderWidth: 2,
    borderColor: MagicColors.borderEmerald,
  },
  emeraldText: {
    color: MagicColors.textLight,
  },
  purpleContainer: {
    backgroundColor: MagicColors.purple,
    borderWidth: 2,
    borderColor: MagicColors.borderPurple,
  },
  purpleText: {
    color: MagicColors.textLight,
  },
  secondaryContainer: {
    backgroundColor: MagicColors.emeraldDark,
    borderWidth: 2,
    borderColor: MagicColors.emerald,
  },
  secondaryText: {
    color: MagicColors.textLight,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: MagicColors.emeraldDeep,
  },
  outlineText: {
    color: MagicColors.emeraldDeep,
  },
  dangerContainer: {
    backgroundColor: MagicColors.crimson,
    borderWidth: 2,
    borderColor: '#CC0000',
  },
  dangerText: {
    color: MagicColors.textLight,
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
