import React, { useState, useEffect } from 'react';
import { Trip, Activity, Expense, TravelCategory, ExpenseCategory } from '../../types/travel';
import { useTravel } from '../../context/TravelContext';
import {
  calculateBudgetSummary,
  validateDaySchedule,
  doActivitiesOverlap,
  formatCurrency,
  SUPPORTED_CURRENCIES,
} from '../../lib/trip-logic';
import { GroundingPanel } from '../grounding/GroundingPanel';
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Share2,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  CloudSun,
  Layers,
  ArrowUpDown,
  ExternalLink,
  Users,
  Copy,
  Check,
  Globe
} from 'lucide-react';

interface ItineraryEditorProps {
  tripId: string;
  onBack: () => void;
}

export const ItineraryEditor: React.FC<ItineraryEditorProps> = ({ tripId, onBack }) => {
  const {
    trips,
    updateTrip,
    deleteTrip,
    duplicateTrip,
    addExpense,
    deleteExpense,
    updateActivity,
    addActivity,
    deleteActivity,
    reorderActivities,
    changeTripCurrency,
  } = useTravel();

  const trip = trips.find(t => t.id === tripId) || trips[0];

  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'grounding' | 'map' | 'weather' | 'share'>('itinerary');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Edit Activity State
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityDesc, setNewActivityDesc] = useState('');
  const [newActivityStart, setNewActivityStart] = useState('14:00');
  const [newActivityEnd, setNewActivityEnd] = useState('16:00');
  const [newActivityCost, setNewActivityCost] = useState(25);
  const [newActivityCategory, setNewActivityCategory] = useState<TravelCategory>('culture');
  const [newActivityAddress, setNewActivityAddress] = useState('');

  // Add Expense State
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('food');
  const [expDesc, setExpDesc] = useState('');
  const [expEst, setExpEst] = useState(50);
  const [expAct, setExpAct] = useState(48);

  // Weather State
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  // Share Link State
  const [copiedLink, setCopiedLink] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');

  // Load weather
  useEffect(() => {
    if (!trip) return;
    setIsWeatherLoading(true);
    fetch(`/api/weather?destination=${encodeURIComponent(trip.destination)}`)
      .then(res => res.json())
      .then(data => {
        setWeatherData(data);
        setIsWeatherLoading(false);
      })
      .catch(() => {
        setIsWeatherLoading(false);
      });
  }, [trip?.destination]);

  if (!trip) {
    return (
      <div className="p-12 text-center text-[#c0d1c7]">
        <p>Trip not found.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-[#2e5d4b] text-white rounded-lg">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const activeDay = trip.itinerary[selectedDayIndex] || trip.itinerary[0];
  const budgetSummary = calculateBudgetSummary(trip.budgetAmount, trip.expenses, trip.itinerary);
  const scheduleValidation = activeDay ? validateDaySchedule(activeDay.activities) : { valid: true, conflicts: [] };

  const handleAddActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityTitle.trim() || !activeDay) return;

    const [sH, sM] = newActivityStart.split(':').map(Number);
    const [eH, eM] = newActivityEnd.split(':').map(Number);
    const dur = Math.max(15, (eH * 60 + eM) - (sH * 60 + sM));

    addActivity(trip.id, activeDay.id, {
      title: newActivityTitle,
      description: newActivityDesc || 'Custom traveler activity',
      startTime: newActivityStart,
      endTime: newActivityEnd,
      durationMinutes: dur,
      estimatedCost: Number(newActivityCost) || 0,
      currency: trip.currency,
      category: newActivityCategory,
      sortOrder: activeDay.activities.length,
      address: newActivityAddress || trip.destination,
      verificationStatus: 'verified',
    });

    setIsAddActivityOpen(false);
    setNewActivityTitle('');
    setNewActivityDesc('');
    setNewActivityAddress('');
  };

  const handleMoveActivity = (index: number, direction: 'up' | 'down') => {
    if (!activeDay) return;
    const newActivities = [...activeDay.activities];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newActivities.length) return;

    const temp = newActivities[index];
    newActivities[index] = newActivities[targetIdx];
    newActivities[targetIdx] = temp;

    reorderActivities(trip.id, activeDay.id, newActivities);
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc.trim()) return;

    addExpense(trip.id, {
      tripId: trip.id,
      category: expCategory,
      description: expDesc,
      estimatedAmount: Number(expEst) || 0,
      actualAmount: Number(expAct) || 0,
      currency: trip.currency,
      expenseDate: activeDay?.date || trip.startDate,
    });

    setIsAddExpenseOpen(false);
    setExpDesc('');
  };

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}/trips/${trip.id}?share_token=tok_${trip.id.substring(0, 8)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-[#f4efe6]">
      {/* Top Banner / Hero Card */}
      <div className="relative rounded-2xl overflow-hidden border border-[#2b4437] bg-[#121c17] shadow-2xl">
        <div className="h-44 md:h-56 relative w-full overflow-hidden">
          <img
            src={trip.coverImageUrl || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200'}
            alt={trip.destination}
            className="w-full h-full object-cover brightness-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121c17] via-[#121c17]/50 to-transparent" />

          {/* Action pills on top right */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setActiveTab('share')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14201a]/90 hover:bg-[#1f3128] border border-[#2b4437] text-xs font-medium text-[#e2ded5] transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-[#52b788]" />
              <span>Share Trip</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14201a]/90 hover:bg-[#1f3128] border border-[#2b4437] text-xs font-medium text-[#e2ded5] transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded-lg bg-[#14201a]/90 hover:bg-[#1f3128] border border-[#2b4437] text-xs font-medium text-[#c9c4b8] transition-colors"
            >
              Dashboard
            </button>
          </div>

          {/* Trip Header Content */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-[#2e5d4b] text-white font-medium">
                {trip.travelStyle} Pace
              </span>
              <span className="text-[#a6b8ad] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#52b788]" />
                {trip.destination}
              </span>
              <span className="text-[#a6b8ad] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#52b788]" />
                {trip.startDate} to {trip.endDate} ({trip.itinerary.length} Days)
              </span>
              {trip.dietaryPreference && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#1b3829] border border-[#52b788]/60 text-[#96e6ba] font-semibold flex items-center gap-1">
                  <span>🥦</span>
                  <span>
                    {trip.dietaryPreference === 'pure_veg' ? 'Pure Veg' :
                     trip.dietaryPreference === 'only_nonveg' ? 'Only Non-Veg' :
                     trip.dietaryPreference === 'vegan' ? 'Vegan' :
                     trip.dietaryPreference === 'halal' ? 'Halal' : 'Veg & Non-Veg'}
                  </span>
                </span>
              )}
              {trip.customPrompt && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#292617] border border-[#ffd166]/60 text-[#ffe599] font-medium flex items-center gap-1 truncate max-w-xs">
                  <span>✨</span>
                  <span className="truncate">{trip.customPrompt}</span>
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-3xl font-bold font-serif text-white tracking-tight">{trip.title}</h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-t border-[#23352b] px-6 bg-[#0f1814] overflow-x-auto text-xs font-medium">
          {(
            [
              { id: 'itinerary', label: 'Daily Timeline & Schedule' },
              { id: 'grounding', label: 'Google Maps & Search Grounding' },
              { id: 'budget', label: `Budget & Expenses (${formatCurrency(budgetSummary.recordedActualTotal, trip.currency)})` },
              { id: 'map', label: 'Route & Map Stops' },
              { id: 'weather', label: 'Weather Forecast' },
              { id: 'share', label: `Companions (${trip.members.length})` },
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 px-4 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-[#52b788] text-white font-semibold'
                  : 'border-transparent text-[#90a397] hover:text-[#e0ded5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB: GOOGLE LIVE GROUNDING */}
      {activeTab === 'grounding' && (
        <GroundingPanel
          destination={trip.destination}
          latitude={trip.itinerary[0]?.activities[0]?.latitude}
          longitude={trip.itinerary[0]?.activities[0]?.longitude}
        />
      )}

      {/* TAB 1: ITINERARY TIMELINE */}
      {activeTab === 'itinerary' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Day Selector Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#738e80] mb-2 px-1">
              Itinerary Days ({trip.itinerary.length})
            </div>
            {trip.itinerary.map((day, idx) => (
              <button
                key={day.id}
                onClick={() => setSelectedDayIndex(idx)}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  selectedDayIndex === idx
                    ? 'bg-[#213b2e] border-[#52b788] text-white shadow-md'
                    : 'bg-[#14201a] border-[#2b4437] text-[#c0d1c7] hover:bg-[#1b2b23]'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">Day {day.dayNumber}</div>
                  <div className="text-[11px] text-[#93a89c]">{day.date}</div>
                </div>
                <div className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#182620] text-[#a9beb2]">
                  {day.activities.length} stops
                </div>
              </button>
            ))}

            <button
              onClick={() => setIsAddActivityOpen(true)}
              className="w-full mt-4 p-3 rounded-xl border border-dashed border-[#3d5a4a] text-xs font-semibold text-[#52b788] hover:bg-[#1a2c22] transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Activity
            </button>
          </div>

          {/* Activities Timeline */}
          <div className="lg:col-span-3 space-y-4">
            {activeDay && (
              <>
                {/* Day Summary Header */}
                <div className="p-4 bg-[#14201a] border border-[#2b4437] rounded-xl flex items-center justify-between">
                  <div>
                    <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                      <span>Day {activeDay.dayNumber}: {activeDay.date}</span>
                      <span className="text-xs font-normal text-[#8ca395]">— {activeDay.summary}</span>
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsAddActivityOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#2e5d4b] hover:bg-[#3a735e] text-xs font-semibold rounded-lg text-white transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Stop
                  </button>
                </div>

                {/* Schedule conflicts banner if any */}
                {!scheduleValidation.valid && (
                  <div className="p-3 bg-[#381a1a] border border-[#782b2b] rounded-xl text-xs text-[#ffb4b4] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-[#ff8080]" />
                    <span>Schedule Warning: {scheduleValidation.conflicts.join(', ')}</span>
                  </div>
                )}

                {/* Activity List */}
                <div className="space-y-3 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#23382d]">
                  {activeDay.activities.map((act, actIdx) => (
                    <div
                      key={act.id}
                      className="relative pl-12 group bg-[#131e18] hover:bg-[#18261f] border border-[#25392e] rounded-xl p-4 transition-all"
                    >
                      {/* Timeline Dot Marker */}
                      <div className="absolute left-3.5 top-5 w-3.5 h-3.5 rounded-full bg-[#52b788] border-2 border-[#121c17] shadow" />

                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#52b788] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {act.startTime} – {act.endTime} ({act.durationMinutes}m)
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#1d3026] text-[#b6d6c3]">
                              {act.category}
                            </span>
                            {act.verificationStatus === 'verified' && (
                              <span className="text-[10px] text-[#52b788] flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Verified Venue
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-white">{act.title}</h3>
                          <p className="text-xs text-[#9eb2a7] leading-relaxed">{act.description}</p>
                          {act.address && (
                            <p className="text-[11px] text-[#718b7e] flex items-center gap-1 pt-1">
                              <MapPin className="w-3 h-3 text-[#52b788]" />
                              {act.address}
                            </p>
                          )}
                        </div>

                        {/* Cost & Reorder / Actions */}
                        <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#23352b]">
                          <div className="text-xs font-semibold text-[#ffd166]">
                            {act.estimatedCost > 0 ? formatCurrency(act.estimatedCost, trip.currency) : 'Free / Included'}
                          </div>

                          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleMoveActivity(actIdx, 'up')}
                              disabled={actIdx === 0}
                              className="p-1 rounded bg-[#1c2c23] hover:bg-[#273d31] text-[#9bb0a4] disabled:opacity-30"
                              title="Move up"
                              aria-label="Move Up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveActivity(actIdx, 'down')}
                              disabled={actIdx === activeDay.activities.length - 1}
                              className="p-1 rounded bg-[#1c2c23] hover:bg-[#273d31] text-[#9bb0a4] disabled:opacity-30"
                              title="Move down"
                              aria-label="Move Down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteActivity(trip.id, activeDay.id, act.id)}
                              className="p-1 rounded bg-[#2c1a1a] hover:bg-[#3d2424] text-[#ff9999]"
                              title="Delete activity"
                              aria-label="Delete Activity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BUDGET & EXPENSES */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          {/* Trip Currency Switcher Bar */}
          <div className="p-4 bg-[#14201a] border border-[#2b4437] rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#52b788]" />
                <span>Trip Currency & Exchange Unit</span>
              </span>
              <span className="text-[11px] text-[#8ca395]">
                Switch currency to automatically convert your trip budget and itemized expenses in real-time.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#a3b9ac] font-medium">Trip Currency:</span>
              <select
                value={trip.currency}
                onChange={e => changeTripCurrency(trip.id, e.target.value)}
                className="bg-[#1b2b22] hover:bg-[#22362b] border border-[#52b788] text-white font-bold text-xs px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer transition-colors"
                aria-label="Trip Currency"
              >
                {Object.values(SUPPORTED_CURRENCIES).map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.code} — {curr.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-[#14201a] border border-[#2b4437] rounded-xl">
              <span className="text-[11px] uppercase tracking-wider text-[#799486] font-semibold">Allocated Budget</span>
              <div className="text-xl font-bold font-serif text-white mt-1">
                {formatCurrency(budgetSummary.budgetAmount, trip.currency)}
              </div>
            </div>
            <div className="p-4 bg-[#14201a] border border-[#2b4437] rounded-xl">
              <span className="text-[11px] uppercase tracking-wider text-[#799486] font-semibold">Actual Spending</span>
              <div className="text-xl font-bold font-serif text-[#ffd166] mt-1">
                {formatCurrency(budgetSummary.recordedActualTotal, trip.currency)}
              </div>
            </div>
            <div className="p-4 bg-[#14201a] border border-[#2b4437] rounded-xl">
              <span className="text-[11px] uppercase tracking-wider text-[#799486] font-semibold">Remaining Surplus</span>
              <div
                className={`text-xl font-bold font-serif mt-1 ${
                  budgetSummary.isOverBudget ? 'text-[#ff7b72]' : 'text-[#52b788]'
                }`}
              >
                {formatCurrency(budgetSummary.remainingBudget, trip.currency)}
              </div>
            </div>
            <div className="p-4 bg-[#14201a] border border-[#2b4437] rounded-xl">
              <span className="text-[11px] uppercase tracking-wider text-[#799486] font-semibold">Budget Utilization</span>
              <div className="text-xl font-bold font-serif text-white mt-1">{budgetSummary.percentUsed}%</div>
            </div>
          </div>

          {/* Budget Progress Bar */}
          <div className="p-5 bg-[#14201a] border border-[#2b4437] rounded-xl space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#96aea1]">Budget Progress ({budgetSummary.percentUsed}% used)</span>
              <span className={budgetSummary.isOverBudget ? 'text-[#ff7b72] font-semibold' : 'text-[#52b788]'}>
                {budgetSummary.isOverBudget ? 'Over Budget' : 'Within Safe Range'}
              </span>
            </div>
            <div className="w-full h-3 bg-[#1c2c23] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  budgetSummary.isOverBudget ? 'bg-[#e63946]' : 'bg-[#52b788]'
                }`}
                style={{ width: `${Math.min(budgetSummary.percentUsed, 100)}%` }}
              />
            </div>
          </div>

          {/* Expenses List & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Itemized Expenses ({trip.expenses.length})</h3>
                <button
                  onClick={() => setIsAddExpenseOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2e5d4b] hover:bg-[#3b755f] text-xs font-semibold text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Expense
                </button>
              </div>

              <div className="space-y-2.5">
                {trip.expenses.map(exp => (
                  <div
                    key={exp.id}
                    className="p-3.5 bg-[#14201a] border border-[#25392e] rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{exp.description}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#1d3026] text-[#b6d6c3]">
                          {exp.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#789184] mt-0.5">
                        Recorded on {exp.expenseDate} · Est: {formatCurrency(exp.estimatedAmount, trip.currency)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-bold text-[#ffd166]">
                        {formatCurrency(exp.actualAmount, trip.currency)}
                      </div>
                      <button
                        onClick={() => deleteExpense(trip.id, exp.id)}
                        className="p-1 rounded bg-[#2b1919] hover:bg-[#3d2323] text-[#ff9999]"
                        title="Delete expense"
                        aria-label="Delete Expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown Cards */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">Category Breakdown</h3>
              <div className="p-4 bg-[#14201a] border border-[#2b4437] rounded-xl space-y-3 text-xs">
                {Object.entries(budgetSummary.categoryBreakdown).map(([cat, amounts]) => (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between capitalize text-[#c0d1c7]">
                      <span>{cat}</span>
                      <span className="font-semibold text-white">
                        {formatCurrency(amounts.actual, trip.currency)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1e2f26] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#52b788]"
                        style={{
                          width: `${
                            budgetSummary.recordedActualTotal > 0
                              ? Math.min((amounts.actual / budgetSummary.recordedActualTotal) * 100, 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROUTE & MAP STOPS */}
      {activeTab === 'map' && (
        <div className="p-6 bg-[#14201a] border border-[#2b4437] rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Interactive Ordered Route Stops</h3>
              <p className="text-xs text-[#8ca395]">
                Waypoints and directions mapped for {trip.destination} with verified addresses.
              </p>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.destination)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2e5d4b] hover:bg-[#3b755f] text-xs font-semibold text-white transition-colors"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-3">
            {trip.itinerary.map(day => (
              <div key={day.id} className="p-4 bg-[#17251f] border border-[#263b2f] rounded-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#52b788] mb-2.5">
                  Day {day.dayNumber}: {day.summary}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {day.activities.map((act, i) => (
                    <div key={act.id} className="p-3 bg-[#111c16] border border-[#22352a] rounded-lg text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#2e5d4b] text-white flex items-center justify-center font-bold text-[10px]">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-white truncate">{act.title}</span>
                      </div>
                      <p className="text-[#89a294] text-[11px] truncate">{act.address || trip.destination}</p>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                          act.address || `${act.title}, ${trip.destination}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#52b788] hover:underline text-[11px] flex items-center gap-1 pt-1"
                      >
                        <span>Get directions</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: WEATHER FORECAST */}
      {activeTab === 'weather' && (
        <div className="p-6 bg-[#14201a] border border-[#2b4437] rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-[#52b788]" />
                <span>Destination Climate & Meteorological Forecast</span>
              </h3>
              <p className="text-xs text-[#8ca395]">
                Live atmospheric intelligence for {trip.destination} during your travel dates.
              </p>
            </div>
            {weatherData && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#1c2c23] border border-[#2b4437] text-[#93a99c]">
                Provider: Meteorological API
              </span>
            )}
          </div>

          {weatherData ? (
            <div className="space-y-6">
              {/* Current Overview Banner */}
              <div className="p-5 bg-gradient-to-r from-[#172820] to-[#122019] border border-[#2b4437] rounded-xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl md:text-5xl font-serif font-bold text-white">
                    {weatherData.temperatureC}°C
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#e0ded5]">{weatherData.condition}</div>
                    <div className="text-xs text-[#8aa395]">{weatherData.temperatureF}°F · Wind: {weatherData.windKmh} km/h</div>
                  </div>
                </div>

                <div className="text-xs bg-[#121c17] p-3 rounded-lg border border-[#2b4437] max-w-sm">
                  <span className="font-semibold text-[#52b788] block mb-0.5">TripUp AI Packing Advice:</span>
                  <span className="text-[#a4b8ad]">{weatherData.recommendation}</span>
                </div>
              </div>

              {/* Multi-day forecast cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {weatherData.forecast?.map((f: any, idx: number) => (
                  <div key={idx} className="p-3.5 bg-[#17251f] border border-[#25392e] rounded-xl text-center space-y-1 text-xs">
                    <span className="text-[11px] font-bold text-[#8aa395] uppercase">{f.day}</span>
                    <div className="text-lg font-bold text-white">{f.tempC}°C</div>
                    <div className="text-[11px] text-[#c0d1c7]">{f.condition}</div>
                    <div className="text-[10px] text-[#52b788]">Rain Prob: {f.rainProb}%</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#8ca395]">
              Loading meteorological intelligence...
            </div>
          )}
        </div>
      )}

      {/* TAB 5: COMPANIONS & TRIP SHARING */}
      {activeTab === 'share' && (
        <div className="p-6 bg-[#14201a] border border-[#2b4437] rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#52b788]" />
                <span>Travel Companions & Collaborative Access</span>
              </h3>
              <p className="text-xs text-[#8ca395]">
                Invite travel partners to view or co-edit itineraries and manage shared expenses.
              </p>
            </div>
          </div>

          {/* Invite Box */}
          <div className="p-5 bg-[#182620] border border-[#2b4437] rounded-xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7ea08f]">Shareable Access Link</h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/trips/${trip.id}?invite=tok_${trip.id.substring(0, 8)}`}
                className="flex-1 bg-[#121c17] border border-[#2b4437] rounded-lg px-3 py-2 text-xs text-[#c0d1c7]"
              />
              <button
                onClick={handleCopyShareLink}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2e5d4b] hover:bg-[#3b755f] text-xs font-semibold text-white transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-[#52b788]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7ea08f]">Current Trip Members</h4>
            <div className="space-y-2">
              {trip.members.map(member => (
                <div
                  key={member.id}
                  className="p-3.5 bg-[#17251f] border border-[#263b2f] rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2e5d4b] text-white flex items-center justify-center font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white">{member.name}</div>
                      <div className="text-[11px] text-[#8aa395]">{member.email}</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#1e3427] text-[#52b788] border border-[#2d4d3a]">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD ACTIVITY */}
      {isAddActivityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-[#14201a] border border-[#2b4437] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Add Activity to Day {activeDay?.dayNumber}</h3>
            <form onSubmit={handleAddActivitySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#c0d1c7] mb-1 font-medium">Activity Title</label>
                <input
                  type="text"
                  required
                  value={newActivityTitle}
                  onChange={e => setNewActivityTitle(e.target.value)}
                  placeholder="e.g. Traditional Tea Ceremony Tasting"
                  className="w-full bg-[#182620] border border-[#2b4437] rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-[#c0d1c7] mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={newActivityDesc}
                  onChange={e => setNewActivityDesc(e.target.value)}
                  placeholder="Brief note or insider guidance..."
                  className="w-full bg-[#182620] border border-[#2b4437] rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#c0d1c7] mb-1 font-medium">Start Time</label>
                  <input
                    type="time"
                    value={newActivityStart}
                    onChange={e => setNewActivityStart(e.target.value)}
                    className="w-full bg-[#182620] border border-[#2b4437] rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#c0d1c7] mb-1 font-medium">End Time</label>
                  <input
                    type="time"
                    value={newActivityEnd}
                    onChange={e => setNewActivityEnd(e.target.value)}
                    className="w-full bg-[#182620] border border-[#2b4437] rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#c0d1c7] mb-1 font-medium">Category</label>
                  <select
                    value={newActivityCategory}
                    onChange={e => setNewActivityCategory(e.target.value as TravelCategory)}
                    className="w-full bg-[#182620] border border-[#2b4437] rounded-lg px-3 py-2 text-white capitalize"
                  >
                    {['culture', 'heritage', 'nature', 'food', 'relaxation', 'adventure', 'architecture', 'shopping'].map(
                      c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-[#c0d1c7] mb-1 font-medium">Estimated Cost ({trip.currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={newActivityCost}
                    onChange={e => setNewActivityCost(Number(e.target.value))}
                    className="w-full bg-[#182620] border border-[#2b4437] rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#c0d1c7] mb-1 font-medium">Address / Landmark</label>
                <input
                  type="text"
                  value={newActivityAddress}
                  onChange={e => setNewActivityAddress(e.target.value)}
                  placeholder="e.g. Higashiyama Ward, Kyoto"
                  className="w-full bg-[#182620] border border-[#2b4437] rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddActivityOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#2b4437] text-[#c0d1c7] hover:bg-[#1a2b22]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#52b788] text-[#0c120f] font-bold hover:bg-[#40916c]"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD EXPENSE */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-[#14201a] border border-[#2b4437] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Record Travel Expense</h3>
            <form onSubmit={handleAddExpenseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#c0d1c7] mb-1 font-medium">Expense Description</label>
                <input
                  type="text"
                  required
                  value={expDesc}
                  onChange={e => setExpDesc(e.target.value)}
                  placeholder="e.g. Kaiseki Lunch or Bullet Train Upgrade"
                  className="w-full bg-[#182620] border border-[#2b4437] rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-[#c0d1c7] mb-1 font-medium">Category</label>
                <select
                  value={expCategory}
                  onChange={e => setExpCategory(e.target.value as ExpenseCategory)}
                  className="w-full bg-[#182620] border border-[#2b4437] rounded-lg px-3 py-2 text-white capitalize"
                >
                  {['transport', 'accommodation', 'food', 'attractions', 'shopping', 'other'].map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#c0d1c7] mb-1 font-medium">Estimated Amount ({trip.currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={expEst}
                    onChange={e => setExpEst(Number(e.target.value))}
                    className="w-full bg-[#182620] border border-[#2b4437] rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#c0d1c7] mb-1 font-medium">Actual Amount ({trip.currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={expAct}
                    onChange={e => setExpAct(Number(e.target.value))}
                    className="w-full bg-[#182620] border border-[#2b4437] rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#2b4437] text-[#c0d1c7] hover:bg-[#1a2b22]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#52b788] text-[#0c120f] font-bold hover:bg-[#40916c]"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
