import { Trip, ItineraryDay, Activity, TravelCategory } from '../../types/travel';
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
  source: 'gemini-ai' | 'smart-engine';
  modelUsed?: string;
}

/**
 * Procedural travel activity generator tailored to destination & user preferences
 */
export function generateSmartItinerary(input: GenerationInput): GenerationResult {
  const durationDays = Math.min(calculateTripDurationDays(input.startDate, input.endDate), 14);
  const start = new Date(input.startDate);
  const hasPrivateCar = input.transportPreferences.some(t => t.includes('private_car') || t.includes('car'));
  const isPureVeg = input.dietaryPreference === 'pure_veg';
  const isOnlyNonVeg = input.dietaryPreference === 'only_nonveg';
  const hasCustomHalt = input.customPrompt && (
    input.customPrompt.toLowerCase().includes('halt') ||
    input.customPrompt.toLowerCase().includes('stopover') ||
    input.customPrompt.toLowerCase().includes('between source')
  );

  const destLower = input.destination.toLowerCase();
  const isKyoto = destLower.includes('kyoto') || destLower.includes('japan') || destLower.includes('tokyo');
  const isParis = destLower.includes('paris') || destLower.includes('france');
  const isSwiss = destLower.includes('swiss') || destLower.includes('zermatt') || destLower.includes('alps');
  const isBali = destLower.includes('bali') || destLower.includes('indonesia');
  const isAmalfi = destLower.includes('amalfi') || destLower.includes('italy') || destLower.includes('rome');
  const isCairo = destLower.includes('cairo') || destLower.includes('egypt') || destLower.includes('giza');

  const days: ItineraryDay[] = [];

  for (let i = 0; i < durationDays; i++) {
    const curDate = new Date(start);
    curDate.setDate(start.getDate() + i);
    const dateStr = curDate.toISOString().split('T')[0];

    const activities: Activity[] = [];
    const dayNumber = i + 1;

    if (dayNumber === 1) {
      // Arrival & Orientation Day (or Midway Halt if requested in customPrompt)
      if (hasCustomHalt) {
        activities.push({
          id: `act-${dayNumber}-1`,
          title: `Midway Scenic Halt & Regional Exploration`,
          description: `Depart ${input.origin} via ${hasPrivateCar ? 'private car' : 'scenic drive'}, halting midway for a day to tour historic country towns and scenic viewpoints before heading to ${input.destination}.`,
          startTime: '10:00',
          endTime: '14:30',
          durationMinutes: 270,
          estimatedCost: Math.round(input.budgetAmount * 0.04),
          currency: input.currency,
          category: 'adventure',
          sortOrder: 0,
          verificationStatus: 'verified',
          address: `Scenic Waypoint En Route to ${input.destination}`,
        });
      } else {
        activities.push({
          id: `act-${dayNumber}-1`,
          title: `Arrival in ${input.destination} & Check-in`,
          description: `Arrive via ${hasPrivateCar ? 'private car / chauffeur' : input.transportPreferences[0] || 'transit'}, transfer to your ${input.accommodationPreferences} stay, unpack and freshen up.`,
          startTime: '13:00',
          endTime: '15:00',
          durationMinutes: 120,
          estimatedCost: Math.round(input.budgetAmount * 0.05),
          currency: input.currency,
          category: 'relaxation',
          sortOrder: 0,
          verificationStatus: 'verified',
          address: `${input.destination} Central Station / Hub`,
        });
      }

      activities.push({
        id: `act-${dayNumber}-2`,
        title: `Neighborhood Stroll & Orientation`,
        description: `Gentle walk through the historic quarter${hasPrivateCar ? ' with private car drop-off' : ''}, scouting local artisan shops and viewpoints.`,
        startTime: '15:30',
        endTime: '18:00',
        durationMinutes: 150,
        estimatedCost: 15,
        currency: input.currency,
        category: 'culture',
        sortOrder: 1,
        verificationStatus: 'verified',
      });

      const dinnerTitle = isPureVeg
        ? 'Pure Vegetarian & Jain-Friendly Welcome Dinner'
        : isOnlyNonVeg
        ? 'Authentic Regional Non-Veg & Seafood Feast'
        : 'Welcome Dinner with Curated Veg & Non-Veg Flavors';

      const dinnerDesc = isPureVeg
        ? 'Delight in 100% pure vegetarian culinary art, fresh farm organic produce, and regional specialties.'
        : isOnlyNonVeg
        ? 'Indulge in premium regional cuts, traditional meat dishes, and coastal seafood specialties.'
        : 'Savor authentic regional flavors paired with local wines or artisanal teas at a hand-picked bistro.';

      activities.push({
        id: `act-${dayNumber}-3`,
        title: dinnerTitle,
        description: dinnerDesc,
        startTime: '19:00',
        endTime: '21:00',
        durationMinutes: 120,
        estimatedCost: Math.round(input.budgetAmount > 0 ? (input.budgetAmount * 0.07 / durationDays) : 35),
        currency: input.currency,
        category: 'food',
        sortOrder: 2,
        verificationStatus: 'verified',
      });
    } else if (isKyoto) {
      if (dayNumber % 3 === 2) {
        activities.push({
          id: `act-${dayNumber}-1`,
          title: `Fushimi Inari Taisha Early Morning Ascent`,
          description: `Beat the crowds to hike through ten thousand vermilion torii gates winding up the sacred Mount Inari.`,
          startTime: '08:00',
          endTime: '10:30',
          durationMinutes: 150,
          estimatedCost: 0,
          currency: input.currency,
          category: 'heritage',
          sortOrder: 0,
          verificationStatus: 'verified',
          address: '68 Fukakusa Yabunouchicho, Fushimi Ward, Kyoto',
          latitude: 34.9671,
          longitude: 135.7727,
        });
        activities.push({
          id: `act-${dayNumber}-2`,
          title: `Sanjusangendo Hall & Thousand Kannon Statues`,
          description: `Marvel at the National Treasure temple housing 1,001 life-sized carved golden statues of Kannon.`,
          startTime: '11:15',
          endTime: '13:00',
          durationMinutes: 105,
          estimatedCost: 6,
          currency: input.currency,
          category: 'culture',
          sortOrder: 1,
          verificationStatus: 'verified',
        });
        activities.push({
          id: `act-${dayNumber}-3`,
          title: `Gion Historic District & Geisha Teahouse Walk`,
          description: `Atmospheric twilight stroll past preserved machiya merchant townhouses along the Shirakawa canal.`,
          startTime: '17:30',
          endTime: '20:00',
          durationMinutes: 150,
          estimatedCost: 35,
          currency: input.currency,
          category: 'culture',
          sortOrder: 2,
          verificationStatus: 'verified',
        });
      } else {
        activities.push({
          id: `act-${dayNumber}-1`,
          title: `Arashiyama Bamboo Grove & Tenryu-ji Zen Garden`,
          description: `Walk through the towering green bamboo shoots and visit the 14th-century pond garden reflecting western hills.`,
          startTime: '08:30',
          endTime: '11:30',
          durationMinutes: 180,
          estimatedCost: 10,
          currency: input.currency,
          category: 'nature',
          sortOrder: 0,
          verificationStatus: 'verified',
          address: 'Ukyo Ward, Kyoto',
        });
        activities.push({
          id: `act-${dayNumber}-2`,
          title: `Kinkaku-ji (The Golden Pavilion)`,
          description: `View the top two floors of the Zen temple covered in pure gold leaf shimmering over Mirror Pond.`,
          startTime: '13:30',
          endTime: '15:30',
          durationMinutes: 120,
          estimatedCost: 5,
          currency: input.currency,
          category: 'architecture',
          sortOrder: 1,
          verificationStatus: 'verified',
        });
        activities.push({
          id: `act-${dayNumber}-3`,
          title: `Nishiki Market Street Food Tasting Tour`,
          description: `Explore Kyoto’s four-hundred-year-old pantry sampling skewers, grilled mochi, and fresh matcha soft serve.`,
          startTime: '16:30',
          endTime: '18:30',
          durationMinutes: 120,
          estimatedCost: 28,
          currency: input.currency,
          category: 'food',
          sortOrder: 2,
          verificationStatus: 'verified',
        });
      }
    } else if (isParis) {
      activities.push({
        id: `act-${dayNumber}-1`,
        title: dayNumber % 2 === 0 ? `Louvre Masterpieces & Courtyard Glass Pyramid` : `Eiffel Tower Summit & Champ de Mars`,
        description: dayNumber % 2 === 0 ? `Curated route through Mona Lisa, Winged Victory, and Venus de Milo.` : `Ascend to the panoramic top deck looking out across Paris, then picnic on the lawn.`,
        startTime: '09:00',
        endTime: '12:00',
        durationMinutes: 180,
        estimatedCost: 25,
        currency: input.currency,
        category: 'art',
        sortOrder: 0,
        verificationStatus: 'verified',
      });
      activities.push({
        id: `act-${dayNumber}-2`,
        title: `Montmartre & Sacré-Cœur Artisan Quarter`,
        description: `Wander cobblestone alleyways where Picasso and Renoir painted, stopping for café au lait and crêpes.`,
        startTime: '14:00',
        endTime: '16:30',
        durationMinutes: 150,
        estimatedCost: 18,
        currency: input.currency,
        category: 'culture',
        sortOrder: 1,
        verificationStatus: 'verified',
      });
      activities.push({
        id: `act-${dayNumber}-3`,
        title: `Evening Seine River Bateaux-Mouches Cruise`,
        description: `Watch the monuments illuminate against the evening sky as you glide under ancient stone bridges.`,
        startTime: '19:30',
        endTime: '21:00',
        durationMinutes: 90,
        estimatedCost: 22,
        currency: input.currency,
        category: 'relaxation',
        sortOrder: 2,
        verificationStatus: 'verified',
      });
    } else {
      // General tailored destination day
      activities.push({
        id: `act-${dayNumber}-1`,
        title: `Signature Landmark Exploration in ${input.destination}`,
        description: `Morning visit to premier iconic architectural and natural highlights, guided by optimal lighting.`,
        startTime: '09:00',
        endTime: '11:45',
        durationMinutes: 165,
        estimatedCost: Math.round(input.budgetAmount * 0.04 / durationDays),
        currency: input.currency,
        category: input.interests[0] || 'culture',
        sortOrder: 0,
        verificationStatus: 'verified',
      });
      activities.push({
        id: `act-${dayNumber}-2`,
        title: `Local Craft, Scenery & Hidden Gem Walk`,
        description: `Immersion in authentic artisanal spots and scenic viewpoints away from crowds.`,
        startTime: '13:30',
        endTime: '16:00',
        durationMinutes: 150,
        estimatedCost: Math.round(input.budgetAmount * 0.03 / durationDays),
        currency: input.currency,
        category: input.interests[1] || 'nature',
        sortOrder: 1,
        verificationStatus: 'verified',
      });
      activities.push({
        id: `act-${dayNumber}-3`,
        title: `Sunset Viewpoint & Culinary Discovery`,
        description: `Golden hour panoramic views followed by an exquisite local dining experience.`,
        startTime: '18:00',
        endTime: '20:30',
        durationMinutes: 150,
        estimatedCost: Math.round(input.budgetAmount * 0.05 / durationDays),
        currency: input.currency,
        category: 'food',
        sortOrder: 2,
        verificationStatus: 'verified',
      });
    }

    days.push({
      id: `day-${dayNumber}`,
      dayNumber,
      date: dateStr,
      summary: dayNumber === 1 ? `Arrival, check-in, and twilight orientation in ${input.destination}` : `Immersive day ${dayNumber} exploring highlights, local gastronomy, and cultural heritage.`,
      activities,
    });
  }

  return {
    title: `${durationDays}-Day Immersive Journey to ${input.destination}`,
    summary: `A carefully balanced ${input.travelStyle} itinerary from ${input.origin} tailored for ${input.travelers} traveler(s), emphasizing ${input.interests.join(', ')} with sustainable transport.`,
    days,
    source: 'smart-engine',
  };
}
