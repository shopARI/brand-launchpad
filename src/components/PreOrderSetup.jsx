import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAI } from '../hooks/useAI';
import { getStorage, updateStorage } from '../utils/storage';

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

// ─── Constants ──────────────────────────────────────────────────────────────

const PLATFORMS = [
  {
    id: 'shopify',
    name: 'Shopify',
    cost: '$1/mo (first 3 months)',
    bestFor: 'Full store + pre-orders',
    preOrderFeature: 'Built-in with apps',
    difficulty: 'Easy',
    recommended: true,
  },
  {
    id: 'squarespace',
    name: 'Squarespace',
    cost: '$16/mo',
    bestFor: 'Beautiful landing pages',
    preOrderFeature: 'Limited',
    difficulty: 'Easy',
    recommended: false,
  },
  {
    id: 'carrd',
    name: 'Carrd',
    cost: '$19/year',
    bestFor: 'Simple one-page sites',
    preOrderFeature: 'No native, link to Stripe',
    difficulty: 'Very Easy',
    recommended: true,
  },
  {
    id: 'gumroad',
    name: 'Gumroad',
    cost: 'Free (10% fee)',
    bestFor: 'Digital + physical',
    preOrderFeature: 'Built-in',
    difficulty: 'Very Easy',
    recommended: false,
  },
  {
    id: 'crowdfunding',
    name: 'Kickstarter / Indiegogo',
    cost: '5–8% fee',
    bestFor: 'Crowdfunding',
    preOrderFeature: 'Core feature',
    difficulty: 'Medium',
    recommended: false,
  },
  {
    id: 'stripe',
    name: 'Stripe Payment Links',
    cost: '2.9% + $0.30/tx',
    bestFor: 'Direct payment',
    preOrderFeature: 'Payment only',
    difficulty: 'Easy',
    recommended: false,
  },
];

const PLATFORM_INSTRUCTIONS = {
  shopify: {
    title: 'Setting Up Pre-Orders on Shopify',
    steps: [
      'Sign up at shopify.com and start your $1/month trial.',
      'In your Shopify admin, go to Products and create your beverage product.',
      'Set inventory to "Track quantity" and enter 0 stock.',
      'Go to the Shopify App Store and install a pre-order app (e.g., Pre-Order Now or Timesact).',
      'Configure the app to show "Pre-Order" button when stock is zero.',
      'Set your expected ship date in the product description and pre-order app settings.',
      'Enable a payment provider (Shopify Payments recommended) in Settings → Payments.',
      'Publish your product and test the checkout flow with a small purchase.',
    ],
  },
  squarespace: {
    title: 'Setting Up Pre-Orders on Squarespace',
    steps: [
      'Create a Squarespace account and choose a store-enabled template.',
      'Add a Commerce plan to enable online store features.',
      'Go to Pages → Store and add your beverage product.',
      'In product settings, enable "Limited availability" and set quantity to a small number.',
      'Add a disclaimer in the product description: "Pre-order — ships [date]."',
      'Enable Stripe or PayPal as your payment processor in Commerce → Payments.',
      'Use a promotional banner (Announcement Bar) to highlight the pre-order offer.',
      'Test a purchase flow to confirm checkout works correctly.',
    ],
  },
  carrd: {
    title: 'Setting Up Pre-Orders on Carrd + Stripe',
    steps: [
      'Sign up at carrd.co and choose a landing page template (Pro plan required for forms).',
      'Design your one-page site: hero section, product photo, description, benefits.',
      'Go to stripe.com and create a Payment Link for your product at the pre-order price.',
      'Copy the Stripe Payment Link and add a button on your Carrd page linking to it.',
      'Add a Google Form or Typeform to also capture email addresses separately.',
      'Publish your Carrd site to a custom domain or carrd.co subdomain.',
      'In Stripe Dashboard, set the product description to include "Pre-order — ships [date]."',
      'Share your Carrd URL and start collecting pre-orders.',
    ],
  },
  gumroad: {
    title: 'Setting Up Pre-Orders on Gumroad',
    steps: [
      'Create a Gumroad account at gumroad.com (free to start).',
      'Click "New Product" and select "Physical" as the product type.',
      'Upload a product image and write a compelling description.',
      'Set your pre-order price and enable "Pre-order" in product settings.',
      'Add an expected shipping date in the product description.',
      'Customize your product page with your brand colors and copy.',
      'Connect your bank account in Gumroad Settings → Payments.',
      'Share your Gumroad product link on social media to start collecting orders.',
    ],
  },
  crowdfunding: {
    title: 'Setting Up a Campaign on Kickstarter / Indiegogo',
    steps: [
      'Choose your platform: Kickstarter (all-or-nothing funding) vs Indiegogo (flexible funding).',
      'Create an account and start a new project in the "Food & Craft" or "Drinks" category.',
      'Set your funding goal — the minimum amount needed to produce the first run.',
      'Write a compelling campaign story: why your drink, what makes it unique, your background.',
      'Create reward tiers: e.g., 1 bottle, 6-pack, case, founder edition.',
      'Upload a high-quality video and product photos to your campaign page.',
      'Set your campaign duration (30 days is typical for beverage brands).',
      'Launch and promote aggressively on Day 1 — first 48 hours are critical for momentum.',
    ],
  },
  stripe: {
    title: 'Setting Up Pre-Orders with Stripe Payment Links',
    steps: [
      'Create a Stripe account at stripe.com and complete identity verification.',
      'In the Stripe Dashboard, go to Products and create your beverage product.',
      'Set the price for your pre-order (use your discounted pre-order price).',
      'Go to Payment Links and click "New" — select your product.',
      'Customize the payment page: add your logo, brand colors, and a thank-you message.',
      'In the confirmation message, include your expected ship date.',
      'Create a simple landing page (Notion, Carrd, or even a Google Site) with your Stripe link.',
      'Set up a Stripe webhook or use Zapier to send order confirmation emails automatically.',
    ],
  },
};

