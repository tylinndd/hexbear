# Hexbear — Cast Spells. Save the World.

Hexbear is a gamified climate-action mobile app that turns everyday sustainable habits into a magical wizard adventure. Users become "Eco-Wizards" who cast spells — recycling items, conserving energy, and rescuing surplus food — to earn Greenhouse Gas (GHG) points and level up through wizard ranks. Every action is tied to real-world environmental metrics (CO₂ saved, energy conserved, meals donated), making the impact of sustainability tangible and fun.

Built with React Native (Expo) and powered by Supabase, Hexbear was developed for UGAHacks as a response to two tracks: the **Magic!** theme and the **State Farm community benefit** challenge.

---

## Why Hexbear Exists — The Severity of Global Warming

Climate change is the defining crisis of our generation, and individual action — when multiplied across communities — has enormous impact:

- **Recycling & composting** prevented roughly 193 million metric tons of CO₂-equivalent emissions in 2018 alone (EPA). Recycling just 10 PET bottles saves enough energy to power a laptop for over 25 hours.
- **Food waste** accounts for approximately **8% of global greenhouse gas emissions** (Feeding America). If food waste were its own country, it would be the third-largest emitter after China and the USA (Earth.org). Methane released by decomposing food in landfills is **25× more potent** than CO₂.
- **Home energy use** is a major source of emissions. The average US household uses around 900 kWh of electricity per month, producing roughly 370 kg of CO₂. Simple actions — switching to LED bulbs, unplugging idle chargers, air-drying laundry — can cut energy consumption by 10–30%.

Despite these facts, most people find sustainability boring, abstract, or overwhelming. Hexbear exists to flip that script: by wrapping climate action in a wizard fantasy game with points, levels, leaderboards, and Lottie animations, the app lowers the barrier to participation and makes saving the planet genuinely enjoyable.

---

## How the App Works

### Authentication (Login & Sign Up)

Users register as aspiring wizards in the "Order of EcoMages." The sign-up screen collects a **Wizard Name**, email, and password. Authentication is handled by **Supabase Auth** with JWT-based sessions persisted via AsyncStorage. After sign-up, a profile row is created in the `profiles` table with starting stats (0 points, Level 1, title "Novice EcoMage"). The root layout listens for auth state changes and conditionally routes users to either the auth screens or the main tab navigator.

### Home Screen (Spellbook)

The home screen greets the user by their Wizard Name and displays:

- **Points & Level Display** — a progress bar showing GHG points and how far the user is from the next wizard rank (10 ranks total, from "Novice EcoMage" to "Archmage of Climate").
- **Daily Quest Banner** — a motivational prompt to cast 3 spells per day.
- **Available Spells** — three animated spell cards linking to the core features.
- **Impact Stats** — real-time cards showing kg CO₂ saved, total spells cast, and wizard level.
- **Motivational Quote** — randomly selected from a pool of 10 eco/climate quotes each time the screen loads.

### Spell 1: Recyclify Reveal (Recycling Scanner)

This is the flagship feature. The user opens their camera, points it at an item (or its recycling symbol), and the app uses the **Google Cloud Vision API** to identify the material:

1. **Image Capture** — Uses `expo-camera` to take a photo with base64 encoding.
2. **AI Analysis** — Sends the image to Google Cloud Vision API for label detection, object localization, and text/OCR detection.
3. **Material Identification** — A custom algorithm (`identifyMaterial`) scores Vision API labels against a weighted keyword database, checks OCR text for resin identification codes (1–7), and maps results to a recycling material reference (PET, HDPE, aluminum, glass, paper, etc.).
4. **Result Display** — Shows whether the item is recyclable, recycling instructions, CO₂ savings, GHG points to be earned, and a fun fact.
5. **Proof of Recycling** — If recyclable, the user takes a second photo of the item in a recycling bin. A verification algorithm scores the proof photo against recycling-bin keywords, text, and logos to confirm it's a real recycling bin (not a regular trash can).
6. **Photo Upload** — Both the scan photo and proof photo are uploaded to **Supabase Storage** in a user-specific folder.
7. **Points Awarded** — The action is logged to the `actions` table and points are added to the user's profile.

### Spell 2: WattSaver Charm (Energy Tracker)

Users enter their monthly electricity consumption (kWh) to track energy use over time:

