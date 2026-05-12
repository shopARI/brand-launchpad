import { useState, useEffect, useCallback } from 'react';
import { useAI } from '../hooks/useAI';
import { getStorage, updateStorage } from '../utils/storage';

// ─── Icons / helpers ────────────────────────────────────────────────────────

function PlatformIcon({ platform }) {
  const p = (platform || '').toLowerCase();
  if (p.includes('tiktok')) return <span title="TikTok">🎵</span>;
  if (p.includes('instagram')) return <span title="Instagram">📸</span>;
  if (p.includes('youtube')) return <span title="YouTube">▶️</span>;
  if (p.includes('twitter') || p.includes('x')) return <span title="Twitter/X">🐦</span>;
  if (p.includes('linkedin')) return <span title="LinkedIn">💼</span>;
  if (p.includes('facebook')) return <span title="Facebook">👥</span>;
  if (p.includes('email')) return <span title="Email">📧</span>;
  return <span>📱</span>;
}

function Badge({ label, color = 'accent' }) {
  const classes = {
    accent: 'bg-accent/10 text-accent border-accent/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes[color] || classes.accent}`}>
      {label}
    </span>
  );
}

function CompletionBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-success/10 text-success border border-success/20">
      ✓ Saved
    </span>
  );
}

function LockBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-border/60 text-text-secondary border border-border">
      🔒 Locked
    </span>
  );
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <div className="bg-text-primary text-card px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2">
        <span>✓</span>
        {message}
      </div>
    </div>
  );
}

// ─── Copy Button ─────────────────────────────────────────────────────────────

function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-border/40 text-text-secondary hover:text-text-primary transition-colors"
    >
      {copied ? '✓ Copied!' : `📋 ${label}`}
    </button>
  );
}

// ─── AI Error Display ────────────────────────────────────────────────────────

function AIError({ error }) {
  if (!error) return null;
  return (
    <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-4 text-sm">
      <strong>Error:</strong> {error}
    </div>
  );
}

// ─── Education Callout Banner ─────────────────────────────────────────────────

function EducationBanner({ checked, onCheck }) {
  return (
    <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 mb-8">
      <div className="flex items-start gap-4">
        <div className="text-3xl mt-0.5">🎓</div>
        <div className="flex-1">
          <h2 className="font-display text-xl text-text-primary mb-2">
            Before you plan, learn the playbook.
          </h2>
          <p className="text-text-secondary mb-1">
            We recommend completing the App Mafia course on launch marketing.
          </p>
          <p className="text-text-secondary mb-4 italic font-medium">
            "Start by educating your audience, not selling to them."
          </p>
          <a
            href="https://appmafia.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-accent hover:text-accent-hover font-medium text-sm underline-offset-2 hover:underline mb-5 transition-colors"
          >
            Take the App Mafia Course →
          </a>
          <label className="flex items-center gap-3 cursor-pointer group mt-2">
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                checked
                  ? 'bg-success border-success text-card'
                  : 'border-border group-hover:border-accent'
              }`}
              onClick={onCheck}
            >
              {checked && <span className="text-xs leading-none">✓</span>}
            </div>
            <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
              I've reviewed the education-first marketing approach ✓
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

// ─── BATCH 1: 30-Day Calendar ─────────────────────────────────────────────────

function DayPhase(day) {
  if (day <= 10) return { label: 'Educate', color: 'bg-blue-50 border-blue-200 text-blue-700' };
  if (day <= 20) return { label: 'Engage', color: 'bg-purple-50 border-purple-200 text-purple-700' };
  return { label: 'Convert', color: 'bg-success/10 border-success/20 text-success' };
}

function DayCard({ entry, isExpanded, onToggle }) {
  const phase = DayPhase(entry.day);

  return (
    <div
      className={`border rounded-xl cursor-pointer transition-all ${
        isExpanded
          ? 'border-accent/40 bg-accent/5 shadow-sm col-span-2'
          : 'border-border bg-card hover:border-accent/30 hover:shadow-sm'
      }`}
      onClick={onToggle}
    >
      {/* Collapsed view */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-text-secondary">Day {entry.day}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${phase.color}`}>
            {phase.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <PlatformIcon platform={entry.platform} />
          <span className="text-xs text-text-secondary truncate">{entry.platform}</span>
        </div>
        <p className="text-xs font-medium text-text-primary line-clamp-2 leading-snug">
          {entry.topic}
        </p>
        <div className="mt-1.5">
          <Badge label={entry.content_type || 'Post'} />
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-accent/20 p-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">Caption Hook</p>
            <p className="text-sm text-text-primary italic">"{entry.caption_hook}"</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">What Audience Learns</p>
            <p className="text-sm text-text-primary">{entry.education_angle}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">Call to Action</p>
            <p className="text-sm text-accent font-medium">{entry.cta}</p>
          </div>
          <CopyButton
            text={`Day ${entry.day} — ${entry.platform} ${entry.content_type}\nTopic: ${entry.topic}\nHook: "${entry.caption_hook}"\nAngle: ${entry.education_angle}\nCTA: ${entry.cta}`}
            label="Copy Day Details"
          />
        </div>
      )}
    </div>
  );
}

