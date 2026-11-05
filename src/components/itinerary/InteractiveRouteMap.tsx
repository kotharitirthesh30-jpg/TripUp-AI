import React, { useState } from 'react';
import { Trip, Activity } from '../../types/travel';
import {
  cleanMapsLocation,
  buildGoogleMapsDirectionsUrl,
  calculateRouteLegs,
  RouteLeg,
} from '../../lib/trip-logic';
import {
  MapPin,
  Navigation,
  Car,
  Footprints,
  Train,
  ExternalLink,
  Clock,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface InteractiveRouteMapProps {
  trip: Trip;
}

export const InteractiveRouteMap: React.FC<InteractiveRouteMapProps> = ({ trip }) => {
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [travelMode, setTravelMode] = useState<'driving' | 'transit' | 'walking'>('driving');
  const [activeStopIndex, setActiveStopIndex] = useState<number>(0);

  const selectedDay =
    trip.itinerary.find(d => d.dayNumber === selectedDayNumber) || trip.itinerary[0];

  const activities: Activity[] = selectedDay?.activities || [];

  const legs: RouteLeg[] = calculateRouteLegs(activities, trip.destination, travelMode);

  // Focus query for the embedded map
  const activeActivity = activities[activeStopIndex] || activities[0];
  const focusedQuery = activeActivity
    ? cleanMapsLocation(activeActivity.title, activeActivity.address, trip.destination)
    : trip.destination;

  // Complete day multi-stop URL for Google Maps
  const fullDayDirectionsUrl = buildGoogleMapsDirectionsUrl(
    activities,
    trip.destination,
    travelMode
  );

  return (
    <div className="space-y-6">
      {/* Top Controls: Day Selector & Travel Mode */}
      <div className="p-5 bg-[#14201a] border border-[#2b4437] rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#52b788]" />
            <span>Interactive Route & Google Maps Navigation</span>
          </h3>
          <p className="text-xs text-[#8ca395]">
            Verified coordinates, ordered daily legs, and turn-by-turn Google Maps routing for{' '}
            <strong className="text-white">{trip.destination}</strong>.
          </p>
        </div>

        {/* Travel Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-[#0e1612] p-1 rounded-xl border border-[#23352b]">
          {(
            [
              { id: 'driving', label: 'Drive', icon: Car },
              { id: 'transit', label: 'Transit', icon: Train },
              { id: 'walking', label: 'Walk', icon: Footprints },
            ] as const
          ).map(mode => {
            const Icon = mode.icon;
            const isSelected = travelMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setTravelMode(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#2e5d4b] text-white shadow-sm'
                    : 'text-[#8ca395] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Days Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {trip.itinerary.map(day => (
          <button
            key={day.id}
            onClick={() => {
              setSelectedDayNumber(day.dayNumber);
              setActiveStopIndex(0);
            }}
            className={`px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
              selectedDayNumber === day.dayNumber
                ? 'bg-[#1e3427] text-white border-[#52b788] shadow-md ring-1 ring-[#52b788]/40'
                : 'bg-[#121c17] text-[#93ab9e] border-[#22352a] hover:bg-[#16241c] hover:text-white'
            }`}
          >
            Day {day.dayNumber} ({day.activities.length} stops)
          </button>
        ))}
      </div>

      {/* Main Map & Waypoints Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Embedded Google Map & Launch Button (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#121c17] border border-[#2b4437] rounded-2xl overflow-hidden shadow-xl flex flex-col">
            {/* Embedded Google Map Frame */}
            <div className="relative w-full h-[360px] md:h-[440px] bg-[#0c120f]">
              <iframe
                title="Google Maps Route Viewer"
                width="100%"
                height="100%"
                className="border-0 w-full h-full filter saturate-[0.85] contrast-[1.05]"
                loading="lazy"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  focusedQuery
                )}&t=m&z=13&output=embed`}
              />
              {/* Overlay Badge */}
              <div className="absolute top-3 left-3 bg-[#0c120f]/90 border border-[#2b4437] backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md text-xs text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#52b788]" />
                <span className="font-semibold truncate max-w-[240px]">
                  {activeActivity?.title || trip.destination}
                </span>
              </div>
            </div>

            {/* Map Action Bar */}
            <div className="p-4 bg-[#14201a] border-t border-[#23352b] flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#8ca395]">
                Viewing Day {selectedDayNumber} Route: {activities.length} Waypoints
              </div>

              <a
                href={fullDayDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#52b788] hover:bg-[#40916c] text-[#0c120f] font-bold text-xs shadow-md transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>Open Full Day Route in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Ordered Waypoint Stops & Leg Estimates (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7ea08f]">
              Ordered Stops · Day {selectedDayNumber}
            </h4>
            <span className="text-[11px] text-[#52b788] font-mono">
              Mode: {travelMode.toUpperCase()}
            </span>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {activities.map((act, idx) => {
              const isFocused = idx === activeStopIndex;
              const cleanAddress = cleanMapsLocation(act.title, act.address, trip.destination);
              const leg = legs[idx]; // leg from this stop to the next stop

              return (
                <div key={act.id} className="space-y-2">
                  {/* Activity Stop Card */}
                  <div
                    onClick={() => setActiveStopIndex(idx)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isFocused
                        ? 'bg-[#1b2e23] border-[#52b788] shadow-md ring-1 ring-[#52b788]/50'
                        : 'bg-[#14201a] border-[#25392e] hover:bg-[#182620]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isFocused
                            ? 'bg-[#52b788] text-[#0c120f]'
                            : 'bg-[#23382c] text-[#93bba2]'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="font-bold text-white text-xs truncate">{act.title}</h5>
                          <span className="text-[10px] text-[#799486] shrink-0 font-mono">
                            {act.startTime}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8ea89b] line-clamp-2 mt-0.5">
                          {cleanAddress}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#1f3327]">
                          <span className="text-[10px] capitalize px-2 py-0.5 rounded bg-[#1c2c23] text-[#7da791]">
                            {act.category}
                          </span>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              cleanAddress
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="text-[11px] text-[#52b788] hover:underline flex items-center gap-1 font-semibold"
                          >
                            <span>Google Maps Pin</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transit Leg Connector between consecutive activities */}
                  {leg && (
                    <div className="flex items-center gap-3 px-3 py-1.5 text-[11px] bg-[#0e1612] border border-[#1f3026] rounded-lg text-[#8aa395]">
                      <div className="flex items-center gap-1.5 text-[#52b788] font-semibold shrink-0">
                        <Car className="w-3.5 h-3.5" />
                        <span>~{leg.distanceKm} km</span>
                      </div>
                      <span className="text-[#415b4d]">·</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#799486]" />
                        <span>~{leg.estimatedDurationMinutes} mins</span>
                      </div>
                      <span className="text-[#415b4d]">·</span>
                      <a
                        href={leg.directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-[#52b788] hover:underline flex items-center gap-1 text-[10px] font-bold"
                      >
                        <span>Directions</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
