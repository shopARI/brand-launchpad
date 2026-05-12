import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, CheckSquare, Square, BadgeCheck } from 'lucide-react';
import { getStorage, updateStorage } from '../utils/storage';

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const EXPANDABLE_CARDS = [
  {
    id: 'copacking',
    emoji: '🏭',
    title: 'Co-Packing',
    content: (
      <div className="space-y-4 text-sm text-text-secondary">
        <p>
          A <strong className="text-text-primary">co-packer</strong> (contract manufacturer) produces your beverage under your brand. They supply equipment, labour, and often raw ingredients — you supply the recipe and spec.
        </p>

        <div>
          <p className="font-semibold text-text-primary mb-1">How to find one in Canada</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Canadian Beverage Association — member directory at <span className="font-mono text-accent">canadianbeverage.ca</span></li>
            <li>Beverage Trade Network — searchable supplier database</li>
            <li>Ask provincial liquor board contacts for referrals</li>
            <li>Attend trade shows (e.g., Grocery Innovations Canada)</li>
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background rounded-xl p-3 border border-border">
            <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">MOQ Range</p>
            <p className="font-semibold text-text-primary">500 – 5,000 units</p>
          </div>
          <div className="bg-background rounded-xl p-3 border border-border">
            <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">Cost Per Unit</p>
            <p className="font-semibold text-text-primary">$2 – $8 CAD</p>
          </div>
        </div>

        <div>
          <p className="font-semibold text-text-primary mb-1">Questions to ask a co-packer</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Do you hold a federal excise licence for beverage alcohol?</li>
            <li>What is your minimum order quantity and lead time?</li>
            <li>Can you help with recipe development or do I need my own formulation?</li>
            <li>What certifications do you hold (HACCP, SQF, kosher, organic)?</li>
            <li>What packaging formats do you support (cans, glass, Tetra)?</li>
            <li>Do you provide nutritional analysis and shelf-stability testing?</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'licensing',
    emoji: '📋',
    title: 'Licensing & Regulations (Canada)',
    content: (
      <div className="space-y-4 text-sm text-text-secondary">
        <p>
          Selling alcohol in Canada involves <strong className="text-text-primary">three layers of regulation</strong>. Start early — timelines are long.
        </p>

        <div className="space-y-3">
          <div className="border-l-2 border-accent pl-3">
            <p className="font-semibold text-text-primary">Federal — CRA Excise Licence</p>
            <p>Required to manufacture or import beverage alcohol. Apply through the Canada Revenue Agency. Expect 4–8 weeks processing. Tied to your business registration.</p>
          </div>

          <div className="border-l-2 border-warning pl-3">
            <p className="font-semibold text-text-primary">Provincial Liquor Boards</p>
            <ul className="list-disc list-inside space-y-0.5 mt-1">
              <li><strong>Ontario:</strong> LCBO — Artisan & Small Batch program available</li>
              <li><strong>Quebec:</strong> SAQ — permit required for any retail listing</li>
              <li><strong>BC:</strong> BCLDB — BC VQA or import registration</li>
              <li><strong>Alberta:</strong> AGLC — consignment or retail import model</li>
            </ul>
            <p className="mt-1 text-xs">Each province has its own listing process, fees, and product approval requirements.</p>
          </div>

          <div className="border-l-2 border-border pl-3">
            <p className="font-semibold text-text-primary">Municipal</p>
            <p>Business licence + health and safety inspections if operating your own space. Check with your local municipality.</p>
          </div>
        </div>

        <div>
          <p className="font-semibold text-text-primary mb-1">Label Requirements (Federal)</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Bilingual (English + French) product name and net quantity</li>
            <li>Alcohol % by volume (ABV)</li>
            <li>Standard drink information per container</li>
            <li>Allergen declarations (e.g., sulphites, milk, wheat)</li>
            <li>Country of origin and producer address</li>
          </ul>
        </div>

        <div className="bg-warning/10 border border-warning/30 rounded-xl p-3 flex gap-2">
          <AlertTriangle size={16} className="text-warning flex-shrink-0 mt-0.5" />
          <p className="text-xs">
            <strong className="text-text-primary">Timeline:</strong> Allow 3–12 months from licence application to first retail sale. Apply for federal excise first — provincial listings typically require it.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'recipe',
    emoji: '🧪',
    title: 'Recipe Development',
    content: (
      <div className="space-y-4 text-sm text-text-secondary">
        <p>
          Your recipe must be consistent, shelf-stable, and scalable before handing it to a co-packer.
        </p>

        <div className="space-y-3">
          <div>
            <p className="font-semibold text-text-primary mb-1">Development Options</p>
            <div className="space-y-2">
              <div className="bg-background rounded-xl p-3 border border-border">
                <p className="font-medium text-text-primary text-xs mb-0.5">DIY with a Food Scientist</p>
                <p className="text-xs">Hire a freelance food scientist or flavourist. Good for innovation but slower. Cost: $1,000–$5,000+.</p>
              </div>
              <div className="bg-background rounded-xl p-3 border border-border">
                <p className="font-medium text-text-primary text-xs mb-0.5">Co-Packer R&D</p>
                <p className="text-xs">Many co-packers offer in-house recipe development. Fastest path to production. Cost: $500–$3,000. Often refunded against first run.</p>
              </div>
              <div className="bg-background rounded-xl p-3 border border-border">
                <p className="font-medium text-text-primary text-xs mb-0.5">Beverage Consultant</p>
                <p className="text-xs">End-to-end recipe, sourcing, and compliance guidance. Highest cost ($2,000–$10,000+) but lowest hands-on effort for founders.</p>
              </div>
            </div>
          </div>

          <div>
            <p className="font-semibold text-text-primary mb-1">Key Considerations</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Taste testing with target customers before finalising</li>
              <li>Shelf stability testing (at least 6 months for retail)</li>
              <li>Nutritional analysis required for Canadian labels</li>
              <li>Ingredient cost modelling — does the recipe hit your COGS target?</li>
              <li>Seasonal ingredient availability and supplier redundancy</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'packaging',
    emoji: '📦',
    title: 'Packaging Options',
    content: (
      <div className="space-y-4 text-sm text-text-secondary">
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-background rounded-xl p-3 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">🥤</span>
              <p className="font-semibold text-text-primary text-xs">Cans (Aluminum)</p>
            </div>
            <p className="text-xs">Best for RTD (ready-to-drink) cocktails, hard seltzers, sparkling beverages. Lowest per-unit shipping cost. MOQ typically 5,000+. Light-block protects flavour.</p>
          </div>
          <div className="bg-background rounded-xl p-3 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">🍾</span>
              <p className="font-semibold text-text-primary text-xs">Glass Bottles</p>
            </div>
            <p className="text-xs">Premium positioning. Higher shipping cost (weight + fragility). Better for spirits, wines, and premium mixers. MOQ 500–1,000+.</p>
          </div>
          <div className="bg-background rounded-xl p-3 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">🧃</span>
              <p className="font-semibold text-text-primary text-xs">Bag-in-Box</p>
            </div>
            <p className="text-xs">Ideal for wine, sangria, cocktail mixes. Eco-friendly, low shipping weight. Popular for events and catering. Less premium perception.</p>
          </div>
        </div>

        <div>
          <p className="font-semibold text-text-primary mb-1">Label Types</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Pressure-sensitive (adhesive):</strong> most flexible, short runs OK, $0.15–$0.60/label</li>
            <li><strong>Shrink sleeve:</strong> 360° coverage, premium look, needs specialized equipment, $0.30–$0.80/label</li>
            <li><strong>Printed directly on can:</strong> best brand presence, high MOQ (50K+), lowest cost at scale</li>
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background rounded-xl p-3 border border-border">
            <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">Label Cost Range</p>
            <p className="font-semibold text-text-primary">$0.30 – $2.00/unit</p>
          </div>
          <div className="bg-background rounded-xl p-3 border border-border">
            <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">Total Packaging</p>
            <p className="font-semibold text-text-primary">$1.00 – $4.00/unit</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'distribution',
    emoji: '🚚',
    title: 'Distribution',
    content: (
      <div className="space-y-4 text-sm text-text-secondary">
        <div className="space-y-3">
          <div className="border-l-2 border-accent pl-3">
            <p className="font-semibold text-text-primary">DTC Online</p>
            <p>Sell directly through your website. Simplest to set up. <strong className="text-text-primary">Check your province's alcohol shipping laws</strong> — rules vary significantly. BC and Manitoba are most permissive; Ontario allows some direct shipping.</p>
          </div>

          <div className="border-l-2 border-border pl-3">
            <p className="font-semibold text-text-primary">Retail — Provincial Liquor Boards</p>
            <p>LCBO, SAQ, BCLDB, AGLC. Competitive listing process, slow (6–18 months), but high volume once listed. Requires excise licence and provincial registration first.</p>
          </div>

          <div className="border-l-2 border-border pl-3">
            <p className="font-semibold text-text-primary">On-Premise (Bars & Restaurants)</p>
            <p>Typically requires a licensed distributor. Higher margin per case than retail but requires relationship-building and sales effort. Better once your brand has proven retail traction.</p>
          </div>

          <div className="border-l-2 border-border pl-3">
            <p className="font-semibold text-text-primary">Farmers Markets & Events</p>
            <p>Excellent for early traction and feedback. Requires a temporary event permit in most provinces. Low cost to test, great for word-of-mouth.</p>
          </div>
        </div>

        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
          <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">💡 Recommendation for Early Stage</p>
          <p className="text-sm text-text-primary font-medium">
            Start DTC online + farmers markets/events. Add retail when you have traction and proof of demand. Provincial listing is a long-term play, not a launch strategy.
          </p>
        </div>
      </div>
    ),
  },
];

const CHECKLIST_ITEMS = [
  { id: 'research_copackers', label: 'Research co-packers in your region' },
  { id: 'get_quotes', label: 'Get at least 3 quotes from co-packers' },
  { id: 'develop_recipe', label: 'Develop your recipe (DIY or with co-packer R&D)' },
  { id: 'taste_tests', label: 'Run taste tests with target customers' },
  { id: 'finalize_recipe', label: 'Finalize recipe with co-packer' },
  { id: 'design_packaging', label: 'Design packaging and labels (bilingual, compliant)' },
  { id: 'apply_excise', label: 'Apply for federal excise licence (CRA)' },
  { id: 'apply_provincial', label: 'Apply for provincial listing (LCBO/SAQ/BCLDB/AGLC)' },
  { id: 'order_first_run', label: 'Order first production run' },
  { id: 'setup_fulfillment', label: 'Set up fulfillment and shipping' },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ExpandableCard({ card, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-card hover:bg-background transition-colors text-left"
        aria-expanded={open}
      >
        <span className="text-xl leading-none flex-shrink-0" role="img" aria-label={card.title}>
          {card.emoji}
        </span>
        <span className="flex-1 font-semibold text-text-primary">{card.title}</span>
        {open
          ? <ChevronUp size={18} className="text-text-secondary flex-shrink-0" />
          : <ChevronDown size={18} className="text-text-secondary flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 bg-card border-t border-border">
          {card.content}
        </div>
      )}
    </div>
  );
}

function ChecklistItem({ item, checked, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-start gap-3 py-3 px-4 rounded-xl hover:bg-background transition-colors text-left group"
      aria-checked={checked}
      role="checkbox"
    >
      {checked
        ? <CheckSquare size={18} className="text-success flex-shrink-0 mt-0.5" />
        : <Square size={18} className="text-border group-hover:text-text-secondary flex-shrink-0 mt-0.5 transition-colors" />}
      <span className={`text-sm ${checked ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
        {item.label}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ProductionBrief() {
  const [checklistState, setChecklistState] = useState(() => {
    const prod = getStorage().production || {};
    return prod.checklist || {};
  });
  const [reviewed, setReviewed] = useState(() => {
    const prod = getStorage().production || {};
    return prod.reviewed || false;
  });

  // Persist checklist item toggle
  const handleChecklistToggle = useCallback((id) => {
    setChecklistState((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      updateStorage((s) => ({
        ...s,
        production: { ...s.production, checklist: next },
      }));
      return next;
    });
  }, []);

  // Mark as Reviewed
  const handleMarkReviewed = useCallback(() => {
    setReviewed(true);
    updateStorage((s) => ({
      ...s,
      production: { ...s.production, reviewed: true },
      sectionProgress: { ...s.sectionProgress, production: 1 },
    }));
  }, []);

  const checkedCount = CHECKLIST_ITEMS.filter((i) => checklistState[i.id]).length;

  return (
    <div className="max-w-3xl mx-auto py-10 px-6 pb-20">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl" role="img" aria-label="Production">🏭</span>
          <h1 className="font-display text-3xl text-text-primary">Production Brief</h1>
        </div>
        <p className="text-text-secondary">
          Everything you need to know about bringing your beverage to production — for when you're ready.
        </p>
      </div>

      {/* TOP BANNER — reference only */}
      <div className="flex gap-3 bg-warning/10 border border-warning/40 rounded-2xl p-5 mb-10">
        <AlertTriangle size={22} className="text-warning flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="font-semibold text-text-primary mb-1">This section is for reference only.</p>
          <p className="text-sm text-text-secondary">
            Focus on validating your brand with pre-orders before investing in production. Come back here when you have traction.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SECTION 1 — What You'll Need                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="mb-10">
        <h2 className="font-display text-xl text-text-primary mb-1">What You'll Need</h2>
        <p className="text-sm text-text-secondary mb-5">
          Expand each topic to learn the essentials. These are reference notes — not immediate action items.
        </p>
        <div className="space-y-3">
          {EXPANDABLE_CARDS.map((card, index) => (
            <ExpandableCard key={card.id} card={card} defaultOpen={index === 0} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* SECTION 2 — Production Checklist                                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-xl text-text-primary">Production Checklist</h2>
          <span className="text-sm text-text-secondary">
            {checkedCount}/{CHECKLIST_ITEMS.length} checked
          </span>
        </div>
        <p className="text-sm text-text-secondary mb-5">
          Reference checklist for when you're ready to move into production. Check off items as you complete them.
        </p>
        <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
          {CHECKLIST_ITEMS.map((item) => (
            <ChecklistItem
              key={item.id}
              item={item}
              checked={!!checklistState[item.id]}
              onToggle={() => handleChecklistToggle(item.id)}
            />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Mark as Reviewed                                                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-6 py-5">
        <div>
          <p className="font-semibold text-text-primary">
            {reviewed ? 'Section reviewed ✓' : 'Mark this section as reviewed'}
          </p>
          <p className="text-sm text-text-secondary mt-0.5">
            {reviewed
              ? 'Come back when you have pre-order traction and are ready to start production.'
              : "Confirm you've read through the production brief. You can return anytime."}
          </p>
        </div>
        {reviewed ? (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium flex-shrink-0">
            <BadgeCheck size={16} />
            <span>Reviewed</span>
          </div>
        ) : (
          <button
            onClick={handleMarkReviewed}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors flex-shrink-0"
          >
            <BadgeCheck size={16} />
            <span>Mark Reviewed</span>
          </button>
        )}
      </div>
    </div>
  );
}
