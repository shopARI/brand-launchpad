import { useState, useCallback } from 'react';
import NextSectionButton from './NextSectionButton';
import { ChevronDown, ChevronUp, AlertTriangle, CheckSquare, Square, BadgeCheck, Sparkles, Loader2 } from 'lucide-react';
import { getStorage, updateStorage } from '../utils/storage';
import { useAI } from '../hooks/useAI';

// ─── Brand context helper ────────────────────────────────────────────────────

function getBrandContext() {
  try {
    const data = JSON.parse(localStorage.getItem('brandLaunchpad') || '{}');
    return {
      idea: data?.brainstorm?.currentIdea || '',
      feedback: data?.brainstorm?.feedback || '',
      hasBrainstorm: !!(data?.brainstorm?.currentIdea),
      brandName: data?.branding?.name || '',
    };
  } catch {
    return { idea: '', feedback: '', hasBrainstorm: false, brandName: '' };
  }
}

const BrainstormNudge = () => (
  <div className="mb-6 px-4 py-3 rounded-xl border border-dashed border-amber-300/60 bg-amber-50/30 text-sm text-text-secondary">
    Complete <strong>Brainstorm</strong> first to personalize this section to your brand.
  </div>
);

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
          A <strong className="text-text-primary">co-packer</strong> (contract manufacturer) produces your beverage under your brand — they supply equipment, labour, and often raw ingredients.
        </p>
        <div>
          <p className="font-semibold text-text-primary mb-1">Find one in Canada</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Canadian Beverage Association — member directory at <span className="font-mono text-accent">canadianbeverage.ca</span></li>
            <li>Beverage Trade Network — searchable supplier database</li>
            <li>Ask provincial liquor board contacts for referrals</li>
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
          <p className="font-semibold text-text-primary mb-1">Questions to ask</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Do you hold a federal excise licence?</li>
            <li>What is your MOQ and lead time?</li>
            <li>Can you help with recipe development?</li>
            <li>What certifications do you hold (HACCP, SQF)?</li>
            <li>What packaging formats do you support?</li>
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
            <p>Required to manufacture or import beverage alcohol. Apply through the Canada Revenue Agency. Expect 4–8 weeks processing.</p>
          </div>
          <div className="border-l-2 border-warning pl-3">
            <p className="font-semibold text-text-primary">Provincial Liquor Boards</p>
            <ul className="list-disc list-inside space-y-0.5 mt-1">
              <li><strong>Ontario:</strong> LCBO — Artisan & Small Batch program available</li>
              <li><strong>Quebec:</strong> SAQ — permit required for any retail listing</li>
              <li><strong>BC:</strong> BCLDB — BC VQA or import registration</li>
              <li><strong>Alberta:</strong> AGLC — consignment or retail import model</li>
            </ul>
          </div>
          <div className="border-l-2 border-border pl-3">
            <p className="font-semibold text-text-primary">Label Requirements</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Bilingual (English + French) product name and net quantity</li>
              <li>Alcohol % by volume (ABV)</li>
              <li>Allergen declarations (sulphites, milk, wheat)</li>
            </ul>
          </div>
        </div>
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-3 flex gap-2">
          <AlertTriangle size={16} className="text-warning flex-shrink-0 mt-0.5" />
          <p className="text-xs">
            <strong className="text-text-primary">Timeline:</strong> Allow 3–12 months from licence application to first retail sale.
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
        <div className="space-y-2">
          <div className="bg-background rounded-xl p-3 border border-border">
            <p className="font-medium text-text-primary text-xs mb-0.5">DIY with a Food Scientist</p>
            <p className="text-xs">Hire a freelance food scientist or flavourist. Cost: $1,000–$5,000+.</p>
          </div>
          <div className="bg-background rounded-xl p-3 border border-border">
            <p className="font-medium text-text-primary text-xs mb-0.5">Co-Packer R&D</p>
            <p className="text-xs">Many co-packers offer in-house development. Fastest path. Cost: $500–$3,000, often refunded against first run.</p>
          </div>
          <div className="bg-background rounded-xl p-3 border border-border">
            <p className="font-medium text-text-primary text-xs mb-0.5">Beverage Consultant</p>
            <p className="text-xs">End-to-end recipe, sourcing, and compliance. Cost: $2,000–$10,000+.</p>
          </div>
        </div>
        <ul className="list-disc list-inside space-y-1">
          <li>Taste testing with target customers before finalizing</li>
          <li>Shelf stability testing (at least 6 months for retail)</li>
          <li>Nutritional analysis required for Canadian labels</li>
          <li>Ingredient cost modelling — does it hit your COGS target?</li>
        </ul>
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
            <p className="text-xs">Best for RTD cocktails, hard seltzers, sparkling beverages. Lowest per-unit shipping cost. MOQ typically 5,000+.</p>
          </div>
          <div className="bg-background rounded-xl p-3 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">🍾</span>
              <p className="font-semibold text-text-primary text-xs">Glass Bottles</p>
            </div>
            <p className="text-xs">Premium positioning. Higher shipping cost. Better for spirits, wines, premium mixers. MOQ 500–1,000+.</p>
          </div>
          <div className="bg-background rounded-xl p-3 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">🧃</span>
              <p className="font-semibold text-text-primary text-xs">Bag-in-Box</p>
            </div>
            <p className="text-xs">Ideal for wine, sangria, cocktail mixes. Eco-friendly, low shipping weight. Popular for events.</p>
          </div>
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
            <p>Sell directly through your website. Check your province's alcohol shipping laws — BC and Manitoba are most permissive.</p>
          </div>
          <div className="border-l-2 border-border pl-3">
            <p className="font-semibold text-text-primary">Retail — Provincial Liquor Boards</p>
            <p>LCBO, SAQ, BCLDB, AGLC. Competitive listing process, 6–18 months. High volume once listed.</p>
          </div>
          <div className="border-l-2 border-border pl-3">
            <p className="font-semibold text-text-primary">Farmers Markets & Events</p>
            <p>Excellent for early traction and feedback. Low cost, great for word-of-mouth. Requires a temporary event permit.</p>
          </div>
        </div>
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
          <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">💡 Early Stage Recommendation</p>
          <p className="text-sm text-text-primary font-medium">
            Start DTC online + farmers markets/events. Add retail when you have traction. Provincial listing is a long-term play, not a launch strategy.
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

