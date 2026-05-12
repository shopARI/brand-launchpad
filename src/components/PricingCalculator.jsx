import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import NextSectionButton from './NextSectionButton';
import { Save } from 'lucide-react';
import { updateStorage, getStorage } from '../utils/storage';

// ─── Brand context from localStorage ─────────────────────────────────────────
function getBrandContext() {
  try {
    const data = getStorage();
    return {
      idea: data?.brainstorm?.currentIdea || '',
      feedback: data?.brainstorm?.feedback || '',
      hasBrainstorm: !!(data?.brainstorm?.currentIdea),
      brandName: data?.branding?.name || '',
      costBreakdown: data?.financing?.costBreakdown || null,
      marketingBatches: [data?.marketing?.batch1, data?.marketing?.batch2, data?.marketing?.batch3].filter(Boolean).length,
      preorderPlatform: data?.preorder?.platform || '',
      productionChecklist: data?.production?.checklist || null,
    };
  } catch {
    return { idea: '', feedback: '', hasBrainstorm: false, brandName: '', costBreakdown: null, marketingBatches: 0, preorderPlatform: '', productionChecklist: null };
  }
}

// ─── Auto-detect category from brand text ────────────────────────────────────
function detectCategory(text) {
  if (!text) return null;
  const t = text.toLowerCase();
  if (/rtd|canned cocktail|hard tea|hard lemonade|ready.to.drink/.test(t)) return 'canned-cocktail';
  if (/hard seltzer|seltzer/.test(t)) return 'hard-seltzer';
  if (/spirit|gin|whisky|whiskey|vodka|rum|tequila|mezcal/.test(t)) return 'spirit';
  if (/wine|rosé|rose|sparkling|prosecco|cider/.test(t)) return 'wine';
  if (/beer|lager|ale|ipa|stout|craft beer/.test(t)) return 'beer';
  if (/non.alc|non-alc|kombucha|jun|kefir|juice|soda|water|energy/.test(t)) return 'non-alc';
  return null;
}

// ─── Parse competitor names from feedback ────────────────────────────────────
function parseCompetitors(feedback) {
  if (!feedback) return [];
  // Match capitalized brand-like names near $ prices
  const competitors = [];
  const lines = feedback.split('\n');
  for (const line of lines) {
    if (/competitor|compet|direct|brand|similar|rival|\$\d/i.test(line)) {
      // Extract capitalized brand-like words (2+ capital words)
      const brandMatches = line.match(/\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\b/g) || [];
      for (const m of brandMatches) {
        if (m.length > 3 && !['The','This','They','Your','When','What','Who','For','With','From','That','These','Their','Canadian','Canada'].includes(m)) {
          competitors.push(m);
        }
      }
    }
  }
  return [...new Set(competitors)].slice(0, 3);
}

