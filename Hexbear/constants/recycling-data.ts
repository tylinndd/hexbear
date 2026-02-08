/**
 * Recycling reference data for the Recyclify Reveal spell.
 * Contains material types, recycling codes, CO₂ savings, and GHG point values.
 */

export interface RecyclingMaterial {
  code: string;
  name: string;
  type: string;
  recyclable: boolean;
  instructions: string;
  co2SavedKg: number; // kg CO₂ saved per item recycled
  points: number; // GHG points awarded
  funFact: string;
}

// Plastic resin codes (1-7)
export const PLASTIC_CODES: Record<string, RecyclingMaterial> = {
  '1': {
    code: '1',
    name: 'PET (Polyethylene Terephthalate)',
    type: 'plastic',
    recyclable: true,
    instructions:
      'Widely recyclable in curbside programs. Rinse and place in recycling bin. Remove caps if required by your local program.',
    co2SavedKg: 0.04,
    points: 5,
    funFact:
      'Recycling 10 PET bottles saves enough energy to power a laptop for over 25 hours!',
  },
  '2': {
    code: '2',
    name: 'HDPE (High-Density Polyethylene)',
    type: 'plastic',
    recyclable: true,
    instructions:
      'Commonly accepted. Includes milk jugs, detergent bottles. Rinse and recycle.',
    co2SavedKg: 0.05,
    points: 5,
    funFact:
      'HDPE can be recycled into playground equipment, plastic lumber, and new bottles.',
  },
  '3': {
    code: '3',
    name: 'PVC (Polyvinyl Chloride)',
    type: 'plastic',
    recyclable: false,
    instructions:
      'Rarely accepted curbside. Check local specialty recyclers. Often found in pipes and packaging.',
    co2SavedKg: 0,
    points: 1,
    funFact:
      'PVC is one of the hardest plastics to recycle but knowing this helps you make better choices!',
  },
  '4': {
    code: '4',
    name: 'LDPE (Low-Density Polyethylene)',
    type: 'plastic',
    recyclable: false,
    instructions:
      'Not typically curbside recyclable. Many grocery stores accept plastic bags and film. Bundle and drop off.',
    co2SavedKg: 0.02,
    points: 3,
    funFact: 'Plastic bags take 10-1,000 years to decompose in a landfill.',
  },
  '5': {
    code: '5',
    name: 'PP (Polypropylene)',
    type: 'plastic',
    recyclable: true,
    instructions:
      'Increasingly accepted. Includes yogurt cups, bottle caps, straws. Rinse before recycling.',
    co2SavedKg: 0.03,
    points: 4,
    funFact:
      'PP can be recycled into brooms, bike racks, and auto parts.',
  },
  '6': {
    code: '6',
    name: 'PS (Polystyrene)',
    type: 'plastic',
    recyclable: false,
    instructions:
      'Rarely recyclable. Styrofoam is difficult to process. Check for local drop-off options.',
    co2SavedKg: 0,
    points: 1,
    funFact:
      'Styrofoam can take over 500 years to decompose. Avoiding it is the best spell!',
  },
  '7': {
    code: '7',
    name: 'Other (Mixed Plastics)',
    type: 'plastic',
    recyclable: false,
    instructions:
      'Not typically recyclable. Includes multi-layer plastics. Reduce usage when possible.',
    co2SavedKg: 0,
    points: 1,
    funFact:
      'Code 7 includes bioplastics too – check if your item is compostable!',
  },
};

// General material types (detected by Vision API labels)
export const MATERIAL_TYPES: Record<string, RecyclingMaterial> = {
  aluminum: {
    code: 'AL',
    name: 'Aluminum Can',
    type: 'metal',
    recyclable: true,
    instructions:
      'Highly recyclable! Rinse and toss in recycling bin. No need to crush.',
    co2SavedKg: 0.15,
    points: 8,
    funFact:
      'Recycling one aluminum can saves enough energy to run a TV for 3 hours!',
  },
  glass: {
    code: 'GL',
    name: 'Glass Bottle/Jar',
    type: 'glass',
    recyclable: true,
    instructions:
      'Rinse and recycle. Remove lids. Glass can be recycled infinitely without quality loss!',
    co2SavedKg: 0.3,
    points: 10,
    funFact:
      'Glass is 100% recyclable and can be recycled endlessly without losing quality or purity.',
  },
  paper: {
    code: 'PA',
    name: 'Paper/Cardboard',
    type: 'paper',
    recyclable: true,
    instructions:
      'Flatten cardboard. Keep paper dry and clean. Remove tape and staples if possible.',
    co2SavedKg: 0.06,
    points: 4,
    funFact:
      'Recycling one ton of paper saves 17 trees and 7,000 gallons of water.',
  },
  cardboard: {
    code: 'CB',
    name: 'Cardboard Box',
    type: 'paper',
    recyclable: true,
    instructions:
      'Flatten and remove any packing materials inside. Keep dry.',
    co2SavedKg: 0.08,
    points: 5,
    funFact:
      'About 80% of products sold in the US are packaged in cardboard.',
  },
  bottle: {
    code: 'BT',
    name: 'Plastic Bottle',
    type: 'plastic',
    recyclable: true,
    instructions:
      'Empty, rinse, and replace the cap. Recycle in your curbside bin.',
    co2SavedKg: 0.04,
    points: 5,
    funFact:
      'Americans throw away 35 billion plastic bottles every year. You\'re helping change that!',
  },
  can: {
    code: 'CN',
    name: 'Metal Can',
    type: 'metal',
    recyclable: true,
    instructions:
      'Rinse empty cans. Both aluminum and steel/tin cans are recyclable.',
    co2SavedKg: 0.12,
    points: 7,
    funFact:
      'Steel is the most recycled material in the world – more than paper, glass, and plastic combined!',
  },
};

