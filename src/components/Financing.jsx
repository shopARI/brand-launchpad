import { useState, useEffect, useCallback } from 'react';
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
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

// ─── Bootstrap Path Steps ─────────────────────────────────────────────────────

const BOOTSTRAP_STEPS = [
  {
    id: 1,
    icon: '🔍',
    title: 'Validate Before You Build',
    tagline: 'Prove demand before spending a dollar',
    tools: [
      'Carrd (free landing page builder)',
      'Mailchimp (free email list up to 500 subscribers)',
      'Typeform (free waitlist & survey forms)',
      'Google Forms (free surveys)',
    ],
    strategies: [
      'Build a one-page website with Carrd in a few hours — describe your product and capture emails',
      'Run a 2-week social media campaign to drive signups before you have a product',
      'Set a clear validation target: 100 email signups or 10 pre-orders before spending on production',
      'Interview 20 potential customers about their pain points — free user research that beats any focus group',
    ],
  },
  {
    id: 2,
    icon: '🛠️',
    title: 'Use Free Tools',
    tagline: 'Build a professional brand for $0',
    tools: [
      'Carrd (website — free tier)',
      'Mailchimp (email marketing — free up to 500 contacts)',
      'Canva (design, branding, packaging mockups — free)',
      'Shopify $1/month Starter plan (basic store)',
      'Meta Business Suite (social scheduling — free)',
      'Google Analytics (website analytics — free)',
    ],
    strategies: [
      'Design your entire visual identity on Canva — logo, packaging mockups, social templates, all free',
      'Use Shopify\'s $1/month plan to sell; upgrade only when you have consistent revenue',
      'Schedule 30 days of social content in Meta Business Suite in one afternoon — stay consistent for free',
      'Create a Notion page as your internal brand bible — strategy, voice, suppliers, everything',
    ],
  },
  {
    id: 3,
    icon: '💸',
    title: 'Revenue Before Product',
    tagline: 'Get paid before you produce',
    tools: [
      'Printful (print-on-demand merch — zero upfront cost)',
      'Stripe (payment processing — free to start)',
      'Memberful (founding memberships — free plan)',
      'Eventbrite (tasting events — free for free events)',
    ],
    strategies: [
      'Launch branded merch via Printful — hats, tote bags, shirts with zero inventory or upfront cost',
      'Sell "Founding Member" packages ($50–$200) for first-batch access + behind-the-scenes perks',
      'Host paid tasting events at local venues or pop-ups to build community and early revenue',
      'Use pre-order deposit revenue to fund your first production run — prove demand before committing',
    ],
  },
  {
    id: 4,
    icon: '🚀',
    title: 'When You\'re Ready for Capital',
    tagline: 'Let your traction do the talking',
    tools: [
      'Futurpreneur Canada (up to $60K loan + mentorship)',
      'BDC Starter loans (flexible terms for early founders)',
      'Community Futures Development Corporation (regional grants)',
      'YC SAFE note template (free — for friends & family rounds)',
    ],
    strategies: [
      'Use pre-order numbers and email list size as proof of demand in every grant application',
      'Apply for Futurpreneur first — $20K–$60K loan with a business mentor, built for founders under 40',
      'Approach friends and family with a simple SAFE note — YC\'s template is free and keeps it professional',
      'Contact your local CFDC (Community Futures Development Corporation) for under-the-radar regional grants',
    ],
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

  // Deadline color coding: past=red, within 30 days=yellow, future=green
  let colorClass = 'text-success'; // future (> 30 days)
  if (diffDays < 0) colorClass = 'text-danger'; // past
  else if (diffDays <= 30) colorClass = 'text-warning'; // within 30 days

  return (
    <span className={`text-sm font-medium ${colorClass}`}>
      {label || deadlineDate.toLocaleDateString('en-CA')}
    </span>
  );
}

// ─── AI Grant Finder ──────────────────────────────────────────────────────────

const AI_SYSTEM_PROMPT = `You are a Canadian small business funding expert. Search your knowledge for ALL grants, loans, micro-loans, pitch competitions, accelerators, and funding programs available to a 24-year-old solo female founder in Canada with income under $30K starting a beverage/CPG company.

Return results as a JSON array with fields: name, provider, amount_range, deadline_info, eligibility_summary, application_url (if known, else "Search required"), status ("open"/"check"/"unknown").

Be exhaustive. Include federal, provincial (all provinces), municipal, private foundation, and competition-based funding. Minimum 15 results. Return ONLY the JSON array, no other text.`;

function parseGrantsFromAI(text) {
  try {
    // Extract JSON array from the AI response text
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

function AIGrantModal({ onClose, onGrants, existingNames }) {
  const { callAI, loading, error } = useAI();
  const [searched, setSearched] = useState(false);
  const [parsed, setParsed] = useState([]);

  const handleSearch = useCallback(async () => {
    setSearched(false);
    const text = await callAI(
      AI_SYSTEM_PROMPT,
      'Find me all available grants, loans, and funding opportunities for my profile.',
    );
    if (!text) return;
    const grants = parseGrantsFromAI(text).map(normalizeAIGrant);
    // De-duplicate by name (case-insensitive)
    const deduped = grants.filter((g) => !existingNames.has(g.name.toLowerCase().trim()));
    setParsed(deduped);
    setSearched(true);
  }, [callAI, existingNames]);

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
                Discovers grants tailored to your founder profile
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
              <p className="text-text-secondary mb-6 max-w-md mx-auto text-sm leading-relaxed">
                Claude will search its knowledge for grants, loans, accelerators, and pitch
                competitions tailored to a 24-year-old female founder in Canada's beverage / CPG sector.
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

// ─── Grants & Funding Tab ─────────────────────────────────────────────────────

function GrantsTab({ grants, onOpenModal }) {
  return (
    <div>
      {/* Tab Header */}
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
          Find More Grants With AI
        </button>
      </div>

      {/* Grants Table — horizontal scroll on mobile */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-background/60">
                <th className="text-left px-4 py-3 font-semibold text-text-secondary whitespace-nowrap text-xs uppercase tracking-wide">
                  Program Name
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
                  Eligibility Notes
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
          Status key: 🟢 Open · 🟡 Closing Soon · 🔴 Closed · ⚪ Unknown
        </span>{' '}
        · Always verify eligibility directly with the program provider
      </p>
    </div>
  );
}

// ─── Bootstrap Path Tab ───────────────────────────────────────────────────────

function BootstrapStep({ step, isLast }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex gap-5">
      {/* Left column: icon + connecting line */}
      <div className="flex flex-col items-center flex-shrink-0 w-12">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center text-xl shadow-md hover:bg-accent-hover transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 flex-shrink-0 hover:scale-105"
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${step.title}`}
        >
          {step.icon}
        </button>
        {!isLast && (
          <div
            className="flex-1 mt-1 mb-0"
            style={{ width: '2px', background: 'linear-gradient(to bottom, #C4762B40, #C4762B10)', minHeight: '40px' }}
          />
        )}
      </div>

      {/* Right column: content */}
      <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-8'}`}>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="w-full text-left group focus:outline-none"
        >
          <div className="flex items-start justify-between gap-3 pt-2">
            <div>
              <h3 className="font-display text-xl text-text-primary group-hover:text-accent transition-colors leading-snug">
                {step.title}
              </h3>
              <p className="text-sm text-text-secondary mt-0.5">{step.tagline}</p>
            </div>
            <span className="text-text-secondary group-hover:text-accent transition-colors mt-2 flex-shrink-0">
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </span>
          </div>
        </button>

        {expanded && (
          <div className="mt-4 space-y-3">
            {/* Tools */}
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
                🛠️ Free Tools to Use
              </p>
              <ul className="space-y-2">
                {step.tools.map((tool, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                    <CheckCircle2
                      size={15}
                      className="text-success mt-0.5 flex-shrink-0"
                    />
                    {tool}
                  </li>
                ))}
              </ul>
            </div>

            {/* Strategies */}
            <div className="bg-background border border-border rounded-xl p-4">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
                💡 Action Strategies
              </p>
              <ul className="space-y-2.5">
                {step.strategies.map((strategy, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary leading-relaxed">
                    <span className="text-accent font-bold mt-0.5 flex-shrink-0">→</span>
                    {strategy}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BootstrapTab() {
  return (
    <div>
      {/* Tab Header */}
      <div className="mb-8">
        <h2 className="font-display text-2xl text-text-primary">How to Launch With $0</h2>
        <p className="text-text-secondary mt-1 text-sm">
          A practical roadmap for bootstrapping your beverage brand from idea to revenue
        </p>
      </div>

      {/* Roadmap */}
      <div className="max-w-2xl">
        {BOOTSTRAP_STEPS.map((step, index) => (
          <BootstrapStep
            key={step.id}
            step={step}
            isLast={index === BOOTSTRAP_STEPS.length - 1}
          />
        ))}
      </div>

      {/* Closing Callout */}
      <div className="mt-6 bg-accent/10 border border-accent/20 rounded-2xl p-6 max-w-2xl">
        <p className="font-display text-lg text-text-primary mb-2">💬 A Founder's Reminder</p>
        <p className="text-sm text-text-secondary leading-relaxed">
          Most successful beverage brands started with less than $10K. Revenue validates your idea
          better than any grant — use grants to <em>accelerate</em>, not to start. Your traction is
          your best pitch.
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Financing() {
  const [activeTab, setActiveTab] = useState('grants');
  // Lazy initializer reads localStorage once on mount — avoids setState inside effect
  const [customGrants, setCustomGrants] = useState(
    () => getStorage().financing?.customGrants || [],
  );
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Mark section as in-progress when first visited — writes to localStorage (external system only)
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
      // Persist to localStorage and mark section complete
      updateStorage((s) => ({
        ...s,
        financing: { ...s.financing, customGrants: updated },
        sectionProgress: { ...s.sectionProgress, financing: 100 },
      }));
      // Show toast
      const count = newGrants.length;
      setToast(`Added ${count} new grant${count !== 1 ? 's' : ''} to your table!`);
      setTimeout(() => setToast(null), 3500);
    },
    [customGrants],
  );

  const TABS = [
    { id: 'grants', label: '💰 Grants & Funding' },
    { id: 'bootstrap', label: '🚀 Bootstrap Path' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl text-text-primary mb-2">Financing & Grants</h1>
        <p className="text-text-secondary text-lg">
          Discover funding opportunities and learn how to launch resourcefully
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
        <BootstrapTab />
      )}

      {/* AI Grant Finder Modal */}
      {showModal && (
        <AIGrantModal
          onClose={() => setShowModal(false)}
          onGrants={handleAddGrants}
          existingNames={existingNames}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-text-primary text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm z-50">
          <CheckCircle2 size={16} className="text-success flex-shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}
