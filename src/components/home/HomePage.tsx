import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { convertCurrency, formatCurrency } from '../../lib/trip-logic';
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  Compass,
  CheckCircle2,
  DollarSign,
  CloudSun,
  Globe,
  Heart,
  TrendingUp,
  ShieldCheck,
  Clock
} from 'lucide-react';

interface HomePageProps {
  onStartPlanningWith: (data: { destination: string; startDate: string; endDate: string; travelers: number }) => void;
  onNavigateTo: (view: string) => void;
}

interface QuickCity {
  id: string;
  name: string;
  country: string;
  continent: string;
  badge: string;
  baseDailyUSD: number;
  weather: string;
  image: string;
  desc: string;
}

const FEATURED_CITIES: QuickCity[] = [
  {
    id: 'kyoto',
    name: 'Kyoto',
    country: 'Japan',
    continent: 'Asia',
    badge: '🌸 Zen Temples',
    baseDailyUSD: 140,
    weather: '19°C · Crisp',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800',
    desc: 'Ancient imperial shrines, bamboo groves, and traditional tea ceremonies.',
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    continent: 'Europe',
    badge: '🗼 Art & Cafes',
    baseDailyUSD: 220,
    weather: '17°C · Mild',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800',
    desc: 'The City of Light, world-class museums, Seine river cruises, and bistros.',
  },
  {
    id: 'rome',
    name: 'Rome',
    country: 'Italy',
    continent: 'Europe',
    badge: '🏛️ Colosseum',
    baseDailyUSD: 195,
    weather: '22°C · Sunny',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800',
    desc: 'Gladiatorial ruins, Vatican treasures, vibrant piazzas, and authentic pasta.',
  },
  {
    id: 'swiss',
    name: 'Swiss Alps',
    country: 'Switzerland',
    continent: 'Europe',
    badge: '🏔️ Matterhorn Peak',
    baseDailyUSD: 290,
    weather: '11°C · Sunny',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=800',
    desc: 'Car-free alpine villages, crystalline glacier lakes, and scenic cogwheel trains.',
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    continent: 'Asia',
    badge: '⚡ Neon & Sushi',
    baseDailyUSD: 175,
    weather: '20°C · Clear',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800',
    desc: 'Futuristic hyper-city where neon skyscrapers meet tranquil Shinto shrines.',
  },
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    continent: 'Asia',
    badge: '🏝️ Tropical Retreat',
    baseDailyUSD: 75,
    weather: '28°C · Tropical',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800',
    desc: 'Emerald terraced rice paddies, cliffside sea temples, and holistic spas.',
  },
  {
    id: 'newyork',
    name: 'New York',
    country: 'United States',
    continent: 'Americas',
    badge: '🗽 Broadway & Met',
    baseDailyUSD: 240,
    weather: '16°C · Clear',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800',
    desc: 'Central Park walks, world-class theaters, and boundless culinary energy.',
  },
  {
    id: 'machupicchu',
    name: 'Machu Picchu',
    country: 'Peru',
    continent: 'Americas',
    badge: '🦙 Inca Citadel',
    baseDailyUSD: 90,
    weather: '17°C · Crisp',
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=800',
    desc: 'Inca cloud-forest sanctuary perched among dramatic Andean mountain summits.',
  },
  {
    id: 'cairo',
    name: 'Cairo & Giza',
    country: 'Egypt',
    continent: 'Africa',
    badge: '🏺 Great Pyramids',
    baseDailyUSD: 95,
    weather: '26°C · Desert Sun',
    image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?q=80&w=800',
    desc: 'The Great Pyramids, enigmatic Sphinx, and bustling historic bazaars.',
  },
  {
    id: 'serengeti',
    name: 'Serengeti',
    country: 'Tanzania',
    continent: 'Africa',
    badge: '🦁 Big 5 Safari',
    baseDailyUSD: 240,
    weather: '27°C · Golden Sun',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800',
    desc: 'The Great Wildebeest Migration across golden savannahs and Ngorongoro Crater.',
  },
  {
    id: 'sydney',
    name: 'Sydney',
    country: 'Australia',
    continent: 'Oceania',
    badge: '🦘 Opera House',
    baseDailyUSD: 170,
    weather: '23°C · Harbour Sun',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=800',
    desc: 'Iconic harbour sails, Bondi surf waves, and Blue Mountains eucalyptus trails.',
  },
  {
    id: 'queenstown',
    name: 'Queenstown',
    country: 'New Zealand',
    continent: 'Oceania',
    badge: '🎿 Fiords & Peaks',
    baseDailyUSD: 180,
    weather: '17°C · Pure Air',
    image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?q=80&w=800',
    desc: 'Milford Sound glacier fiords, Lake Wakatipu steamers, and alpine thrills.',
  },
  {
    id: 'dubai',
    name: 'Dubai',
    country: 'UAE',
    continent: 'Middle East',
    badge: '🏙️ Burj Khalifa',
    baseDailyUSD: 210,
    weather: '27°C · Desert Sky',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800',
    desc: 'Futuristic Burj Khalifa skyscraper, desert sand dune safaris, and luxury.',
  },
  {
    id: 'petra',
    name: 'Petra',
    country: 'Jordan',
    continent: 'Middle East',
    badge: '🏜️ Rose City',
    baseDailyUSD: 125,
    weather: '23°C · Clear Sky',
    image: 'https://images.unsplash.com/photo-1579606032834-d40770075591?q=80&w=800',
    desc: 'Rose-red sandstone Treasury carved into canyons and Wadi Rum desert.',
  },
];