const CHECKLIST_ITEMS = [
  { id: 'page_live', label: 'Pre-order page is live and accessible via public URL' },
  { id: 'test_purchase', label: 'Completed a test purchase end-to-end (then refunded)' },
  { id: 'confirmation_email', label: 'Confirmation email is set up and tested' },
  { id: 'social_linked', label: 'Social media profiles linked on the pre-order page' },
  { id: 'shared_5', label: 'Shared the pre-order link with at least 5 friends or contacts' },
];

const SYSTEM_PROMPT = `You are an expert copywriter specializing in beverage brand launches and direct-to-consumer pre-order campaigns. Generate compelling pre-order page copy specific to the brand concept provided.

Return this exact JSON format:
{
  "headline": "A punchy headline specific to their brand (max 10 words)",
  "subheadline": "A supporting sentence with their value proposition (max 20 words)",
  "bullets": [
    "First key benefit specific to their product",
    "Second key benefit",
    "Third key benefit"
  ],
  "cta": "Call-to-action button text (max 5 words)",
  "faq": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ]
}

Make the copy feel authentic and conversion-focused. Use the brand information to make it specific — not generic. Return ONLY valid JSON.`;

// ─── Toast Component ─────────────────────────────────────────────────────────

function Toast({ message, visible }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="bg-text-primary text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
        {message}
      </div>
    </div>
  );
}

// ─── Copy Button ─────────────────────────────────────────────────────────────

