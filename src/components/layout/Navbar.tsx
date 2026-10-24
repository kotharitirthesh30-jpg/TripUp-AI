import React, { useState } from 'react';
import { Compass, Sparkles, Menu, X, Plus, User, Globe } from 'lucide-react';
import { useTravel } from '../../context/TravelContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenNewTrip: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenNewTrip }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userProfile, trips } = useTravel();

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Explore' },
    { id: 'dashboard', label: `Dashboard (${trips.length})` },
    { id: 'about', label: 'About' },
    { id: 'help', label: 'Help' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0c120f]/95 border-b border-[#203328] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleLinkClick('home')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2e5d4b] to-[#12241c] border border-[#52b788]/40 flex items-center justify-center text-[#52b788] shadow-md group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-[#52b788]" />
          </div>
          <div>
            <span className="text-base font-serif font-bold tracking-tight text-white flex items-center gap-1">
              TripUp <span className="text-[#52b788]">AI</span>
            </span>
            <span className="text-[10px] text-[#738e80] block -mt-1 tracking-wider uppercase font-medium">
              Intelligent Journey Planner
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                currentView === link.id
                  ? 'text-white bg-[#182620] border border-[#2b4437]'
                  : 'text-[#9fb4a7] hover:text-[#f4efe6] hover:bg-[#14201a]'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Action CTA & Profile */}
        <div className="hidden sm:flex items-center gap-2.5">
          <button
            onClick={() => handleLinkClick('settings')}
            className="p-2 rounded-xl bg-[#14201a] hover:bg-[#1f3128] border border-[#2b4437] text-[#c0d1c7] transition-colors"
            title="Profile & Settings"
            aria-label="Profile Settings"
          >
            <User className="w-4 h-4 text-[#52b788]" />
          </button>
          <button
            onClick={onOpenNewTrip}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#52b788] hover:bg-[#40916c] text-[#0c120f] font-bold text-xs shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Plan My Trip</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-[#14201a] border border-[#2b4437] text-[#c0d1c7] md:hidden"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0e1612] border-b border-[#23382d] p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`p-2.5 rounded-lg text-left transition-colors ${
                  currentView === link.id
                    ? 'bg-[#21352a] text-white border border-[#52b788]/60'
                    : 'bg-[#14201a] text-[#a4b8ad]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenNewTrip();
            }}
            className="w-full py-2.5 rounded-xl bg-[#52b788] text-[#0c120f] font-bold text-xs flex items-center justify-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" /> Plan My Trip
          </button>
        </div>
      )}
    </header>
  );
};
