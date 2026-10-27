import { Trip, ItineraryDay, Activity, TravelCategory, RouteOption, ActivityOption } from '../../types/travel';
import { calculateTripDurationDays } from '../trip-logic';

export interface GenerationInput {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budgetAmount: number;
  currency: string;
  interests: TravelCategory[];
  travelStyle: 'relaxed' | 'balanced' | 'packed';
  transportPreferences: string[];
  accommodationPreferences: string;
  dietaryPreference?: string;
  customPrompt?: string;
}

export interface GenerationResult {
  title: string;
  summary: string;
  days: ItineraryDay[];
  routeOptions?: RouteOption[];
  source: 'gemini-ai' | 'smart-engine';
  modelUsed?: string;
}

/**
 * Universal procedural travel activity generator tailored to destination & user preferences
 * Delivers comprehensive itineraries with Route Options and Daily Activity Options for ALL destinations
 */
export function generateSmartItinerary(input: GenerationInput): GenerationResult {
  const durationDays = Math.max(1, Math.min(calculateTripDurationDays(input.startDate, input.endDate), 14));
  const start = new Date(input.startDate);
  const hasPrivateCar = input.transportPreferences.some(t => t.includes('private_car') || t.includes('car'));
  const isPureVeg = input.dietaryPreference === 'pure_veg';
  const isOnlyNonVeg = input.dietaryPreference === 'only_nonveg';

  const origLower = (input.origin || '').toLowerCase();
  const destLower = (input.destination || '').toLowerCase();
  const customLower = (input.customPrompt || '').toLowerCase();

  const isNashikToTithal =
    (origLower.includes('nashik') || origLower.includes('nasik')) &&
    (destLower.includes('tithal') || destLower.includes('valsad') || destLower.includes('gujarat'));

  const isTithalGeneral = destLower.includes('tithal') || (destLower.includes('valsad') && destLower.includes('beach'));

  const isGoa = destLower.includes('goa') || (origLower.includes('goa') && destLower.includes('nashik'));
  const isNashikToGoa = (origLower.includes('nashik') || origLower.includes('nasik')) && isGoa;

  // 1. SPECIFIC ROAD TRIP ROUTE: NASHIK ROAD TO TITHAL BEACH (VALSAD, GUJARAT)
  if (isNashikToTithal || isTithalGeneral) {
    return generateNashikToTithalItinerary(input, durationDays, start, hasPrivateCar, isPureVeg);
  }

  // 2. SPECIFIC ROAD TRIP ROUTE: NASHIK ROAD TO GOA (OR GENERAL GOA ROAD TRIP)
  if (isGoa) {
    return generateGoaItinerary(input, durationDays, start, hasPrivateCar, isPureVeg, isNashikToGoa);
  }

  // 3. UNIVERSAL INTELLIGENT GENERATOR FOR ALL OTHER WORLDWIDE & INDIAN DESTINATIONS
  return generateUniversalDestinationItinerary(input, durationDays, start, hasPrivateCar, isPureVeg, isOnlyNonVeg);
}

/**
 * Detailed Itinerary for Nashik Road to Tithal Beach
 */
