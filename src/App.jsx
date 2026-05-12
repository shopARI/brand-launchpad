import { useState, useCallback } from 'react';
import { Sidebar, MobileMenuButton } from './components/Sidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
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

  // First-load: full-page welcome takes over — no sidebar, no app shell
  if (showOnboarding) {
    return <WelcomeScreen onComplete={handleOnboardingComplete} />;
  }

  // Render the active section, passing setActiveSection for Next Section navigation
  function renderActiveSection() {
    switch (activeSection) {
      case 'brainstorm': return <Brainstorm setActiveSection={handleSectionChange} />;
      case 'financing':  return <Financing setActiveSection={handleSectionChange} />;
      case 'pricing':    return <Pricing setActiveSection={handleSectionChange} />;
      case 'branding':   return <Branding setActiveSection={handleSectionChange} />;
      case 'marketing':  return <Marketing setActiveSection={handleSectionChange} />;
      case 'preorder':   return <PreOrder setActiveSection={handleSectionChange} />;
      case 'production': return <Production setActiveSection={handleSectionChange} />;
      case 'calendar':   return <Calendar onNavigate={handleSectionChange} setActiveSection={handleSectionChange} />;
      default:           return <Brainstorm setActiveSection={handleSectionChange} />;
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

        {/* Returning user — subtle welcome-back line */}
        {storage.user.name && (
          <p className="text-sm text-text-secondary px-6 pt-4 pb-0">
            Welcome back, {storage.user.name}.
          </p>
        )}

        {renderActiveSection()}
      </main>

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSave={handleSettingsSave}
        />
      )}
    </div>
  );
}
