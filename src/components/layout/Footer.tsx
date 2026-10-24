import React from 'react';
import { Compass, Sparkles, Shield, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#090e0c] border-t border-[#1d2d23] text-xs text-[#8da598] py-12 px-6 mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#2e5d4b] text-[#52b788] flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-base font-serif font-bold text-white">TripUp AI</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#758e80]">
            Your journey, intelligently planned. Premium travel discovery and AI itinerary SaaS architecture.
          </p>
          <div className="text-[11px] text-[#52b788] flex items-center gap-1.5 pt-1">
            <span className="w-2 h-2 rounded-full bg-[#52b788]" />
            <span>Google Gemini AI Engine & Maps Grounding</span>
          </div>
        </div>

        {/* Navigation Column */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platform Navigation</h4>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                Home Explorer
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('explore')} className="hover:text-white transition-colors">
                Destinations Directory
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('dashboard')} className="hover:text-white transition-colors">
                Traveler Dashboard
              </button>
            </li>
          </ul>
        </div>

        {/* Curated Hubs */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Curated Destinations</h4>
          <ul className="space-y-1.5 text-[11px]">
            <li className="text-[#a4b8ad]">Kyoto, Japan (Imperial Pagodas)</li>
            <li className="text-[#a4b8ad]">Paris, France (Art & Cafes)</li>
            <li className="text-[#a4b8ad]">Swiss Alps (Matterhorn Peak)</li>
            <li className="text-[#a4b8ad]">Bali, Indonesia (Tropical Atolls)</li>
            <li className="text-[#a4b8ad]">Amalfi Coast, Italy (Pastel Cliffs)</li>
          </ul>
        </div>

        {/* Legal & Mission */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Security & Policies</h4>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                Our Mission & Story
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('help')} className="hover:text-white transition-colors">
                Help Center & FAQs
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('legal')} className="hover:text-white transition-colors">
                Privacy Policy & Terms
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-[#18261e] flex flex-col sm:flex-row items-center justify-between text-[11px] gap-3">
        <span>© 2026 TripUp AI Inc. All rights reserved.</span>
        <span>Engineered with Google Gemini AI & Verified Grounding Services.</span>
      </div>
    </footer>
  );
};