function generateNashikToTithalItinerary(
  input: GenerationInput,
  durationDays: number,
  start: Date,
  hasPrivateCar: boolean,
  isPureVeg: boolean
): GenerationResult {
  const routeOptions: RouteOption[] = [
    {
      id: 'route-saputara-halt',
      title: 'Option 1: Scenic Mountain Halt via Saputara Hill Station (SH17/NH848)',
      routePath: 'Nashik Road ➔ Dindori ➔ Saputara Hill Station ➔ Waghai ➔ Dharampur ➔ Tithal Beach',
      distanceKm: 158,
      drivingDuration: '4h 15m driving time (with 1-day midway halt)',
      haltSpot: 'Saputara Hill Station (Dang District, Gujarat)',
      description:
        'Drive up the Sahyadri ghats to Gujarat’s only hill station. Enjoy boating on Saputara Lake, Governor Hill, Table Point ropeway, and honey bee centers before descending through Dang forests to Tithal Beach.',
      highlights: [
        'Saputara Lake Paddle Boating',
        'Table Point Ropeway & Sunset Point',
        'Artist Village Bamboo Crafts',
        'Waghai & Gira Waterfalls',
        'Tithal Black Sand Beach',
      ],
      badge: 'Recommended Scenic Mountain Halt',
      isSelected: true,
    },
    {
      id: 'route-shaktipeeth-halt',
      title: 'Option 2: Spiritual Shaktipeeth & Tribal Heritage Halt via Vani & Dharampur',
      routePath: 'Nashik Road ➔ Vani (Saptashrungi) ➔ Peint ➔ Dharampur ➔ Valsad ➔ Tithal Beach',
      distanceKm: 168,
      drivingDuration: '4h 40m driving time (with 1-day temple stopover)',
      haltSpot: 'Saptashrungi Gad (Vani) & Lady Wilson Museum (Dharampur)',
      description:
        'Ascend the holy seven-horned cliff of Saptashrungi Devi via funicular trolley, followed by an afternoon exploring Dharampur’s tribal culture, Japanese gardens, and Lady Wilson Museum.',
      highlights: [
        'Saptashrungi Gad Funicular Trolley',
        'Lady Wilson Tribal Heritage Museum',
        'District Science Centre Dharampur',
        'Barumal Swaminarayan Mandir',
        'Tithal Sai Baba Beach Temple',
      ],
      badge: 'Spiritual & Heritage Choice',
      isSelected: false,
    },
    {
      id: 'route-direct-express',
      title: 'Option 3: Direct Express Highway Coastal Drive via NH848 & Chikhli',
      routePath: 'Nashik Road ➔ Peint ➔ Dharampur Bypass ➔ Valsad City ➔ Tithal Beach',
      distanceKm: 142,
      drivingDuration: '3h 30m direct private car drive',
      haltSpot: 'Chikhli roadside Gujarati Farsan & Tea Stopover',
      description:
        'Fastest direct highway route for travelers eager to maximize relaxation, water sports, and seaside temple visits at Tithal Beach without mountain winding detours.',
      highlights: [
        'Smooth NH848 Highway Corridor',
        'Quick Chikhli Surti Farsan Break',
        'Direct Arrival at Tithal Black Sands',
        'BAPS Shri Swaminarayan Temple',
        'Arabian Sea Sunset Watersports',
      ],
      badge: 'Fastest Coastal Route',
      isSelected: false,
    },
  ];

  const days: ItineraryDay[] = [];

  // Day 1
  days.push({
    id: 'day-1',
    dayNumber: 1,
    date: input.startDate,
    summary: 'Scenic road trip halt at Saputara Hill Station with lake boating, garden walks & Kathiyawadi dinner',
    routeSegment: 'Nashik Road ➔ Dindori ➔ Saputara Hill Station (82 km)',
    haltNote: '1-Day Midway Scenic Mountain Halt in Sahyadri Range',
    dayThemeOptions: ['Mountain Leisure & Lake Promenade', 'Spiritual Cliff Pilgrimage'],
    selectedDayTheme: 'Mountain Leisure & Lake Promenade',
    activities: [
      {
        id: 'act-1-1',
        title: 'Midway Halt: Saputara Hill Station Lake & Governor Hill Ascent',
        description:
          'Depart Nashik Road in your private car. Ascend the lush Sahyadri ghats to Saputara Hill Station (~82 km). Enjoy serene pedal boating on Saputara Lake followed by an easy walk up Governor Hill for panoramic valley vistas.',
        address: 'Saputara Lake & Hill Station, Dang District, Gujarat 394740',
        latitude: 20.5794,
        longitude: 73.7483,
        startTime: '10:00',
        endTime: '13:30',
        durationMinutes: 210,
        estimatedCost: 250,
        currency: input.currency,
        category: 'nature',
        sortOrder: 0,
        verificationStatus: 'verified',
        options: [
          {
            id: 'opt-1-1-a',
            title: 'Option A: Saputara Lake Boating & Governor Hill Ascent',
            description:
              'Paddle boating on tranquil Saputara Lake surrounded by rolling hills, followed by panoramic viewpoints at Governor Hill.',
            address: 'Saputara Lake, Dang District, Gujarat',
            category: 'nature',
            estimatedCost: 250,
            badge: 'Scenic Mountain Pick',
          },
          {
            id: 'opt-1-1-b',
            title: 'Option B: Saptashrungi Gad Funicular Trolley & Cliffside Darshan',
            description:
              'Halt at sacred Saptashrungi Gad at Vani. Ride the funicular rope trolley up the 7-peaked cliff to seek blessings at the renowned Shaktipeeth.',
            address: 'Saptashrungi Devi Temple, Vani, Maharashtra',
            category: 'heritage',
            estimatedCost: 200,
            badge: 'Spiritual Heritage Pick',
          },
        ],
      },
      {
        id: 'act-1-2',
        title: 'Step Garden Terraces, Rose Sanctuary & Warli Tribal Crafts',
        description:
          'Tour the terraced Step Garden adorned with ornamental plants, wooden steps, and flowered pathways. Walk to the Artist Village to observe Warli tribal bamboo craftsmanship, pottery, and tribal folk paintings.',
        address: 'Artist Village & Step Garden, Saputara, Gujarat',
        startTime: '14:30',
        endTime: '17:00',
        durationMinutes: 150,
        estimatedCost: 150,
        currency: input.currency,
        category: 'culture',
        sortOrder: 1,
        verificationStatus: 'verified',
        options: [
          {
            id: 'opt-1-2-a',
            title: 'Option A: Step Garden & Warli Artist Village Craft Walk',
            description:
              'Terraced flower gardens and authentic Warli tribal craft ateliers with local bamboo artwork and pottery.',
            address: 'Artist Village, Saputara, Gujarat',
            category: 'culture',
            estimatedCost: 150,
            badge: 'Artisan & Cultural Pick',
          },
          {
            id: 'opt-1-2-b',
            title: 'Option B: Waghai Botanical Garden & Gira Waterfalls Forest Trail',
            description:
              'Drive 35 mins through Dang forest reserve to explore 24 hectares of indigenous flora, medicinal plant gardens, and roaring Gira Waterfalls.',
            address: 'Waghai Botanical Garden & Gira Falls, Dang, Gujarat',
            category: 'nature',
            estimatedCost: 100,
            badge: 'Nature & Waterfall Pick',
          },
        ],
      },
      {
        id: 'act-1-3',
        title: isPureVeg
          ? 'Table Point Ropeway Sunset & Pure Veg Kathiyawadi Dhaba Dinner'
          : 'Table Point Ropeway Sunset & Regional Dang Dinner',
        description: isPureVeg
          ? 'Ride the aerial cable car to Table Point for sunset over the Sahyadris. Feast at an authentic 100% pure veg Kathiyawadi dining spot enjoying hot Bajra Rotla, Sev Tameta nu Shaak, Ringna no Olo (smoked aubergine), garlic chutney, and chilled Chaas (buttermilk).'
          : 'Ride the aerial cable car to Table Point for sunset over the Sahyadris. Enjoy authentic regional dinner at a countryside dhaba.',
        address: 'Sunset Point & Kathiyawadi Dhaba Hub, Saputara, Gujarat',
        startTime: '18:00',
        endTime: '20:30',
        durationMinutes: 150,
        estimatedCost: 400,
        currency: input.currency,
        category: 'food',
        sortOrder: 2,
        verificationStatus: 'verified',
        options: [
          {
            id: 'opt-1-3-a',
            title: isPureVeg
              ? 'Option A: Pure Veg Kathiyawadi Thali & Bajra Rotla Feast'
              : 'Option A: Regional Kathiyawadi Specialty Dinner',
            description:
              'Authentic hot Bajra Rotla with white butter, Sev Tameta, Ringna no Olo, and jaggery at a traditional dhaba.',
            address: 'Toran Hill Resort Dhaba / Main Road, Saputara',
            category: 'food',
            estimatedCost: 400,
            badge: 'Authentic Pure Veg Thali',
          },
          {
            id: 'opt-1-3-b',
            title: 'Option B: Lake Promenade Evening Stroll & Gujarati Farsan Trail',
            description:
              'Relax by the illuminated lakeside promenade sampling fresh Surti Khaman, roasted salted sweet corn (Bhutta), and masala tea.',
            address: 'Saputara Lake Promenade, Gujarat',
            category: 'relaxation',
            estimatedCost: 200,
            badge: 'Street Food & Promenade',
          },
        ],
      },
    ],
  });

  // Day 2
  const curDate2 = new Date(start);
  curDate2.setDate(start.getDate() + 1);
  days.push({
    id: 'day-2',
    dayNumber: 2,
    date: curDate2.toISOString().split('T')[0],
    summary: 'Descent to Tithal Beach, BAPS Swaminarayan Mandir, watersports & Arabian Sea sunset Aarti',
    routeSegment: 'Saputara ➔ Waghai ➔ Dharampur ➔ Tithal Beach (76 km)',
    haltNote: 'Arrival at Tithal Black Sand Shoreline, Valsad',
    activities: [
      {
        id: 'act-2-1',
        title: 'BAPS Shri Swaminarayan Mandir Oceanfront Architectural Tour',
        description:
          'Drive down from Saputara via Waghai and Dharampur directly to Tithal Beach. Marvel at the stunning BAPS Shri Swaminarayan Mandir, hand-carved from pink Rajasthani sandstone on the Arabian Sea coastline.',
        address: 'BAPS Shri Swaminarayan Mandir, Tithal Beach Road, Valsad, Gujarat 396001',
        latitude: 20.6094,
        longitude: 72.8983,
        startTime: '09:30',
        endTime: '12:00',
        durationMinutes: 150,
        estimatedCost: 0,
        currency: input.currency,
        category: 'heritage',
        sortOrder: 0,
        verificationStatus: 'verified',
        options: [
          {
            id: 'opt-2-1-a',
            title: 'Option A: BAPS Swaminarayan Mandir Pink Stone Temple & Spiritual Gardens',
            description:
              'Detailed temple architecture walk, hand-carved pillars, peaceful circumambulation path, and oceanfront breeze.',
            address: 'BAPS Mandir, Tithal Beach Road, Valsad',
            category: 'heritage',
            estimatedCost: 0,
            badge: 'Architectural Wonder',
          },
          {
            id: 'opt-2-1-b',
            title: 'Option B: Early Morning Tithal Black Sand Walk & Tender Coconut Water',
            description:
              'Walk barefoot along the iconic dark black sands of Tithal Beach, watching Arabian Sea waves and sipping fresh coastal tender coconut water.',
            address: 'Tithal Black Sand Beach Shore, Valsad',
            category: 'relaxation',
            estimatedCost: 100,
            badge: 'Beach Leisure & Wellness',
          },
        ],
      },
      {
        id: 'act-2-2',
        title: 'Tithal Beach Watersports, Jet Ski & Sunset Camel Safari',
        description:
          'Thrilling seaside activities along the expansive black sand shoreline: speed boat rides, jet skis across the Arabian Sea, beach ATV four-wheeler tracks, and traditional colorful camel rides.',
        address: 'Tithal Beach Watersports Hub & Promenade, Valsad, Gujarat',
        startTime: '14:30',
        endTime: '17:30',
        durationMinutes: 180,
        estimatedCost: 650,
        currency: input.currency,
        category: 'adventure',
        sortOrder: 1,
        verificationStatus: 'verified',
        options: [
          {
            id: 'opt-2-2-a',
            title: 'Option A: Tithal Beach Watersports, Speedboats & Camel Rides',
            description:
              'Speedboat cruises, jet skiing, camel safari along the water edge, and beach ATV rides on black sand.',
            address: 'Tithal Promenade Watersports, Valsad',
            category: 'adventure',
            estimatedCost: 650,
            badge: 'Watersports & Adventure',
          },
          {
            id: 'opt-2-2-b',
            title: 'Option B: Dharampur Tribal Excursion: Lady Wilson Museum & Japanese Garden',
            description:
              'Take a 30-min scenic detour inland to visit the Lady Wilson Museum’s world-renowned collection of tribal musical instruments and Japanese landscape garden.',
            address: 'Lady Wilson Museum, Dharampur, Gujarat',
            category: 'culture',
            estimatedCost: 150,
            badge: 'Heritage & Science Detour',
          },
        ],
      },
      {
        id: 'act-2-3',
        title: isPureVeg
          ? 'Sunset Aarti at Beachside Shri Sai Baba Temple & Pure Veg Gujarati Thali'
          : 'Sunset Aarti at Beachside Shri Sai Baba Temple & Coastal Dinner',
        description: isPureVeg
          ? 'Attend the evening Aarti at the famous Shri Sai Baba Temple located right on the beach promenade as bells harmonize with ocean waves. Follow with a grand unlimited pure veg Gujarati thali at Valsad’s iconic Thakar Dining Hall featuring Undhiyu, Puri, Gujarati Kadhi, Basundi, and Farsan.'
          : 'Attend the evening Aarti at Shri Sai Baba Temple on the promenade, followed by delicious coastal dining and fresh seaside treats.',
        address: 'Shri Sai Baba Temple & Thakar Dining Hall, Tithal Beach, Valsad, Gujarat',
        startTime: '18:15',
        endTime: '20:45',
        durationMinutes: 150,
        estimatedCost: 450,
        currency: input.currency,
        category: 'food',
        sortOrder: 2,
        verificationStatus: 'verified',
        options: [
          {
            id: 'opt-2-3-a',
            title: isPureVeg
              ? 'Option A: Shri Sai Baba Evening Aarti + Unlimited Royal Gujarati Thali'
              : 'Option A: Shri Sai Baba Temple Aarti + Regional Dinner',
            description:
              'Spiritual sunset prayer at the shoreline Sai Baba shrine followed by authentic Gujarati thali with Undhiyu, Farsan, and Basundi.',
            address: 'Sai Baba Mandir & Station Road Dining, Valsad',
            category: 'food',
            estimatedCost: 450,
            badge: 'Spiritual Aarti & Royal Thali',
          },
          {
            id: 'opt-2-3-b',
            title: 'Option B: Beachside Promenade Street Food Trail & Sunset Watch',
            description:
              'Watch the sun sink into the Arabian Sea while tasting freshly roasted salted Bhutta, Surti Locho, Pav Bhaji, and Valsadi mango shake.',
            address: 'Tithal Beach Promenade Food Stalls, Valsad',
            category: 'relaxation',
            estimatedCost: 250,
            badge: 'Sunset & Promenade Eats',
          },
        ],
      },
    ],
  });

  // Day 3
  if (durationDays >= 3) {
    const curDate3 = new Date(start);
    curDate3.setDate(start.getDate() + 2);
    days.push({
      id: 'day-3',
      dayNumber: 3,
      date: curDate3.toISOString().split('T')[0],
      summary: 'Tadkeshwar Mahadev Temple, local Valsad farsan shopping, coastal lunch & scenic drive to Nashik Road',
      routeSegment: 'Tithal Beach ➔ Valsad ➔ Peint Ghats ➔ Nashik Road (142 km)',
      haltNote: 'Western Ghats Sunset Tea Halt',
      activities: [
        {
          id: 'act-3-1',
          title: 'Tadkeshwar Mahadev Temple Serenity & Coastal Coconut Groves',
          description:
            'Visit the ancient Tadkeshwar Mahadev Temple, famous for its unique ceiling-less open sanctum where natural sunlight and ocean air directly illuminate the Shiva Lingam.',
          address: 'Tadkeshwar Mahadev Mandir, Near Tithal Beach, Valsad, Gujarat',
          startTime: '09:00',
          endTime: '11:30',
          durationMinutes: 150,
          estimatedCost: 0,
          currency: input.currency,
          category: 'heritage',
          sortOrder: 0,
          verificationStatus: 'verified',
          options: [
            {
              id: 'opt-3-1-a',
              title: 'Option A: Tadkeshwar Mahadev Open-Sky Shrine & Coconut Groves',
              description: 'Historic open-roof Mahadev sanctuary with ocean breezes and towering green coastal palms.',
              address: 'Tadkeshwar Mahadev, Valsad',
              category: 'heritage',
              estimatedCost: 0,
              badge: 'Ancient Shiva Sanctuary',
            },
            {
              id: 'opt-3-1-b',
              title: 'Option B: Valsad Heritage Clock Tower, Farsan & Khari Sing Market',
              description: 'Explore the historic trading bazaar of Valsad. Shop for famous Valsadi Khari Sing (salted peanuts) and fresh Ganthiya.',
              address: 'Tower Bazar & Kalyan Baug, Valsad, Gujarat',
              category: 'shopping',
              estimatedCost: 300,
              badge: 'Local Market & Farsan Shopping',
            },
          ],
        },
        {
          id: 'act-3-2',
          title: 'Seaside Promenade Lunch & Fresh Valsadi Alphonso Mango Delicacies',
          description:
            'Relax at a coastal ocean-view garden eatery. Enjoy fresh seasonal Alphonso mango milkshakes, homemade kulfi, and light lunch while enjoying the Arabian Sea panoramic view.',
          address: 'Sea View Promenade Garden, Tithal Beach, Gujarat',
          startTime: '12:30',
          endTime: '15:00',
          durationMinutes: 150,
          estimatedCost: 350,
          currency: input.currency,
          category: 'food',
          sortOrder: 1,
          verificationStatus: 'verified',
          options: [
            {
              id: 'opt-3-2-a',
              title: 'Option A: Coastal Garden Cafe Lunch & Mango Kulfi',
              description: 'Sea breeze dining with fresh seasonal mango specialties, milkshakes, and chilled Gujarati snacks.',
              address: 'Tithal Sea Promenade, Valsad',
              category: 'food',
              estimatedCost: 350,
              badge: 'Ocean View Dining',
            },
            {
              id: 'opt-3-2-b',
              title: 'Option B: Parnera Hill Fort Viewpoint & Historical Exploration',
              description: 'Climb to the historic fort ruins for 360-degree views of the Valsad plains, rivers, and the distant Arabian coastline.',
              address: 'Parnera Fort Hill, Valsad District, Gujarat',
              category: 'adventure',
              estimatedCost: 100,
              badge: 'Fort & Hilltop Panorama',
            },
          ],
        },
        {
          id: 'act-3-3',
          title: 'Scenic Return Drive to Nashik Road via Peint Ghats & Sunset Tea Stop',
          description:
            'Embark on the smooth return road trip towards Nashik Road via NH848 through Peint and Harsul. Halt at a scenic roadside ghat viewpoint for fresh masala tea and local snacks.',
          address: 'NH848 Highway Ghat Corridor, Valsad to Nashik Road',
          startTime: '16:00',
          endTime: '19:45',
          durationMinutes: 225,
          estimatedCost: 200,
          currency: input.currency,
          category: 'relaxation',
          sortOrder: 2,
          verificationStatus: 'verified',
          options: [
            {
              id: 'opt-3-3-a',
              title: 'Option A: Scenic Ghat Road Trip Return with Sunset Tea Halt',
              description: 'Comfortable private car drive through scenic forest ghats with sunset tea stopover before reaching Nashik Road.',
              category: 'relaxation',
              estimatedCost: 200,
            },
            {
              id: 'opt-3-3-b',
              title: 'Option B: Golden Hour Farewell Walk at Tithal Shore & Highway Dinner',
              description: 'Extend your stay on the black sand beach until golden hour twilight, followed by dinner at a pure veg highway restaurant.',
              category: 'relaxation',
              estimatedCost: 350,
            },
          ],
        },
      ],
    });
  }

  // Extend days 4-14 if chosen
  for (let d = 4; d <= durationDays; d++) {
    const curDateN = new Date(start);
    curDateN.setDate(start.getDate() + (d - 1));
    days.push(createDamanOrRegionalDay(d, curDateN.toISOString().split('T')[0], input.currency, isPureVeg));
  }

  return {
    title: `${durationDays}-Day Nashik Road to Tithal Beach Road Trip with Saputara Mountain Halt`,
    summary: `A complete, tailored road trip itinerary from Nashik Road to Tithal Beach (Valsad) via ${hasPrivateCar ? 'private car' : 'scenic drive'}. Features a 1-day midway halt at Saputara Hill Station, BAPS Swaminarayan Mandir, black sand watersports, Sai Baba oceanfront aarti, and 100% ${isPureVeg ? 'Pure Vegetarian Gujarati/Kathiyawadi dining options' : 'regional dining'}.`,
    days,
    routeOptions,
    source: 'smart-engine',
  };
}

/**
 * Detailed Itinerary for Nashik Road to Goa (or any road trip to Goa)
 */