// ─── Term definitions ─────────────────────────────────────────────────────────
const TERMS = [
  {
    id: 'cogs',
    emoji: '💰',
    term: 'COGS',
    shortDef: 'Cost of Goods Sold. What it costs YOU to make one unit.',
    fullExplanation: [
      { type: 'body', text: 'COGS is the total direct cost to produce one unit: ingredients, packaging, co-packing fees, and inbound shipping.' },
      { type: 'body', text: 'If COGS is too high you can\'t profit even at a high retail price. Target 20–30% of retail for beverages.' },
    ],
  },
  {
    id: 'cac',
    emoji: '📣',
    term: 'CAC',
    shortDef: 'Customer Acquisition Cost. How much you spend to get ONE customer.',
    fullExplanation: [
      { type: 'body', text: 'CAC = Total Marketing Spend ÷ New Customers acquired. Tells you whether your marketing is efficient.' },
      { type: 'body', text: 'If a customer buys 2× per year and CAC < one unit\'s margin, you\'re profitable on acquisition.' },
    ],
  },
  {
    id: 'gross-margin',
    emoji: '📊',
    term: 'Gross Margin',
    shortDef: 'Revenue minus COGS. Money left after making the product.',
    fullExplanation: [
      { type: 'body', text: 'Gross Margin % = (Revenue – COGS) ÷ Revenue × 100. Beverage brands typically target 60–75%.' },
      { type: 'body', text: 'Higher gross margin = more room for marketing, overhead, and profit.' },
    ],
  },
  {
    id: 'net-margin',
    emoji: '💵',
    term: 'Net Margin',
    shortDef: 'What you actually keep after ALL expenses.',
    fullExplanation: [
      { type: 'body', text: 'Net Profit ÷ Revenue × 100. Subtracts COGS, marketing, salaries, rent, and every other cost.' },
      { type: 'body', text: 'Early-stage brands often run negative net margins — scaling fixed costs over more units drives it positive.' },
    ],
  },
  {
    id: 'wholesale-price',
    emoji: '🏪',
    term: 'Wholesale Price',
    shortDef: 'What you charge stores/distributors. Usually 50% of retail.',
    fullExplanation: [
      { type: 'body', text: 'Wholesale is typically 50% of retail, giving the retailer a 50% margin to mark up to shelf price.' },
      { type: 'body', text: 'DTC sales capture full retail margin — far more valuable per unit than wholesale channels.' },
    ],
  },
  {
    id: 'retail-price',
    emoji: '🏷️',
    term: 'Retail Price',
    shortDef: 'What the customer pays in store or online.',
    fullExplanation: [
      { type: 'body', text: 'Retail Price (MSRP) is the consumer-facing price. Research competitors and work backwards from your target margins.' },
      { type: 'body', text: 'Price signals quality — too low can undermine premium positioning even if the margin math still works.' },
    ],
  },
  {
    id: 'tam',
    emoji: '🌍',
    term: 'Market Size (TAM)',
    shortDef: 'Total revenue available if you captured 100% of your category.',
    fullExplanation: [
      { type: 'body', text: 'TAM = total revenue if you owned the whole market. Even 0.5% of a $500M category is a real business.' },
      { type: 'body', text: 'Investors need TAM to know the ceiling. Show your realistic SAM (serviceable addressable market) too.' },
    ],
  },
  {
    id: 'contribution-margin',
    emoji: '📈',
    term: 'Contribution Margin',
    shortDef: 'Revenue minus variable costs per unit.',
    fullExplanation: [
      { type: 'body', text: 'Revenue per unit – all variable costs (COGS + commissions + payment fees). Each unit "contributes" this toward fixed costs.' },
      { type: 'body', text: 'Once cumulative contribution margin covers all fixed costs, every additional unit is profit.' },
    ],
  },
  {
    id: 'break-even',
    emoji: '⚖️',
    term: 'Break-Even Point',
    shortDef: 'How many units to sell before you stop losing money.',
    fullExplanation: [
      { type: 'body', text: 'Break-Even = Fixed Costs ÷ Contribution Margin per unit. Sell above this number each month and you\'re operationally profitable.' },
      { type: 'body', text: 'Lower your fixed costs or raise your contribution margin to bring break-even within reach faster.' },
    ],
  },
  {
    id: 'moq',
    emoji: '📦',
    term: 'MOQ',
    shortDef: 'Minimum Order Quantity. Smallest batch a manufacturer will produce.',
    fullExplanation: [
      { type: 'body', text: 'MOQ is the smallest production run a co-packer will accept. Setup costs — filling lines, labeling — apply regardless of batch size.' },
      { type: 'body', text: 'Typical beverage MOQ: 5,000–10,000 units. Pre-orders help you fund and justify hitting MOQ.' },
    ],
  },
];

