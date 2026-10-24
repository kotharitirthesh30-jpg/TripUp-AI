import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageSquare, Compass, ShieldCheck } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'itinerary' | 'ai' | 'grounding' | 'budget';
}

const FAQS: FAQItem[] = [
  {
    category: 'ai',
    question: 'How does Google Gemini generate my trip itinerary?',
    answer: 'TripUp AI sends your structured trip parameters (destination, travel dates, traveler count, style, budget, and interests) to our server-side Gemini service. Gemini calculates realistic, non-overlapping morning, afternoon, and evening schedules with verified places and estimated costs, validated strictly through Zod schemas.',
  },
  {
    category: 'grounding',
    question: 'How do Google Maps and Google Search Grounding work?',
    answer: 'TripUp AI uses gemini-3.8-flash with Google Maps Grounding to fetch verified venue locations, review highlights, and direct Google Maps navigation links. It also uses Google Search Grounding to provide live seasonal tips, events, and web citations.',
  },
  {
    category: 'itinerary',
    question: 'Can I edit, add, or reorder activities after AI generation?',
    answer: 'Yes! Every activity can be freely edited. You can change start and end times, adjust estimated costs, add custom traveler notes, drag or move activities up and down, and delete any unwanted stops. Your edits are automatically saved to your trip vault.',
  },
  {
    category: 'budget',
    question: 'How does the budget and expense tracking work?',
    answer: 'Your overall budget is split across categories like accommodation, transit, food, and attractions. As you travel, you can record actual expenses and compare them against initial estimates. The dashboard flags budget overruns and calculates potential savings.',
  },
  {
    category: 'itinerary',
    question: 'How does trip sharing work?',
    answer: 'Every trip provides a shareable invitation link with role-based access (Owner, Editor, or Viewer). Companions can follow the daily timeline, inspect directions, and view recorded expenses according to their permission level.',
  },
];

export const HelpPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = FAQS.filter(
    f =>
      !search ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-[#f4efe6] py-4">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#182620] border border-[#2b4437] text-xs font-semibold text-[#52b788]">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Help & Support Center</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-xs text-[#8da598] max-w-md mx-auto">
          Learn how TripUp AI plans journeys, provides live Google Maps grounding, and tracks travel budgets.
        </p>

        {/* Search */}
        <div className="relative max-w-md mx-auto pt-2">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#799486]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search help articles and answers..."
            className="w-full bg-[#14201a] border border-[#2b4437] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#52b788]"
          />
        </div>
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-[#121c17] border border-[#263b2f] rounded-xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-xs md:text-sm font-semibold text-white hover:text-[#52b788] transition-colors"
              >
                <span>{faq.question}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-[#52b788]" /> : <ChevronDown className="w-4 h-4 text-[#738f80]" />}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs text-[#9eb2a7] leading-relaxed border-t border-[#1b2b23]">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Support Box */}
      <div className="p-6 rounded-2xl bg-[#14201a] border border-[#2b4437] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="space-y-1 text-center sm:text-left">
          <div className="font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
            <MessageSquare className="w-4 h-4 text-[#52b788]" />
            <span>Still need assistance?</span>
          </div>
          <p className="text-[#8da598]">
            Reach out to our concierge engineering desk or submit an itinerary improvement request.
          </p>
        </div>
        <a
          href="mailto:support@tripup.ai"
          className="px-4 py-2.5 rounded-xl bg-[#2e5d4b] hover:bg-[#3b755f] text-white font-bold transition-colors shrink-0"
        >
          Contact Support Desk
        </a>
      </div>
    </div>
  );
};
