/**
 * Pool of eco / climate / global-warming facts shown randomly throughout the app.
 * Each category feeds a different section; a helper picks one at random.
 */

// ── Energy tips (shown in the WattSaver Charm "Wizard Tip" box) ──────────────
export const ENERGY_TIPS: string[] = [
  'Switching to LED bulbs can save up to 75% of lighting energy. That\'s a powerful spell for your electricity bill and the planet!',
  'Unplugging idle chargers and appliances can cut phantom energy use by up to 10% of your electricity bill.',
  'A programmable thermostat can save you about 10% a year on heating and cooling costs.',
  'Washing clothes in cold water can save up to 90% of the energy your washer uses per load.',
  'Air-drying just one load of laundry per week can save over 100 kg of CO₂ per year.',
  'Replacing a single incandescent bulb with an LED saves roughly 80 kg of CO₂ over its lifetime.',
  'Energy Star-certified appliances use 10-50% less energy than standard models.',
  'Sealing air leaks around windows and doors can reduce heating costs by up to 20%.',
  'Using a laptop instead of a desktop computer can save up to 80% of the energy used.',
  'Solar panels on an average US home offset about 3-4 tons of CO₂ per year — equivalent to planting over 100 trees!',
];

// ── Home-screen quotes (shown in the bottom motivational box) ────────────────
export const HOME_QUOTES: { text: string; author: string }[] = [
  {
    text: 'Every spell you cast brings us closer to a world where nature thrives. Keep casting, Eco-Wizard!',
    author: 'The Grand EcoMage',
  },
  {
    text: 'The greatest threat to our planet is the belief that someone else will save it.',
    author: 'Robert Swan',
  },
  {
    text: 'We do not inherit the earth from our ancestors; we borrow it from our children.',
    author: 'Native American Proverb',
  },
  {
    text: 'What you do makes a difference, and you have to decide what kind of difference you want to make.',
    author: 'Jane Goodall',
  },
  {
    text: 'The climate is changing. Why aren\'t we? Small spells lead to big transformations.',
    author: 'The Grand EcoMage',
  },
  {
    text: 'One person\'s trash is another person\'s treasure — and recycling is the spell that makes it happen.',
    author: 'The Grand EcoMage',
  },
  {
    text: 'In nature, nothing is wasted. Every leaf, every drop, every breath has purpose.',
    author: 'The Grand EcoMage',
  },
  {
    text: 'Act as if what you do makes a difference. It does.',
    author: 'William James',
  },
  {
    text: 'Sustainability is not a spell you cast once — it\'s a practice you live every day.',
    author: 'The Grand EcoMage',
  },
  {
    text: 'The Earth does not belong to us. We belong to the Earth.',
    author: 'Chief Seattle',
  },
];

// ── Donation fun facts (shown in the Food Rescue success modal) ──────────────
export const DONATION_FACTS: string[] = [
  'Uneaten food in landfills accounts for 8% of global emissions. Thank you for being part of the solution!',
  'If food waste were a country, it would be the third-largest emitter of greenhouse gases after China and the USA.',
  'Roughly one-third of all food produced globally is lost or wasted every year — about 1.3 billion tons.',
  'Reducing food waste is the #1 most impactful action we can take to fight climate change, according to Project Drawdown.',
  'Methane from decomposing food in landfills is 25× more potent than CO₂ as a greenhouse gas.',
  'In the US alone, 119 billion pounds of food is wasted each year — enough to fill a 90,000-seat stadium every single day.',
  'Donating just one meal\'s worth of food prevents roughly 2 kg of CO₂-equivalent emissions from reaching the atmosphere.',
  'Food rescue organizations recover over 3 billion pounds of food annually, feeding millions of people in need.',
  'The water used to produce the food we waste each year could fill Lake Geneva — three times over!',
  'A single rescued meal can power a person through an entire day and prevent greenhouse gases at the same time.',
];

// ── Helper: pick a random item from any array ────────────────────────────────
export function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