function CopyButton({ text, label = '📋 Copy' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
        copied
          ? 'bg-success/20 text-success'
          : 'bg-accent/10 text-accent hover:bg-accent/20'
      }`}
    >
      {copied ? '✓ Copied!' : label}
    </button>
  );
}

function CopyField({ label, value }) {
  return (
    <div className="bg-background rounded-xl p-4 border border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
          {label}
        </span>
        <CopyButton text={value} />
      </div>
      <p className="text-text-primary text-sm leading-relaxed">{value}</p>
    </div>
  );
}

// ─── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({ step, current, label }) {
  const done = current > step;
  const active = current === step;

  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
          done
            ? 'bg-success text-white'
            : active
            ? 'bg-accent text-white'
            : 'bg-border text-text-secondary'
        }`}
      >
        {done ? '✓' : step}
      </div>
      <span
        className={`text-sm font-medium ${
          active ? 'text-text-primary' : done ? 'text-success' : 'text-text-secondary'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Section 1: Why Pre-Orders ───────────────────────────────────────────────

function WhyPreOrdersSection() {
  return (
    <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-2xl p-5 mb-8">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">🚀</span>
        <h2 className="font-display text-xl text-text-primary">Why Start With Pre-Orders?</h2>
      </div>
      <p className="text-sm text-text-secondary leading-relaxed">
        Pre-orders validate real demand before you invest in production — every buyer is proof of concept. They strengthen funding applications, reveal price sensitivity, and build your customer list. Liquid Death, Athletic Brewing, and dozens of craft brands launched this way.
      </p>
    </div>
  );
}

// ─── Section 2: Platform Table ───────────────────────────────────────────────

function difficultyColor(d) {
  if (d === 'Very Easy') return 'text-success bg-success/10';
  if (d === 'Easy') return 'text-accent bg-accent/10';
  return 'text-warning bg-warning/10';
}

function PlatformTable({ selectedPlatform, onSelectPlatform }) {
  return (
    <div className="mb-8">
      <h2 className="font-display text-2xl text-text-primary mb-2">Choose Your Platform</h2>
      <p className="text-text-secondary mb-5">
        <span className="text-accent font-medium">⭐ Recommended options highlighted.</span>
      </p>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-background border-b border-border">
              <th className="text-left px-4 py-3 font-semibold text-text-secondary">Platform</th>
              <th className="text-left px-4 py-3 font-semibold text-text-secondary">Cost</th>
              <th className="text-left px-4 py-3 font-semibold text-text-secondary hidden md:table-cell">Best For</th>
              <th className="text-left px-4 py-3 font-semibold text-text-secondary hidden lg:table-cell">Pre-Order Feature</th>
              <th className="text-left px-4 py-3 font-semibold text-text-secondary">Difficulty</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {PLATFORMS.map((p) => {
              const isSelected = selectedPlatform === p.id;
              return (
                <tr
                  key={p.id}
                  onClick={() => onSelectPlatform(p.id)}
                  className={`cursor-pointer transition-colors border-b border-border last:border-0 ${
                    p.recommended
                      ? 'bg-accent/5 hover:bg-accent/10'
                      : 'bg-white hover:bg-background'
                  } ${isSelected ? 'ring-2 ring-inset ring-accent' : ''}`}
                >
                  <td className="px-4 py-3 font-medium text-text-primary">
                    <div className="flex items-center gap-2">
                      {p.recommended && <span title="Recommended">⭐</span>}
                      {p.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{p.cost}</td>
                  <td className="px-4 py-3 text-text-secondary hidden md:table-cell">{p.bestFor}</td>
                  <td className="px-4 py-3 text-text-secondary hidden lg:table-cell">{p.preOrderFeature}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColor(p.difficulty)}`}>
                      {p.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isSelected && (
                      <span className="text-accent text-xs font-bold">Selected ✓</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-text-secondary mt-3 italic">
        💡 We recommend <strong>Shopify</strong> for a full store or <strong>Carrd + Stripe</strong> for the fastest, lowest-cost launch.
      </p>
    </div>
  );
}

// ─── Step 1: Platform Selection ───────────────────────────────────────────────

