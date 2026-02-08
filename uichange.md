Transform the User Interface to a fantasy magic-inspired mobile interface that blends mystical, magical elements with modern, clean mobile UX design. The app should feel like opening an ancient spellbook while maintaining excellent readability and usability. Think "Dungeons & Dragons character sheet meets eco-conscious modern app."

Key Aesthetic Pillars:

Mystical but readable - Fantasy elements never compromise legibility
Warm and inviting - Earthy tones with magical accents create optimistic, empowering feel
Layered depth - Gradients, borders, and shadows create dimensional, tactile cards
Gamified elegance - RPG mechanics presented with sophistication, not childishness
Color Palette & Usage
Primary Colors:
Deep Emerald Green (#047857, #065F46, #10B981) - Nature, ecology, primary actions

Use for: Environmental features, success states, recycling-related content
Gradients: from-emerald-700 to-emerald-600 or from-emerald-900 to-emerald-800 for depth
Magical Purple/Violet (#7C4DFF, #5E35B1, #B388FF) - Mysticism, user stats, progression

Use for: User profile, level progression, energy-related content, stats cards
Creates glowing "magical aura" effects with semi-transparent shadows
Rich Gold/Amber (#FFD700, #C9A227) - Rewards, achievements, points

Use for: Point values, achievement badges, success highlights, premium features
Text color on dark backgrounds for maximum impact
Background Colors:
Parchment/Cream Base (#F5F5DC, #FAF8F3, #FFF8E7) - Main background

Creates aged paper, grimoire page feeling
Use subtle linear gradients: from-[#faf8f3] to-[#f5f5dc]
Off-White Overlays (white with 60-80% opacity) - Card backgrounds

Layer over parchment for depth: bg-white/70, bg-cream/80
Supporting Colors:
Charcoal (#2D2D2D, #4A4A4A) - Primary text on light backgrounds
Crimson Red (#FF5252) - Errors, warnings, "spell failure" states
Bright Emerald (#00E676) - Success confirmations, completion states
Visual Motifs & Decorative Elements
Magical Textures:
Subtle rune pattern background - SVG pattern overlay at 3-5% opacity

Scattered circles, small diamonds, and dots in emerald, purple, and gold
Fixed to viewport, doesn't scroll with content
Creates mystical atmosphere without distraction
Parchment texture on cards - Very subtle noise/grain filter

Base64 SVG noise pattern at 5% opacity
Overlay on card backgrounds to enhance grimoire aesthetic
Magical particle decorations - Small absolutely-positioned elements

Unicode sparkles (✨), stars (✦), and dots
Amber/gold colored at 30-50% opacity
Scattered sparingly on corners of cards
Border Treatments:
Thick magical borders - 2px solid borders in theme colors

Emerald cards: border-2 border-emerald-400
Purple cards: border-2 border-purple-400
Gold/Amber cards: border-2 border-amber-400
Glowing top accents - Thin gradient line on top edge

Example: bg-gradient-to-r from-purple-500 via-amber-400 to-purple-500 opacity-70
Creates magical energy flow effect Typography System
Font Families:
Headings/Titles: Aphrodite Slim (Playfair Display, EB Garamond, Cinzel)

Apply to: h1, h2, h3, page titles, spell names
Use: font-family: 'Aphrodite Slim', Georgia, serif
Body Text: Clean sans-serif (Inter, Nunito, DM Sans)

Apply to: Paragraphs, descriptions, buttons, labels
Use: font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif
Numbers/Stats: Monospace font

Apply to: Points, scores, CO₂ values, statistics
Use: Tailwind's font-mono utility
Size Hierarchy:
- App title/logo: text-4xl (36px)
- Page titles: text-3xl (30px)
- Section headers: text-xl or text-lg (20-18px)
- Card titles: text-lg (18px)
- Body text: text-sm (14px) - optimized for mobile density
- Labels/captions: text-xs (12px)
Font Weights:
- Headings: font-bold or font-semibold
- Emphasized numbers: font-bold with font-mono
- Body: Default (400 weight)
- Subtle labels: Use color variation instead of font-light
Text Colors by Context:
On dark backgrounds (purple/emerald/amber gradients):

Primary: text-white
Emphasis: text-amber-300 or text-amber-200
Secondary: text-[color]-200 (e.g., text-purple-200, text-emerald-200)
On light backgrounds (parchment/cream/white):

Primary: text-[#2d2d2d] (charcoal)
Secondary: text-[#4a4a4a] (lighter charcoal)
Accent: text-emerald-800, text-purple-800, text-amber-800
Icon Library:
Use Lucide React or similar outlined icon set for consistency

Icon Colors:
Match theme - emerald-700, purple-700, amber-700 on light backgrounds White or light shades on dark backgrounds

Page Flow & Structure
Typical Page Layout:
Header Section (pt-4)

Back button (if not home)
Large icon in colored box + Title + Subtitle
Description Card

Cream background with theme border
Explains feature/spell
Bold point values inline
Primary Action

Large button with icon, text, and points badge
Full width, theme gradient
Status/Stats Section

Dark gradient card showing progress/impact
2-3 column grid with numbers
Content List/Log

Stack of white/70 cards
Recent activity or available actions
Educational/Tips Section

Light colored box (amber/emerald background)
Bulleted list with decorative symbols
Optional emoji icon in header
Scroll Behavior:
Main content scrolls
Bottom nav stays fixed
Header elements scroll with content (not sticky)
Generous bottom padding prevents nav overlap
Key Design Principles
Every interactive element must feel magical - Glows, shadows, and transitions make actions feel powerful

Information density without clutter - Mobile screens are small, use cards and hierarchy to organize

Consistency with variation - Same component patterns, but colors shift by theme/context

Tactile feedback - Scale transforms on press/hover create physical sensation

Optimistic UI - Success states appear immediately, actions feel instant

Accessibility first - High contrast, readable fonts, clear interactive states

Fantasy elements are accents, not obstacles - Sparkles and borders enhance, never obscure content

Avoid using excessive emojis.