/**
 * Keywords from Vision API labels mapped to material types.
 * Sorted longest-first so more-specific matches win.
 * Each entry has a weight: higher weight = more confident match.
 */
export const LABEL_RULES: { keyword: string; material: string; weight: number }[] = [
  // High-confidence specific labels (weight 3)
  { keyword: 'plastic bottle', material: 'bottle', weight: 3 },
  { keyword: 'water bottle', material: 'bottle', weight: 3 },
  { keyword: 'pet bottle', material: 'bottle', weight: 3 },
  { keyword: 'beverage can', material: 'aluminum', weight: 3 },
  { keyword: 'aluminum can', material: 'aluminum', weight: 3 },
  { keyword: 'aluminium can', material: 'aluminum', weight: 3 },
  { keyword: 'tin can', material: 'can', weight: 3 },
  { keyword: 'glass bottle', material: 'glass', weight: 3 },
  { keyword: 'glass jar', material: 'glass', weight: 3 },
  { keyword: 'cardboard box', material: 'cardboard', weight: 3 },

  // Medium-confidence material labels (weight 2)
  { keyword: 'bottle', material: 'bottle', weight: 2 },
  { keyword: 'aluminum', material: 'aluminum', weight: 2 },
  { keyword: 'aluminium', material: 'aluminum', weight: 2 },
  { keyword: 'glass', material: 'glass', weight: 2 },
  { keyword: 'cardboard', material: 'cardboard', weight: 2 },
  { keyword: 'newspaper', material: 'paper', weight: 2 },
  { keyword: 'magazine', material: 'paper', weight: 2 },
  { keyword: 'paper', material: 'paper', weight: 2 },
  { keyword: 'can', material: 'can', weight: 2 },
  { keyword: 'jar', material: 'glass', weight: 2 },
  { keyword: 'carton', material: 'cardboard', weight: 2 },

  // Lower-confidence generic labels (weight 1)
  { keyword: 'plastic', material: 'bottle', weight: 1 },
  { keyword: 'polystyrene', material: 'bottle', weight: 1 },
  { keyword: 'styrofoam', material: 'bottle', weight: 1 },
  { keyword: 'box', material: 'cardboard', weight: 1 },
];

/**
 * Known recycling-code abbreviations found in OCR text.
 * These are the resin identification codes printed on products
 * (e.g. "PETE", "HDPE") and are a strong signal for plastic type.
 */
const RESIN_CODE_KEYWORDS: Record<string, string> = {
  pete: '1',
  'pet': '1',   // common abbreviation on bottles
  hdpe: '2',
  pvc: '3',
  'v': '3',
  ldpe: '4',
  pp: '5',
  ps: '6',
};

/**
 * Attempt to identify a material from Google Vision API labels and text.
 *
 * Strategy:
 * 1. Look for resin-identification abbreviations (PETE, HDPE, etc.) in OCR text — very reliable.
 * 2. Look for an isolated recycling code digit (a standalone 1-7 not embedded in longer numbers).
 * 3. Score all Vision labels against known material keywords and pick the best match.
 */
export function identifyMaterial(
  labels: string[],
  textAnnotations: string[]
): RecyclingMaterial | null {
  // ──────────────────────────────────────────
  // 1. Check OCR text for resin abbreviations (most reliable signal)
  // ──────────────────────────────────────────
  for (const text of textAnnotations) {
    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    for (const word of words) {
      if (RESIN_CODE_KEYWORDS[word]) {
        return PLASTIC_CODES[RESIN_CODE_KEYWORDS[word]];
      }
    }
  }

  // ──────────────────────────────────────────
  // 2. Check for standalone recycling code digits (1-7).
  //    Only match a digit that appears on its own or inside a recycling-symbol
  //    context — NOT digits embedded in dates, prices, addresses, etc.
  //    A "standalone" digit is one surrounded by non-digit characters (or string boundaries).
  // ──────────────────────────────────────────
  for (const text of textAnnotations) {
    // Match a single digit 1-7 that is NOT adjacent to other digits
    const standaloneDigits = text.match(/(?<!\d)[1-7](?!\d)/g);
    if (standaloneDigits) {
      // Only trust this if the text annotation itself is very short
      // (recycling symbols usually produce short OCR snippets like "1", "2 HDPE", etc.)
      const trimmed = text.trim();
      if (trimmed.length <= 6) {
        const code = standaloneDigits[0];
        if (PLASTIC_CODES[code]) {
          return PLASTIC_CODES[code];
        }
      }
    }
  }

  // ──────────────────────────────────────────
  // 3. Score Vision labels against known material keywords
  //    Pick the match with the highest cumulative weight.
  // ──────────────────────────────────────────
  const normalizedLabels = labels.map((l) => l.toLowerCase());
  const scores: Record<string, number> = {};

  for (const label of normalizedLabels) {
    for (const rule of LABEL_RULES) {
      // Only match if the label contains the keyword (one direction only)
      if (label.includes(rule.keyword)) {
        scores[rule.material] = (scores[rule.material] || 0) + rule.weight;
      }
    }
  }

  // Find the material with the highest score
  let bestMaterial: string | null = null;
  let bestScore = 0;
  for (const [mat, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestMaterial = mat;
    }
  }

  if (bestMaterial && bestScore >= 2 && MATERIAL_TYPES[bestMaterial]) {
    return MATERIAL_TYPES[bestMaterial];
  }

  // ──────────────────────────────────────────
  // 4. No confident match found
  // ──────────────────────────────────────────
  return null;
}
