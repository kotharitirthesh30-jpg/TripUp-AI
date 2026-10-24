import React from 'react';
import { Shield, Lock, FileText } from 'lucide-react';

export const LegalPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 text-[#f4efe6] py-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#182620] border border-[#2b4437] text-xs font-semibold text-[#52b788]">
          <Shield className="w-3.5 h-3.5" />
          <span>Security & Legal Compliance</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Privacy Policy & Terms of Service</h1>
        <p className="text-xs text-[#8da598]">Last updated: October 2026 · Draft for AI Travel Platform</p>
      </div>

      <div className="space-y-6 bg-[#121c17] border border-[#263b2f] rounded-2xl p-6 md:p-8 text-xs text-[#b8cfc3] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#52b788]" />
            <span>1. Data Collection & Processing</span>
          </h2>
          <p>
            TripUp AI collects traveler preferences including destination queries, date ranges, traveler party sizes, and recorded expenses to generate personalized travel itineraries. We strictly maintain user privacy: no passwords or payment credentials are stored in plain text, and API keys are strictly confined to server-side execution.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#52b788]" />
            <span>2. Google Gemini AI Processing</span>
          </h2>
          <p>
            Itinerary generation queries are processed through Google’s official Generative AI infrastructure. Prompts contain only necessary travel parameters (destination, dates, interests, and budget tiers) and are never used to train third-party public models.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white">3. Third-Party Mapping & Meteorological Providers</h2>
          <p>
            Map waypoints and climate forecasts are retrieved via verified geocoding and meteorological service APIs. Distances and durations are estimated based on public transit schedules and typical walking speeds.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white">4. Account Rights & Deletion</h2>
          <p>
            Users retain full rights over their trip data. You may export, duplicate, or delete your travel records at any time directly through your dashboard settings.
          </p>
        </section>
      </div>
    </div>
  );
};