function Step1PlatformSelect({ selected, onChange }) {
  return (
    <div>
      <p className="text-text-secondary text-sm mb-4">
        Select your platform:
      </p>
      <div className="grid gap-3">
        {PLATFORMS.map((p) => (
          <label
            key={p.id}
            className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-all ${
              selected === p.id
                ? 'border-accent bg-accent/5'
                : 'border-border bg-white hover:border-accent/40'
            }`}
          >
            <input
              type="radio"
              name="platform"
              value={p.id}
              checked={selected === p.id}
              onChange={() => onChange(p.id)}
              className="accent-accent"
            />
            <div className="flex-1">
              <span className="font-medium text-text-primary text-sm">
                {p.recommended && '⭐ '}
                {p.name}
              </span>
              <span className="text-text-secondary text-xs ml-2">{p.cost}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: Platform Instructions ──────────────────────────────────────────

function Step2Instructions({ platform }) {
  if (!platform) {
    return (
      <div className="text-center py-8 text-text-secondary">
        <p className="text-4xl mb-3">👆</p>
        <p>Complete Step 1 to see platform-specific setup instructions.</p>
      </div>
    );
  }

  const instructions = PLATFORM_INSTRUCTIONS[platform];
  if (!instructions) return null;

  return (
    <div>
      <h3 className="font-semibold text-text-primary mb-4">{instructions.title}</h3>
      <ol className="space-y-3">
        {instructions.steps.map((step, idx) => (
          <li key={idx} className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center mt-0.5">
              {idx + 1}
            </span>
            <p className="text-text-secondary text-sm leading-relaxed">{step}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ─── Step 3: AI Copy Generation ───────────────────────────────────────────────

function Step3AICopy({ platform }) {
  const { callAI, loading, error } = useAI();
  const [copy, setCopy] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const showToast = useCallback((msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: '' }), 2500);
  }, []);

  const handleGenerate = useCallback(async () => {
    const { idea, feedback, brandName } = getBrandContext();
    const platformName = PLATFORMS.find((p) => p.id === platform)?.name || platform || 'a landing page';
    const userMessage = `Brand concept: ${idea || 'a new beverage brand'}\nBrand name: ${brandName || 'TBD'}\nMarket feedback & positioning: ${feedback || ''}\nPlatform: ${platformName}\nGenerate pre-order page copy specific to this brand and product. Make it conversion-focused and brand-specific.`;

    const result = await callAI(SYSTEM_PROMPT, userMessage);
    if (result) {
      try {
        const parsed = JSON.parse(result);
        setCopy(parsed);
        showToast('Copy generated!');
      } catch {
        setCopy({ raw: result });
      }
    }
  }, [callAI, platform, showToast]);

  return (
    <div>
      <p className="text-text-secondary text-sm mb-4">
        Generate pre-order page copy tailored to your brand concept.
      </p>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mb-6 px-5 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating copy…
          </>
        ) : (
          <>✨ Generate Copy With AI</>
        )}
      </button>

      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 mb-4 text-danger text-sm">
          {error}
        </div>
      )}

      {copy && !copy.raw && (
        <div className="space-y-4">
          {copy.headline && <CopyField label="Headline" value={copy.headline} />}
          {copy.subheadline && <CopyField label="Subheadline" value={copy.subheadline} />}

          {copy.bullets?.length > 0 && (
            <div className="bg-background rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  Key Benefits
                </span>
                <CopyButton text={copy.bullets.join('\n')} label="📋 Copy All" />
              </div>
              <ul className="space-y-2">
                {copy.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span className="text-text-primary text-sm flex-1">{bullet}</span>
                    <CopyButton text={bullet} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {copy.cta && <CopyField label="CTA Button Text" value={copy.cta} />}

          {copy.faq?.length > 0 && (
            <div className="bg-background rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  FAQ ({copy.faq.length} Questions)
                </span>
                <CopyButton
                  text={copy.faq.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')}
                  label="📋 Copy All FAQs"
                />
              </div>
              <div className="space-y-3">
                {copy.faq.map((item, idx) => (
                  <div key={idx} className="border-l-2 border-accent/30 pl-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-text-primary text-sm font-medium">{item.question}</p>
                      <CopyButton text={`Q: ${item.question}\nA: ${item.answer}`} />
                    </div>
                    <p className="text-text-secondary text-sm">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {copy?.raw && (
        <div className="bg-background rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Generated Copy</span>
            <CopyButton text={copy.raw} label="📋 Copy All" />
          </div>
          <div className="prose prose-sm max-w-none text-text-primary">
            <ReactMarkdown>{copy.raw}</ReactMarkdown>
          </div>
        </div>
      )}

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}

// ─── Step 4: Pre-Order Pricing ────────────────────────────────────────────────

function Step4Pricing() {
  const storage = getStorage();
  const retailPrice = parseFloat(storage?.pricing?.inputs?.retailPrice) || null;
  const { feedback } = getBrandContext();

  // Extract competitor pricing hint from brainstorm feedback
  const competitorPricingMatch = feedback
    ? feedback.match(/\$(\d+(?:\.\d+)?)\s*(?:per can|\/can|per unit|\/unit)/i)
    : null;
  const competitorPriceHint = competitorPricingMatch ? competitorPricingMatch[0] : null;

  const discount15 = retailPrice ? (retailPrice * 0.85).toFixed(2) : null;
  const discount20 = retailPrice ? (retailPrice * 0.80).toFixed(2) : null;
  const discount25 = retailPrice ? (retailPrice * 0.75).toFixed(2) : null;

  const tiers = [
    { label: '15% Off', price: discount15, tag: 'Conservative', highlight: false },
    { label: '20% Off', price: discount20, tag: 'Recommended ⭐', highlight: true },
    { label: '25% Off', price: discount25, tag: 'Aggressive', highlight: false },
  ];

  return (
    <div>
      <p className="text-text-secondary text-sm mb-4">
        A 15–25% pre-order discount rewards early buyers and incentivizes action.
      </p>

      {competitorPriceHint && (
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 mb-4 text-sm text-text-primary">
          💡 Competitor pricing from your brainstorm: <strong>{competitorPriceHint}</strong> — factor this into your positioning.
        </div>
      )}

      {retailPrice ? (
        <div>
          <div className="bg-success/10 border border-success/20 rounded-xl p-3 mb-4 flex items-center gap-2">
            <span className="text-success">✓</span>
            <span className="text-sm text-success font-medium">
              Retail price from Pricing Calculator:{' '}
              <strong>${retailPrice.toFixed(2)}</strong>
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {tiers.map((tier) => (
              <div
                key={tier.label}
                className={`rounded-xl p-4 border text-center ${
                  tier.highlight ? 'border-accent bg-accent/5' : 'border-border bg-white'
                }`}
              >
                <p className="text-xs font-medium text-text-secondary mb-1">{tier.tag}</p>
                <p
                  className={`text-2xl font-bold ${
                    tier.highlight ? 'text-accent' : 'text-text-primary'
                  }`}
                >
                  ${tier.price}
                </p>
                <p className="text-xs text-text-secondary mt-1">{tier.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-secondary mt-4 italic">
            💡 20% discount feels meaningful without deeply undercutting your retail margin.
          </p>
        </div>
      ) : (
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
          <p className="text-sm text-warning font-medium mb-1">⚠️ No retail price found</p>
          <p className="text-sm text-text-secondary">
            Complete the Pricing Calculator to auto-pull your retail price. General guideline: offer <strong>15–25% off</strong> your planned retail price.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-white rounded-lg p-2 border border-border">
              <p className="font-semibold text-text-primary">15% Off</p>
              <p className="text-text-secondary">Conservative</p>
            </div>
            <div className="bg-accent/10 rounded-lg p-2 border border-accent/20">
              <p className="font-semibold text-accent">20% Off ⭐</p>
              <p className="text-text-secondary">Recommended</p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-border">
              <p className="font-semibold text-text-primary">25% Off</p>
              <p className="text-text-secondary">Aggressive</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 5: Launch Checklist ─────────────────────────────────────────────────

function Step5Checklist({ checklist, onChange }) {
  const completedCount = CHECKLIST_ITEMS.filter((item) => checklist[item.id]).length;
  const pct = Math.round((completedCount / CHECKLIST_ITEMS.length) * 100);
  const allDone = pct === 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-text-secondary text-sm">Check off each item as you complete it.</p>
        <span className={`text-sm font-semibold ${allDone ? 'text-success' : 'text-accent'}`}>
          {completedCount}/{CHECKLIST_ITEMS.length} done
        </span>
      </div>

      <div className="h-2 bg-border rounded-full mb-5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${allDone ? 'bg-success' : 'bg-accent'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="space-y-3">
        {CHECKLIST_ITEMS.map((item) => (
          <label
            key={item.id}
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              checklist[item.id]
                ? 'bg-success/5 border-success/20'
                : 'bg-white border-border hover:border-accent/40'
            }`}
          >
            <input
              type="checkbox"
              checked={!!checklist[item.id]}
              onChange={(e) => onChange(item.id, e.target.checked)}
              className="w-4 h-4 accent-success flex-shrink-0"
            />
            <span
              className={`text-sm ${
                checklist[item.id] ? 'line-through text-text-secondary' : 'text-text-primary'
              }`}
            >
              {item.label}
            </span>
          </label>
        ))}
      </div>

      {allDone && (
        <div className="mt-5 bg-success/10 border border-success/20 rounded-xl p-4 text-center">
          <p className="text-2xl mb-2">🎉</p>
          <p className="font-semibold text-success">Pre-order launch complete!</p>
          <p className="text-sm text-text-secondary mt-1">
            Your pre-order is live. Share it everywhere and keep momentum going!
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const STEPS = [
  { number: 1, label: 'Choose Your Platform' },
  { number: 2, label: 'Platform Setup Instructions' },
  { number: 3, label: 'Generate Copy With AI' },
  { number: 4, label: 'Pre-Order Pricing' },
  { number: 5, label: 'Launch Checklist' },
];

function initPlatform() {
  const s = getStorage();
  return s.preorder?.platform || '';
}

function initChecklist() {
  const s = getStorage();
  return s.preorder?.checklist || {};
}

export default function PreOrderSetup() {
  const [platform, setPlatform] = useState(initPlatform);
  const [checklist, setChecklist] = useState(initChecklist);
  const [currentStep, setCurrentStep] = useState(1);

  const { hasBrainstorm } = getBrandContext();

  useEffect(() => {
    const completedCount = CHECKLIST_ITEMS.filter((item) => checklist[item.id]).length;
    const pct =
      CHECKLIST_ITEMS.length > 0
        ? Math.round((completedCount / CHECKLIST_ITEMS.length) * 100)
        : 0;
    const sectionDone = pct > 80;

    updateStorage((prev) => ({
      ...prev,
      preorder: {
        ...prev.preorder,
        platform,
        checklist,
      },
      sectionProgress: {
        ...prev.sectionProgress,
        preorder: sectionDone ? 100 : Math.min(pct, 79),
      },
    }));
  }, [platform, checklist]);

  const handlePlatformChange = useCallback((pid) => {
    setPlatform(pid);
    setCurrentStep((s) => (s === 1 ? 2 : s));
  }, []);

  const handleChecklistChange = useCallback((id, checked) => {
    setChecklist((prev) => ({ ...prev, [id]: checked }));
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">🛒</span>
          <div>
            <h1 className="font-display text-3xl text-text-primary">Pre-Order Setup</h1>
            <p className="text-text-secondary">
              Launch your pre-order and start generating revenue before production.
            </p>
          </div>
        </div>
      </div>

      {!hasBrainstorm && <BrainstormNudge />}

      {/* Section 1: Why Pre-Orders */}
      <WhyPreOrdersSection />

      {/* Section 2: Platform Comparison Table */}
      <PlatformTable selectedPlatform={platform} onSelectPlatform={handlePlatformChange} />

      {/* Section 3: Step-by-Step Setup */}
      <div>
        <h2 className="font-display text-2xl text-text-primary mb-6">Step-by-Step Setup</h2>

        <div className="grid gap-3 mb-8">
          {STEPS.map((s) => (
            <button
              key={s.number}
              onClick={() => setCurrentStep(s.number)}
              className="text-left"
            >
              <StepIndicator step={s.number} current={currentStep} label={s.label} />
            </button>
          ))}
        </div>

        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-7 h-7 rounded-full bg-accent text-white text-sm font-bold flex items-center justify-center">
              {currentStep}
            </span>
            <h3 className="font-semibold text-text-primary">
              {STEPS[currentStep - 1].label}
            </h3>
          </div>

          {currentStep === 1 && (
            <Step1PlatformSelect selected={platform} onChange={handlePlatformChange} />
          )}
          {currentStep === 2 && <Step2Instructions platform={platform} />}
          {currentStep === 3 && (
            <Step3AICopy platform={platform} />
          )}
          {currentStep === 4 && <Step4Pricing />}
          {currentStep === 5 && (
            <Step5Checklist checklist={checklist} onChange={handleChecklistChange} />
          )}

          <div className="flex justify-between mt-6 pt-5 border-t border-border">
            <button
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              disabled={currentStep === 1}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary disabled:opacity-40 transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentStep((s) => Math.min(5, s + 1))}
              disabled={currentStep === 5}
              className="px-4 py-2 text-sm font-medium bg-accent hover:bg-accent-hover text-white rounded-xl disabled:opacity-40 transition-colors"
            >
              Next Step →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
