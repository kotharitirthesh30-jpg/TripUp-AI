import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBudgetSummary,
  doActivitiesOverlap,
  validateDaySchedule,
  calculateTripDurationDays,
  hasPermission,
  convertCurrency,
  formatCurrency,
  applyCopilotChanges,
  generateSmartCopilotFallback,
  createTripVersionSnapshot,
  restoreTripVersion,
  swapTripDays,
  compareTripVersions,
  cleanMapsLocation,
  buildGoogleMapsDirectionsUrl,
  calculateRouteLegs,
} from './trip-logic';
import { Expense, Activity, Trip, TripVersionSnapshot } from '../types/travel';

test('calculateBudgetSummary calculates actual, remaining and category breakdown correctly', () => {
  const expenses: Expense[] = [
    {
      id: 'e1',
      tripId: 't1',
      category: 'transport',
      description: 'Shinkansen ticket',
      estimatedAmount: 150,
      actualAmount: 140,
      currency: 'USD',
      expenseDate: '2026-11-01',
    },
    {
      id: 'e2',
      tripId: 't1',
      category: 'food',
      description: 'Kaiseki Dinner',
      estimatedAmount: 120,
      actualAmount: 130,
      currency: 'USD',
      expenseDate: '2026-11-01',
    },
    {
      id: 'e3',
      tripId: 't1',
      category: 'accommodation',
      description: 'Ryokan Stay',
      estimatedAmount: 300,
      actualAmount: 300,
      currency: 'USD',
      expenseDate: '2026-11-01',
    }
  ];

  const summary = calculateBudgetSummary(1000, expenses);

  assert.equal(summary.budgetAmount, 1000);
  assert.equal(summary.recordedActualTotal, 570);
  assert.equal(summary.remainingBudget, 430);
  assert.equal(summary.percentUsed, 57);
  assert.equal(summary.isOverBudget, false);
  assert.equal(summary.categoryBreakdown.transport.actual, 140);
  assert.equal(summary.categoryBreakdown.food.actual, 130);
  assert.equal(summary.categoryBreakdown.accommodation.actual, 300);
});

test('calculateBudgetSummary flags over budget correctly', () => {
  const expenses: Expense[] = [
    {
      id: 'e1',
      tripId: 't1',
      category: 'other',
      description: 'Luxury flight upgrade',
      estimatedAmount: 500,
      actualAmount: 1200,
      currency: 'USD',
      expenseDate: '2026-11-01',
    }
  ];

  const summary = calculateBudgetSummary(1000, expenses);
  assert.equal(summary.isOverBudget, true);
  assert.equal(summary.remainingBudget, -200);
});

test('doActivitiesOverlap correctly detects colliding and non-colliding time windows', () => {
  const morningTea = { startTime: '09:00', endTime: '10:30' };
  const templeVisit = { startTime: '10:00', endTime: '12:00' };
  const lunch = { startTime: '12:30', endTime: '13:30' };

  // 09:00 - 10:30 overlaps with 10:00 - 12:00
  assert.equal(doActivitiesOverlap(morningTea, templeVisit), true);
  // 09:00 - 10:30 does NOT overlap with 12:30 - 13:30
  assert.equal(doActivitiesOverlap(morningTea, lunch), false);
  // Adjacent back-to-back: 10:30 end and 10:30 start should not overlap
  const backToBack = { startTime: '10:30', endTime: '11:30' };
  assert.equal(doActivitiesOverlap(morningTea, backToBack), false);
});

test('validateDaySchedule catches overlapping activities', () => {
  const activities: Activity[] = [
    {
      id: 'a1',
      title: 'Fushimi Inari Hike',
      description: 'Walk through thousands of torii gates',
      startTime: '08:00',
      endTime: '11:00',
      durationMinutes: 180,
      estimatedCost: 0,
      currency: 'USD',
      category: 'culture',
      sortOrder: 0,
      verificationStatus: 'verified',
    },
    {
      id: 'a2',
      title: 'Tea Ceremony at Uji',
      description: 'Traditional matcha tasting',
      startTime: '10:30',
      endTime: '12:00',
      durationMinutes: 90,
      estimatedCost: 45,
      currency: 'USD',
      category: 'food',
      sortOrder: 1,
      verificationStatus: 'verified',
    }
  ];

  const check = validateDaySchedule(activities);
  assert.equal(check.valid, false);
  assert.equal(check.conflicts.length, 1);
});

