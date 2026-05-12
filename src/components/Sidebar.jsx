import { Settings, X, Menu } from 'lucide-react';

const NAV_ITEMS = [
  { key: 'brainstorm',  emoji: '🧠', label: 'Brainstorm' },
  { key: 'financing',   emoji: '💰', label: 'Financing & Grants' },
  { key: 'branding',    emoji: '🎨', label: 'Branding Guide' },
  { key: 'marketing',   emoji: '📣', label: 'Marketing Plan' },
  { key: 'preorder',    emoji: '🛒', label: 'Pre-Order Setup' },
  { key: 'production',  emoji: '🏭', label: 'Production Brief' },
  { key: 'pricing',     emoji: '🧮', label: 'Pricing Calculator' },
  { key: 'calendar',    emoji: '📅', label: 'Calendar & Checklist' },
];

/**
 * Progress indicator
 * 0 = empty circle (not started)
 * 0.5 = half filled (in progress)
 * 1 = checkmark (complete)
 */
function ProgressDot({ value }) {
  if (value >= 1) {
    return (
      <span className="text-success text-sm leading-none" title="Complete">
        ✓
      </span>
    );
  }
  if (value >= 0.5) {
    return (
      <span className="w-3 h-3 rounded-full border-2 border-accent bg-accent/40 inline-block" title="In progress" />
    );
  }
  return (
    <span className="w-3 h-3 rounded-full border-2 border-border inline-block" title="Not started" />
  );
}

export function Sidebar({
  activeSection,
  onSectionChange,
  sectionProgress = {},
  onSettingsOpen,
  userName,
  mobileOpen,
  onMobileClose,
}) {
  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-text-primary/30 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-60 flex flex-col
          bg-card border-r border-border
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:z-auto md:flex md:flex-shrink-0
        `}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-border">
          <div>
            <h2 className="font-display text-lg text-text-primary leading-tight">
              Brand Launchpad
            </h2>
            {userName && (
              <p className="text-xs text-text-secondary mt-0.5">
                Welcome, {userName}
              </p>
            )}
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 rounded-lg hover:bg-border/40 text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.key;
            const progress = sectionProgress[item.key] ?? 0;

            return (
              <button
                key={item.key}
                onClick={() => {
                  onSectionChange(item.key);
                  onMobileClose();
                }}
                className={`
                  w-full flex items-center gap-3 px-5 py-3 text-left
                  transition-colors duration-150 group
                  ${
                    isActive
                      ? 'bg-accent/10 text-accent border-r-2 border-accent'
                      : 'text-text-secondary hover:bg-border/30 hover:text-text-primary'
                  }
                `}
              >
                <span className="text-lg leading-none flex-shrink-0" role="img" aria-label={item.label}>
                  {item.emoji}
                </span>
                <span
                  className={`flex-1 text-sm font-medium truncate ${
                    isActive ? 'text-accent' : ''
                  }`}
                >
                  {item.label}
                </span>
                <span className="flex-shrink-0 flex items-center justify-center w-4">
                  <ProgressDot value={progress} />
                </span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-border px-5 py-4 space-y-3">
          <button
            onClick={onSettingsOpen}
            className="w-full flex items-center gap-3 py-2 px-3 rounded-xl text-text-secondary hover:bg-border/30 hover:text-text-primary transition-colors text-sm"
          >
            <Settings size={16} className="flex-shrink-0" />
            <span>Settings & API Key</span>
          </button>
          <p className="text-xs text-text-secondary/60 text-center">
            Your progress is saved locally
          </p>
        </div>
      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden fixed top-4 left-4 z-10 p-2.5 bg-card border border-border rounded-xl shadow-sm text-text-secondary hover:text-text-primary hover:bg-border/30 transition-colors"
      aria-label="Open navigation menu"
    >
      <Menu size={20} />
    </button>
  );
}