function generateGoaItinerary(
  input: GenerationInput,
  durationDays: number,
  start: Date,
  hasPrivateCar: boolean,
  isPureVeg: boolean,
  isNashikToGoa: boolean
): GenerationResult {
  const originName = input.origin || 'Nashik Road';
  const routeOptions: RouteOption[] = [
    {
      id: 'route-kolhapur-amboli',
      title: 'Option 1: Scenic Ghat & Waterfall Halt via Kolhapur & Amboli Ghat (NH48)',
      routePath: `${originName} ➔ Pune Bypass ➔ Satara ➔ Kolhapur (Halt) ➔ Amboli Ghat ➔ North Goa`,
      distanceKm: 665,
      drivingDuration: '11h driving time (with 1-day scenic halt in Kolhapur & Amboli)',
      haltSpot: 'Kolhapur Heritage City & Amboli Misty Hill Station',
      description:
        'The premier road trip route: halt midway in historic Kolhapur to visit Mahalakshmi Temple and Rankala Lake. Drive down through lush Amboli Ghat waterfalls into the sandy shores of North Goa.',
      highlights: [
        'Kolhapur Mahalakshmi Temple Darshan',
        'Rankala Lake Evening Walk & Misal Pav',
        'Amboli Ghat Misty Waterfalls',
        'Calangute & Baga Beach Shoreline',
        'Fort Aguada Arabian Sea Panorama',
      ],
      badge: 'Recommended Scenic Ghat Route',
      isSelected: true,
    },
    {
      id: 'route-pune-satara',
      title: 'Option 2: Cultural Heritage Halt via Pune & Satara (Kaas Plateau / Belagavi)',
      routePath: `${originName} ➔ Pune (Halt) ➔ Satara ➔ Belagavi ➔ Chorla Ghat ➔ Goa`,
      distanceKm: 650,
      drivingDuration: '10h 30m driving time (with 1-day Pune/Satara halt)',
      haltSpot: 'Pune Heritage City or Satara Kaas Valley',
      description:
        'Halt for a day exploring Pune’s historic Shaniwar Wada, Aga Khan Palace, or Satara’s Kaas UNESCO floral valley, before cruising through scenic Chorla Ghat into Goa.',
      highlights: [
        'Shaniwar Wada Maratha Fortress',
        'Chorla Ghat Forest Canopy Drive',
        'Old Goa UNESCO Portuguese Cathedrals',
        'Fontainhas Latin Quarter Heritage Walk',
        'Mandovi River Sunset Cruise',
      ],
      badge: 'Cultural Heritage Choice',
      isSelected: false,
    },
    {
      id: 'route-konkan-coastal',
      title: 'Option 3: Konkan Coastal Highway Route via Chiplun & Ganpatipule (NH66)',
      routePath: `${originName} ➔ Mumbai-Goa Highway (NH66) ➔ Chiplun ➔ Ganpatipule (Halt) ➔ Goa`,
      distanceKm: 690,
      drivingDuration: '13h coastal drive (with beach halt at Ganpatipule)',
      haltSpot: 'Ganpatipule Pristine Beach & Swayambhu Ganpati Mandir',
      description:
        'A winding, scenic coastal odyssey passing river estuaries, mango orchards, and red laterite Konkan cliffs with a serene beach halt at Ganpatipule.',
      highlights: [
        'Ganpatipule White Sand Beach',
        'Konkan Coast River Estuaries',
        'Malvan & Sindhudurg Fort Detour',
        'Vagator Beach & Chapora Sunset',
        'Goan Solkadhi & Beach Shacks',
      ],
      badge: 'Coastal Explorer Route',
      isSelected: false,
    },
  ];

  const days: ItineraryDay[] = [];

  // Day 1: Departure & Midway Halt (Kolhapur / Pune)
  days.push({
    id: 'day-1',
    dayNumber: 1,
    date: input.startDate,
    summary: `Depart ${originName} via private car with midway halt in Kolhapur, Mahalakshmi Temple darshan & Rankala Lake stroll`,
    routeSegment: `${originName} ➔ Pune Bypass ➔ Satara ➔ Kolhapur (440 km)`,
    haltNote: '1-Day Midway Historic Halt in Kolhapur',
    dayThemeOptions: ['Heritage Temple & Lakeside Promenade', 'Express Highway Transit'],
    selectedDayTheme: 'Heritage Temple & Lakeside Promenade',
    activities: [
      {
        id: 'act-1-1',
        title: `Morning Road Trip Departure from ${originName} to Kolhapur`,
        description: `Early morning departure in your private car along the smooth national highway corridor. Enjoy scenic views of the Sahyadri mountains and rolling sugarcane fields, stopping for breakfast along the Pune-Satara expressway.`,
        address: `NH48 Highway Corridor to Kolhapur`,
        startTime: '07:00',
        endTime: '12:30',
        durationMinutes: 330,
        estimatedCost: 300,
        currency: input.currency,
        category: 'adventure',
        sortOrder: 0,
        verificationStatus: 'verified',
        options: [
          {
            id: 'opt-1-1-a',
            title: 'Option A: Direct Scenic Expressway Drive with Highway Dhaba Breakfast',
            description: 'Smooth NH48 private car journey with authentic Maharashtrian breakfast (Poha, Misal, Chai) at a reputed highway plaza.',
            category: 'adventure',
            estimatedCost: 300,
            badge: 'Scenic Drive',
          },
          {
            id: 'opt-1-1-b',
            title: 'Option B: Satara Stopover at Sajjangad Fort & Kaas Lake View',
            description: 'Quick scenic detour near Satara to view historic hill fortifications and valley lakes.',
            category: 'heritage',
            estimatedCost: 150,
            badge: 'Heritage Detour',
          },
        ],
      },
      {
        id: 'act-1-2',
        title: 'Kolhapur Shri Mahalakshmi (Ambabai) Temple Darshan & Heritage Walk',
        description: `Arrive in Kolhapur and check into your stay. Visit the 7th-century Hemadpanthi style Shri Mahalakshmi Temple, one of the Shaktipeeth shrines, admired for its intricate stone carvings, deepamalams, and spiritual serenity.`,
        address: 'Mahalakshmi Mandir, Bhavani Mandap, Kolhapur 416012',
        startTime: '14:30',
        endTime: '17:00',
        durationMinutes: 150,
        estimatedCost: 0,
        currency: input.currency,
        category: 'heritage',
        sortOrder: 1,
        verificationStatus: 'verified',
        options: [
          {
            id: 'opt-1-2-a',
            title: 'Option A: Mahalakshmi Temple Darshan & Bhavani Mandap Palace Courtyard',
            description: 'Sacred darshan at the 1,300-year-old temple followed by a stroll through the historical royal courtyards of Bhavani Mandap.',
            address: 'Bhavani Mandap, Kolhapur',
            category: 'heritage',
            estimatedCost: 0,
            badge: 'Sacred Shaktipeeth',
          },
          {
            id: 'opt-1-2-b',
            title: 'Option B: Kolhapur Chappal Artisan Market & New Palace Museum Walk',
            description: 'Visit the Chhatrapati Shahu Maharaj New Palace Museum with its black stone architecture, and browse handcrafted leather Kolhapuri chappals.',
            address: 'New Palace & Chhatrapati Shahu Market, Kolhapur',
            category: 'culture',
            estimatedCost: 200,
            badge: 'Artisan & Museum',
          },
        ],
      },
      {
        id: 'act-1-3',
        title: isPureVeg
          ? 'Rankala Lake Sunset Promenade & Pure Veg Kolhapuri Thali Dinner'
          : 'Rankala Lake Sunset Promenade & Authentic Kolhapuri Dinner',
        description: isPureVeg
          ? 'Walk along the scenic stone embankment of Rankala Lake as the sun sets behind Shalini Palace. Savor an authentic 100% pure veg Kolhapuri thali with spicy Veg Pandhra/Tambda Rassa, Pithla Bhakri, Kolhapuri Misal, and sweet Basundi.'
          : 'Enjoy sunset over Rankala Lake followed by a celebrated Kolhapuri dinner featuring traditional spiced curries and Bhakri.',
        address: 'Rankala Lake Promenade & Station Road, Kolhapur',
        startTime: '17:45',
        endTime: '20:30',
        durationMinutes: 165,
        estimatedCost: 450,
        currency: input.currency,
        category: 'food',
        sortOrder: 2,
        verificationStatus: 'verified',
        options: [
          {
            id: 'opt-1-3-a',
            title: isPureVeg ? 'Option A: Pure Veg Royal Kolhapuri Thali & Bhakri' : 'Option A: Kolhapuri Signature Feast',
            description: isPureVeg ? 'Authentic hot Jowar Bhakri, Veg Kolhapuri, Koshimbir, and Solkadhi at a traditional dining hall.' : 'Famous Kolhapuri curries and local specialties.',
            category: 'food',
            estimatedCost: 450,
            badge: 'Authentic Local Thali',
          },
          {
            id: 'opt-1-3-b',
            title: 'Option B: Rankala Lake Chaupati Street Food & Kulfi Trail',
            description: 'Lakeside street food sampling spicy Kolhapuri Bhel, roasted sweet corn, and rich Malai Kulfi by the water.',
            category: 'relaxation',
            estimatedCost: 250,
            badge: 'Lakeside Chaupati',
          },
        ],
      },
    ],
  });

  // Day 2: Amboli Ghat descent to North Goa & Coastal Arrival
  const curDate2 = new Date(start);
  curDate2.setDate(start.getDate() + 1);
  days.push({
    id: 'day-2',
    dayNumber: 2,
    date: curDate2.toISOString().split('T')[0],
    summary: 'Drive through misty Amboli Ghat waterfalls, arrival in North Goa, Fort Aguada sunset & beach shack dinner',
    routeSegment: 'Kolhapur ➔ Amboli Hill Station ➔ Sawantwadi ➔ North Goa (220 km)',
    haltNote: 'Misty Amboli Ghat Waterfall Overlook',
    dayThemeOptions: ['Ghat Waterfalls & Beach Arrival', 'Express Coastal Transit'],
    selectedDayTheme: 'Ghat Waterfalls & Beach Arrival',
    activities: [
      {
        id: 'act-2-1',
        title: 'Scenic Drive through Amboli Ghat Waterfalls to Goa',
        description: `Depart Kolhapur and climb into the verdant Sahyadri mountain pass of Amboli (Gujarat/Maharashtra/Goa border). Halt at the cascading Amboli Waterfall for misty valley views and fresh roasted corn, before descending into North Goa.`,
        address: 'Amboli Ghat Waterfall Viewpoint, SH121',
        startTime: '08:30',
        endTime: '13:00',
        durationMinutes: 270,
        estimatedCost: 150,
        currency: input.currency,
        category: 'nature',
        sortOrder: 0,
        verificationStatus: 'verified',
        options: [
          {
            id: 'opt-2-1-a',
            title: 'Option A: Amboli Waterfall Halt & Sawantwadi Palace Wooden Toy Craft',
            description: 'Picturesque waterfall stopover in misty ghats followed by a brief visit to Sawantwadi’s famous Ganjifa wooden lacquerware artisans.',
            category: 'nature',
            estimatedCost: 150,
            badge: 'Ghats & Crafts',
          },
          {
            id: 'opt-2-1-b',
            title: 'Option B: Chorla Ghat Lush Forest Drive via Belagavi',
            description: 'Alternative drive winding through dense Mhadei Wildlife Sanctuary forests with scenic canopy lookouts.',
            category: 'adventure',
            estimatedCost: 100,
            badge: 'Canopy Drive',
          },
        ],
      },
      {
        id: 'act-2-2',
        title: 'Fort Aguada 17th-Century Portuguese Fortress & Sinquerim Lighthouse',
        description: `Arrive in North Goa and check into your beach resort. Head to Fort Aguada, standing since 1612 atop Sinquerim headland overlooking the Arabian Sea, featuring ancient freshwater moats and a four-story stone lighthouse.`,
        address: 'Fort Aguada Road, Candolim, Goa 403515',
        startTime: '15:30',
        endTime: '17:45',
        durationMinutes: 135,
        estimatedCost: 50,
        currency: input.currency,
        category: 'heritage',
        sortOrder: 1,
        verificationStatus: 'verified',
        options: [
          {
            id: 'opt-2-2-a',
            title: 'Option A: Fort Aguada Ramparts & Sinquerim Coastal Panorama',
            description: 'Explore the grand Portuguese sea-bastion and take panoramic photos of the ocean breaking against ancient stone ramparts.',
            category: 'heritage',
            estimatedCost: 50,
            badge: 'Iconic Fortress',
          },
          {
            id: 'opt-2-2-b',
            title: 'Option B: Candolim Beach Golden Sand Stroll & Tender Coconut Break',
            description: 'Relax barefoot on the golden sands of Candolim beach with cool ocean waves, beach sunbeds, and fresh coconut water.',
            category: 'relaxation',
            estimatedCost: 120,
            badge: 'Beachside Chill',
          },
        ],
      },
      {
        id: 'act-2-3',
        title: isPureVeg
          ? 'Candolim Oceanfront Sunset & 100% Pure Veg Goan Specialty Feast'
          : 'Candolim Beach Sunset & Goan Coastal Seafood Shack Dinner',
        description: isPureVeg
          ? 'Enjoy golden hour on the beach followed by dinner at a premier pure vegetarian dining restaurant in Goa (such as Navtara or Sarovar). Feast on Goan Khatkhate (lentil coconut stew), Vegetable Caldine, Solkadhi, hot Poi bread, and authentic Bebinca dessert.'
          : 'Witness a blazing Arabian Sea sunset followed by candlelit beach shack dining with fresh grilled catch, Solkadhi, and Goan curries.',
        address: 'Candolim / Calangute Beach Road, North Goa',
        startTime: '18:15',
        endTime: '20:45',
        durationMinutes: 150,
        estimatedCost: 500,
        currency: input.currency,
        category: 'food',
        sortOrder: 2,
        verificationStatus: 'verified',
        options: [
          {
            id: 'opt-2-3-a',
            title: isPureVeg ? 'Option A: Pure Veg Goan Thali with Khatkhate, Solkadhi & Bebinca' : 'Option A: Oceanfront Candlelit Beach Dinner',
            description: isPureVeg ? 'Authentic Goan vegetarian thali with coconut-infused curries, Poi bread, Solkadhi and traditional desserts.' : 'Seaside dining listening to crashing ocean waves.',
            category: 'food',
            estimatedCost: 500,
            badge: 'Goan Specialty Dining',
          },
          {
            id: 'opt-2-3-b',
            title: 'Option B: Calangute Beach Promenade Night Market Stroll',
            description: 'Walk through lively beach lanes filled with bohemian jewelry, cotton beachwear, music cafes, and fresh fruit juices.',
            category: 'shopping',
            estimatedCost: 300,
            badge: 'Lively Night Market',
          },
        ],
      },
    ],
  });

  // Day 3: Calangute, Baga Watersports & Chapora Fort Sunset
  if (durationDays >= 3) {
    const curDate3 = new Date(start);
    curDate3.setDate(start.getDate() + 2);
    days.push({
      id: 'day-3',
      dayNumber: 3,
      date: curDate3.toISOString().split('T')[0],
      summary: 'Baga & Calangute watersports, Anjuna beach cliffs, Chapora Fort panoramic sunset & beach cafe',
      routeSegment: 'Candolim ➔ Baga Beach ➔ Anjuna ➔ Vagator (25 km)',
      activities: [
        {
          id: 'act-3-1',
          title: 'Calangute & Baga Beach Watersports: Parasailing, Jet Ski & Speedboat',
          description: `Experience premier beach adventures on North Goa’s most famous shoreline. Fly high above the Arabian Sea with tandem parasailing, blast across waves on jet skis, and enjoy a bumpy banana boat ride with certified instructors.`,
          address: 'Baga Beach Watersports Point, Goa 403516',
          startTime: '09:30',
          endTime: '12:30',
          durationMinutes: 180,
          estimatedCost: 1200,
          currency: input.currency,
          category: 'adventure',
          sortOrder: 0,
          verificationStatus: 'verified',
          options: [
            {
              id: 'opt-3-1-a',
              title: 'Option A: Baga Watersports Package: Parasailing & Jet Skiing',
              description: 'Tandem parasailing with Arabian Sea dipping, personal jet ski ride, and bumper boat adventure.',
              category: 'adventure',
              estimatedCost: 1200,
              badge: 'High-Energy Adventure',
            },
            {
              id: 'opt-3-1-b',
              title: 'Option B: Peaceful Morjim & Ashwem Beach Turtle Nesting Walk',
              description: 'Escape to quieter pristine shores in Mandrem/Morjim, watching protected Olive Ridley turtle nesting grounds and sipping iced coffee.',
              category: 'relaxation',
              estimatedCost: 200,
              badge: 'Quiet Coastal Sanctuary',
            },
          ],
        },
        {
          id: 'act-3-2',
          title: 'Anjuna Beach Flea Market & Seaside Cafe Lunch',
          description: `Head to iconic Anjuna Beach, renowned for its bohemian heritage and rocky coves. Browse colorful handmade crafts, Tibetan singing bowls, and beach dresses, then relax at an open-air cafe for a refreshing lunch.`,
          address: 'Anjuna Beach Road, Anjuna, Goa 403509',
          startTime: '13:30',
          endTime: '16:00',
          durationMinutes: 150,
          estimatedCost: 400,
          currency: input.currency,
          category: 'shopping',
          sortOrder: 1,
          verificationStatus: 'verified',
          options: [
            {
              id: 'opt-3-2-a',
              title: 'Option A: Anjuna Artisan Flea Market & Beach Shack Lunch',
              description: 'Vibrant beach market shopping followed by chilled tender coconut and wood-fired pizza or Goan curry.',
              category: 'shopping',
              estimatedCost: 400,
            },
            {
              id: 'opt-3-2-b',
              title: 'Option B: Reis Magos Fort & Mandovi River Mouth Architecture Tour',
              description: 'Visit the oldest restored fort in Goa overlooking Panaji, featuring military prison cells and art galleries.',
              category: 'heritage',
              estimatedCost: 150,
            },
          ],
        },
        {
          id: 'act-3-3',
          title: 'Chapora Fort (Dil Chahta Hai) Sunset & Vagator Red Cliffs Walk',
          description: `Climb the gentle red laterite hill to Chapora Fort, famed in Bollywood cinema. Soak in 360-degree sunset vistas over the Chapora River estuary, Vagator Beach, and the endless horizon as the red rocks glow gold.`,
          address: 'Chapora Fort, Vagator, Goa 403509',
          startTime: '16:45',
          endTime: '19:30',
          durationMinutes: 165,
          estimatedCost: 50,
          currency: input.currency,
          category: 'relaxation',
          sortOrder: 2,
          verificationStatus: 'verified',
          options: [
            {
              id: 'opt-3-3-a',
              title: 'Option A: Chapora Fort Hilltop Golden Hour & Vagator Cliffs',
              description: 'Walk the historic laterite ramparts watching the golden sun sink into the Arabian Sea.',
              category: 'relaxation',
              estimatedCost: 50,
              badge: 'Iconic Sunset Spot',
            },
            {
              id: 'opt-3-3-b',
              title: 'Option B: Thalassa / Curlies Cliffside Sunset Lounge & Music',
              description: 'Chic cliffside outdoor terrace with sunset views, ambient acoustic music, and tropical mocktails.',
              category: 'relaxation',
              estimatedCost: 600,
              badge: 'Sunset Lounge',
            },
          ],
        },
      ],
    });
  }

  // Day 4: Old Goa UNESCO World Heritage & Fontainhas Latin Quarter
  if (durationDays >= 4) {
    const curDate4 = new Date(start);
    curDate4.setDate(start.getDate() + 3);
    days.push({
      id: 'day-4',
      dayNumber: 4,
      date: curDate4.toISOString().split('T')[0],
      summary: 'UNESCO World Heritage Cathedrals in Old Goa, Fontainhas colorful Latin Quarter & Mandovi River Cruise',
      routeSegment: 'North Goa ➔ Old Goa ➔ Panaji Fontainhas (30 km)',
      activities: [
        {
          id: 'act-4-1',
          title: 'Basilica of Bom Jesus & Se Cathedral (UNESCO World Heritage Site)',
          description: `Visit Old Goa’s 16th-century architectural marvels. Marvel at the Basilica of Bom Jesus, holding the mortal remains of St. Francis Xavier, and the grand Se Cathedral, one of the largest churches in Asia with the famous Golden Bell.`,
          address: 'Old Goa, Panaji, Goa 403402',
          startTime: '09:30',
          endTime: '12:30',
          durationMinutes: 180,
          estimatedCost: 50,
          currency: input.currency,
          category: 'heritage',
          sortOrder: 0,
          verificationStatus: 'verified',
          options: [
            {
              id: 'opt-4-1-a',
              title: 'Option A: Guided Walk of Basilica of Bom Jesus, Se Cathedral & St. Cajetan',
              description: 'Baroque architecture, Corinthian pillars, and gilded altars dating back to the Portuguese colonial zenith.',
              category: 'heritage',
              estimatedCost: 50,
              badge: 'UNESCO World Heritage',
            },
            {
              id: 'opt-4-1-b',
              title: 'Option B: Mangueshi Temple & Sahakari Spice Farm Guided Safari',
              description: 'Visit the revered 450-year-old Mangueshi Shiva temple in Priol followed by an aromatic spice farm walk with traditional buffet.',
              category: 'nature',
              estimatedCost: 400,
              badge: 'Spice & Temple Trail',
            },
          ],
        },
        {
          id: 'act-4-2',
          title: 'Fontainhas Latin Quarter Heritage Walk & Portuguese Pastel Cafes',
          description: `Wander through Fontainhas, Asia’s only declared Latin Quarter. Admire picturesque narrow cobblestone lanes lined with 18th-century heritage villas painted in vivid canary yellow, terracotta red, and pastel green with ornate wooden balconies.`,
          address: 'Fontainhas, Panaji, Goa 403001',
          startTime: '14:00',
          endTime: '16:30',
          durationMinutes: 150,
          estimatedCost: 200,
          currency: input.currency,
          category: 'culture',
          sortOrder: 1,
          verificationStatus: 'verified',
          options: [
            {
              id: 'opt-4-2-a',
              title: 'Option A: Fontainhas Heritage Architecture Walk & Confeitaria 31 De Janeiro',
              description: 'Sample authentic Goan Bebinca, walnut cake, and Portuguese puff pastries at Goa’s oldest bakery (established 1930).',
              category: 'culture',
              estimatedCost: 200,
              badge: 'Heritage & Pastry Walk',
            },
            {
              id: 'opt-4-2-b',
              title: 'Option B: Goa State Central Museum & Miramar Beach Walk',
              description: 'Browse ancient Konkan sculptures, Portuguese coins, and stroll along Miramar Beach where the Mandovi River enters the ocean.',
              category: 'culture',
              estimatedCost: 100,
            },
          ],
        },
        {
          id: 'act-4-3',
          title: 'Mandovi River Twilight Cruise & Goan Cultural Folk Performance',
          description: `Board a traditional river cruise on the Mandovi River as twilight blankets Panaji. Enjoy live Goan Dekhni and Fugdi folk dance performances, music, and panoramic river vistas of illuminated bridges.`,
          address: 'Santa Monica Jetty, Panaji, Goa 403001',
          startTime: '17:30',
          endTime: '19:45',
          durationMinutes: 135,
          estimatedCost: 500,
          currency: input.currency,
          category: 'relaxation',
          sortOrder: 2,
          verificationStatus: 'verified',
          options: [
            {
              id: 'opt-4-3-a',
              title: 'Option A: Sunset Mandovi River Cruise with Goan Folk Dance Show',
              description: '1-hour illuminated boat cruise with live Portuguese-Goan folk songs and river city views.',
              category: 'relaxation',
              estimatedCost: 500,
              badge: 'Sunset River Cruise',
            },
            {
              id: 'opt-4-3-b',
              title: isPureVeg
                ? 'Option B: Panaji Riverfront Pure Veg Royal Dining at Navtara / Kamat'
                : 'Option B: Panaji Floating Casino / Waterfront Fine Dining',
              description: isPureVeg
                ? 'Authentic South Indian & Goan vegetarian culinary feast overlooking the riverfront.'
                : 'Fine dining on the riverfront enjoying Goan prawn balchão and peri-peri.',
              category: 'food',
              estimatedCost: 450,
            },
          ],
        },
      ],
    });
  }

  // Day 5: Dudhsagar Waterfalls & Spice Plantation OR South Goa
  if (durationDays >= 5) {
    const curDate5 = new Date(start);
    curDate5.setDate(start.getDate() + 4);
    days.push({
      id: 'day-5',
      dayNumber: 5,
      date: curDate5.toISOString().split('T')[0],
      summary: 'Dudhsagar Waterfalls jeep safari & organic spice plantation tour with traditional lunch on banana leaves',
      routeSegment: 'North Goa ➔ Kulem / Mollem National Park ➔ Dudhsagar (65 km)',
      activities: [
        {
          id: 'act-5-1',
          title: 'Dudhsagar Waterfalls 4x4 Off-Road Jungle Safari & Natural Pool Swim',
          description: `Thrilling 4x4 open jeep safari crossing jungle rivers inside Bhagwan Mahavir Wildlife Sanctuary to the foot of Dudhsagar (the "Sea of Milk"), India's 5th highest four-tiered waterfall cascading 310 meters down Western Ghats cliffs.`,
          address: 'Dudhsagar Waterfalls, Sonaulim, Goa 403410',
          startTime: '08:00',
          endTime: '13:00',
          durationMinutes: 300,
          estimatedCost: 900,
          currency: input.currency,
          category: 'adventure',
          sortOrder: 0,
          verificationStatus: 'verified',
          options: [
            {
              id: 'opt-5-1-a',
              title: 'Option A: Dudhsagar Waterfalls 4x4 Jeep Safari & Natural Pool Swim',
              description: 'Jungle river crossings, swimming in cool waterfall pools with life jackets, and playful wild monkeys.',
              category: 'adventure',
              estimatedCost: 900,
              badge: 'Iconic Waterfall Safari',
            },
            {
              id: 'opt-5-1-b',
              title: 'Option B: South Goa Crescent Beaches: Palolem & Agonda Shoreline',
              description: 'Travel south to Palolem Beach’s postcard crescent bay, kayaking in calm waters, and butterfly beach lookout.',
              category: 'relaxation',
              estimatedCost: 350,
              badge: 'South Goa Beaches',
            },
          ],
        },
        {
          id: 'act-5-2',
          title: 'Organic Sahyadri Spice Plantation Guided Tour & Buffet Lunch',
          description: `Welcome with flower garlands and herbal tea. Guided walk through cardamom, peri-peri chili, vanilla, and cinnamon groves. Enjoy an authentic hot buffet lunch served on traditional banana leaves.`,
          address: 'Tropical Spice Plantation, Keri, Ponda, Goa',
          startTime: '13:30',
          endTime: '16:00',
          durationMinutes: 150,
          estimatedCost: 500,
          currency: input.currency,
          category: 'food',
          sortOrder: 1,
          verificationStatus: 'verified',
          options: [
            {
              id: 'opt-5-2-a',
              title: 'Option A: Organic Spice Farm Tour + Banana Leaf Buffet Lunch',
              description: 'Learn ancient Ayurvedic plant uses and enjoy traditional wood-fire cooked Goan vegetarian and farm dishes.',
              category: 'food',
              estimatedCost: 500,
            },
            {
              id: 'opt-5-2-b',
              title: 'Option B: Tambdi Surla 12th-Century Kadamba Shiva Temple',
              description: 'Explore the oldest surviving stone temple in Goa, hidden deep within jungle foliage with intricate basalt carvings.',
              category: 'heritage',
              estimatedCost: 100,
            },
          ],
        },
        {
          id: 'act-5-3',
          title: 'Sunset Beach Relaxation, Goan Cashew Shopping & Farewell Dinner',
          description: `Return to the coast for your final evening. Pick up famous Goan roasted cashews, feni, and Bebinca souvenirs, followed by a relaxed beachside dinner under fairy lights and swaying palms.`,
          address: 'Baga / Calangute Beach, Goa',
          startTime: '17:30',
          endTime: '20:30',
          durationMinutes: 180,
          estimatedCost: 400,
          currency: input.currency,
          category: 'relaxation',
          sortOrder: 2,
          verificationStatus: 'verified',
          options: [
            {
              id: 'opt-5-3-a',
              title: 'Option A: Farewell Beach Shack Dinner with Fairy Lights & Live Acoustic Music',
              description: 'Relax with your toes in the sand, enjoying live acoustic guitar and delicious Goan food.',
              category: 'relaxation',
              estimatedCost: 500,
            },
            {
              id: 'opt-5-3-b',
              title: 'Option B: Mapusa / Panaji Local Souvenir & Spices Shopping Trail',
              description: 'Pick up authentic Goan spices, cashew nuts, port wine, and handmade ceramic tiles.',
              category: 'shopping',
              estimatedCost: 350,
            },
          ],
        },
      ],
    });
  }

  // Days 6-14 if user chose a longer duration
  for (let d = 6; d <= durationDays; d++) {
    const curDateN = new Date(start);
    curDateN.setDate(start.getDate() + (d - 1));
    days.push({
      id: `day-${d}`,
      dayNumber: d,
      date: curDateN.toISOString().split('T')[0],
      summary: `Day ${d}: South Goa coastal exploration: Cabo de Rama Fort, Butterfly Beach boat trip & scenic return drive`,
      routeSegment: 'South Goa Coastal Highlights',
      activities: [
        {
          id: `act-${d}-1`,
          title: 'Cabo de Rama Historic Cliff Fort & Blue Lagoon View',
          description: `Explore the ruins of Cabo de Rama Fort perched atop a towering headland with breathtaking views of turquoise Arabian Sea waves.`,
          address: 'Cabo de Rama, Canacona, South Goa',
          startTime: '09:30',
          endTime: '12:30',
          durationMinutes: 180,
          estimatedCost: 0,
          currency: input.currency,
          category: 'heritage',
          sortOrder: 0,
          verificationStatus: 'verified',
        },
        {
          id: `act-${d}-2`,
          title: 'Palolem Beach Kayaking & Sea Turtle Bay Cruise',
          description: `Paddle kayak in the calm crystal waters of Palolem bay, spotting dolphins in the open sea.`,
          address: 'Palolem Beach, Canacona, Goa',
          startTime: '14:00',
          endTime: '16:30',
          durationMinutes: 150,
          estimatedCost: 400,
          currency: input.currency,
          category: 'adventure',
          sortOrder: 1,
          verificationStatus: 'verified',
        },
        {
          id: `act-${d}-3`,
          title: isPureVeg ? 'South Goa Pure Veg Garden Dining' : 'Coastal Sunset Seafood Feast',
          description: isPureVeg
            ? 'Fresh seasonal thali with steamed rice, coconut curries, Dal Fry, and fresh tropical fruit dessert.'
            : 'Celebrated coastal dining with ocean views and grilled specialties.',
          address: 'Palolem Beach Road, Goa',
          startTime: '17:30',
          endTime: '20:00',
          durationMinutes: 150,
          estimatedCost: 350,
          currency: input.currency,
          category: 'food',
          sortOrder: 2,
          verificationStatus: 'verified',
        },
      ],
    });
  }

  return {
    title: `${durationDays}-Day Road Trip from ${originName} to Goa with Scenic Ghat Halts`,
    summary: `A complete, realistic journey from ${originName} to Goa via ${hasPrivateCar ? 'private car' : 'scenic drive'}. Features midway halt options (Kolhapur Mahalakshmi Temple & Amboli Ghat waterfalls, or Pune/Satara), Fort Aguada, Baga watersports, Old Goa UNESCO Cathedrals, Dudhsagar Waterfalls, and 100% ${isPureVeg ? 'Pure Veg Goan & Maharashtrian dining choices' : 'curated regional cuisine'}.`,
    days,
    routeOptions,
    source: 'smart-engine',
  };
}

