import React, { useState, useEffect } from 'react';
import { TravelProvider, useTravel } from './context/TravelContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/home/HomePage';
import { ExploreDestinations } from './components/destinations/ExploreDestinations';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { ItineraryEditor } from './components/itinerary/ItineraryEditor';
import { NewTripWizard } from './components/trips/NewTripWizard';
import { AboutPage } from './components/pages/AboutPage';
import { HelpPage } from './components/pages/HelpPage';
import { LegalPage } from './components/pages/LegalPage';
import { SettingsPage } from './components/pages/SettingsPage';

function AppContent() {
  const { trips } = useTravel();

  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(trips[0]?.id || null);

  // Prefilled parameters for NewTripWizard
  const [wizardPrefill, setWizardPrefill] = useState<{
    destination: string;
    startDate: string;
    endDate: string;
    travelers: number;
  }>({
    destination: 'Kyoto, Japan',
    startDate: '2026-11-12',
    endDate: '2026-11-16',
    travelers: 2,
  });

  // Check URL query parameters (e.g. ?view=explore or ?autostart=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam) {
      setCurrentView(viewParam);
    }
  }, []);

  const handleStartPlanningWith = (data: {
    destination: string;
    startDate: string;
    endDate: string;
    travelers: number;
  }) => {
    setWizardPrefill(data);
    setCurrentView('new-trip');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTrip = (tripId: string) => {
    setSelectedTripId(tripId);
    setCurrentView('itinerary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlanTripToDest = (destName: string) => {
    setWizardPrefill(prev => ({ ...prev, destination: destName }));
    setCurrentView('new-trip');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0c120f] text-[#f4efe6] flex flex-col justify-between selection:bg-[#2e5d4b] selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={view => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenNewTrip={() => {
          setCurrentView('new-trip');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentView === 'home' && (
          <HomePage
            onStartPlanningWith={handleStartPlanningWith}
            onNavigateTo={view => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'explore' && (
          <ExploreDestinations
            onPlanTripTo={handlePlanTripToDest}
          />
        )}

        {currentView === 'dashboard' && (
          <UserDashboard
            onOpenTrip={handleOpenTrip}
            onCreateNewTrip={() => setCurrentView('new-trip')}
            onExploreDestinations={() => setCurrentView('explore')}
          />
        )}

        {currentView === 'itinerary' && (
          <ItineraryEditor
            tripId={selectedTripId || trips[0]?.id || ''}
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'new-trip' && (
          <NewTripWizard
            initialDestination={wizardPrefill.destination}
            initialStartDate={wizardPrefill.startDate}
            initialEndDate={wizardPrefill.endDate}
            initialTravelers={wizardPrefill.travelers}
            onSuccess={newTripId => {
              setSelectedTripId(newTripId);
              setCurrentView('itinerary');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onCancel={() => setCurrentView('home')}
          />
        )}

        {currentView === 'about' && (
          <AboutPage onStartPlanning={() => setCurrentView('new-trip')} />
        )}

        {currentView === 'help' && <HelpPage />}

        {currentView === 'legal' && <LegalPage />}

        {currentView === 'settings' && <SettingsPage />}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={view => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <TravelProvider>
      <AppContent />
    </TravelProvider>
  );
}
