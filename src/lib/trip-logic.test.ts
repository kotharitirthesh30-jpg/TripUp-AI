import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBudgetSummary,
  doActivitiesOverlap,
  validateDaySchedule,
  calculateTripDurationDays,
  hasPermission,
  convertCurrency,
  formatCurrency
} from './trip-logic';
import { Expense, Activity } from '../types/travel';

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


