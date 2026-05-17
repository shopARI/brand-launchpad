import { useState, useEffect, useCallback } from 'react';
import NextSectionButton from './NextSectionButton';
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

// \u2500\u2500\u2500 Seed Data \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const SEED_GRANTS = [
  {
    id: 'seed-1',
    name: 'Futurpreneur Canada',
    provider: 'Futurpreneur Canada',
    amount: 'Up to $60,000',
    deadline: null,
    deadlineLabel: 'Year-round',
    eligibility: 'Ages 18\u201339, Canadian resident, operating full-time',
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
    amount: '$50K \u2013 $5M',
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
    name: 'IRAP \u2014 Industrial Research Assistance Program',
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
    amount: '$1,000 \u2013 $10,000',
    deadline: null,
    deadlineLabel: 'Varies by province',
    eligibility: 'Varies by province \u2014 search your provincial government or CFDC portal',
    status: 'unknown',
    link: 'https://www.canada.ca/en/services/business/grants.html',
  },
];

// \u2500\u2500\u2500 Helpers \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const STATUS_CONFIG = {
  open: {
    label: 'Open',
    emoji: '\ud83d\udfe2',
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/20',
  },
  'closing-soon': {
    label: 'Closing Soon',
    emoji: '\ud83d\udfe1',
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/20',
  },
  closed: {
    label: 'Closed',
    emoji: '\ud83d\udd34',
    bg: 'bg-danger/10',
    text: 'text-danger',
    border: 'border-danger/20',
  },
  unknown: {
    label: 'Unknown',
    emoji: '\u26aa',
    bg: 'bg-border/50',
    text: 'text-text-secondary',
    border: 'border-border',
  },
  check: {
    label: 'Unknown',
    emoji: '\u26aa',
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
    return <span className="text-text-secondary text-sm">{label || '\u2014'}</span>;
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

// \u2500\u2500\u2500 AI Grant Finder \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function buildGrantSystemPrompt(brandIdea) {
  const brandContext = brandIdea
    ? `starting a specific brand: ${brandIdea}`
    : 'starting a beverage/CPG company';

  return `You are a Canadian small business funding expert. Search your knowledge for ALL grants, loans, micro-loans, pitch competitions, accelerators, and funding programs available to a 24-year-old solo female founder in Canada with income under $30K, ${brandContext}.\n\nReturn results as a JSON array with fields: name, provider, amount_range, deadline_info, eligibility_summary, application_url (if known, else "Search required"), status ("open"/"check"/"unknown").\n\nBe exhaustive. Include federal, provincial (all provinces), municipal, private foundation, and competition-based funding. Minimum 15 results. Return ONLY the JSON array, no other text.`;
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
    provider: raw.provider || '\u2014',
    amount: raw.amount_range || '\u2014',
    deadline: null,
    deadlineLabel: raw.deadline_info || '\u2014',
    eligibility: raw.eligibility_summary || '\u2014',
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
            <span className="text-2xl">\u2728</span>
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
              <div className="text-5xl mb-4">\ud83d\udd0d</div>
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
                Searching for grants\u2026 this may take 15\u201330 seconds
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
              <div className="text-4xl mb-3">\u2705</div>
              <p className="text-text-secondary">
                No new grants found \u2014 all results are already in your table.
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
                      {g.deadlineLabel && g.deadlineLabel !== '\u2014' && (
                        <>
                          <span className="text-border">\u00b7</span>
                          <span className="text-text-secondary">{g.deadlineLabel}</span>
                        </>
                      )}
                    </div>
                    {g.eligibility && g.eligibility !== '\u2014' && (
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

// \u2500\u2500\u2500 Grants Section (secondary, below cost breakdown) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function GrantsSection({ grants, onOpenModal }) {
  return (
    <div className="mt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="font-display text-xl text-text-primary">
            Grants &amp; Funding You Might Qualify For
          </h2>
          <p className="text-text-secondary mt-1 text-xs">
            Canadian programs for early-stage founders \u2014 verify eligibility before applying
          </p>
        </div>
        <button
          onClick={onOpenModal}
          className="inline-flex items-center gap-2 bg-background border border-border text-text-secondary px-4 py-2 rounded-xl text-sm font-medium hover:bg-card hover:text-text-primary transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Sparkles size={15} />
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
        {grants.length} programs listed{' '}
        <span className="inline-flex items-center gap-1">
          \u00b7 \ud83d\udfe2 Open \u00b7 \ud83d\udfe1 Closing Soon \u00b7 \ud83d\udd34 Closed \u00b7 \u26aa Unknown
        </span>{' '}
        \u00b7 Always verify eligibility directly with the program provider
      </p>
    </div>
  );
}


// \u2500\u2500\u2500 Equity Fundraising Data \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const ROUNDS_DATA = [
  { name: 'Pre-Seed', amount: '$50K\u2013$500K', stage: 'Idea, MVP, just you', investors: 'Angels, friends & family' },
  { name: 'Seed', amount: '$500K\u2013$3M', stage: 'Product exists, early users', investors: 'Seed funds, angels, small VCs' },
  { name: 'Series A', amount: '$3M\u2013$15M', stage: 'Product-market fit, scaling', investors: 'Institutional VCs' },
  { name: 'Series B/C/D', amount: '$15M\u2013$100M+', stage: 'Aggressive growth', investors: 'Large VCs, growth equity' },
];

const RISK_REWARD_STAGES = [
  { label: 'Pre-Seed', risk: 95, reward: 90, rewardLabel: '100x', riskLabel: '95%', description: "9 out of 10 companies fail here. But if yours doesn't, early investors can see 100x returns." },
  { label: 'Seed', risk: 70, reward: 70, rewardLabel: '20\u201350x', riskLabel: '70%', description: 'Still high risk, but the idea is proven. Returns are still massive.' },
  { label: 'Series A', risk: 40, reward: 50, rewardLabel: '10\u201320x', riskLabel: '40%', description: 'Product-market fit exists. Risk drops significantly.' },
  { label: 'Series B+', risk: 20, reward: 30, rewardLabel: '3\u201310x', riskLabel: '20%', description: 'Company is growing. Lower risk, lower upside.' },
  { label: 'IPO/Exit', risk: 5, reward: 15, rewardLabel: '2\u20135x', riskLabel: '5%', description: 'Mature company. Steady returns, minimal risk.' },
];

// \u2500\u2500\u2500 Risk/Reward Diagram \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function RiskRewardDiagram() {
  const [selected, setSelected] = useState(0);
  const stage = RISK_REWARD_STAGES[selected];

  return (
    <div className="space-y-5">
      <div className="relative">
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-border" />
        <div
          className="absolute top-4 left-6 h-0.5 bg-accent transition-all duration-300"
          style={{ width: `calc(${(selected / (RISK_REWARD_STAGES.length - 1)) * 100}% - 0px)` }}
        />
        <div className="flex justify-between relative">
          {RISK_REWARD_STAGES.map((s, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className="flex flex-col items-center gap-2 group w-16"
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  i === selected
                    ? 'bg-accent border-accent text-white scale-110 shadow-md'
                    : i < selected
                    ? 'bg-accent border-accent text-white'
                    : 'bg-card border-border text-text-secondary group-hover:border-accent/60'
                }`}
              >
                <span className="text-xs font-bold">{i + 1}</span>
              </div>
              <span
                className={`text-xs font-medium text-center leading-tight transition-colors ${
                  i === selected ? 'text-accent' : 'text-text-secondary'
                }`}
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 transition-all duration-200">
        <div className="mb-4">
          <h4 className="font-display text-lg font-bold text-text-primary">{stage.label}</h4>
          <p className="text-sm text-text-secondary mt-1 leading-relaxed">{stage.description}</p>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium" style={{ color: '#f97316' }}>Failure Risk</span>
              <span className="font-bold" style={{ color: '#f97316' }}>{stage.riskLabel}</span>
            </div>
            <div className="h-3 bg-border/60 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${stage.risk}%`, background: 'linear-gradient(90deg, #fb923c, #ef4444)' }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-accent">Potential Return</span>
              <span className="font-bold text-accent">{stage.rewardLabel}</span>
            </div>
            <div className="h-3 bg-border/60 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${stage.reward}%`, background: 'linear-gradient(90deg, #22c55e, #16a34a)' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {RISK_REWARD_STAGES.map((s, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`p-2.5 rounded-lg border text-center transition-all ${
              i === selected ? 'border-accent bg-accent/10' : 'border-border bg-background hover:border-accent/40'
            }`}
          >
            <p className="text-xs font-bold" style={{ color: '#f97316' }}>{s.riskLabel}</p>
            <p className="text-xs text-text-secondary my-0.5">fail</p>
            <p className="text-xs font-bold text-accent">{s.rewardLabel}</p>
            <p className="text-xs text-text-secondary">return</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// \u2500\u2500\u2500 Equity Fundraising Section \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function EquityFundraisingSection() {
  const [roundSelected, setRoundSelected] = useState(null);

  return (
    <div className="p-5 sm:p-6 space-y-8">
      {/* 1a */}
      <div>
        <h3 className="font-display text-lg font-bold text-text-primary mb-2">What is Equity Fundraising?</h3>
        <p className="text-text-secondary text-sm leading-relaxed">
          You give away a percentage of your company in exchange for money to grow it. The investor
          bets that your company will be worth a lot more later \u2014 and their slice becomes valuable.
        </p>
      </div>

      {/* 1b — SAFEs */}
      <div>
        <h3 className="font-display text-lg font-bold text-text-primary mb-3">The Structure \u2014 SAFEs</h3>
        <p className="text-text-secondary text-sm leading-relaxed mb-4">
          A <span className="font-semibold text-text-primary">SAFE</span> (Simple Agreement for Future Equity) is the
          standard way early startups raise money. It's <span className="font-semibold text-text-primary">NOT a loan</span> \u2014 no
          interest, no monthly payments. You're selling a promise of future shares. Your company doesn't have a
          price tag yet, so you set a <span className="font-semibold text-accent">Valuation Cap</span> \u2014 the max
          price the investor's money converts at.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-xl mb-2">\ud83e\udd1d</div>
            <p className="font-display text-sm font-bold text-text-primary mb-2">The Deal</p>
            <ul className="space-y-1.5 text-xs text-text-secondary leading-relaxed">
              <li>You raise <span className="font-semibold text-text-primary">$100K</span></li>
              <li>Valuation cap: <span className="font-semibold text-accent">$1M</span></li>
              <li>The investor gets a promise of future shares</li>
            </ul>
          </div>
          <div className="bg-card border border-accent/30 rounded-xl p-4">
            <div className="text-xl mb-2">\ud83d\udcc8</div>
            <p className="font-display text-sm font-bold text-text-primary mb-2">Later \u2014 Series A</p>
            <ul className="space-y-1.5 text-xs text-text-secondary leading-relaxed">
              <li>Your company is now valued at <span className="font-semibold text-text-primary">$5M</span></li>
              <li>$100K converts at the <span className="font-semibold text-accent">$1M cap</span> (not $5M)</li>
              <li>They get: $100K \u00f7 $1M = <span className="font-bold text-accent">10%</span> of the company</li>
            </ul>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-xl mb-2">\ud83d\udca1</div>
            <p className="font-display text-sm font-bold text-text-primary mb-2">Why the Cap Matters</p>
            <ul className="space-y-1.5 text-xs text-text-secondary leading-relaxed">
              <li>Without cap: $100K \u00f7 $5M = <span className="font-semibold text-text-primary">only 2%</span></li>
              <li>The cap rewards early investors for taking the biggest risk</li>
              <li>If worth less than the cap, they convert at the lower price</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 1c — Rounds */}
      <div>
        <h3 className="font-display text-lg font-bold text-text-primary mb-3">The Rounds</h3>
        <div className="space-y-2">
          {ROUNDS_DATA.map((round, i) => (
            <button
              key={i}
              onClick={() => setRoundSelected(roundSelected === i ? null : i)}
              className={`w-full text-left rounded-xl border p-4 transition-all ${
                roundSelected === i ? 'bg-accent/10 border-accent/40' : 'bg-card border-border hover:border-accent/30'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    roundSelected === i ? 'bg-accent text-white' : 'bg-background text-text-secondary border border-border'
                  }`}>
                    {i + 1}
                  </div>
                  <div>
                    <span className="font-semibold text-text-primary text-sm">{round.name}</span>
                    <span className="ml-2 text-sm font-bold text-accent">{round.amount}</span>
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-text-secondary flex-shrink-0 transition-transform duration-200 ${roundSelected === i ? 'rotate-180' : ''}`}
                />
              </div>
              {roundSelected === i && (
                <div className="mt-3 pt-3 border-t border-accent/20 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-text-secondary font-medium uppercase tracking-wide mb-0.5">Stage</p>
                    <p className="text-xs text-text-primary">{round.stage}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary font-medium uppercase tracking-wide mb-0.5">Who Invests</p>
                    <p className="text-xs text-text-primary">{round.investors}</p>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-text-secondary mt-3 italic px-1">
          Each round, the valuation and amount raised go up \u2014 but the percentage you give away stays similar (15\u201325%).
        </p>
      </div>

      {/* 1d — Risk/Reward */}
      <div>
        <h3 className="font-display text-lg font-bold text-text-primary mb-1">Risk vs. Reward Over Time</h3>
        <p className="text-text-secondary text-xs mb-4 leading-relaxed">
          Click each stage to see risk and return potential. Both decrease as the company matures.
        </p>
        <RiskRewardDiagram />
      </div>

      {/* 1e — Outcomes */}
      <div>
        <h3 className="font-display text-lg font-bold text-text-primary mb-3">How It Ends</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { emoji: '\ud83d\ude80', title: 'IPO', body: 'Company goes public. Shares become tradeable stock. Rare, but the dream.', border: 'border-accent/30' },
            { emoji: '\ud83d\udcb0', title: 'Acquisition', body: "Another company buys yours. Investors get paid based on their %. Most common good outcome.", border: 'border-success/30' },
            { emoji: '\ud83d\udcc9', title: 'Failure', body: "Company runs out of money. Investors lose their investment. You lose time, not money (no debt). Most common outcome.", border: 'border-red-400/30' },
            { emoji: '\ud83d\udd04', title: 'Zombie', body: "Company survives but doesn't grow. Investors are stuck. You have a job you made for yourself.", border: 'border-border' },
          ].map((outcome) => (
            <div key={outcome.title} className={`bg-card border ${outcome.border} rounded-xl p-4`}>
              <div className="text-2xl mb-2">{outcome.emoji}</div>
              <p className="font-display text-sm font-bold text-text-primary mb-1">{outcome.title}</p>
              <p className="text-xs text-text-secondary leading-relaxed">{outcome.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 1f — Finding Investors */}
      <div>
        <h3 className="font-display text-lg font-bold text-text-primary mb-3">How to Find Investors</h3>
        <div className="space-y-2">
          {[
            { emoji: '\ud83d\udc65', title: 'Personal Network', body: 'Friends, family, former colleagues who believe in YOU. Often your first check.' },
            { emoji: '\ud83e\udd1d', title: 'Warm Intros', body: 'Someone you know introduces you to an investor. Cold emails almost never work.' },
            { emoji: '\ud83d\udd04', title: 'Your Existing Investors', body: 'Once you have one, they introduce you to others. Snowball effect.' },
            { emoji: '\ud83d\udc8e', title: 'High Net Worth Individuals', body: 'People passionate about beverages or your mission. Industry events, LinkedIn, AngelList.' },
          ].map((source) => (
            <div key={source.title} className="flex items-start gap-3 bg-card border border-border rounded-xl p-4">
              <span className="text-xl flex-shrink-0">{source.emoji}</span>
              <div>
                <p className="font-semibold text-text-primary text-sm">{source.title}</p>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{source.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// \u2500\u2500\u2500 Cost Breakdown \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function buildCostSystemPrompt(brandIdea, feedback) {
  const context = [brandIdea, feedback ? `Additional context: ${feedback}` : '']
    .filter(Boolean)
    .join('\n');

  return `You are a Canadian beverage industry financial advisor. The user is a solo founder in Canada planning to bootstrap with pre-orders.

Their brand concept:
${context}

Generate a cost breakdown distinguishing DIY (things a solo founder does herself for free) vs Paid (unavoidable real costs). Return ONLY valid JSON in this exact structure:

{
  "categories": [
    {
      "name": "Branding & Design",
      "type": "diy",
      "diyNote": "You can do this yourself with Canva and free tools",
      "items": [
        { "item": "Logo design", "diyCost": 0, "hireCost": { "low": 200, "high": 800 }, "note": "Canva has free logo templates" }
      ]
    },
    {
      "name": "Initial Production",
      "type": "paid",
      "items": [
        { "item": "Co-packer minimum order", "low": 2000, "high": 10000, "note": "Typical MOQ for small batch canning" }
      ]
    }
  ],
  "totalPaid": { "low": 0, "high": 0 },
  "totalWithHiring": { "low": 0, "high": 0 },
  "minimum_viable": "You can validate demand for as little as $X with just...",
  "timeline_to_revenue": "X-Y months from start to first pre-order revenue"
}

DIY categories (type: "diy"): branding/logo, social media setup, content creation, photography, website building (Shopify templates), email marketing setup
Paid categories (type: "paid"): business registration, domain, Shopify subscription, co-packer deposit, ingredients, packaging MOQ, shipping supplies, insurance, excise license (if alcohol/RTD)

Rules:
- totalPaid = sum of all paid category item ranges
- totalWithHiring = totalPaid + all DIY hireCost ranges
- Be specific to their product type and use real Canadian pricing
- Each category must have 2-4 line items
- Return ONLY valid JSON, no other text`;
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
  if (typeof num !== 'number') return '\u2014';
  return `$${num.toLocaleString('en-CA')}`;
}

// DIY category card \u2014 muted, $0 hero, hire cost secondary
function DIYCategoryCard({ category }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-background border border-dashed border-border/40 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-border/10 transition-colors"
      >
        <div className="flex flex-col gap-1.5 min-w-0">
          <span className="font-medium text-text-secondary text-sm">{category.name}</span>
          <span className="inline-flex w-fit text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
            \ud83d\ude4b\u200d\u2640\ufe0f You'll likely do this yourself
          </span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-lg font-bold text-text-secondary">$0</span>
          {isExpanded ? (
            <ChevronUp size={16} className="text-text-secondary" />
          ) : (
            <ChevronDown size={16} className="text-text-secondary" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-dashed border-border/30">
          {category.diyNote && (
            <p className="text-xs text-text-secondary px-5 py-2.5 bg-accent/5 italic">
              \ud83d\udca1 {category.diyNote}
            </p>
          )}
          <div className="divide-y divide-border/20">
            {(category.items || []).map((item, i) => (
              <div key={i} className="px-5 py-3 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <span className="text-sm text-text-primary">{item.item}</span>
                  {item.note && (
                    <p className="text-xs text-text-secondary mt-0.5">{item.note}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-text-secondary">$0</div>
                  {item.hireCost && (
                    <div className="text-xs text-text-secondary mt-0.5 whitespace-nowrap">
                      Or hire: {formatCAD(item.hireCost.low)}\u2013{formatCAD(item.hireCost.high)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Paid category card \u2014 normal styling, real cost ranges
function PaidCategoryCard({ category }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const catTotal = (category.items || []).reduce(
    (acc, item) => ({
      low: acc.low + (item.low || 0),
      high: acc.high + (item.high || 0),
    }),
    { low: 0, high: 0 },
  );

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-background/50 transition-colors"
      >
        <span className="font-medium text-text-primary text-sm">{category.name}</span>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="font-semibold text-accent text-sm whitespace-nowrap">
            {formatCAD(catTotal.low)}\u2013{formatCAD(catTotal.high)}
          </span>
          {isExpanded ? (
            <ChevronUp size={16} className="text-text-secondary" />
          ) : (
            <ChevronDown size={16} className="text-text-secondary" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border divide-y divide-border/50">
          {(category.items || []).map((item, i) => (
            <div key={i} className="px-5 py-3 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <span className="text-sm text-text-primary">{item.item}</span>
                {item.note && (
                  <p className="text-xs text-text-secondary mt-0.5">{item.note}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-sm font-medium text-text-primary whitespace-nowrap">
                  {formatCAD(item.low)}\u2013{formatCAD(item.high)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// \u2500\u2500\u2500 Cost Breakdown Section \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function CostBreakdownSection() {
  const storage = getStorage();
  const brandIdea = storage.brainstorm?.currentIdea || '';
  const feedback = storage.brainstorm?.feedback || '';
  const savedBreakdown = storage.financing?.costBreakdown || null;

  const { callAI, loading, error } = useAI();
  const [breakdown, setBreakdown] = useState(savedBreakdown);
  const [parseError, setParseError] = useState(false);

  const handleGenerate = useCallback(async () => {
    setParseError(false);
    const systemPrompt = buildCostSystemPrompt(brandIdea, feedback);
    const text = await callAI(
      systemPrompt,
      'Generate my personalized cost breakdown for my brand.',
    );
    if (!text) return;
    const parsed = parseCostBreakdown(text);
    if (!parsed) {
      setParseError(true);
      return;
    }
    setBreakdown(parsed);
    updateStorage((s) => ({
      ...s,
      financing: { ...s.financing, costBreakdown: parsed },
      sectionProgress: { ...s.sectionProgress, financing: 100 },
    }));
  }, [callAI, brandIdea, feedback]);

  // No brand idea \u2014 show nudge
  if (!brandIdea) {
    return (
      <div className="bg-background border border-border rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">\ud83d\udca1</div>
        <p className="font-medium text-text-primary mb-2">Complete Brainstorm first</p>
        <p className="text-sm text-text-secondary">
          Your cost breakdown is personalized to your brand idea. Finish the Brainstorm section so
          we can generate real numbers for your product.
        </p>
      </div>
    );
  }

  const diyCategories = (breakdown?.categories || []).filter((c) => c.type === 'diy');
  const paidCategories = (breakdown?.categories || []).filter((c) => c.type === 'paid');

  return (
    <div>
      {/* Brand context pill */}
      <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 mb-6">
        <p className="text-xs text-text-secondary font-medium uppercase tracking-wide mb-1">
          Based on your brand concept
        </p>
        <p className="text-sm text-text-primary line-clamp-2">{brandIdea}</p>
      </div>

      {/* Generate button (no breakdown yet) */}
      {!breakdown && !loading && !(error || parseError) && (
        <div className="text-center py-10 border border-dashed border-border rounded-2xl">
          <div className="text-5xl mb-4">\ud83d\udcca</div>
          <p className="text-text-secondary text-sm mb-6 max-w-sm mx-auto">
            AI will generate real cost estimates for your specific product type using Canadian
            pricing \u2014 and show you what you can do yourself vs. what actually costs money.
          </p>
          <button
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 bg-accent text-white px-7 py-3.5 rounded-xl font-semibold text-base hover:bg-accent-hover transition-colors shadow-sm"
          >
            <Sparkles size={20} />
            Generate My Cost Breakdown
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 size={40} className="animate-spin text-accent" />
          <p className="text-text-secondary text-sm">Building your personalized breakdown\u2026</p>
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
          {/* Regenerate */}
          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 bg-background border border-border text-text-secondary px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-card hover:text-text-primary transition-colors"
            >
              <Sparkles size={12} />
              Regenerate
            </button>
          </div>

          {/* DIY section */}
          {diyCategories.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide px-1 pt-1">
                \ud83d\ude4b\u200d\u2640\ufe0f What you'll do yourself (free)
              </p>
              {diyCategories.map((cat, i) => (
                <DIYCategoryCard key={i} category={cat} />
              ))}
            </div>
          )}

          {/* Paid section */}
          {paidCategories.length > 0 && (
            <div className="space-y-2 mt-2">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide px-1 pt-1">
                \ud83d\udcb3 What you'll actually spend
              </p>
              {paidCategories.map((cat, i) => (
                <PaidCategoryCard key={i} category={cat} />
              ))}
            </div>
          )}

          {/* Running totals hero */}
          <div className="rounded-xl overflow-hidden border border-accent/30 mt-4">
            <div className="bg-accent/5 px-5 py-5 text-center">
              <p className="text-sm text-text-secondary mb-1 font-medium">
                What you'll actually spend
              </p>
              {breakdown.totalPaid ? (
                <p className="text-3xl font-bold text-accent">
                  {formatCAD(breakdown.totalPaid.low)}{' '}
                  <span className="text-text-secondary text-2xl font-normal">\u2013</span>{' '}
                  {formatCAD(breakdown.totalPaid.high)}
                </p>
              ) : (
                <p className="text-3xl font-bold text-accent">\u2014</p>
              )}
              <p className="text-xs text-text-secondary mt-1">paid items only</p>
            </div>
            {breakdown.totalWithHiring && (
              <div className="bg-background/50 px-5 py-3 text-center border-t border-border/30">
                <p className="text-xs text-text-secondary">
                  If you hired out everything:{' '}
                  <span className="font-semibold text-text-primary">
                    {formatCAD(breakdown.totalWithHiring.low)}{' '}
                    \u2013{' '}
                    {formatCAD(breakdown.totalWithHiring.high)}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Minimum viable callout */}
          {breakdown.minimum_viable && (
            <div className="bg-success/10 border border-success/20 rounded-xl p-5">
              <p className="font-semibold text-text-primary text-sm mb-1">
                \u2705 Bootstrap Reality Check
              </p>
              <p className="text-sm text-text-secondary leading-relaxed">
                {breakdown.minimum_viable}
              </p>
            </div>
          )}

          {/* Timeline */}
          {breakdown.timeline_to_revenue && (
            <p className="text-xs text-text-secondary text-center pt-1">
              \u23f1 {breakdown.timeline_to_revenue}
            </p>
          )}

          <p className="text-xs text-text-secondary text-center pt-2">
            Estimates saved \u2014 your Pricing Calculator will use these numbers
          </p>
        </div>
      )}
    </div>
  );
}

// \u2500\u2500\u2500 Main Component \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export function Financing({ setActiveSection }) {
  const [customGrants, setCustomGrants] = useState(
    () => getStorage().financing?.customGrants || [],
  );
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [equityOpen, setEquityOpen] = useState(false);
  const [grantsOpen, setGrantsOpen] = useState(true);

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

  return (
    <div className="max-w-3xl mx-auto py-8 px-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl text-text-primary mb-2">Your Launch Costs</h1>
        <p className="text-text-secondary text-sm">
          A personalized breakdown based on your brand idea.
        </p>
      </div>

      {/* Cost Breakdown \u2014 main content */}
      <CostBreakdownSection />

      {/* How to Fund Your Brand */}
      <div className="mt-12 pt-10 border-t border-border/50">
        <div className="mb-5">
          <h2 className="font-display text-2xl text-text-primary">How to Fund Your Brand</h2>
          <p className="text-text-secondary text-sm mt-1">
            Now that you know what it costs, here's how to pay for it.
          </p>
        </div>

        {/* Equity Fundraising Accordion */}
        <div className="bg-card border border-border rounded-xl mb-3 overflow-hidden">
          <button
            onClick={() => setEquityOpen((v) => !v)}
            className="w-full text-left p-4 flex justify-between items-center cursor-pointer hover:bg-background/50 transition-colors"
          >
            <span className="font-display text-lg text-text-primary">
              \ud83d\udcb0 Equity Fundraising \u2014 Investors &amp; Rounds
            </span>
            <ChevronDown
              size={20}
              className={`text-text-secondary transition-transform duration-200 ${equityOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {equityOpen && (
            <div className="border-t border-border">
              <EquityFundraisingSection />
            </div>
          )}
        </div>

        {/* Grants Accordion — open by default */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setGrantsOpen((v) => !v)}
            className="w-full text-left p-4 flex justify-between items-center cursor-pointer hover:bg-background/50 transition-colors"
          >
            <span className="font-display text-lg text-text-primary">
              \ud83c\udf81 Grants &amp; Non-Dilutive Funding
            </span>
            <ChevronDown
              size={20}
              className={`text-text-secondary transition-transform duration-200 ${grantsOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {grantsOpen && (
            <div className="border-t border-border px-5 sm:px-6 pb-5">
              <div className="bg-success/10 border border-success/20 rounded-xl p-4 my-5">
                <p className="text-sm text-text-primary leading-relaxed">
                  <span className="font-semibold">Non-dilutive funding</span> \u2014 you keep 100% of your
                  company. Grants are typically $5K\u2013$100K. Less than equity rounds, but enough to
                  cover your first production run, branding, or market research. And you never pay it back.
                </p>
              </div>
              <GrantsSection grants={allGrants} onOpenModal={() => setShowModal(true)} />
            </div>
          )}
        </div>
      </div>

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

      <NextSectionButton
        nextSection="branding"
        nextLabel="Branding Guide"
        setActiveSection={setActiveSection}
      />
    </div>
  );
}
