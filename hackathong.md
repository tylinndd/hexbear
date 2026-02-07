# EcoWizard: A Magical Climate Action App (Hackathon Build Guide)

## Introduction

EcoWizard is a React Native application that empowers individuals to fight climate change through "magical" actions (spells) that benefit the community. Aligned with UGAHacks Track 8 (Magic!) and the State Farm sponsor track (community benefit), this guide outlines a feasible 48-hour build for a 3-person team. We focus on one core feature loop and a couple of high-impact secondary features – all framed as fun spells in a magic-themed interface. Each spell corresponds to an environmentally positive action, with clear feedback on real-world impact. The goal is to wow judges with a polished demo loop, compelling storytelling, and tangible community benefits.

**Core Idea:** Users cast spells by performing eco-friendly actions (like recycling or saving energy), verified through the app, and earn Greenhouse Gas (GHG) points as "magical rewards." The app quantifies the environmental impact of each action (e.g. CO₂ saved) to show clarity of impact. We'll implement a primary spell (recyclability scan with photo proof and points) and 1–2 secondary spells (e.g. energy tracking and food donation routing) that are simple yet meaningful. Supabase services (Storage, Edge Functions, PostgreSQL Database, and Auth) will be used to handle image storage, backend logic, data persistence, and user authentication, ensuring a scalable and modern tech stack. Throughout, the design uses magical storytelling – the user is a wizard casting spells to protect the community and the planet.

## Core Feature (Main Spell): Recyclability Scan & GHG Points

**Spell Name:** Recyclify Reveal (Recycling Identification Spell)

**User Flow:** The user invokes the Recyclify Reveal spell from the app's home screen (presented as a grimoire of spells). This opens the camera with an AR-style overlay (e.g. a glowing circle or rune) guiding the user to center the item's recycling symbol or material. The user snaps a photo of the item they wish to dispose of. The app "magically" analyzes the image and tells the user whether the item is recyclable and how to recycle it. If recyclable, the user is prompted to "cast the spell" by confirming they will recycle (optionally, they take a second photo as proof of the item placed in a recycling bin). Upon confirmation/photo verification, the app awards the user a certain amount of GHG points corresponding to the greenhouse gas emissions avoided by recycling that item. A celebratory animation (sparkles, sound effect) plays as the points are added. For example, recycling a plastic bottle might yield a few points and a message like: "Recycled! You saved ~0.1 kg CO₂ – equivalent to charging a laptop for 2 hours!" (The app can include fun facts, such as recycling 10 plastic bottles saves enough energy to power a laptop for over 25 hours [epa.gov], to reinforce the impact). The user can then see their updated score and maybe their progress towards the next "wizard level." This completes the main loop: scan → confirm → reward.

**Environmental Logic (GHG Points):** Each item's point value is based on estimated CO₂ or energy savings from recycling that material. For instance, aluminum and plastics save significant energy when recycled – the app uses reference data (e.g. EPA's iWARM model or known stats) to assign points proportional to CO₂ saved. (Recycling and composting of waste already saves hundreds of millions of tons of CO₂ annually [epa.gov]; our point system makes this tangible per item). The GHG points effectively gamify carbon savings. We ensure clarity of impact by translating points into real metrics – e.g. "1 point = 0.1 kg CO₂ saved." This way, when users earn points, they understand the actual community/environmental benefit. The photo verification step adds accountability (the "spell" only succeeds – i.e., points only awarded – if the user provides proof or at least manually confirms the action). Although automated image verification of the recycling act is complex, the photo can be stored for transparency. The magical theme can frame this as capturing the "essence" of the act in a crystal (photo) to complete the spell.

**Technical Implementation:** This feature is ambitious but achievable by leveraging mobile camera capabilities and a lightweight ML or recognition solution. We will use React Native (Expo) for cross-platform ease, tapping into the device camera. For recognizing the item's recyclability, a pragmatic approach is to detect the resin identification code (the number inside the recycle triangle on plastics) or simply identify the material type:

- **Image Recognition:** We can train or use a small image classifier to recognize the recycling code symbol (digits 1–7 for plastic types). In fact, others have successfully built hacks that let users snap a picture of the plastic resin code to get recycling info [alyssax.substack.com]. We could utilize an existing dataset of the 7 plastic codes [alyssax.substack.com] to train a simple model before the hack or use an on-device ML solution (TensorFlow Lite or an Expo plugin) to classify the symbol. If training a custom model is infeasible in 48 hours, an alternative is using OCR: the app can isolate the region and use a text recognition library (Tesseract or a cloud API) to read the number in the triangle. Another approach is leveraging a cloud vision API to identify the material or logo on the item (for example, the Bower recycling app uses AI to detect item type and material automatically [plasticstoday.com]). For our hack, we might implement a simpler version: have the user focus on the recycle logo and attempt to OCR the digit.

- **Backend Processing:** The image snapped is sent to a backend for processing (if using a heavier ML model or OCR). We'll deploy serverless functions using Supabase Edge Functions (Deno/TypeScript-based) for this. The backend can use a small TensorFlow model or an OCR library to identify the material code. Edge Functions are ideal here as they let us quickly deploy code without managing infrastructure, and they scale automatically – so we can get our image-processing API up within the hack timeframe [supabase.com/docs/guides/functions].

