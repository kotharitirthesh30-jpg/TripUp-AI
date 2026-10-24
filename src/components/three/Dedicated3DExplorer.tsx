import React, { useState } from 'react';
import { Simple3DGlobe, GLOBE_DESTINATIONS, GlobeDestination } from './Simple3DGlobe';
import { useTravel } from '../../context/TravelContext';
import {
  Compass,
  ArrowLeft,
  Sparkles,
  MapPin,
  ArrowRight,
  Heart
} from 'lucide-react';

interface Dedicated3DExplorerProps {
  onBackToExplore: () => void;
  onPlanTripTo: (destName: string) => void;
}

export const Dedicated3DExplorer: React.FC<Dedicated3DExplorerProps> = ({
  onBackToExplore,
  onPlanTripTo,
}) => {
  const { savedDestinationIds, toggleFavoriteDestination } = useTravel();
  const [activeCity, setActiveCity] = useState<GlobeDestination>(GLOBE_DESTINATIONS[0]);

  return (
    <div className="relative w-full h-[85vh] rounded-3xl overflow-hidden border border-[#2b4437] shadow-2xl bg-[#0c120f] text-[#f4efe6]">
      {/* 3D Simple Globe */}
      <Simple3DGlobe
        heightClass="h-full"
        onSelectDestination={city => setActiveCity(city)}
        onPlanTrip={destName => onPlanTripTo(destName)}
      />

      {/* Top Left Navigation Bar */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-3">
        <button
          onClick={onBackToExplore}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#14201a]/95 hover:bg-[#1e3027] border border-[#2b4437] text-xs font-semibold text-[#e2ded5] shadow-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Directory</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#14201a]/90 border border-[#2b4437] text-xs font-medium text-[#b7e4c7]">
          <Sparkles className="w-3.5 h-3.5 text-[#52b788]" />
          <span>Interactive Navigable Travel Globe</span>
        </div>
      </div>
    </div>
  );
};
