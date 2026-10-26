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

