// Placeholder section components for all 8 modules
// These will be replaced with full implementations in Modules 2-9

function PlaceholderSection({ emoji, title, description, module }) {
  return (
    <div className="max-w-2xl mx-auto py-16 px-6 text-center">
      <div className="text-6xl mb-6" role="img" aria-label={title}>
        {emoji}
      </div>
      <h1 className="font-display text-4xl text-text-primary mb-4">{title}</h1>
      <p className="text-text-secondary text-lg mb-8">{description}</p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
        <span>Module {module}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-accent/40 animate-pulse" />
        <span>Coming soon</span>
      </div>
    </div>
  );
}

export function Brainstorm({ userData }) {
  return (
    <div className="max-w-2xl mx-auto py-16 px-6">
      <div className="text-center mb-12">
        <div className="text-6xl mb-6" role="img" aria-label="Brainstorm">🧠</div>
        <h1 className="font-display text-4xl text-text-primary mb-4">Brainstorm</h1>
        <p className="text-text-secondary text-lg">
          Explore and refine your beverage brand concept with AI guidance.
        </p>
      </div>
      {userData?.brandIdea && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <p className="text-sm text-text-secondary mb-2 font-medium">Your initial idea:</p>
          <p className="text-text-primary">{userData.brandIdea}</p>
        </div>
      )}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
        <span>Module 1</span>
        <span className="w-1.5 h-1.5 rounded-full bg-accent/40 animate-pulse" />
        <span>Full implementation coming in Module 2</span>
      </div>
    </div>
  );
}

export function Financing() {
  return (
    <PlaceholderSection
      emoji="💰"
      title="Financing & Grants"
      description="Discover funding opportunities, grants, and financing strategies for your beverage brand."
      module={2}
    />
  );
}

export function Pricing() {
  return (
    <PlaceholderSection
      emoji="🧮"
      title="Pricing Calculator"
      description="Calculate COGS, set pricing tiers, and model your margins with precision."
      module={3}
    />
  );
}

export function Branding() {
  return (
    <PlaceholderSection
      emoji="🎨"
      title="Branding Guide"
      description="Define your brand identity, tone of voice, color palette, and visual direction."
      module={4}
    />
  );
}

export function Marketing() {
  return (
    <PlaceholderSection
      emoji="📣"
      title="Marketing Plan"
      description="Build a comprehensive go-to-market strategy with AI-generated content and campaigns."
      module={5}
    />
  );
}

export function PreOrder() {
  return (
    <PlaceholderSection
      emoji="🛒"
      title="Pre-Order Setup"
      description="Configure your pre-order strategy, platform selection, and launch checklist."
      module={6}
    />
  );
}

export { ProductionBrief as Production } from '../components/ProductionBrief';

export function Calendar() {
  return (
    <PlaceholderSection
      emoji="📅"
      title="Calendar & Checklist"
      description="Track your launch timeline, milestones, and key tasks in one place."
      module={8}
    />
  );
}