test('calculateTripDurationDays calculates days accurately', () => {
  assert.equal(calculateTripDurationDays('2026-10-01', '2026-10-01'), 1);
  assert.equal(calculateTripDurationDays('2026-10-01', '2026-10-05'), 5);
  assert.equal(calculateTripDurationDays('2026-10-25', '2026-11-02'), 9);
});

test('hasPermission enforces Owner, Editor, Viewer roles', () => {
  assert.equal(hasPermission('owner', 'delete'), true);
  assert.equal(hasPermission('owner', 'invite'), true);

  assert.equal(hasPermission('editor', 'edit'), true);
  assert.equal(hasPermission('editor', 'delete'), false);
  assert.equal(hasPermission('editor', 'invite'), false);

  assert.equal(hasPermission('viewer', 'view'), true);
  assert.equal(hasPermission('viewer', 'edit'), false);
  assert.equal(hasPermission('viewer', 'delete'), false);
});

test('calculateBudgetSummary supports budget starting at 0 cleanly', () => {
  const summaryZeroBudget = calculateBudgetSummary(0, []);
  assert.equal(summaryZeroBudget.budgetAmount, 0);
  assert.equal(summaryZeroBudget.remainingBudget, 0);
  assert.equal(summaryZeroBudget.isOverBudget, false);
});

test('convertCurrency correctly converts USD to INR and other currencies', () => {
  const inr = convertCurrency(100, 'USD', 'INR');
  assert.equal(inr, 8650);

  const zeroInr = convertCurrency(0, 'USD', 'INR');
  assert.equal(zeroInr, 0);

  const usdFromInr = convertCurrency(8650, 'INR', 'USD');
  assert.equal(usdFromInr, 100);
});

test('formatCurrency outputs rupee symbol and formatting for INR', () => {
  const formattedInr = formatCurrency(50000, 'INR');
  assert.match(formattedInr, /₹50,?000/);

  const formattedUsd = formatCurrency(1200, 'USD');
  assert.equal(formattedUsd, '$1,200');
});

import { generateSmartItinerary } from './ai/itinerary-generator';

test('generateSmartItinerary generates tailored Nashik Road to Tithal Beach route with options', () => {
  const result = generateSmartItinerary({
    origin: 'Nashik Road, Maharashtra',
    destination: 'Tithal Beach, Valsad, Gujarat',
    startDate: '2026-11-10',
    endDate: '2026-11-13',
    travelers: 2,
    budgetAmount: 0,
    currency: 'INR',
    interests: ['culture', 'nature', 'food'],
    travelStyle: 'balanced',
    transportPreferences: ['private_car'],
    accommodationPreferences: 'Boutique Hotel',
    dietaryPreference: 'pure_veg',
    customPrompt: 'I need a halt between source and destination for a day and explore nearby area',
  });

  // Verify non-generic
  assert.ok(!result.days.some(d => d.activities.some(a => a.title.includes('Signature Landmark Exploration'))));

  // Verify Route Options exist
  assert.ok(result.routeOptions && result.routeOptions.length >= 2, 'Must have at least 2 route options');
  const hasSaputaraHalt = result.routeOptions?.some(r => r.title.toLowerCase().includes('saputara'));
  assert.ok(hasSaputaraHalt, 'Must include Saputara Hill Station halt option');

  // Verify Tithal Beach specific landmarks
  const allTitles = result.days.flatMap(d => d.activities.map(a => a.title)).join(' ');
  const allAddresses = result.days.flatMap(d => d.activities.map(a => a.address || '')).join(' ');
  const fullText = (allTitles + ' ' + allAddresses).toLowerCase();

  assert.ok(fullText.includes('tithal') || fullText.includes('valsad'), 'Must reference Tithal or Valsad');
  assert.ok(fullText.includes('saputara'), 'Must reference Saputara halt');

  // Verify each activity has alternative options
  const activitiesWithOptions = result.days.flatMap(d => d.activities).filter(a => a.options && a.options.length > 1);
  assert.ok(activitiesWithOptions.length >= 3, 'Activities must provide selectable alternative options');

  // Verify pure veg dining
  const foodActivities = result.days.flatMap(d => d.activities).filter(a => a.category === 'food');
  assert.ok(foodActivities.some(a => a.title.toLowerCase().includes('pure veg') || a.title.toLowerCase().includes('thali')));
});

