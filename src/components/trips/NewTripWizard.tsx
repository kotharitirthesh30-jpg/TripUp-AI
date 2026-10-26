import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { TravelCategory, Trip, DietaryPreference } from '../../types/travel';
import { SUPPORTED_CURRENCIES } from '../../lib/trip-logic';
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Compass,
  Train,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Globe,
  Search,
  Car,
  Utensils,
  MessageSquare,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

interface NewTripWizardProps {
  onSuccess: (newTripId: string) => void;
  onCancel: () => void;
  initialDestination?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialTravelers?: number;
}

const CATEGORIES: { id: TravelCategory; label: string; icon: string; desc: string }[] = [
  { id: 'culture', label: 'Culture & Arts', icon: '🎭', desc: 'Museums, theater, folklore & traditions' },
  { id: 'heritage', label: 'Heritage & Temples', icon: '⛩️', desc: 'Ancient monuments, UNESCO sites & ruins' },
  { id: 'nature', label: 'Nature & Scenery', icon: '🌿', desc: 'National parks, hikes, lakes & gardens' },
  { id: 'food', label: 'Gastronomy & Dining', icon: '🍜', desc: 'Street food markets, bistros & culinary craft' },
  { id: 'relaxation', label: 'Wellness & Relaxation', icon: '✨', desc: 'Spas, coastal retreats & peaceful courtyards' },
  { id: 'adventure', label: 'Adventure & Outdoors', icon: '🧗', desc: 'Trekking, cycling & active expeditions' },
  { id: 'architecture', label: 'Architecture & Design', icon: '🏛️', desc: 'Iconic facades, modern wonders & skylines' },
  { id: 'shopping', label: 'Artisanal Shopping', icon: '🛍️', desc: 'Local craft ateliers & vintage districts' },
];

const DIETARY_OPTIONS: { id: DietaryPreference; label: string; icon: string; desc: string; badge: string }[] = [
  {
    id: 'pure_veg',
    label: 'Pure Veg',
    icon: '🥦',
    badge: '100% Vegetarian & Jain Options',
    desc: 'Strictly vegetarian kitchens, fresh greens, dairy/no-egg, and Jain-friendly dining recommendations.',
  },
  {
    id: 'veg_nonveg',
    label: 'Veg & Non-Veg',
    icon: '🥗🍗',
    badge: 'Mixed & Flexible',
    desc: 'Versatile dining offering both exquisite vegetarian options and authentic regional meat dishes.',
  },
  {
    id: 'only_nonveg',
    label: 'Only Non-Veg',
    icon: '🥩🍤',
    badge: 'Poultry, Meat & Seafood',
    desc: 'Focused on regional butcher cuts, grilled meats, coastal fish, and local poultry delicacies.',
  },
  {
    id: 'vegan',
    label: 'Vegan',
    icon: '🌱',
    badge: '100% Plant-Based',
    desc: 'Completely dairy-free, egg-free, and plant-derived organic meals.',
  },
  {
    id: 'halal',
    label: 'Halal',
    icon: '🌙',
    badge: 'Halal Certified',
    desc: 'Certified halal eateries, alcohol-free culinary environments, and compliant dining.',
  },
  {
    id: 'kosher',
    label: 'Kosher',
    icon: '✡️',
    badge: 'Kosher Certified',
    desc: 'Dedicated kosher dining venues compliant with Jewish dietary traditions.',
  },
  {
    id: 'gluten_free',
    label: 'Gluten-Free',
    icon: '🌾❌',
    badge: 'Celiac Friendly',
    desc: 'Gluten-conscious bakeries, wheat-free options, and cross-contamination safe kitchens.',
  },
];

