import { useState, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Play,
  CheckCircle2,
  Circle,
  Sparkles,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  BookOpen,
  Star,
} from 'lucide-react';
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useBrandingStorage() {
  const [data, setData] = useState(() => getStorage().branding);

  const save = useCallback((updater) => {
    updateStorage((s) => ({
      ...s,
      branding: typeof updater === 'function' ? updater(s.branding) : { ...s.branding, ...updater },
    }));
    setData(getStorage().branding);
  }, []);

  return [data, save];
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handle}
      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function LessonCard({ number, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-card">
      <button
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-background/60 transition-colors"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-accent/10 text-accent text-sm font-bold flex items-center justify-center flex-shrink-0">
            {number}
          </span>
          <span className="font-display text-xl text-text-primary">{title}</span>
        </div>
        {open ? (
          <ChevronUp size={20} className="text-text-secondary flex-shrink-0" />
        ) : (
          <ChevronDown size={20} className="text-text-secondary flex-shrink-0" />
        )}
      </button>
      {open && <div className="px-6 pb-6 pt-2 border-t border-border">{children}</div>}
    </div>
  );
}

// ─── Lesson 1: What Is a Brand Book? ─────────────────────────────────────────

function Lesson1({ checked, onCheck }) {
  const videos = [
    {
      title: 'How to Create a Brand Style Guide',
      url: 'https://youtube.com/results?search_query=how+to+create+brand+style+guide',
    },
    {
      title: 'Brand Identity Design Process',
      url: 'https://youtube.com/results?search_query=brand+identity+design+process+for+beginners',
    },
  ];

  return (
    <div className="space-y-5 mt-4">
      <p className="text-text-secondary leading-relaxed">
        A brand book defines how your brand looks, sounds, and feels — consistently — across every touchpoint. Think of it as the constitution for your brand.
      </p>
      <div>
        <p className="text-sm font-semibold text-text-primary mb-3">📺 Recommended watching:</p>
        <div className="space-y-3">
          {videos.map((v) => (
            <a
              key={v.title}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-accent/40 hover:bg-accent/5 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Play size={16} className="text-red-500 group-hover:text-red-600 transition-colors" />
              </div>
              <span className="text-text-primary text-sm font-medium group-hover:text-accent transition-colors">
                {v.title}
              </span>
              <ExternalLink size={14} className="ml-auto text-text-secondary group-hover:text-accent transition-colors" />
            </a>
          ))}
        </div>
      </div>
      <button
        onClick={onCheck}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
          checked
            ? 'border-success/40 bg-success/10 text-success'
            : 'border-border hover:border-accent/40 text-text-secondary hover:text-accent'
        }`}
      >
        {checked ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        Watch at least one before continuing ✓
      </button>
    </div>
  );
}

// ─── Lesson 2: Tone of Voice ──────────────────────────────────────────────────

function Lesson2({ tone, onSave, checked, onCheck }) {
  const [adj, setAdj] = useState(() => [tone[0] || '', tone[1] || '', tone[2] || '']);

  const handleSave = () => {
    onSave(adj.filter(Boolean));
  };

  const examples = [
    { brand: 'Liquid Death', description: 'Irreverent, aggressive, punk rock', color: 'bg-slate-800 text-white' },
    { brand: 'Haus', description: 'Sophisticated, warm, intimate', color: 'bg-amber-50 text-amber-900 border border-amber-200' },
    { brand: 'White Claw', description: 'Casual, fun, effortless', color: 'bg-blue-50 text-blue-800 border border-blue-200' },
  ];

  return (
    <div className="space-y-5 mt-4">
      <p className="text-text-secondary leading-relaxed">
        Tone of voice is how your brand speaks — its personality in words. Three standout brands show how powerful a consistent tone can be:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {examples.map((e) => (
          <div key={e.brand} className={`rounded-xl px-4 py-3 ${e.color}`}>
            <p className="font-bold text-sm mb-1">{e.brand}</p>
            <p className="text-xs opacity-80">{e.description}</p>
          </div>
        ))}
      </div>
      <div>
        <p className="text-sm font-semibold text-text-primary mb-3">
          3 adjectives that describe how your brand should FEEL:
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              type="text"
              placeholder={`Adjective ${i + 1}`}
              value={adj[i]}
              onChange={(e) => {
                const next = [...adj];
                next[i] = e.target.value;
                setAdj(next);
              }}
              onBlur={handleSave}
              className="border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-secondary/50 bg-background focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-all"
            />
          ))}
        </div>
        {tone.length > 0 && (
          <p className="text-xs text-success mt-2 flex items-center gap-1">
            <CheckCircle2 size={12} />
            Saved: {tone.join(', ')}
          </p>
        )}
      </div>
      <button
        onClick={onCheck}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
          checked
            ? 'border-success/40 bg-success/10 text-success'
            : 'border-border hover:border-accent/40 text-text-secondary hover:text-accent'
        }`}
      >
        {checked ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        I understand my brand's tone ✓
      </button>
    </div>
  );
}