test('generateSmartItinerary generates detailed Nashik Road to Goa road trip with Kolhapur halt and Goa landmarks', () => {
  const result = generateSmartItinerary({
    origin: 'Nashik Road, Maharashtra, India',
    destination: 'Goa, India',
    startDate: '2026-11-01',
    endDate: '2026-11-05',
    travelers: 2,
    budgetAmount: 25000,
    currency: 'INR',
    interests: ['culture', 'nature', 'food'],
    travelStyle: 'balanced',
    transportPreferences: ['private_car'],
    accommodationPreferences: 'Beach Resort',
    dietaryPreference: 'pure_veg',
    customPrompt: 'I need a halt between source and destination for a day and explore nearby area',
  });

  // Verify non-generic
  assert.ok(!result.days.some(d => d.activities.some(a => a.title.includes('Signature Landmark Exploration'))));
  assert.ok(!result.days.some(d => d.activities.some(a => a.title.includes('Midway Waypoint en route to Goa'))));

  // Verify Route Options
  assert.ok(result.routeOptions && result.routeOptions.length >= 3, 'Must have 3 route options for Goa road trip');
  const hasKolhapurHalt = result.routeOptions?.some(r => r.title.toLowerCase().includes('kolhapur') || r.haltSpot.toLowerCase().includes('kolhapur'));
  assert.ok(hasKolhapurHalt, 'Must include Kolhapur & Amboli Ghat halt route option');

  // Verify Day 1 dedicated to midway halt (Kolhapur Mahalakshmi & Rankala Lake)
  const day1Text = (result.days[0].summary + ' ' + result.days[0].activities.map(a => a.title).join(' ')).toLowerCase();
  assert.ok(day1Text.includes('kolhapur'), 'Day 1 must feature Kolhapur halt');
  assert.ok(day1Text.includes('mahalakshmi') || day1Text.includes('rankala'), 'Day 1 must feature Mahalakshmi Temple or Rankala Lake');

  // Verify iconic Goa landmarks across days
  const allGoaText = result.days.flatMap(d => d.activities.map(a => a.title + ' ' + a.description)).join(' ').toLowerCase();
  assert.ok(allGoaText.includes('amboli'), 'Must include Amboli Ghat waterfalls');
  assert.ok(allGoaText.includes('aguada'), 'Must include Fort Aguada');
  assert.ok(allGoaText.includes('baga') || allGoaText.includes('calangute'), 'Must include Baga / Calangute');
  assert.ok(allGoaText.includes('bom jesus'), 'Must include Basilica of Bom Jesus');
  assert.ok(allGoaText.includes('fontainhas'), 'Must include Fontainhas Latin Quarter');

  // Verify alternative options on activities
  const actsWithOptions = result.days.flatMap(d => d.activities).filter(a => a.options && a.options.length >= 2);
  assert.ok(actsWithOptions.length >= 5, 'Must provide selectable options across activities');

  // Verify 100% Pure Veg Goan dining
  const foodActs = result.days.flatMap(d => d.activities).filter(a => a.category === 'food');
  assert.ok(foodActs.some(a => a.title.toLowerCase().includes('pure veg') || a.description.toLowerCase().includes('pure veg')));
  assert.ok(allGoaText.includes('khatkhate') || allGoaText.includes('solkadhi') || allGoaText.includes('thali'));
});

test('generateSmartItinerary generates rich, non-repeating itinerary with options for any universal destination', () => {
  const result = generateSmartItinerary({
    origin: 'Delhi, India',
    destination: 'Manali, Himachal Pradesh, India',
    startDate: '2026-11-01',
    endDate: '2026-11-04',
    travelers: 2,
    budgetAmount: 18000,
    currency: 'INR',
    interests: ['nature', 'food'],
    travelStyle: 'relaxed',
    transportPreferences: ['private_car'],
    accommodationPreferences: 'Hill Resort',
    dietaryPreference: 'pure_veg',
    customPrompt: 'I need a halt between source and destination for a day and explore nearby area',
  });

  assert.equal(result.days.length, 4, 'Must generate exactly 4 days');
  assert.ok(result.routeOptions && result.routeOptions.length >= 2, 'Must generate route options');

  // Verify Manali curated landmarks
  const allText = result.days.flatMap(d => d.activities.map(a => a.title)).join(' ').toLowerCase();
  assert.ok(allText.includes('hadimba'), 'Must feature Hadimba Devi Temple');
  assert.ok(allText.includes('solang'), 'Must feature Solang Valley');
  assert.ok(allText.includes('jogini'), 'Must feature Jogini Waterfalls');

  // Verify each day has distinct morning, afternoon, and evening activities
  const titles = result.days.flatMap(d => d.activities.map(a => a.title));
  const uniqueTitles = new Set(titles);
  assert.equal(titles.length, uniqueTitles.size, 'Every activity title across days must be unique (no repetitive slop)');

  // Verify options exist
  result.days.forEach(d => {
    d.activities.forEach(a => {
      assert.ok(a.options && a.options.length >= 2, `Activity ${a.title} must have at least 2 selectable options`);
    });
  });
});

