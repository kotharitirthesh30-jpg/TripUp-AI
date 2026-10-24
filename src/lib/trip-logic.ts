import { Trip, Activity, Expense, ExpenseCategory, TripMemberRole } from '../types/travel';

/**
 * Calculates total planned estimated costs vs actual recorded expenses
 */
export function calculateBudgetSummary(budgetAmount: number, expenses: Expense[], itineraryDays: Trip['itinerary'] = []) {
  // Estimated from itinerary activities if not in expense list
  let itineraryEstimatedTotal = 0;
  for (const day of itineraryDays) {
    for (const act of day.activities) {
      itineraryEstimatedTotal += act.estimatedCost || 0;
    }
  }

  const recordedEstimatedTotal = expenses.reduce((sum, exp) => sum + (exp.estimatedAmount || 0), 0);
  const recordedActualTotal = expenses.reduce((sum, exp) => sum + (exp.actualAmount || 0), 0);

  // Total estimated is maximum of recorded estimated or itinerary estimated
  const totalEstimated = Math.max(recordedEstimatedTotal, itineraryEstimatedTotal);
  const remainingBudget = budgetAmount - recordedActualTotal;
  const percentUsed = budgetAmount > 0 ? (recordedActualTotal / budgetAmount) * 100 : 0;

  // Breakdown by category
  const categoryBreakdown: Record<ExpenseCategory, { estimated: number; actual: number }> = {
    transport: { estimated: 0, actual: 0 },
    accommodation: { estimated: 0, actual: 0 },
    food: { estimated: 0, actual: 0 },
    attractions: { estimated: 0, actual: 0 },
    shopping: { estimated: 0, actual: 0 },
    other: { estimated: 0, actual: 0 },
  };

  for (const exp of expenses) {
    if (categoryBreakdown[exp.category]) {
      categoryBreakdown[exp.category].estimated += exp.estimatedAmount;
      categoryBreakdown[exp.category].actual += exp.actualAmount;
    }
  }

  return {
    budgetAmount,
    totalEstimated,
    recordedActualTotal,
    remainingBudget,
    percentUsed: Math.min(Math.round(percentUsed * 10) / 10, 100),
    isOverBudget: recordedActualTotal > budgetAmount,
    isNearBudgetLimit: percentUsed >= 85 && percentUsed <= 100,
    categoryBreakdown,
  };
}

/**
 * Checks if two activities on the same day overlap in time
 */
export function doActivitiesOverlap(actA: { startTime: string; endTime: string }, actB: { startTime: string; endTime: string }): boolean {
  const [aStartH, aStartM] = actA.startTime.split(':').map(Number);
  const [aEndH, aEndM] = actA.endTime.split(':').map(Number);
  const [bStartH, bStartM] = actB.startTime.split(':').map(Number);
  const [bEndH, bEndM] = actB.endTime.split(':').map(Number);

  const aStartMin = aStartH * 60 + aStartM;
  const aEndMin = aEndH * 60 + aEndM;
  const bStartMin = bStartH * 60 + bStartM;
  const bEndMin = bEndH * 60 + bEndM;

  return aStartMin < bEndMin && bStartMin < aEndMin;
}

/**
 * Validates a day's schedule for overlaps and logical order
 */
export function validateDaySchedule(activities: Activity[]): { valid: boolean; conflicts: string[] } {
  const conflicts: string[] = [];

  for (let i = 0; i < activities.length; i++) {
    for (let j = i + 1; j < activities.length; j++) {
      if (doActivitiesOverlap(activities[i], activities[j])) {
        conflicts.push(`"${activities[i].title}" overlaps with "${activities[j].title}"`);
      }
    }
  }

  return {
    valid: conflicts.length === 0,
    conflicts,
  };
}

/**
 * Calculate trip day count between start and end date inclusive
 */
export function calculateTripDurationDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  if (isNaN(diffTime) || diffTime < 0) return 1;
  return Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
}

/**
 * Permission checks based on Trip member role
 */
export function hasPermission(role: TripMemberRole, action: 'view' | 'edit' | 'delete' | 'invite'): boolean {
  if (role === 'owner') return true;
  if (role === 'editor') {
    return action === 'view' || action === 'edit';
  }
  if (role === 'viewer') {
    return action === 'view';
  }
  return false;
}
