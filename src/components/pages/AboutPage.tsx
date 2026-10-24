import React from 'react';
import { Compass, Sparkles, Shield, Cpu, Globe, Users, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC<{ onStartPlanning: () => void }> = ({ onStartPlanning }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 text-[#f4efe6] py-4">
      {/* Hero Mission */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#182620] border border-[#2b4437] text-xs font-semibold text-[#52b788]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The TripUp AI Mission</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight">
          Your Journey, Intelligently Planned.
        </h1>
        <p className="text-sm md:text-base text-[#9eb2a7] leading-relaxed">
          We believe travel should feel like stepping into a beautifully crafted world, not wrestling with endless browser tabs, overlapping schedules, and uncertain budgets.
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#121c17] border border-[#263b2f] space-y-3">
          <div className="p-3 bg-[#1e3427] text-[#52b788] rounded-xl w-fit">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Google Gemini Intelligence</h3>
          <p className="text-xs text-[#9eb2a7] leading-relaxed">
            Our server-side AI architecture combines Gemini models with strict validation schemas to build realistic, time-accurate daily itineraries respecting opening hours, transit buffers, and budget limits.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#121c17] border border-[#263b2f] space-y-3">
          <div className="p-3 bg-[#1e3427] text-[#52b788] rounded-xl w-fit">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Curated Travel Discovery</h3>
          <p className="text-xs text-[#9eb2a7] leading-relaxed">
            Experience destinations through authentic cultural photography, localized meteorological forecasting, and live Google Maps & Search grounding citations.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#121c17] border border-[#263b2f] space-y-3">
          <div className="p-3 bg-[#1e3427] text-[#52b788] rounded-xl w-fit">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Honest Travel Architecture</h3>
          <p className="text-xs text-[#9eb2a7] leading-relaxed">
            We never pretend an unconfigured integration is working. We clearly label verified venues, distinguish actual expenses from estimates, and preserve your customized changes.
          </p>
        </div>
      </div>

      {/* Editorial Story */}
      <div className="p-8 rounded-2xl bg-[#121c17] border border-[#2b4437] space-y-4 leading-relaxed text-xs md:text-sm text-[#c0d1c7]">
        <h2 className="text-xl font-serif font-bold text-white">How AI Supports Trip Planning Responsibly</h2>
        <p>
          TripUp AI structures complex travel problem sets into deterministic mathematical constraints: departure dates, maximum transit windows, localized budgets, opening schedules, and traveler physical styles. Rather than hallucinating arbitrary hotel rooms or imaginary reservations, the engine suggests hand-curated and verified public points of interest.
        </p>
        <p>
          You remain in full control of your itinerary. Reorder activities, swap out suggestions, record actual receipts as they happen, and collaborate with travel companions securely.
        </p>
      </div>

      {/* CTA Box */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-[#172e22] to-[#111e17] border border-[#52b788]/40 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-white">Ready to Discover Your Next Horizon?</h2>
        <p className="text-xs text-[#b8cfc3] max-w-md mx-auto">
          Start planning with Google Gemini AI and build your customized daily itinerary in minutes.
        </p>
        <button
          onClick={onStartPlanning}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#52b788] hover:bg-[#40916c] text-[#0c120f] font-bold text-xs shadow-lg transition-all"
        >
          <span>Plan My Trip</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
