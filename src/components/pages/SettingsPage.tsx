import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { Settings, User, DollarSign, Globe, Check, Shield } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { userProfile } = useTravel();

  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [currency, setCurrency] = useState(userProfile.preferredCurrency);
  const [timezone, setTimezone] = useState(userProfile.timezone);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    userProfile.name = name;
    userProfile.email = email;
    userProfile.preferredCurrency = currency;
    userProfile.timezone = timezone;
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-[#f4efe6] py-4">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#182620] border border-[#2b4437] text-xs font-semibold text-[#52b788]">
          <Settings className="w-3.5 h-3.5" />
          <span>Account & Global Preferences</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
          Settings & Travel Profile
        </h1>
        <p className="text-xs text-[#8da598]">
          Customize your default currencies, timezones, and display configurations.
        </p>
      </div>

      <form onSubmit={handleSave} className="p-6 md:p-8 bg-[#121c17] border border-[#263b2f] rounded-2xl shadow-xl space-y-6 text-xs">
        {savedSuccess && (
          <div className="p-3 bg-[#1d3527] border border-[#52b788] rounded-xl text-xs text-[#b8e8cb] flex items-center gap-2">
            <Check className="w-4 h-4 text-[#52b788]" />
            <span>Preferences saved successfully.</span>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-[#52b788]" />
            <span>Traveler Details</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#c0d1c7] mb-1 font-medium">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#182620] border border-[#2b4437] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#52b788]"
              />
            </div>
            <div>
              <label className="block text-[#c0d1c7] mb-1 font-medium">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#182620] border border-[#2b4437] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#52b788]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-[#1e3026]">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#52b788]" />
            <span>Financial & Regional Defaults</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#c0d1c7] mb-1 font-medium">Preferred Default Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full bg-[#182620] border border-[#2b4437] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#52b788]"
              >
                <option value="USD">USD ($) — United States Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="JPY">JPY (¥) — Japanese Yen</option>
                <option value="GBP">GBP (£) — British Pound</option>
                <option value="INR">INR (₹) — Indian Rupee</option>
                <option value="CHF">CHF — Swiss Franc</option>
              </select>
            </div>
            <div>
              <label className="block text-[#c0d1c7] mb-1 font-medium">Primary Timezone</label>
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full bg-[#182620] border border-[#2b4437] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#52b788]"
              >
                <option value="America/Los_Angeles">Pacific Time (America/Los_Angeles)</option>
                <option value="America/New_York">Eastern Time (America/New_York)</option>
                <option value="Europe/Paris">Central European Time (Europe/Paris)</option>
                <option value="Asia/Tokyo">Japan Standard Time (Asia/Tokyo)</option>
                <option value="Asia/Kolkata">India Standard Time (Asia/Kolkata)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#52b788] hover:bg-[#40916c] text-[#0c120f] font-bold text-xs shadow-md transition-all"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
