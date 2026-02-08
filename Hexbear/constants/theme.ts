/**
 * Hexbear Magical Theme
 * Fantasy magic-inspired theme with parchment backgrounds and mystical accents.
 */

import { Platform } from 'react-native';

// Magical color palette - Fantasy & Eco-conscious (VIBRANT UPDATE)
export const MagicColors = {
  // Primary Colors - Deep Emerald Green (Nature, ecology, primary actions) - VIBRANT
  emerald: '#10B981',
  emeraldDark: '#047857',
  emeraldDeep: '#059669',
  emeraldLight: '#34D399',
  emeraldVibrant: '#0D9F6E', // For bright green spell cards

  // Magical Purple/Violet (Mysticism, user stats, progression) - VIBRANT
  purple: '#8B5CF6',           // Bright purple for headers
  purpleDark: '#6D28D9',       // Darker purple
  purpleLight: '#A78BFA',
  purpleGlow: 'rgba(139, 92, 246, 0.3)',
  purpleVibrant: '#7C3AED',    // Main purple for spell cards

  // Rich Gold/Amber (Rewards, achievements, points) - VIBRANT
  gold: '#FBBF24',             // Bright gold/amber
  goldDark: '#D97706',
  goldLight: '#FCD34D',
  goldAmber: '#F59E0B',        // Orange-amber for spell cards
  goldVibrant: '#F59E0B',      // Bright orange

  // Background Colors - Parchment/Cream Base
  parchment: '#FAF8F3',
  parchmentDark: '#F5F5DC',
  cream: '#FFF8E7',
  offWhite: 'rgba(255, 255, 255, 0.7)',
  offWhiteSolid: '#FFFFFF',
  darkSurface: '#0D5B4B',      // Dark teal/green for tab bar

  // Text Colors
  textPrimary: '#2D2D2D',      // Charcoal on light backgrounds
  textSecondary: '#4A4A4A',    // Lighter charcoal
  textMuted: '#6B7280',
  textLight: '#FFFFFF',        // White on dark backgrounds

  // Supporting Colors
  crimson: '#FF5252',          // Errors, warnings
  successGreen: '#10B981',     // Success confirmations
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#FF5252',
  info: '#8B5CF6',

  // Spell-specific vibrant colors (for spell cards)
  recycleGreen: '#0D9F6E',     // Bright green
  energyYellow: '#7C3AED',     // Purple for energy (from your screenshot)
  donateOrange: '#D97706',     // Orange-brown for donate
  donateRose: '#EC4899',
  profilePurple: '#8B5CF6',

  // Card backgrounds - VIBRANT
  cardPurple: '#7C3AED',       // Vibrant purple card background
  cardGreen: '#059669',        // Vibrant green card background  
  cardOrange: '#D97706',       // Vibrant orange card background
  cardAmber: '#F59E0B',        // Vibrant amber card background

  // Borders & Accents
  borderEmerald: '#34D399',
  borderPurple: '#A78BFA',
  borderAmber: '#FCD34D',
  borderLight: '#E5E7EB',
  border: '#0D5B4B',           // Dark teal border for tab bar

  // Dark backgrounds for cards (when needed)
  darkCard: '#1F2937',
  darkElevated: '#374151',
  darkBg: '#111827',
  separator: '#374151',

  // Gradients (use these as base colors for LinearGradient)
  gradientEmeraldStart: '#059669',
  gradientEmeraldEnd: '#047857',
  gradientPurpleStart: '#8B5CF6',
  gradientPurpleEnd: '#6D28D9',
  gradientGoldStart: '#FBBF24',
  gradientGoldEnd: '#F59E0B',

  // Overlays & Shadows
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadowLight: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.25)',    // Stronger shadows
  shadowStrong: 'rgba(0, 0, 0, 0.4)',     // Very strong shadows
  glowGold: 'rgba(251, 191, 36, 0.3)',
};

export const Colors = {
  light: {
    text: MagicColors.textPrimary,
    background: MagicColors.parchment,
    tint: MagicColors.emeraldDeep,
    icon: MagicColors.textSecondary,
    tabIconDefault: MagicColors.textMuted,
    tabIconSelected: MagicColors.emeraldDeep,
  },
  dark: {
    text: MagicColors.textPrimary,
    background: MagicColors.parchment,
    tint: MagicColors.emeraldDeep,
    icon: MagicColors.textSecondary,
    tabIconDefault: MagicColors.textMuted,
    tabIconSelected: MagicColors.emeraldDeep,
  },
};

// Typography System - Fantasy Magic Theme
// Using system fonts that work across all platforms
export const Fonts = Platform.select({
  ios: {
    // All fonts: Elegant serif
    heading: 'Georgia',
    body: 'Georgia',
    mono: 'Georgia',
  },
  android: {
    // All fonts: Elegant serif
    heading: 'serif',
    body: 'serif',
    mono: 'serif',
  },
  default: {
    heading: 'serif',
    body: 'serif',
    mono: 'serif',
  },
  web: {
    // All fonts: Elegant serif with fallbacks
    heading: "'Playfair Display', 'EB Garamond', 'Cinzel', Georgia, serif",
    body: "'Playfair Display', 'EB Garamond', Georgia, serif",
    mono: "'Playfair Display', Georgia, serif",
  },
});

// Typography Sizes (matching design guide)
export const FontSizes = {
  appTitle: 36,      // text-4xl
  pageTitle: 30,     // text-3xl
  sectionHeader: 20, // text-xl
  cardTitle: 18,     // text-lg
  body: 14,          // text-sm
  caption: 12,       // text-xs
};

// Font Weights
export const FontWeights = {
  regular: '400' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// Magical Border & Shadow Styles
export const MagicStyles = {
  // Border treatments
  emeraldBorder: {
    borderWidth: 2,
    borderColor: MagicColors.borderEmerald,
  },
  purpleBorder: {
    borderWidth: 2,
    borderColor: MagicColors.borderPurple,
  },
  goldBorder: {
    borderWidth: 2,
    borderColor: MagicColors.borderAmber,
  },
  // Card shadows
  cardShadow: Platform.select({
    ios: {
      shadowColor: MagicColors.shadowMedium,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    web: {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    },
  }),
  // Magical glow effect
  magicGlow: Platform.select({
    ios: {
      shadowColor: MagicColors.gold,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    },
    android: {
      elevation: 8,
    },
    web: {
      boxShadow: '0 0 12px rgba(255, 215, 0, 0.3)',
    },
  }),
};