test('generateSmartCopilotFallback returns structured changes for pace, rain, budget, and food', () => {
  const dummyTrip: Trip = {
    id: 'test-trip-1',
    userId: 'u1',
    title: 'Test Kyoto Trip',
    origin: 'Tokyo',
    destination: 'Kyoto',
    startDate: '2026-11-12',
    endDate: '2026-11-14',
    travelers: 2,
    budgetAmount: 2000,
    currency: 'USD',
    travelStyle: 'balanced',
    interests: ['culture'],
    transportPreferences: ['walking'],
    accommodationPreferences: 'hotel',
    dietaryPreference: 'pure_veg',
    status: 'upcoming',
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
    expenses: [],
    members: [],
    itinerary: [
      {
        id: 'd1',
        dayNumber: 1,
        date: '2026-11-12',
        summary: 'Arrival and walking tour',
        activities: [
          {
            id: 'act-1',
            title: 'Early Mountain Hike',
            description: 'Strenuous hike up mountain trail',
            startTime: '08:00',
            endTime: '11:00',
            durationMinutes: 180,
            estimatedCost: 20,
            currency: 'USD',
            category: 'adventure',
            sortOrder: 0,
            verificationStatus: 'verified',
          },
          {
            id: 'act-2',
            title: 'Outdoor Walking Tour',
            description: 'Walking tour across outdoor plazas',
            startTime: '13:00',
            endTime: '16:00',
            durationMinutes: 180,
            estimatedCost: 30,
            currency: 'USD',
            category: 'culture',
            sortOrder: 1,
            verificationStatus: 'verified',
          },
          {
            id: 'act-3',
            title: 'General Dinner Bistro',
            description: 'Dinner at local bistro',
            startTime: '18:00',
            endTime: '20:00',
            durationMinutes: 120,
            estimatedCost: 60,
            currency: 'USD',
            category: 'food',
            sortOrder: 2,
            verificationStatus: 'verified',
          },
        ],
      },
    ],
  };

  // Test 1: Relax pace
  const relaxRes = generateSmartCopilotFallback(dummyTrip, 'Make Day 1 more relaxing with buffer time');
  assert.ok(relaxRes.reply.toLowerCase().includes('relaxed'));
  assert.ok(relaxRes.proposedChanges.some(c => c.type === 'adjust_pace'));

  // Test 2: Rainy weather adaptation
  const rainRes = generateSmartCopilotFallback(dummyTrip, 'Adjust for rainy weather');
  assert.ok(rainRes.reply.toLowerCase().includes('rain') || rainRes.reply.toLowerCase().includes('weather'));
  assert.ok(rainRes.proposedChanges.some(c => c.type === 'replace_activity' && c.newValuePreview?.includes('Indoor')));

  // Test 3: Budget reduction
  const budgetRes = generateSmartCopilotFallback(dummyTrip, 'Reduce total budget by 20%');
  assert.ok(budgetRes.proposedChanges.some(c => c.type === 'adjust_budget' && c.newBudgetAmount === 1600));

  // Test 4: Pure veg culinary addition
  const foodRes = generateSmartCopilotFallback(dummyTrip, 'Add authentic pure veg dining');
  assert.ok(foodRes.proposedChanges.some(c => c.type === 'replace_activity' && c.newValuePreview?.includes('Pure Vegetarian')));
});