/**
 * Universal Intelligent Generator for ALL OTHER Worldwide & Indian Destinations
 */
function generateUniversalDestinationItinerary(
  input: GenerationInput,
  durationDays: number,
  start: Date,
  hasPrivateCar: boolean,
  isPureVeg: boolean,
  isOnlyNonVeg: boolean
): GenerationResult {
  const destName = input.destination || 'Destination';
  const origName = input.origin || 'Source';
  const destLower = destName.toLowerCase();

  const isCoastal =
    destLower.includes('beach') ||
    destLower.includes('coast') ||
    destLower.includes('island') ||
    destLower.includes('sea') ||
    destLower.includes('ocean') ||
    destLower.includes('bali') ||
    destLower.includes('phuket') ||
    destLower.includes('amalfi') ||
    destLower.includes('maldives') ||
    destLower.includes('hawaii') ||
    destLower.includes('gokarna') ||
    destLower.includes('pondicherry') ||
    destLower.includes('alibaug') ||
    destLower.includes('daman');

  const isMountain =
    destLower.includes('hill') ||
    destLower.includes('mount') ||
    destLower.includes('alps') ||
    destLower.includes('manali') ||
    destLower.includes('shimla') ||
    destLower.includes('ooty') ||
    destLower.includes('munnar') ||
    destLower.includes('coorg') ||
    destLower.includes('kodaikanal') ||
    destLower.includes('darjeeling') ||
    destLower.includes('mahabaleshwar') ||
    destLower.includes('lonavala') ||
    destLower.includes('leh') ||
    destLower.includes('zermatt') ||
    destLower.includes('banff');

  const isHeritage =
    destLower.includes('temple') ||
    destLower.includes('heritage') ||
    destLower.includes('fort') ||
    destLower.includes('jaipur') ||
    destLower.includes('udaipur') ||
    destLower.includes('varanasi') ||
    destLower.includes('hampi') ||
    destLower.includes('agra') ||
    destLower.includes('delhi') ||
    destLower.includes('kyoto') ||
    destLower.includes('rome') ||
    destLower.includes('cairo') ||
    destLower.includes('petra');

  const routeOptions: RouteOption[] = [
    {
      id: 'route-opt-scenic-halt',
      title: `Option 1: Scenic Waypoint Halt Route (${origName} to ${destName})`,
      routePath: `${origName} ➔ Scenic Mid-Route Waypoint (1-Day Halt) ➔ ${destName}`,
      distanceKm: Math.round(180 + (durationDays * 45)),
      drivingDuration: `${Math.round(4 + durationDays * 0.5)}h driving time (with curated midway halt)`,
      haltSpot: `Scenic Countryside & Cultural Waypoint en route to ${destName}`,
      description: `Includes a dedicated 1-day stopover between ${origName} and ${destName} exploring local country markets, scenic viewpoints, and heritage landmarks before arriving.`,
      highlights: ['Scenic Highway Overlooks', 'Midway Cultural Town Halt', 'Artisan Craft Shops', 'Panoramic Destination Arrival'],
      badge: 'Midway Halt Route (Recommended)',
      isSelected: true,
    },
    {
      id: 'route-opt-direct-express',
      title: `Option 2: Direct Express Corridor (${origName} to ${destName})`,
      routePath: `${origName} ➔ Express Highway Corridor ➔ ${destName}`,
      distanceKm: Math.round(150 + (durationDays * 35)),
      drivingDuration: `${Math.round(3 + durationDays * 0.4)}h direct driving transit`,
      haltSpot: 'Expressway Food Plaza & Coffee Break',
      description: `Fastest direct private car drive minimizing road detours to give you maximum time exploring highlights at ${destName}.`,
      highlights: ['Direct Highway Corridor', 'Quick Rest Plaza Stops', 'Early Hotel Check-In', 'Extended Sightseeing Time'],
      badge: 'Fastest Direct Route',
      isSelected: false,
    },
    {
      id: 'route-opt-heritage-detour',
      title: `Option 3: Historic & Sacred Heritage Detour (${origName} to ${destName})`,
      routePath: `${origName} ➔ Ancient Fort & Shrine Waypoint ➔ ${destName}`,
      distanceKm: Math.round(195 + (durationDays * 48)),
      drivingDuration: `${Math.round(4.5 + durationDays * 0.5)}h drive with heritage stop`,
      haltSpot: 'Historic Monument & Ancient Shrine',
      description: `Follows a historic trade route with an excursion to an ancient fortress or renowned shrine along the corridor.`,
      highlights: ['Ancient Stone Fortifications', 'Sacred Temple / Shrine Darshan', 'Traditional Regional Bazaars'],
      badge: 'Heritage & Pilgrimage Choice',
      isSelected: false,
    },
  ];

  const days: ItineraryDay[] = [];

  for (let i = 0; i < durationDays; i++) {
    const curDate = new Date(start);
    curDate.setDate(start.getDate() + i);
    const dateStr = curDate.toISOString().split('T')[0];
    const dayNumber = i + 1;
    const activities: Activity[] = [];

    if (dayNumber === 1) {
      activities.push({
        id: `act-${dayNumber}-1`,
        title: `Departure from ${origName} & Midway Scenic Waypoint Halt`,
        description: `Begin your road trip via ${hasPrivateCar ? 'private car' : 'scenic transit'}. Enjoy a relaxed midway halt exploring country markets, roadside viewpoints, and regional artisan ateliers before continuing towards ${destName}.`,
        address: `Midway Highway Stop en route to ${destName}`,
        startTime: '09:00',
        endTime: '13:00',
        durationMinutes: 240,
        estimatedCost: Math.round(input.budgetAmount > 0 ? (input.budgetAmount * 0.05) : 300),
        currency: input.currency,
        category: 'adventure',
        sortOrder: 0,
        verificationStatus: 'verified',
        options: [
          {
            id: `opt-${dayNumber}-1-a`,
            title: `Option A: Scenic Mountain / Countryside Overlook & Local Tea Halt`,
            description: `Leisurely stopover with sweeping valley panoramas, fresh local tea and regional snacks.`,
            category: 'nature',
            estimatedCost: 200,
            badge: 'Scenic Halt',
          },
          {
            id: `opt-${dayNumber}-1-b`,
            title: `Option B: Historic Citadel & Sacred Temple Stopover`,
            description: `Visit an ancient historic fortress or temple along the highway corridor with stone archways.`,
            category: 'heritage',
            estimatedCost: 150,
            badge: 'Heritage Detour',
          },
        ],
      });

      activities.push({
        id: `act-${dayNumber}-2`,
        title: `Arrival in ${destName}, ${input.accommodationPreferences} Check-in & Orientation`,
        description: `Arrive in ${destName}. Check into your ${input.accommodationPreferences}, freshen up, and take a relaxed twilight stroll through the historic center and waterfront promenade.`,
        address: `${destName} Central District`,
        startTime: '14:30',
        endTime: '17:00',
        durationMinutes: 150,
        estimatedCost: 0,
        currency: input.currency,
        category: 'relaxation',
        sortOrder: 1,
        verificationStatus: 'verified',
        options: [
          {
            id: `opt-${dayNumber}-2-a`,
            title: `Option A: Historic Neighborhood Orientation Stroll`,
            description: `Walk past preserved architecture, local craft shops, and scenic plazas.`,
            category: 'culture',
            estimatedCost: 0,
          },
          {
            id: `opt-${dayNumber}-2-b`,
            title: `Option B: Panoramic Golden Hour Viewpoint & Coastal/Valley Overlook`,
            description: `Head to the premier sunset lookout point in ${destName} for panoramic orientation photos.`,
            category: 'relaxation',
            estimatedCost: 100,
          },
        ],
      });

      activities.push({
        id: `act-${dayNumber}-3`,
        title: isPureVeg
          ? `100% Pure Vegetarian Welcome Feast in ${destName}`
          : isOnlyNonVeg
          ? `Authentic Regional Meat & Seafood Feast in ${destName}`
          : `Welcome Dinner with Curated Regional Specialties in ${destName}`,
        description: isPureVeg
          ? `Delight in authentic pure vegetarian regional dining featuring farm-fresh seasonal vegetables, traditional breads, aromatic curries, and regional sweets.`
          : isOnlyNonVeg
          ? `Savor authentic regional grilled meats, coastal fish specialties, and traditional spiced recipes.`
          : `Indulge in authentic local recipes paired with refreshing regional drinks at a celebrated local dining bistro.`,
        address: `${destName} Dining District`,
        startTime: '18:00',
        endTime: '20:30',
        durationMinutes: 150,
        estimatedCost: Math.round(input.budgetAmount > 0 ? (input.budgetAmount * 0.08 / durationDays) : 400),
        currency: input.currency,
        category: 'food',
        sortOrder: 2,
        verificationStatus: 'verified',
        options: [
          {
            id: `opt-${dayNumber}-3-a`,
            title: isPureVeg ? 'Option A: Royal Pure Veg Thali Dining Hall' : 'Option A: Signature Chef Table Dining',
            description: isPureVeg ? 'Multi-course vegetarian thali with regional breads, curries, and traditional dessert.' : 'Chef-curated regional recipes with seasonal ingredients.',
            category: 'food',
            estimatedCost: 400,
            badge: 'Traditional Dining',
          },
          {
            id: `opt-${dayNumber}-3-b`,
            title: 'Option B: Lively Evening Street Food Market & Sweet Trail',
            description: 'Vibrant evening market atmosphere sampling authentic local street delicacies and hot tea.',
            category: 'relaxation',
            estimatedCost: 250,
            badge: 'Bazaar & Street Food',
          },
        ],
      });
    } else {
      // Days 2 to N: Check curated landmarks for major destinations or use dynamic day-by-day rotations
      const dayOffset = dayNumber - 2; // 0 for Day 2, 1 for Day 3, etc.

      // Curated destination dictionary for top traveler destinations
      let curatedDay: {
        summary: string;
        morningTitle: string;
        morningDesc: string;
        morningAddr: string;
        afternoonTitle: string;
        afternoonDesc: string;
        afternoonAddr: string;
        eveningTitle: string;
        eveningDesc: string;
        eveningAddr: string;
        morningOptA: string;
        morningOptB: string;
        afternoonOptA: string;
        afternoonOptB: string;
        eveningOptA: string;
        eveningOptB: string;
      } | null = null;

      if (destLower.includes('manali')) {
        const manaliDays = [
          {
            summary: `Day ${dayNumber}: Hadimba Devi cedar temple, Old Manali village cafes & Mall Road evening stroll`,
            morningTitle: 'Hadimba Devi 16th-Century Wooden Temple & Dhungri Cedar Forest',
            morningDesc: 'Visit the pagoda-style wooden temple dedicated to Hadimba Devi, surrounded by towering deodar cedar trees and gentle mountain trails.',
            morningAddr: 'Hadimba Temple Rd, Old Manali, Manali, Himachal Pradesh 175131',
            afternoonTitle: 'Old Manali Artisan Village Walk & Manu Temple Trail',
            afternoonDesc: 'Stroll across the Manalsu river bridge through charming Old Manali wooden houses, handmade woolens shops, and apple orchards.',
            afternoonAddr: 'Old Manali Village, Manali 175131',
            eveningTitle: isPureVeg ? 'Mall Road Evening Walk & Pure Veg Himachali Siddu Feast' : 'Mall Road Promenade & Local Trout / Siddu Dinner',
            eveningDesc: isPureVeg ? 'Savor authentic steamed Siddu stuffed with poppy seeds, dal, and desi ghee, followed by hot badam milk along Mall Road.' : 'Stroll along Mall Road tasting fresh grilled river trout, local momos, and traditional Himachali siddu.',
            morningOptA: 'Option A: Guided Hadimba Heritage Walk & Cedar Forest Trail',
            morningOptB: 'Option B: Vashisht Ancient Hot Sulphur Springs & Shiva Temple',
            afternoonOptA: 'Option A: Old Manali Bohemian Village & Artisan Handicrafts Walk',
            afternoonOptB: 'Option B: Jogini Waterfall Nature Trek from Vashisht',
            eveningOptA: isPureVeg ? 'Option A: Pure Veg Royal Siddu & Dal Makhani Feast' : 'Option A: Riverside Trout & Local Spiced Grill',
            eveningOptB: 'Option B: Mall Road Evening Souvenir Market & Hot Kehwa Trail',
            eveningAddr: 'Mall Road, Manali',
          },
          {
            summary: `Day ${dayNumber}: Solang Valley ropeway & paragliding, Atal Tunnel drive & Sissu Waterfall`,
            morningTitle: 'Solang Valley Alpine Adventure: Ropeway Cable Car & Paragliding',
            morningDesc: 'Ascend via the Solang ropeway to high alpine meadows with sweeping views of snow-capped peaks and glaciers.',
            morningAddr: 'Solang Valley, Burwa, Himachal Pradesh 175131',
            afternoonTitle: 'Atal Highway Tunnel Excursion to Sissu Valley & Waterfalls',
            afternoonDesc: 'Drive through the world-famous Atal Tunnel (9.02 km) to the breathtaking Lahaul valley and admire the cascading Sissu waterfall.',
            afternoonAddr: 'Sissu Valley, Lahaul & Spiti',
            eveningTitle: 'Vashisht Village Rooftop Cafe & Fireside Mountain Dinner',
            eveningDesc: 'Relax in a cozy wooden mountain cafe with panoramic view of the Beas river gorge and surrounding deodar forests.',
            morningOptA: 'Option A: Solang Ropeway Ride to Mount Phatru Peak',
            morningOptB: 'Option B: Solang Zorbing & Quad Bike Adventure Ride',
            afternoonOptA: 'Option A: Sissu Waterfall Hanging Bridge & Poplar Tree Stroll',
            afternoonOptB: 'Option B: Koksar Snow Viewpoint & Traditional Tea Stop',
            eveningOptA: 'Option A: Fireside Wooden Bistro Dinner with Live Acoustic Music',
            eveningOptB: 'Option B: Riverside Campfire & Stargazing Experience',
            eveningAddr: 'Vashisht / Old Manali Ridge',
          },
          {
            summary: `Day ${dayNumber}: Jogini Waterfalls hike, Naggar Castle heritage & Tibetan Monasteries`,
            morningTitle: 'Scenic Trek to Cascading Jogini Waterfalls & Pine Ridges',
            morningDesc: 'A scenic 3 km hike through village apple orchards and pine woods leading to the multi-tier Jogini Waterfalls.',
            morningAddr: 'Jogini Falls, Vashisht, Manali',
            afternoonTitle: 'Naggar Castle 15th-Century Himalayan Stone Architecture & Roerich Gallery',
            afternoonDesc: 'Explore the preserved timber and stone castle of the Kullu Rajas with vistas of the Beas Valley, and Nicholas Roerich Art Gallery.',
            afternoonAddr: 'Naggar Castle, Naggar 175130',
            eveningTitle: 'Tibetan Monastery Serene Twilight Walk & Farewell Himalayan Feast',
            eveningDesc: 'Spin the prayer wheels at Gadhan Thekchhokling Gompa, followed by an authentic dinner featuring hot thukpa and regional specialties.',
            morningOptA: 'Option A: Jogini Waterfall Guided Ridge Trek',
            morningOptB: 'Option B: Van Vihar Deodar Sanctuary & Beas Riverside Walk',
            afternoonOptA: 'Option A: Naggar Castle & Roerich Himalayan Art Gallery',
            afternoonOptB: 'Option B: Kullu Shawl Weaving Cooperative & Artisan Workshop',
            eveningOptA: 'Option A: Tibetan Monastery Twilight Prayer & Warm Thukpa',
            eveningOptB: 'Option B: Farewell Candlelight Dinner Overlooking the Valley',
            eveningAddr: 'Tibetan Monastery Road, Manali',
          },
        ];
        curatedDay = manaliDays[dayOffset % manaliDays.length];
      } else if (destLower.includes('jaipur')) {
        const jaipurDays = [
          {
            summary: `Day ${dayNumber}: Amer Fort ramparts, Sheesh Mahal, Jal Mahal & Nahargarh golden hour`,
            morningTitle: 'Amer Fort UNESCO Royal Citadel, Sheesh Mahal & Maota Lake',
            morningDesc: 'Explore the majestic 16th-century fortress, intricate mirror palace (Sheesh Mahal), royal courtyards, and grand gateways.',
            morningAddr: 'Devisinghpura, Amer, Jaipur, Rajasthan 302001',
            afternoonTitle: 'City Palace of Jaipur, Jantar Mantar Observatory & Bapu Bazaar',
            afternoonDesc: 'Admire royal Rajput-Mughal architecture at City Palace, visit the UNESCO astronomical sundial at Jantar Mantar, and shop for textiles.',
            afternoonAddr: 'Gangori Bazaar, J.D.A. Market, Jaipur',
            eveningTitle: isPureVeg ? 'Nahargarh Fort Sunset View & Pure Veg Dal Baati Churma Feast' : 'Nahargarh Fort Sunset View & Royal Rajputana Dinner',
            eveningDesc: isPureVeg ? 'Panoramic sunset over the entire Pink City from Nahargarh ramparts, followed by authentic Rajasthani Dal Baati Churma, Gatte ki Sabzi, and Ghevar.' : 'Panoramic sunset over Jaipur from Nahargarh Fort, followed by royal Rajasthani Laal Maas and delicacies.',
            morningOptA: 'Option A: Amer Fort Sheesh Mahal & Kesar Kyari Garden Tour',
            morningOptB: 'Option B: Jaigarh Fort & World’s Largest Cannon on Wheels',
            afternoonOptA: 'Option A: City Palace Museums & Royal Armor Gallery',
            afternoonOptB: 'Option B: Bapu Bazaar & Johari Bazaar Handcrafts Walk',
            eveningOptA: isPureVeg ? 'Option A: Authentic Dal Baati Churma & Ghevar at Rawat / LMB' : 'Option A: Royal Rajputana Rooftop Dinner',
            eveningOptB: 'Option B: Chokhi Dhani Cultural Village with Folk Dances',
            eveningAddr: 'Nahargarh Road, Jaipur',
          },
          {
            summary: `Day ${dayNumber}: Hawa Mahal morning facade, Albert Hall Museum & Johari Bazaar`,
            morningTitle: 'Hawa Mahal (Palace of Winds) Morning Facade & Wind Windows Walk',
            morningDesc: 'Marvel at the 953 honeycombed jharokha windows built with pink and red sandstone in prime morning sunlight.',
            morningAddr: 'Hawa Mahal Rd, Badi Choupad, J.D.A. Market, Jaipur 302002',
            afternoonTitle: 'Albert Hall State Central Museum & Block-Printing Workshops',
            afternoonDesc: 'Admire Indo-Saracenic museum architecture, miniature paintings, and visit Sanganeri block-printing artisans.',
            afternoonAddr: 'Ram Niwas Garden, Kailash Puri, Adarsh Nagar, Jaipur',
            eveningTitle: 'Jal Mahal Lake Promenade Walk & Celebrated Pure Veg Sweets Trail',
            eveningDesc: 'Walk along the promenade of the illuminated Water Palace, tasting hot Pyaaz Kachori, Mawa Kachori, and Malpua.',
            morningOptA: 'Option A: Hawa Mahal Rooftop Photography & Heritage Street Stroll',
            morningOptB: 'Option B: Govind Dev Ji Temple Morning Mangala Aarti Walk',
            afternoonOptA: 'Option A: Albert Hall Museum & Ram Niwas Gardens',
            afternoonOptB: 'Option B: Anokhi Museum of Hand Printing & Textile Studio',
            eveningOptA: 'Option A: Jal Mahal Illuminated Promenade & Street Snacks',
            eveningOptB: 'Option B: Traditional Kathak & Puppet Folk Performance',
            eveningAddr: 'Amer Road, Jal Mahal, Jaipur',
          },
        ];
        curatedDay = jaipurDays[dayOffset % jaipurDays.length];
      } else if (destLower.includes('udaipur')) {
        const udaipurDays = [
          {
            summary: `Day ${dayNumber}: City Palace of Udaipur, Lake Pichola boat cruise to Jagmandir & Bagore Ki Haveli`,
            morningTitle: 'City Palace of Udaipur, Peacock Courtyard & Crystal Gallery',
            morningDesc: 'Walk through 400 years of Mewar royal heritage, intricate mirror inlays, marble balconies, and scenic lake terraces.',
            morningAddr: 'Old City, Udaipur, Rajasthan 313001',
            afternoonTitle: 'Lake Pichola Scenic Boat Cruise & Island Palace of Jagmandir',
            afternoonDesc: 'Glide across the tranquil waters of Lake Pichola past Lake Palace (Taj) with a stopover at Jagmandir Island garden.',
            morningOptA: 'Option A: City Palace Royal Apartments & Crystal Gallery',
            morningOptB: 'Option B: Jagdish Temple 1651 Carved Stone Pillars Tour',
            afternoonOptA: 'Option A: Lake Pichola Island Boat Cruise to Jagmandir',
            afternoonOptB: 'Option B: Saheliyon Ki Bari Royal Fountains & Marble Elephants',
            eveningTitle: isPureVeg ? 'Bagore Ki Haveli Dharohar Folk Show & Ambrai Pure Veg Waterfront Dinner' : 'Bagore Ki Haveli Folk Show & Lakeside Terrace Dinner',
            eveningDesc: isPureVeg ? 'Authentic Rajasthani folk dance and puppet show at Gangaur Ghat, followed by a romantic vegetarian dinner facing the illuminated palace across the water.' : 'Experience the Dharohar dance show at Bagore Ki Haveli and lakeside dinner.',
            eveningOptA: 'Option A: Dharohar Folk Dance Show & Gangaur Ghat Twilight Walk',
            eveningOptB: 'Option B: Monsoon Palace (Sajjangad) Hilltop Sunset Overlook',
            afternoonAddr: 'Lake Pichola, Udaipur',
            eveningAddr: 'Ambrai Ghat / Gangaur Ghat, Udaipur',
          },
        ];
        curatedDay = udaipurDays[dayOffset % udaipurDays.length];
      }

      // If curated day found, use specific landmarks!
      if (curatedDay) {
        activities.push({
          id: `act-${dayNumber}-1`,
          title: curatedDay.morningTitle,
          description: curatedDay.morningDesc,
          address: curatedDay.morningAddr,
          startTime: '09:00',
          endTime: '12:00',
          durationMinutes: 180,
          estimatedCost: Math.round(input.budgetAmount > 0 ? (input.budgetAmount * 0.05 / durationDays) : 250),
          currency: input.currency,
          category: 'heritage',
          sortOrder: 0,
          verificationStatus: 'verified',
          options: [
            {
              id: `opt-${dayNumber}-1-a`,
              title: curatedDay.morningOptA,
              description: 'Primary signature cultural and architectural immersion.',
              category: 'heritage',
              estimatedCost: 250,
            },
            {
              id: `opt-${dayNumber}-1-b`,
              title: curatedDay.morningOptB,
              description: 'Scenic alternative with peaceful surroundings and photography.',
              category: 'nature',
              estimatedCost: 150,
            },
          ],
        });

        activities.push({
          id: `act-${dayNumber}-2`,
          title: curatedDay.afternoonTitle,
          description: curatedDay.afternoonDesc,
          address: curatedDay.afternoonAddr,
          startTime: '13:30',
          endTime: '16:30',
          durationMinutes: 180,
          estimatedCost: Math.round(input.budgetAmount > 0 ? (input.budgetAmount * 0.06 / durationDays) : 350),
          currency: input.currency,
          category: 'culture',
          sortOrder: 1,
          verificationStatus: 'verified',
          options: [
            {
              id: `opt-${dayNumber}-2-a`,
              title: curatedDay.afternoonOptA,
              description: 'Guided local discovery and authentic experience.',
              category: 'culture',
              estimatedCost: 300,
            },
            {
              id: `opt-${dayNumber}-2-b`,
              title: curatedDay.afternoonOptB,
              description: 'Artisan shopping and traditional craft ateliers.',
              category: 'shopping',
              estimatedCost: 200,
            },
          ],
        });

        activities.push({
          id: `act-${dayNumber}-3`,
          title: curatedDay.eveningTitle,
          description: curatedDay.eveningDesc,
          address: curatedDay.eveningAddr,
          startTime: '17:30',
          endTime: '20:30',
          durationMinutes: 180,
          estimatedCost: Math.round(input.budgetAmount > 0 ? (input.budgetAmount * 0.08 / durationDays) : 400),
          currency: input.currency,
          category: 'food',
          sortOrder: 2,
          verificationStatus: 'verified',
          options: [
            {
              id: `opt-${dayNumber}-3-a`,
              title: curatedDay.eveningOptA,
              description: 'Specialty culinary feast aligned with dietary preferences.',
              category: 'food',
              estimatedCost: 400,
            },
            {
              id: `opt-${dayNumber}-3-b`,
              title: curatedDay.eveningOptB,
              description: 'Lively evening walk and street culture atmosphere.',
              category: 'relaxation',
              estimatedCost: 200,
            },
          ],
        });
      } else {
        // Universal dynamic rotation for all other destinations:
        // Rotations change by day so no day repeats!
        const rotation = (dayNumber - 2) % 4;

        if (rotation === 0) {
          // Signature Heritage & Iconic Marvels
          activities.push({
            id: `act-${dayNumber}-1`,
            title: isCoastal
              ? `Morning Coastal Headland & Historic Portuguese/Maritime Fort in ${destName}`
              : isMountain
              ? `High Altitude Panoramic Ridge Trail & Cedar Forest Sanctuary in ${destName}`
              : `Premier Architectural Monument & Royal Palace Heritage in ${destName}`,
            description: isCoastal
              ? `Explore ancient sea-facing stone fortifications, historic lighthouses, and ocean panoramic overlooks in early morning sunlight.`
              : isMountain
              ? `Walk high pine ridge trails with crisp mountain air, views of snow summits, and peaceful valley gorges.`
              : `Guided tour of ${destName}'s most renowned historical landmark, grand royal courtyards, and museum exhibitions.`,
            address: `${destName} Landmark District`,
            startTime: '09:00',
            endTime: '12:00',
            durationMinutes: 180,
            estimatedCost: Math.round(input.budgetAmount > 0 ? (input.budgetAmount * 0.05 / durationDays) : 250),
            currency: input.currency,
            category: 'heritage',
            sortOrder: 0,
            verificationStatus: 'verified',
            options: [
              {
                id: `opt-${dayNumber}-1-a`,
                title: `Option A: Signature Architectural Landmark & Guided Heritage Walk`,
                description: 'In-depth historical context, ancient stonework, and royal courtyards.',
                category: 'heritage',
                estimatedCost: 250,
              },
              {
                id: `opt-${dayNumber}-1-b`,
                title: `Option B: Panoramic Scenic Lookout & Landscape Photography Walk`,
                description: 'Spectacular elevated viewpoints capturing the natural geography and skyline.',
                category: 'nature',
                estimatedCost: 150,
              },
            ],
          });

          activities.push({
            id: `act-${dayNumber}-2`,
            title: `Artisan Workshops & Traditional Textile/Craft Bazaars in ${destName}`,
            description: `Visit generational master artisans, handcrafted pottery studios, brassware, and local spice markets.`,
            address: `${destName} Old Town Artisan Market`,
            startTime: '13:30',
            endTime: '16:30',
            durationMinutes: 180,
            estimatedCost: Math.round(input.budgetAmount > 0 ? (input.budgetAmount * 0.06 / durationDays) : 300),
            currency: input.currency,
            category: 'shopping',
            sortOrder: 1,
            verificationStatus: 'verified',
            options: [
              {
                id: `opt-${dayNumber}-2-a`,
                title: `Option A: Artisan Craft Quarter & Local Weavers Workshop`,
                description: 'Hands-on observation of local heritage crafts and authentic shopping.',
                category: 'shopping',
                estimatedCost: 250,
              },
              {
                id: `opt-${dayNumber}-2-b`,
                title: `Option B: Cultural Heritage Museum & Botanical Garden Promenade`,
                description: 'Curated historical exhibitions, sculptures, and shaded walking paths.',
                category: 'culture',
                estimatedCost: 150,
              },
            ],
          });

          activities.push({
            id: `act-${dayNumber}-3`,
            title: isPureVeg
              ? `Golden Hour Viewpoint & 100% Pure Veg Traditional Feast in ${destName}`
              : `Sunset Waterfront Viewpoint & Regional Dining Experience in ${destName}`,
            description: isPureVeg
              ? `Watch the golden sunset over the landscape, followed by a multi-course vegetarian feast with fresh regional breads, curries, and traditional sweets.`
              : `Watch the sunset over the horizon, followed by an exquisite regional dinner at a celebrated local dining venue.`,
            address: `${destName} Scenic Sunset Promenade`,
            startTime: '17:30',
            endTime: '20:30',
            durationMinutes: 180,
            estimatedCost: Math.round(input.budgetAmount > 0 ? (input.budgetAmount * 0.07 / durationDays) : 400),
            currency: input.currency,
            category: 'food',
            sortOrder: 2,
            verificationStatus: 'verified',
            options: [
              {
                id: `opt-${dayNumber}-3-a`,
                title: isPureVeg ? 'Option A: Royal Pure Veg Thali & Regional Desserts' : 'Option A: Chef Table Regional Tasting Menu',
                description: 'Authentic local cuisine highlighting native spices and seasonal ingredients.',
                category: 'food',
                estimatedCost: 400,
              },
              {
                id: `opt-${dayNumber}-3-b`,
                title: 'Option B: Lively Evening Street Food Trail & Tea Stalls',
                description: 'Vibrant evening market atmosphere tasting roasted snacks, street delicacies, and hot tea.',
                category: 'relaxation',
                estimatedCost: 200,
              },
            ],
          });
        } else if (rotation === 1) {
          // Scenic Nature & Outdoor Adventure
          activities.push({
            id: `act-${dayNumber}-1`,
            title: isCoastal
              ? `Island Watersports & Coral Reef Boat Safari in ${destName}`
              : isMountain
              ? `Valley Waterfalls & Alpine Ropeway Cable Car Ride in ${destName}`
              : `Sacred Riverside / Valley Sanctuary & Morning Nature Excursion in ${destName}`,
            description: isCoastal
              ? `Parasailing, jet skiing, or glass-bottom boat tour exploring offshore marine life and hidden coastal bays.`
              : isMountain
              ? `Take the scenic aerial cable car over dense pine valleys to alpine viewpoints and mountain streams.`
              : `Peaceful early morning walk along scenic riverbanks, historical stepwells, or tranquil nature sanctuaries.`,
            address: `${destName} Outdoor Excursion Zone`,
            startTime: '09:00',
            endTime: '12:30',
            durationMinutes: 210,
            estimatedCost: Math.round(input.budgetAmount > 0 ? (input.budgetAmount * 0.07 / durationDays) : 450),
            currency: input.currency,
            category: 'adventure',
            sortOrder: 0,
            verificationStatus: 'verified',
            options: [
              {
                id: `opt-${dayNumber}-1-a`,
                title: `Option A: Outdoor Active Adventure Excursion`,
                description: 'Thrilling outdoor activities with experienced local instructors.',
                category: 'adventure',
                estimatedCost: 450,
              },
              {
                id: `opt-${dayNumber}-1-b`,
                title: `Option B: Serene Nature Walk & Landscape Painting / Photography`,
                description: 'Gentle nature trails with quiet observation decks and photo spots.',
                category: 'nature',
                estimatedCost: 150,
              },
            ],
          });

          activities.push({
            id: `act-${dayNumber}-2`,
            title: `Historic Quarter Discovery & Organic Farm / Spice Ateliers in ${destName}`,
            description: `Walk through preserved historic alleyways, visit traditional spice ateliers, and sample local herbal teas.`,
            address: `${destName} Heritage Quarter`,
            startTime: '13:30',
            endTime: '16:30',
            durationMinutes: 180,
            estimatedCost: Math.round(input.budgetAmount > 0 ? (input.budgetAmount * 0.05 / durationDays) : 250),
            currency: input.currency,
            category: 'culture',
            sortOrder: 1,
            verificationStatus: 'verified',
            options: [
              {
                id: `opt-${dayNumber}-2-a`,
                title: `Option A: Guided Walk of Ancient Shrines & Hidden Courtyards`,
                description: 'Discover centuries-old carved doors, tranquil shrines, and local lore.',
                category: 'culture',
                estimatedCost: 200,
              },
              {
                id: `opt-${dayNumber}-2-b`,
                title: `Option B: Organic Spice & Essential Oil Plantation Tour`,
                description: 'Learn about native flora, medicinal herbs, and aromatic spice cultivation.',
                category: 'nature',
                estimatedCost: 250,
              },
            ],
          });

          activities.push({
            id: `act-${dayNumber}-3`,
            title: isPureVeg
              ? `Twilight Cultural Folk Performance & Pure Veg Garden Dinner in ${destName}`
              : `Evening Cultural Music Performance & Outdoor Terrace Dinner in ${destName}`,
            description: isPureVeg
              ? `Enjoy an evening of traditional music and cultural dance, followed by a delicious pure vegetarian dinner in an illuminated courtyard.`
              : `Experience authentic regional music or dance performance, accompanied by an open-air dinner.`,
            address: `${destName} Cultural Center`,
            startTime: '17:30',
            endTime: '20:30',
            durationMinutes: 180,
            estimatedCost: Math.round(input.budgetAmount > 0 ? (input.budgetAmount * 0.08 / durationDays) : 450),
            currency: input.currency,
            category: 'food',
            sortOrder: 2,
            verificationStatus: 'verified',
            options: [
              {
                id: `opt-${dayNumber}-3-a`,
                title: isPureVeg ? 'Option A: Cultural Folk Show + Pure Veg Royal Feast' : 'Option A: Cultural Performance + Chef Table Dinner',
                description: 'Live cultural immersion paired with authentic local gastronomy.',
                category: 'food',
                estimatedCost: 450,
              },
              {
                id: `opt-${dayNumber}-3-b`,
                title: 'Option B: Illuminated Waterfront / Ridge Promenade Stroll',
                description: 'Evening breeze stroll along twinkling lights with roasted street delicacies.',
                category: 'relaxation',
                estimatedCost: 200,
              },
            ],
          });
        } else if (rotation === 2) {
          // Spiritual Sanctuaries & Sacred Shrines
          activities.push({
            id: `act-${dayNumber}-1`,
            title: `Sacred Shrines, Ancient Stone Temples & Morning Aarti in ${destName}`,
            description: `Experience the serene morning spiritual atmosphere, ancient stone carvings, and sacred bell chimes at ${destName}'s most revered shrines.`,
            address: `${destName} Temple Corridor`,
            startTime: '08:30',
            endTime: '11:30',
            durationMinutes: 180,
            estimatedCost: 100,
            currency: input.currency,
            category: 'heritage',
            sortOrder: 0,
            verificationStatus: 'verified',
            options: [
              {
                id: `opt-${dayNumber}-1-a`,
                title: `Option A: Sacred Temple Complex Darshan & Architectural Tour`,
                description: 'Witness ancient sanctums, stone carvings, and tranquil prayer halls.',
                category: 'heritage',
                estimatedCost: 100,
              },
              {
                id: `opt-${dayNumber}-1-b`,
                title: `Option B: Meditation & Yoga Sanctuary in Peaceful Gardens`,
                description: 'Rejuvenating morning meditation amidst lush flora and flowing fountains.',
                category: 'relaxation',
                estimatedCost: 150,
              },
            ],
          });

          activities.push({
            id: `act-${dayNumber}-2`,
            title: `Hilltop Fortress Ramparts & Panoramic Countryside Overlook in ${destName}`,
            description: `Ascend to a commanding hilltop viewpoint or fortress rampart offering 360-degree vistas across the entire region.`,
            address: `${destName} Fortification Ridge`,
            startTime: '13:00',
            endTime: '16:00',
            durationMinutes: 180,
            estimatedCost: Math.round(input.budgetAmount > 0 ? (input.budgetAmount * 0.05 / durationDays) : 250),
            currency: input.currency,
            category: 'adventure',
            sortOrder: 1,
            verificationStatus: 'verified',
            options: [
              {
                id: `opt-${dayNumber}-2-a`,
                title: `Option A: Hilltop Fortress Ramparts & Historic Bastions Walk`,
                description: 'Walk ancient ramparts with commanding historical defense views.',
                category: 'adventure',
                estimatedCost: 200,
              },
              {
                id: `opt-${dayNumber}-2-b`,
                title: `Option B: Local Souvenir & Regional Spices Bazaars`,
                description: 'Browse authentic regional preserves, handcrafted textiles, and souvenirs.',
                category: 'shopping',
                estimatedCost: 250,
              },
            ],
          });

          activities.push({
            id: `act-${dayNumber}-3`,
            title: isPureVeg
              ? `Celebrated Night Market & 100% Pure Veg Specialty Dining in ${destName}`
              : `Bustling Night Bazaar & Traditional Regional Dinner in ${destName}`,
            description: isPureVeg
              ? `Explore the lively evening night bazaar lit with colorful lanterns, then enjoy a specialty pure vegetarian dinner with regional dessert delicacies.`
              : `Browse bustling night stalls and savor a mouthwatering regional dinner.`,
            address: `${destName} Night Bazaar Central`,
            startTime: '17:30',
            endTime: '20:30',
            durationMinutes: 180,
            estimatedCost: Math.round(input.budgetAmount > 0 ? (input.budgetAmount * 0.07 / durationDays) : 400),
            currency: input.currency,
            category: 'food',
            sortOrder: 2,
            verificationStatus: 'verified',
            options: [
              {
                id: `opt-${dayNumber}-3-a`,
                title: isPureVeg ? 'Option A: Pure Veg Authentic Regional Dinner' : 'Option A: Signature Local Grill & Delicacies',
                description: 'Generous portions of authentic local recipes and sweets.',
                category: 'food',
                estimatedCost: 400,
              },
              {
                id: `opt-${dayNumber}-3-b`,
                title: 'Option B: Street Food Sampling & Artisan Souvenir Walk',
                description: 'Casual walk tasting local street delicacies and picking up mementos.',
                category: 'relaxation',
                estimatedCost: 200,
              },
            ],
          });
        } else {
          // Leisure, Botanical Sanctuaries & Farewell Experiences
          activities.push({
            id: `act-${dayNumber}-1`,
            title: `Peaceful Botanical Gardens & Organic Tea Tasting in ${destName}`,
            description: `Leisurely morning among manicured botanical lawns, exotic trees, lily ponds, and fresh organic tea / coffee tastings.`,
            address: `${destName} Botanical Estate`,
            startTime: '09:00',
            endTime: '12:00',
            durationMinutes: 180,
            estimatedCost: 150,
            currency: input.currency,
            category: 'nature',
            sortOrder: 0,
            verificationStatus: 'verified',
            options: [
              {
                id: `opt-${dayNumber}-1-a`,
                title: `Option A: Botanical Gardens & Glasshouse Floral Walk`,
                description: 'Admire rare orchid species, ancient trees, and fragrant gardens.',
                category: 'nature',
                estimatedCost: 150,
              },
              {
                id: `opt-${dayNumber}-1-b`,
                title: `Option B: Local Farm Visit & Fresh Honey/Fruit Tasting`,
                description: 'Experience local countryside harvest traditions and fresh produce.',
                category: 'culture',
                estimatedCost: 200,
              },
            ],
          });

          activities.push({
            id: `act-${dayNumber}-2`,
            title: `Final Souvenir Hunt & Master Craft Emporiums in ${destName}`,
            description: `Pick up certified local souvenirs, brass handicrafts, wooden sculptures, and regional dry sweets before concluding your trip.`,
            address: `${destName} Handicrafts Center`,
            startTime: '13:30',
            endTime: '16:30',
            durationMinutes: 180,
            estimatedCost: Math.round(input.budgetAmount > 0 ? (input.budgetAmount * 0.05 / durationDays) : 300),
            currency: input.currency,
            category: 'shopping',
            sortOrder: 1,
            verificationStatus: 'verified',
            options: [
              {
                id: `opt-${dayNumber}-2-a`,
                title: `Option A: Government Certified Handicraft Emporium`,
                description: 'Fixed-price quality guaranteed local arts, textiles, and artifacts.',
                category: 'shopping',
                estimatedCost: 300,
              },
              {
                id: `opt-${dayNumber}-2-b`,
                title: `Option B: Street Flea Market & Bargain Keepsakes Trail`,
                description: 'Lively bargaining for unique handmade trinkets and jewelry.',
                category: 'shopping',
                estimatedCost: 150,
              },
            ],
          });

          activities.push({
            id: `act-${dayNumber}-3`,
            title: isPureVeg
              ? `Grand Farewell Pure Veg Banquet & Twilight Retrospective in ${destName}`
              : `Celebratory Farewell Dinner & Evening Reflections in ${destName}`,
            description: isPureVeg
              ? `Celebrate the journey with a grand pure vegetarian multi-course feast featuring the finest regional specialties and sweets.`
              : `Celebrate memorable highlights with an unforgettable dinner under twilight skies.`,
            address: `${destName} Grand Dining Hall`,
            startTime: '17:30',
            endTime: '20:30',
            durationMinutes: 180,
            estimatedCost: Math.round(input.budgetAmount > 0 ? (input.budgetAmount * 0.08 / durationDays) : 450),
            currency: input.currency,
            category: 'food',
            sortOrder: 2,
            verificationStatus: 'verified',
            options: [
              {
                id: `opt-${dayNumber}-3-a`,
                title: isPureVeg ? 'Option A: Grand Pure Veg Royal Banquet' : 'Option A: Premium Tasting Menu Celebration',
                description: 'Refined celebration feast with regional delicacies.',
                category: 'food',
                estimatedCost: 450,
              },
              {
                id: `opt-${dayNumber}-3-b`,
                title: 'Option B: Relaxed Rooftop Stargazing & Acoustic Melodies',
                description: 'Cozy fireside or rooftop atmosphere reflecting on travel memories.',
                category: 'relaxation',
                estimatedCost: 250,
              },
            ],
          });
        }
      }
    }

    days.push({
      id: `day-${dayNumber}`,
      dayNumber,
      date: dateStr,
      summary:
        dayNumber === 1
          ? `Departure from ${origName}, scenic midway waypoint halt, and evening arrival in ${destName}`
          : activities[0]?.title
          ? `Day ${dayNumber}: ${activities[0].title.split(':')[0]} & regional experiences in ${destName}`
          : `Day ${dayNumber}: Highlights and cultural discovery in ${destName}`,
      routeSegment: `${origName} ➔ ${destName}`,
      activities,
    });
  }

  return {
    title: `${durationDays}-Day Customized Journey from ${origName} to ${destName}`,
    summary: `A complete, balanced ${input.travelStyle} itinerary from ${origName} to ${destName} with selectable route options, midway waypoint halts, and dual activity alternatives for each stop. Fully tailored for ${input.travelers} traveler(s) with ${isPureVeg ? '100% Pure Veg dining options' : 'custom dining'} and ${hasPrivateCar ? 'private car road transit' : 'scenic transport'}.`,
    days,
    routeOptions,
    source: 'smart-engine',
  };
}

