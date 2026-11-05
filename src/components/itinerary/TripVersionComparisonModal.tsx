import React, { useState } from 'react';
import { Trip, TripVersionSnapshot, Activity } from '../../types/travel';
import { useTravel } from '../../context/TravelContext';
import {
  compareTripVersions,
  createTripVersionSnapshot,
  formatCurrency,
} from '../../lib/trip-logic';
import {
  GitCompare,
  History,
  RotateCcw,
  Plus,
  Trash2,
  X,
  Check,
  ArrowRight,
  ArrowLeftRight,
  Layers,
  Sparkles,
  Calendar,
  DollarSign,
  Clock,
  Copy,
  AlertCircle,
} from 'lucide-react';

interface TripVersionComparisonModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
}

export const TripVersionComparisonModal: React.FC<TripVersionComparisonModalProps> = ({
  trip,
  isOpen,
  onClose,
}) => {
  const {
    createTripSnapshot,
    restoreTripSnapshot,
    deleteTripSnapshot,
    duplicateTrip,
    swapDays,
  } = useTravel();

  const [snapshotName, setSnapshotName] = useState('');
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [swapDayA, setSwapDayA] = useState<number>(1);
  const [swapDayB, setSwapDayB] = useState<number>(2);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Versions available: Current state + saved snapshots
  const currentSnapshot = createTripVersionSnapshot(trip, 'Current Active Plan (Unsaved Edits)');
  const allVersions: TripVersionSnapshot[] = [currentSnapshot, ...(trip.versions || [])];

  const [versionAId, setVersionAId] = useState<string>(allVersions[0]?.id || 'current');
  const [versionBId, setVersionBId] = useState<string>(
    allVersions[1]?.id || allVersions[0]?.id || 'current'
  );

  if (!isOpen) return null;

  const versionA = allVersions.find(v => v.id === versionAId) || currentSnapshot;
  const versionB = allVersions.find(v => v.id === versionBId) || (allVersions[1] || currentSnapshot);

  const diffResult = compareTripVersions(versionA, versionB);

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotName.trim()) return;

    createTripSnapshot(trip.id, snapshotName.trim());
    setToastMessage(`Created snapshot "${snapshotName.trim()}"`);
    setSnapshotName('');
    setIsCreatingSnapshot(false);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRestore = (snap: TripVersionSnapshot) => {
    restoreTripSnapshot(trip.id, snap.id);
    setToastMessage(`Restored "${snap.name}". Current plan archived.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSwapDays = () => {
    if (swapDayA === swapDayB) return;
    swapDays(trip.id, swapDayA, swapDayB);
    setToastMessage(`Swapped Day ${swapDayA} and Day ${swapDayB} successfully!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#101a14] border border-[#2b4437] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#14231b] border-b border-[#263c30] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1e3d2f] border border-[#52b788]/40 flex items-center justify-center text-[#52b788]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Trip Version Comparison & Snapshots</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1e3427] text-[#52b788] border border-[#30523f] font-mono">
                  {(trip.versions || []).length} Saved
                </span>
              </h2>
              <p className="text-xs text-[#8aa395]">
                Compare variations, restore previous itineraries, and swap days to adapt to weather
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingSnapshot(prev => !prev)}
              className="px-3 py-1.5 rounded-lg bg-[#2e5d4b] hover:bg-[#3b755f] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Snapshot</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#8aa395] hover:text-white hover:bg-[#1a2b22] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="mx-4 mt-3 p-2.5 bg-[#1b3b2c] border border-[#52b788] rounded-xl text-xs text-white flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-[#52b788]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Save Snapshot Form Drawer */}
        {isCreatingSnapshot && (
          <form
            onSubmit={handleCreateSnapshot}
            className="p-4 bg-[#142018] border-b border-[#24382d] flex flex-wrap items-center gap-2 text-xs"
          >
            <span className="text-[#8aa395] font-semibold">Snapshot Name:</span>
            <input
              type="text"
              required
              value={snapshotName}
              onChange={e => setSnapshotName(e.target.value)}
              placeholder="e.g. Budget Plan / Rain-Friendly Plan / Pre-Copilot"
              className="flex-1 min-w-[200px] bg-[#0d1611] border border-[#263c30] rounded-lg px-3 py-1.5 text-white outline-none focus:border-[#52b788]"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#52b788] text-[#0c120f] font-bold hover:bg-[#40916c] transition-colors"
            >
              Save Now
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingSnapshot(false)}
              className="px-3 py-1.5 rounded-lg border border-[#263c30] text-[#8aa395] hover:bg-[#1a2920]"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Version Pickers Bar & Day Swap Utility */}
        <div className="p-4 bg-[#121d17] border-b border-[#22352a] flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Version Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[#7fa391] font-semibold uppercase tracking-wider text-[10px]">
                Base Plan (A):
              </span>
              <select
                value={versionAId}
                onChange={e => setVersionAId(e.target.value)}
                className="bg-[#18261f] border border-[#2c4738] rounded-lg px-2.5 py-1.5 text-white font-medium outline-none"
              >
                {allVersions.map((v, i) => (
                  <option key={v.id} value={v.id}>
                    {i === 0 ? '🟢 ' : '🕒 '} {v.name}
                  </option>
                ))}
              </select>
            </div>

            <ArrowLeftRight className="w-3.5 h-3.5 text-[#52b788] hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-[#7fa391] font-semibold uppercase tracking-wider text-[10px]">
                Compare Plan (B):
              </span>
              <select
                value={versionBId}
                onChange={e => setVersionBId(e.target.value)}
                className="bg-[#18261f] border border-[#2c4738] rounded-lg px-2.5 py-1.5 text-white font-medium outline-none"
              >
                {allVersions.map((v, i) => (
                  <option key={v.id} value={v.id}>
                    {i === 0 ? '🟢 ' : '🕒 '} {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Day Swap Tool */}
          <div className="flex items-center gap-2 p-1.5 bg-[#17251f] border border-[#283e32] rounded-xl text-[11px]">
            <span className="text-[#8aa395] font-semibold">Weather Swap:</span>
            <select
              value={swapDayA}
              onChange={e => setSwapDayA(Number(e.target.value))}
              className="bg-[#0f1712] border border-[#283e32] rounded px-1.5 py-0.5 text-white text-[11px]"
            >
              {trip.itinerary.map(d => (
                <option key={d.dayNumber} value={d.dayNumber}>
                  Day {d.dayNumber}
                </option>
              ))}
            </select>
            <span className="text-[#52b788]">➔</span>
            <select
              value={swapDayB}
              onChange={e => setSwapDayB(Number(e.target.value))}
              className="bg-[#0f1712] border border-[#283e32] rounded px-1.5 py-0.5 text-white text-[11px]"
            >
              {trip.itinerary.map(d => (
                <option key={d.dayNumber} value={d.dayNumber}>
                  Day {d.dayNumber}
                </option>
              ))}
            </select>
            <button
              onClick={handleSwapDays}
              className="px-2 py-0.5 rounded bg-[#2e5d4b] hover:bg-[#3b755f] text-white font-bold transition-colors"
            >
              Swap
            </button>
          </div>
        </div>

        {/* Diff Metrics Variance Bar */}
        <div className="p-3 bg-[#15231c] border-b border-[#22352a] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 bg-[#1a2b22] border border-[#2b4437] rounded-lg text-center">
            <span className="text-[10px] text-[#7fa391] uppercase tracking-wider block">Budget Variance</span>
            <span
              className={`font-bold text-sm ${
                diffResult.budgetDiff < 0
                  ? 'text-[#52b788]'
                  : diffResult.budgetDiff > 0
                  ? 'text-[#e06d6d]'
                  : 'text-white'
              }`}
            >
              {diffResult.budgetDiff > 0 ? '+' : ''}
              {formatCurrency(diffResult.budgetDiff, trip.currency)}
            </span>
          </div>

          <div className="p-2 bg-[#1a2b22] border border-[#2b4437] rounded-lg text-center">
            <span className="text-[10px] text-[#7fa391] uppercase tracking-wider block">Activity Count Diff</span>
            <span className="font-bold text-sm text-white">
              {diffResult.activityCountDiff > 0 ? '+' : ''}
              {diffResult.activityCountDiff} Activities
            </span>
          </div>

          <div className="p-2 bg-[#1a2b22] border border-[#2b4437] rounded-lg text-center">
            <span className="text-[10px] text-[#7fa391] uppercase tracking-wider block">Pacing Variance</span>
            <span className="font-bold text-xs text-[#a4d4b9] truncate block">
              {diffResult.pacingDiff}
            </span>
          </div>

          <div className="p-2 bg-[#1a2b22] border border-[#2b4437] rounded-lg text-center flex items-center justify-center">
            {diffResult.isIdentical ? (
              <span className="text-[#52b788] font-bold text-xs flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Identical Plans</span>
              </span>
            ) : (
              <span className="text-[#ffd166] font-bold text-xs flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Variations Detected</span>
              </span>
            )}
          </div>
        </div>

        {/* Side-by-Side Day Differences View */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {diffResult.dayDifferences.map(dayDiff => (
            <div
              key={dayDiff.dayNumber}
              className="p-4 bg-[#142019] border border-[#263c30] rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#52b788]" />
                  <span>Day {dayDiff.dayNumber}</span>
                  <span className="text-[#8aa395] font-normal">({dayDiff.date})</span>
                </span>
                <span className="text-[11px] text-[#7fa391]">
                  {dayDiff.unchangedCount} unchanged · {dayDiff.modifiedActivities.length} modified ·{' '}
                  {dayDiff.addedActivities.length} added · {dayDiff.removedActivities.length} removed
                </span>
              </div>

              {/* Grid: Version A vs Version B */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Version A Card */}
                <div className="p-3 bg-[#0f1712] border border-[#22352a] rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#8aa395] border-b border-[#22352a] pb-1.5">
                    <span>{versionA.name}</span>
                    <span className="text-[#52b788]">Base</span>
                  </div>

                  <div className="space-y-1.5">
                    {versionA.itinerary
                      .find(d => d.dayNumber === dayDiff.dayNumber)
                      ?.activities.map((act, idx) => (
                        <div
                          key={act.id}
                          className="p-2 bg-[#142018] border border-[#223328] rounded text-[11px] space-y-0.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white">
                              {idx + 1}. {act.title}
                            </span>
                            <span className="text-[#789686] font-mono text-[10px]">
                              {act.startTime}
                            </span>
                          </div>
                          <p className="text-[#8aa395] text-[10px] truncate">{act.description}</p>
                          <span className="text-[#52b788] font-mono text-[10px]">
                            {formatCurrency(act.estimatedCost, act.currency || trip.currency)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Version B Card */}
                <div className="p-3 bg-[#0f1712] border border-[#22352a] rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#8aa395] border-b border-[#22352a] pb-1.5">
                    <span>{versionB.name}</span>
                    <div className="flex items-center gap-1.5">
                      {versionB.id !== 'current' && (
                        <button
                          onClick={() => handleRestore(versionB)}
                          className="px-2 py-0.5 rounded bg-[#2e5d4b] hover:bg-[#3b755f] text-white text-[10px] font-bold transition-colors"
                        >
                          Restore This
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {versionB.itinerary
                      .find(d => d.dayNumber === dayDiff.dayNumber)
                      ?.activities.map((act, idx) => {
                        const isAdded = dayDiff.addedActivities.some(a => a.id === act.id);
                        const modifiedMatch = dayDiff.modifiedActivities.find(m => m.to.id === act.id);

                        return (
                          <div
                            key={act.id}
                            className={`p-2 rounded text-[11px] space-y-0.5 border ${
                              isAdded
                                ? 'bg-[#183625] border-[#52b788]/60 text-white'
                                : modifiedMatch
                                ? 'bg-[#292e18] border-[#d4a34b]/60 text-white'
                                : 'bg-[#142018] border-[#223328] text-[#c0d1c7]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold flex items-center gap-1">
                                {idx + 1}. {act.title}
                                {isAdded && (
                                  <span className="text-[9px] px-1 rounded bg-[#52b788] text-[#0c120f] font-bold">
                                    NEW
                                  </span>
                                )}
                                {modifiedMatch && (
                                  <span className="text-[9px] px-1 rounded bg-[#d4a34b] text-[#0c120f] font-bold">
                                    UPDATED
                                  </span>
                                )}
                              </span>
                              <span className="font-mono text-[10px] opacity-80">
                                {act.startTime}
                              </span>
                            </div>

                            {modifiedMatch && (
                              <div className="text-[10px] text-[#ffd166] space-y-0.5 py-0.5">
                                {modifiedMatch.changes.map((ch, i) => (
                                  <div key={i}>• {ch}</div>
                                ))}
                              </div>
                            )}

                            <p className="text-[10px] opacity-75 truncate">{act.description}</p>
                            <span className="text-[#52b788] font-mono text-[10px]">
                              {formatCurrency(act.estimatedCost, act.currency || trip.currency)}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#14231b] border-t border-[#263c30] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-[#8aa395] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#52b788]" />
            <span>Green = Added activity</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#d4a34b] ml-2" />
            <span>Amber = Time/Cost adjusted</span>
          </div>

          <div className="flex items-center gap-2">
            {versionB.id !== 'current' && (
              <button
                onClick={() => handleRestore(versionB)}
                className="px-4 py-2 rounded-lg bg-[#52b788] hover:bg-[#40916c] text-[#0c120f] font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore "{versionB.name}"</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#2b4437] text-[#c0d1c7] hover:bg-[#1a2b22] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
