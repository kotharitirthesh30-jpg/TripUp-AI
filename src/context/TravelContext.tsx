import React, { createContext, useContext, useState, useEffect } from 'react';
import { Trip, Destination, UserProfile, Expense, Activity, TripMemberRole, TripVersionSnapshot } from '../types/travel';
import { CURATED_DESTINATIONS } from '../data/curated-destinations';
import {
  calculateBudgetSummary,
  convertTripCurrency,
  convertCurrency,
  createTripVersionSnapshot,
  restoreTripVersion,
  swapTripDays
} from '../lib/trip-logic';
import { auth, loginWithGoogle, logoutUser, onAuthStateChanged, User } from '../lib/firebase';

interface TravelContextType {
  trips: Trip[];
  activeTrip: Trip | null;
  savedDestinationIds: string[];
  destinations: Destination[];
  userProfile: UserProfile;
  authUser: User | null;
  authLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  currentCurrency: string;
  setCurrentCurrency: (currency: string) => void;
  changeTripCurrency: (tripId: string, newCurrency: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  createTrip: (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => Trip;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  duplicateTrip: (id: string) => Trip;
  toggleFavoriteDestination: (destinationId: string) => void;
  setActiveTripId: (id: string | null) => void;
  addExpense: (tripId: string, expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (tripId: string, expenseId: string) => void;
  updateActivity: (tripId: string, dayId: string, activityId: string, updates: Partial<Activity>) => void;
  addActivity: (tripId: string, dayId: string, activity: Omit<Activity, 'id'>) => void;
  deleteActivity: (tripId: string, dayId: string, activityId: string) => void;
  reorderActivities: (tripId: string, dayId: string, newActivities: Activity[]) => void;
  selectRouteOption: (tripId: string, routeOptionId: string) => void;
  selectActivityOption: (tripId: string, dayId: string, activityId: string, optionId: string) => void;
  createTripSnapshot: (tripId: string, name?: string) => TripVersionSnapshot;
  restoreTripSnapshot: (tripId: string, snapshotId: string) => void;
  deleteTripSnapshot: (tripId: string, snapshotId: string) => void;
  swapDays: (tripId: string, dayNumberA: number, dayNumberB: number) => void;
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr-101',
  name: 'TIRTHESH KOTHARI',
  email: 'kotharitirthesh30@gmail.com',
  preferredCurrency: 'USD',
  timezone: 'America/Los_Angeles',
  homeAirport: 'SFO',
  preferences: {
    dietary: ['Vegetarian-friendly'],
    mobilityNeeds: false,
    travelStyle: 'balanced',
  },
};

const INITIAL_TRIPS: Trip[] = [
  {
    id: 'trip-kyoto-2026',
    userId: 'usr-101',
    title: 'Autumn Zen: 5-Day Cultural Immersion in Kyoto',
    origin: 'San Francisco, CA (SFO)',
    destination: 'Kyoto, Japan',
    destinationPlaceId: 'dest-kyoto',
    startDate: '2026-11-12',
    endDate: '2026-11-16',
    travelers: 2,
    budgetAmount: 3200,
    currency: 'USD',
    travelStyle: 'balanced',
    interests: ['culture', 'heritage', 'food', 'nature', 'architecture'],
    transportPreferences: ['private_car', 'walking', 'public_transport', 'train'],
    accommodationPreferences: 'Traditional Machiya Ryokan',
    dietaryPreference: 'veg_nonveg',
    customPrompt: 'Scenic road trip stops and authentic vegetarian & local food options',
    status: 'upcoming',
    coverImageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop',
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-24T12:00:00Z',
    itinerary: [
      {
        id: 'day-1',
        dayNumber: 1,
        date: '2026-11-12',
        summary: 'Arrival in Kyoto via Haruka Express, Machiya check-in, and twilight Gion stroll.',
        activities: [
          {
            id: 'act-1-1',
            title: 'Arrive Kyoto Station & Shinkansen Check-in',
            description: 'Board the Haruka Express from Kansai International to Kyoto Station. Transfer to your traditional Gion Machiya.',
            address: 'Higashiyama Ward, Kyoto',
            startTime: '13:30',
            endTime: '15:30',
            durationMinutes: 120,
            estimatedCost: 120,
            currency: 'USD',
            category: 'relaxation',
            sortOrder: 0,
            verificationStatus: 'verified',
            latitude: 34.9858,
            longitude: 135.7588,
          },
          {
            id: 'act-1-2',
            title: 'Shirakawa Canal & Gion Lantern Walk',
            description: 'Twilight walk along weeping willows, stone bridges, and wooden geisha teahouse facades.',
            address: 'Shirakawa Minamidori, Higashiyama Ward, Kyoto',
            startTime: '16:30',
            endTime: '18:30',
            durationMinutes: 120,
            estimatedCost: 0,
            currency: 'USD',
            category: 'culture',
            sortOrder: 1,
            verificationStatus: 'verified',
            latitude: 35.0055,
            longitude: 135.7745,
          },
          {
            id: 'act-1-3',
            title: 'Seasonal Kaiseki Welcome Dinner at Gion Karyo',
            description: 'Multi-course culinary art featuring Kyoto seasonal delicacies, yuba tofu, and ceremonial sake.',
            address: '570-235 Gionmachi Minamigawa, Higashiyama Ward',
            startTime: '19:00',
            endTime: '21:00',
            durationMinutes: 120,
            estimatedCost: 180,
            currency: 'USD',
            category: 'food',
            sortOrder: 2,
            verificationStatus: 'verified',
            latitude: 35.0028,
            longitude: 135.7762,
          },
        ],
      },
      {
        id: 'day-2',
        dayNumber: 2,
        date: '2026-11-13',
        summary: 'Fushimi Inari morning torii gate pilgrimage, Sanjusangendo, and Kiyomizu-dera.',
        activities: [
          {
            id: 'act-2-1',
            title: 'Fushimi Inari Taisha Early Ascent',
            description: 'Beat the tour buses to climb through thousands of vivid vermilion torii gates up sacred Mount Inari.',
            address: '68 Fukakusa Yabunouchicho, Fushimi Ward',
            startTime: '07:30',
            endTime: '10:30',
            durationMinutes: 180,
            estimatedCost: 0,
            currency: 'USD',
            category: 'heritage',
            sortOrder: 0,
            verificationStatus: 'verified',
            latitude: 34.9671,
            longitude: 135.7727,
          },
          {
            id: 'act-2-2',
            title: 'Sanjusangendo Hall of 1,001 Statues',
            description: 'National Treasure temple containing 1,001 hand-carved golden statues of Kannon, Goddess of Mercy.',
            address: '657 Sanjusangendomawari, Higashiyama Ward',
            startTime: '11:15',
            endTime: '12:45',
            durationMinutes: 90,
            estimatedCost: 12,
            currency: 'USD',
            category: 'culture',
            sortOrder: 1,
            verificationStatus: 'verified',
            latitude: 34.9879,
            longitude: 135.7717,
          },
          {
            id: 'act-2-3',
            title: 'Kiyomizu-dera Sunset Wooden Stage',
            description: 'Perched on cliffs overlooking maple trees with panorama views of the entire Kyoto basin.',
            address: '1-294 Kiyomizu, Higashiyama Ward',
            startTime: '15:30',
            endTime: '17:30',
            durationMinutes: 120,
            estimatedCost: 8,
            currency: 'USD',
            category: 'architecture',
            sortOrder: 2,
            verificationStatus: 'verified',
            latitude: 34.9949,
            longitude: 135.7850,
          },
        ],
      },
      {
        id: 'day-3',
        dayNumber: 3,
        date: '2026-11-14',
        summary: 'Bamboo groves of Arashiyama, Tenryu-ji Zen temple, and Kinkaku-ji Golden Pavilion.',
        activities: [
          {
            id: 'act-3-1',
            title: 'Sagano Romantic Bamboo Forest',
            description: 'Early morning walk through towering natural bamboo groves swaying gently in the crisp morning breeze.',
            address: 'Arashiyama, Ukyo Ward, Kyoto',
            startTime: '08:30',
            endTime: '10:30',
            durationMinutes: 120,
            estimatedCost: 0,
            currency: 'USD',
            category: 'nature',
            sortOrder: 0,
            verificationStatus: 'verified',
            latitude: 35.0170,
            longitude: 135.6710,
          },
          {
            id: 'act-3-2',
            title: 'Tenryu-ji World Heritage Zen Temple',
            description: 'Savor the 14th-century pond garden designed by Muso Soseki, framing Mount Arashiyama.',
            address: '68 Saga Tenryuji Susukinobabacho',
            startTime: '11:00',
            endTime: '12:30',
            durationMinutes: 90,
            estimatedCost: 10,
            currency: 'USD',
            category: 'culture',
            sortOrder: 1,
            verificationStatus: 'verified',
            latitude: 35.0158,
            longitude: 135.6777,
          },
          {
            id: 'act-3-3',
            title: 'Kinkaku-ji (The Golden Pavilion)',
            description: 'The top two floors covered in real gold leaf shimmering over Mirror Pond (Kyoko-chi).',
            address: '1 Kinkakujicho, Kita Ward, Kyoto',
            startTime: '14:30',
            endTime: '16:30',
            durationMinutes: 120,
            estimatedCost: 8,
            currency: 'USD',
            category: 'architecture',
            sortOrder: 2,
            verificationStatus: 'verified',
            latitude: 35.0394,
            longitude: 135.7292,
          },
        ],
      },
    ],
    expenses: [
      {
        id: 'exp-1',
        tripId: 'trip-kyoto-2026',
        category: 'accommodation',
        description: 'Gion Traditional Machiya (4 Nights)',
        estimatedAmount: 1100,
        actualAmount: 1050,
        currency: 'USD',
        expenseDate: '2026-11-12',
      },
      {
        id: 'exp-2',
        tripId: 'trip-kyoto-2026',
        category: 'transport',
        description: 'JR Haruka & Kyoto Subway Pass',
        estimatedAmount: 160,
        actualAmount: 145,
        currency: 'USD',
        expenseDate: '2026-11-12',
      },
      {
        id: 'exp-3',
        tripId: 'trip-kyoto-2026',
        category: 'food',
        description: 'Kaiseki Dinner & Tea Ceremonies',
        estimatedAmount: 450,
        actualAmount: 480,
        currency: 'USD',
        expenseDate: '2026-11-13',
      },
      {
        id: 'exp-4',
        tripId: 'trip-kyoto-2026',
        category: 'attractions',
        description: 'Temple Gardens & Museum Tickets',
        estimatedAmount: 90,
        actualAmount: 75,
        currency: 'USD',
        expenseDate: '2026-11-13',
      },
    ],
    members: [
      {
        id: 'mem-1',
        tripId: 'trip-kyoto-2026',
        name: 'TIRTHESH KOTHARI',
        email: 'kotharitirthesh30@gmail.com',
        role: 'owner',
        joinedAt: '2026-10-20T10:00:00Z',
      },
      {
        id: 'mem-2',
        tripId: 'trip-kyoto-2026',
        name: 'Jordan Chen',
        email: 'jordan.c@example.com',
        role: 'editor',
        joinedAt: '2026-10-21T14:30:00Z',
      },
    ],
  },
];

const TravelContext = createContext<TravelContextType | null>(null);

export const TravelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const saved = localStorage.getItem('tripup_ai_trips');
      const loaded: Trip[] = saved ? JSON.parse(saved) : INITIAL_TRIPS;
      // Auto-migrate legacy owner 'Alex Rivera' to 'TIRTHESH KOTHARI' / 'kotharitirthesh30@gmail.com'
      return loaded.map(trip => ({
        ...trip,
        members: trip.members && trip.members.length > 0
          ? trip.members.map(m =>
              m.role === 'owner' || m.email === 'alex.rivera@example.com' || m.name === 'Alex Rivera'
                ? { ...m, name: 'TIRTHESH KOTHARI', email: 'kotharitirthesh30@gmail.com' }
                : m
            )
          : [
              {
                id: 'mem-1',
                tripId: trip.id,
                name: 'TIRTHESH KOTHARI',
                email: 'kotharitirthesh30@gmail.com',
                role: 'owner',
                joinedAt: trip.createdAt || new Date().toISOString(),
              },
            ],
      }));
    } catch {
      return INITIAL_TRIPS;
    }
  });

  const [activeTripId, setActiveTripId] = useState<string | null>(trips[0]?.id || null);
  const [savedDestinationIds, setSavedDestinationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tripup_ai_favorites');
      return saved ? JSON.parse(saved) : ['dest-kyoto', 'dest-amalfi'];
    } catch {
      return ['dest-kyoto', 'dest-amalfi'];
    }
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('tripup_ai_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email === 'alex.rivera@example.com' || parsed.name === 'Alex Rivera') {
          return {
            ...parsed,
            name: 'TIRTHESH KOTHARI',
            email: 'kotharitirthesh30@gmail.com',
          };
        }
        return parsed;
      }
      return DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });
  const [currentCurrency, setCurrentCurrencyState] = useState<string>(() => {
    try {
      return localStorage.getItem('tripup_ai_currency') || 'INR';
    } catch {
      return 'INR';
    }
  });

  const setCurrentCurrency = (curr: string) => {
    setCurrentCurrencyState(curr);
    try {
      localStorage.setItem('tripup_ai_currency', curr);
    } catch (e) {
      console.warn(e);
    }
    setUserProfile(prev => ({ ...prev, preferredCurrency: curr }));
    // Also update any trip that was in the previous currency to the new currency
    setTrips(prev => prev.map(trip => convertTripCurrency(trip, curr)));
  };

  const changeTripCurrency = (tripId: string, newCurrency: string) => {
    setTrips(prev =>
      prev.map(trip => {
        if (trip.id !== tripId) return trip;
        return convertTripCurrency(trip, newCurrency);
      })
    );
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const next = { ...prev, ...updates };
      if (updates.preferredCurrency) {
        setCurrentCurrencyState(updates.preferredCurrency);
        try {
          localStorage.setItem('tripup_ai_currency', updates.preferredCurrency);
        } catch (e) {
          console.warn(e);
        }
      }
      return next;
    });
  };

  useEffect(() => {
    try {
      localStorage.setItem('tripup_ai_favorites', JSON.stringify(savedDestinationIds));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [savedDestinationIds]);

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Sync Firebase Auth user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setAuthUser(user);
      setAuthLoading(false);
      if (user) {
        setUserProfile(prev => ({
          ...prev,
          id: user.uid,
          name: user.displayName || prev.name,
          email: user.email || prev.email,
          avatarUrl: user.photoURL || prev.avatarUrl,
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        setUserProfile(prev => ({
          ...prev,
          id: user.uid,
          name: user.displayName || prev.name,
          email: user.email || prev.email,
          avatarUrl: user.photoURL || prev.avatarUrl,
        }));
      }
    } catch (err) {
      console.error('Google Sign-in failed:', err);
      throw err;
    }
  };

  const signOutUser = async () => {
    try {
      await logoutUser();
      setAuthUser(null);
    } catch (err) {
      console.error('Sign-out failed:', err);
      throw err;
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('tripup_ai_trips', JSON.stringify(trips));
    } catch (e) {
      console.warn('Trips storage sync error:', e);
    }
  }, [trips]);

  useEffect(() => {
    try {
      localStorage.setItem('tripup_ai_user_profile', JSON.stringify(userProfile));
    } catch (e) {
      console.warn('Profile storage sync error:', e);
    }
  }, [userProfile]);

  const activeTrip = trips.find(t => t.id === activeTripId) || trips[0] || null;

  const createTrip = (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Trip => {
    const newId = `trip-${Date.now()}`;
    const newTrip: Trip = {
      ...tripData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: [
        {
          id: `mem-${Date.now()}`,
          tripId: newId,
          name: userProfile.name,
          email: userProfile.email,
          role: 'owner',
          joinedAt: new Date().toISOString(),
        },
      ],
    };

    setTrips(prev => [newTrip, ...prev]);
    setActiveTripId(newId);
    return newTrip;
  };

  const updateTrip = (id: string, updates: Partial<Trip>) => {
    setTrips(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );
  };

  const deleteTrip = (id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
    if (activeTripId === id) {
      const remaining = trips.filter(t => t.id !== id);
      setActiveTripId(remaining[0]?.id || null);
    }
  };

  const duplicateTrip = (id: string): Trip => {
    const existing = trips.find(t => t.id === id);
    if (!existing) throw new Error('Trip not found');

    const newId = `trip-${Date.now()}`;
    const clonedTrip: Trip = {
      ...existing,
      id: newId,
      title: `${existing.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      itinerary: existing.itinerary.map(day => ({
        ...day,
        id: `day-${Date.now()}-${day.dayNumber}`,
        activities: day.activities.map(act => ({
          ...act,
          id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        })),
      })),
      expenses: existing.expenses.map(exp => ({
        ...exp,
        id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        tripId: newId,
      })),
      members: [
        {
          id: `mem-${Date.now()}`,
          tripId: newId,
          name: userProfile.name,
          email: userProfile.email,
          role: 'owner',
          joinedAt: new Date().toISOString(),
        },
      ],
    };

    setTrips(prev => [clonedTrip, ...prev]);
    setActiveTripId(newId);
    return clonedTrip;
  };

  const toggleFavoriteDestination = (destinationId: string) => {
    setSavedDestinationIds(prev =>
      prev.includes(destinationId) ? prev.filter(id => id !== destinationId) : [...prev, destinationId]
    );
  };

  const addExpense = (tripId: string, expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    setTrips(prev =>
      prev.map(trip => {
        if (trip.id !== tripId) return trip;
        return {
          ...trip,
          expenses: [newExpense, ...trip.expenses],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const deleteExpense = (tripId: string, expenseId: string) => {
    setTrips(prev =>
      prev.map(trip => {
        if (trip.id !== tripId) return trip;
        return {
          ...trip,
          expenses: trip.expenses.filter(e => e.id !== expenseId),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const updateActivity = (tripId: string, dayId: string, activityId: string, updates: Partial<Activity>) => {
    setTrips(prev =>
      prev.map(trip => {
        if (trip.id !== tripId) return trip;
        return {
          ...trip,
          itinerary: trip.itinerary.map(day => {
            if (day.id !== dayId) return day;
            return {
              ...day,
              activities: day.activities.map(act => (act.id === activityId ? { ...act, ...updates } : act)),
            };
          }),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const addActivity = (tripId: string, dayId: string, activityData: Omit<Activity, 'id'>) => {
    const newAct: Activity = {
      ...activityData,
      id: `act-${Date.now()}`,
    };
    setTrips(prev =>
      prev.map(trip => {
        if (trip.id !== tripId) return trip;
        return {
          ...trip,
          itinerary: trip.itinerary.map(day => {
            if (day.id !== dayId) return day;
            return {
              ...day,
              activities: [...day.activities, newAct],
            };
          }),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const deleteActivity = (tripId: string, dayId: string, activityId: string) => {
    setTrips(prev =>
      prev.map(trip => {
        if (trip.id !== tripId) return trip;
        return {
          ...trip,
          itinerary: trip.itinerary.map(day => {
            if (day.id !== dayId) return day;
            return {
              ...day,
              activities: day.activities.filter(a => a.id !== activityId),
            };
          }),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const reorderActivities = (tripId: string, dayId: string, newActivities: Activity[]) => {
    setTrips(prev =>
      prev.map(trip => {
        if (trip.id !== tripId) return trip;
        return {
          ...trip,
          itinerary: trip.itinerary.map(day => {
            if (day.id !== dayId) return day;
            return {
              ...day,
              activities: newActivities,
            };
          }),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const selectRouteOption = (tripId: string, routeOptionId: string) => {
    setTrips(prev =>
      prev.map(trip => {
        if (trip.id !== tripId || !trip.routeOptions) return trip;
        return {
          ...trip,
          routeOptions: trip.routeOptions.map(ro => ({
            ...ro,
            isSelected: ro.id === routeOptionId,
          })),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const selectActivityOption = (tripId: string, dayId: string, activityId: string, optionId: string) => {
    setTrips(prev =>
      prev.map(trip => {
        if (trip.id !== tripId) return trip;
        return {
          ...trip,
          itinerary: trip.itinerary.map(day => {
            if (day.id !== dayId) return day;
            return {
              ...day,
              activities: day.activities.map(act => {
                if (act.id !== activityId) return act;
                const chosenOption = act.options?.find(o => o.id === optionId);
                if (!chosenOption) return act;
                return {
                  ...act,
                  selectedOptionId: optionId,
                  title: chosenOption.title,
                  description: chosenOption.description,
                  category: chosenOption.category || act.category,
                  estimatedCost: chosenOption.estimatedCost !== undefined ? chosenOption.estimatedCost : act.estimatedCost,
                  address: chosenOption.address || act.address,
                };
              }),
            };
          }),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const createTripSnapshot = (tripId: string, name?: string): TripVersionSnapshot => {
    const target = trips.find(t => t.id === tripId);
    if (!target) throw new Error('Trip not found');
    const snapshot = createTripVersionSnapshot(target, name);
    setTrips(prev =>
      prev.map(t => {
        if (t.id !== tripId) return t;
        return {
          ...t,
          versions: [snapshot, ...(t.versions || [])],
          updatedAt: new Date().toISOString(),
        };
      })
    );
    return snapshot;
  };

  const restoreTripSnapshot = (tripId: string, snapshotId: string) => {
    setTrips(prev =>
      prev.map(t => {
        if (t.id !== tripId) return t;
        const snap = t.versions?.find(v => v.id === snapshotId);
        if (!snap) return t;
        return restoreTripVersion(t, snap);
      })
    );
  };

  const deleteTripSnapshot = (tripId: string, snapshotId: string) => {
    setTrips(prev =>
      prev.map(t => {
        if (t.id !== tripId) return t;
        return {
          ...t,
          versions: (t.versions || []).filter(v => v.id !== snapshotId),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const swapDays = (tripId: string, dayNumberA: number, dayNumberB: number) => {
    setTrips(prev =>
      prev.map(t => {
        if (t.id !== tripId) return t;
        return swapTripDays(t, dayNumberA, dayNumberB);
      })
    );
  };

  return (
    <TravelContext.Provider
      value={{
        trips,
        activeTrip,
        savedDestinationIds,
        destinations: CURATED_DESTINATIONS,
        userProfile,
        authUser,
        authLoading,
        signInWithGoogle,
        signOutUser,
        currentCurrency,
        setCurrentCurrency,
        changeTripCurrency,
        updateUserProfile,
        createTrip,
        updateTrip,
        deleteTrip,
        duplicateTrip,
        toggleFavoriteDestination,
        setActiveTripId,
        addExpense,
        deleteExpense,
        updateActivity,
        addActivity,
        deleteActivity,
        reorderActivities,
        selectRouteOption,
        selectActivityOption,
        createTripSnapshot,
        restoreTripSnapshot,
        deleteTripSnapshot,
        swapDays,
      }}
    >
      {children}
    </TravelContext.Provider>
  );
};

export const useTravel = () => {
  const ctx = useContext(TravelContext);
  if (!ctx) throw new Error('useTravel must be used within a TravelProvider');
  return ctx;
};