function CalendarGrid({ calendar }) {
  const [expandedDay, setExpandedDay] = useState(null);

  const phases = [
    { label: 'Days 1–10: Educate', days: calendar.filter((d) => d.day <= 10), color: 'text-blue-700' },
    { label: 'Days 11–20: Engage', days: calendar.filter((d) => d.day > 10 && d.day <= 20), color: 'text-purple-700' },
    { label: 'Days 21–30: Convert', days: calendar.filter((d) => d.day > 20), color: 'text-success' },
  ];

  return (
    <div className="space-y-6">
      {phases.map((phase) => (
        <div key={phase.label}>
          <h4 className={`text-sm font-bold mb-3 ${phase.color}`}>{phase.label}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 auto-rows-auto">
            {phase.days.map((entry) => (
              <DayCard
                key={entry.day}
                entry={entry}
                isExpanded={expandedDay === entry.day}
                onToggle={() => setExpandedDay(expandedDay === entry.day ? null : entry.day)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── BATCH 2: Tabbed Cards ─────────────────────────────────────────────────────

function TabbedContent({ data }) {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: '📧 Email Sequence', key: 'email_sequence' },
    { label: '📅 Launch Week', key: 'social_launch_plan' },
    { label: '🤝 Influencer', key: 'influencer_outreach' },
    { label: '🏠 Landing Page', key: 'waitlist_landing_page' },
  ];

  function renderContent(key) {
    const content = data[key];
    if (!content) return <p className="text-text-secondary text-sm">No content generated.</p>;

    if (key === 'email_sequence' && Array.isArray(content)) {
      return (
        <div className="space-y-4">
          {content.map((email, i) => (
            <div key={i} className="border border-border rounded-xl p-4 bg-background">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs font-bold text-accent">Email {i + 1}</span>
                  <h4 className="font-medium text-text-primary text-sm mt-0.5">
                    {email.subject || email.title || `Email ${i + 1}`}
                  </h4>
                </div>
                <CopyButton
                  text={`Subject: ${email.subject || email.title}\n\n${email.body || email.content || JSON.stringify(email)}`}
                />
              </div>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                {email.body || email.content || JSON.stringify(email, null, 2)}
              </p>
            </div>
          ))}
        </div>
      );
    }

    if (key === 'social_launch_plan' && Array.isArray(content)) {
      return (
        <div className="space-y-3">
          {content.map((day, i) => (
            <div key={i} className="border border-border rounded-xl p-4 bg-background">
              <div className="flex items-start justify-between mb-1">
                <span className="text-xs font-bold text-accent">
                  Day {day.day || i + 1}{day.theme ? ` — ${day.theme}` : ''}
                </span>
                <CopyButton text={JSON.stringify(day, null, 2)} label="Copy" />
              </div>
              {day.platforms && (
                <p className="text-xs text-text-secondary mb-1">📱 {Array.isArray(day.platforms) ? day.platforms.join(', ') : day.platforms}</p>
              )}
              <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                {day.content || day.description || day.post || JSON.stringify(day, null, 2)}
              </p>
            </div>
          ))}
        </div>
      );
    }

    if (key === 'influencer_outreach') {
      const dm = typeof content === 'object' ? content.dm || content.dm_template : null;
      const email = typeof content === 'object' ? content.email || content.email_template : null;
      const fallback = typeof content === 'string' ? content : JSON.stringify(content, null, 2);

      return (
        <div className="space-y-4">
          {dm && (
            <div className="border border-border rounded-xl p-4 bg-background">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-bold text-accent">DM Template</span>
                <CopyButton text={dm} />
              </div>
              <p className="text-sm text-text-primary whitespace-pre-wrap">{dm}</p>
            </div>
          )}
          {email && (
            <div className="border border-border rounded-xl p-4 bg-background">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-bold text-accent">Email Template</span>
                <CopyButton text={email} />
              </div>
              <p className="text-sm text-text-primary whitespace-pre-wrap">{email}</p>
            </div>
          )}
          {!dm && !email && (
            <div className="border border-border rounded-xl p-4 bg-background">
              <CopyButton text={fallback} />
              <p className="text-sm text-text-primary whitespace-pre-wrap mt-2">{fallback}</p>
            </div>
          )}
        </div>
      );
    }

    if (key === 'waitlist_landing_page') {
      const lp = typeof content === 'object' ? content : {};
      const fallback = typeof content === 'string' ? content : null;
      return (
        <div className="space-y-4">
          {fallback ? (
            <div className="border border-border rounded-xl p-4 bg-background">
              <CopyButton text={fallback} />
              <p className="text-sm text-text-primary whitespace-pre-wrap mt-2">{fallback}</p>
            </div>
          ) : (
            <>
              {lp.headline && (
                <div className="border border-border rounded-xl p-4 bg-background">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-accent">Headline</span>
                    <CopyButton text={lp.headline} />
                  </div>
                  <p className="text-lg font-display text-text-primary">{lp.headline}</p>
                </div>
              )}
              {lp.subheadline && (
                <div className="border border-border rounded-xl p-4 bg-background">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-accent">Subheadline</span>
                    <CopyButton text={lp.subheadline} />
                  </div>
                  <p className="text-sm text-text-primary">{lp.subheadline}</p>
                </div>
              )}
              {lp.cta && (
                <div className="border border-border rounded-xl p-4 bg-background">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-accent">CTA Button</span>
                    <CopyButton text={lp.cta} />
                  </div>
                  <p className="text-sm font-medium text-accent">{lp.cta}</p>
                </div>
              )}
              {lp.value_props && Array.isArray(lp.value_props) && (
                <div className="border border-border rounded-xl p-4 bg-background">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-accent">Value Propositions</span>
                    <CopyButton text={lp.value_props.join('\n')} />
                  </div>
                  <ul className="space-y-1.5">
                    {lp.value_props.map((vp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                        <span className="text-accent mt-0.5">✦</span>
                        {vp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {!lp.headline && !lp.subheadline && (
                <div className="border border-border rounded-xl p-4 bg-background">
                  <CopyButton text={JSON.stringify(content, null, 2)} />
                  <pre className="text-xs text-text-primary mt-2 whitespace-pre-wrap">
                    {JSON.stringify(content, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    return (
      <div className="border border-border rounded-xl p-4 bg-background">
        <CopyButton text={typeof content === 'string' ? content : JSON.stringify(content, null, 2)} />
        <p className="text-sm text-text-primary whitespace-pre-wrap mt-2">
          {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-4 bg-background rounded-xl p-1 border border-border overflow-x-auto">
        {tabs.map((tab, i) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(i)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === i
                ? 'bg-card text-text-primary shadow-sm border border-border'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab content */}
      <div>{renderContent(tabs[activeTab].key)}</div>
    </div>
  );
}

// ─── BATCH 3: Accordion ─────────────────────────────────────────────────────

function AccordionSection({ title, icon, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-background transition-colors text-left"
      >
        <span className="flex items-center gap-3 font-medium text-text-primary">
          <span className="text-xl">{icon}</span>
          {title}
        </span>
        <span className={`text-text-secondary transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>
      {open && (
        <div className="border-t border-border bg-background px-5 py-4">
          {children}
        </div>
      )}
    </div>
  );
}

function GrowthContent({ data }) {
  const partnerships = data.partnerships || data.partnership_ideas || [];
  const referral = data.referral_program || data.referral || '';
  const calendar = data.month_2_3_calendar || data.content_calendar_month2_3 || data.content_calendar || [];
  const metrics = data.metrics || data.metrics_benchmarks || data.benchmarks || '';

  function renderList(items) {
    if (!items || !items.length) return null;
    return (
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
            <span className="text-accent mt-0.5 flex-shrink-0">✦</span>
            <span>{typeof item === 'string' ? item : (item.idea || item.title || item.description || JSON.stringify(item))}</span>
          </li>
        ))}
      </ul>
    );
  }

  function renderText(content) {
    if (!content) return null;
    const text = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    return <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{text}</p>;
  }

  function renderCalendar(items) {
    if (!items || !items.length) return null;
    if (Array.isArray(items)) {
      return (
        <div className="space-y-2">
          {items.map((entry, i) => {
            const text = typeof entry === 'string'
              ? entry
              : `${entry.week ? `Week ${entry.week}: ` : ''}${entry.theme || entry.topic || entry.content || JSON.stringify(entry)}`;
            return (
              <div key={i} className="text-sm text-text-primary bg-card border border-border rounded-lg px-3 py-2 leading-relaxed">
                {text}
              </div>
            );
          })}
        </div>
      );
    }
    return renderText(items);
  }

  const allText = JSON.stringify(data, null, 2);

  return (
    <div className="space-y-3">
      {partnerships.length > 0 && (
        <AccordionSection title="Partnership & Collab Ideas" icon="🤝">
          <div className="space-y-2 mb-3">{renderList(partnerships)}</div>
          <CopyButton text={partnerships.map((p) => typeof p === 'string' ? p : (p.idea || p.title || JSON.stringify(p))).join('\n')} label="Copy All" />
        </AccordionSection>
      )}
      {referral && (
        <AccordionSection title="Referral Program" icon="🔗">
          <div className="mb-3">{renderText(referral)}</div>
          <CopyButton text={typeof referral === 'string' ? referral : JSON.stringify(referral, null, 2)} />
        </AccordionSection>
      )}
      {(Array.isArray(calendar) ? calendar.length > 0 : !!calendar) && (
        <AccordionSection title="Month 2–3 Content Calendar" icon="📅">
          <div className="mb-3">{renderCalendar(calendar)}</div>
          <CopyButton text={typeof calendar === 'string' ? calendar : JSON.stringify(calendar, null, 2)} label="Copy Calendar" />
        </AccordionSection>
      )}
      {metrics && (
        <AccordionSection title="Metrics & Benchmarks" icon="📊">
          <div className="mb-3">{renderText(metrics)}</div>
          <CopyButton text={typeof metrics === 'string' ? metrics : JSON.stringify(metrics, null, 2)} />
        </AccordionSection>
      )}
      {!partnerships.length && !referral && !calendar?.length && !metrics && (
        <div>
          <CopyButton text={allText} label="Copy All" />
          <pre className="text-xs text-text-primary whitespace-pre-wrap mt-2">{allText}</pre>
        </div>
      )}
    </div>
  );
}

// ─── Batch Section Wrapper ────────────────────────────────────────────────────

function BatchSection({ number, title, emoji, locked, saved, children }) {
  return (
    <div className={`rounded-2xl border transition-all ${locked ? 'border-border opacity-60' : saved ? 'border-success/30' : 'border-border'} bg-card`}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-0.5">
              Batch {number}
            </p>
            <h3 className="font-display text-lg text-text-primary">{title}</h3>
          </div>
        </div>
        {locked ? <LockBadge /> : saved ? <CompletionBadge /> : null}
      </div>
      <div className={`p-6 ${locked ? 'pointer-events-none' : ''}`}>
        {locked ? (
          <p className="text-text-secondary text-sm text-center py-4">
            Complete and save Batch {number - 1} to unlock this section.
          </p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

// ─── Main MarketingPlan Component ─────────────────────────────────────────────

export function MarketingPlan({ userData }) {
  const storage = getStorage();
  const saved = storage.marketing || { batch1: null, batch2: null, batch3: null };

  const [batch1, setBatch1] = useState(saved.batch1);
  const [batch2, setBatch2] = useState(saved.batch2);
  const [batch3, setBatch3] = useState(saved.batch3);
  const [eduChecked, setEduChecked] = useState(false);
  const [toast, setToast] = useState(null);

  const ai1 = useAI();
  const ai2 = useAI();
  const ai3 = useAI();

  const brandName = userData?.name || 'My Brand';
  const brandDesc = userData?.brandIdea || 'an exciting new beverage brand';

  // Persist + update sectionProgress
  function persist(key, value) {
    const updated = updateStorage((s) => {
      const newMarketing = { ...s.marketing, [key]: value };
      const allSaved = newMarketing.batch1 && newMarketing.batch2 && newMarketing.batch3;
      const batch1Done = !!newMarketing.batch1;
      const batch2Done = !!newMarketing.batch2;
      const progress = allSaved ? 1 : (batch1Done && batch2Done ? 0.66 : batch1Done ? 0.33 : 0);
      return {
        ...s,
        marketing: newMarketing,
        sectionProgress: { ...s.sectionProgress, marketing: progress },
      };
    });
    return updated;
  }

  function showToast(msg) {
    setToast(msg);
  }

  // ── Batch 1 ──────────────────────────────────────────────────────────────

  const BATCH1_SYSTEM = `You are a beverage brand launch strategist. The user is launching ${brandName} — ${brandDesc} in Canada. They have $0 marketing budget and need to build an audience from scratch using organic content.

Create a 30-day content calendar with this structure. Return as JSON:
{
  "strategy_summary": "2-3 sentence overview",
  "content_pillars": ["pillar1", "pillar2", "pillar3"],
  "calendar": [
    {
      "day": 1,
      "platform": "Instagram/TikTok",
      "content_type": "Reel/Story/Post/Carousel",
      "topic": "specific topic",
      "caption_hook": "first line of caption",
      "education_angle": "what the audience learns",
      "cta": "call to action"
    }
  ]
}

The content should follow the education-first framework:
- Days 1-10: Educate (teach about the category, ingredients, culture, behind-the-scenes)
- Days 11-20: Engage (polls, Q&As, UGC prompts, hot takes)
- Days 21-30: Convert (tease product, waitlist, pre-orders, founding member offers)

Be specific to alcohol/beverage. Include trending content formats.`;

  async function generateBatch1() {
    const raw = await ai1.callAI(
      BATCH1_SYSTEM,
      `Generate the full 30-day content calendar for ${brandName} — ${brandDesc}. Return ONLY valid JSON, no markdown fences.`
    );
    if (!raw) return;
    try {
      const clean = raw.replace(/```json\n?|```\n?/g, '').trim();
      const parsed = JSON.parse(clean);
      setBatch1(parsed);
    } catch {
      // Try to extract JSON from response
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          setBatch1(parsed);
        } catch {
          ai1.reset();
        }
      }
    }
  }

  function saveBatch1() {
    persist('batch1', batch1);
    showToast('Batch 1 saved! Batch 2 unlocked.');
  }

  // ── Batch 2 ──────────────────────────────────────────────────────────────

  const BATCH2_SYSTEM = `You are a beverage brand launch strategist helping ${brandName} — ${brandDesc} in Canada.

Generate a complete launch campaign. Return as JSON with this exact structure:
{
  "email_sequence": [
    { "subject": "email subject", "body": "full email body" }
  ],
  "social_launch_plan": [
    { "day": 1, "theme": "day theme", "platforms": ["Instagram", "TikTok"], "content": "what to post" }
  ],
  "influencer_outreach": {
    "dm_template": "short DM message for influencers",
    "email_template": "longer email outreach for influencers"
  },
  "waitlist_landing_page": {
    "headline": "compelling headline",
    "subheadline": "supporting subheadline",
    "cta": "CTA button text",
    "value_props": ["value prop 1", "value prop 2", "value prop 3"]
  }
}

email_sequence: 5 emails — welcome, story, sneak peek, early access, launch day.
social_launch_plan: 7-day launch week plan.
influencer_outreach: DM template (short) + email template (detailed).
waitlist_landing_page: headline, subheadline, CTA button text, and 3 value props.`;

  async function generateBatch2() {
    const raw = await ai2.callAI(
      BATCH2_SYSTEM,
      `Generate the full launch campaign for ${brandName} — ${brandDesc}. Return ONLY valid JSON, no markdown fences.`
    );
    if (!raw) return;
    try {
      const clean = raw.replace(/```json\n?|```\n?/g, '').trim();
      const parsed = JSON.parse(clean);
      setBatch2(parsed);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          setBatch2(parsed);
        } catch {
          ai2.reset();
        }
      }
    }
  }

  function saveBatch2() {
    persist('batch2', batch2);
    showToast('Batch 2 saved! Batch 3 unlocked.');
  }

  // ── Batch 3 ──────────────────────────────────────────────────────────────

  const BATCH3_SYSTEM = `You are a beverage brand growth strategist helping ${brandName} — ${brandDesc} in Canada.

Generate a growth playbook. Return as JSON with this exact structure:
{
  "partnerships": [
    { "idea": "partnership idea", "description": "how it works", "benefit": "why it helps" }
  ],
  "referral_program": "Detailed referral program structure and mechanics",
  "month_2_3_calendar": [
    { "week": 1, "theme": "week theme", "content": "what to focus on" }
  ],
  "metrics": "Key metrics and benchmarks to track for weeks 5-12, including engagement rates, follower growth targets, email open rates, waitlist conversion rates, and revenue milestones"
}

partnerships: exactly 3 partnership/collab ideas specific to the beverage industry.
referral_program: full structure with rewards, mechanics, and referral copy.
month_2_3_calendar: 8 weeks of content themes (weeks 5-12).
metrics: detailed benchmarks and KPIs.`;

  async function generateBatch3() {
    const raw = await ai3.callAI(
      BATCH3_SYSTEM,
      `Generate the growth playbook for ${brandName} — ${brandDesc}. Return ONLY valid JSON, no markdown fences.`
    );
    if (!raw) return;
    try {
      const clean = raw.replace(/```json\n?|```\n?/g, '').trim();
      const parsed = JSON.parse(clean);
      setBatch3(parsed);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          setBatch3(parsed);
        } catch {
          ai3.reset();
        }
      }
    }
  }

  function saveBatch3() {
    persist('batch3', batch3);
    showToast('🎉 All 3 batches complete! Marketing Plan finished.');
  }

  const batch1Saved = !!storage.marketing?.batch1;
  const batch2Saved = !!storage.marketing?.batch2;
  const batch3Saved = !!storage.marketing?.batch3;

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">📣</span>
          <div>
            <h1 className="font-display text-3xl text-text-primary">Marketing Plan</h1>
            <p className="text-text-secondary">
              Build your go-to-market strategy in 3 progressive phases.
            </p>
          </div>
        </div>
        {batch1Saved && batch2Saved && batch3Saved && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success border border-success/20 text-sm font-medium">
            ✓ Marketing Plan Complete
          </div>
        )}
      </div>

      {/* Education banner */}
      <EducationBanner checked={eduChecked} onCheck={() => setEduChecked(!eduChecked)} />

      {/* Batch 1 */}
      <div className="space-y-6">
        <BatchSection
          number={1}
          title="Content & Education Strategy"
          emoji="📚"
          locked={false}
          saved={batch1Saved}
        >
          {/* Strategy summary (after generation) */}
          {batch1 && (
            <div className="mb-6 space-y-4">
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">Strategy Overview</p>
                <p className="text-sm text-text-primary">{batch1.strategy_summary}</p>
              </div>
              {batch1.content_pillars && batch1.content_pillars.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Content Pillars</p>
                  <div className="flex flex-wrap gap-2">
                    {batch1.content_pillars.map((pillar, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/20"
                      >
                        {pillar}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {batch1.calendar && batch1.calendar.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">30-Day Content Calendar</p>
                  <p className="text-xs text-text-secondary mb-3">Click any day card to expand full details.</p>
                  <CalendarGrid calendar={batch1.calendar} />
                </div>
              )}
            </div>
          )}

          <AIError error={ai1.error} />

          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={generateBatch1}
              disabled={ai1.loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-card font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {ai1.loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-card/30 border-t-card rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                batch1 ? '↺ Regenerate Strategy' : '✨ Generate Content Strategy'
              )}
            </button>
            {batch1 && !batch1Saved && (
              <button
                onClick={saveBatch1}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-success text-card font-medium hover:opacity-90 transition-opacity text-sm"
              >
                Save & Unlock Next Batch →
              </button>
            )}
            {batch1Saved && (
              <button
                onClick={generateBatch1}
                disabled={ai1.loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:bg-border/30 disabled:opacity-50 transition-colors text-sm"
              >
                Regenerate
              </button>
            )}
          </div>
        </BatchSection>

        {/* Batch 2 */}
        <BatchSection
          number={2}
          title="Waitlist & Launch Campaign"
          emoji="🚀"
          locked={!batch1Saved}
          saved={batch2Saved}
        >
          {batch2 && (
            <div className="mb-6">
              <TabbedContent data={batch2} />
            </div>
          )}

          <AIError error={ai2.error} />

          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={generateBatch2}
              disabled={ai2.loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-card font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {ai2.loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-card/30 border-t-card rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                batch2 ? '↺ Regenerate Campaign' : '✨ Generate Launch Campaign'
              )}
            </button>
            {batch2 && !batch2Saved && (
              <button
                onClick={saveBatch2}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-success text-card font-medium hover:opacity-90 transition-opacity text-sm"
              >
                Save & Unlock Next Batch →
              </button>
            )}
          </div>
        </BatchSection>

        {/* Batch 3 */}
        <BatchSection
          number={3}
          title="Growth & Retention"
          emoji="📈"
          locked={!batch2Saved}
          saved={batch3Saved}
        >
          {batch3 && (
            <div className="mb-6">
              <GrowthContent data={batch3} />
            </div>
          )}

          <AIError error={ai3.error} />

          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={generateBatch3}
              disabled={ai3.loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-card font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {ai3.loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-card/30 border-t-card rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                batch3 ? '↺ Regenerate Playbook' : '✨ Generate Growth Playbook'
              )}
            </button>
            {batch3 && !batch3Saved && (
              <button
                onClick={saveBatch3}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-success text-card font-medium hover:opacity-90 transition-opacity text-sm"
              >
                ✓ Save & Complete Marketing Plan
              </button>
            )}
          </div>
        </BatchSection>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
