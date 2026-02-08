/**
 * Wizard level progression system for Hexbear.
 * Users advance through ranks as they accumulate GHG points.
 */

export interface WizardLevel {
  level: number;
  title: string;
  minPoints: number;
  icon: string; // emoji icon for the level
}

export const WIZARD_LEVELS: WizardLevel[] = [
  { level: 1, title: 'Novice EcoMage', minPoints: 0, icon: '🌱' },
  { level: 2, title: 'Climate Conjurer', minPoints: 50, icon: '🌿' },
  { level: 3, title: 'Green Guardian', minPoints: 150, icon: '🍀' },
  { level: 4, title: 'Nature Warlock', minPoints: 300, icon: '🌳' },
  { level: 5, title: 'Earth Enchanter', minPoints: 500, icon: '✨' },
  { level: 6, title: 'Storm Sage', minPoints: 800, icon: '⚡' },
  { level: 7, title: 'Forest Oracle', minPoints: 1200, icon: '🔮' },
  { level: 8, title: 'Phoenix Protector', minPoints: 1800, icon: '🔥' },
  { level: 9, title: 'Dragon Defender', minPoints: 2500, icon: '🐉' },
  { level: 10, title: 'Archmage of Climate', minPoints: 5000, icon: '👑' },
];

/**
 * Get the wizard level info for a given point total
 */
export function getWizardLevel(totalPoints: number): WizardLevel {
  let current = WIZARD_LEVELS[0];
  for (const level of WIZARD_LEVELS) {
    if (totalPoints >= level.minPoints) {
      current = level;
    } else {
      break;
    }
  }
  return current;
}

/**
 * Get the next wizard level (or null if max level)
 */
export function getNextLevel(totalPoints: number): WizardLevel | null {
  for (const level of WIZARD_LEVELS) {
    if (totalPoints < level.minPoints) {
      return level;
    }
  }
  return null;
}

/**
 * Get progress to next level as a fraction (0 to 1)
 */
export function getLevelProgress(totalPoints: number): number {
  const current = getWizardLevel(totalPoints);
  const next = getNextLevel(totalPoints);

  if (!next) return 1; // Max level

  const pointsInLevel = totalPoints - current.minPoints;
  const pointsNeeded = next.minPoints - current.minPoints;

  return Math.min(pointsInLevel / pointsNeeded, 1);
}
