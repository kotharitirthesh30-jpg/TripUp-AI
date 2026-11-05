import React, { useState, useRef, useEffect } from 'react';
import { Trip, CopilotMessage, CopilotProposedChange } from '../../types/travel';
import { applyCopilotChanges, generateSmartCopilotFallback } from '../../lib/trip-logic';
import {
  Sparkles,
  Send,
  X,
  Check,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Bot,
  User,
  Coffee,
  CloudRain,
  DollarSign,
  UtensilsCrossed,
  Users,
  Compass,
} from 'lucide-react';

interface TravelCopilotDrawerProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onApplyTripUpdate: (updatedTrip: Trip) => void;
}

const QUICK_SUGGESTIONS = [
  { label: '🍃 Make Day 2 more relaxing', prompt: 'Make day 2 more relaxing with a slower morning start and peaceful buffer time' },
  { label: '🌧️ Rainy weather backup', prompt: 'Adjust the itinerary for rainy weather with sheltered indoor cultural venues' },
  { label: '💰 Trim budget by 20%', prompt: 'Reduce the estimated total budget by 20% with budget-friendly alternatives' },
  { label: '🥗 Add authentic dining', prompt: 'Add authentic verified regional food experiences honoring my dietary preferences' },
  { label: '👨‍👩‍👧 Family-friendly options', prompt: 'Suggest engaging family-friendly activities suitable for all ages' },
  { label: '🗺️ Optimize activity order', prompt: 'Rearrange activities to minimize transit time and optimize walking routes' },
];