- **Guidance & Info:** Once the item type is determined (e.g. plastic #5, or "paper" or "glass bottle"), the app looks up the recycling instructions and CO₂/energy savings for that type. We will compile a tiny reference dataset (e.g., "Plastic #1 (PET) – recyclable in most curbside programs; ~1.5 kg CO₂ saved per 10 items recycled" etc., drawn from sources like London Recycles or EPA). This info can be hard-coded or stored in a small database.

- **Supabase Storage (Image Storage):** We will store user photos (the taken images and verification shots) in Supabase Storage, which provides secure file storage with built-in access controls [supabase.com/docs/guides/storage]. When a user snaps a photo, the app can upload it directly using the Supabase JS client library (`supabase.storage.from('photos').upload(...)`) to a storage bucket. This keeps images off the device and accessible for later review or for machine learning processing. Supabase Storage integrates seamlessly with Supabase Auth (so only authenticated users can upload) and offers a generous free tier (1 GB), which is perfect for a hack project storing images.

- **Database:** To track user points, profiles, and recycled items, we use Supabase's built-in PostgreSQL database. Supabase provides a fully managed Postgres instance with a generous free tier (500 MB), saving us setup time and providing reliability out-of-the-box. Our app can interact with the database directly through the Supabase client SDK or the auto-generated REST API (PostgREST), eliminating the need for custom ORM setup. We can use Row Level Security (RLS) policies to ensure users can only access their own data. Each recycling event (user ID, timestamp, item type, points awarded) is logged via simple Supabase queries. This means we don't worry about maintenance during the hack and get easy scalability and backups.

- **Frontend Implementation:** On the React Native side, we'll use Expo's Camera module for capturing photos. The UI will overlay a semi-transparent image (like a magical circle targeting reticle) to align the recycling symbol – making the experience immersive. Once the photo is taken and we receive the analysis from the backend, we display the result in an animated modal: e.g., an animation of a scroll unfurling with the text "Spell Success! This item is recyclable. You've earned +5 GHG points (≈0.2 kg CO₂ saved).". If the item is not recyclable, the app can respond with a friendly failure message, e.g., "Alas, this item is non-recyclable (a missed spell) – better to avoid such items or find a special drop-off." Throughout, the copy will maintain a magical tone (the user is addressed as an Eco-Wizard or apprentice).

**Magical Angle:** This core feature should feel like magic. We achieve that by making the scan instantaneous and somewhat mysterious – i.e., the user points their camera and as if by wizardry, the app knows the item's fate and environmental impact. This aligns with the "Magic!" track by turning a mundane task (checking recyclability) into an enchanting experience. We can draw inspiration from apps like Bower that turn recycling into a game akin to "Pokemon Go with a purpose," encouraging users to hunt for trash to recycle as if collecting creatures [plasticstoday.com]. In our app, the Recyclify Reveal spell is the star of the demo – it will appear to magically identify an object and reward the user, providing that wow factor for judges.

**Figure:** Prototype concept for the Recyclify Reveal spell. By simply pointing a smartphone camera at an item (here, a plastic cup), the app uses computer vision to identify its recyclability and calculate how much CO₂ can be saved by recycling it [plasticstoday.com]. This "scan and reward" mechanism forms the core magical loop of EcoWizard.

## Secondary Feature 1: Energy Usage Tracker (Energy Spell)

**Spell Name:** WattSaver Charm (Energy Conservation Spell)

**User Flow:** The user can perform the WattSaver Charm spell by entering data about their home energy usage or by logging energy-saving actions. For simplicity, the app will present a quick form or wizard (the UI theme could be a crystal ball or glowing orb where the user "inputs" their energy). For example, a user can input their monthly electricity consumption in kWh (from their energy bill) or check off daily actions like "Turned off lights for an hour" or "Adjusted thermostat by -2°F." Upon submitting, the app calculates the approximate GHG emissions associated with that energy use and how much they've saved compared to a baseline. The user is then shown a magical feedback message. For instance: "Energy Spell cast! You used 200 kWh this month, emitting ~100 kg CO₂. That's 10% lower than last month – +20 GHG points!" If the user manually logs an action (like skipping a dryer cycle or using cold water laundry), the app can give a small points reward and equivalence (e.g., "Line-drying clothes saved 2 kg CO₂ – +2 points"). The interface can visualize progress with a "mana bar" filling up as they save energy, and perhaps an avatar (a friendly wizard familiar) congratulating them.

**Environmental Logic:** Electricity and heating are major sources of emissions, so tracking and reducing home energy has clear community benefit. We frame it as a spell that guards the community from energy waste. The app uses average conversion factors (e.g., ~0.82 lbs CO₂ per kWh for the US grid [epa.gov]) to translate kWh saved into CO₂. For example, if a user reduced their usage by 50 kWh from last month, that's roughly 20–25 kg CO₂ avoided, which could yield say 25 points. Even if exact precision isn't achieved, we give ballpark figures to maintain clarity of impact. The focus is on encouraging incremental improvement: the app might show a comparison of the user's current usage to past usage or to a community average, highlighting any reduction as a "victory." This feature is high-impact but simple: it's essentially data input and display, with big potential impact if users follow through by conserving energy (lower bills, lower emissions).

**Technical Implementation:** The WattSaver feature is straightforward to implement in React Native:

- We will create a form component for inputting numeric values (for monthly kWh, water usage, etc., depending on scope) and toggles for simple actions. No complex sensors or integrations are needed – manual input avoids spending hack time on external API hookups to utility accounts.

- Once the user inputs data, calculations are done instantly on the device (a few multiplication factors for CO₂). This doesn't require a backend call, though we may still log the data to the backend/DB for persistence and future use.

- The results and points assignment can be handled in-app. We might define a simple points formula (e.g., 1 point per 1 kg CO₂ saved from baseline, or some creative scaling).

- The user's history of energy data can be visualized with a chart. Using a library like Victory Native or React Native Charts, we can display a quick line or bar chart of past months. This helps the user see the magic of progress over time.

- If time permits, we can integrate this with the backend (store the readings in the database via a Supabase client call) so the data persists across logins/devices. Supabase's PostgreSQL database easily handles these records and syncs across devices for authenticated users.

- The magic theme can be infused by the UI/UX: for example, when the user enters their data and hits "Cast Spell," an animation of a glowing energy orb could appear, then shatter to reveal the results (like a prophecy). We can use Lottie files or simple Animated API for such effects.

- As a stretch, the AI assistant (if we include one) could provide tips after seeing the input – e.g., if the user's usage is above average, the assistant (a wise old wizard character) might pop up with advice like "Have you considered switching to LED bulbs? It could save you 10% energy – try this for bonus points!" However, given time constraints, this assistant would likely be a scripted behavior, not a fully dynamic AI.

**Community Benefit:** By helping users cut down energy, the app contributes to community-wide reductions in carbon footprint. If multiple people in a neighborhood use it, their combined energy savings reduce strain on the grid and pollution locally. We could mention these aggregate effects in the UI (e.g., "Your dorm saved 500 kWh this month in total – which prevents local emissions and maybe even brownouts"). This feature, while not as visually "magical" as the recyclify scan, is high-impact because energy use is a big piece of one's carbon footprint. It demonstrates to judges that our app isn't just about one gimmick – it's a platform for various eco-actions – yet it remains technically simple (mostly form logic and basic math).

## Secondary Feature 2: Food Donation Finder (Donation Spell)

**Spell Name:** Food Rescue Portal (Community Food Sharing Spell)

**User Flow:** The user casts the Food Rescue Portal spell when they have surplus food that might otherwise go to waste (for example, leftover groceries or a big batch of extra soup). In the app, this feature appears as a map or list of nearby donation points, framed magically as portals or sanctuaries. The user opens the spell, which might show an old-style map with twinkling markers indicating places to take food. The user's location (with permission) is used to find local food banks, community fridges, shelters, or charities that accept food donations. The user chooses one of the suggested locations (e.g., "Community Fridge at 5th Street" or "Athens Food Bank"). The app then provides brief directions or information (possibly opening Google Maps for navigation if needed) – in magical terms, "Opening portal to deliver nourishment…". After the user drops off the food, they can hit a "Donated!" button on the app, effectively completing the spell. The app rewards the user with GHG points and a gratitude message: "Spell cast! You prevented food waste and fed the community. +30 GHG points (food waste emits potent methane – you've helped avoid that!)". The points here can be relatively high to reflect the significant impact of avoiding food waste and helping others. We also display an impact statement, e.g.: "Donating this food instead of trashing it averted methane equal to ~50 kg CO₂!" – since food waste is a huge emitter globally. For context, food waste contributes ~8% of global greenhouse emissions [feedingamerica.org] (enough that if food waste were its own country, it'd be the third-largest emitter [earth.org]), so this action is framed as a major community service and climate action. The app might even show how many meals the donated food could provide, highlighting community benefit directly (e.g., "This could feed 5 people today!").