export const HomePage: React.FC<HomePageProps> = ({ onStartPlanningWith, onNavigateTo }) => {
  const { destinations, savedDestinationIds, toggleFavoriteDestination, currentCurrency } = useTravel();

  // Quick Trip Search Form State
  const [quickDest, setQuickDest] = useState('Kyoto, Japan');
  const [quickStart, setQuickStart] = useState('2026-11-10');
  const [quickEnd, setQuickEnd] = useState('2026-11-15');
  const [quickTravelers, setQuickTravelers] = useState(2);
  const [selectedHomeContinent, setSelectedHomeContinent] = useState<string>('all');

  const filteredFeaturedCities = FEATURED_CITIES.filter(city => {
    if (selectedHomeContinent === 'all') return true;
    return city.continent === selectedHomeContinent;
  });

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartPlanningWith({
      destination: quickDest,
      startDate: quickStart,
      endDate: quickEnd,
      travelers: Number(quickTravelers) || 2,
    });
  };

  const handleQuickCityClick = (city: QuickCity) => {
    setQuickDest(`${city.name}, ${city.country}`);
    onStartPlanningWith({
      destination: `${city.name}, ${city.country}`,
      startDate: quickStart,
      endDate: quickEnd,
      travelers: quickTravelers,
    });
  };

  return (
    <div className="space-y-16 text-[#f4efe6]">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 pb-6 space-y-8">
        {/* Hero Title & Copy */}
        <div className="text-center max-w-3xl mx-auto space-y-4 px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#182620] border border-[#2b4437] text-xs font-semibold text-[#52b788] shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#52b788]" />
            <span>Google Gemini AI · Intelligent Journey Planning</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-white tracking-tight leading-[1.15]">
            Your journey, <br className="hidden sm:inline" />
            <span className="text-[#52b788] italic font-serif">intelligently</span> planned.
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-[#9fb3a7] leading-relaxed max-w-2xl mx-auto">
            Design your perfect travel itinerary in seconds. Powered by Google Gemini AI, verified Google Maps & Search grounding, and intuitive budget tracking.
          </p>
        </div>

        {/* Compact Trip Search Form Bar */}
        <div className="max-w-4xl mx-auto px-4 relative z-30">
          <form
            onSubmit={handleQuickSubmit}
            className="p-4 sm:p-5 bg-[#14201a] border border-[#2b4437] rounded-2xl shadow-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs"
          >
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#7ea08f] mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#52b788]" /> Destination
              </label>
              <input
                type="text"
                required
                value={quickDest}
                onChange={e => setQuickDest(e.target.value)}
                placeholder="Where to? (e.g. Kyoto, Japan)"
                className="w-full bg-[#182620] border border-[#263b2f] rounded-lg px-3 py-2.5 text-white font-medium focus:outline-none focus:border-[#52b788]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-[#7ea08f] mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#52b788]" /> Start Date
              </label>
              <input
                type="date"
                required
                value={quickStart}
                onChange={e => setQuickStart(e.target.value)}
                className="w-full bg-[#182620] border border-[#263b2f] rounded-lg px-3 py-2.5 text-white font-medium focus:outline-none focus:border-[#52b788]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-[#7ea08f] mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#52b788]" /> End Date
              </label>
              <input
                type="date"
                required
                value={quickEnd}
                onChange={e => setQuickEnd(e.target.value)}
                className="w-full bg-[#182620] border border-[#263b2f] rounded-lg px-3 py-2.5 text-white font-medium focus:outline-none focus:border-[#52b788]"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full h-[42px] flex items-center justify-center gap-1.5 rounded-lg bg-[#52b788] hover:bg-[#40916c] text-[#0c120f] font-bold text-xs shadow-lg transition-all"
              >
                <span>Plan My Trip</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Quick Destination Cards Grid */}
        <div className="max-w-6xl mx-auto px-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold">
            <span className="text-[#8da598] flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#52b788]" />
              Popular Starting Points across Continents:
            </span>
            <div className="flex items-center gap-2">
              {/* Mini continent filter */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'Asia', label: 'Asia' },
                  { id: 'Europe', label: 'Europe' },
                  { id: 'Americas', label: 'Americas' },
                  { id: 'Africa', label: 'Africa' },
                  { id: 'Oceania', label: 'Oceania' },
                  { id: 'Middle East', label: 'Middle East' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedHomeContinent(tab.id)}
                    className={`px-2 py-0.5 rounded text-[11px] transition-all border ${
                      selectedHomeContinent === tab.id
                        ? 'bg-[#2e5d4b] border-[#52b788] text-white'
                        : 'bg-[#14201a] border-[#263b2f] text-[#8ea598] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => onNavigateTo('explore')}
                className="text-[#52b788] hover:underline flex items-center gap-1 shrink-0 ml-1"
              >
                <span>All ({destinations.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {filteredFeaturedCities.map(city => (
              <button
                key={city.id}
                onClick={() => handleQuickCityClick(city)}
                className="p-3 bg-[#14201a] hover:bg-[#1f3128] border border-[#263b2f] hover:border-[#52b788] rounded-xl text-left transition-all space-y-1.5 group relative overflow-hidden"
              >
                <div className="relative h-14 w-full rounded-lg overflow-hidden mb-1">
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute bottom-1 left-1.5 text-[10px] font-bold text-white drop-shadow">
                    {city.name}
                  </span>
                </div>
                <div className="text-[10px] text-[#52b788] font-semibold truncate">{city.badge}</div>
                <div className="text-[10px] text-[#8aa395] flex items-center justify-between">
                  <span>{formatCurrency(convertCurrency(city.baseDailyUSD, 'USD', currentCurrency), currentCurrency)}/day</span>
                  <ArrowRight className="w-3 h-3 text-[#52b788] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. FEATURED DESTINATIONS SHOWCASE */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#23352b] pb-4">
          <div>
            <div className="text-xs font-semibold text-[#52b788] uppercase tracking-wider">
              Iconic Global Getaways
            </div>
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
              Curated Travel Highlights Around the World
            </h2>
          </div>
          <button
            onClick={() => onNavigateTo('explore')}
            className="text-xs font-semibold text-[#52b788] hover:underline flex items-center gap-1"
          >
            <span>View All Destinations ({destinations.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {destinations.slice(0, 6).map(dest => {
            const isFav = savedDestinationIds.includes(dest.id);
            return (
              <div
                key={dest.id}
                className="group bg-[#121c17] border border-[#263b2f] hover:border-[#52b788]/60 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={dest.imageUrl}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121c17] via-transparent to-black/30" />
                    <button
                      onClick={() => toggleFavoriteDestination(dest.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-[#121c17]/80 hover:bg-[#121c17] border border-[#2b4437] text-white"
                      title={isFav ? 'Remove favorite' : 'Save favorite'}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${isFav ? 'fill-[#e63946] text-[#e63946]' : 'text-white'}`}
                      />
                    </button>
                    <div className="absolute bottom-3 left-3 text-xs font-semibold text-white">
                      {dest.name}, {dest.country}
                    </div>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <p className="text-xs text-[#9eb2a7] leading-relaxed line-clamp-2">
                      {dest.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {dest.categories.map(cat => (
                        <span
                          key={cat}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#182620] text-[#789686] border border-[#263b2f] capitalize"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-[#1f3128] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#718b7c] uppercase block font-semibold">
                        Estimated Budget
                      </span>
                      <span className="text-xs font-bold text-[#ffd166]">
                        {formatCurrency(convertCurrency(dest.avgDailyBudget, (dest.currency as any) || 'USD', currentCurrency), currentCurrency)}/day
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        onStartPlanningWith({
                          destination: `${dest.name}, ${dest.country}`,
                          startDate: quickStart,
                          endDate: quickEnd,
                          travelers: quickTravelers,
                        })
                      }
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2e5d4b] hover:bg-[#40916c] text-white text-xs font-bold shadow transition-all"
                    >
                      <span>Plan Trip</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. VALUE PROPOSITION & HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="p-8 md:p-10 rounded-2xl bg-[#14201a] border border-[#2b4437] space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold text-[#52b788] uppercase tracking-wider">
              The TripUp Workflow
            </span>
            <h3 className="text-2xl font-serif font-bold text-white tracking-tight">
              From Dream to Day-by-Day Itinerary
            </h3>
            <p className="text-xs text-[#93a89c]">
              TripUp AI solves travel planning fatigue with deterministic scheduling, intelligent transit buffers, and live Google Maps place verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-5 bg-[#182620] border border-[#263b2f] rounded-xl space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#2e5d4b] text-[#52b788] flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="text-sm font-bold text-white">Define Your Vision & Budget</h4>
              <p className="text-[#98ada0] leading-relaxed">
                Choose dates, companion count, travel pace (Relaxed vs Packed), and target budget. Tailor interests across gastronomy, history, nature, or photography.
              </p>
            </div>

            <div className="p-5 bg-[#182620] border border-[#263b2f] rounded-xl space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#2e5d4b] text-[#52b788] flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="text-sm font-bold text-white">Gemini AI Synthesis</h4>
              <p className="text-[#98ada0] leading-relaxed">
                Our model assembles daily chronologies with non-overlapping time slots, opening hour verification, geographic proximity grouping, and reserve buffers.
              </p>
            </div>

            <div className="p-5 bg-[#182620] border border-[#263b2f] rounded-xl space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#2e5d4b] text-[#52b788] flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="text-sm font-bold text-white">Live Grounding & Customization</h4>
              <p className="text-[#98ada0] leading-relaxed">
                Inspect verified Google Maps place links, live reviews, and real-time Search citations. Customize activities, add expenses, and share with travel companions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
