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

// Keywords from Vision API labels mapped to material types
export const LABEL_TO_MATERIAL: Record<string, string> = {
  // Containers
  bottle: 'bottle',
  'plastic bottle': 'bottle',
  'water bottle': 'bottle',
  'pet bottle': 'bottle',
  'beverage can': 'aluminum',
  'aluminum can': 'aluminum',
  'tin can': 'can',
  can: 'can',
  jar: 'glass',
  'glass bottle': 'glass',

  // Materials
  aluminum: 'aluminum',
  aluminium: 'aluminum',
  glass: 'glass',
  paper: 'paper',
  cardboard: 'cardboard',
  newspaper: 'paper',
  magazine: 'paper',

  // Packaging
  packaging: 'cardboard',
  box: 'cardboard',
  'cardboard box': 'cardboard',
  carton: 'cardboard',

  // Plastics
  plastic: 'bottle',
  polystyrene: 'bottle',
  styrofoam: 'bottle',
};

/**
 * Attempt to identify a material from Google Vision API labels
 */
export function identifyMaterial(
  labels: string[],
  textAnnotations: string[]
): RecyclingMaterial | null {
  // First, check for recycling code numbers in text
  for (const text of textAnnotations) {
    const codeMatch = text.match(/[1-7]/);
    if (codeMatch) {
      const code = codeMatch[0];
      if (PLASTIC_CODES[code]) {
        return PLASTIC_CODES[code];
      }
    }
  }

  // Then, check labels against known material types
  const normalizedLabels = labels.map((l) => l.toLowerCase());
  for (const label of normalizedLabels) {
    // Direct match
    if (LABEL_TO_MATERIAL[label]) {
      return MATERIAL_TYPES[LABEL_TO_MATERIAL[label]];
    }
    // Partial match
    for (const [keyword, materialKey] of Object.entries(LABEL_TO_MATERIAL)) {
      if (label.includes(keyword) || keyword.includes(label)) {
        return MATERIAL_TYPES[materialKey];
      }
    }
  }

  // Default: if we detect any "recyclable" looking item
  for (const label of normalizedLabels) {
    if (
      label.includes('container') ||
      label.includes('packaging') ||
      label.includes('beverage') ||
      label.includes('drink')
    ) {
      return MATERIAL_TYPES['bottle'];
    }
  }

  return null;
}
