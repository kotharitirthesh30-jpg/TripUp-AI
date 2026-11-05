import {
  Trip,
  Activity,
  Expense,
  ExpenseCategory,
  TripMemberRole,
  CopilotProposedChange,
  CopilotResponse,
  TripVersionSnapshot
} from '../types/travel';

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

/**
 * Currency Exchange Rates and Conversion
 * Base: 1 USD
 */
export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  rateFromUSD: number; // How many units of this currency equal 1 USD
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateFromUSD: 86.5 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateFromUSD: 1.0 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateFromUSD: 0.92 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateFromUSD: 0.79 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateFromUSD: 154.0 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateFromUSD: 1.38 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateFromUSD: 1.52 },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rateFromUSD: 0.88 },
};

/**
 * Convert an amount from one currency to another
 */
export function convertCurrency(amount: number, fromCurrency: string = 'USD', toCurrency: string = 'INR'): number {
  if (!amount || amount === 0) return 0;
  if (fromCurrency === toCurrency) return amount;

  const fromRate = SUPPORTED_CURRENCIES[fromCurrency]?.rateFromUSD || 1.0;
  const toRate = SUPPORTED_CURRENCIES[toCurrency]?.rateFromUSD || 1.0;

  // Convert to USD base first, then to target
  const inUSD = amount / fromRate;
  const inTarget = inUSD * toRate;

  // For high-magnitude currencies like INR or JPY, round to integer. Otherwise round to 2 decimals.
  if (toCurrency === 'INR' || toCurrency === 'JPY') {
    return Math.round(inTarget);
  }
  return Math.round(inTarget * 100) / 100;
}

/**
 * Format an amount with currency symbol and localized number grouping
 */
export function formatCurrency(amount: number, currencyCode: string = 'INR'): string {
  const info = SUPPORTED_CURRENCIES[currencyCode] || { symbol: currencyCode, rateFromUSD: 1 };
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;

  // Format with commas according to locale if possible
  const formattedNumber = safeAmount.toLocaleString(
    currencyCode === 'INR' ? 'en-IN' : 'en-US',
    {
      maximumFractionDigits: currencyCode === 'INR' || currencyCode === 'JPY' ? 0 : 2,
      minimumFractionDigits: 0,
    }
  );

  return `${info.symbol}${formattedNumber}`;
}

/**
 * Converts all monetary amounts in a Trip from one currency to another
 */