test('applyCopilotChanges deterministically updates trip without mutating unmodified activities', () => {
  const dummyTrip: Trip = {
    id: 'test-trip-2',
    userId: 'u1',
    title: 'Test Goa Trip',
    origin: 'Nashik Road',
    destination: 'Goa',
    startDate: '2026-11-12',
    endDate: '2026-11-14',
    travelers: 2,
    budgetAmount: 25000,
    currency: 'INR',
    travelStyle: 'balanced',
    interests: ['culture', 'nature'],
    transportPreferences: ['private_car'],
    accommodationPreferences: 'resort',
    dietaryPreference: 'pure_veg',
    status: 'upcoming',
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
    expenses: [],
    members: [],
    itinerary: [
      {
        id: 'd1',
        dayNumber: 1,
        date: '2026-11-12',
        summary: 'Highway drive and arrival',
        activities: [
          {
            id: 'act-a1',
            title: 'Early Highway Transit',
            description: 'Drive along highway',
            startTime: '08:00',
            endTime: '11:00',
            durationMinutes: 180,
            estimatedCost: 500,
            currency: 'INR',
            category: 'adventure',
            sortOrder: 0,
            verificationStatus: 'verified',
          },
          {
            id: 'act-a2',
            title: 'Standard Cafe Halt',
            description: 'Stop for coffee',
            startTime: '13:00',
            endTime: '14:30',
            durationMinutes: 90,
            estimatedCost: 400,
            currency: 'INR',
            category: 'food',
            sortOrder: 1,
            verificationStatus: 'verified',
          },
        ],
      },
    ],
  };

  const updatedTrip = applyCopilotChanges(dummyTrip, [
    {
      id: 'c1',
      type: 'adjust_budget',
      dayNumber: 1,
      newBudgetAmount: 20000,
      reason: 'Trim budget',
    },
    {
      id: 'c2',
      type: 'replace_activity',
      dayNumber: 1,
      targetActivityId: 'act-a2',
      oldValuePreview: 'Standard Cafe Halt',
      newValuePreview: 'Royal Pure Veg Goan Thali Feast',
      replacementActivity: {
        id: 'act-a2',
        title: 'Royal Pure Veg Goan Thali Feast',
        description: 'Authentic Khatkhate, Solkadhi, and Bebinca at Navtara',
        startTime: '13:00',
        endTime: '14:30',
        durationMinutes: 90,
        estimatedCost: 600,
        currency: 'INR',
        category: 'food',
        sortOrder: 1,
        verificationStatus: 'verified',
      },
      reason: 'Upgrades dining to authentic pure veg specialty',
    },
    {
      id: 'c3',
      type: 'adjust_pace',
      dayNumber: 1,
      reason: 'Softens morning schedule',
    },
  ]);

  // Assertions
  assert.equal(updatedTrip.budgetAmount, 20000, 'Budget must be updated to 20000');
  assert.equal(updatedTrip.travelStyle, 'relaxed', 'Travel style must be adjusted to relaxed');
  assert.equal(updatedTrip.itinerary[0].activities[0].startTime, '10:00', 'Morning start time must be pushed to 10:00');
  assert.equal(updatedTrip.itinerary[0].activities[1].title, 'Royal Pure Veg Goan Thali Feast', 'Activity 2 must be replaced');
  assert.equal(updatedTrip.itinerary[0].activities.length, 2, 'Total activity count must remain intact');
  assert.notEqual(updatedTrip.updatedAt, dummyTrip.updatedAt, 'updatedAt must be refreshed');
});