- The app calculates CO₂ emissions using EPA conversion factors (~0.82 lbs CO₂/kWh).
- If the current reading is lower than the previous month, points are awarded for the reduction.
- A **bar chart** visualizes the last 6 readings.
- **Quick Energy Spells** let users log one-off conservation actions (e.g., "Switched to LED bulbs," "Used cold water laundry") for instant points.
- A **Wizard Tip** box shows a randomly selected energy-saving tip from a pool of 10.

### Spell 3: Food Rescue Portal (Donation Finder)

Helps users donate surplus food instead of wasting it:

- Uses `expo-location` to get the user's GPS coordinates.
- Attempts to find real nearby donation sites via the **Google Places API** (Nearby Search) with keywords like "food bank," "soup kitchen," "community fridge."
- Falls back to hardcoded demo data (Athens, GA locations) when the Places API isn't available.
- Displays site details (name, type, address, hours, phone, accepted items, distance).
- Provides **Get Directions** (opens native Maps app) and **Donated!** (confirms the spell).
- Awards 30 GHG points per donation with a randomly selected food-waste fact in the success modal.

### Profile & Leaderboard

- Displays the user's wizard avatar, name, title, email, and stats.
- **Community Leaderboard** — queries the `profiles` table for the top 10 users by points (with fallback demo data).
- **Spell History** — shows the user's recent actions from the `actions` table.
- **Wizard Ranks** — displays all 10 levels with lock/unlock status and progress.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React Native 0.81 + Expo SDK 54 | Cross-platform mobile app (iOS, Android, Web) |
| **Language** | TypeScript 5.9 | Type-safe development |
| **Navigation** | Expo Router 6 (file-based routing) | Tab and stack navigation |
| **Auth** | Supabase Auth | Email/password sign-up & sign-in, JWT sessions |
| **Database** | Supabase PostgreSQL | User profiles, action logs, leaderboard |
| **Storage** | Supabase Storage | Photo uploads (scan + proof images) |
| **Computer Vision** | Google Cloud Vision API | Label detection, object localization, OCR for recyclability analysis |
| **Location Services** | expo-location + Google Places API | GPS positioning and nearby donation-site search |
| **Animations** | Lottie (lottie-react-native) + React Native Animated | Magic-themed animations (rabbit, wand, magician) |
| **Icons** | @expo/vector-icons (Ionicons) | Consistent icon system across the app |
| **Session Storage** | @react-native-async-storage/async-storage | Persisting auth sessions on-device |
| **Haptics** | expo-haptics | Tactile feedback on tab bar interactions |
| **State Management** | React Context (AuthContext) | Global auth state, user profile, points, and action logging |

---

## Architecture & Data Flow

```
┌─────────────────────────────────────────────────────┐
│                   React Native App                   │
│              (Expo Router / TypeScript)               │
└────────┬──────────┬──────────┬──────────┬───────────┘
         │          │          │          │
    ┌────▼───┐ ┌────▼───┐ ┌───▼────┐ ┌──▼──────────┐
    │Supabase│ │Supabase│ │Supabase│ │ Google Cloud │
    │  Auth  │ │   DB   │ │Storage │ │  Vision API  │
    └────────┘ └────────┘ └────────┘ │  Places API  │
                                      └──────────────┘
```

### Authentication Flow

1. User enters credentials → `supabase.auth.signUp()` or `supabase.auth.signInWithPassword()`
2. Supabase returns a JWT session → stored in AsyncStorage via a `SafeStorage` adapter
3. `AuthContext` listens to `onAuthStateChange` and updates global state
4. Root layout checks `session` to route to `(auth)` or `(tabs)` stack
5. On sign-up, a `profiles` row is created with the user's ID, wizard name, and starting stats

### Recycling Scan Flow

1. Camera captures image → base64 encoded
2. Base64 sent to `https://vision.googleapis.com/v1/images:annotate` with label, object, and text detection
3. Response labels scored against `LABEL_RULES` weighted keyword database
4. OCR text checked for resin codes (PETE, HDPE, etc.) and standalone digits 1–7
5. Best match returned as a `RecyclingMaterial` with name, instructions, CO₂ savings, points, and fun fact
6. Proof photo analyzed with same Vision API + recycling-bin keyword scoring
7. Both photos uploaded to Supabase Storage bucket `photos/{user_id}/`
8. Action logged to `actions` table → points added to `profiles.total_points`

### Donation Site Discovery Flow