**Environmental & Community Impact:** This feature directly addresses community benefit (State Farm's track) because it connects users to local organizations, helping hungry neighbors. Environmentally, every bit of food kept out of landfill avoids methane emissions (which are 25× more potent than CO₂) [earth.org] and saves all the resources that went into producing that food. We make sure the user knows this: the UI can include a quick stat like, "Uneaten food in landfills = 8% of global emissions [feedingamerica.org]. Thank you for being part of the solution!" This clear tie between action and impact reinforces why their spellcasting matters. We keep it simple – the user doesn't have to input much, just select a location and confirm donation – to ensure it's fast and encouraging. In storytelling terms, the user is casting a spell of abundance, turning potential waste into a blessing for the community.

**Technical Implementation:** This feature can be implemented with minimal overhead:

- We will utilize an API or dataset to find nearby donation centers. The easiest method is to use the Google Places API (or Google Maps API) with queries like "food bank", "soup kitchen", "community fridge" near the user's location. During the hack, we can obtain an API key and make simple REST calls from the app to fetch a list of names/addresses. If API usage is an issue or time-consuming, we can hard-code a few known local options (especially if demoing in a specific city, e.g., Athens, GA, we could preload 3-4 local charity addresses).

- We'll display the locations either on a map view (Expo/React Native has MapView components) or a scrollable list. Given 48 hours, a list with distance info might be simplest, but a map with magical-style map markers (icons like a little castle or heart) would be visually nice if time permits.

- No complex backend is needed for this; the data can be fetched client-side. However, if we want to store the fact that a user made a donation, we could send a record to our backend (similar to recycling events) to add points and perhaps verify later. For demo purposes, it might be enough to simulate the donation confirmation.

- A Supabase Edge Function could serve as a small proxy service if we decide to, say, proxy the Google Places queries (to hide API keys) or to store new donation site suggestions in the database. But a direct API call from the app is fine if the key is restricted to certain domains.

- After the user hits "Donated!", the app will increment their points. This logic can be local (optimistically update points on the client) and also sent to the server to update their total in the DB. We should include this in the same user points table as recycling and energy, with an action type "donation" and points.

- The magical UI touches here include possibly an illustration of a door or portal opening when the user selects a location (could simply be a nice transition or sound), and maybe a cute animation when they confirm donation (like coins or hearts flying upward indicating points and goodwill).

- We will also ensure to handle the case if no nearby locations are found (e.g., show a message "No portal found – but fear not, you can directly call local shelters. Consider sharing with a neighbor in need!"). But for the demo, we'll ensure at least one location shows up (by using a known address or mock).

**Note:** This feature stands out to judges because it combines tech with direct social good – it's not just calculating carbon, it's physically helping people. We emphasize that in our presentation: this is where our app goes beyond self-oriented gamification to community-oriented impact. It shows we thought about State Farm's brief ("product that will benefit your community" [ugahacks-8.devpost.com]). The magic theme also shines here as we metaphorically turn waste into sustenance, which is quite a magical transformation in real life!

## Magical Theme & UX Design

One of EcoWizard's differentiators is its Magic-themed interface and storytelling. We design every feature to feel like part of a fantasy adventure, without sacrificing clarity of impact. Here's how we integrate the theme in the UX:

- **Visual Design:** The app's look-and-feel is inspired by spellbooks and RPG games. The home screen might be a "spellbook" with a list of available spells (features). Each core feature is labeled as a spell with an icon (e.g., a recycle symbol intertwined with a wand for Recyclify Reveal, a lightning bolt for WattSaver Charm, and a loaf of bread or helping hand for Food Rescue Portal). We use a parchment-like background, mystical fonts (readable but themed), and a lot of gold/emerald accent colors to evoke magic and ecology. Feedback and pop-ups are presented on scrolls or in potion-bottle-shaped modals. However, we will ensure text is easily readable and not too gimmicky – clarity is key for judges to quickly grasp what's happening.

- **Narrative & Terminology:** The app addresses the user as an aspiring wizard in the "Order of EcoMages" (for example). The tutorial or onboarding story can be: "Welcome, apprentice! Your mission is to save our community from the Climate Dragon by casting daily spells of sustainability." As they use features, we maintain this narrative voice. For instance, when the user recycles, the app might say "Brilliant! That plastic bottle has been transmuted into a new resource, sparing the air of foul fumes." This whimsy makes the experience enjoyable (aligning with the Magic track), but we always accompany it with the real impact numbers (like CO₂ saved, etc.) so the judges see that it's not just role-play, it's delivering facts. In essence, we sugar-coat the science with magic.

- **Feedback & Gamification:** We use common gamification elements re-skinned into the magic theme. Points are referred to as GHG points in descriptions, but we might also nickname them "Mana" or "Earth Mana" in the UI – implying that saving GHG is restoring magical energy to the earth. We show the user's level or rank – e.g., starting at "Novice" and progressing to "Archmage of Climate" as they accumulate points. We can set point thresholds for each rank (this is easy to implement with a static lookup or formula). A progress bar (maybe a magic wand filling up) can show how far to the next level. This encourages continuous use. Additionally, we propose a leaderboard or community goal (if time allows): for example, a screen that shows "All EcoWizards in your city have collectively saved X kg CO₂ this week" or "House Gryffindor (if we had teams) is leading with 5000 points." Even if we don't fully implement multi-user features, we can simulate or static-display a leaderboard to suggest the potential. This plays into community and competition, proven tactics in sustainability apps [medium.com] (many apps hold challenges to motivate users [medium.com]). If feasible, we might integrate a simple social sharing – e.g., after an action, allow the user to share a pre-generated image of their "spell" success to social media, spreading awareness in a fun way.

- **Clarity of Impact:** Despite the fantasy trappings, we make sure every spell clearly shows cause-and-effect in real-world terms. The UI will display metrics (CO₂, kWh, liters water, etc.) whenever possible. Icons or infographics can help – e.g., after recycling, show an icon of a factory with a downward arrow and "emissions -0.1kg". We want the judges to see that our design educates users subtly. The magical story grabs attention, but the impact info retains credibility (important for judging).

- **Accessibility & Simplicity:** Even with a creative theme, we'll keep the interactions straightforward. Large buttons for "Cast Spell" (perform action), intuitive icons, and short instructions. We won't bury the user in text or complex multi-step flows. Each feature stands alone for ease (especially helpful in a rushed demo setting – we can jump to any feature quickly).

In summary, the magic theme is not just window-dressing – it's a motivational layer that turns sustainable habits into an engaging game. This approach can increase user engagement significantly, as people are more likely to continue "playing" a game than following a boring checklist. We combine this with the community angle (helping others is the ultimate "white magic" in our narrative) to create an emotional connection to the app's purpose.

## Technology Stack & Architecture

Below is the proposed tech stack, leveraging Supabase as our primary backend platform for a robust yet hackathon-friendly setup, *perform unit testing while developing to ensure components and features work correctly before implementing following steps*:

- **Frontend:** React Native (JavaScript/TypeScript) – likely using Expo for rapid development. This allows us to develop and deploy quickly to both iOS and Android from one codebase. We will use libraries like Expo Camera, perhaps Expo Location (for donation finder), and any UI kit needed (or just StyleSheet). The app state management can be minimal (Context or Redux if needed for points globally). Expo also eases using vector icons (for magical icons) and deploying a demo build to devices.

- **Backend:** Supabase handles most of our backend needs out-of-the-box. For simple CRUD operations (recording energy usage, logging user actions, updating points), we use Supabase's auto-generated REST API (PostgREST) – no custom server code needed. For more complex logic like image analysis, we deploy Supabase Edge Functions (Deno/TypeScript serverless functions) with endpoints such as `analyze-recycle` (for image analysis) and `donation-sites` (to fetch nearby donation locations). Edge Functions deploy via the Supabase CLI with minimal config and scale automatically [supabase.com/docs/guides/functions]. This saves time on DevOps and ensures we can iterate quickly during the hack. The free tier is generous enough for our hackathon needs.

- **Object Storage:** Supabase Storage – used for storing images (photos of recyclables and verification). The React Native app uploads directly to Supabase Storage using the `@supabase/supabase-js` client library, which handles authentication and file management seamlessly. We can configure storage buckets with Row Level Security policies so each user can only access their own uploads. Storing images in Supabase Storage offloads that burden from our frontend and allows us to serve them later if needed (e.g., if we had a feature to review past actions or for judges to see the stored proofs). This integrates natively with the rest of our Supabase stack.

- **Database:** Supabase PostgreSQL Database. We'll have tables like Users (id, email, name, avatar_url, total_points, level, etc.), Actions (id, user_id, type [recycle/energy/donate], timestamp, details, points_awarded), and perhaps Leaderboard or Locations. Supabase provisions a full Postgres instance instantly – we get a connection string and can also interact via the auto-generated REST API or the JS client library (`supabase.from('actions').insert(...)`) with zero ORM setup. We'll use Row Level Security (RLS) policies to ensure data isolation per user. The DB handles our simple transactions easily, and we get the benefit of durability and easy scaling beyond the hackathon. Supabase also provides a built-in Table Editor UI for quickly inspecting and managing data during development.

- **External APIs & Libraries:**
  - **Image Recognition/OCR:** Possibly using an external service for convenience – e.g., Google Cloud Vision for text detection (to read recycling codes) or a small ML model hosted on our backend. Since integration of heavy ML in React Native might be tricky, the backend approach is safer. We could explore using TensorFlow.js on the backend to load a pre-trained model for classifying recycle symbols (the EcoSnap hack used a TensorFlow model via serverless functions [alyssax.substack.com]). Another lightweight trick: use an open-source model for general object recognition (e.g., MobileNet) to guess the material (bottle, can, paper) – not as precise for recyclability specifics, but could identify obvious items.
  - **Maps/Places:** Google Maps API for location search (for donation sites). Alternatively, use a public dataset or simple stored list if API integration is an issue. If using Google, we'll restrict to minimal calls. A Map view may require an API key for the map SDK (could use Mapbox as alternative if needed).
  - **Animations/UI:** Lottie for any complex animations (there are existing JSON animations for magical effects), React Native Animatable for quick transitions, etc. These make the app look polished with little effort.
  - **Auth:** We will use Supabase Auth for user sign-up and login. Supabase Auth supports email/password, magic link (passwordless), and social OAuth providers (Google, GitHub, etc.) out-of-the-box with minimal configuration. The `@supabase/supabase-js` SDK provides ready-made methods (`supabase.auth.signUp()`, `supabase.auth.signInWithPassword()`, etc.) that integrate directly with our React Native app. Auth sessions are automatically managed, and authenticated users' IDs are available in Row Level Security policies to protect per-user data. See the **User Authentication (Sign Up / Log In)** section below for full implementation details.

- **Architecture Diagram:** (If describing to judges, we can outline) The mobile app (React Native) talks directly to Supabase for auth, database queries, and file storage using the `@supabase/supabase-js` client. For complex processing (image analysis), the app invokes Supabase Edge Functions, which can call external ML APIs and write results back to the database. External APIs (vision, maps) are called by either the app or Edge Functions as appropriate. This modular approach keeps the client light and leverages Supabase's unified platform for all backend needs – auth, database, storage, and serverless functions in one place.

(Optional for documentation: diagram explanation, but since we cannot easily embed a custom diagram here, we verbally convey it.) For instance: Mobile App → (auth) → Supabase Auth; Mobile App → (upload image) → Supabase Storage; Mobile App → (invoke function) → Supabase Edge Function → ML model or API to analyze → Edge Function saves record to Supabase DB → returns response to App → App updates UI. For simple data operations: Mobile App → (direct query) → Supabase DB (via PostgREST). For fetching donation locations: App → Google API (or Edge Function as proxy) → returns locations → App displays, etc.

This tech stack is reasonable for 3 people in 2 days: one can focus on the React Native front-end and auth flows, another on setting up Supabase (database schema, Edge Functions, ML integration), and the third can assist with data (points logic, content like recycling info) and polishing UI/UX (making those magic animations, writing the storyline text). Using Supabase as a unified platform minimizes "plumbing" work – one dashboard for auth, database, storage, and serverless functions – letting us concentrate on core features.

## User Authentication (Sign Up / Log In)

User accounts are essential for persisting GHG points, tracking action history, and enabling the leaderboard. We use **Supabase Auth** to implement sign up and log in with minimal effort. Supabase Auth provides a full authentication system (JWT-based sessions, secure password hashing, email verification, OAuth) that integrates directly with our Supabase database and Row Level Security policies.

### Implementation Steps

**Step 1: Supabase Project Setup**

1. Create a free Supabase project at [supabase.com](https://supabase.com).
2. From the project dashboard, copy the **Project URL** and **anon (public) API key** – these are needed to initialize the Supabase client in our React Native app.
3. In the Supabase dashboard under **Authentication → Providers**, enable the desired sign-in methods:
   - **Email/Password** (enabled by default) – users register with email and password.
   - **Magic Link** (optional) – passwordless login via email link; great for a quick, frictionless experience.
   - **OAuth Providers** (optional) – enable Google and/or GitHub OAuth for one-tap social sign-in. This requires adding OAuth credentials (client ID/secret) from the respective provider's developer console.

**Step 2: Install Dependencies**

Install the Supabase client library and a secure storage adapter for React Native sessions:

```bash
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage
```

**Step 3: Initialize the Supabase Client**

Create a `lib/supabase.ts` file to configure the Supabase client with session persistence:

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://YOUR_PROJECT_REF.supabase.co';
const supabaseAnonKey = 'YOUR_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // important for React Native (no browser URL)
  },
});
```

**Step 4: Build the Sign Up Screen**

Create a themed sign-up screen (styled as "Join the Order of EcoMages"). The core logic:

```typescript
import { supabase } from '../lib/supabase';