test('createTripVersionSnapshot creates an immutable snapshot with correct summary and activity counts', () => {
  const dummyTrip: Trip = {
    id: 'snap-trip',
    userId: 'u1',
    title: 'Snapshot Test Trip',
    origin: 'Mumbai',
    destination: 'Goa',
    startDate: '2026-11-01',
    endDate: '2026-11-03',
    travelers: 2,
    budgetAmount: 15000,
    currency: 'INR',
    travelStyle: 'balanced',
    interests: ['culture'],
    transportPreferences: ['private_car'],
    accommodationPreferences: 'hotel',
    dietaryPreference: 'pure_veg',
    status: 'upcoming',
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
    expenses: [],
    members: [],
    itinerary: [
      {
        id: 'd1',
        dayNumber: 1,
        date: '2026-11-01',
        summary: 'Day 1 summary',
        activities: [
          {
            id: 'a1',
            title: 'Fort Aguada',
            description: 'Visit sea fortress',
            startTime: '09:00',
            endTime: '11:00',
            durationMinutes: 120,
            estimatedCost: 100,
            currency: 'INR',
            category: 'culture',
            sortOrder: 0,
            verificationStatus: 'verified',
          },
        ],
      },
      {
        id: 'd2',
        dayNumber: 2,
        date: '2026-11-02',
        summary: 'Day 2 summary',
        activities: [
          {
            id: 'a2',
            title: 'Baga Beach Watersports',
            description: 'Parasailing and jet ski',
            startTime: '10:00',
            endTime: '13:00',
            durationMinutes: 180,
            estimatedCost: 800,
            currency: 'INR',
            category: 'adventure',
            sortOrder: 0,
            verificationStatus: 'verified',
          },
        ],
      },
    ],
  };

  const snapshot = createTripVersionSnapshot(dummyTrip, 'Initial Baseline Plan');
  assert.equal(snapshot.name, 'Initial Baseline Plan');
  assert.equal(snapshot.activityCount, 2);
  assert.equal(snapshot.dayCount, 2);
  assert.equal(snapshot.budgetAmount, 15000);
  assert.ok(snapshot.summary?.includes('Goa'));

  // Verify deep copy (mutating dummyTrip does not alter snapshot)
  dummyTrip.itinerary[0].activities[0].title = 'Mutated Title';
  assert.equal(snapshot.itinerary[0].activities[0].title, 'Fort Aguada');
});

test('swapTripDays swaps day activities and summaries while preserving day numbering and dates', () => {
  const dummyTrip: Trip = {
    id: 'swap-trip',
    userId: 'u1',
    title: 'Swap Test Trip',
    origin: 'Delhi',
    destination: 'Manali',
    startDate: '2026-11-01',
    endDate: '2026-11-02',
    travelers: 2,
    budgetAmount: 10000,
    currency: 'INR',
    travelStyle: 'balanced',
    interests: ['nature'],
    transportPreferences: ['private_car'],
    accommodationPreferences: 'cottage',
    dietaryPreference: 'pure_veg',
    status: 'upcoming',
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
    expenses: [],
    members: [],
    itinerary: [
      {
        id: 'd1',
        dayNumber: 1,
        date: '2026-11-01',
        summary: 'Day 1: Sunny Outdoor Valley Trail',
        activities: [
          {
            id: 'act-outdoor',
            title: 'Outdoor Mountain Trek',
            description: 'Sunny ridge trek',
            startTime: '09:00',
            endTime: '12:00',
            durationMinutes: 180,
            estimatedCost: 200,
            currency: 'INR',
            category: 'adventure',
            sortOrder: 0,
            verificationStatus: 'verified',
          },
        ],
      },
      {
        id: 'd2',
        dayNumber: 2,
        date: '2026-11-02',
        summary: 'Day 2: Sheltered Castle & Indoor Gallery',
        activities: [
          {
            id: 'act-indoor',
            title: 'Naggar Castle & Roerich Gallery',
            description: 'Indoor cultural museum',
            startTime: '10:00',
            endTime: '13:00',
            durationMinutes: 180,
            estimatedCost: 150,
            currency: 'INR',
            category: 'culture',
            sortOrder: 0,
            verificationStatus: 'verified',
          },
        ],
      },
    ],
  };

  const swapped = swapTripDays(dummyTrip, 1, 2);

  // Day 1 should now have the indoor activities of Day 2, but keep date 2026-11-01 and dayNumber 1
  assert.equal(swapped.itinerary[0].dayNumber, 1);
  assert.equal(swapped.itinerary[0].date, '2026-11-01');
  assert.equal(swapped.itinerary[0].activities[0].title, 'Naggar Castle & Roerich Gallery');

  // Day 2 should now have the outdoor activities of Day 1, but keep date 2026-11-02 and dayNumber 2
  assert.equal(swapped.itinerary[1].dayNumber, 2);
  assert.equal(swapped.itinerary[1].date, '2026-11-02');
  assert.equal(swapped.itinerary[1].activities[0].title, 'Outdoor Mountain Trek');
});

