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

const SECTION_COMPONENTS = {
  brainstorm: Brainstorm,
  financing: Financing,
  pricing: Pricing,
  branding: Branding,
  marketing: Marketing,
  preorder: PreOrder,
  production: Production,
  calendar: Calendar,
};

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

  const ActiveSection = SECTION_COMPONENTS[activeSection] || Brainstorm;

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
        <ActiveSection />
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
