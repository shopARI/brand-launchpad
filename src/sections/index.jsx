// Section components for all 9 modules.
// Full implementations: Brainstorm (2), Financing (3), Pricing (4),
//   Branding (5), Marketing (6), PreOrder (7), Production (8), Calendar (9).

import { Financing as FinancingComponent } from '../components/Financing';
import { MarketingPlan } from '../components/MarketingPlan';
import PreOrderSetupFull from '../components/PreOrderSetup';
import { PricingCalculator } from '../components/PricingCalculator';
import { CalendarChecklist } from '../components/CalendarChecklist';

// Module 2: Brainstorm — fully implemented
export { Brainstorm } from '../components/Brainstorm';
export { BrandingGuide as Branding } from '../components/BrandingGuide';
export { ProductionBrief as Production } from '../components/ProductionBrief';

export function Financing({ setActiveSection }) {
  return <FinancingComponent setActiveSection={setActiveSection} />;
}

export function Pricing({ setActiveSection }) {
  return <PricingCalculator setActiveSection={setActiveSection} />;
}

export function Marketing({ userData, storage, setActiveSection }) {
  return <MarketingPlan userData={userData} storage={storage} setActiveSection={setActiveSection} />;
}

export function PreOrder({ userData, storage, setActiveSection }) {
  return <PreOrderSetupFull userData={userData} storage={storage} setActiveSection={setActiveSection} />;
}

export function Calendar({ onNavigate, setActiveSection }) {
  return <CalendarChecklist onNavigate={onNavigate} setActiveSection={setActiveSection} />;
}