const TRANSPORT_CHOICES = [
  { id: 'private_car', label: 'Private Car / Rental Car', icon: Car, desc: 'Dedicated automobile for road trips, scenic detours & halts' },
  { id: 'taxi_cab', label: 'Cab / Taxi / Chauffeur', icon: Car, desc: 'Convenient on-demand city cabs and point-to-point transfers' },
  { id: 'walking', label: 'Walking & Strolling', icon: Compass, desc: 'Pedestrian-friendly paths, historic cobblestones and scenic trails' },
  { id: 'train', label: 'High-Speed Trains', icon: Train, desc: 'Express intercity rail, bullet trains and scenic panoramic tracks' },
  { id: 'public_transport', label: 'Metro & City Bus', icon: Train, desc: 'Economical subway networks, trams, and urban transit systems' },
  { id: 'flight', label: 'Domestic Flights & Ferries', icon: Globe, desc: 'Island hops, coastal ferries, and rapid regional air corridors' },
];

const QUICK_PROMPT_SUGGESTIONS = [
  'I need a halt between source and destination for a day and explore nearby area',
  'Prioritize scenic mountain or coastal drives with private car',
  'Strictly recommend pure veg restaurants with regional specialties',
  'Keep mornings relaxed after 10 AM with artisan tea and coffee shops',
  'Include offbeat heritage ruins and avoid congested tourist traps',
];

