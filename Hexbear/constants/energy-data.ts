/**
 * Energy tracking data for the WattSaver Charm spell.
 * Contains CO₂ conversion factors and energy-saving actions.
 */

// US grid average: ~0.82 lbs CO₂ per kWh ≈ 0.372 kg CO₂ per kWh
export const CO2_PER_KWH = 0.372; // kg CO₂ per kWh (US average)

// Average US household uses ~900 kWh per month
export const AVG_MONTHLY_KWH = 900;

// Points formula: 1 point per kg CO₂ saved
export const POINTS_PER_KG_CO2 = 1;

export interface EnergySavingAction {
  id: string;
  name: string;
  description: string;
  co2SavedKg: number;
  points: number;
  icon: string;
}

export const ENERGY_SAVING_ACTIONS: EnergySavingAction[] = [
  {
    id: 'lights_off',
    name: 'Turned Off Lights (1 hour)',
    description: 'Saved energy by turning off lights when leaving a room',
    co2SavedKg: 0.04,
    points: 1,
    icon: '💡',
  },
  {
    id: 'thermostat_adjust',
    name: 'Adjusted Thermostat (-2°F)',
    description: 'Lowered heating or raised cooling by 2 degrees',
    co2SavedKg: 0.5,
    points: 3,
    icon: '🌡️',
  },
  {
    id: 'cold_wash',
    name: 'Cold Water Laundry',
    description: 'Washed clothes in cold water instead of hot',
    co2SavedKg: 0.6,
    points: 3,
    icon: '🧺',
  },
  {
    id: 'line_dry',
    name: 'Air-Dried Clothes',
    description: 'Skipped the dryer and line-dried clothes',
    co2SavedKg: 2.0,
    points: 5,
    icon: '👕',
  },
  {
    id: 'unplug',
    name: 'Unplugged Electronics',
    description: 'Unplugged idle electronics to stop phantom power draw',
    co2SavedKg: 0.1,
    points: 1,
    icon: '🔌',
  },
  {
    id: 'short_shower',
    name: 'Shorter Shower (-5 min)',
    description: 'Reduced shower time by 5 minutes, saving hot water',
    co2SavedKg: 0.5,
    points: 2,
    icon: '🚿',
  },
  {
    id: 'no_car',
    name: 'Walked / Biked Instead',
    description: 'Chose walking or biking over driving for a short trip',
    co2SavedKg: 2.3,
    points: 8,
    icon: '🚶',
  },
  {
    id: 'meatless_meal',
    name: 'Meatless Meal',
    description: 'Chose a plant-based meal instead of meat',
    co2SavedKg: 1.5,
    points: 5,
    icon: '🥗',
  },
];

/**
 * Calculate CO₂ emissions from kWh usage
 */
export function calculateCO2(kWh: number): number {
  return Math.round(kWh * CO2_PER_KWH * 100) / 100;
}

/**
 * Calculate points from kWh reduction
 */
export function calculateEnergyPoints(
  currentKWh: number,
  previousKWh: number
): number {
  if (previousKWh <= 0) return 0;
  const saved = previousKWh - currentKWh;
  if (saved <= 0) return 0;
  const co2Saved = saved * CO2_PER_KWH;
  return Math.max(Math.round(co2Saved * POINTS_PER_KG_CO2), 1);
}

/**
 * Get an encouraging message based on usage comparison
 */
export function getEnergyMessage(
  currentKWh: number,
  previousKWh: number | null
): string {
  if (!previousKWh) {
    return 'First reading logged! Keep tracking to earn points by reducing your usage.';
  }

  const change = ((currentKWh - previousKWh) / previousKWh) * 100;

  if (change <= -20) return 'Incredible spell! You reduced usage by over 20%! 🌟';
  if (change <= -10) return 'Powerful magic! Over 10% reduction – keep it up! ✨';
  if (change <= -5) return 'Nice work, wizard! You\'re making progress! 🌿';
  if (change <= 0) return 'Good – you used less than last time. Every bit counts! 🍃';
  if (change <= 5) return 'Close to last month. Try a few energy-saving spells! 💪';
  if (change <= 15) return 'Usage went up a bit. Check our energy-saving tips! 🔋';
  return 'Significant increase detected. Time for some conservation spells! ⚡';
}