export const TravelCopilotDrawer: React.FC<TravelCopilotDrawerProps> = ({
  trip,
  isOpen,
  onClose,
  onApplyTripUpdate,
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'init-msg',
      role: 'assistant',
      content: `Hello! I am your TripUp AI Travel Copilot for ${trip.destination}. Ask me to refine your daily pace, swap activities for rainy days, cut costs, or discover authentic local dining.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastAppliedBackup, setLastAppliedBackup] = useState<Trip | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const historySummary = messages
        .slice(-4)
        .map(m => `${m.role}: ${m.content}`)
        .join(' | ');

      const response = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip,
          message: text,
          historySummary,
        }),
      });

      let data;
      if (response.ok) {
        data = await response.json();
      } else {
        data = generateSmartCopilotFallback(trip, text);
      }

      const assistantMsg: CopilotMessage = {
        id: `msg-${Date.now()}-asst`,
        role: 'assistant',
        content: data.reply || `I have generated travel recommendations for ${trip.destination}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        proposedChanges: data.proposedChanges || [],
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.warn('Copilot request error, using smart fallback:', err);
      const fallback = generateSmartCopilotFallback(trip, text);
      const assistantMsg: CopilotMessage = {
        id: `msg-${Date.now()}-fallback`,
        role: 'assistant',
        content: fallback.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        proposedChanges: fallback.proposedChanges,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyChanges = (msgId: string, changes: CopilotProposedChange[]) => {
    if (!changes || changes.length === 0) return;

    // Save previous state for undo capability
    setLastAppliedBackup(trip);

    // Apply changes deterministically
    const updated = applyCopilotChanges(trip, changes);
    onApplyTripUpdate(updated);

    // Mark message as applied
    setMessages(prev =>
      prev.map(m => (m.id === msgId ? { ...m, applied: true } : m))
    );

    setToastMessage(`Successfully applied ${changes.length} change(s) to ${trip.destination}!`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleUndo = () => {
    if (!lastAppliedBackup) return;
    onApplyTripUpdate(lastAppliedBackup);
    setLastAppliedBackup(null);
    setToastMessage('Reverted previous Copilot changes.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-[#101a14] border-l border-[#263c30] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 bg-[#14231b] border-b border-[#263c30] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1e3d2f] border border-[#52b788]/40 flex items-center justify-center text-[#52b788]">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>AI Travel Copilot</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e3d2f] text-[#52b788] font-mono border border-[#52b788]/30">
                ACTIVE
              </span>
            </h2>
            <p className="text-[11px] text-[#86a193] truncate max-w-[260px]">
              Assisting with {trip.destination} ({trip.travelStyle})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {lastAppliedBackup && (
            <button
              onClick={handleUndo}
              title="Undo last applied changes"
              className="p-1.5 rounded-lg text-[#86a193] hover:text-white hover:bg-[#1f3529] transition-colors flex items-center gap-1 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Undo</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#86a193] hover:text-white hover:bg-[#1f3529] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="mx-4 mt-2 p-2.5 bg-[#1a3325] border border-[#52b788] rounded-xl text-xs text-white flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#52b788]" />
            <span>{toastMessage}</span>
          </div>
          {lastAppliedBackup && (
            <button
              onClick={handleUndo}
              className="underline text-[11px] text-[#52b788] hover:text-white ml-2 font-bold"
            >
              Undo
            </button>
          )}
        </div>
      )}

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-[#1b3427] border border-[#30523f] flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-[#52b788]" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#264b38] text-white rounded-br-xs border border-[#3e6b52]'
                  : 'bg-[#15231b] text-[#d6e5dc] rounded-bl-xs border border-[#273d30]'
              }`}
            >
              <p className="whitespace-pre-line">{msg.content}</p>

              {/* Proposed Changes Diff Card */}
              {msg.proposedChanges && msg.proposedChanges.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#2e4738] space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#86a193]">
                    <span className="flex items-center gap-1 text-[#52b788]">
                      <Sparkles className="w-3 h-3" />
                      Suggested Itinerary Modifications:
                    </span>
                    <span>Day {msg.proposedChanges[0].dayNumber}</span>
                  </div>

                  <div className="space-y-2">
                    {msg.proposedChanges.map(change => (
                      <div
                        key={change.id}
                        className="p-2.5 bg-[#0e1812] border border-[#263e30] rounded-xl space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider">
                          <span className="text-[#7ea690]">
                            {change.type.replace('_', ' ')}
                          </span>
                          <span className="text-[#a4b8ad]">
                            Day {change.dayNumber}
                          </span>
                        </div>

                        {change.oldValuePreview && (
                          <div className="text-[11px] text-[#e06d6d] line-through opacity-85">
                            - {change.oldValuePreview}
                          </div>
                        )}

                        {change.newValuePreview && (
                          <div className="text-[11px] text-[#52b788] font-medium flex items-center gap-1">
                            <span>+</span>
                            <span>{change.newValuePreview}</span>
                          </div>
                        )}

                        <p className="text-[10px] text-[#789686] italic pt-0.5">
                          "{change.reason}"
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Accept / Discard Actions */}
                  {!msg.applied ? (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleApplyChanges(msg.id, msg.proposedChanges!)}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-[#52b788] hover:bg-[#40916c] text-[#0c120f] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Apply to Trip</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#52b788] flex items-center gap-1 pt-1 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Changes applied to active trip</span>
                    </div>
                  )}
                </div>
              )}

              <span className="block text-[9px] text-[#698575] mt-1.5 text-right font-mono">
                {msg.timestamp}
              </span>
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-[#203f2e] border border-[#3e6951] flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-[#a4d4b9]" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 items-center text-xs text-[#86a193]">
            <div className="w-7 h-7 rounded-full bg-[#1b3427] border border-[#30523f] flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-[#52b788] animate-spin" />
            </div>
            <div className="bg-[#15231b] border border-[#273d30] px-3.5 py-2 rounded-2xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#52b788] animate-ping" />
              <span>Analyzing travel logistics & verified venues...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="px-4 py-2 bg-[#121f17] border-t border-[#22352a]">
        <div className="text-[10px] font-semibold text-[#719080] uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Compass className="w-3 h-3 text-[#52b788]" />
          <span>Quick Travel Adjustments</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {QUICK_SUGGESTIONS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(item.prompt)}
              disabled={isLoading}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-[#182920] hover:bg-[#233c2e] border border-[#2b4437] text-[11px] text-[#c0d6ca] hover:text-white transition-colors disabled:opacity-50"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-[#14231b] border-t border-[#263c30] flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder={`Ask Copilot to refine ${trip.destination}...`}
          maxLength={300}
          disabled={isLoading}
          className="flex-1 bg-[#0e1812] border border-[#284132] focus:border-[#52b788] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#5e7c6c] outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="w-9 h-9 rounded-xl bg-[#52b788] hover:bg-[#40916c] disabled:opacity-40 text-[#0c120f] flex items-center justify-center transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