export function convertTripCurrency(trip: Trip, targetCurrency: string): Trip {
  if (trip.currency === targetCurrency) return trip;
  const sourceCurrency = trip.currency || 'USD';

  const newBudgetAmount = convertCurrency(trip.budgetAmount, sourceCurrency, targetCurrency);

  const newExpenses = trip.expenses.map(exp => ({
    ...exp,
    currency: targetCurrency,
    estimatedAmount: convertCurrency(exp.estimatedAmount, exp.currency || sourceCurrency, targetCurrency),
    actualAmount: convertCurrency(exp.actualAmount, exp.currency || sourceCurrency, targetCurrency),
  }));

  const newItinerary = trip.itinerary.map(day => ({
    ...day,
    activities: day.activities.map(act => ({
      ...act,
      currency: targetCurrency,
      estimatedCost: convertCurrency(act.estimatedCost, act.currency || sourceCurrency, targetCurrency),
    })),
  }));

  return {
    ...trip,
    currency: targetCurrency,
    budgetAmount: newBudgetAmount,
    expenses: newExpenses,
    itinerary: newItinerary,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Deterministically applies AI Copilot proposed changes to a Trip object.
 * Preserves all unmodified activities, budget categories, and metadata.
 */
export function applyCopilotChanges(trip: Trip, proposedChanges: CopilotProposedChange[]): Trip {
  let updatedTrip: Trip = {
    ...trip,
    itinerary: trip.itinerary.map(day => ({
      ...day,
      activities: [...day.activities],
    })),
    updatedAt: new Date().toISOString(),
  };

  for (const change of proposedChanges) {
    if (change.type === 'adjust_budget' && typeof change.newBudgetAmount === 'number') {
      updatedTrip.budgetAmount = Math.max(0, change.newBudgetAmount);
      continue;
    }

    if (change.type === 'adjust_pace') {
      updatedTrip.travelStyle = 'relaxed';
    }

    const dayIndex = updatedTrip.itinerary.findIndex(d => d.dayNumber === change.dayNumber);
    if (dayIndex === -1) continue;

    const targetDay = updatedTrip.itinerary[dayIndex];

    switch (change.type) {
      case 'replace_activity': {
        if (!change.targetActivityId || !change.replacementActivity) break;
        targetDay.activities = targetDay.activities.map(act =>
          act.id === change.targetActivityId ? { ...change.replacementActivity!, id: act.id } : act
        );
        break;
      }
      case 'add_activity': {
        if (!change.replacementActivity) break;
        const newAct: Activity = {
          ...change.replacementActivity,
          id: change.replacementActivity.id || `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          sortOrder: targetDay.activities.length,
        };
        targetDay.activities.push(newAct);
        break;
      }
      case 'remove_activity': {
        if (!change.targetActivityId) break;
        targetDay.activities = targetDay.activities.filter(act => act.id !== change.targetActivityId);
        break;
      }
      case 'update_activity': {
        if (!change.targetActivityId || !change.replacementActivity) break;
        targetDay.activities = targetDay.activities.map(act =>
          act.id === change.targetActivityId ? { ...act, ...change.replacementActivity } : act
        );
        break;
      }
      case 'update_day_summary': {
        if (change.newValuePreview) {
          targetDay.summary = change.newValuePreview;
        }
        break;
      }
      case 'adjust_pace': {
        // Soften day schedule by pushing morning forward and giving generous buffers
        targetDay.activities = targetDay.activities.map((act, i) => {
          if (i === 0 && act.startTime < '10:00') {
            return {
              ...act,
              startTime: '10:00',
              endTime: '12:00',
            };
          }
          return act;
        });
        break;
      }
    }
  }

  return updatedTrip;
}

/**
 * High-speed deterministic fallback for AI Copilot when offline or when model takes > 4.5s
 */
export function generateSmartCopilotFallback(trip: Trip, instruction: string): CopilotResponse {
  const lower = instruction.toLowerCase();
  const proposedChanges: CopilotProposedChange[] = [];
  let reply = '';

  // Extract day number if mentioned (e.g., "day 2", "day two", "day 3")
  let targetDayNumber = 1;
  const dayMatch = lower.match(/day\s*(\d+)/i);
  if (dayMatch) {
    targetDayNumber = parseInt(dayMatch[1], 10);
  } else if (lower.includes('day one') || lower.includes('day 1') || lower.includes('first day')) {
    targetDayNumber = 1;
  } else if (lower.includes('day two') || lower.includes('day 2') || lower.includes('second day')) {
    targetDayNumber = 2;
  } else if (lower.includes('day three') || lower.includes('day 3') || lower.includes('third day')) {
    targetDayNumber = 3;
  } else if (lower.includes('day four') || lower.includes('day 4')) {
    targetDayNumber = 4;
  }

  const targetDay = trip.itinerary.find(d => d.dayNumber === targetDayNumber) || trip.itinerary[0];

  if (lower.includes('relax') || lower.includes('peaceful') || lower.includes('slow') || lower.includes('pace')) {
    reply = `I have adjusted Day ${targetDay?.dayNumber || 1} to a relaxed pace. Mornings start comfortably at 10:00 AM with a tranquil artisan garden and tea lounge stroll, giving you extra buffer time without rushed transits.`;
    if (targetDay && targetDay.activities.length > 0) {
      const act = targetDay.activities[0];
      proposedChanges.push({
        id: `prop-${Date.now()}-1`,
        type: 'adjust_pace',
        dayNumber: targetDay.dayNumber,
        oldValuePreview: `${act.title} (${act.startTime})`,
        newValuePreview: `Relaxed Morning Start (10:00 AM - 12:00 PM)`,
        reason: 'Adjusts schedule to start at 10:00 AM with a relaxing pace and buffer time.',
      });
      proposedChanges.push({
        id: `prop-${Date.now()}-2`,
        type: 'update_day_summary',
        dayNumber: targetDay.dayNumber,
        newValuePreview: `Day ${targetDay.dayNumber}: Relaxed leisure pace with scenic garden strolls, artisan tea tastings, and golden hour dining`,
        reason: 'Updated daily theme to emphasize a tranquil, restorative schedule.',
      });
    }
  } else if (lower.includes('rain') || lower.includes('weather') || lower.includes('indoor')) {
    reply = `I have adapted Day ${targetDay?.dayNumber || 1} for inclement or rainy weather. Outdoor walking trails have been substituted with premier indoor cultural venues, covered glasshouse galleries, and historic tearooms.`;
    if (targetDay && targetDay.activities.length > 1) {
      const targetAct = targetDay.activities[1];
      const replacement: Activity = {
        ...targetAct,
        id: targetAct.id,
        title: `Premier Indoor Cultural Heritage Museum & Covered Artisan Galleries`,
        description: `Explore sheltered indoor historical exhibitions, centuries-old master craftsmanship, and interactive cultural ateliers sheltered from weather.`,
        category: 'culture',
        weatherNote: 'Ideal indoor rainy day alternative with full weather protection.',
      };
      proposedChanges.push({
        id: `prop-${Date.now()}-1`,
        type: 'replace_activity',
        dayNumber: targetDay.dayNumber,
        targetActivityId: targetAct.id,
        oldValuePreview: targetAct.title,
        newValuePreview: replacement.title,
        replacementActivity: replacement,
        reason: 'Replaces outdoor activity with a weather-protected indoor museum and gallery.',
      });
    }
  } else if (lower.includes('budget') || lower.includes('cheaper') || lower.includes('cost') || lower.includes('reduce')) {
    const currentBudget = trip.budgetAmount || 2000;
    const reducedBudget = Math.round(currentBudget * 0.8);
    reply = `I have optimized the travel budget by ~20%, bringing your planned budget from ${trip.currency} ${currentBudget} down to ${trip.currency} ${reducedBudget}. I recommend focusing on self-guided architectural walks and local dining markets rather than high-surcharge private excursions.`;
    proposedChanges.push({
      id: `prop-${Date.now()}-1`,
      type: 'adjust_budget',
      dayNumber: targetDay?.dayNumber || 1,
      oldValuePreview: `${trip.currency} ${currentBudget}`,
      newValuePreview: `${trip.currency} ${reducedBudget}`,
      newBudgetAmount: reducedBudget,
      reason: 'Reduces overall trip budget by 20% with budget-friendly recommendations.',
    });
  } else if (lower.includes('food') || lower.includes('veg') || lower.includes('culinary') || lower.includes('dinner') || lower.includes('restaurant')) {
    reply = `I have enhanced Day ${targetDay?.dayNumber || 1} with an authentic, verified regional culinary stop honoring your dietary preferences (${trip.dietaryPreference === 'pure_veg' ? '100% Pure Vegetarian / Jain friendly' : 'authentic regional delicacies'}).`;
    if (targetDay && targetDay.activities.length > 0) {
      const dinnerAct = targetDay.activities[targetDay.activities.length - 1];
      const isPureVeg = trip.dietaryPreference === 'pure_veg';
      const replacement: Activity = {
        ...dinnerAct,
        id: dinnerAct.id,
        title: isPureVeg
          ? `Authentic 100% Pure Vegetarian Regional Feast & Artisan Sweet Trail`
          : `Celebrated Farm-to-Table Gastronomy & Regional Tasting Menu`,
        description: isPureVeg
          ? `Savor farm-fresh regional vegetarian recipes, hot flatbreads, aromatic curries, and freshly prepared local sweets at a renowned dining hall.`
          : `Sample signature regional dishes prepared with seasonal local ingredients and paired with regional beverages.`,
        category: 'food',
        estimatedCost: Math.min(dinnerAct.estimatedCost || 300, 450),
      };
      proposedChanges.push({
        id: `prop-${Date.now()}-1`,
        type: 'replace_activity',
        dayNumber: targetDay.dayNumber,
        targetActivityId: dinnerAct.id,
        oldValuePreview: dinnerAct.title,
        newValuePreview: replacement.title,
        replacementActivity: replacement,
        reason: 'Upgrades dining to an authentic, verified regional food experience.',
      });
    }
  } else if (lower.includes('family') || lower.includes('kid') || lower.includes('children')) {
    reply = `I have adjusted Day ${targetDay?.dayNumber || 1} for family-friendly exploration, incorporating interactive discovery trails, scenic rest spots, and engaging outdoor spaces suitable for all ages.`;
    if (targetDay && targetDay.activities.length > 1) {
      const targetAct = targetDay.activities[1];
      const replacement: Activity = {
        ...targetAct,
        id: targetAct.id,
        title: `Interactive Discovery Park, Scenic Cable Ride & Family Nature Trail`,
        description: `Engaging activities suitable for all age groups with gentle walking paths, scenic overlooks, and nearby family rest zones.`,
        category: 'adventure',
      };
      proposedChanges.push({
        id: `prop-${Date.now()}-1`,
        type: 'replace_activity',
        dayNumber: targetDay.dayNumber,
        targetActivityId: targetAct.id,
        oldValuePreview: targetAct.title,
        newValuePreview: replacement.title,
        replacementActivity: replacement,
        reason: 'Replaces strenuous activity with an all-ages family-friendly discovery experience.',
      });
    }
  } else {
    // General conversational query or recommendation
    reply = `I have analyzed your itinerary for ${trip.destination}. Based on your travel style (${trip.travelStyle}) and interests, I've curated a refined optimization for Day ${targetDay?.dayNumber || 1} that streamlines transit and highlights the top verified landmarks.`;
    if (targetDay && targetDay.activities.length > 0) {
      proposedChanges.push({
        id: `prop-${Date.now()}-1`,
        type: 'update_day_summary',
        dayNumber: targetDay.dayNumber,
        newValuePreview: `Day ${targetDay.dayNumber}: Optimized daily route exploring ${trip.destination}'s signature highlights and local charm`,
        reason: 'Streamlines activity sequencing and itinerary clarity.',
      });
    }
  }

  return {
    reply,
    proposedChanges,
  };
}

/**
 * Creates an immutable version snapshot of the current trip state.
 */
export function createTripVersionSnapshot(trip: Trip, versionName?: string): TripVersionSnapshot {
  const activityCount = trip.itinerary.reduce((sum, d) => sum + d.activities.length, 0);
  const existingCount = trip.versions?.length || 0;
  const name = versionName || `Version ${existingCount + 1} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;

  return {
    id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name,
    createdAt: new Date().toISOString(),
    budgetAmount: trip.budgetAmount,
    currency: trip.currency,
    travelStyle: trip.travelStyle,
    dayCount: trip.itinerary.length,
    activityCount,
    summary: `${trip.destination} · ${trip.itinerary.length} Days · ${activityCount} Activities`,
    itinerary: trip.itinerary.map(day => ({
      ...day,
      activities: day.activities.map(a => ({ ...a })),
    })),
  };
}

/**
 * Restores a trip to a previous snapshot while creating a restore-point of the current state.
 */
export function restoreTripVersion(trip: Trip, snapshot: TripVersionSnapshot): Trip {
  const currentSnapshot = createTripVersionSnapshot(trip, `Pre-Restore Snapshot (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`);
  const updatedVersions = [currentSnapshot, ...(trip.versions || [])];

  return {
    ...trip,
    budgetAmount: snapshot.budgetAmount,
    currency: snapshot.currency,
    travelStyle: snapshot.travelStyle as any,
    versions: updatedVersions,
    itinerary: snapshot.itinerary.map((day, idx) => {
      // Re-align dates with trip start date if original dates existed
      const baseDay = trip.itinerary[idx];
      return {
        ...day,
        date: baseDay?.date || day.date,
        dayNumber: idx + 1,
        activities: day.activities.map(a => ({ ...a })),
      };
    }),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Swaps all activities and schedule between two days (e.g. swap Day 1 and Day 2 due to weather)
 */
export function swapTripDays(trip: Trip, dayNumberA: number, dayNumberB: number): Trip {
  if (dayNumberA === dayNumberB) return trip;

  const idxA = trip.itinerary.findIndex(d => d.dayNumber === dayNumberA);
  const idxB = trip.itinerary.findIndex(d => d.dayNumber === dayNumberB);
  if (idxA === -1 || idxB === -1) return trip;

  const newItinerary = trip.itinerary.map((day, idx) => {
    if (idx === idxA) {
      const sourceB = trip.itinerary[idxB];
      return {
        ...day,
        summary: sourceB.summary,
        routeSegment: sourceB.routeSegment,
        activities: sourceB.activities.map(a => ({ ...a })),
      };
    }
    if (idx === idxB) {
      const sourceA = trip.itinerary[idxA];
      return {
        ...day,
        summary: sourceA.summary,
        routeSegment: sourceA.routeSegment,
        activities: sourceA.activities.map(a => ({ ...a })),
      };
    }
    return day;
  });

  return {
    ...trip,
    itinerary: newItinerary,
    updatedAt: new Date().toISOString(),
  };
}

export interface DayComparisonDiff {
  dayNumber: number;
  date: string;
  addedActivities: Activity[];
  removedActivities: Activity[];
  modifiedActivities: { from: Activity; to: Activity; changes: string[] }[];
  unchangedCount: number;
}

export interface VersionComparisonResult {
  budgetDiff: number;
  activityCountDiff: number;
  pacingDiff: string;
  dayDifferences: DayComparisonDiff[];
  isIdentical: boolean;
}

/**
 * Performs a deep side-by-side comparison between two trip versions.
 */
export function compareTripVersions(
  v1: TripVersionSnapshot | Trip,
  v2: TripVersionSnapshot | Trip
): VersionComparisonResult {
  const budgetDiff = v2.budgetAmount - v1.budgetAmount;
  const count1 = v1.itinerary.reduce((sum, d) => sum + d.activities.length, 0);
  const count2 = v2.itinerary.reduce((sum, d) => sum + d.activities.length, 0);
  const activityCountDiff = count2 - count1;

  let pacingDiff = 'Identical pace';
  if (v1.travelStyle !== v2.travelStyle) {
    pacingDiff = `Changed from ${v1.travelStyle} to ${v2.travelStyle}`;
  }

  const maxDays = Math.max(v1.itinerary.length, v2.itinerary.length);
  const dayDifferences: DayComparisonDiff[] = [];
  let isIdentical = budgetDiff === 0 && activityCountDiff === 0 && v1.travelStyle === v2.travelStyle;

  for (let d = 1; d <= maxDays; d++) {
    const day1 = v1.itinerary.find(day => day.dayNumber === d);
    const day2 = v2.itinerary.find(day => day.dayNumber === d);

    const acts1 = day1?.activities || [];
    const acts2 = day2?.activities || [];

    const addedActivities: Activity[] = [];
    const removedActivities: Activity[] = [];
    const modifiedActivities: { from: Activity; to: Activity; changes: string[] }[] = [];
    let unchangedCount = 0;

    // Check acts2 against acts1
    for (const a2 of acts2) {
      const match = acts1.find(a1 => a1.id === a2.id || a1.title.toLowerCase() === a2.title.toLowerCase());
      if (!match) {
        addedActivities.push(a2);
        isIdentical = false;
      } else {
        const changes: string[] = [];
        if (match.startTime !== a2.startTime || match.endTime !== a2.endTime) {
          changes.push(`Time: ${match.startTime} ➔ ${a2.startTime}`);
        }
        if (match.estimatedCost !== a2.estimatedCost) {
          changes.push(`Cost: ${match.estimatedCost} ➔ ${a2.estimatedCost}`);
        }
        if (match.title !== a2.title) {
          changes.push(`Title: "${match.title}" ➔ "${a2.title}"`);
        }

        if (changes.length > 0) {
          modifiedActivities.push({ from: match, to: a2, changes });
          isIdentical = false;
        } else {
          unchangedCount++;
        }
      }
    }

    // Check for removed in acts1 that are not in acts2
    for (const a1 of acts1) {
      const match = acts2.find(a2 => a2.id === a1.id || a2.title.toLowerCase() === a1.title.toLowerCase());
      if (!match) {
        removedActivities.push(a1);
        isIdentical = false;
      }
    }

    dayDifferences.push({
      dayNumber: d,
      date: day2?.date || day1?.date || '',
      addedActivities,
      removedActivities,
      modifiedActivities,
      unchangedCount,
    });
  }

  return {
    budgetDiff,
    activityCountDiff,
    pacingDiff,
    dayDifferences,
    isIdentical,
  };
}

/**
 * Sanitizes and cleans an activity location for Google Maps query resolution.
 * Strips out hallucinated/generic filler such as "Midway Highway Stop en route to ..."
 * ensuring Google Maps can pinpoint the exact venue or destination coordinates.
 */
export function cleanMapsLocation(title: string, address?: string, destination?: string): string {
  const dest = destination?.trim() || '';

  // If address has placeholder tokens like "Midway Highway Stop" or "en route to"
  if (address) {
    const isPlaceholder =
      address.includes('Midway Highway Stop') ||
      address.includes('en route to') ||
      address.toLowerCase().includes('highway stop en route');

    if (!isPlaceholder && address.trim().length > 3) {
      // If address doesn't end with destination and is a short local street address, append destination for disambiguation
      if (dest && !address.toLowerCase().includes(dest.toLowerCase())) {
        return `${address.trim()}, ${dest}`;
      }
      return address.trim();
    }
  }

  // Clean the title from generic departure or transit filler
  let cleanTitle = title
    .replace(/^Departure from [^&]+ &/i, '')
    .replace(/Midway Scenic Waypoint Halt/i, 'Scenic Waypoint')
    .replace(/En Route Halts & Driving Corridor/i, '')
    .trim();

  if (dest) {
    if (!cleanTitle.toLowerCase().includes(dest.toLowerCase())) {
      return `${cleanTitle}, ${dest}`;
    }
    return cleanTitle;
  }

  return cleanTitle || 'City Center';
}

/**
 * Builds an official multi-waypoint Google Maps Directions URL for a sequence of stops.
 */
export function buildGoogleMapsDirectionsUrl(
  stops: { title: string; address?: string }[],
  destination: string,
  travelMode: 'driving' | 'transit' | 'walking' = 'driving'
): string {
  if (!stops || stops.length === 0) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
  }

  const cleanStops = stops.map(s => cleanMapsLocation(s.title, s.address, destination));

  if (cleanStops.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanStops[0])}`;
  }

  const origin = cleanStops[0];
  const dest = cleanStops[cleanStops.length - 1];
  const waypoints = cleanStops.slice(1, -1);

  let url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}`;
  if (waypoints.length > 0) {
    url += `&waypoints=${waypoints.map(w => encodeURIComponent(w)).join('%7C')}`;
  }
  url += `&travelmode=${travelMode}`;

  return url;
}

/**
 * Calculates Haversine distance in kilometers between two GPS coordinates.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export interface RouteLeg {
  fromActivityId: string;
  toActivityId: string;
  fromTitle: string;
  toTitle: string;
  fromAddress: string;
  toAddress: string;
  distanceKm: number;
  estimatedDurationMinutes: number;
  directionsUrl: string;
}

/**
 * Calculates ordered route legs between consecutive activities for a day.
 */
export function calculateRouteLegs(
  activities: Activity[],
  destination: string,
  travelMode: 'driving' | 'transit' | 'walking' = 'driving'
): RouteLeg[] {
  if (activities.length < 2) return [];

  const legs: RouteLeg[] = [];

  for (let i = 0; i < activities.length - 1; i++) {
    const act1 = activities[i];
    const act2 = activities[i + 1];

    const fromLoc = cleanMapsLocation(act1.title, act1.address, destination);
    const toLoc = cleanMapsLocation(act2.title, act2.address, destination);

    let distKm = 3.5; // Default sensible urban hop
    if (act1.latitude && act1.longitude && act2.latitude && act2.longitude) {
      distKm = calculateHaversineDistanceKm(
        act1.latitude,
        act1.longitude,
        act2.latitude,
        act2.longitude
      );
    }

    // Transit speed estimates: driving ~30km/h in city + buffers, walking ~4.5km/h, transit ~25km/h
    let speedKmH = 30;
    if (travelMode === 'walking') speedKmH = 4.5;
    else if (travelMode === 'transit') speedKmH = 22;

    const durMin = Math.max(5, Math.round((distKm / speedKmH) * 60) + 5);

    const legUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(fromLoc)}&destination=${encodeURIComponent(toLoc)}&travelmode=${travelMode}`;

    legs.push({
      fromActivityId: act1.id,
      toActivityId: act2.id,
      fromTitle: act1.title,
      toTitle: act2.title,
      fromAddress: fromLoc,
      toAddress: toLoc,
      distanceKm: distKm,
      estimatedDurationMinutes: durMin,
      directionsUrl: legUrl,
    });
  }

  return legs;
}