const handleSignUp = async (email: string, password: string, wizardName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { wizard_name: wizardName }, // stored in user metadata
    },
  });

  if (error) {
    Alert.alert('Spell Failed', error.message);
    return;
  }

  // Optionally create a profile row in the 'profiles' table
  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      wizard_name: wizardName,
      total_points: 0,
      level: 1,
      title: 'Novice EcoMage',
    });
  }

  Alert.alert('Welcome, Apprentice!', 'Check your email to verify your account.');
};
```

The UI should include:
- A text input for **Wizard Name** (display name)
- A text input for **Email**
- A secure text input for **Password**
- A "Join the Order" (Sign Up) button styled as a magical parchment button
- A link to navigate to the Log In screen ("Already an EcoMage? Log in")

**Step 5: Build the Log In Screen**

Create the login screen (styled as "Enter the Sanctum"). The core logic:

```typescript
const handleLogin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    Alert.alert('Access Denied', error.message);
    return;
  }

  // Session is now active – navigate to home screen
};
```

For **social OAuth login** (e.g., Google), use:

```typescript
const handleGoogleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  // This opens a browser for OAuth flow and redirects back to the app
};
```

**Step 6: Session Management & Auth State Listener**

In the app's root component (e.g., `App.tsx`), listen for auth state changes to conditionally render either the Auth screens or the main app:

```typescript
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check for existing session on app load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return session ? <MainApp session={session} /> : <AuthScreens />;
}
```

**Step 7: Log Out**

Add a log-out button (styled as "Leave the Sanctum") in the user profile or settings screen:

```typescript
const handleLogout = async () => {
  await supabase.auth.signOut();
  // The onAuthStateChange listener will automatically update the UI
};
```

**Step 8: Database Schema & Row Level Security (RLS)**

Set up the database tables and security policies in the Supabase SQL Editor:

```sql
-- Profiles table (extends the auth.users table)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  wizard_name TEXT NOT NULL,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  title TEXT DEFAULT 'Novice EcoMage',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Actions table (logs all eco-actions)
CREATE TABLE actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('recycle', 'energy', 'donate')),
  details JSONB,
  points_awarded INTEGER NOT NULL,
  image_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only read/write their own data
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own actions"
  ON actions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own actions"
  ON actions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leaderboard: allow all authenticated users to see all profiles (read-only for leaderboard)