export const NewTripWizard: React.FC<NewTripWizardProps> = ({
  onSuccess,
  onCancel,
  initialDestination = '',
  initialStartDate = '2026-11-10',
  initialEndDate = '2026-11-15',
  initialTravelers = 2,
}) => {
  const { createTrip, destinations, currentCurrency } = useTravel();

  const [step, setStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStepText, setGenerationStepText] = useState('Initializing Gemini travel intelligence...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [origin, setOrigin] = useState('San Francisco, CA');
  const [destination, setDestination] = useState(initialDestination || 'Kyoto, Japan');
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [travelers, setTravelers] = useState(initialTravelers);

  // Budget MUST start at 0 compulsorily as requested by the user
  const [budgetAmount, setBudgetAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<string>(currentCurrency || 'INR');

  const [travelStyle, setTravelStyle] = useState<'relaxed' | 'balanced' | 'packed'>('balanced');
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>('pure_veg');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const [selectedInterests, setSelectedInterests] = useState<TravelCategory[]>([
    'culture',
    'heritage',
    'food',
    'nature',
  ]);
  const [transportPrefs, setTransportPrefs] = useState<string[]>(['private_car', 'walking']);
  const [accommodationPref, setAccommodationPref] = useState('Boutique Hotel / Machiya');
  const [quickContinent, setQuickContinent] = useState<string>('all');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const activeCurrencyInfo = SUPPORTED_CURRENCIES[currency] || { symbol: currency, name: currency };

  const handleInterestToggle = (id: TravelCategory) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleTransportToggle = (t: string) => {
    setTransportPrefs(prev =>
      prev.includes(t)
        ? prev.length > 1 ? prev.filter(item => item !== t) : prev
        : [...prev, t]
    );
  };

  const validateStep = (s: number): boolean => {
    setErrorMsg(null);
    if (s === 1) {
      if (!destination.trim()) {
        setErrorMsg('Please enter a destination.');
        return false;
      }
      if (!origin.trim()) {
        setErrorMsg('Please enter your starting origin city.');
        return false;
      }
    }
    if (s === 2) {
      if (!startDate || !endDate) {
        setErrorMsg('Please choose both start and end travel dates.');
        return false;
      }
      if (new Date(endDate) < new Date(startDate)) {
        setErrorMsg('End date must be on or after start date.');
        return false;
      }
    }
    if (s === 3) {
      if (typeof budgetAmount !== 'number' || budgetAmount < 0 || isNaN(budgetAmount)) {
        setErrorMsg('Please enter a valid budget amount (0 or more).');
        return false;
      }
    }
    if (s === 4) {
      if (selectedInterests.length === 0) {
        setErrorMsg('Please select at least one travel interest.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleGenerate = async () => {
    if (!validateStep(5)) return;

    setIsGenerating(true);
    setGenerationStepText('Connecting to Google Gemini API...');

    try {
      setTimeout(() => setGenerationStepText('Architecting daily timeline & route distances...'), 1200);
      setTimeout(() => setGenerationStepText('Balancing budget estimates & verified venues...'), 2400);

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          startDate,
          endDate,
          travelers,
          budgetAmount,
          currency,
          travelStyle,
          interests: selectedInterests,
          transportPreferences: transportPrefs,
          accommodationPreferences: accommodationPref,
          dietaryPreference,
          customPrompt,
        }),
      });

      let genData;
      if (response.ok) {
        genData = await response.json();
      } else {
        // Local procedural smart generator fallback
        const { generateSmartItinerary } = await import('../../lib/ai/itinerary-generator');
        genData = generateSmartItinerary({
          origin,
          destination,
          startDate,
          endDate,
          travelers,
          budgetAmount,
          currency,
          interests: selectedInterests,
          travelStyle,
          transportPreferences: transportPrefs,
          accommodationPreferences: accommodationPref,
          dietaryPreference,
          customPrompt,
        });
      }

      // Match cover image
      const matchedDest = destinations.find(d =>
        destination.toLowerCase().includes(d.name.toLowerCase()) ||
        destination.toLowerCase().includes(d.country.toLowerCase())
      );

      const coverImageUrl =
        matchedDest?.imageUrl ||
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200&auto=format&fit=crop';

      // Build initial recorded budget expenses (adjusted if budget starts at 0)
      const baseAccommodationCost = budgetAmount > 0 ? Math.round(budgetAmount * 0.45) : 0;
      const baseTransportCost = budgetAmount > 0 ? Math.round(budgetAmount * 0.15) : 0;

      const expenses = [
        {
          id: `exp-${Date.now()}-1`,
          tripId: '',
          category: 'accommodation' as const,
          description: `${accommodationPref} Booking`,
          estimatedAmount: baseAccommodationCost,
          actualAmount: baseAccommodationCost,
          currency,
          expenseDate: startDate,
        },
        {
          id: `exp-${Date.now()}-2`,
          tripId: '',
          category: 'transport' as const,
          description: transportPrefs.includes('private_car') ? 'Private Car / Fuel & Tolls' : 'Transit & Passes',
          estimatedAmount: baseTransportCost,
          actualAmount: baseTransportCost,
          currency,
          expenseDate: startDate,
        },
      ];

      const newTrip = createTrip({
        userId: 'usr-101',
        title: genData.title || `${destination} Journey`,
        origin,
        destination,
        destinationPlaceId: matchedDest?.id,
        startDate,
        endDate,
        travelers,
        budgetAmount,
        currency,
        travelStyle,
        interests: selectedInterests,
        transportPreferences: transportPrefs,
        accommodationPreferences: accommodationPref,
        dietaryPreference,
        customPrompt,
        status: 'upcoming',
        coverImageUrl,
        itinerary: genData.days || [],
        expenses,
        members: [],
      });

      setIsGenerating(false);
      onSuccess(newTrip.id);
    } catch (err: any) {
      console.error(err);
      setIsGenerating(false);
      setErrorMsg('Failed to generate trip. Please try again or check parameters.');
    }
  };

  // Helper for preset budget values depending on currency
  const getPresetBudgets = () => {
    if (currency === 'INR') {
      return [
        { amount: 0, label: '₹0 (Zero Start / Flexible)', desc: 'Start from 0 and log expenses as you go' },
        { amount: 35000, label: '₹35,000 (Value)', desc: 'Hostels, budget stays, regional transit' },
        { amount: 85000, label: '₹85,000 (Comfort)', desc: 'Boutique hotels, curated meals, private car' },
        { amount: 200000, label: '₹2,00,000 (Luxury)', desc: '5-star resorts, private guides, signature dining' },
      ];
    }
    return [
      { amount: 0, label: '$0 (Zero Start / Flexible)', desc: 'Start from 0 and log expenses as you go' },
      { amount: 1200, label: '$1,200 (Value)', desc: 'Hostels, budget stays, regional transit' },
      { amount: 2800, label: '$2,800 (Comfort)', desc: 'Boutique hotels, curated meals, private car' },
      { amount: 6500, label: '$6,500 (Luxury)', desc: '5-star resorts, private guides, signature dining' },
    ];
  };

  return (
    <div className="max-w-3xl mx-auto bg-[#121c17] border border-[#2b4437] rounded-2xl shadow-2xl overflow-hidden p-4 sm:p-6 md:p-8 text-[#f4efe6]">
      {/* Wizard Header & Progress */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-[#1f372c] rounded-xl text-[#52b788] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-serif text-[#f4efe6] truncate">
                Create Intelligently Planned Trip
              </h2>
              <p className="text-xs text-[#8ca395]">Step {step} of 6 — Personalized AI Journey Architect</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-xs text-[#8ca395] hover:text-[#e5dfd5] px-3 py-1.5 rounded-lg border border-[#2b4437] hover:bg-[#1a2b22] transition-colors shrink-0"
          >
            Cancel
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#1b2b23] h-2 rounded-full overflow-hidden flex">
          {[1, 2, 3, 4, 5, 6].map(s => (
            <div
              key={s}
              className={`flex-1 h-full transition-all duration-300 ${
                s <= step ? 'bg-[#52b788]' : 'bg-[#1b2b23]'
              } ${s < 6 ? 'border-r border-[#121c17]' : ''}`}
            />
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3.5 bg-[#3b1d1d] border border-[#782d2d] rounded-xl text-xs text-[#ffb4b4] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: Destination & Origin */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-[#f4efe6] mb-1">Where are you traveling?</h3>
              <p className="text-xs text-[#8ca395]">
                Plan a journey to any city, national park, island, or country across the entire world.
              </p>
            </div>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#182a20] border border-[#2b4437] text-[11px] font-semibold text-[#52b788] shrink-0">
              <Globe className="w-3.5 h-3.5" />
              <span>Worldwide Coverage</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Destination Input with Autocomplete */}
            <div className="relative">
              <label className="block text-xs font-medium text-[#c0d1c7] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#52b788]" /> Destination
                </span>
                <span className="text-[10px] text-[#718b7c]">Any location worldwide</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={destination}
                  onChange={e => {
                    setDestination(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="e.g. Kyoto, Japan or New Delhi, India or Amalfi Coast, Italy"
                  className="w-full bg-[#182620] border border-[#2b4437] rounded-xl px-4 py-3 text-sm text-[#f4efe6] focus:outline-none focus:border-[#52b788]"
                />
                <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#799486] pointer-events-none" />
              </div>

              {/* Autocomplete Dropdown */}
              {showSuggestions && destination.trim().length > 1 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-[#121c17] border border-[#2b4437] rounded-xl shadow-2xl max-h-56 overflow-y-auto p-1.5 space-y-1">
                  {destinations
                    .filter(d =>
                      d.name.toLowerCase().includes(destination.toLowerCase()) ||
                      d.country.toLowerCase().includes(destination.toLowerCase()) ||
                      (d.continent && d.continent.toLowerCase().includes(destination.toLowerCase()))
                    )
                    .slice(0, 6)
                    .map(d => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          setDestination(`${d.name}, ${d.country}`);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#1a2c22] flex items-center justify-between text-xs text-[#c0d1c7] hover:text-white transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#52b788] shrink-0" />
                          <span className="font-medium text-white truncate">{d.name}</span>
                          <span className="text-[#889e92] shrink-0">({d.country})</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#182620] border border-[#263b2f] text-[#52b788] shrink-0 ml-2">
                          {d.continent || d.region}
                        </span>
                      </button>
                    ))}
                  <div className="p-2 border-t border-[#1f3128] text-[11px] text-[#8ea598] flex items-center justify-between">
                    <span>Press enter or continue typing any custom place</span>
                    <button
                      type="button"
                      onClick={() => setShowSuggestions(false)}
                      className="text-[#52b788] hover:underline"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Origin Input */}
            <div>
              <label className="block text-xs font-medium text-[#c0d1c7] mb-1.5 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#52b788]" /> Origin / Departing From
              </label>
              <input
                type="text"
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                placeholder="e.g. Mumbai, India or San Francisco, CA"
                className="w-full bg-[#182620] border border-[#2b4437] rounded-xl px-4 py-3 text-sm text-[#f4efe6] focus:outline-none focus:border-[#52b788]"
              />
            </div>

            {/* Quick popular picks grouped by continent */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] uppercase tracking-wider text-[#748e80] font-semibold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#52b788]" />
                Explore Worldwide Starting Points:
              </span>

              {/* Continent Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'Asia', label: 'Asia' },
                  { id: 'Europe', label: 'Europe' },
                  { id: 'North America', label: 'Americas' },
                  { id: 'Africa', label: 'Africa' },
                  { id: 'Oceania', label: 'Oceania' },
                  { id: 'Middle East', label: 'Middle East' },
                ].map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setQuickContinent(c.id)}
                    className={`px-2.5 py-1 rounded-md transition-colors border whitespace-nowrap ${
                      quickContinent === c.id
                        ? 'bg-[#2e5d4b] border-[#52b788] text-white font-semibold'
                        : 'bg-[#14201a] border-[#263b2f] text-[#8fa79a] hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Destination buttons */}
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-[#101914] rounded-xl border border-[#203126]">
                {destinations
                  .filter(d => {
                    if (quickContinent === 'all') return true;
                    if (quickContinent === 'North America') {
                      return d.continent === 'North America' || d.continent === 'South America';
                    }
                    return d.continent === quickContinent;
                  })
                  .map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setDestination(`${d.name}, ${d.country}`);
                        setShowSuggestions(false);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-colors border break-words ${
                        destination.includes(d.name)
                          ? 'bg-[#2e5d4b] border-[#52b788] text-white font-bold'
                          : 'bg-[#182620] border-[#2b4437] text-[#c0d1c7] hover:bg-[#20342b]'
                      }`}
                    >
                      {d.name} <span className="opacity-70 text-[10px]">({d.country})</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Dates, Travelers & Pace */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-[#f4efe6] mb-1">When and who is going?</h3>
            <p className="text-xs text-[#8ca395]">Trip dates configure the daily activity schedules and seasonal climate intelligence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#c0d1c7] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#52b788]" /> Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-[#182620] border border-[#2b4437] rounded-xl px-4 py-3 text-sm text-[#f4efe6] focus:outline-none focus:border-[#52b788]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#c0d1c7] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#52b788]" /> End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-[#182620] border border-[#2b4437] rounded-xl px-4 py-3 text-sm text-[#f4efe6] focus:outline-none focus:border-[#52b788]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#c0d1c7] mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#52b788]" /> Number of Travelers
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTravelers(num)}
                  className={`py-2.5 px-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all text-center ${
                    travelers === num
                      ? 'bg-[#2e5d4b] border-[#52b788] text-white shadow-md'
                      : 'bg-[#182620] border-[#2b4437] text-[#c0d1c7] hover:bg-[#20342b]'
                  }`}
                >
                  {num} {num === 1 ? 'Solo' : 'Pax'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#c0d1c7] mb-2">Travel Pace</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(
                [
                  { id: 'relaxed', label: 'Relaxed', desc: 'Slow mornings, 2 activities/day' },
                  { id: 'balanced', label: 'Balanced', desc: 'Comfortable mix, 3 activities/day' },
                  { id: 'packed', label: 'Fast-Paced', desc: 'See everything, 4+ activities/day' },
                ] as const
              ).map(style => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setTravelStyle(style.id)}
                  className={`p-3 rounded-xl border text-left transition-all min-w-0 ${
                    travelStyle === style.id
                      ? 'bg-[#2e5d4b] border-[#52b788] text-white'
                      : 'bg-[#182620] border-[#2b4437] text-[#c0d1c7] hover:bg-[#20342b]'
                  }`}
                >
                  <div className="text-xs font-semibold">{style.label}</div>
                  <div className="text-[10px] text-[#9ab3a5] mt-1 break-words">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Budget & Currency (Starts at 0 Compulsorily) */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-[#f4efe6] mb-1">Target Budget & Currency</h3>
            <p className="text-xs text-[#8ca395]">
              Total estimated budget starts at 0 by default. Set any custom amount or start at 0 for flexible tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#c0d1c7] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#52b788]" /> Total Estimated Budget
                </span>
                <span className="text-[10px] text-[#52b788] font-semibold">Starts at 0 (Flexible)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#8ca395]">
                  {activeCurrencyInfo.symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={budgetAmount}
                  onChange={e => setBudgetAmount(Math.max(0, Number(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full bg-[#182620] border border-[#2b4437] rounded-xl pl-9 pr-4 py-3 text-sm text-[#f4efe6] focus:outline-none focus:border-[#52b788] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c0d1c7] mb-1.5">Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full bg-[#182620] border border-[#2b4437] rounded-xl px-3 py-3 text-sm text-[#f4efe6] focus:outline-none focus:border-[#52b788]"
              >
                {Object.values(SUPPORTED_CURRENCIES).map(c => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol}) — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick budget tier buttons */}
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#748e80] font-semibold block mb-2">
              Preset Budget Scales ({currency} {activeCurrencyInfo.symbol}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {getPresetBudgets().map(tier => (
                <button
                  key={tier.amount}
                  type="button"
                  onClick={() => setBudgetAmount(tier.amount)}
                  className={`p-3 rounded-xl border text-left transition-all min-w-0 ${
                    budgetAmount === tier.amount
                      ? 'bg-[#2e5d4b] border-[#52b788] text-white'
                      : 'bg-[#182620] border-[#2b4437] text-[#c0d1c7] hover:bg-[#20342b]'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{tier.label}</div>
                  <div className="text-xs font-serif text-[#ffd166] mt-0.5">
                    {activeCurrencyInfo.symbol} {tier.amount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#9ab3a5] mt-1 break-words">{tier.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Interests & Food Preferences */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-[#f4efe6] mb-1">Passions & Food Preferences</h3>
            <p className="text-xs text-[#8ca395]">
              Tailor dining venues, pure veg requirements, and curated travel experiences.
            </p>
          </div>

          {/* FOOD PREFERENCE SECTION */}
          <div className="p-4 bg-[#14201a] border border-[#284133] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Utensils className="w-4 h-4 text-[#52b788]" /> Food & Dining Preference
              </label>
              <span className="text-[11px] text-[#52b788] font-medium">Strictly followed by AI</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DIETARY_OPTIONS.map(diet => {
                const isSelected = dietaryPreference === diet.id;
                return (
                  <button
                    key={diet.id}
                    type="button"
                    onClick={() => setDietaryPreference(diet.id)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all min-w-0 ${
                      isSelected
                        ? 'bg-[#214333] border-[#52b788] text-white shadow-md'
                        : 'bg-[#182620] border-[#283d31] text-[#c0d1c7] hover:bg-[#1f3328]'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{diet.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold flex items-center gap-1.5 flex-wrap">
                        <span>{diet.label}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#13231a] text-[#52b788] border border-[#2b4437]">
                          {diet.badge}
                        </span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#52b788] shrink-0 ml-auto" />}
                      </div>
                      <p className="text-[10px] text-[#9bb5a6] mt-1 break-words">{diet.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TRAVEL INTERESTS */}
          <div>
            <label className="block text-xs font-medium text-[#c0d1c7] mb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#52b788]" /> Key Experiences & Interests
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CATEGORIES.map(cat => {
                const isSelected = selectedInterests.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleInterestToggle(cat.id)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all min-w-0 ${
                      isSelected
                        ? 'bg-[#224434] border-[#52b788] text-white shadow-sm'
                        : 'bg-[#182620] border-[#2b4437] text-[#c0d1c7] hover:bg-[#20342b]'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{cat.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>{cat.label}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#52b788] shrink-0" />}
                      </div>
                      <div className="text-[10px] text-[#96aea1] mt-0.5 break-words">{cat.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Transport (Private Car), Stay & Custom Prompt */}
      {step === 5 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-[#f4efe6] mb-1">Transport, Stay & Custom Requests</h3>
            <p className="text-xs text-[#8ca395]">
              Choose transport options (including private car), accommodation, and enter custom trip instructions.
            </p>
          </div>

          {/* TRANSPORT OPTIONS INCLUDING PRIVATE CAR */}
          <div>
            <label className="block text-xs font-medium text-[#c0d1c7] mb-2 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-[#52b788]" /> Transport Options (Select all that apply)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {TRANSPORT_CHOICES.map(t => {
                const isChecked = transportPrefs.includes(t.id);
                const IconComponent = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTransportToggle(t.id)}
                    className={`p-3 rounded-xl border text-left transition-all min-w-0 ${
                      isChecked
                        ? 'bg-[#2e5d4b] border-[#52b788] text-white shadow-sm'
                        : 'bg-[#182620] border-[#2b4437] text-[#c0d1c7] hover:bg-[#20342b]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent className="w-4 h-4 text-[#52b788] shrink-0" />
                      <span className="text-xs font-semibold truncate">{t.label}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white ml-auto shrink-0" />}
                    </div>
                    <p className="text-[10px] text-[#9ab3a5] break-words">{t.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACCOMMODATION STYLE */}
          <div>
            <label className="block text-xs font-medium text-[#c0d1c7] mb-2">Preferred Stay Category</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { title: 'Boutique Hotel / Machiya', desc: 'Character-rich, authentic localized hospitality' },
                { title: 'Eco-Resort & Spa', desc: 'Holistic wellness, nature immersion, tranquil pools' },
                { title: 'Central City Apartment', desc: 'Private kitchen, washer, independent freedom' },
              ].map(stay => (
                <button
                  key={stay.title}
                  type="button"
                  onClick={() => setAccommodationPref(stay.title)}
                  className={`p-3 rounded-xl border text-left transition-all min-w-0 ${
                    accommodationPref === stay.title
                      ? 'bg-[#2e5d4b] border-[#52b788] text-white'
                      : 'bg-[#182620] border-[#2b4437] text-[#c0d1c7] hover:bg-[#20342b]'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{stay.title}</div>
                  <div className="text-[10px] text-[#9ab3a5] mt-1 break-words">{stay.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* CUSTOM PROMPT & SPECIAL INSTRUCTIONS */}
          <div className="p-4 bg-[#14201a] border border-[#2a4535] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <MessageSquare className="w-4 h-4 text-[#52b788]" /> Custom Trip Instructions & Prompts
              </label>
              <span className="text-[10px] text-[#8ea597]">Optional & completely customizable</span>
            </div>

            <textarea
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              rows={3}
              placeholder='e.g. "I need a halt between source and destination for a day and explore nearby area", "Prefer scenic road trip drives with private car", "Ensure pure vegetarian food stalls only"'
              className="w-full bg-[#182620] border border-[#2b4437] rounded-xl p-3 text-xs text-[#f4efe6] focus:outline-none focus:border-[#52b788] leading-relaxed resize-none"
            />

            <div>
              <span className="text-[11px] text-[#789686] font-medium block mb-1.5">
                Quick sample prompts (tap to apply):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPT_SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (!customPrompt.trim()) {
                        setCustomPrompt(suggestion);
                      } else if (!customPrompt.includes(suggestion)) {
                        setCustomPrompt(`${customPrompt.trim()}; ${suggestion}`);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#192b22] hover:bg-[#233c2f] border border-[#2b4437] text-[11px] text-[#b0c7ba] hover:text-white transition-colors text-left break-words"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: Review & Final Submit */}
      {step === 6 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-[#f4efe6] mb-1">Review Your Travel Parameters</h3>
            <p className="text-xs text-[#8ca395]">
              Verify your inputs, food preferences, and custom instructions before generating with Gemini AI.
            </p>
          </div>

          <div className="bg-[#182620] border border-[#2b4437] rounded-xl p-4 sm:p-5 space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center py-1.5 border-b border-[#24372e] gap-1">
              <span className="text-[#8ca395]">Destination & Origin:</span>
              <span className="font-semibold text-[#f4efe6]">{destination} (from {origin})</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center py-1.5 border-b border-[#24372e] gap-1">
              <span className="text-[#8ca395]">Travel Dates & Pace:</span>
              <span className="font-semibold text-[#f4efe6]">{startDate} to {endDate} · {travelers} traveler(s) ({travelStyle})</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center py-1.5 border-b border-[#24372e] gap-1">
              <span className="text-[#8ca395]">Total Estimated Budget:</span>
              <span className="font-semibold text-[#52b788]">
                {currency} {activeCurrencyInfo.symbol} {budgetAmount.toLocaleString()}
                {budgetAmount === 0 && ' (Flexible / Start at 0)'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center py-1.5 border-b border-[#24372e] gap-1">
              <span className="text-[#8ca395]">Food Preference:</span>
              <span className="font-semibold text-[#52b788] capitalize flex items-center gap-1.5">
                <span>{DIETARY_OPTIONS.find(d => d.id === dietaryPreference)?.icon}</span>
                <span>{DIETARY_OPTIONS.find(d => d.id === dietaryPreference)?.label}</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center py-1.5 border-b border-[#24372e] gap-1">
              <span className="text-[#8ca395]">Transport & Stay:</span>
              <span className="font-semibold text-[#f4efe6] break-words">
                {transportPrefs.map(t => TRANSPORT_CHOICES.find(c => c.id === t)?.label || t).join(', ')} · {accommodationPref}
              </span>
            </div>

            {customPrompt && (
              <div className="py-1.5 border-t border-[#24372e]">
                <span className="text-[#8ca395] block mb-1">Custom Request / Halt Instruction:</span>
                <p className="text-[#ffd166] italic bg-[#131f18] p-2.5 rounded-lg border border-[#273d30] break-words">
                  "{customPrompt}"
                </p>
              </div>
            )}
          </div>

          {isGenerating ? (
            <div className="p-8 bg-[#15231c] border border-[#52b788]/40 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#52b788] animate-spin" />
              <div className="text-sm font-semibold text-[#f4efe6]">{generationStepText}</div>
              <p className="text-xs text-[#8ca395] max-w-md">
                Analyzing verified coordinates, food preferences ({dietaryPreference}), transport modes, and allocating budget.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-[#1e3427] border border-[#52b788]/40 rounded-xl flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#52b788] shrink-0" />
              <p className="text-xs text-[#d8e8de]">
                Ready to architect your personalized itinerary honoring your dietary choices, custom prompts, and private car preferences.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Navigation Footer (No overlapping buttons) */}
      <div className="mt-8 pt-5 border-t border-[#23352b] flex flex-wrap items-center justify-between gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#2b4437] text-xs font-medium text-[#c0d1c7] hover:bg-[#1a2b22] transition-colors disabled:opacity-50 shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        ) : (
          <div className="shrink-0" />
        )}

        {step < 6 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2e5d4b] hover:bg-[#3a735e] text-xs font-semibold text-white shadow-lg transition-all ml-auto shrink-0"
          >
            Continue <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 sm:px-7 py-3 rounded-xl bg-[#52b788] hover:bg-[#40916c] text-xs font-bold text-[#0c120f] shadow-lg transition-all disabled:opacity-50 ml-auto shrink-0"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" /> <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 shrink-0" /> <span>Architect AI Itinerary</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
