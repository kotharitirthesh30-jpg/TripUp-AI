import React, { useState, useEffect } from 'react';
import { MapPin, Globe, ExternalLink, Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface GroundingPanelProps {
  destination: string;
  latitude?: number;
  longitude?: number;
}

export const GroundingPanel: React.FC<GroundingPanelProps> = ({
  destination,
  latitude,
  longitude,
}) => {
  const [activeGroundingTab, setActiveGroundingTab] = useState<'maps' | 'search'>('maps');
  const [mapsData, setMapsData] = useState<any>(null);
  const [searchData, setSearchData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchGrounding = async () => {
    setLoading(true);
    try {
      if (activeGroundingTab === 'maps') {
        const res = await fetch('/api/ai/maps-grounding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destination, latitude, longitude }),
        });
        const data = await res.json();
        setMapsData(data);
      } else {
        const res = await fetch('/api/ai/search-grounding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destination }),
        });
        const data = await res.json();
        setSearchData(data);
      }
    } catch (e) {
      console.warn('Grounding fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrounding();
  }, [destination, activeGroundingTab]);

  return (
    <div className="bg-[#121c17] border border-[#263b2f] rounded-2xl p-5 space-y-4 text-xs shadow-xl text-[#f4efe6]">
      {/* Header with Tool Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#203328] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#1f372c] text-[#52b788]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Google AI Live Grounding</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-[#1b2b23] text-[#52b788]">
                gemini-3.8-flash
              </span>
            </h3>
            <p className="text-[11px] text-[#8aa395]">
              Real-time places and travel context verified with Google Maps & Search.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-[#17251f] p-1 rounded-xl border border-[#2b4437]">
            <button
              onClick={() => setActiveGroundingTab('maps')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeGroundingTab === 'maps'
                  ? 'bg-[#2e5d4b] text-white shadow-sm'
                  : 'text-[#8ba396] hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-[#52b788]" />
              <span>Google Maps</span>
            </button>
            <button
              onClick={() => setActiveGroundingTab('search')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeGroundingTab === 'search'
                  ? 'bg-[#2e5d4b] text-white shadow-sm'
                  : 'text-[#8ba396] hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[#52b788]" />
              <span>Google Search</span>
            </button>
          </div>

          <button
            onClick={fetchGrounding}
            disabled={loading}
            className="p-2 rounded-xl bg-[#17251f] hover:bg-[#20342a] border border-[#2b4437] text-[#93a89c] disabled:opacity-50"
            title="Refresh Grounded Intelligence"
            aria-label="Refresh Grounded Intelligence"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#52b788]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tab 1: Google Maps Grounding */}
      {activeGroundingTab === 'maps' && (
        <div className="space-y-3">
          {loading ? (
            <div className="py-6 text-center text-[#8ca395] animate-pulse">
              Retrieving verified places via Google Maps Grounding...
            </div>
          ) : (
            <>
              {mapsData?.text && (
                <div className="p-3.5 bg-[#17251f] rounded-xl border border-[#23352b] text-[#c0d1c7] leading-relaxed">
                  {mapsData.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {mapsData?.places?.map((place: any, idx: number) => (
                  <a
                    key={idx}
                    href={place.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#15221b] hover:bg-[#1b2b23] border border-[#263b2f] hover:border-[#52b788]/60 rounded-xl transition-all group flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-white group-hover:text-[#52b788] transition-colors flex items-center justify-between">
                        <span className="line-clamp-1">{place.title}</span>
                        <ExternalLink className="w-3 h-3 text-[#52b788] shrink-0 ml-1" />
                      </div>
                      <p className="text-[11px] text-[#8aa395] line-clamp-2">{place.snippet}</p>
                    </div>
                    <span className="text-[10px] text-[#52b788] pt-2 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> View on Google Maps
                    </span>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 2: Google Search Grounding */}
      {activeGroundingTab === 'search' && (
        <div className="space-y-3">
          {loading ? (
            <div className="py-6 text-center text-[#8ca395] animate-pulse">
              Searching live web sources for {destination}...
            </div>
          ) : (
            <>
              {searchData?.summary && (
                <div className="p-3.5 bg-[#17251f] rounded-xl border border-[#23352b] text-[#c0d1c7] leading-relaxed whitespace-pre-line">
                  {searchData.summary}
                </div>
              )}

              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-[#799486] tracking-wider">
                  Verified Web Grounding Sources:
                </span>
                <div className="flex flex-wrap gap-2">
                  {searchData?.sources?.map((src: any, idx: number) => (
                    <a
                      key={idx}
                      href={src.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#15221b] hover:bg-[#1f3127] border border-[#263b2f] text-[11px] text-[#a4b8ad] hover:text-white rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Globe className="w-3 h-3 text-[#52b788]" />
                      <span className="truncate max-w-xs">{src.title}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