CREATE POLICY "All users can view leaderboard data"
  ON profiles FOR SELECT USING (auth.role() = 'authenticated');
```

**Step 9: Protect Storage Buckets**

Configure a Supabase Storage bucket for user photos with auth-based access:

1. In the Supabase dashboard, create a bucket called `photos` (set to private).
2. Add a storage policy so users can only upload to their own folder:

```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to view their own photos
CREATE POLICY "Users can view their own photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

Upload photos from the app like this:

```typescript
const uploadPhoto = async (uri: string, userId: string) => {
  const fileName = `${userId}/${Date.now()}.jpg`;
  const response = await fetch(uri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from('photos')
    .upload(fileName, blob, { contentType: 'image/jpeg' });

  return data?.path;
};
```

**Step 10: Integrate Auth with Existing Features**

Once auth is set up, integrate it into the existing spells:
- **Recyclify Reveal:** After the user confirms recycling, log the action to the `actions` table with `user_id` from `session.user.id`, and increment `total_points` in the `profiles` table.
- **WattSaver Charm:** Same pattern – log energy readings and award points tied to the authenticated user.
- **Food Rescue Portal:** Log donations and points to the authenticated user's profile.
- **Leaderboard:** Query the `profiles` table ordered by `total_points` DESC to display the community rankings.