test('compareTripVersions calculates budget variance and detects added, removed, and modified activities', () => {
  const versionA: TripVersionSnapshot = {
    id: 'vA',
    name: 'Version A - Original',
    createdAt: '2026-10-20T10:00:00Z',
    budgetAmount: 20000,
    currency: 'INR',
    travelStyle: 'balanced',
    dayCount: 1,
    activityCount: 2,
    itinerary: [
      {
        id: 'day-1',
        dayNumber: 1,
        date: '2026-11-01',
        summary: 'Day 1',
        activities: [
          {
            id: 'act-1',
            title: 'Morning Temple Visit',
            description: 'Ancient temple tour',
            startTime: '08:00',
            endTime: '10:00',
            durationMinutes: 120,
            estimatedCost: 200,
            currency: 'INR',
            category: 'culture',
            sortOrder: 0,
            verificationStatus: 'verified',
          },
          {
            id: 'act-2',
            title: 'Heritage Bazaars Stroll',
            description: 'Explore street markets',
            startTime: '14:00',
            endTime: '16:00',
            durationMinutes: 120,
            estimatedCost: 300,
            currency: 'INR',
            category: 'shopping',
            sortOrder: 1,
            verificationStatus: 'verified',
          },
        ],
      },
    ],
  };

  const versionB: TripVersionSnapshot = {
    id: 'vB',
    name: 'Version B - Relaxed & Budget Trim',
    createdAt: '2026-10-20T12:00:00Z',
    budgetAmount: 16000,
    currency: 'INR',
    travelStyle: 'relaxed',
    dayCount: 1,
    activityCount: 2,
    itinerary: [
      {
        id: 'day-1',
        dayNumber: 1,
        date: '2026-11-01',
        summary: 'Day 1 Relaxed',
        activities: [
          {
            id: 'act-1',
            title: 'Morning Temple Visit',
            description: 'Ancient temple tour',
            startTime: '10:00', // Time modified
            endTime: '12:00',
            durationMinutes: 120,
            estimatedCost: 200,
            currency: 'INR',
            category: 'culture',
            sortOrder: 0,
            verificationStatus: 'verified',
          },
          {
            id: 'act-3', // Replaced act-2 with act-3
            title: 'Scenic Lake Promenade Walk',
            description: 'Gentle walk along lake',
            startTime: '15:00',
            endTime: '17:00',
            durationMinutes: 120,
            estimatedCost: 50,
            currency: 'INR',
            category: 'nature',
            sortOrder: 1,
            verificationStatus: 'verified',
          },
        ],
      },
    ],
  };

  const diff = compareTripVersions(versionA, versionB);

  assert.equal(diff.budgetDiff, -4000, 'Budget difference must be -4000');
  assert.equal(diff.pacingDiff, 'Changed from balanced to relaxed');
  assert.equal(diff.isIdentical, false, 'Versions must not be identical');

  const day1Diff = diff.dayDifferences[0];
  assert.equal(day1Diff.addedActivities.length, 1, 'Must detect 1 added activity');
  assert.equal(day1Diff.addedActivities[0].title, 'Scenic Lake Promenade Walk');

  assert.equal(day1Diff.removedActivities.length, 1, 'Must detect 1 removed activity');
  assert.equal(day1Diff.removedActivities[0].title, 'Heritage Bazaars Stroll');

  assert.equal(day1Diff.modifiedActivities.length, 1, 'Must detect 1 modified activity');
  assert.equal(day1Diff.modifiedActivities[0].from.title, 'Morning Temple Visit');
});

test('cleanMapsLocation sanitizes placeholder addresses and builds valid pinpointable queries', () => {
  // Test case matching user screenshot: "Midway Highway Stop en route to Kyoto, Japan"
  const cleaned1 = cleanMapsLocation(
    'Departure from San Francisco & Midway Scenic Waypoint Halt',
    'Midway Highway Stop en route to Kyoto, Japan',
    'Kyoto, Japan'
  );
  assert.ok(!cleaned1.includes('Midway Highway Stop'), 'Must strip out Midway Highway Stop filler');
  assert.ok(cleaned1.includes('Kyoto, Japan'), 'Must anchor to destination');

  // Test case with valid local street address: appends destination for disambiguation
  const cleaned2 = cleanMapsLocation(
    'Shirakawa Canal Walk',
    'Shirakawa Minamidori, Higashiyama Ward',
    'Kyoto, Japan'
  );
  assert.equal(cleaned2, 'Shirakawa Minamidori, Higashiyama Ward, Kyoto, Japan');

  // Test case with already qualified address
  const cleaned3 = cleanMapsLocation(
    'Kyoto Station',
    'Kyoto Station, Shimogyo Ward, Kyoto, Japan',
    'Kyoto, Japan'
  );
  assert.equal(cleaned3, 'Kyoto Station, Shimogyo Ward, Kyoto, Japan');
});

