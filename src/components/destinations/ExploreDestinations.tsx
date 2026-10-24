import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { Destination, TravelCategory, Continent } from '../../types/travel';
import { GroundingPanel } from '../grounding/GroundingPanel';
import {
  Search,
  MapPin,
  Heart,
  Calendar,
  Sparkles,
  DollarSign,
  Compass,
  ArrowRight,
  Eye,
  X,
  Globe,
  Shuffle,
  Thermometer,
  Send
} from 'lucide-react';

interface ExploreDestinationsProps {
  onPlanTripTo: (destName: string) => void;
}

const CONTINENTS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Continents' },
  { id: 'Asia', label: 'Asia' },
  { id: 'Europe', label: 'Europe' },
  { id: 'North America', label: 'North America' },
  { id: 'South America', label: 'South America' },
  { id: 'Africa', label: 'Africa' },
  { id: 'Oceania', label: 'Oceania & Pacific' },
  { id: 'Middle East', label: 'Middle East' },
];

export const ExploreDestinations: React.FC<ExploreDestinationsProps> = ({ onPlanTripTo }) => {
  const { destinations, savedDestinationIds, toggleFavoriteDestination } = useTravel();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [inspectingDest, setInspectingDest] = useState<Destination | null>(null);
  const [customDestinationInput, setCustomDestinationInput] = useState('');

  const filteredDestinations = destinations.filter(d => {
    const matchesSearch =
      !searchQuery ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.continent && d.continent.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.highlights.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesContinent =
      selectedContinent === 'all' || d.continent === selectedContinent;

    const matchesCategory =
      selectedCategory === 'all' || d.categories.includes(selectedCategory as TravelCategory);

    return matchesSearch && matchesContinent && matchesCategory;
  });

  const handleRandomPick = () => {
    if (destinations.length > 0) {
      const randomIndex = Math.floor(Math.random() * destinations.length);
      setInspectingDest(destinations[randomIndex]);
    }
  };

  const handleCustomPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customDestinationInput.trim()) {
      onPlanTripTo(customDestinationInput.trim());
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-[#f4efe6]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#14231b] via-[#101c16] to-[#0c1410] border border-[#2b4437] p-6 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#52b788]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#182a20] border border-[#2e503f] text-xs font-semibold text-[#52b788]">
              <Globe className="w-3.5 h-3.5 text-[#52b788]" />
              <span>Global Travel Coverage · Worldwide Explorer</span>
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
              Travel All Over the World
            </h1>
            <p className="text-xs md:text-sm text-[#9ab0a3] leading-relaxed">
              Explore hand-curated destinations across Asia, Europe, the Americas, Africa, Oceania, and the Middle East — or enter any city or country on Earth to generate a custom verified AI itinerary.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleRandomPick}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#182620] hover:bg-[#20342b] border border-[#2b4437] text-[#c0d1c7] hover:text-white text-xs font-semibold shadow transition-all"
            >
              <Shuffle className="w-4 h-4 text-[#52b788]" />
              <span>Surprise Me / Random Pick</span>
            </button>

            <button
              onClick={() => onPlanTripTo('Kyoto, Japan')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#52b788] hover:bg-[#40916c] text-[#0c1410] text-xs font-bold shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Plan Custom Trip</span>
            </button>
          </div>
        </div>

        {/* Global Stats Pill Bar */}
        <div className="mt-8 pt-6 border-t border-[#1e3427] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] text-[#789686] uppercase tracking-wider block font-semibold">Destinations</span>
            <span className="text-base font-bold text-white font-serif">{destinations.length}+ Iconic Spots</span>
          </div>
          <div>
            <span className="text-[10px] text-[#789686] uppercase tracking-wider block font-semibold">Continents</span>
            <span className="text-base font-bold text-[#52b788] font-serif">7 World Regions</span>
          </div>
          <div>
            <span className="text-[10px] text-[#789686] uppercase tracking-wider block font-semibold">Coverage</span>
            <span className="text-base font-bold text-[#ffd166] font-serif">Anywhere on Earth</span>
          </div>
          <div>
            <span className="text-[10px] text-[#789686] uppercase tracking-wider block font-semibold">Live Intelligence</span>
            <span className="text-base font-bold text-white font-serif">Google Maps & Search</span>
          </div>
        </div>
      </div>

      {/* CONTINENT TABS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8da598] flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#52b788]" /> Filter by Continent
          </span>
          <span className="text-xs text-[#718b7c]">
            Showing {filteredDestinations.length} destinations
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
          {CONTINENTS.map(cont => {
            const count =
              cont.id === 'all'
                ? destinations.length
                : destinations.filter(d => d.continent === cont.id).length;

            return (
              <button
                key={cont.id}
                onClick={() => setSelectedContinent(cont.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
                  selectedContinent === cont.id
                    ? 'bg-[#2e5d4b] border-[#52b788] text-white shadow-md'
                    : 'bg-[#14201a] border-[#263b2f] text-[#8ea598] hover:text-white hover:bg-[#1b2c23]'
                }`}
              >
                <span>{cont.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedContinent === cont.id
                      ? 'bg-[#1a382c] text-[#52b788]'
                      : 'bg-[#1f3128] text-[#718b7c]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#799486]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search worldwide by city, country or attraction..."
            className="w-full bg-[#14201a] border border-[#2b4437] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#687f73] focus:outline-none focus:border-[#52b788]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-thin">
          {[
            { id: 'all', label: 'All Vibe Styles' },
            { id: 'culture', label: 'Culture & Arts' },
            { id: 'nature', label: 'Nature & Scenery' },
            { id: 'heritage', label: 'Heritage & Wonders' },
            { id: 'food', label: 'Gastronomy' },
            { id: 'adventure', label: 'Adventure' },
            { id: 'relaxation', label: 'Wellness & Coast' },
            { id: 'architecture', label: 'Architecture' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-[#2e5d4b] border-[#52b788] text-white'
                  : 'bg-[#14201a] border-[#263b2f] text-[#8ea598] hover:text-white hover:bg-[#1a2c22]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Destination Grid */}
      {filteredDestinations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map(dest => {
            const isFav = savedDestinationIds.includes(dest.id);
            return (
              <div
                key={dest.id}
                className="group bg-[#121c17] border border-[#263b2f] hover:border-[#52b788]/60 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col justify-between"
              >
                {/* Image & Badges */}
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121c17] via-transparent to-black/30" />

                  {/* Top tags */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {dest.continent && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#0e1713]/85 text-[#52b788] border border-[#2b4437]">
                        {dest.continent}
                      </span>
                    )}
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#0e1713]/85 text-[#c0d1c7] border border-[#2b4437] flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-[#ffd166]" />
                      {dest.weatherOverview.temperatureC}°C
                    </span>
                  </div>

                  {/* Favorite Heart */}
                  <button
                    onClick={() => toggleFavoriteDestination(dest.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-[#121c17]/80 hover:bg-[#121c17] border border-[#2b4437] text-white transition-transform active:scale-95"
                    title={isFav ? 'Remove favorite' : 'Save favorite'}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${isFav ? 'fill-[#e63946] text-[#e63946]' : 'text-white'}`}
                    />
                  </button>

                  {/* Title & Region */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#a4bdad]">
                      {dest.region}
                    </span>
                    <h3 className="text-xl font-serif font-bold text-white tracking-tight">
                      {dest.name}, {dest.country}
                    </h3>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <p className="text-xs text-[#9eb2a7] leading-relaxed line-clamp-3">
                      {dest.description}
                    </p>

                    {/* Highlights */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-[#738e80] font-semibold block">
                        Curated Highlights:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {dest.highlights.slice(0, 3).map(h => (
                          <span
                            key={h}
                            className="px-2 py-0.5 rounded text-[10px] bg-[#182620] border border-[#263b2f] text-[#c0d1c7]"
                          >
                            {h}
                          </span>
                        ))}
                        {dest.highlights.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#14201a] text-[#718b7c]">
                            +{dest.highlights.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Metrics */}
                  <div className="pt-4 border-t border-[#1f3128] space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-[#718b7c] uppercase block font-semibold">
                          Est. Daily Budget
                        </span>
                        <span className="font-bold text-[#ffd166] flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-[#52b788]" />
                          {dest.currency} {dest.avgDailyBudget}/day
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#718b7c] uppercase block font-semibold">
                          Best Season
                        </span>
                        <span className="text-[#a4b8ad] flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#52b788]" />
                          {dest.bestTimeToVisit.split('(')[0]}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => setInspectingDest(dest)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[#2b4437] hover:bg-[#1a2c22] text-xs font-semibold text-[#c0d1c7] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#52b788]" />
                        <span>Details & Grounding</span>
                      </button>
                      <button
                        onClick={() => onPlanTripTo(`${dest.name}, ${dest.country}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#2e5d4b] hover:bg-[#3b755f] text-white text-xs font-bold shadow transition-all"
                      >
                        <span>Plan Trip</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[#121c17] border border-[#263b2f] space-y-4">
          <Compass className="w-12 h-12 text-[#52b788] mx-auto opacity-70" />
          <h3 className="text-lg font-serif font-bold text-white">No curated match for "{searchQuery}"</h3>
          <p className="text-xs text-[#8ca395] max-w-md mx-auto">
            You can still travel anywhere in the world! Gemini AI will generate a complete verified itinerary for any city, village, or island you enter.
          </p>
          <button
            onClick={() => onPlanTripTo(searchQuery || 'Worldwide')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#52b788] text-[#0c1410] font-bold text-xs shadow"
          >
            <Sparkles className="w-4 h-4" />
            <span>Plan AI Itinerary to "{searchQuery || 'Any Destination'}"</span>
          </button>
        </div>
      )}

      {/* CUSTOM WORLDWIDE DESTINATION INPUT SECTION */}
      <div className="rounded-2xl bg-gradient-to-r from-[#13221b] to-[#101b15] border border-[#2b4437] p-6 md:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#52b788] uppercase tracking-wider">
              <Globe className="w-4 h-4" />
              <span>Travel Anywhere on Earth</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-white">
              Planning to go somewhere else? We support every location worldwide.
            </h3>
            <p className="text-xs text-[#95ab9e]">
              From remote Scottish islands and Patagonian trails to bustling markets in Mumbai or Marrakesh — just name it.
            </p>
          </div>

          <form onSubmit={handleCustomPlanSubmit} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              value={customDestinationInput}
              onChange={e => setCustomDestinationInput(e.target.value)}
              placeholder="e.g. Reykjavik, Iceland or Oaxaca, Mexico"
              className="bg-[#182620] border border-[#2b4437] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#687f73] focus:outline-none focus:border-[#52b788] w-full md:w-80"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#52b788] hover:bg-[#40916c] text-[#0c1410] font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Plan</span>
            </button>
          </form>
        </div>
      </div>

      {/* MODAL: DESTINATION DETAILS & LIVE GROUNDING */}
      {inspectingDest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#121c17] border border-[#2b4437] rounded-2xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                  <span>{inspectingDest.name}, {inspectingDest.country}</span>
                  {inspectingDest.continent && (
                    <span className="text-xs font-sans px-2 py-0.5 rounded bg-[#1e3427] text-[#52b788]">
                      {inspectingDest.continent}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-[#8aa395]">{inspectingDest.region} · {inspectingDest.bestTimeToVisit}</p>
              </div>
              <button
                onClick={() => setInspectingDest(null)}
                className="p-1.5 rounded-lg border border-[#2b4437] hover:bg-[#1a2b22] text-[#9fb3a7]"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photographic Hero */}
            <div className="relative h-60 rounded-xl overflow-hidden border border-[#263b2f]">
              <img
                src={inspectingDest.imageUrl}
                alt={inspectingDest.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121c17] via-transparent to-black/20" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                <span className="px-2.5 py-1 rounded-md bg-[#121c17]/90 text-white font-medium border border-[#2b4437]">
                  Est. Daily: {inspectingDest.currency} {inspectingDest.avgDailyBudget}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#121c17]/90 text-[#52b788] font-medium border border-[#2b4437]">
                  Coordinates: {inspectingDest.latitude.toFixed(2)}°, {inspectingDest.longitude.toFixed(2)}°
                </span>
              </div>
            </div>

            {/* Google Live Grounding Intelligence */}
            <div className="pt-2">
              <GroundingPanel
                destination={`${inspectingDest.name}, ${inspectingDest.country}`}
                latitude={inspectingDest.latitude}
                longitude={inspectingDest.longitude}
              />
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#c0d1c7] leading-relaxed">{inspectingDest.longDescription}</p>
              <div className="p-3 bg-[#17251f] rounded-xl border border-[#24392e] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase text-[#738f80] block font-semibold">Key Highlights:</span>
                  <span className="text-[#d8e8de]">{inspectingDest.highlights.join(' · ')}</span>
                </div>
                <button
                  onClick={() => {
                    const destName = `${inspectingDest.name}, ${inspectingDest.country}`;
                    setInspectingDest(null);
                    onPlanTripTo(destName);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#52b788] hover:bg-[#40916c] text-[#0c120f] font-bold text-xs shrink-0 self-start sm:self-auto shadow"
                >
                  Create Trip to {inspectingDest.name}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