### Magical Theme for Auth Screens

- The **Sign Up** screen is themed as a "Wizard Enrollment Scroll" – the background could be a parchment texture with the app's crest, and the form fields are styled as enchanted input fields with subtle glow effects.
- The **Log In** screen is themed as "Entering the Sanctum" – perhaps a door-opening animation plays when credentials are accepted.
- **Validation errors** are styled as "spell failures" with playful messages (e.g., "Your password incantation must be at least 6 characters").
- After successful sign-up, a brief onboarding animation welcomes the user as a "new apprentice" in the Order of EcoMages.

## Pitch Script and Demo Flow

To effectively pitch EcoWizard to judges, we will deliver a concise, story-driven demo that highlights the magic, the tech, and the impact. Below is a sample pitch script and demo flow:

1. **Introduction (Pitch Opening):** "Good afternoon, we are Team EcoWizard. Imagine if fighting climate change was as fun as casting spells in a fantasy game. With EcoWizard, we make everyday eco-actions magical – and impactful – for our community. Our app aligns with UGAHacks' Magic theme by turning users into climate wizards, and with State Farm's community benefit track by driving real positive change in our local environment." (As we say this, we show the app's title screen on the projector: a whimsical title "EcoWizard" with earth and magic visuals.)

2. **Feature Demo – Recyclify Reveal:** "Let's show you a spell. Here I have a plastic bottle – normally trash. But watch as I use EcoWizard to cast the Recyclify Reveal spell!" (We navigate to the recycle feature in the app. The phone camera opens; we point it at the plastic bottle's recycling symbol.) "The app instantly identifies the item… and voilà!" (On screen, the app displays: "Plastic Bottle – Recyclable! Properly recycling this saves ~0.05 kg CO₂. +5 points." with a celebratory animation.) "It's like magic – the app recognized the bottle and even calculated how much greenhouse gas we save by recycling it. Now I'll confirm the spell…" (We tap 'Confirm Recycle' and maybe show a second photo of the bottle in a recycle bin.) "Spell cast! Those 5 points were added to my score. Think of these as climate 'experience points' – I'm earning my wizard levels by helping the planet."

   – (We explain briefly the tech behind this as part of the pitch: "Behind the scenes, our app used image recognition to read the recycling code [alyssax.substack.com] and a knowledge base to fetch recycling info [plasticstoday.com]. We even store a proof photo to keep users honest. All of this is built with React Native and Supabase – handling auth, database, storage, and serverless functions in one platform – so it works fast and scales to many users." While explaining, we can flash a quick architecture graphic or the Supabase logo to hint at our implementation, but keep focus on the demo.)

3. **Feature Demo – WattSaver Charm:** "Next, let's try an energy spell. This one helps me track and reduce my home energy use." (Navigate in app to Energy feature.) "Here I can enter my electricity usage for the month. My bill says 300 kWh – not great, so I'll cast the WattSaver Charm to see my impact." (Enter 300 and submit. The app shows an output: "300 kWh = 135 kg CO₂ emitted. Let's aim lower next time! (No points this time, try reducing usage.)" perhaps.) "It looks like I used enough energy to emit 135 kilos of CO₂ – that's like burning through a small forest's monthly CO₂ absorption. The app encourages me to save more. If I drop my usage, I'll earn points. For example, if I enter 250 kWh for next month…" (We simulate quickly entering a lower number.) "…I'd get maybe 10 points for that improvement. It's a simple tracker, but by giving it a magical spin and reward, I'm more motivated to conserve power." (We could mention: "We've based these calculations on real emissions data (≈0.82 lbs CO₂ per kWh [epa.gov]), so users learn as they play.")

4. **Feature Demo – Food Rescue Portal:** "Finally, one of our favorite spells: Food Rescue Portal. This one has big community impact." (Open the donation feature.) "Suppose I have extra food after a campus event. Instead of tossing it, I open the Food Rescue spell. It uses my location to find nearby food banks and community fridges." (We show the list/map of donation sites.) "It looks like there's a community fridge 1 mile away. I select it, and EcoWizard navigates me there." (We pretend to select and show a detail.) "Now I drop off my food – that's real people fed and less waste. I hit 'Donated!' to complete the spell." (Tap confirm. The app gives a success message: "Thank you! Food donated. +30 points. You prevented waste that would produce methane – truly a heroic spell!") "For context, food waste is a huge issue – if it were a country, it'd be the third largest emitter of greenhouse gases [earth.org]. By rescuing food, I not only reduce emissions, I help my neighbors. Our app makes it as easy as checking a map and gives you a feel-good reward for doing the right thing."

5. **Community & Gamification:** (Now we show the profile/leaderboard screen.) "All these spells earn you GHG points. In the app, you can see your total points – I've got, say, 50 points now, which makes me a Level 2 Eco-Wizard." (On screen, show a profile with points and a title like "Level 2 – Climate Conjurer"). "We also have a friendly competition – you can see the community leaderboard." (Show a sample leaderboard with fictional names or perhaps team names if we made houses.) "People can compete or collaborate. For example, UGA could run a challenge to see which dorm diverts the most waste or saves the most energy – using our app to track it. We think this gamified approach can really drive engagement in sustainability."

6. **Technical Note (for judges):** "From a technology standpoint, EcoWizard is built to be feasible and scalable. We used React Native for the frontend, and integrated Supabase as our backend platform – providing user authentication, a PostgreSQL database, file storage for images, and Edge Functions for our AI logic – which means it's secure and can grow to thousands of users easily. Even in just 48 hours, we got a working prototype, thanks to Supabase's unified developer experience and some creative magic." (This part shows a production-ready architecture; we might briefly show the Supabase dashboard or mention how quick it was to set up.)

7. **Conclusion (Vision):** "In conclusion, EcoWizard turns climate action into a magical adventure. By incentivizing recycling, energy saving, and food donations, we empower individuals to make a difference daily. The magic theme isn't just for fun – it lowers the barrier for participation and education. Our community benefits from cleaner streets, less waste, and more solidarity. We believe EcoWizard can ignite the spark in many more 'wizard' citizens to protect our planet. Thank you!" (We end with a final slide of our app logo and tagline: "EcoWizard – Cast Spells. Save the World.")

During the demo, each team member can take a part (one narrating, one operating the app, etc.) to ensure smooth flow. We'll prepare the scenarios in the app beforehand (with some dummy data, e.g., have a bottle ready, ensure the donation list populates). The script above ensures we hit all key points: the magical interaction, the real impact numbers, the community benefit, and the use of sponsor technology. We also make it story-driven by following a user "journey" through spells, rather than just listing features. Judges should come away entertained, informed, and convinced that our app can make a positive impact in the community.

## Conclusion and Design Choices

EcoWizard is a hackathon project that finds the intersection of whimsy and impact. By focusing on a tight set of features we could realistically implement (one core scanning loop and two simple supporting tools), we ensured our 3-person team could build and polish a demo within 48 hours. Each feature was chosen for high-impact-to-effort ratio: scanning recyclables yields immediate visible magic and educational value, logging energy is trivial to code but reinforces long-term habit changes, and finding donation sites leverages existing infrastructure (maps) to produce real social good. We framed them as spells to fit the Hackathon's Magic theme, which guided our design from UI to language.

Crucially, every design decision was filtered through: Does this help the community or the environment clearly? If yes, we kept it, and if not, we cut it. For example, an AI assistant chat could be cool, but we realized it might distract from the core loop – so we minimized that idea in favor of straightforward spells. We emphasized clear impact (CO₂ numbers, etc.) in the UI so that even in a fanciful theme, the utility is never lost on the user or the judges.

By using Supabase as our backend platform, we demonstrated how a modern open-source BaaS (Backend-as-a-Service) can empower quick development of a community-oriented app – an app that could realistically be taken beyond the hackathon with its production-ready architecture. We also laid out a narrative that appeals to emotion (helping others, being a hero) and fun (casting spells, earning points), which can drive adoption.

In essence, EcoWizard is about making the fight against climate change feel attainable and magical for everyone. With one scan at a time, one habit at a time, and one shared challenge at a time, we turn individual actions into a collective spell of positive change in our community. We believe this approach can captivate users and inspire real-world impact, which is exactly the outcome a hackathon project should strive for.

## Citations

- Recycling Basics and Benefits | US EPA
  https://www.epa.gov/recycle/recycling-basics-and-benefits
- Recycling Basics and Benefits | US EPA
  https://www.epa.gov/recycle/recycling-basics-and-benefits
- How we built an AI recycling app in a week for a hackathon and won $11k
  https://alyssax.substack.com/p/we-built-an-ai-recycling-app-in-a
- AI-powered App Turns Smartphone Camera into Remarkable Recycling Resource
  https://www.plasticstoday.com/packaging/ai-powered-app-turns-smartphone-camera-into-remarkable-recycling-resource
- Supabase Documentation | The Open Source Firebase Alternative
  https://supabase.com/docs
- Supabase Auth | Authentication and Authorization
  https://supabase.com/docs/guides/auth
- Supabase Edge Functions | Serverless Functions
  https://supabase.com/docs/guides/functions
- Supabase Storage | File Storage
  https://supabase.com/docs/guides/storage
- AI-powered App Turns Smartphone Camera into Remarkable Recycling Resource
  https://www.plasticstoday.com/packaging/ai-powered-app-turns-smartphone-camera-into-remarkable-recycling-resource
- Greenhouse Gas Equivalencies Calculator
  https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator-calculations-and-references
- Food Waste in America: How You Can Help Rescue Food | Feeding America
  https://www.feedingamerica.org/our-work/reduce-food-waste
- How Does Food Waste Affect the Environment? | Earth.Org
  https://earth.org/how-does-food-waste-affect-the-environment/
- How Does Food Waste Affect the Environment? | Earth.Org
  https://earth.org/how-does-food-waste-affect-the-environment/
- UGAHacks 8: Create your own adventure - Devpost
  https://ugahacks-8.devpost.com/
- Ripple- App created at my first Hackathon. | by Harpekhna Mahajan. | Medium
  https://medium.com/@harpekhna/ripple-app-created-at-my-first-hackathon-3b8bbcdc30be
- How we built an AI recycling app in a week for a hackathon and won $11k
  https://alyssax.substack.com/p/we-built-an-ai-recycling-app-in-a
- How we built an AI recycling app in a week for a hackathon and won $11k
  https://alyssax.substack.com/p/we-built-an-ai-recycling-app-in-a
- How Does Food Waste Affect the Environment? | Earth.Org
  https://earth.org/how-does-food-waste-affect-the-environment/

### Sources

(for research and verification of concepts in our guide)

- Alyssa X, "How we built an AI recycling app in a week…" – on using image recognition of plastic codes for recycling advice [alyssax.substack.com].
- PlasticsToday, "AI-powered App Turns Smartphone Camera into Recycling Resource" – Bower app uses computer vision to identify recyclables and calculate CO₂ savings [plasticstoday.com].
- Earth.org, "How Does Food Waste Affect the Environment?" – food waste = ~8% of global emissions; if it were a country, it'd be 3rd largest emitter [earth.org].
- FeedingAmerica, "Fighting food waste through food rescue" – confirms 8% stat and highlights community benefits of food donation [feedingamerica.org].
- EPA, "Recycling Basics and Benefits" – recycling 10 plastic bottles saves energy to power a laptop for 25 hours [epa.gov]; recycling & composting saved 193 million tons CO₂e in 2018.
- UGAHacks 8 Sponsor Challenge – State Farm: community benefit focus [ugahacks-8.devpost.com].

### All Sources

epa · alyssax.substack · plasticstoday · supabase · medium · feedingamerica · earth · ugahacks-8.devpost