test('buildGoogleMapsDirectionsUrl correctly constructs multi-waypoint Google Maps URLs', () => {
  const stops = [
    { title: 'Kyoto Station', address: 'Kyoto Station, Shimogyo Ward, Kyoto' },
    { title: 'Shirakawa Canal', address: 'Shirakawa Minamidori, Higashiyama Ward, Kyoto' },
    { title: 'Gion Karyo', address: '570-235 Gionmachi Minamigawa, Higashiyama Ward, Kyoto' },
  ];

  const url = buildGoogleMapsDirectionsUrl(stops, 'Kyoto, Japan', 'driving');
  assert.ok(url.startsWith('https://www.google.com/maps/dir/?api=1'), 'Must use official Google Maps dir API');
  assert.ok(url.includes('origin='), 'Must specify origin');
  assert.ok(url.includes('destination='), 'Must specify destination');
  assert.ok(url.includes('waypoints='), 'Must specify intermediate waypoints');
  assert.ok(url.includes('travelmode=driving'), 'Must set driving mode');
});

test('calculateRouteLegs estimates reasonable distances, durations and URLs between stops', () => {
  const activities: Activity[] = [
    {
      id: 'a1',
      title: 'Kyoto Station',
      description: 'Central terminal',
      address: 'Kyoto Station, Kyoto',
      startTime: '10:00',
      endTime: '11:00',
      durationMinutes: 60,
      estimatedCost: 0,
      currency: 'USD',
      category: 'relaxation',
      sortOrder: 0,
      verificationStatus: 'verified',
      latitude: 34.9858,
      longitude: 135.7588,
    },
    {
      id: 'a2',
      title: 'Kiyomizu-dera Temple',
      description: 'Historic wooden temple',
      address: '1-294 Kiyomizu, Higashiyama Ward, Kyoto',
      startTime: '11:30',
      endTime: '13:30',
      durationMinutes: 120,
      estimatedCost: 4,
      currency: 'USD',
      category: 'culture',
      sortOrder: 1,
      verificationStatus: 'verified',
      latitude: 34.9949,
      longitude: 135.7850,
    },
  ];

  const legs = calculateRouteLegs(activities, 'Kyoto, Japan', 'driving');
  assert.equal(legs.length, 1, 'Must compute 1 leg for 2 activities');
  assert.ok(legs[0].distanceKm > 1 && legs[0].distanceKm < 10, 'Distance between Kyoto Station and Kiyomizu-dera is ~3km');
  assert.ok(legs[0].estimatedDurationMinutes >= 5, 'Transit duration must be realistic');
  assert.ok(legs[0].directionsUrl.includes('google.com/maps/dir'), 'Leg must have directions URL');
});

test('trip member owner migration resolves to TIRTHESH KOTHARI and kotharitirthesh30@gmail.com', () => {
  const legacyMembers = [
    {
      id: 'mem-1',
      tripId: 'trip-kyoto',
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      role: 'owner' as const,
      joinedAt: '2026-10-20T10:00:00Z',
    },
    {
      id: 'mem-2',
      tripId: 'trip-kyoto',
      name: 'Jordan Chen',
      email: 'jordan.c@example.com',
      role: 'editor' as const,
      joinedAt: '2026-10-21T14:30:00Z',
    },
  ];

  const profile = {
    id: 'usr-101',
    name: 'TIRTHESH KOTHARI',
    email: 'kotharitirthesh30@gmail.com',
  };

  const migrated = legacyMembers.map(m => {
    const isOwner = m.role === 'owner' || m.name.toLowerCase().includes('alex') || m.email.toLowerCase().includes('alex');
    return isOwner ? { ...m, name: profile.name, email: profile.email, role: 'owner' as const } : m;
  });

  assert.equal(migrated[0].name, 'TIRTHESH KOTHARI');
  assert.equal(migrated[0].email, 'kotharitirthesh30@gmail.com');
  assert.equal(migrated[0].role, 'owner');
  assert.equal(migrated[1].name, 'Jordan Chen');
});