const PERSONALIZE_SYSTEM_PROMPT = `You are a Canadian beverage production expert. Given the user's brand concept, rewrite these 5 production topics specifically for their product type.

Return ONLY valid JSON in this exact structure:
{
  "cards": [
    {
      "id": "copacking",
      "personalized_intro": "For a [their specific type] like yours...",
      "key_facts": ["fact1 specific to their product", "fact2", "fact3"],
      "estimated_cost": "$X–$Y per unit (typical for their category)",
      "recommended_first_step": "Concrete first action for their product type"
    },
    {
      "id": "licensing",
      "personalized_intro": "For a [their specific product]...",
      "key_facts": ["key regulation fact 1", "key regulation fact 2", "key regulation fact 3"],
      "estimated_cost": "Timeline: X–Y months",
      "recommended_first_step": "First licensing action"
    },
    {
      "id": "recipe",
      "personalized_intro": "For a [their specific product]...",
      "key_facts": ["R&D consideration 1", "consideration 2", "consideration 3"],
      "estimated_cost": "$X–$Y for recipe development",
      "recommended_first_step": "First R&D action"
    },
    {
      "id": "packaging",
      "personalized_intro": "For a [their specific product]...",
      "key_facts": ["best packaging format for their product", "MOQ note", "cost note"],
      "estimated_cost": "$X–$Y per unit for packaging",
      "recommended_first_step": "First packaging action"
    },
    {
      "id": "distribution",
      "personalized_intro": "For a [their specific product]...",
      "key_facts": ["best early channel for their product", "distribution note", "provincial note"],
      "estimated_cost": "Channel cost range",
      "recommended_first_step": "First distribution action"
    }
  ]
}

Be specific to their product type, Canadian co-packers, Canadian regulations, and Canadian distribution channels. No generic advice.`;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PersonalizedIntro({ cardId, personalized }) {
  if (!personalized) return null;
  const card = personalized.find((c) => c.id === cardId);
  if (!card) return null;

  return (
    <div className="mb-4 p-3 rounded-xl bg-accent/5 border border-accent/20 space-y-2">
      <p className="text-sm text-accent font-medium italic">{card.personalized_intro}</p>
      {card.key_facts && card.key_facts.length > 0 && (
        <ul className="space-y-1">
          {card.key_facts.map((fact, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-text-primary">
              <span className="text-accent mt-0.5 flex-shrink-0">✦</span>
              {fact}
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-4 text-xs text-text-secondary pt-1">
        {card.estimated_cost && (
          <span>💰 {card.estimated_cost}</span>
        )}
        {card.recommended_first_step && (
          <span className="text-accent font-medium">👉 {card.recommended_first_step}</span>
        )}
      </div>
    </div>
  );
}

function ExpandableCard({ card, defaultOpen = false, personalized }) {
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
        {personalized?.find((c) => c.id === card.id) && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 mr-2">Personalized</span>
        )}
        {open
          ? <ChevronUp size={18} className="text-text-secondary flex-shrink-0" />
          : <ChevronDown size={18} className="text-text-secondary flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 bg-card border-t border-border">
          <PersonalizedIntro cardId={card.id} personalized={personalized} />
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

export function ProductionBrief({ setActiveSection }) {
  const [checklistState, setChecklistState] = useState(() => {
    const prod = getStorage().production || {};
    return prod.checklist || {};
  });
  const [reviewed, setReviewed] = useState(() => {
    const prod = getStorage().production || {};
    return prod.reviewed || false;
  });
  const [personalizedCards, setPersonalizedCards] = useState(null);

  const { callAI, loading: aiLoading, error: aiError } = useAI();

  const { hasBrainstorm, idea, brandName } = getBrandContext();

  const handlePersonalize = useCallback(async () => {
    if (!idea) return;
    const raw = await callAI(
      PERSONALIZE_SYSTEM_PROMPT,
      `Brand concept: ${idea}\nBrand name: ${brandName || 'TBD'}\n\nPersonalize all 5 production topics for this specific brand. Return ONLY valid JSON, no markdown fences.`
    );
    if (!raw) return;
    try {
      const clean = raw.replace(/```json\n?|```\n?/g, '').trim();
      const parsed = JSON.parse(clean);
      if (parsed.cards && Array.isArray(parsed.cards)) {
        setPersonalizedCards(parsed.cards);
      }
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          if (parsed.cards) setPersonalizedCards(parsed.cards);
        } catch {
          // silently fail — original content still shows
        }
      }
    }
  }, [callAI, idea, brandName]);

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
          Reference only — focus on pre-orders first.
        </p>
      </div>

      {!hasBrainstorm && <BrainstormNudge />}

      {/* TOP BANNER */}
      <div className="flex gap-3 bg-warning/10 border border-warning/40 rounded-xl p-4 mb-8">
        <AlertTriangle size={18} className="text-warning flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-text-secondary">
          <strong className="text-text-primary">Reference only.</strong> Validate with pre-orders before investing in production.
        </p>
      </div>

      {/* Personalize Button */}
      {hasBrainstorm && (
        <div className="mb-8 p-5 bg-accent/5 border border-accent/20 rounded-2xl">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-semibold text-text-primary mb-1">Personalize for My Brand</h3>
              <p className="text-sm text-text-secondary">
                Rewrite all 5 cards for your specific beverage type using AI.
              </p>
            </div>
            <button
              onClick={handlePersonalize}
              disabled={aiLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              {aiLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Personalizing...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  {personalizedCards ? 'Regenerate' : 'Personalize for My Brand'}
                </>
              )}
            </button>
          </div>
          {aiError && (
            <p className="mt-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
              {aiError}
            </p>
          )}
          {personalizedCards && (
            <p className="mt-3 text-xs text-success flex items-center gap-1">
              ✓ Cards personalized for your brand — expand each card to see your tailored insights.
            </p>
          )}
        </div>
      )}

      {/* SECTION 1 — What You'll Need */}
      <section className="mb-10">
        <h2 className="font-display text-xl text-text-primary mb-1">What You'll Need</h2>
        <p className="text-sm text-text-secondary mb-5">
          Expand each topic for the essentials.
        </p>
        <div className="space-y-3">
          {EXPANDABLE_CARDS.map((card, index) => (
            <ExpandableCard
              key={card.id}
              card={card}
              defaultOpen={index === 0}
              personalized={personalizedCards}
            />
          ))}
        </div>
      </section>

      {/* SECTION 2 — Production Checklist */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-xl text-text-primary">Production Checklist</h2>
          <span className="text-sm text-text-secondary">
            {checkedCount}/{CHECKLIST_ITEMS.length} checked
          </span>
        </div>
        <p className="text-sm text-text-secondary mb-5">
          Check off when you're ready to move into production.
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

      {/* Mark as Reviewed */}
      <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-6 py-5">
        <div>
          <p className="font-semibold text-text-primary">
            {reviewed ? 'Section reviewed ✓' : 'Mark as reviewed'}
          </p>
          <p className="text-sm text-text-secondary mt-0.5">
            {reviewed
              ? 'Come back when you have pre-order traction.'
              : "Confirm you've read through the production brief."}
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
      <NextSectionButton
        nextSection="pricing"
        nextLabel="Pricing Calculator"
        setActiveSection={setActiveSection}
      />
    </div>
  );
}
