# TripUp AI — Intelligent 3D Travel Planning Platform

**Brand Name:** TripUp AI  
**Tagline:** Your journey, intelligently planned.  
**Product Type:** 3D Travel Discovery and AI Itinerary SaaS Platform  

TripUp AI combines interactive Three.js 3D world exploration with Google Gemini AI itinerary generation, budget & expense management, ordered map routes, meteorological intelligence, and collaborative trip sharing.

---

## 🌟 Core Capabilities

1. **Procedural 3D Travel Archipelago & Landmarks**:
   - Engineered with Three.js using composite 3–12 part procedural models (`THREE.Group`): Kyoto Pagoda (vermilion lacquer, tiered roofs, golden spire, torii gate), Eiffel Tower, Alpine Peak with glistening snow cap, Tropical Atoll Island with thatched stilt bungalow, Mediterranean Amalfi Villa, Coastal Lighthouse with rotating beam, and circling Traveler Airplane.
   - Studio PBR lighting rig (`RoomEnvironment`, warm directional key light `#fff1d6` with soft PCF shadows, cool `HemisphereLight`, horizon fog).
   - Zero-404 external asset dependencies: all surfaces, water wave caustics, and terrain contours are procedurally generated via HTML5 2D Canvas textures.
   - Paced loop & software-WebGL detection (`isSoftwareGl`) with `afterDraw` synchronization for smooth headless and GPU-less rendering.
   - Viewport-first collapsible bottom control dock with landmark pills, Golden Hour / Midday / Twilight atmosphere switcher, and pause/play controls.

2. **Google Gemini AI Itinerary Engine**:
   - Integrated with `@google/genai` (model: `gemini-3.8-flash` or configurable `GEMINI_MODEL`).
   - Server-side structured JSON schemas validated via Zod.
   - Non-overlapping sequential daily timeline: morning, afternoon, and evening activities with verified addresses, duration minutes, estimated costs, and categories.
   - Resilient fallback generation with deterministic smart engine when API key is unconfigured.

3. **Multi-Step Trip Architect Wizard (6 Steps)**:
   - Step 1: Destination & Origin with suggestions.
   - Step 2: Travel dates, traveler party count, and travel pace (Relaxed, Balanced, Fast-Paced).
   - Step 3: Target budget & currency selection (USD, EUR, GBP, JPY, INR, CHF, AUD) and preset tiers.
   - Step 4: Passions & Interests (Culture, Heritage, Nature, Food, Relaxation, Adventure, Architecture, Shopping).
   - Step 5: Mobility preferences (Walking, Public Transit, Rail, Driving) and Stay styles.
   - Step 6: Review & AI generation with step-by-step progress feedback.

4. **Interactive Itinerary Detail & Schedule Editor**:
   - Daily timeline with drag/move reordering, inline editing, add custom activity modal, and delete options.
   - Automatic schedule conflict detection preventing overlapping activities.
   - Verified venue indicators and address mapping.

5. **Budget & Expense Management**:
   - Allocated budget ceiling vs. recorded actual spending.
   - Itemized expense tracking (Add, Edit, Delete expenses with category tags).
   - Real-time progress bar, surplus calculations, and category breakdown.

6. **Climate & Meteorological Intelligence**:
   - Live temperature, condition, humidity, wind velocity, and precipitation probability for travel destinations.
   - TripUp AI packing advice and daily forecast horizons.

7. **Companions & Shared Trips**:
   - Role-based permissions (Owner, Editor, Viewer).
   - Shareable invite tokens with one-click copy and print-friendly export summaries.

8. **User Dashboard & Saved Favorites**:
   - Welcome profile hub with statistics (Total trips, budget managed, activities planned, saved favorites).
   - Tabs for All, Upcoming, Drafts, and Archived journeys.
   - One-click trip duplication and secure deletion with confirmation modal.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React icons.
- **3D Rendering:** Three.js, RoomEnvironment, PMREMGenerator, procedural CanvasTextures.
- **Backend Server:** Express full-stack server running Vite middlewares in dev (`tsx server.ts`).
- **AI Engine:** Google Gemini AI with `@google/genai` SDK (`gemini-3.8-flash`).
- **Validation:** Zod schemas for activities, itinerary days, expenses, trips, and member roles.
- **Testing:** Node.js built-in test runner (`node:test` and `node:assert/strict`) executed via `npx --yes tsx --test`.

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js 20+ installed
- npm or pnpm

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Configure:
```dotenv
# Google Gemini API key (Injected automatically in AI Studio)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash

# Optional: Supabase & Maps keys
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Running the Dev Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 5. Running Automated Unit Tests
```bash
npx --yes tsx --test src/lib/trip-logic.test.ts
```

### 6. Production Build
```bash
npm run build
npm start
```