// ─── Lesson 3: Visual Identity ─────────────────────────────────────────────────

function Lesson3({ colors, onSave, checked, onCheck }) {
  const colorSlots = [
    { key: 'primary', label: 'Primary', default: '#C4762B' },
    { key: 'secondary', label: 'Secondary', default: '#4A7C59' },
    { key: 'accent', label: 'Accent', default: '#D4A843' },
    { key: 'dark', label: 'Dark Neutral', default: '#2C2418' },
    { key: 'light', label: 'Light Neutral', default: '#FAF8F5' },
    { key: 'pop', label: 'Pop Color', default: '#C44B2B' },
  ];

  const [localColors, setLocalColors] = useState(() =>
    colorSlots.reduce((acc, s) => {
      acc[s.key] = colors[s.key] || s.default;
      return acc;
    }, {})
  );

  const handleChange = (key, val) => {
    const next = { ...localColors, [key]: val };
    setLocalColors(next);
    onSave(next);
  };

  return (
    <div className="space-y-5 mt-4">
      <p className="text-text-secondary leading-relaxed">
        Your color palette conveys premium vs accessible, bold vs subtle, before a customer reads a single word. Choose intentionally.
      </p>
      <div>
        <p className="text-sm font-semibold text-text-primary mb-3">
          🎨 Define your 6 brand colors:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {colorSlots.map((slot) => (
            <div
              key={slot.key}
              className="border border-border rounded-xl p-3 bg-background hover:border-accent/40 transition-colors"
            >
              <div
                className="w-full h-16 rounded-lg mb-3 cursor-pointer relative overflow-hidden"
                style={{ backgroundColor: localColors[slot.key] }}
                onClick={() => document.getElementById(`color-${slot.key}`)?.click()}
              >
                <input
                  id={`color-${slot.key}`}
                  type="color"
                  value={localColors[slot.key]}
                  onChange={(e) => handleChange(slot.key, e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-xs font-semibold text-text-primary">{slot.label}</p>
              <p className="text-xs text-text-secondary font-mono">{localColors[slot.key].toUpperCase()}</p>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={onCheck}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
          checked
            ? 'border-success/40 bg-success/10 text-success'
            : 'border-border hover:border-accent/40 text-text-secondary hover:text-accent'
        }`}
      >
        {checked ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        Color palette defined ✓
      </button>
    </div>
  );
}

// ─── Lesson 4: Naming Your Brand ──────────────────────────────────────────────

const NAMING_SYSTEM_PROMPT = `You are a branding expert specializing in alcohol/beverage brands. Generate 10 brand name ideas based on the user's concept and brand context. For each name provide: the name, a one-line rationale tied to their specific concept, and a trademark availability risk note (low/medium/high). Format as a numbered list. Be creative — mix approaches (abstract, compound words, foreign words, portmanteaus). These are for a Canadian market.`;

function Lesson4({ brandName, onSave, checked, onCheck }) {
  const [vibe, setVibe] = useState('');
  const [selectedName, setSelectedName] = useState(brandName || '');
  const { callAI, response, loading, error, reset } = useAI();

  const handleGenerate = async () => {
    if (!vibe.trim()) return;
    reset();
    const { idea, feedback } = getBrandContext();
    const context = idea
      ? `Their brand concept: ${idea}\nPrevious AI feedback: ${feedback}\nAdditional vibe: ${vibe}`
      : vibe;
    await callAI(NAMING_SYSTEM_PROMPT, context);
  };

  const frameworks = [
    { label: 'Descriptive', example: 'e.g. "Mountain Spring Gin"' },
    { label: 'Abstract', example: 'e.g. "Aura", "Elos"' },
    { label: 'Founder-Based', example: 'e.g. "Cole & Co. Cider"' },
    { label: 'Wordplay', example: 'e.g. "Brewhemia", "Sipnotized"' },
  ];

  return (
    <div className="space-y-5 mt-4">
      <p className="text-text-secondary leading-relaxed">
        The best beverage names are short (1-2 words), easy to pronounce, and evoke the right feeling at a glance.
      </p>
      <div>
        <p className="text-sm font-semibold text-text-primary mb-3">📚 Naming Frameworks:</p>
        <div className="grid grid-cols-2 gap-3">
          {frameworks.map((f) => (
            <div key={f.label} className="border border-border rounded-xl px-4 py-3 bg-background">
              <p className="text-sm font-semibold text-text-primary">{f.label}</p>
              <p className="text-xs text-text-secondary">{f.example}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-accent/5 border border-accent/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-accent" />
          <p className="text-sm font-semibold text-text-primary">AI Name Generator</p>
        </div>
        <textarea
          placeholder="Add any extra vibe details (your brand concept from Brainstorm is already included)"
          value={vibe}
          onChange={(e) => setVibe(e.target.value)}
          rows={2}
          className="w-full border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-secondary/50 bg-white focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-all resize-none mb-3"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {loading ? 'Generating...' : 'Generate Name Ideas'}
        </button>
        {error && (
          <p className="mt-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {response && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">10 Name Ideas</p>
              <CopyButton text={response} />
            </div>
            <div className="bg-white border border-border rounded-xl p-4 max-h-96 overflow-y-auto prose prose-sm prose-stone max-w-none">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          ✍️ Your chosen brand name:
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter your brand name"
            value={selectedName}
            onChange={(e) => setSelectedName(e.target.value)}
            className="flex-1 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-secondary/50 bg-background focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-all"
          />
          <button
            onClick={() => onSave(selectedName)}
            className="px-4 py-2 rounded-xl bg-accent/10 text-accent text-sm font-semibold hover:bg-accent/20 transition-colors"
          >
            Save
          </button>
        </div>
        {brandName && (
          <p className="text-xs text-success mt-2 flex items-center gap-1">
            <CheckCircle2 size={12} />
            Saved: {brandName}
          </p>
        )}
      </div>
      <button
        onClick={onCheck}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
          checked
            ? 'border-success/40 bg-success/10 text-success'
            : 'border-border hover:border-accent/40 text-text-secondary hover:text-accent'
        }`}
      >
        {checked ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        Brand name direction decided ✓
      </button>
    </div>
  );
}

// ─── Lesson 5: Competitor Brand Teardown ──────────────────────────────────────

function Lesson5({ checked, onCheck }) {
  const [entries, setEntries] = useState(() => {
    const raw = localStorage.getItem('brandLaunchpad_teardowns');
    try {
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState({
    brandName: '',
    vibeWords: '',
    colors: '',
    socialStyle: '',
    pricePoint: '',
    steal: '',
  });

  // Pre-fill competitors from brainstorm feedback if available
  const { feedback } = getBrandContext();
  const competitorHint = feedback
    ? feedback.match(/competitor[s]?[:\s]+([^\n.]+)/i)?.[1] || ''
    : '';

  const save = () => {
    if (!form.brandName.trim()) return;
    const next = [...entries, { ...form, id: Date.now() }];
    setEntries(next);
    localStorage.setItem('brandLaunchpad_teardowns', JSON.stringify(next));
    setForm({ brandName: '', vibeWords: '', colors: '', socialStyle: '', pricePoint: '', steal: '' });
  };

  const remove = (id) => {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    localStorage.setItem('brandLaunchpad_teardowns', JSON.stringify(next));
  };

  const fields = [
    { key: 'brandName', label: 'Competitor Brand', placeholder: competitorHint || 'e.g. Montauk Brewing' },
    { key: 'vibeWords', label: 'Vibe Words (3)', placeholder: 'e.g. coastal, relaxed, nostalgic' },
    { key: 'colors', label: 'Brand Colors', placeholder: 'e.g. navy, white, sandy yellow' },
    { key: 'socialStyle', label: 'Social Media Style', placeholder: 'e.g. lifestyle photography, UGC-heavy' },
    { key: 'pricePoint', label: 'Price Point', placeholder: 'e.g. $4.99/can, ~$18/6-pack' },
    { key: 'steal', label: 'What to Steal 💡', placeholder: 'e.g. their storytelling approach' },
  ];

  return (
    <div className="space-y-5 mt-4">
      <p className="text-text-secondary leading-relaxed">
        Study 2-3 competitors to spot white space and deliberately position yourself differently.
      </p>
      <div className="bg-background border border-border rounded-2xl p-5">
        <p className="text-sm font-semibold text-text-primary mb-4">Add a Competitor:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-text-secondary mb-1">{f.label}</label>
              <input
                type="text"
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-secondary/50 bg-white focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-all"
              />
            </div>
          ))}
        </div>
        <button
          onClick={save}
          disabled={!form.brandName.trim()}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add Competitor
        </button>
      </div>
      {entries.length > 0 && (
        <div className="space-y-3">
          {entries.map((e) => (
            <div key={e.id} className="border border-border rounded-xl p-4 bg-card">
              <div className="flex items-start justify-between mb-2">
                <p className="font-semibold text-text-primary">{e.brandName}</p>
                <button
                  onClick={() => remove(e.id)}
                  className="text-xs text-danger/60 hover:text-danger transition-colors"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-text-secondary">
                {e.vibeWords && <span>Vibe: {e.vibeWords}</span>}
                {e.colors && <span>Colors: {e.colors}</span>}
                {e.socialStyle && <span>Social: {e.socialStyle}</span>}
                {e.pricePoint && <span>Price: {e.pricePoint}</span>}
                {e.steal && <span className="col-span-2 text-accent font-medium">💡 Steal: {e.steal}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={onCheck}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
          checked
            ? 'border-success/40 bg-success/10 text-success'
            : 'border-border hover:border-accent/40 text-text-secondary hover:text-accent'
        }`}
      >
        {checked ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        Competitor teardown complete ✓
      </button>
    </div>
  );
}

// ─── Phase 3: Brand Card + Brief Generator ─────────────────────────────────────

const BRIEF_SYSTEM_PROMPT = `You are a senior brand strategist. Generate a polished 1-page Brand Brief based on the provided brand data. Sections: 1) Brand Overview, 2) Mission Statement, 3) Target Consumer, 4) Brand Personality & Tone of Voice, 5) Visual Identity Summary, 6) Key Differentiators, 7) Competitive Positioning, 8) Tagline Suggestions (3 options). Use the specific brand concept and market feedback to make it concrete — not generic. Canadian alcohol/beverage market.`;

function Phase3({ brandData, storage }) {
  const { callAI, response, loading, error, reset } = useAI();

  const colorSlots = [
    { key: 'primary', label: 'Primary' },
    { key: 'secondary', label: 'Secondary' },
    { key: 'accent', label: 'Accent' },
    { key: 'dark', label: 'Dark' },
    { key: 'light', label: 'Light' },
    { key: 'pop', label: 'Pop' },
  ];

  const handleGenerate = async () => {
    reset();
    const { idea, feedback } = getBrandContext();
    const brandIdea = idea || storage?.brainstorm?.currentIdea || storage?.user?.brandIdea || 'A premium Canadian beverage brand';
    await callAI(
      BRIEF_SYSTEM_PROMPT,
      `Brand Name: ${brandData.name || 'TBD'}\nBrand Idea: ${brandIdea}\nMarket Feedback: ${feedback || ''}\nTone Adjectives: ${brandData.tone.join(', ') || 'not specified'}\nColor Palette: ${JSON.stringify(brandData.colors)}\nFounder Name: ${storage?.user?.name || 'TBD'}`
    );
  };

  const hasColors = Object.keys(brandData.colors || {}).length > 0;

  return (
    <div className="space-y-6">
      {/* Brand Card */}
      <div
        id="brand-card"
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-8"
        style={{
          background: brandData.colors?.primary
            ? `linear-gradient(135deg, ${brandData.colors.primary}22 0%, white 60%)`
            : undefined,
        }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-1">Brand Identity Card</p>
            <h2 className="font-display text-4xl text-text-primary">
              {brandData.name || 'Your Brand Name'}
            </h2>
          </div>
          {brandData.colors?.primary && (
            <div
              className="w-12 h-12 rounded-xl flex-shrink-0"
              style={{ backgroundColor: brandData.colors.primary }}
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Tone of Voice</p>
            {brandData.tone.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {brandData.tone.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: brandData.colors?.primary || '#C4762B' }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary text-sm italic">Not defined yet</p>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Color Palette</p>
            {hasColors ? (
              <div className="flex gap-2 flex-wrap">
                {colorSlots
                  .filter((s) => brandData.colors[s.key])
                  .map((s) => (
                    <div key={s.key} className="flex flex-col items-center gap-1">
                      <div
                        className="w-8 h-8 rounded-lg border border-white/50 shadow-sm"
                        style={{ backgroundColor: brandData.colors[s.key] }}
                        title={`${s.label}: ${brandData.colors[s.key]}`}
                      />
                      <span className="text-xs text-text-secondary">{s.label}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-text-secondary text-sm italic">Not defined yet</p>
            )}
          </div>

          {(storage?.brainstorm?.currentIdea || storage?.user?.brandIdea) && (
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Brand Concept</p>
              <p className="text-sm text-text-primary leading-relaxed">
                {storage?.brainstorm?.currentIdea || storage?.user?.brandIdea}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Generate Brief */}
      <div className="border border-accent/20 rounded-2xl p-5 bg-accent/5">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={18} className="text-accent" />
          <h3 className="font-semibold text-text-primary">Generate Full Brand Brief</h3>
        </div>
        <p className="text-sm text-text-secondary mb-4">
          Investor-ready 1-page brief using your brand name, tone, colors, and concept.
        </p>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {loading ? 'Generating Brand Brief...' : 'Generate Full Brand Brief'}
        </button>
        {error && (
          <p className="mt-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {response && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Brand Brief</p>
              <div className="flex items-center gap-2">
                <CopyButton text={response} />
                <button
                  onClick={() => { reset(); handleGenerate(); }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors"
                >
                  <RefreshCw size={12} />
                  Regenerate
                </button>
              </div>
            </div>
            <div className="bg-white border border-border rounded-xl p-5 prose prose-sm prose-stone max-w-none max-h-[600px] overflow-y-auto">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main BrandingGuide Component ────────────────────────────────────────────

export function BrandingGuide({ storage }) {
  const [brandData, saveBrandData] = useBrandingStorage();
  const [lessonChecks, setLessonChecks] = useState(() => {
    const raw = localStorage.getItem('brandLaunchpad_lessonChecks');
    try {
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const { hasBrainstorm } = getBrandContext();

  const saveChecks = (next) => {
    setLessonChecks(next);
    localStorage.setItem('brandLaunchpad_lessonChecks', JSON.stringify(next));
  };

  const toggleCheck = (key) => {
    const next = { ...lessonChecks, [key]: !lessonChecks[key] };
    saveChecks(next);
  };

  const allLessonsChecked = [1, 2, 3, 4, 5].every((n) => lessonChecks[n]);

  useEffect(() => {
    updateStorage((s) => ({
      ...s,
      sectionProgress: {
        ...s.sectionProgress,
        branding: allLessonsChecked ? 100 : 0,
      },
    }));
  }, [allLessonsChecked]);

  const saveTone = (tone) => saveBrandData({ tone });
  const saveColors = (colors) => saveBrandData({ colors });
  const saveName = (name) => saveBrandData({ name });
  const phases = [
    { id: 'learn', label: 'Learn', icon: BookOpen, num: '01' },
    { id: 'finalize', label: 'Finalize', icon: Star, num: '02' },
  ];

  const [activePhase, setActivePhase] = useState('learn');

  return (
    <div className="max-w-3xl mx-auto py-8 px-6">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-4" role="img" aria-label="Branding Guide">🎨</div>
        <h1 className="font-display text-4xl text-text-primary mb-3">Branding Guide</h1>
        <p className="text-text-secondary max-w-lg mx-auto">
          Build a cohesive brand identity — tone, colors, name, and story.
        </p>
      </div>

      {!hasBrainstorm && <BrainstormNudge />}

      {/* Phase tabs */}
      <div className="flex gap-1 bg-background border border-border rounded-2xl p-1.5 mb-8">
        {phases.map((phase) => {
          const Icon = phase.icon;
          const isActive = activePhase === phase.id;
          return (
            <button
              key={phase.id}
              onClick={() => setActivePhase(phase.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-white shadow-sm text-text-primary border border-border'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className="text-xs font-bold text-text-secondary/60 hidden sm:inline">{phase.num}</span>
              <Icon size={15} />
              <span>{phase.label}</span>
            </button>
          );
        })}
      </div>

      {/* Phase 1 — Learn */}
      {activePhase === 'learn' && (
        <div className="space-y-4">
          <LessonCard number={1} title="What Is a Brand Book?" defaultOpen>
            <Lesson1
              checked={!!lessonChecks[1]}
              onCheck={() => toggleCheck(1)}
            />
          </LessonCard>

          <LessonCard number={2} title="Tone of Voice">
            <Lesson2
              tone={brandData.tone || []}
              onSave={saveTone}
              checked={!!lessonChecks[2]}
              onCheck={() => toggleCheck(2)}
            />
          </LessonCard>

          <LessonCard number={3} title="Visual Identity">
            <Lesson3
              colors={brandData.colors || {}}
              onSave={saveColors}
              checked={!!lessonChecks[3]}
              onCheck={() => toggleCheck(3)}
            />
          </LessonCard>

          <LessonCard number={4} title="Naming Your Brand">
            <Lesson4
              brandName={brandData.name || ''}
              onSave={saveName}
              checked={!!lessonChecks[4]}
              onCheck={() => toggleCheck(4)}
            />
          </LessonCard>

          <LessonCard number={5} title="Competitor Teardown">
            <Lesson5
              checked={!!lessonChecks[5]}
              onCheck={() => toggleCheck(5)}
            />
          </LessonCard>

          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-text-secondary">
              {[1, 2, 3, 4, 5].filter((n) => lessonChecks[n]).length}/5 lessons completed
            </p>
            {allLessonsChecked && (
              <button
                onClick={() => setActivePhase('finalize')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
              >
                Next: See Your Brand Card →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Phase 3 — Finalize */}
      {activePhase === 'finalize' && (
        <Phase3 brandData={brandData} storage={storage} />
      )}
    </div>
  );
}

export default BrandingGuide;
