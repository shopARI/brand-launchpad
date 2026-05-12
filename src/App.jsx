import { useState, useCallback } from 'react';
import { Sidebar, MobileMenuButton } from './components/Sidebar';
import { OnboardingModal } from './components/OnboardingModal';
import { SettingsModal } from './components/SettingsModal';
import { getStorage } from './utils/storage';
import {
  Brainstorm,
  Financing,
  Pricing,
  Branding,
  Marketing,
  PreOrder,
  Production,
  Calendar,
} from './sections';

function useAppState() {
  // Lazy initializers read localStorage once at mount — no effects needed
  const [storage, setStorage] = useState(() => getStorage());
  const [showOnboarding, setShowOnboarding] = useState(() => !getStorage().user.name);
  const [showSettings, setShowSettings] = useState(false);
  const [activeSection, setActiveSection] = useState('brainstorm');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
    setStorage(getStorage());
  }, []);

  const handleSettingsSave = useCallback(() => {
    setStorage(getStorage());
  }, []);

  const handleSectionChange = useCallback((section) => {
    setActiveSection(section);
    // Refresh storage when switching sections to pick up any saves
    setStorage(getStorage());
  }, []);

  return {
    storage,
    showOnboarding,
    showSettings,
    setShowSettings,
    activeSection,
    handleSectionChange,
    handleOnboardingComplete,
    handleSettingsSave,
    mobileMenuOpen,
    setMobileMenuOpen,
  };
}

export default function App() {
  const {
    storage,
    showOnboarding,
    showSettings,
    setShowSettings,
    activeSection,
    handleSectionChange,
    handleOnboardingComplete,
    handleSettingsSave,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useAppState();

  // Render the active section, passing onNavigate to Calendar for section-link navigation
  function renderActiveSection() {
    switch (activeSection) {
      case 'brainstorm': return <Brainstorm />;
      case 'financing':  return <Financing />;
      case 'pricing':    return <Pricing />;
      case 'branding':   return <Branding />;
      case 'marketing':  return <Marketing />;
      case 'preorder':   return <PreOrder />;
      case 'production': return <Production />;
      case 'calendar':   return <Calendar onNavigate={handleSectionChange} />;
      default:           return <Brainstorm />;
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile hamburger button */}
      <MobileMenuButton onClick={() => setMobileMenuOpen(true)} />

      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        sectionProgress={storage.sectionProgress}
        onSettingsOpen={() => setShowSettings(true)}
        userName={storage.user.name}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Mobile top padding for hamburger button */}
        <div className="md:hidden h-16" />
        {renderActiveSection()}
      </main>

      {/* Modals */}
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSave={handleSettingsSave}
        />
      )}
    </div>
  );
}