// ─── Category price ranges ────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'canned-cocktail', label: 'Canned Cocktail', range: '$3.50–$5.50 / can', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { value: 'spirit', label: 'Spirit', range: '$35–$65 / bottle', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { value: 'wine', label: 'Wine', range: '$12–$25 / bottle', color: 'text-red-600 bg-red-50 border-red-200' },
  { value: 'beer', label: 'Beer 6-pack', range: '$12–$18 / 6-pack', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  { value: 'hard-seltzer', label: 'Hard Seltzer', range: '$2.50–$4.00 / can', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { value: 'non-alc', label: 'Non-Alcoholic', range: '$3.00–$6.00 / unit', color: 'text-green-600 bg-green-50 border-green-200' },
  { value: 'other', label: 'Other', range: 'Varies by product', color: 'text-text-secondary bg-background border-border' },
];

const TERM_DEFS = Object.fromEntries(TERMS.map(t => [t.id, t.shortDef]));

const TOOLTIP_MAP = {
  'COGS': TERM_DEFS['cogs'],
  'CAC': TERM_DEFS['cac'],
  'Gross Margin': TERM_DEFS['gross-margin'],
  'Gross Profit': 'Revenue minus COGS per unit. Money left after producing the product.',
  'Net Profit': 'What you actually keep after ALL expenses — COGS and fixed overhead.',
  'Wholesale Price': TERM_DEFS['wholesale-price'],
  'Retail Price': TERM_DEFS['retail-price'],
  'Blended': 'Weighted average across your retail/wholesale sales channel split.',
  'Break-Even': TERM_DEFS['break-even'],
  'Contribution Margin': TERM_DEFS['contribution-margin'],
  'Revenue': 'Total money received from all sales at your blended price this month.',
  'Fixed Costs': 'Monthly overhead that does not change with volume — marketing, software, storage, insurance.',
  'Sales Channel Split': 'What percentage of your sales come from retail (DTC/online) vs wholesale (stores/distributors).',
};

// ─── Default inputs ────────────────────────────────────────────────────────────
const DEFAULT_INPUTS = {
  productName: '',
  category: 'canned-cocktail',
  categoryAutoDetected: false,
  ingredients: '',
  packaging: '',
  coPacking: '',
  shippingPerUnit: '',
  otherUnit: '',
  marketing: '',
  software: '',
  storage: '',
  insurance: '',
  otherFixed: '',
  retailPrice: '',
  wholesalePrice: '',
  wholesaleAutoSet: false,
  retailSplit: 70,
  unitSlider: 500,
};

// ─── Tooltip component ─────────────────────────────────────────────────────────
function Tooltip({ term, definition, children }) {
  const [visible, setVisible] = useState(false);
  const spanRef = useRef(null);
  return (
    <span className="relative inline-block">
      <span
        ref={spanRef}
        className="border-b border-dashed border-text-secondary cursor-help"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        tabIndex={0}
        role="button"
        aria-describedby={`tooltip-${term}`}
      >
        {children}
      </span>
      {visible && (
        <div
          id={`tooltip-${term}`}
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-60 bg-text-primary text-white text-xs rounded-xl p-3 shadow-2xl pointer-events-none"
        >
          <p className="font-semibold mb-1">{term}</p>
          <p className="text-white/80 leading-relaxed">{definition}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-text-primary" />
        </div>
      )}
    </span>
  );
}

// ─── Term card (education) ─────────────────────────────────────────────────────
function TermCard({ term, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 w-40 rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
        isActive
          ? 'bg-accent text-white border-accent shadow-lg scale-[1.03]'
          : 'bg-card border-border hover:border-accent/50 hover:shadow-md'
      }`}
    >
      <div className="text-2xl mb-2">{term.emoji}</div>
      <p className={`text-sm font-bold mb-1.5 leading-tight ${isActive ? 'text-white' : 'text-text-primary'}`}>
        {term.term}
      </p>
      <p className={`text-xs leading-relaxed ${isActive ? 'text-white/80' : 'text-text-secondary'}`}>
        {term.shortDef}
      </p>
    </button>
  );
}

// ─── Term expanded panel ───────────────────────────────────────────────────────
function TermExpanded({ term, productLabel, onClose }) {
  if (!term) return null;
  return (
    <div className="mt-4 bg-card border border-accent/20 rounded-2xl p-6 relative animate-fade-in shadow-sm">
      <button
        onClick={onClose}
        aria-label="Close explanation"
        className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-text-secondary hover:bg-border hover:text-text-primary transition-colors text-lg leading-none"
      >
        ×
      </button>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{term.emoji}</span>
        <h3 className="font-display text-xl text-text-primary">{term.term}</h3>
      </div>
      <div className="space-y-2 max-w-2xl">
        {term.fullExplanation.map((block, i) => (
          <p key={i} className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
            {block.text}
          </p>
        ))}
        {productLabel && (
          <p className="text-xs text-text-secondary italic mt-3 pt-3 border-t border-border">
            Example above uses your product type: <strong className="text-text-primary">{productLabel}</strong>
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Cost input row ────────────────────────────────────────────────────────────
function CostInput({ label, value, onChange, placeholder = '0.00' }) {
  return (
    <div className="flex items-center gap-3">
      <label className="flex-1 text-sm text-text-secondary min-w-0">{label}</label>
      <div className="relative w-28 flex-shrink-0">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm pointer-events-none">$</span>
        <input
          type="number"
          min={0}
          step="0.01"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-7 pr-3 py-2 border border-border rounded-lg text-text-primary text-sm bg-background focus:outline-none focus:border-accent text-right"
        />
      </div>
    </div>
  );
}

// ─── Metric row ────────────────────────────────────────────────────────────────
function MetricRow({ label, value, sub, muted, emphasis }) {
  return (
    <div className={`flex items-start justify-between py-1.5 gap-2 ${emphasis ? 'font-semibold' : ''}`}>
      <span className={`text-sm flex-1 min-w-0 ${muted ? 'text-text-secondary' : 'text-text-primary'}`}>{label}</span>
      <div className="text-right flex-shrink-0">
        <div className={`text-sm ${muted ? 'text-text-secondary' : ''}`}>{value}</div>
        {sub && <div className="text-xs text-text-secondary">{sub}</div>}
      </div>
    </div>
  );
}

// ─── Motivation bar chart ──────────────────────────────────────────────────────
function MotivationChart({ data }) {
  const maxAbs = Math.max(...data.map(d => Math.abs(d.profit)), 1);
  const BAR_MAX_H = 96;
  return (
    <div>
      <div className="flex items-end gap-2 h-28">
        {data.map((d, i) => {
          const isPos = d.profit >= 0;
          const barH = Math.max((Math.abs(d.profit) / maxAbs) * BAR_MAX_H, 3);
          const label =
            Math.abs(d.profit) >= 1000
              ? `${d.profit >= 0 ? '+' : '-'}$${(Math.abs(d.profit) / 1000).toFixed(1)}K`
              : `${d.profit >= 0 ? '+' : ''}$${Math.round(d.profit)}`;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className={`text-[10px] font-semibold text-center leading-tight ${isPos ? 'text-success' : 'text-danger'}`}>
                {label}
              </span>
              <div
                className={`w-full rounded-t-md transition-all duration-500 ${isPos ? 'bg-success' : 'bg-danger/60'}`}
                style={{ height: `${barH}px` }}
              />
              <span className="text-[10px] text-text-secondary font-medium">{d.label}</span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-text-secondary mt-3 text-center">Net profit (CAD $) at different monthly volumes</p>
    </div>
  );
}

// ─── Total Launch Costs card ───────────────────────────────────────────────────
function TotalLaunchCostsCard({ brandCtx }) {
  const { costBreakdown, marketingBatches, preorderPlatform, productionChecklist } = brandCtx;

  const fmtCAD = (n) => n?.toLocaleString('en-CA') ?? '—';

  // Estimate marketing tool cost: $30–$80/mo if batches generated
  const mktLow = marketingBatches > 0 ? 30 : 0;
  const mktHigh = marketingBatches > 0 ? 80 : 0;

  // Pre-order platform: Shopify ~$1/mo trial + fees; Stripe free + %; others vary
  const preorderLabel = preorderPlatform
    ? `Pre-order platform (${preorderPlatform.charAt(0).toUpperCase() + preorderPlatform.slice(1)})`
    : null;
  const preorderLow = preorderPlatform === 'shopify' ? 1 : preorderPlatform ? 0 : 0;
  const preorderHigh = preorderPlatform === 'shopify' ? 39 : preorderPlatform ? 20 : 0;

  // Production: check if any checklist items done
  const prodItems = productionChecklist ? Object.values(productionChecklist).filter(Boolean).length : 0;

  const hasAnyData = costBreakdown || marketingBatches > 0 || preorderPlatform || prodItems > 0;

  const totalLow = (costBreakdown?.total?.low || 0) + mktLow + preorderLow;
  const totalHigh = (costBreakdown?.total?.high || 0) + mktHigh + preorderHigh;

  return (
    <div className="bg-card rounded-2xl border border-border p-6 mb-8">
      <h3 className="font-display text-lg text-text-primary mb-1">💼 Your Total Launch Costs</h3>
      <p className="text-xs text-text-secondary mb-5">Aggregated from your completed sections.</p>

      {!hasAnyData ? (
        <p className="text-sm text-text-secondary">
          Complete Financing and other sections first — your aggregated costs will appear here.
        </p>
      ) : (
        <div className="space-y-3">
          {costBreakdown ? (
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Startup costs (from Financing)</span>
              <span className="text-text-primary font-medium">
                ${fmtCAD(costBreakdown.total?.low)} – ${fmtCAD(costBreakdown.total?.high)}
              </span>
            </div>
          ) : (
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Startup costs (Financing)</span>
              <span className="text-text-secondary italic text-xs">Complete Financing to see</span>
            </div>
          )}

          {marketingBatches > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Marketing tools (est. monthly)</span>
              <span className="text-text-primary font-medium">${mktLow} – ${mktHigh}/mo</span>
            </div>
          )}

          {preorderLabel && (
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{preorderLabel}</span>
              <span className="text-text-primary font-medium">
                {preorderLow === 0 && preorderHigh === 0 ? 'Fee-based (no fixed cost)' : `$${preorderLow} – $${preorderHigh}/mo`}
              </span>
            </div>
          )}

          {prodItems > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Production prep ({prodItems} checklist items done)</span>
              <span className="text-text-secondary italic text-xs">Costs in Financing breakdown</span>
            </div>
          )}

          {(totalLow > 0 || totalHigh > 0) && (
            <div className="border-t border-border pt-3 mt-3 flex justify-between items-baseline">
              <span className="text-text-primary font-medium">Estimated Total</span>
              <span className="text-accent font-bold text-lg">
                ${fmtCAD(totalLow)} – ${fmtCAD(totalHigh)}
              </span>
            </div>
          )}

          {costBreakdown?.minimum_viable && (
            <p className="text-xs text-text-secondary mt-2 pt-2 border-t border-border/50 leading-relaxed">
              💡 {costBreakdown.minimum_viable}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function PricingCalculator({ setActiveSection }) {
  const [activeCard, setActiveCard] = useState(null);
  const [saved, setSaved] = useState(false);

  // Load brand context on mount
  const brandCtx = useMemo(() => getBrandContext(), []);

  const [inputs, setInputs] = useState(() => {
    const stored = getStorage();
    const savedInputs = stored.pricing?.inputs ?? {};
    const merged = { ...DEFAULT_INPUTS, ...savedInputs };

    // Auto-detect category from brand idea if no category saved or default
    if (brandCtx.idea && (!savedInputs.category || savedInputs.category === 'canned-cocktail') && !savedInputs.categoryAutoDetected) {
      const detected = detectCategory(brandCtx.idea + ' ' + brandCtx.feedback);
      if (detected) {
        merged.category = detected;
        merged.categoryAutoDetected = true;
      }
    }

    // Pre-populate product name from brand name if empty
    if (!merged.productName && brandCtx.brandName) {
      merged.productName = brandCtx.brandName;
    }

    return merged;
  });

  // Input change handler — auto-suggest wholesale at 50% of retail
  const handleInputChange = useCallback((field, value) => {
    setInputs(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'category') {
        next.categoryAutoDetected = false; // manual override
      }
      if (field === 'retailPrice') {
        const retail = parseFloat(value);
        if (!isNaN(retail) && retail > 0 && (!prev.wholesalePrice || prev.wholesaleAutoSet)) {
          next.wholesalePrice = (retail * 0.5).toFixed(2);
          next.wholesaleAutoSet = true;
        }
      }
      if (field === 'wholesalePrice') {
        next.wholesaleAutoSet = false;
      }
      return next;
    });
  }, []);

  const applyAutoWholesale = useCallback(() => {
    const retail = parseFloat(inputs.retailPrice);
    if (!isNaN(retail) && retail > 0) {
      setInputs(prev => ({
        ...prev,
        wholesalePrice: (retail * 0.5).toFixed(2),
        wholesaleAutoSet: true,
      }));
    }
  }, [inputs.retailPrice]);

  // ─── Calculations ──────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const n = v => parseFloat(v) || 0;
    const cogs = n(inputs.ingredients) + n(inputs.packaging) + n(inputs.coPacking) + n(inputs.shippingPerUnit) + n(inputs.otherUnit);
    const retailPrice = n(inputs.retailPrice);
    const wholesalePrice = n(inputs.wholesalePrice);
    const retailSplit = n(inputs.retailSplit) / 100;
    const wholesaleSplit = 1 - retailSplit;

    const grossProfitRetail = retailPrice - cogs;
    const grossProfitWholesale = wholesalePrice - cogs;
    const blendedPrice = retailPrice * retailSplit + wholesalePrice * wholesaleSplit;
    const blendedGrossProfit = blendedPrice - cogs;

    const grossMarginRetail = retailPrice > 0 ? (grossProfitRetail / retailPrice) * 100 : 0;
    const grossMarginWholesale = wholesalePrice > 0 ? (grossProfitWholesale / wholesalePrice) * 100 : 0;
    const blendedGrossMargin = blendedPrice > 0 ? (blendedGrossProfit / blendedPrice) * 100 : 0;

    const fixedCosts = n(inputs.marketing) + n(inputs.software) + n(inputs.storage) + n(inputs.insurance) + n(inputs.otherFixed);

    const units = n(inputs.unitSlider);
    const monthlyRevenue = units * blendedPrice;
    const monthlyCogs = units * cogs;
    const monthlyGrossProfit = monthlyRevenue - monthlyCogs;
    const monthlyNetProfit = monthlyGrossProfit - fixedCosts;

    const breakEvenUnits = blendedGrossProfit > 0 ? Math.ceil(fixedCosts / blendedGrossProfit) : null;
    const breakEvenRevenue = breakEvenUnits != null ? breakEvenUnits * blendedPrice : null;

    const motivationData = [100, 500, 1000, 5000].map(u => ({
      label: u >= 1000 ? `${u / 1000}K` : `${u}`,
      units: u,
      profit: u * blendedGrossProfit - fixedCosts,
    }));

    return {
      cogs, retailPrice, wholesalePrice,
      grossProfitRetail, grossProfitWholesale, blendedGrossProfit,
      grossMarginRetail, grossMarginWholesale, blendedGrossMargin,
      fixedCosts, units, blendedPrice,
      monthlyRevenue, monthlyCogs, monthlyGrossProfit, monthlyNetProfit,
      breakEvenUnits, breakEvenRevenue, motivationData,
    };
  }, [inputs]);

  // Auto-persist
  useEffect(() => {
    const timer = setTimeout(() => {
      updateStorage(prev => ({
        ...prev,
        pricing: { inputs, outputs: calc },
        sectionProgress: {
          ...prev.sectionProgress,
          pricing: inputs.retailPrice && inputs.ingredients ? 100 : inputs.productName ? 30 : 0,
        },
      }));
    }, 400);
    return () => clearTimeout(timer);
  }, [inputs, calc]);

  const handleSave = useCallback(() => {
    updateStorage(prev => ({
      ...prev,
      pricing: { inputs, outputs: calc },
      sectionProgress: {
        ...prev.sectionProgress,
        pricing: inputs.retailPrice && inputs.ingredients ? 100 : 50,
      },
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }, [inputs, calc]);

  const selectedCategory = CATEGORIES.find(c => c.value === inputs.category);
  const wholesaleIsAuto =
    inputs.wholesalePrice &&
    inputs.retailPrice &&
    Math.abs(parseFloat(inputs.wholesalePrice) - parseFloat(inputs.retailPrice) * 0.5) < 0.01;

  const fmtCAD = (n, dec = 0) =>
    n.toLocaleString('en-CA', { minimumFractionDigits: dec, maximumFractionDigits: dec });

  // Personalized comparables
  const competitors = useMemo(() => parseCompetitors(brandCtx.feedback), [brandCtx.feedback]);
  const categoryLabel = CATEGORIES.find(c => c.value === inputs.category)?.label || 'your category';
  const comparableText = competitors.length > 0
    ? `Based on your concept, comparable brands like ${competitors.join(', ')} sell for ${selectedCategory?.range || 'varies'}`
    : selectedCategory
    ? `For ${categoryLabel} brands, typical retail range is ${selectedCategory.range}`
    : null;

  // Product label for term card examples
  const productLabel = brandCtx.idea
    ? (CATEGORIES.find(c => c.value === inputs.category)?.label || 'beverage')
    : null;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 md:px-6">
      {/* Header */}
      <div className="mb-8 flex items-start gap-4">
        <span className="text-5xl mt-1">🧮</span>
        <div>
          <h1 className="font-display text-3xl text-text-primary">Pricing Calculator</h1>
          <p className="text-text-secondary mt-1">Your numbers, all in one place. All figures in CAD $.</p>
        </div>
      </div>

      {/* Brainstorm nudge */}
      {!brandCtx.hasBrainstorm && (
        <div className="mb-8 bg-warning/10 border border-warning/30 rounded-2xl p-4 text-sm text-text-secondary flex items-start gap-3">
          <span className="text-warning text-lg flex-shrink-0">💡</span>
          <p>
            Complete <strong className="text-text-primary">Brainstorm</strong> first to unlock personalized comparables, auto-detected category, and customized examples here.
          </p>
        </div>
      )}

      {/* ── Total Launch Costs card ────────────────────────────────────────────── */}
      <TotalLaunchCostsCard brandCtx={brandCtx} />

      {/* ── PART 1: Education ─────────────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="font-display text-2xl text-text-primary mb-1">📚 Financial Terms</h2>
        <p className="text-text-secondary text-sm mb-6">Click any card to learn more.</p>

        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:-mx-6 md:px-6">
          {TERMS.map(t => (
            <TermCard
              key={t.id}
              term={t}
              isActive={activeCard === t.id}
              onClick={() => setActiveCard(activeCard === t.id ? null : t.id)}
            />
          ))}
        </div>

        {activeCard && (
          <TermExpanded
            term={TERMS.find(t => t.id === activeCard)}
            productLabel={productLabel}
            onClose={() => setActiveCard(null)}
          />
        )}
      </section>

      {/* ── PART 2: Calculator ────────────────────────────────────────────────── */}
      <section>
        <h2 className="font-display text-2xl text-text-primary mb-6">🧮 Interactive Calculator</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── LEFT COLUMN: INPUTS ─────────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Product Info */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-text-primary mb-4">Product Info</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Product Name</label>
                  <input
                    type="text"
                    value={inputs.productName}
                    onChange={e => handleInputChange('productName', e.target.value)}
                    placeholder="e.g. Northern Spirits Gin Fizz"
                    className="w-full border border-border rounded-xl px-4 py-2.5 text-text-primary bg-background focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm text-text-secondary">Category</label>
                    {inputs.categoryAutoDetected && (
                      <span className="text-xs text-accent font-medium">✓ auto-detected from your idea</span>
                    )}
                  </div>
                  <select
                    value={inputs.category}
                    onChange={e => handleInputChange('category', e.target.value)}
                    className="w-full border border-border rounded-xl px-4 py-2.5 text-text-primary bg-background focus:outline-none focus:border-accent transition-colors"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Personalized comparables */}
                {selectedCategory && (
                  <div className={`border rounded-xl p-4 ${selectedCategory.color}`}>
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">
                      Comparable brands · CAD
                    </p>
                    <p className="text-base font-bold leading-snug">{comparableText}</p>
                    <p className="text-xs opacity-60 mt-1">Canadian market · single unit</p>
                  </div>
                )}
              </div>
            </div>

            {/* Per-Unit Costs */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-text-primary mb-1">Per-Unit Costs</h3>
              <p className="text-xs text-text-secondary mb-4">
                <Tooltip term="COGS" definition={TOOLTIP_MAP['COGS']}>COGS</Tooltip>
                {' '}= sum of all fields below
              </p>
              <div className="space-y-3">
                <CostInput label="Ingredients" value={inputs.ingredients} onChange={v => handleInputChange('ingredients', v)} />
                <CostInput label="Packaging (can, bottle, label)" value={inputs.packaging} onChange={v => handleInputChange('packaging', v)} />
                <CostInput label="Co-packing / Production" value={inputs.coPacking} onChange={v => handleInputChange('coPacking', v)} />
                <CostInput label="Shipping (inbound, per unit)" value={inputs.shippingPerUnit} onChange={v => handleInputChange('shippingPerUnit', v)} />
                <CostInput label="Other" value={inputs.otherUnit} onChange={v => handleInputChange('otherUnit', v)} />
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-text-primary">
                      <Tooltip term="COGS" definition={TOOLTIP_MAP['COGS']}>Total COGS / unit</Tooltip>
                    </span>
                    <span className={`font-bold text-base ${calc.cogs > 0 ? 'text-text-primary' : 'text-text-secondary'}`}>
                      ${calc.cogs.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Monthly Costs */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-text-primary mb-4">Fixed Monthly Costs</h3>
              <div className="space-y-3">
                <CostInput label="Marketing & Advertising" value={inputs.marketing} onChange={v => handleInputChange('marketing', v)} />
                <CostInput label="Software & Tools" value={inputs.software} onChange={v => handleInputChange('software', v)} />
                <CostInput label="Storage / Warehouse" value={inputs.storage} onChange={v => handleInputChange('storage', v)} />
                <CostInput label="Insurance" value={inputs.insurance} onChange={v => handleInputChange('insurance', v)} />
                <CostInput label="Other Fixed" value={inputs.otherFixed} onChange={v => handleInputChange('otherFixed', v)} />
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-text-primary">
                      <Tooltip term="Fixed Costs" definition={TOOLTIP_MAP['Fixed Costs']}>Total Fixed / month</Tooltip>
                    </span>
                    <span className={`font-bold text-base ${calc.fixedCosts > 0 ? 'text-text-primary' : 'text-text-secondary'}`}>
                      ${fmtCAD(calc.fixedCosts, 2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Inputs */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-text-primary mb-4">Revenue Inputs</h3>
              <div className="space-y-4">
                <CostInput
                  label={<Tooltip term="Retail Price" definition={TOOLTIP_MAP['Retail Price']}>Retail Price</Tooltip>}
                  value={inputs.retailPrice}
                  onChange={v => handleInputChange('retailPrice', v)}
                  placeholder="e.g. 15.00"
                />
                <div>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 text-sm text-text-secondary">
                      <Tooltip term="Wholesale Price" definition={TOOLTIP_MAP['Wholesale Price']}>Wholesale Price</Tooltip>
                      {wholesaleIsAuto && (
                        <span className="ml-1.5 text-xs text-success font-medium">✓ auto-set (50%)</span>
                      )}
                    </label>
                    <div className="relative w-28 flex-shrink-0">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm pointer-events-none">$</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={inputs.wholesalePrice}
                        onChange={e => handleInputChange('wholesalePrice', e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-7 pr-3 py-2 border border-border rounded-lg text-text-primary text-sm bg-background focus:outline-none focus:border-accent text-right"
                      />
                    </div>
                  </div>
                  {inputs.retailPrice && !inputs.wholesalePrice && (
                    <button
                      onClick={applyAutoWholesale}
                      className="mt-2 text-xs text-accent hover:underline font-medium"
                    >
                      → Auto-set to ${(parseFloat(inputs.retailPrice) * 0.5 || 0).toFixed(2)} (50% of retail)
                    </button>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm text-text-secondary">
                      <Tooltip term="Sales Channel Split" definition={TOOLTIP_MAP['Sales Channel Split']}>Sales Channel Split</Tooltip>
                    </label>
                  </div>
                  <div className="flex justify-between text-xs text-text-secondary mb-1.5">
                    <span className="font-medium text-text-primary">Retail {inputs.retailSplit}%</span>
                    <span className="font-medium text-text-primary">Wholesale {100 - inputs.retailSplit}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={inputs.retailSplit}
                    onChange={e => handleInputChange('retailSplit', parseInt(e.target.value))}
                    className="w-full accent-accent"
                  />
                  <div className="flex justify-between text-xs text-text-secondary mt-1">
                    <span>All Wholesale</span>
                    <span>All Retail</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: OUTPUT CARDS ──────────────────────────────────── */}
          <div className="space-y-5">
            {/* Card 1: Per Unit Breakdown */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <span className="text-lg">📦</span> Per Unit Breakdown
              </h3>
              <div className="space-y-1">
                <MetricRow
                  label={<Tooltip term="COGS" definition={TOOLTIP_MAP['COGS']}>COGS / unit</Tooltip>}
                  value={<span className="font-bold text-text-primary">${calc.cogs.toFixed(2)}</span>}
                />
                <div className="border-t border-border pt-2 mt-2">
                  <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide mb-2">
                    <Tooltip term="Gross Profit" definition={TOOLTIP_MAP['Gross Profit']}>Gross Profit</Tooltip>
                  </p>
                  <MetricRow
                    label={
                      <Tooltip term="Retail Price" definition={TOOLTIP_MAP['Retail Price']}>
                        At Retail (${calc.retailPrice.toFixed(2)})
                      </Tooltip>
                    }
                    value={
                      <span className={`font-bold ${calc.grossProfitRetail >= 0 ? 'text-success' : 'text-danger'}`}>
                        ${calc.grossProfitRetail.toFixed(2)}
                      </span>
                    }
                    sub={calc.retailPrice > 0 ? `${calc.grossMarginRetail.toFixed(1)}% margin` : undefined}
                  />
                  <MetricRow
                    label={
                      <Tooltip term="Wholesale Price" definition={TOOLTIP_MAP['Wholesale Price']}>
                        At Wholesale (${calc.wholesalePrice.toFixed(2)})
                      </Tooltip>
                    }
                    value={
                      <span className={`font-bold ${calc.grossProfitWholesale >= 0 ? 'text-success' : 'text-danger'}`}>
                        ${calc.grossProfitWholesale.toFixed(2)}
                      </span>
                    }
                    sub={calc.wholesalePrice > 0 ? `${calc.grossMarginWholesale.toFixed(1)}% margin` : undefined}
                  />
                  <div className="bg-background rounded-xl p-3 mt-2">
                    <MetricRow
                      label={
                        <Tooltip term="Blended" definition={TOOLTIP_MAP['Blended']}>
                          Blended ({inputs.retailSplit}% retail)
                        </Tooltip>
                      }
                      value={
                        <span className={`font-bold text-base ${calc.blendedGrossProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                          ${calc.blendedGrossProfit.toFixed(2)}
                        </span>
                      }
                      sub={calc.blendedPrice > 0 ? `${calc.blendedGrossMargin.toFixed(1)}% blended margin` : undefined}
                      emphasis
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Monthly Projections */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <span className="text-lg">📅</span> Monthly Projections
              </h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-secondary">Units sold / month</span>
                  <span className="font-bold text-text-primary">{fmtCAD(calc.units)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10000}
                  step={50}
                  value={inputs.unitSlider}
                  onChange={e => handleInputChange('unitSlider', parseInt(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between text-xs text-text-secondary mt-1">
                  <span>0 units</span>
                  <span>10,000 units</span>
                </div>
              </div>
              <div className="space-y-1">
                <MetricRow
                  label={<Tooltip term="Revenue" definition={TOOLTIP_MAP['Revenue']}>Revenue</Tooltip>}
                  value={`$${fmtCAD(calc.monthlyRevenue)}`}
                />
                <MetricRow
                  label={<Tooltip term="COGS" definition={TOOLTIP_MAP['COGS']}>COGS (total)</Tooltip>}
                  value={`-$${fmtCAD(calc.monthlyCogs)}`}
                  muted
                />
                <MetricRow
                  label={<Tooltip term="Gross Profit" definition={TOOLTIP_MAP['Gross Profit']}>Gross Profit</Tooltip>}
                  value={`$${fmtCAD(calc.monthlyGrossProfit)}`}
                />
                <MetricRow
                  label={<Tooltip term="Fixed Costs" definition={TOOLTIP_MAP['Fixed Costs']}>Fixed Costs</Tooltip>}
                  value={`-$${fmtCAD(calc.fixedCosts)}`}
                  muted
                />
                <div className="border-t border-border pt-2 mt-2">
                  <div className={`flex justify-between items-center py-2 px-3 rounded-xl ${calc.monthlyNetProfit >= 0 ? 'bg-success/10' : 'bg-danger/10'}`}>
                    <span className="text-sm font-semibold text-text-primary">
                      <Tooltip term="Net Profit" definition={TOOLTIP_MAP['Net Profit']}>Net Profit / month</Tooltip>
                    </span>
                    <span className={`font-bold text-xl ${calc.monthlyNetProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                      {calc.monthlyNetProfit >= 0 ? '+' : ''}${fmtCAD(calc.monthlyNetProfit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Break-Even */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <span className="text-lg">⚖️</span>
                <Tooltip term="Break-Even" definition={TOOLTIP_MAP['Break-Even']}>Break-Even Analysis</Tooltip>
              </h3>
              {calc.breakEvenUnits != null ? (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-background rounded-xl p-4 text-center border border-border">
                      <p className="text-2xl font-bold text-text-primary">{fmtCAD(calc.breakEvenUnits)}</p>
                      <p className="text-xs text-text-secondary mt-1">units / month</p>
                    </div>
                    <div className="bg-background rounded-xl p-4 text-center border border-border">
                      <p className="text-2xl font-bold text-text-primary">
                        ${calc.breakEvenRevenue != null ? fmtCAD(calc.breakEvenRevenue) : '—'}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">revenue / month</p>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Once you sell <strong className="text-text-primary">{fmtCAD(calc.breakEvenUnits)} units/month</strong>, every additional unit is pure profit.
                    {calc.units > 0 && calc.breakEvenUnits > 0 && (
                      calc.units >= calc.breakEvenUnits
                        ? <span className="text-success font-medium"> You're above break-even! 🎉</span>
                        : <span className="text-warning font-medium"> You need {fmtCAD(calc.breakEvenUnits - calc.units)} more units/month.</span>
                    )}
                  </p>
                </>
              ) : (
                <p className="text-sm text-text-secondary">
                  Enter your costs and pricing above to calculate your break-even point.
                </p>
              )}
            </div>

            {/* Card 4: Motivation Corner */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-text-primary mb-1 flex items-center gap-2">
                <span className="text-lg">🌟</span> Motivation Corner
              </h3>
              <p className="text-xs text-text-secondary mb-4">
                <Tooltip term="Net Profit" definition={TOOLTIP_MAP['Net Profit']}>Net profit</Tooltip> at different monthly volumes.
              </p>
              <MotivationChart data={calc.motivationData} />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSave}
            className="flex items-center gap-2.5 px-8 py-3 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover transition-colors shadow-sm"
          >
            <Save size={16} />
            {saved ? '✓ Pricing Saved!' : 'Save My Pricing'}
          </button>
        </div>
      </section>
      <NextSectionButton
        nextSection="calendar"
        nextLabel="Calendar & Checklist"
        setActiveSection={setActiveSection}
      />
    </div>
  );
}

export default PricingCalculator;
