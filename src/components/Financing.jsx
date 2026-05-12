import { useState, useEffect, useCallback } from 'react';
import {
  ExternalLink,
  Sparkles,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { getStorage, updateStorage } from '../utils/storage';

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_GRANTS = [
  {
    id: 'seed-1',
    name: 'Futurpreneur Canada',
    provider: 'Futurpreneur Canada',
    amount: 'Up to $60,000',
    deadline: null,
    deadlineLabel: 'Year-round',
    eligibility: 'Ages 18–39, Canadian resident, operating full-time',
    status: 'open',
    link: 'https://www.futurpreneur.ca/',
  },
  {
    id: 'seed-2',
    name: 'Canada Small Business Financing Program (CSBFP)',
    provider: 'Government of Canada',
    amount: 'Up to $1,000,000',
    deadline: null,
    deadlineLabel: 'Ongoing',
    eligibility: 'Canadian business, revenue < $10M; for equipment, leasehold improvements, real property',
    status: 'open',
    link: 'https://ised-isde.canada.ca/site/canada-small-business-financing-program/en',
  },
  {
    id: 'seed-3',
    name: 'Women Entrepreneurship Strategy (WES)',
    provider: 'Government of Canada',
    amount: 'Varies by round',
    deadline: null,
    deadlineLabel: 'Check current rounds',
    eligibility: 'Women-owned/led businesses with majority Canadian ownership',
    status: 'unknown',
    link: 'https://ised-isde.canada.ca/site/women-entrepreneurship-strategy/en',
  },
  {
    id: 'seed-4',
    name: 'BDC Women in Tech Venture Fund',
    provider: 'BDC Capital',
    amount: '$50K – $5M',
    deadline: null,
    deadlineLabel: 'Ongoing',
    eligibility: 'Women-led startups with an innovation or technology component',
    status: 'open',
    link: 'https://www.bdc.ca/en/bdc-capital/venture-capital/women-in-technology',
  },
  {
    id: 'seed-5',
    name: 'Ontario Self-Employment Benefit',
    provider: 'Ontario Government / Service Canada',
    amount: 'Living expenses during startup phase',
    deadline: null,
    deadlineLabel: 'Check eligibility',
    eligibility: 'Must be receiving EI or eligible for EI; Ontario resident starting a business',
    status: 'unknown',
    link: 'https://www.ontario.ca/page/self-employment-benefit',
  },
  {
    id: 'seed-6',
    name: 'Startup Visa Program',
    provider: 'Immigration, Refugees & Citizenship Canada',
    amount: 'Immigration pathway (PR)',
    deadline: null,
    deadlineLabel: 'Ongoing',
    eligibility: 'High-growth ventures with support from a designated organization; PR pathway for founders',
    status: 'open',
    link: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/start-up-visa.html',
  },
  {
    id: 'seed-7',
    name: 'CanExport SMEs',
    provider: 'Trade Commissioner Service',
    amount: 'Up to $50,000',
    deadline: null,
    deadlineLabel: 'Rolling / Quarterly intake',
    eligibility: 'Canadian SME exporting goods or services; for export development activities outside Canada',
    status: 'open',
    link: 'https://www.tradecommissioner.gc.ca/funding-financement/canexport/sme-pme/index.aspx',
  },
  {
    id: 'seed-8',
    name: 'Digital Main Street Grant',
    provider: 'Digital Main Street / Ontario',
    amount: 'Up to $2,500',
    deadline: null,
    deadlineLabel: 'Varies by region',
    eligibility: 'Ontario storefront business; for digital transformation activities',
    status: 'unknown',
    link: 'https://digitalmainstreet.ca/',
  },
  {
    id: 'seed-9',
    name: 'IRAP — Industrial Research Assistance Program',
    provider: 'National Research Council Canada (NRC)',
    amount: 'Up to $10,000,000',
    deadline: null,
    deadlineLabel: 'Ongoing',
    eligibility: 'Canadian SME with an innovative tech component; requires ITA assessment',
    status: 'open',
    link: 'https://nrc.canada.ca/en/support-technology-innovation/nrc-irap',
  },
  {
    id: 'seed-10',
    name: 'Provincial Microgrant Programs',
    provider: 'Various Provincial Governments',
    amount: '$1,000 – $10,000',
    deadline: null,
    deadlineLabel: 'Varies by province',
    eligibility: 'Varies by province — search your provincial government or CFDC portal',
    status: 'unknown',
    link: 'https://www.canada.ca/en/services/business/grants.html',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  open: {
    label: 'Open',
    emoji: '🟢',
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/20',
  },
  'closing-soon': {
    label: 'Closing Soon',
    emoji: '🟡',
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/20',
  },
  closed: {
    label: 'Closed',
    emoji: '🔴',
    bg: 'bg-danger/10',
    text: 'text-danger',
    border: 'border-danger/20',
  },
  unknown: {
    label: 'Unknown',
    emoji: '⚪',
    bg: 'bg-border/50',
    text: 'text-text-secondary',
    border: 'border-border',
  },
  check: {
    label: 'Unknown',
    emoji: '⚪',
    bg: 'bg-border/50',
    text: 'text-text-secondary',
    border: 'border-border',
  },
};

function StatusPill({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unknown;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.emoji} {config.label}
    </span>
  );
}

function DeadlineCell({ deadline, label }) {
  if (!deadline) {
    return <span className="text-text-secondary text-sm">{label || '—'}</span>;
  }

  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffDays = Math.floor((deadlineDate - today) / (1000 * 60 * 60 * 24));

  let colorClass = 'text-success';
  if (diffDays < 0) colorClass = 'text-danger';
  else if (diffDays <= 30) colorClass = 'text-warning';

  return (
    <span className={`text-sm font-medium ${colorClass}`}>
      {label || deadlineDate.toLocaleDateString('en-CA')}
    </span>
  );
}

// ─── AI Grant Finder ──────────────────────────────────────────────────────────

function buildGrantSystemPrompt(brandIdea) {
  const brandContext = brandIdea
    ? `starting a specific brand: ${brandIdea}`
    : 'starting a beverage/CPG company';

  return `You are a Canadian small business funding expert. Search your knowledge for ALL grants, loans, micro-loans, pitch competitions, accelerators, and funding programs available to a 24-year-old solo female founder in Canada with income under $30K, ${brandContext}.

Return results as a JSON array with fields: name, provider, amount_range, deadline_info, eligibility_summary, application_url (if known, else "Search required"), status ("open"/"check"/"unknown").

Be exhaustive. Include federal, provincial (all provinces), municipal, private foundation, and competition-based funding. Minimum 15 results. Return ONLY the JSON array, no other text.`;
}

function parseGrantsFromAI(text) {
  try {
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [];
    const arr = JSON.parse(match[0]);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function normalizeAIGrant(raw, index) {
  return {
    id: `ai-${Date.now()}-${index}`,
    name: raw.name || 'Unknown Program',
    provider: raw.provider || '—',
    amount: raw.amount_range || '—',
    deadline: null,
    deadlineLabel: raw.deadline_info || '—',
    eligibility: raw.eligibility_summary || '—',
    status:
      raw.status === 'open' || raw.status === 'check' || raw.status === 'unknown'
        ? raw.status
        : 'unknown',
    link: raw.application_url && raw.application_url !== 'Search required' ? raw.application_url : '#',
  };
}

function AIGrantModal({ onClose, onGrants, existingNames, brandIdea }) {
  const { callAI, loading, error } = useAI();
  const [searched, setSearched] = useState(false);
  const [parsed, setParsed] = useState([]);

  const handleSearch = useCallback(async () => {
    setSearched(false);
    const systemPrompt = buildGrantSystemPrompt(brandIdea);
    const text = await callAI(
      systemPrompt,
      'Find me all available grants, loans, and funding opportunities for my profile.',
    );
    if (!text) return;
    const grants = parseGrantsFromAI(text).map(normalizeAIGrant);
    const deduped = grants.filter((g) => !existingNames.has(g.name.toLowerCase().trim()));
    setParsed(deduped);
    setSearched(true);
  }, [callAI, existingNames, brandIdea]);

  const handleAdd = useCallback(() => {
    onGrants(parsed);
    onClose();
  }, [parsed, onGrants, onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <h2 className="font-display text-xl text-text-primary">AI Grant Finder</h2>
              <p className="text-sm text-text-secondary mt-0.5">
                {brandIdea
                  ? 'Personalized to your brand concept'
                  : 'Tailored to your founder profile'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-background transition-colors text-text-secondary hover:text-text-primary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {!searched && !loading && !error && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-display text-lg text-text-primary mb-2">
                Find More Canadian Grants
              </h3>
              {brandIdea && (
                <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 mb-4 mx-auto max-w-md text-left">
                  <p className="text-xs text-text-secondary font-medium uppercase tracking-wide mb-1">Your brand concept</p>
                  <p className="text-sm text-text-primary line-clamp-3">{brandIdea}</p>
                </div>
              )}
              <p className="text-text-secondary mb-6 max-w-md mx-auto text-sm leading-relaxed">
                Claude will search for grants, loans, accelerators, and pitch competitions
                {brandIdea ? ' specific to your brand' : ' tailored to your profile'}.
              </p>
              <button
                onClick={handleSearch}
                className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-medium hover:bg-accent-hover transition-colors"
              >
                <Sparkles size={18} />
                Find Grants Now
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 size={40} className="animate-spin text-accent" />
              <p className="text-text-secondary text-sm">
                Searching for grants… this may take 15–30 seconds
              </p>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-danger flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-danger text-sm">Error calling AI</p>
                  <p className="text-sm text-text-secondary mt-1">{error}</p>
                </div>
              </div>
              <div className="text-center">
                <button
                  onClick={handleSearch}
                  className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-accent-hover transition-colors"
                >
                  <Sparkles size={16} />
                  Try Again
                </button>
              </div>
            </div>
          )}

          {searched && !loading && parsed.length === 0 && !error && (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-text-secondary">
                No new grants found — all results are already in your table.
              </p>
            </div>
          )}

          {parsed.length > 0 && !loading && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={18} className="text-success" />
                <p className="font-medium text-text-primary text-sm">
                  Found{' '}
                  <span className="text-success">
                    {parsed.length} new grant{parsed.length !== 1 ? 's' : ''}
                  </span>{' '}
                  (duplicates removed)
                </p>
              </div>
              <div className="space-y-2">
                {parsed.map((g) => (
                  <div
                    key={g.id}
                    className="bg-background rounded-xl p-4 border border-border"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-text-primary text-sm truncate">{g.name}</p>
                        <p className="text-xs text-text-secondary mt-0.5">{g.provider}</p>
                      </div>
                      <StatusPill status={g.status} />
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="font-semibold text-accent">{g.amount}</span>
                      {g.deadlineLabel && g.deadlineLabel !== '—' && (
                        <>
                          <span className="text-border">·</span>
                          <span className="text-text-secondary">{g.deadlineLabel}</span>
                        </>
                      )}
                    </div>
                    {g.eligibility && g.eligibility !== '—' && (
                      <p className="text-xs text-text-secondary mt-1.5 line-clamp-2">
                        {g.eligibility}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {parsed.length > 0 && !loading && (
          <div className="p-6 border-t border-border flex-shrink-0 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-text-secondary hover:bg-background transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-5 py-2 rounded-xl bg-accent text-white hover:bg-accent-hover transition-colors text-sm font-medium inline-flex items-center gap-2"
            >
              <CheckCircle2 size={15} />
              Add {parsed.length} Grant{parsed.length !== 1 ? 's' : ''} to Table
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Grants Tab ────────────────────────────────────────────────────────────────

function GrantsTab({ grants, onOpenModal }) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl text-text-primary">Grants & Funding</h2>
          <p className="text-text-secondary mt-1 text-sm">
            Canadian programs for early-stage founders — verify eligibility before applying
          </p>
        </div>
        <button
          onClick={onOpenModal}
          className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-accent-hover transition-colors shadow-sm whitespace-nowrap self-start sm:self-auto"
        >
          <Sparkles size={16} />
          Find More With AI
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-background/60">
                <th className="text-left px-4 py-3 font-semibold text-text-secondary whitespace-nowrap text-xs uppercase tracking-wide">
                  Program
                </th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary whitespace-nowrap text-xs uppercase tracking-wide">
                  Provider
                </th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary whitespace-nowrap text-xs uppercase tracking-wide">
                  Amount
                </th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary whitespace-nowrap text-xs uppercase tracking-wide">
                  Deadline
                </th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary whitespace-nowrap text-xs uppercase tracking-wide">
                  Eligibility
                </th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary whitespace-nowrap text-xs uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary whitespace-nowrap text-xs uppercase tracking-wide">
                  Link
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {grants.map((grant) => (
                <tr
                  key={grant.id}
                  className="hover:bg-background/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-text-primary max-w-[180px]">
                    <span className="block leading-snug">{grant.name}</span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary max-w-[150px]">
                    <span className="block leading-snug text-xs">{grant.provider}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-accent whitespace-nowrap">
                    {grant.amount}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <DeadlineCell deadline={grant.deadline} label={grant.deadlineLabel} />
                  </td>
                  <td className="px-4 py-3 max-w-[240px]">
                    <span className="block text-xs text-text-secondary leading-relaxed">
                      {grant.eligibility}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusPill status={grant.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {grant.link && grant.link !== '#' ? (
                      <a
                        href={grant.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-accent hover:text-accent-hover transition-colors font-medium text-sm"
                      >
                        Apply <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-text-secondary text-xs">Search required</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-text-secondary mt-3 text-center">
        {grants.length} programs listed ·{' '}
        <span className="inline-flex items-center gap-1">
          🟢 Open · 🟡 Closing Soon · 🔴 Closed · ⚪ Unknown
        </span>{' '}
        · Always verify eligibility directly with the program provider
      </p>
    </div>
  );
}

// ─── Cost Breakdown Tab ────────────────────────────────────────────────────────

function buildCostSystemPrompt(brandIdea, feedback) {
  const context = [brandIdea, feedback ? `Additional context: ${feedback}` : '']
    .filter(Boolean)
    .join('\n');

  return `You are a Canadian beverage industry financial advisor. The user is a 24-year-old solo female founder in Canada with income under $30K, planning to bootstrap with pre-orders before production.

Their brand concept:
${context}

Generate a detailed cost breakdown for launching this SPECIFIC brand via the bootstrap/pre-order path (validate demand → raise capital → produce). Return ONLY valid JSON in this exact structure:

{
  "categories": [
    {
      "name": "Legal & Registration",
      "items": [
        { "item": "Business registration", "low": 60, "mid": 200, "high": 350, "note": "Federal incorporation vs sole proprietorship" }
      ]
    }
  ],
  "total": { "low": 0, "mid": 0, "high": 0 },
  "minimum_viable": "You can validate demand for as little as $X with just [specific items]",
  "timeline_to_revenue": "X–Y months from start to first pre-order revenue"
}

Required categories (be specific to their product type — a canned cocktail has different costs than a spirit or non-alc):
1. Legal & Registration (business reg, excise license if alcohol/RTD, provincial requirements for their specific product)
2. Branding & Design (logo, packaging design — include budget/DIY options)
3. Digital Presence (domain, hosting, email service, social setup)
4. Pre-Order Platform (Shopify/Stripe fees, landing page)
5. Initial Production (co-packer deposit, ingredient sourcing, packaging MOQ — use real Canadian pricing and typical MOQs for their beverage type)
6. Shipping & Fulfillment (shipping supplies, fulfillment setup)
7. Marketing & Launch (paid promotion if any, sample costs)

Use real Canadian pricing. Each category must have 2–4 line items. The total must equal the sum of all mid estimates. Return ONLY valid JSON, no other text.`;
}

function parseCostBreakdown(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function formatCAD(num) {
  if (typeof num !== 'number') return '—';
  return `$${num.toLocaleString('en-CA')}`;
}

function CostCategoryCard({ category, isExpanded, onToggle }) {
  const catTotal = category.items.reduce(
    (acc, item) => ({
      low: acc.low + (item.low || 0),
      mid: acc.mid + (item.mid || 0),
      high: acc.high + (item.high || 0),
    }),
    { low: 0, mid: 0, high: 0 },
  );

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-background/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-medium text-text-primary text-sm">{category.name}</span>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <span className="text-text-secondary">{formatCAD(catTotal.low)}</span>
            <span className="text-text-secondary">–</span>
            <span className="font-semibold text-accent">{formatCAD(catTotal.mid)}</span>
            <span className="text-text-secondary">–</span>
            <span className="text-text-secondary">{formatCAD(catTotal.high)}</span>
          </div>
          <span className="text-sm font-semibold text-accent sm:hidden">{formatCAD(catTotal.mid)}</span>
          {isExpanded ? (
            <ChevronUp size={16} className="text-text-secondary" />
          ) : (
            <ChevronDown size={16} className="text-text-secondary" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-5 py-2 bg-background/40 text-xs font-semibold text-text-secondary uppercase tracking-wide">
            <span>Item</span>
            <span className="w-16 text-right">Low</span>
            <span className="w-16 text-right">Mid</span>
            <span className="w-16 text-right">High</span>
          </div>
          <div className="divide-y divide-border/50">
            {category.items.map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-5 py-3 items-start">
                <div>
                  <span className="text-sm text-text-primary">{item.item}</span>
                  {item.note && (
                    <p className="text-xs text-text-secondary mt-0.5">{item.note}</p>
                  )}
                </div>
                <span className="w-16 text-right text-sm text-text-secondary">{formatCAD(item.low)}</span>
                <span className="w-16 text-right text-sm font-medium text-text-primary">{formatCAD(item.mid)}</span>
                <span className="w-16 text-right text-sm text-text-secondary">{formatCAD(item.high)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CostBreakdownTab() {
  const storage = getStorage();
  const brandIdea = storage.brainstorm?.currentIdea || '';
  const feedback = storage.brainstorm?.feedback || '';
  const savedBreakdown = storage.financing?.costBreakdown || null;

  const { callAI, loading, error } = useAI();
  const [breakdown, setBreakdown] = useState(savedBreakdown);
  const [parseError, setParseError] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  const handleGenerate = useCallback(async () => {
    setParseError(false);
    const systemPrompt = buildCostSystemPrompt(brandIdea, feedback);
    const text = await callAI(systemPrompt, 'Generate my personalized cost breakdown for my brand.');
    if (!text) return;
    const parsed = parseCostBreakdown(text);
    if (!parsed) {
      setParseError(true);
      return;
    }
    setBreakdown(parsed);
    // Expand all categories by default
    const expanded = {};
    (parsed.categories || []).forEach((_, i) => { expanded[i] = true; });
    setExpandedCategories(expanded);
    // Save to localStorage for Pricing Calculator
    updateStorage((s) => ({
      ...s,
      financing: { ...s.financing, costBreakdown: parsed },
      sectionProgress: { ...s.sectionProgress, financing: 100 },
    }));
  }, [callAI, brandIdea, feedback]);

  const toggleCategory = useCallback((index) => {
    setExpandedCategories((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  // No brand idea nudge
  if (!brandIdea) {
    return (
      <div className="max-w-xl">
        <h2 className="font-display text-2xl text-text-primary mb-2">Your Cost Breakdown</h2>
        <div className="bg-background border border-border rounded-2xl p-8 text-center mt-6">
          <div className="text-4xl mb-3">💡</div>
          <p className="font-medium text-text-primary mb-1">Complete Brainstorm first</p>
          <p className="text-sm text-text-secondary">
            Your cost breakdown is personalized to your specific brand idea. Finish the Brainstorm
            section so we can generate real numbers for your product.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl text-text-primary">Your Cost Breakdown</h2>
          <p className="text-text-secondary mt-1 text-sm">
            Idea → first revenue via pre-orders, specific to your brand
          </p>
        </div>
        {breakdown && !loading && (
          <button
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 bg-background border border-border text-text-secondary px-3 py-2 rounded-xl text-xs font-medium hover:bg-card hover:text-text-primary transition-colors whitespace-nowrap"
          >
            <Sparkles size={13} />
            Regenerate
          </button>
        )}
      </div>

      {/* Brand idea context pill */}
      <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 mb-6">
        <p className="text-xs text-text-secondary font-medium uppercase tracking-wide mb-1">Based on your brand concept</p>
        <p className="text-sm text-text-primary line-clamp-2">{brandIdea}</p>
      </div>

      {/* Generate button (no breakdown yet) */}
      {!breakdown && !loading && !error && (
        <div className="text-center py-8 border border-dashed border-border rounded-2xl">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-text-secondary text-sm mb-6 max-w-sm mx-auto">
            AI will generate real cost estimates for your specific product type using Canadian pricing.
          </p>
          <button
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-medium hover:bg-accent-hover transition-colors"
          >
            <Sparkles size={18} />
            Generate My Cost Breakdown
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 size={40} className="animate-spin text-accent" />
          <p className="text-text-secondary text-sm">Building your personalized breakdown…</p>
        </div>
      )}

      {/* Error */}
      {(error || parseError) && !loading && (
        <div className="space-y-4">
          <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-danger flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-danger text-sm">
                {parseError ? 'Could not parse AI response' : 'Error calling AI'}
              </p>
              <p className="text-sm text-text-secondary mt-1">
                {error || 'The AI returned an unexpected format. Try again.'}
              </p>
            </div>
          </div>
          <div className="text-center">
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-accent-hover transition-colors"
            >
              <Sparkles size={16} />
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Breakdown display */}
      {breakdown && !loading && (
        <div className="space-y-3">
          {/* Category cards */}
          {(breakdown.categories || []).map((category, i) => (
            <CostCategoryCard
              key={i}
              category={category}
              isExpanded={!!expandedCategories[i]}
              onToggle={() => toggleCategory(i)}
            />
          ))}

          {/* Total row */}
          {breakdown.total && (
            <div className="bg-text-primary text-white rounded-xl px-5 py-4 flex items-center justify-between gap-3">
              <span className="font-semibold text-sm">Total Estimated Range</span>
              <div className="flex items-center gap-3 text-sm">
                <span className="opacity-70">{formatCAD(breakdown.total.low)}</span>
                <span className="opacity-50">–</span>
                <span className="font-bold text-base">{formatCAD(breakdown.total.mid)}</span>
                <span className="opacity-50">–</span>
                <span className="opacity-70">{formatCAD(breakdown.total.high)}</span>
              </div>
            </div>
          )}

          {/* Bootstrap Reality Check callout */}
          {breakdown.minimum_viable && (
            <div className="bg-success/10 border border-success/20 rounded-xl p-5">
              <p className="font-semibold text-text-primary text-sm mb-1">✅ Bootstrap Reality Check</p>
              <p className="text-sm text-text-secondary leading-relaxed">{breakdown.minimum_viable}</p>
            </div>
          )}

          {/* Timeline */}
          {breakdown.timeline_to_revenue && (
            <p className="text-xs text-text-secondary text-center pt-1">
              ⏱ {breakdown.timeline_to_revenue}
            </p>
          )}

          <p className="text-xs text-text-secondary text-center pt-2">
            Estimates saved — your Pricing Calculator will use these numbers
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function Financing() {
  const [activeTab, setActiveTab] = useState('grants');
  const [customGrants, setCustomGrants] = useState(
    () => getStorage().financing?.customGrants || [],
  );
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Read brand idea once (stable — doesn't change within a session)
  const brandIdea = getStorage().brainstorm?.currentIdea || '';

  // Mark section as in-progress on first visit
  useEffect(() => {
    updateStorage((s) => {
      const current = s.sectionProgress?.financing || 0;
      if (current === 0) {
        return {
          ...s,
          sectionProgress: { ...s.sectionProgress, financing: 50 },
        };
      }
      return s;
    });
  }, []);

  const allGrants = [...SEED_GRANTS, ...customGrants];
  const existingNames = new Set(allGrants.map((g) => g.name.toLowerCase().trim()));

  const handleAddGrants = useCallback(
    (newGrants) => {
      const updated = [...customGrants, ...newGrants];
      setCustomGrants(updated);
      updateStorage((s) => ({
        ...s,
        financing: { ...s.financing, customGrants: updated },
        sectionProgress: { ...s.sectionProgress, financing: 100 },
      }));
      const count = newGrants.length;
      setToast(`Added ${count} new grant${count !== 1 ? 's' : ''} to your table!`);
      setTimeout(() => setToast(null), 3500);
    },
    [customGrants],
  );

  const TABS = [
    { id: 'grants', label: '💰 Grants & Funding' },
    { id: 'breakdown', label: '📊 Your Cost Breakdown' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl text-text-primary mb-2">Financing</h1>
        <p className="text-text-secondary">
          Find funding and see exactly what it costs to launch your brand
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-background border border-border rounded-xl p-1 mb-8 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-card text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'grants' ? (
        <GrantsTab grants={allGrants} onOpenModal={() => setShowModal(true)} />
      ) : (
        <CostBreakdownTab />
      )}

      {/* AI Grant Finder Modal */}
      {showModal && (
        <AIGrantModal
          onClose={() => setShowModal(false)}
          onGrants={handleAddGrants}
          existingNames={existingNames}
          brandIdea={brandIdea}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-text-primary text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm z-50">
          <CheckCircle2 size={16} className="text-success flex-shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}
