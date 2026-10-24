import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { TravelCategory, Trip } from '../../types/travel';
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
  Search
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

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

export const NewTripWizard: React.FC<NewTripWizardProps> = ({
  onSuccess,
  onCancel,
  initialDestination = '',
  initialStartDate = '2026-11-10',
  initialEndDate = '2026-11-15',
  initialTravelers = 2,
}) => {
  const { createTrip, destinations } = useTravel();

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
  const [budgetAmount, setBudgetAmount] = useState(2800);
  const [currency, setCurrency] = useState('USD');
  const [travelStyle, setTravelStyle] = useState<'relaxed' | 'balanced' | 'packed'>('balanced');
  const [selectedInterests, setSelectedInterests] = useState<TravelCategory[]>([
    'culture',
    'heritage',
    'food',
    'nature',
  ]);
  const [transportPrefs, setTransportPrefs] = useState<string[]>(['walking', 'public_transport']);
  const [accommodationPref, setAccommodationPref] = useState('Boutique Hotel / Machiya');
  const [quickContinent, setQuickContinent] = useState<string>('all');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInterestToggle = (id: TravelCategory) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleTransportToggle = (t: string) => {
    setTransportPrefs(prev =>
      prev.includes(t) ? prev.filter(item => item !== t) : [...prev, t]
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
      if (!budgetAmount || budgetAmount <= 0) {
        setErrorMsg('Please enter a valid budget amount.');
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
      // Step simulated updates for feedback
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
        }),
      });

      let genData;
      if (response.ok) {
        genData = await response.json();
      } else {
        // Fallback to local smart generator if fetch fails
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
        });
      }

      // Find matching destination cover image
      const matchedDest = destinations.find(d =>
        destination.toLowerCase().includes(d.name.toLowerCase()) ||
        destination.toLowerCase().includes(d.country.toLowerCase())
      );

      const coverImageUrl =
        matchedDest?.imageUrl ||
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200&auto=format&fit=crop';

      // Build initial recorded budget expenses
      const expenses = [
        {
          id: `exp-${Date.now()}-1`,
          tripId: '',
          category: 'accommodation' as const,
          description: `${accommodationPref} Booking`,
          estimatedAmount: Math.round(budgetAmount * 0.45),
          actualAmount: Math.round(budgetAmount * 0.42),
          currency,
          expenseDate: startDate,
        },
        {
          id: `exp-${Date.now()}-2`,
          tripId: '',
          category: 'transport' as const,
          description: `Transit & Rail Pass`,
          estimatedAmount: Math.round(budgetAmount * 0.15),
          actualAmount: Math.round(budgetAmount * 0.14),
          currency,
          expenseDate: startDate,
        },
      ];

      const newTrip = createTrip({
        userId: 'usr-101',
        title: genData.title || `${destination} Adventure`,
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

  return (
    <div className="max-w-3xl mx-auto bg-[#121c17] border border-[#2b4437] rounded-2xl shadow-2xl overflow-hidden p-6 md:p-8 text-[#f4efe6]">
      {/* Wizard Header & Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#1f372c] rounded-xl text-[#52b788]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-serif text-[#f4efe6]">Create Intelligently Planned Trip</h2>
              <p className="text-xs text-[#8ca395]">Step {step} of 6 — Personalized AI Itinerary Architect</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-xs text-[#8ca395] hover:text-[#e5dfd5] px-3 py-1.5 rounded-lg border border-[#2b4437] hover:bg-[#1a2b22] transition-colors"
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
              <h3 className="text-lg font-semibold text-[#f4efe6] mb-1">Where are you traveling?</h3>
              <p className="text-xs text-[#8ca395]">
                Plan a journey to any city, national park, island, or country across the entire world.
              </p>
            </div>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#182a20] border border-[#2b4437] text-[11px] font-semibold text-[#52b788]">
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
                  placeholder="e.g. Kyoto, Japan or Rome, Italy or Banff, Canada"
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
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#52b788]" />
                          <span className="font-medium text-white">{d.name}</span>
                          <span className="text-[#889e92]">({d.country})</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#182620] border border-[#263b2f] text-[#52b788]">
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
                placeholder="e.g. San Francisco (SFO)"
                className="w-full bg-[#182620] border border-[#2b4437] rounded-xl px-4 py-3 text-sm text-[#f4efe6] focus:outline-none focus:border-[#52b788]"
              />
            </div>

            {/* Quick popular picks grouped by continent */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-[#748e80] font-semibold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#52b788]" />
                  Explore Worldwide Starting Points:
                </span>
              </div>

              {/* Continent Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
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
                    className={`px-2.5 py-1 rounded-md transition-colors border ${
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
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-[#101914] rounded-xl border border-[#203126]">
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
                      className={`px-2.5 py-1 rounded-lg text-xs transition-colors border ${
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

      {/* STEP 2: Dates & Travelers */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-[#f4efe6] mb-1">When and who is going?</h3>
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
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTravelers(num)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${
                    travelers === num
                      ? 'bg-[#2e5d4b] border-[#52b788] text-white shadow-md'
                      : 'bg-[#182620] border-[#2b4437] text-[#c0d1c7] hover:bg-[#20342b]'
                  }`}
                >
                  {num} {num === 1 ? 'Solo' : 'Travelers'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#c0d1c7] mb-2">Travel Pace</label>
            <div className="grid grid-cols-3 gap-3">
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
                  className={`p-3 rounded-xl border text-left transition-all ${
                    travelStyle === style.id
                      ? 'bg-[#2e5d4b] border-[#52b788] text-white'
                      : 'bg-[#182620] border-[#2b4437] text-[#c0d1c7] hover:bg-[#20342b]'
                  }`}
                >
                  <div className="text-xs font-semibold">{style.label}</div>
                  <div className="text-[10px] text-[#9ab3a5] mt-1">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Budget & Currency */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-[#f4efe6] mb-1">Target Budget & Currency</h3>
            <p className="text-xs text-[#8ca395]">TripUp AI manages expense ceilings, category allotments, and alerts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#c0d1c7] mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#52b788]" /> Total Estimated Budget
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#8ca395]">
                  {CURRENCIES.find(c => c.code === currency)?.symbol || '$'}
                </span>
                <input
                  type="number"
                  min="100"
                  step="50"
                  value={budgetAmount}
                  onChange={e => setBudgetAmount(Number(e.target.value))}
                  className="w-full bg-[#182620] border border-[#2b4437] rounded-xl pl-9 pr-4 py-3 text-sm text-[#f4efe6] focus:outline-none focus:border-[#52b788]"
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
                {CURRENCIES.map(c => (
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
              Preset Budget Scales:
            </span>
            <div className="grid grid-cols-3 gap-3">
              {[
                { amount: 1500, label: 'Value / Backpacker', desc: 'Hostels, public transit, street food' },
                { amount: 3000, label: 'Comfort / Boutique', desc: 'Design hotels, curated dinners, express rail' },
                { amount: 6500, label: 'Luxury / Signature', desc: '5-star suites, private guides, fine dining' },
              ].map(tier => (
                <button
                  key={tier.amount}
                  type="button"
                  onClick={() => setBudgetAmount(tier.amount)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    budgetAmount === tier.amount
                      ? 'bg-[#2e5d4b] border-[#52b788] text-white'
                      : 'bg-[#182620] border-[#2b4437] text-[#c0d1c7] hover:bg-[#20342b]'
                  }`}
                >
                  <div className="text-xs font-bold">{tier.label}</div>
                  <div className="text-xs font-serif text-[#ffd166] mt-0.5">${tier.amount}</div>
                  <div className="text-[10px] text-[#9ab3a5] mt-1">{tier.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Interests */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-[#f4efe6] mb-1">What are your passions & interests?</h3>
            <p className="text-xs text-[#8ca395]">Select the experiences you wish to emphasize in your AI itinerary.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATEGORIES.map(cat => {
              const isSelected = selectedInterests.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleInterestToggle(cat.id)}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    isSelected
                      ? 'bg-[#224434] border-[#52b788] text-white shadow-sm'
                      : 'bg-[#182620] border-[#2b4437] text-[#c0d1c7] hover:bg-[#20342b]'
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>{cat.label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#52b788]" />}
                    </div>
                    <div className="text-[11px] text-[#96aea1] mt-0.5">{cat.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 5: Transport & Accommodation */}
      {step === 5 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-[#f4efe6] mb-1">Transport & Accommodation Style</h3>
            <p className="text-xs text-[#8ca395]">Set your mobility preferences and stay category.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#c0d1c7] mb-2 flex items-center gap-1.5">
              <Train className="w-3.5 h-3.5 text-[#52b788]" /> Transport Preferences
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'walking', label: 'Walking & Strolling' },
                { id: 'public_transport', label: 'Metro & City Bus' },
                { id: 'train', label: 'High-Speed Trains' },
                { id: 'driving', label: 'Rental Car / Taxi' },
              ].map(t => {
                const isChecked = transportPrefs.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTransportToggle(t.id)}
                    className={`p-3 rounded-xl border text-xs font-medium transition-all ${
                      isChecked
                        ? 'bg-[#2e5d4b] border-[#52b788] text-white'
                        : 'bg-[#182620] border-[#2b4437] text-[#c0d1c7] hover:bg-[#20342b]'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#c0d1c7] mb-2">Preferred Stay Category</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { title: 'Boutique Hotel / Machiya', desc: 'Character-rich, authentic localized hospitality' },
                { title: 'Eco-Resort & Spa', desc: 'Holistic wellness, nature immersion, tranquil pools' },
                { title: 'Central City Apartment', desc: 'Private kitchen, washer, independent freedom' },
              ].map(stay => (
                <button
                  key={stay.title}
                  type="button"
                  onClick={() => setAccommodationPref(stay.title)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    accommodationPref === stay.title
                      ? 'bg-[#2e5d4b] border-[#52b788] text-white'
                      : 'bg-[#182620] border-[#2b4437] text-[#c0d1c7] hover:bg-[#20342b]'
                  }`}
                >
                  <div className="text-xs font-bold">{stay.title}</div>
                  <div className="text-[10px] text-[#9ab3a5] mt-1">{stay.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: Review & Final Submit */}
      {step === 6 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-[#f4efe6] mb-1">Review Your Travel Parameters</h3>
            <p className="text-xs text-[#8ca395]">Review your inputs before generating with Google Gemini AI.</p>
          </div>

          <div className="bg-[#182620] border border-[#2b4437] rounded-xl p-5 space-y-3.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#24372e]">
              <span className="text-[#8ca395]">Destination & Origin:</span>
              <span className="font-semibold text-[#f4efe6]">{destination} (from {origin})</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#24372e]">
              <span className="text-[#8ca395]">Travel Dates:</span>
              <span className="font-semibold text-[#f4efe6]">{startDate} to {endDate}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#24372e]">
              <span className="text-[#8ca395]">Travelers & Pace:</span>
              <span className="font-semibold text-[#f4efe6]">{travelers} traveler(s) · {travelStyle}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#24372e]">
              <span className="text-[#8ca395]">Budget:</span>
              <span className="font-semibold text-[#52b788]">{currency} {budgetAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#24372e]">
              <span className="text-[#8ca395]">Primary Interests:</span>
              <span className="font-semibold text-[#f4efe6]">{selectedInterests.join(', ')}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#8ca395]">Stay & Transit:</span>
              <span className="font-semibold text-[#f4efe6]">{accommodationPref} · {transportPrefs.join(', ')}</span>
            </div>
          </div>

          {isGenerating ? (
            <div className="p-8 bg-[#15231c] border border-[#52b788]/40 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#52b788] animate-spin" />
              <div className="text-sm font-semibold text-[#f4efe6]">{generationStepText}</div>
              <p className="text-xs text-[#8ca395] max-w-md">
                Analyzing verified coordinates, matching opening hours, calculating route transit, and allocating estimated budget.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-[#1e3427] border border-[#52b788]/40 rounded-xl flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#52b788] shrink-0" />
              <p className="text-xs text-[#d8e8de]">
                Ready to architect your personalized itinerary. Activities will be placed chronologically without time overlaps.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Navigation Footer */}
      <div className="mt-8 pt-5 border-t border-[#23352b] flex items-center justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#2b4437] text-xs font-medium text-[#c0d1c7] hover:bg-[#1a2b22] transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        ) : (
          <div />
        )}

        {step < 6 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2e5d4b] hover:bg-[#3a735e] text-xs font-semibold text-white shadow-lg transition-all"
          >
            Continue <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-7 py-3 rounded-xl bg-[#52b788] hover:bg-[#40916c] text-xs font-bold text-[#0c120f] shadow-lg transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Architect AI Itinerary
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