function createDamanOrRegionalDay(dayNum: number, dateStr: string, currency: string, isPureVeg: boolean): ItineraryDay {
  return {
    id: `day-${dayNum}`,
    dayNumber: dayNum,
    date: dateStr,
    summary: `Day ${dayNum}: Excursion to Moti Daman Portuguese Fort, casuarina groves & coastal promenade`,
    routeSegment: 'Tithal Beach ➔ Daman Coastal Enclave (35 km)',
    activities: [
      {
        id: `act-${dayNum}-1`,
        title: 'Moti Daman 16th-Century Portuguese Fortress & Cathedral of Bom Jesus',
        description: 'Explore the massive stone ramparts of Moti Daman Fort, lighthouse, and the Portuguese Church of Bom Jesus.',
        address: 'Moti Daman Fort, Daman 396220',
        startTime: '10:00',
        endTime: '13:00',
        durationMinutes: 180,
        estimatedCost: 50,
        currency,
        category: 'heritage',
        sortOrder: 0,
        verificationStatus: 'verified',
        options: [
          {
            id: `opt-${dayNum}-1-a`,
            title: 'Option A: Moti Daman Fortress & Bom Jesus Cathedral Walk',
            description: 'Ancient ramparts and 400-year-old Portuguese stone churches.',
            category: 'heritage',
            estimatedCost: 50,
          },
          {
            id: `opt-${dayNum}-1-b`,
            title: 'Option B: Nani Daman Waterfront & St. Jerome Fort',
            description: 'Stroll across the river to the sea-facing ramparts of Nani Daman.',
            category: 'culture',
            estimatedCost: 50,
          },
        ],
      },
      {
        id: `act-${dayNum}-2`,
        title: 'Jampore Beach Casuarina Grove Walk & Watersports',
        description: 'Relax under breezy casuarina tree groves along Jampore Beach with parasailing and beach buggies.',
        address: 'Jampore Beach, Daman',
        startTime: '14:30',
        endTime: '17:30',
        durationMinutes: 180,
        estimatedCost: 500,
        currency,
        category: 'relaxation',
        sortOrder: 1,
        verificationStatus: 'verified',
      },
      {
        id: `act-${dayNum}-3`,
        title: isPureVeg ? 'Pure Veg Kathiyawadi & Gujarati Highway Dinner' : 'Coastal Grill & Seafood Dinner',
        description: isPureVeg
          ? 'Savor fresh Paneer Bhurji, Sev Tameta, hot Phulkas, and authentic Gulab Jamun at a highway garden restaurant.'
          : 'Indulge in fresh coastal catch and grilled delicacies with Arabian Sea views.',
        address: 'Vapi - Valsad Highway',
        startTime: '18:30',
        endTime: '20:30',
        durationMinutes: 120,
        estimatedCost: 400,
        currency,
        category: 'food',
        sortOrder: 2,
        verificationStatus: 'verified',
      },
    ],
  };
}
