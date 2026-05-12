// Section components for all 8 modules.
// Full implementations: Brainstorm (2), Financing (3), Pricing (4),
//   Branding (5), Marketing (6), PreOrder (7), Production (8).
// Calendar is a placeholder.

import { Financing as FinancingComponent } from '../components/Financing';
import { MarketingPlan } from '../components/MarketingPlan';
import PreOrderSetupFull from '../components/PreOrderSetup';
import { PricingCalculator } from '../components/PricingCalculator';

// Module 2: Brainstorm — fully implemented
export { Brainstorm } from '../components/Brainstorm';
export { BrandingGuide as Branding } from '../components/BrandingGuide';
export { ProductionBrief as Production } from '../components/ProductionBrief';

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

export function Financing() {
  return <FinancingComponent />;
}

export function Pricing() {
  return <PricingCalculator />;
}

export function Marketing({ userData, storage }) {
  return <MarketingPlan userData={userData} storage={storage} />;
}

export function PreOrder({ userData, storage }) {
  return <PreOrderSetupFull userData={userData} storage={storage} />;
}

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
