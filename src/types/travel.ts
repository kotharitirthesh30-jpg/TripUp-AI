import { z } from 'zod';

// Travel Categories
export const TravelCategorySchema = z.enum([
  'culture',
  'nature',
  'food',
  'adventure',
  'relaxation',
  'architecture',
  'art',
  'shopping',
  'heritage'
]);

export type TravelCategory = z.infer<typeof TravelCategorySchema>;

// Expense Category
export const ExpenseCategorySchema = z.enum([
  'transport',
  'accommodation',
  'food',
  'attractions',
  'shopping',
  'other'
]);

export type ExpenseCategory = z.infer<typeof ExpenseCategorySchema>;

// Activity Schema
export const ActivitySchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  placeId: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
  durationMinutes: z.number().positive('Duration must be positive'),
  estimatedCost: z.number().nonnegative('Cost cannot be negative'),
  currency: z.string().default('USD'),
  category: TravelCategorySchema.default('culture'),
  sortOrder: z.number().int().nonnegative().default(0),
  sourceUrl: z.string().optional(),
  verificationStatus: z.enum(['verified', 'suggested']).default('verified'),
  weatherNote: z.string().optional(),
});

export type Activity = z.infer<typeof ActivitySchema>;

// Itinerary Day Schema
export const ItineraryDaySchema = z.object({
  id: z.string(),
  dayNumber: z.number().int().positive(),
  date: z.string(), // YYYY-MM-DD
  summary: z.string(),
  activities: z.array(ActivitySchema),
});

export type ItineraryDay = z.infer<typeof ItineraryDaySchema>;

// Expense Item Schema
export const ExpenseSchema = z.object({
  id: z.string(),
  tripId: z.string(),
  category: ExpenseCategorySchema,
  description: z.string().min(1, 'Description is required'),
  estimatedAmount: z.number().nonnegative(),
  actualAmount: z.number().nonnegative(),
  currency: z.string().default('USD'),
  expenseDate: z.string(), // YYYY-MM-DD
  createdAt: z.string().optional(),
});

export type Expense = z.infer<typeof ExpenseSchema>;

// Trip Member / Companion
export const TripMemberRoleSchema = z.enum(['owner', 'editor', 'viewer']);
export type TripMemberRole = z.infer<typeof TripMemberRoleSchema>;

export const TripMemberSchema = z.object({
  id: z.string(),
  tripId: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: TripMemberRoleSchema,
  avatarUrl: z.string().optional(),
  joinedAt: z.string(),
});

export type TripMember = z.infer<typeof TripMemberSchema>;

// Dietary Options
export const DietaryPreferenceSchema = z.enum([
  'pure_veg',      // Pure Veg (Strict Vegetarian / Jain friendly)
  'veg_nonveg',    // Veg & Non-Veg (Mixed / Flexible)
  'only_nonveg',   // Only Non-Veg (Poultry, Meat & Seafood specialty)
  'vegan',         // Vegan (Plant-based)
  'halal',         // Halal certified
  'kosher',        // Kosher
  'gluten_free',   // Gluten-Free / Celiac
]);

export type DietaryPreference = z.infer<typeof DietaryPreferenceSchema>;

// Trip Model Schema
export const TripSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().min(1, 'Trip title is required'),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  destinationPlaceId: z.string().optional(),
  startDate: z.string(), // YYYY-MM-DD
  endDate: z.string(),   // YYYY-MM-DD
  travelers: z.number().int().min(1, 'At least 1 traveler required'),
  budgetAmount: z.number().nonnegative('Budget cannot be negative').default(0),
  currency: z.string().default('USD'),
  travelStyle: z.enum(['relaxed', 'balanced', 'packed']).default('balanced'),
  interests: z.array(TravelCategorySchema).min(1, 'Select at least 1 interest'),
  transportPreferences: z.array(z.string()).default(['private_car', 'walking']),
  accommodationPreferences: z.string().default('boutique'),
  dietaryPreference: DietaryPreferenceSchema.default('veg_nonveg'),
  customPrompt: z.string().optional(),
  status: z.enum(['draft', 'upcoming', 'ongoing', 'completed', 'archived']).default('upcoming'),
  coverImageUrl: z.string().optional(),
  itinerary: z.array(ItineraryDaySchema).default([]),
  expenses: z.array(ExpenseSchema).default([]),
  members: z.array(TripMemberSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Trip = z.infer<typeof TripSchema>;

// User Profile
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  preferredCurrency: string;
  timezone: string;
  homeAirport?: string;
  preferences: {
    dietary?: DietaryPreference | string[];
    mobilityNeeds?: boolean;
    travelStyle: 'relaxed' | 'balanced' | 'packed';
  };
}

export type Continent =
  | 'Asia'
  | 'Europe'
  | 'North America'
  | 'South America'
  | 'Africa'
  | 'Oceania'
  | 'Middle East';

// Destination Landmark / Card
export interface Destination {
  id: string;
  slug: string;
  name: string;
  country: string;
  continent?: Continent;
  region: string;
  latitude: number;
  longitude: number;
  description: string;
  longDescription: string;
  imageUrl: string;
  categories: TravelCategory[];
  highlights: string[];
  bestTimeToVisit: string;
  avgDailyBudget: number;
  currency: string;
  weatherOverview: {
    temperatureC: number;
    condition: string;
    icon: string;
  };
  landmark3DType?: string;
}