1. `expo-location` requests foreground permission → gets GPS coordinates
2. App fires parallel Google Places API Nearby Search requests for 6 keywords (food bank, food pantry, community fridge, etc.) within a 10-mile radius
3. Results deduplicated by `place_id`, classified by type, sorted by haversine distance
4. If Places API fails or returns no results → falls back to hardcoded Athens, GA demo sites
5. User selects site → confirms donation → action logged with 30 points

### Points & Leveling System

- **GHG Points** are the universal currency — earned from all three spells
- Points map to 10 wizard levels (0 → 5000+ points): Novice EcoMage → Archmage of Climate
- 1 point ≈ 0.1 kg CO₂ saved (displayed in profile stats)
- Points are stored in `profiles.total_points` and updated optimistically (local state first, then DB)

### Database Schema

```sql
-- profiles: extends Supabase auth.users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  wizard_name TEXT NOT NULL,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  title TEXT DEFAULT 'Novice EcoMage',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- actions: logs every eco-action
CREATE TABLE actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('recycle', 'energy', 'donate')),
  details JSONB,
  points_awarded INTEGER NOT NULL,
  image_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Both tables are protected by **Row Level Security (RLS)** policies — users can only read/write their own data, with an exception for the leaderboard (all authenticated users can read all profiles).

---

## Problems & Challenges Encountered

### 1. Server-Side Rendering (SSR) Storage Crash

**Problem:** When running on web, the default Supabase client initialization with `AsyncStorage` would crash during SSR because `window` is undefined on the server.

**Solution:** Created a `SafeStorage` adapter (`Hexbear/lib/supabase.ts`) that dynamically imports `AsyncStorage` only at runtime and returns no-op stubs during SSR. This prevents crashes while maintaining full session persistence on native and client-side web.

### 2. Database Tables May Not Exist Yet

**Problem:** During development and fresh Supabase project setup, the `profiles` and `actions` tables might not be created yet. Querying them would throw errors and break the app on first launch.

**Solution:** The `AuthContext` wraps all database calls in try/catch blocks and creates **local fallback profiles** when the database is unavailable. Users can still use the app (with local state) even if the Supabase tables haven't been set up. Actions are logged on a best-effort basis — points are awarded locally regardless of DB success.

### 3. Google Vision API Error Handling

**Problem:** The Vision API can fail for multiple reasons — invalid/expired API key, billing not enabled, quota exceeded, or per-request errors on individual images. Early versions of the app didn't distinguish between these failure modes, leading to silent failures or confusing error messages.

**Solution:** Added multi-layer error handling that checks for API-level errors (`data.error`), per-request errors (`result.error`), and network errors. Each case shows a descriptive alert to the user explaining what went wrong (e.g., "Check your API key and billing").

### 4. Recycling Bin Proof Verification Accuracy

**Problem:** Verifying that a proof photo actually shows a recycling bin (and not a regular trash can) is surprisingly difficult. Generic labels like "bin" or "container" are ambiguous, and the Vision API doesn't always return recycling-specific labels.

**Solution:** Built a multi-signal scoring system that combines:
- **Label weights** — "recycling bin" (10 pts), "blue bin" (8 pts), "bin" (1 pt)
- **OCR text detection** — text like "Recycle" or "Recyclables" on the bin (6 pts each)
- **Logo detection** — recycling symbols or green dot logos (8 pts)
- **Negative penalties** — trash/garbage labels without any recycling labels (-10 pts)

A threshold score of 5 is required to pass. If verification fails, users can retake the proof photo.

### 5. Photo Upload with Base64 in React Native

**Problem:** Supabase Storage expects a `Blob` for file uploads, but `expo-camera` returns photos as base64 strings. Converting base64 to Blob in React Native isn't straightforward because there's no native `atob`/`Blob` support on all platforms.

**Solution:** Implemented a custom `base64ToBlob` helper that manually decodes base64 characters to byte arrays and constructs a `Blob` with the correct MIME type. Photos are uploaded even if the conversion is imperfect — the action still logs and awards points even if upload fails.

### 6. Google Places API Not Always Enabled

**Problem:** The Google Cloud Vision API key doesn't automatically have the Places API enabled. Users who set up the project for the first time would get `REQUEST_DENIED` errors when trying to find donation sites, with no helpful feedback.

**Solution:** The donation screen now:
- Attempts the live Places API search first
- Falls back to hardcoded demo data (Athens, GA) on failure
- Shows an info banner explaining that demo data is being shown and how to enable the Places API
- Sorts demo sites by haversine distance from the user's actual location

### 7. Static Hardcoded Facts and Tips

**Problem:** All eco-facts, tips, and motivational quotes throughout the app were hardcoded — the same text appeared every single time. This made the app feel repetitive after a few uses.

**Solution:** Created a centralized `eco-facts.ts` constants file with pools of 10 entries per category (energy tips, home quotes, donation facts) and a `getRandomItem()` helper. Each screen uses `useMemo()` to pick a random fact on mount, so users see different content each visit.

### 8. Sign-Up / Login Page Styling Inconsistencies

**Problem:** The sign-up and login screens were developed at different times and had mismatched styling — different font sizes, font families, animation alignment, and spacing for the app title and subtitle.

**Solution:** Unified the sign-up page styling to match the login page: updated `fontSize` (36 → 52 for the app name), added Baskerville font family, aligned the Lottie animation container with `alignSelf`, `alignItems`, `justifyContent`, and `marginLeft`, and standardized header margins.

### 9. String Escaping in Constants Files

**Problem:** Apostrophes in eco-fact strings (e.g., "That's") broke the JavaScript string literals when the file was auto-generated, and missing commas between array elements caused syntax errors.

**Solution:** Escaped all apostrophes with `\'` and ensured proper comma separation between all array entries.

