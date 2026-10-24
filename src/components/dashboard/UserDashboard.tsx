import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { Trip } from '../../types/travel';
import {
  Calendar,
  MapPin,
  Plus,
  Compass,
  Copy,
  Trash2,
  Archive,
  ArrowRight,
  Sparkles,
  Users,
  DollarSign,
  AlertTriangle,
  Heart
} from 'lucide-react';

interface UserDashboardProps {
  onOpenTrip: (tripId: string) => void;
  onCreateNewTrip: () => void;
  onExploreDestinations: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onOpenTrip,
  onCreateNewTrip,
  onExploreDestinations,
}) => {
  const { trips, userProfile, duplicateTrip, deleteTrip, updateTrip, destinations, savedDestinationIds } = useTravel();

  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'draft' | 'archived'>('all');
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);

  const filteredTrips = trips.filter(t => {
    if (activeTab === 'upcoming') return t.status === 'upcoming';
    if (activeTab === 'draft') return t.status === 'draft';
    if (activeTab === 'archived') return t.status === 'archived';
    return true;
  });

  const totalBudgetManaged = trips.reduce((sum, t) => sum + (t.budgetAmount || 0), 0);
  const totalStopsCount = trips.reduce(
    (sum, t) => sum + t.itinerary.reduce((dSum, d) => dSum + d.activities.length, 0),
    0
  );

  const savedDests = destinations.filter(d => savedDestinationIds.includes(d.id));

  const handleConfirmDelete = () => {
    if (tripToDelete) {
      deleteTrip(tripToDelete.id);
      setTripToDelete(null);
    }
  };

  const handleArchiveToggle = (trip: Trip) => {
    const newStatus = trip.status === 'archived' ? 'upcoming' : 'archived';
    updateTrip(trip.id, { status: newStatus });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-[#f4efe6]">
      {/* Header Welcome Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:p-8 rounded-2xl bg-gradient-to-r from-[#14231b] to-[#0c1410] border border-[#2b4437] shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#52b788] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalized Travel Hub</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
            Welcome back, {userProfile.name}
          </h1>
          <p className="text-xs text-[#8da598]">
            {trips.length} active journey(s) architected · Preferred currency {userProfile.preferredCurrency}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExploreDestinations}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#2b4437] hover:bg-[#1a2c22] text-xs font-semibold text-[#c0d1c7] transition-colors"
          >
            <Compass className="w-4 h-4 text-[#52b788]" />
            <span>Explore Destinations</span>
          </button>
          <button
            onClick={onCreateNewTrip}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#52b788] hover:bg-[#40916c] text-[#0c120f] text-xs font-bold shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Trip</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#14201a] border border-[#263b2f] rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#799486]">Total Trips</span>
          <div className="text-2xl font-serif font-bold text-white">{trips.length}</div>
          <span className="text-[11px] text-[#52b788]">Saved in your cloud vault</span>
        </div>
        <div className="p-4 bg-[#14201a] border border-[#263b2f] rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#799486]">Budget Managed</span>
          <div className="text-2xl font-serif font-bold text-[#ffd166]">
            ${totalBudgetManaged.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#93a89c]">Total planned expenses</span>
        </div>
        <div className="p-4 bg-[#14201a] border border-[#263b2f] rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#799486]">Itinerary Stops</span>
          <div className="text-2xl font-serif font-bold text-white">{totalStopsCount}</div>
          <span className="text-[11px] text-[#52b788]">Verified activities planned</span>
        </div>
        <div className="p-4 bg-[#14201a] border border-[#263b2f] rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#799486]">Saved Favorites</span>
          <div className="text-2xl font-serif font-bold text-white">{savedDestinationIds.length}</div>
          <span className="text-[11px] text-[#93a89c]">Dream destinations bookmarked</span>
        </div>
      </div>

      {/* Trips Section Header & Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#23352b] pb-3">
          <h2 className="text-lg font-serif font-bold text-white">Your Planned Journeys</h2>
          <div className="flex items-center gap-1 bg-[#121c17] p-1 rounded-xl border border-[#2b4437] text-xs">
            {(
              [
                { id: 'all', label: `All (${trips.length})` },
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'draft', label: 'Drafts' },
                { id: 'archived', label: 'Archived' },
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#2e5d4b] text-white shadow-sm'
                    : 'text-[#8ba396] hover:text-[#e0ded5]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Trips Cards Grid */}
        {filteredTrips.length === 0 ? (
          <div className="p-12 text-center bg-[#121c17] border border-dashed border-[#2b4437] rounded-2xl space-y-3">
            <Compass className="w-8 h-8 text-[#52b788] mx-auto opacity-70" />
            <div className="text-sm font-bold text-white">No trips in this view</div>
            <p className="text-xs text-[#8da598] max-w-sm mx-auto">
              Plan your next getaway with AI or explore curated destination travel guides.
            </p>
            <button
              onClick={onCreateNewTrip}
              className="mt-2 px-4 py-2 rounded-xl bg-[#52b788] text-[#0c120f] font-bold text-xs"
            >
              Plan First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map(trip => (
              <div
                key={trip.id}
                className="group bg-[#121c17] border border-[#263b2f] hover:border-[#52b788]/60 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Cover */}
                  <div className="relative h-44 w-full overflow-hidden">
                    <img
                      src={trip.coverImageUrl || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800'}
                      alt={trip.destination}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121c17] via-transparent to-black/30" />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1e3427] text-[#52b788] border border-[#2b4437]">
                        {trip.status}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-xs text-white">
                      <div className="flex items-center gap-1 font-semibold text-[#52b788]">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{trip.destination}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <h3
                      onClick={() => onOpenTrip(trip.id)}
                      className="text-base font-bold text-white group-hover:text-[#52b788] transition-colors cursor-pointer line-clamp-1"
                    >
                      {trip.title}
                    </h3>

                    <div className="space-y-1.5 text-xs text-[#9eb2a7]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#52b788]" />
                        <span>{trip.startDate} to {trip.endDate} ({trip.itinerary.length} Days)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5 text-[#52b788]" />
                        <span>Budget: {trip.currency} {trip.budgetAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-[#52b788]" />
                        <span>{trip.travelers} Traveler(s) · {trip.members.length} companion(s)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 pt-0 border-t border-[#1e3025] flex items-center justify-between gap-2 mt-4 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => duplicateTrip(trip.id)}
                      className="p-2 rounded-lg bg-[#16241d] hover:bg-[#1f3128] text-[#a4b8ad]"
                      title="Duplicate trip"
                      aria-label="Duplicate Trip"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleArchiveToggle(trip)}
                      className="p-2 rounded-lg bg-[#16241d] hover:bg-[#1f3128] text-[#a4b8ad]"
                      title={trip.status === 'archived' ? 'Unarchive' : 'Archive'}
                      aria-label="Archive Trip"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setTripToDelete(trip)}
                      className="p-2 rounded-lg bg-[#271717] hover:bg-[#382020] text-[#ff9999]"
                      title="Delete trip"
                      aria-label="Delete Trip"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenTrip(trip.id)}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#2e5d4b] hover:bg-[#3b755f] text-white font-semibold text-xs transition-colors"
                  >
                    <span>Open Itinerary</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Favorites Tray */}
      {savedDests.length > 0 && (
        <div className="p-6 bg-[#121c17] border border-[#2b4437] rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 fill-[#e63946] text-[#e63946]" />
            <h3 className="text-sm font-bold text-white">Saved Favorite Destinations</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {savedDests.map(d => (
              <div
                key={d.id}
                className="p-3 bg-[#17251f] border border-[#23382d] rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white block">{d.name}, {d.country}</span>
                  <span className="text-[11px] text-[#7ea08f]">{d.region} · {d.currency} {d.avgDailyBudget}/day</span>
                </div>
                <button
                  onClick={onExploreDestinations}
                  className="px-2.5 py-1 rounded-lg bg-[#2e5d4b] text-white text-[11px] font-semibold"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {tripToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm bg-[#14201a] border border-[#782b2b] rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-2 text-[#ff8080]">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Delete Trip Itinerary?</h3>
            </div>
            <p className="text-[#c0d1c7] leading-relaxed">
              Are you sure you want to permanently delete <strong>{tripToDelete.title}</strong>? All associated activities and recorded expenses will be removed.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setTripToDelete(null)}
                className="px-4 py-2 rounded-lg border border-[#2b4437] text-[#c0d1c7] hover:bg-[#1a2b22]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-[#e63946] text-white font-bold hover:bg-[#d62839]"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
