/**
 * Hexbear Magical Theme
 * A dark, enchanted color palette with emerald greens and gold accents.
 */

import { Platform } from 'react-native';

// Magical color palette
export const MagicColors = {
  // Primary emerald greens
  emerald: '#2ecc71',
  emeraldDark: '#1a8a4a',
  emeraldDeep: '#145a32',

  // Gold accents
  gold: '#f1c40f',
  goldDark: '#c49b3c',
  goldLight: '#f9e547',

  // Mystic purples
  mystic: '#9b59b6',
  mysticDark: '#7d3c98',
  mysticLight: '#bb8fce',

  // Dark backgrounds
  darkBg: '#0d1117',
  darkSurface: '#161b22',
  darkCard: '#1c2333',
  darkElevated: '#242d3d',

  // Text
  textPrimary: '#e6edf3',
  textSecondary: '#8b949e',
  textMuted: '#6e7681',

  // Status
  success: '#2ecc71',
  warning: '#f39c12',
  error: '#e74c3c',
  info: '#3498db',

  // Spell-specific colors
  recycleGreen: '#27ae60',
  energyYellow: '#f1c40f',
  donateRose: '#e91e63',
  profilePurple: '#9b59b6',

  // Borders & Separators
  border: '#30363d',
  separator: '#21262d',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  shimmer: 'rgba(241, 196, 15, 0.15)',
};

export const Colors = {
  light: {
    text: MagicColors.textPrimary,
    background: MagicColors.darkBg,
    tint: MagicColors.gold,
    icon: MagicColors.textSecondary,
    tabIconDefault: MagicColors.textMuted,
    tabIconSelected: MagicColors.gold,
  },
  dark: {
    text: MagicColors.textPrimary,
    background: MagicColors.darkBg,
    tint: MagicColors.gold,
    icon: MagicColors.textSecondary,
    tabIconDefault: MagicColors.textMuted,
    tabIconSelected: MagicColors.gold,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