---

## Project Structure

```
Hexbear/
├── app/
│   ├── _layout.tsx              # Root layout (AuthProvider + route guard)
│   ├── (auth)/
│   │   ├── _layout.tsx          # Auth stack layout
│   │   ├── login.tsx            # Login screen
│   │   └── signup.tsx           # Sign-up screen
│   └── (tabs)/
│       ├── _layout.tsx          # Tab navigator (5 tabs)
│       ├── index.tsx            # Home / Spellbook
│       ├── recycle.tsx          # Recyclify Reveal (camera + Vision API)
│       ├── energy.tsx           # WattSaver Charm (energy tracker)
│       ├── donate.tsx           # Food Rescue Portal (donation finder)
│       └── profile.tsx          # Profile, leaderboard, wizard ranks
├── components/
│   ├── LottieAnimation.tsx      # Lottie wrapper component
│   ├── MagicButton.tsx          # Themed button (6 variants, 3 sizes)
│   ├── PointsDisplay.tsx        # Points + level progress bar
│   ├── SpellCard.tsx            # Animated spell card for home screen
│   └── SuccessModal.tsx         # Celebration modal with Lottie + stats
├── constants/
│   ├── donation-sites.ts        # Donation site data + Places API integration
│   ├── eco-facts.ts             # Random eco-facts, tips, and quotes
│   ├── energy-data.ts           # Energy actions, CO₂ calculations
│   ├── levels.ts                # 10-tier wizard leveling system
│   ├── recycling-data.ts        # Material database + Vision API label scoring
│   └── theme.ts                 # Color palette, typography, shadows
├── contexts/
│   └── AuthContext.tsx           # Global auth state, profile, points, action logging
├── lib/
│   └── supabase.ts              # Supabase client + API keys + SafeStorage adapter
├── assets/
│   ├── animations/              # Lottie JSON files (rabbit, wand, magician)
│   └── images/                  # App icons, logos, splash screen
├── supabase-schema.sql          # Database schema + RLS policies
├── app.json                     # Expo config (permissions, plugins, splash)
└── package.json                 # Dependencies
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npx expo`)
- A [Supabase](https://supabase.com) project (free tier works)
- A [Google Cloud](https://console.cloud.google.com) project with the **Cloud Vision API** enabled (and optionally the **Places API**)

### Installation

```bash
cd Hexbear
npm install
```

### Configuration

1. Update `lib/supabase.ts` with your Supabase **Project URL** and **anon key**.
2. Update the `GOOGLE_VISION_API_KEY` in the same file with your Google Cloud API key.
3. Run the SQL in `supabase-schema.sql` in your Supabase SQL Editor to create the `profiles` and `actions` tables with RLS policies.
4. (Optional) Create a `photos` storage bucket in your Supabase dashboard for image uploads.

### Running the App

```bash
npx expo start
```

Then open in:
- **iOS Simulator** — press `i`
- **Android Emulator** — press `a`
- **Expo Go** — scan the QR code
- **Web** — press `w`

---

## Team

Built at UGAHacks with passion for the planet.
