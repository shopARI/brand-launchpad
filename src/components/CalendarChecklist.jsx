import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAI } from '../hooks/useAI';
import { getStorage, updateStorage } from '../utils/storage';

// ─── Constants ───────────────────────────────────────────────────────────────

const PHASE_COLORS = [
  '#4A7C59', // Phase 1: Foundation — green
  '#C4762B', // Phase 2: Financing — amber/accent
  '#8B6BAE', // Phase 3: Pricing — purple
  '#2B7EA1', // Phase 4: Branding — blue
  '#C44B2B', // Phase 5: Marketing — red/danger
  '#D4A843', // Phase 6: Pre-Order — gold/warning
];

const SECTION_LINKS = {
  brainstorm: 'brainstorm',
  financing: 'financing',
  pricing: 'pricing',
  branding: 'branding',
  marketing: 'marketing',
  preorder: 'preorder',
  production: 'production',
};

// ─── Utility helpers ──────────────────────────────────────────────────────────

function getNextMonday() {
  const d = new Date();
  const day = d.getDay(); // 0=Sun, 1=Mon...6=Sat
  const daysUntilMonday = day === 0 ? 1 : (8 - day) % 7 || 7;
  d.setDate(d.getDate() + daysUntilMonday);
  return d.toISOString().slice(0, 10);
}

function formatDateDisplay(dateStr) {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatShortDate(dateStr) {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getTaskStatus(dateStr, isCompleted) {
  if (isCompleted) return 'completed';
  const today = getTodayStr();
  if (dateStr < today) return 'overdue';
  if (dateStr === today) return 'today';
  return 'upcoming';
}

// Build a unique task ID for a given day's task index
function buildTaskId(dateStr, taskIndex) {
  return `${dateStr}_${taskIndex}`;
}

// ─── Build the system prompt dynamically with all saved data ─────────────────

function buildSystemPrompt(startDate) {
  const storage = getStorage();
  const { brainstorm, pricing, branding, marketing, preorder, production, user, financing } = storage;

  const contextParts = [];

  if (user?.brandIdea || brainstorm?.currentIdea) {
    contextParts.push(`Brand Idea: ${user?.brandIdea || brainstorm?.currentIdea}`);
  }
  if (brainstorm?.feedback) {
    // Summarize first 200 chars of feedback (category, competitors)
    contextParts.push(`Brainstorm feedback summary: ${brainstorm.feedback.slice(0, 200).replace(/\n/g, ' ')}…`);
  }
  if (brainstorm?.ideas?.length) {
    contextParts.push(`Brand Concepts Explored: ${brainstorm.ideas.length} ideas saved`);
  }
  if (pricing?.inputs?.productName) {
    contextParts.push(`Product: ${pricing.inputs.productName}, Retail price: $${pricing.inputs.retailPrice || 'TBD'}, Category: ${pricing.inputs.category || 'TBD'}`);
  }
  if (pricing?.outputs?.breakEvenUnits) {
    contextParts.push(`Break-even: ${pricing.outputs.breakEvenUnits} units/month`);
  }
  if (financing?.costBreakdown) {
    const cb = financing.costBreakdown;
    contextParts.push(`Startup cost estimate: $${cb.total?.low?.toLocaleString()} – $${cb.total?.high?.toLocaleString()} CAD`);
    if (cb.minimum_viable) contextParts.push(`Minimum viable launch: ${cb.minimum_viable}`);
    if (cb.timeline_to_revenue) contextParts.push(`Timeline to revenue: ${cb.timeline_to_revenue}`);
  }
  if (branding?.name) {
    contextParts.push(`Brand Name: ${branding.name}`);
  }
  if (branding?.tone?.length) {
    contextParts.push(`Brand Tone: ${branding.tone.join(', ')}`);
  }
  if (branding?.checklist) {
    const done = Object.values(branding.checklist).filter(Boolean).length;
    if (done > 0) contextParts.push(`Branding: ${done} items completed`);
  }
  if (marketing?.batch1 || marketing?.batch2 || marketing?.batch3) {
    const batches = [marketing.batch1, marketing.batch2, marketing.batch3].filter(Boolean).length;
    contextParts.push(`Marketing content: ${batches} batches generated`);
  }
  if (preorder?.platform) {
    contextParts.push(`Pre-order platform: ${preorder.platform}`);
  }
  if (production?.reviewed) {
    contextParts.push(`Production Brief: reviewed`);
  }

  const contextStr = contextParts.length > 0
    ? `\nFounder's current progress:\n${contextParts.map(c => `- ${c}`).join('\n')}\n`
    : '';

  return `You are a startup launch project manager specializing in beverage brands. Create a detailed day-by-day roadmap for launching a beverage brand starting from ${startDate}. The founder has no capital and is bootstrapping.${contextStr}

Rules:
- WEEKDAYS ONLY (Monday-Friday). No weekend tasks.
- Each day has 1-3 concrete tasks maximum.
- Tasks should take 2-4 hours per day (she likely has a day job).
- Group tasks into weekly themes.

Structure the plan in these phases IN ORDER:

PHASE 1: Foundation (Week 1-2) — Finalize brand concept, competitive research, social media setup, content creation
PHASE 2: Financing Applications (Week 2-3) — Research grants, write Futurpreneur application, apply to 3-5 grants, business registration
PHASE 3: Pricing & Business Model (Week 3) — Complete pricing calculator, define unit economics, set pricing strategy
PHASE 4: Branding (Week 3-5) — Brand book exercises, logo design, visual identity, brand templates
PHASE 5: Marketing Campaign (Week 5-8) — Execute 30-day content calendar, build email list, engage audience, create pre-order page
PHASE 6: Pre-Order Launch (Week 8-10) — Launch pre-order page, run launch campaign, collect data, iterate

Return ONLY valid JSON with no markdown code blocks, no explanation text, just raw JSON:
{
  "phases": [
    {
      "name": "Phase Name",
      "weeks": "Week X-Y",
      "color": "#hexcolor",
      "tasks": [
        {
          "date": "YYYY-MM-DD",
          "day_of_week": "Monday",
          "tasks": [
            {
              "title": "Task title",
              "description": "What exactly to do",
              "duration_hours": 2,
              "section_link": "brainstorm|financing|pricing|branding|marketing|preorder",
              "deliverable": "What is produced when done"
            }
          ]
        }
      ]
    }
  ]
}`;
}

// ─── Flatten all tasks from parsed phases for progress counting ───────────────

function flattenTasks(phases) {
  const all = [];
  phases.forEach((phase, phaseIdx) => {
    phase.tasks?.forEach((dayEntry) => {
      dayEntry.tasks?.forEach((task, taskIdx) => {
        all.push({
          id: buildTaskId(dayEntry.date, taskIdx),
          date: dayEntry.date,
          dayOfWeek: dayEntry.day_of_week,
          phaseIdx,
          phaseName: phase.name,
          phaseColor: phase.color || PHASE_COLORS[phaseIdx] || '#4A7C59',
          phaseWeeks: phase.weeks,
          ...task,
        });
      });
    });
  });
  return all;
}

// ─── Parse AI response robustly ───────────────────────────────────────────────

function parseAIResponse(text) {
  if (!text) return null;
  // Strip markdown code block if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[^\n]*\n?/, '').replace(/```\s*$/, '').trim();
  }
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed?.phases && Array.isArray(parsed.phases)) return parsed;
    return null;
  } catch {
    // Try to extract JSON object
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (parsed?.phases) return parsed;
      } catch {
        return null;
      }
    }
    return null;
  }
}

// ─── Group flat tasks by week ─────────────────────────────────────────────────

function groupByWeek(allTasks) {
  const weeks = [];
  let currentWeekStart = null;
  let currentGroup = null;

  allTasks.forEach((task) => {
    const d = new Date(task.date + 'T12:00:00');
    // Monday of this week
    const dayOfWeek = d.getDay(); // 0=Sun
    const daysFromMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(d);
    monday.setDate(d.getDate() - daysFromMon);
    const weekKey = monday.toISOString().slice(0, 10);

    if (weekKey !== currentWeekStart) {
      currentWeekStart = weekKey;
      currentGroup = { weekKey, tasks: [], label: '' };
      weeks.push(currentGroup);
    }
    currentGroup.tasks.push(task);
  });

  // Build label for each week based on dominant phase
  weeks.forEach((week, i) => {
    const phaseCounts = {};
    week.tasks.forEach(t => {
      phaseCounts[t.phaseName] = (phaseCounts[t.phaseName] || 0) + 1;
    });
    const dominant = Object.entries(phaseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    week.label = `Week ${i + 1}: ${dominant}`;
    week.phaseColor = week.tasks[0]?.phaseColor || PHASE_COLORS[0];
  });

  return weeks;
}

// ─── Build calendar month structure ──────────────────────────────────────────

function buildCalendarMonths(allTasks) {
  if (!allTasks.length) return [];

  // Group tasks by date
  const byDate = {};
  allTasks.forEach(task => {
    if (!byDate[task.date]) byDate[task.date] = [];
    byDate[task.date].push(task);
  });

  // Get unique months
  const months = new Set();
  allTasks.forEach(t => {
    const d = new Date(t.date + 'T12:00:00');
    months.add(`${d.getFullYear()}-${d.getMonth()}`);
  });

  return Array.from(months).sort().map(monthKey => {
    const [year, month] = monthKey.split('-').map(Number);
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Pad to start on Sunday
    const startPad = firstDay.getDay(); // 0=Sun
    const days = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, tasks: byDate[dateStr] || [] });
    }

    return {
      year,
      month,
      label: firstDay.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' }),
      days,
    };
  });
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-text-primary text-card px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2">
        <span>✓</span>
        {message}
      </div>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ phases, allTasks, completions }) {
  const totalTasks = allTasks.length;
  const completedCount = allTasks.filter(t => completions[t.id]).length;
  const pct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-text-primary">
          {completedCount} of {totalTasks} tasks completed
        </span>
        <span className="text-lg font-bold text-accent">{pct}%</span>
      </div>

      {/* Segmented progress bar */}
      <div className="flex h-3 rounded-full overflow-hidden bg-border/40 gap-px">
        {phases.map((phase, i) => {
          const phaseTasks = allTasks.filter(t => t.phaseIdx === i);
          const phaseTotal = phaseTasks.length;
          const phaseCompleted = phaseTasks.filter(t => completions[t.id]).length;
          const segmentWidth = totalTasks > 0 ? (phaseTotal / totalTasks) * 100 : 0;
          const fillWidth = phaseTotal > 0 ? (phaseCompleted / phaseTotal) * 100 : 0;

          return (
            <div
              key={i}
              style={{ width: `${segmentWidth}%`, position: 'relative', overflow: 'hidden' }}
              className="rounded-sm"
              title={`${phase.name}: ${phaseCompleted}/${phaseTotal}`}
            >
              <div className="w-full h-full bg-border/30" />
              <div
                className="absolute top-0 left-0 h-full transition-all duration-500"
                style={{ width: `${fillWidth}%`, backgroundColor: phase.color || PHASE_COLORS[i] }}
              />
            </div>
          );
        })}
      </div>

      {/* Phase legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        {phases.map((phase, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-text-secondary">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: phase.color || PHASE_COLORS[i] }}
            />
            <span>{phase.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({ task, isCompleted, onToggle, onNavigate }) {
  const status = getTaskStatus(task.date, isCompleted);

  const borderColors = {
    completed: '#4A7C59',
    overdue: '#C44B2B',
    today: '#D4A843',
    upcoming: '#4A7C59',
  };

  const bgColors = {
    completed: 'bg-success/5',
    overdue: 'bg-danger/5',
    today: 'bg-warning/5',
    upcoming: 'bg-card',
  };

  return (
    <div
      className={`rounded-xl border border-border p-4 flex gap-3 transition-all ${bgColors[status]}`}
      style={{ borderLeftColor: borderColors[status], borderLeftWidth: 3 }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors"
        style={{
          borderColor: isCompleted ? '#4A7C59' : '#C4D0C8',
          backgroundColor: isCompleted ? '#4A7C59' : 'transparent',
        }}
        aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
      >
        {isCompleted && <span className="text-white text-xs leading-none">✓</span>}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <span
            className={`font-semibold text-sm ${
              isCompleted ? 'line-through text-text-secondary' : 'text-text-primary'
            }`}
          >
            {isCompleted && <span className="mr-1">✅</span>}
            {task.title}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {status === 'today' && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-warning/20 text-warning border border-warning/30">
                📌 Due Today
              </span>
            )}
            {status === 'overdue' && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/20">
                Overdue
              </span>
            )}
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-border/50 text-text-secondary">
              ~{task.duration_hours}h
            </span>
          </div>
        </div>

        {task.description && (
          <p className={`text-xs mt-1 leading-relaxed ${isCompleted ? 'text-text-secondary/60' : 'text-text-secondary'}`}>
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {task.deliverable && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
              📦 {task.deliverable}
            </span>
          )}
          {task.section_link && SECTION_LINKS[task.section_link] && (
            <button
              onClick={() => onNavigate(SECTION_LINKS[task.section_link])}
              className="text-xs text-accent hover:text-accent-hover underline underline-offset-2 flex items-center gap-1"
            >
              → Open {task.section_link}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── List View ────────────────────────────────────────────────────────────────

function ListView({ allTasks, completions, onToggle, onNavigate }) {
  const weeks = useMemo(() => groupByWeek(allTasks), [allTasks]);

  if (!weeks.length) return null;

  return (
    <div className="space-y-8">
      {weeks.map((week) => {
        const weekCompleted = week.tasks.filter(t => completions[t.id]).length;
        return (
          <div key={week.weekKey}>
            {/* Week header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-1 h-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: week.phaseColor }}
              />
              <div>
                <h3 className="font-display text-base font-semibold text-text-primary">
                  {week.label}
                </h3>
                <p className="text-xs text-text-secondary">
                  {weekCompleted}/{week.tasks.length} tasks • {formatShortDate(week.tasks[0]?.date)} – {formatShortDate(week.tasks[week.tasks.length - 1]?.date)}
                </p>
              </div>
            </div>

            {/* Group by day within week */}
            {groupDayTasks(week.tasks).map((dayGroup) => (
              <div key={dayGroup.date} className="mb-5">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 pl-4">
                  {dayGroup.dayOfWeek} — {formatShortDate(dayGroup.date)}
                </p>
                <div className="space-y-2">
                  {dayGroup.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isCompleted={!!completions[task.id]}
                      onToggle={onToggle}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function groupDayTasks(tasks) {
  const byDay = [];
  let lastDate = null;
  let current = null;
  tasks.forEach(task => {
    if (task.date !== lastDate) {
      lastDate = task.date;
      current = { date: task.date, dayOfWeek: task.dayOfWeek, tasks: [] };
      byDay.push(current);
    }
    current.tasks.push(task);
  });
  return byDay;
}

// ─── Calendar Grid View ───────────────────────────────────────────────────────

function CalendarGridView({ allTasks, completions, onToggle, onNavigate }) {
  const [expandedDate, setExpandedDate] = useState(null);
  const months = useMemo(() => buildCalendarMonths(allTasks), [allTasks]);

  const today = getTodayStr();

  if (!months.length) return null;

  return (
    <div className="space-y-8">
      {months.map((month) => (
        <div key={`${month.year}-${month.month}`}>
          <h3 className="font-display text-base font-semibold text-text-primary mb-3">
            {month.label}
          </h3>

          {/* Day-of-week header */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-text-secondary py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {month.days.map((day, i) => {
              if (!day) return <div key={`pad-${i}`} />;

              const { dateStr, tasks } = day;
              const isToday = dateStr === today;
              const isExpanded = expandedDate === dateStr;
              const isWeekend = i % 7 === 0 || i % 7 === 6;
              const hasTasks = tasks.length > 0;
              const allDone = hasTasks && tasks.every(t => completions[t.id]);
              const someOverdue = hasTasks && !allDone && dateStr < today;

              return (
                <div key={dateStr}>
                  <button
                    onClick={() => hasTasks && setExpandedDate(isExpanded ? null : dateStr)}
                    className={`
                      w-full aspect-square rounded-lg flex flex-col items-center justify-start pt-1 px-1 text-xs transition-colors
                      ${isWeekend ? 'opacity-40' : ''}
                      ${isToday ? 'ring-2 ring-warning' : ''}
                      ${hasTasks ? 'cursor-pointer hover:bg-border/30' : 'cursor-default'}
                      ${isExpanded ? 'bg-border/20' : ''}
                    `}
                  >
                    <span
                      className={`font-medium leading-none mb-1 ${
                        isToday ? 'text-warning font-bold' : 'text-text-secondary'
                      }`}
                    >
                      {new Date(dateStr + 'T12:00:00').getDate()}
                    </span>
                    {/* Task dots */}
                    {hasTasks && (
                      <div className="flex gap-0.5 flex-wrap justify-center">
                        {tasks.slice(0, 3).map((t, ti) => (
                          <div
                            key={ti}
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: completions[t.id]
                                ? '#4A7C59'
                                : someOverdue
                                ? '#C44B2B'
                                : t.phaseColor,
                              opacity: completions[t.id] ? 0.5 : 1,
                            }}
                          />
                        ))}
                        {tasks.length > 3 && (
                          <span className="text-[8px] text-text-secondary">+{tasks.length - 3}</span>
                        )}
                      </div>
                    )}
                    {allDone && <span className="text-[10px] text-success mt-0.5">✅</span>}
                  </button>

                  {/* Expanded day panel */}
                  {isExpanded && (
                    <div className="col-span-7 mt-1 bg-card border border-border rounded-xl p-4 space-y-2">
                      <p className="text-xs font-semibold text-text-secondary mb-2">
                        {formatDateDisplay(dateStr)}
                      </p>
                      {tasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          isCompleted={!!completions[task.id]}
                          onToggle={onToggle}
                          onNavigate={onNavigate}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Markdown Export ──────────────────────────────────────────────────────────

function buildMarkdownExport(phases, allTasks, completions) {
  const lines = ['# Brand Launch Roadmap\n'];

  phases.forEach((phase, pi) => {
    lines.push(`## ${phase.name} (${phase.weeks})\n`);
    const phaseTasks = allTasks.filter(t => t.phaseIdx === pi);
    const byDay = groupDayTasksFlat(phaseTasks);
    byDay.forEach(({ date, dayOfWeek, tasks }) => {
      lines.push(`### ${dayOfWeek}, ${formatShortDate(date)}`);
      tasks.forEach(task => {
        const done = completions[task.id];
        lines.push(`- [${done ? 'x' : ' '}] **${task.title}** (~${task.duration_hours}h)`);
        if (task.description) lines.push(`  - ${task.description}`);
        if (task.deliverable) lines.push(`  - 📦 *${task.deliverable}*`);
      });
      lines.push('');
    });
  });

  return lines.join('\n');
}

function groupDayTasksFlat(tasks) {
  const byDay = [];
  let lastDate = null;
  let current = null;
  tasks.forEach(task => {
    if (task.date !== lastDate) {
      lastDate = task.date;
      current = { date: task.date, dayOfWeek: task.dayOfWeek, tasks: [] };
      byDay.push(current);
    }
    current.tasks.push(task);
  });
  return byDay;
}

// ─── Main CalendarChecklist Component ────────────────────────────────────────

export function CalendarChecklist({ onNavigate }) {
  const { callAI, loading, error } = useAI();

  // Load persisted state
  const [startDate, setStartDate] = useState(() => {
    const saved = getStorage().calendar?.startDate;
    return saved || getNextMonday();
  });

  const [phases, setPhases] = useState(() => {
    const tasks = getStorage().calendar?.tasks;
    return tasks || [];
  });

  const [completions, setCompletions] = useState(() => {
    return getStorage().calendar?.completions || {};
  });

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [showRegenWarning, setShowRegenWarning] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [toast, setToast] = useState(null);

  // Flatten tasks from phases for display
  const allTasks = useMemo(() => flattenTasks(phases), [phases]);

  // Persist changes
  const persist = useCallback((newPhases, newCompletions, newStartDate) => {
    updateStorage(cur => ({
      ...cur,
      calendar: {
        startDate: newStartDate ?? startDate,
        tasks: newPhases ?? phases,
        completions: newCompletions ?? completions,
      },
      sectionProgress: {
        ...cur.sectionProgress,
        calendar: (newPhases ?? phases).length > 0 ? 0.5 : 0,
      },
    }));
  }, [startDate, phases, completions]);

  // Handle start date change
  const handleDateChange = useCallback((e) => {
    const val = e.target.value;
    setStartDate(val);
    updateStorage(cur => ({
      ...cur,
      calendar: { ...cur.calendar, startDate: val },
    }));
  }, []);

  // Generate roadmap
  const generateRoadmap = useCallback(async (isRegen = false) => {
    setParseError(null);
    setShowRegenWarning(false);

    const systemPrompt = buildSystemPrompt(startDate);

    let userMessage = `Create a complete launch roadmap starting from ${startDate}.`;
    if (isRegen && Object.keys(completions).length > 0) {
      const completedIds = Object.entries(completions)
        .filter(([, done]) => done)
        .map(([id]) => id);
      userMessage += ` The founder has already completed ${completedIds.length} tasks. Please compress the remaining timeline and skip tasks that have logical dependencies already fulfilled.`;
    }

    const text = await callAI(systemPrompt, userMessage);
    if (!text) return;

    const parsed = parseAIResponse(text);
    if (!parsed) {
      setParseError('AI returned an unexpected format. Please try again.');
      return;
    }

    setPhases(parsed.phases);
    persist(parsed.phases, completions, startDate);
    setToast('Roadmap generated! 🎉');

    // Update section progress
    updateStorage(cur => ({
      ...cur,
      sectionProgress: { ...cur.sectionProgress, calendar: 0.5 },
    }));
  }, [startDate, completions, callAI, persist]);

  // Toggle task completion
  const handleToggle = useCallback((taskId) => {
    const newCompletions = { ...completions, [taskId]: !completions[taskId] };
    if (!newCompletions[taskId]) delete newCompletions[taskId]; // clean up false values
    setCompletions(newCompletions);

    // Update progress
    const totalTasks = flattenTasks(phases).length;
    const completedCount = Object.values(newCompletions).filter(Boolean).length;
    const progress = totalTasks > 0 ? completedCount / totalTasks : 0;

    updateStorage(cur => ({
      ...cur,
      calendar: { ...cur.calendar, completions: newCompletions },
      sectionProgress: {
        ...cur.sectionProgress,
        calendar: progress >= 1 ? 1 : progress > 0 ? 0.5 : 0,
      },
    }));
  }, [completions, phases]);

  // Navigate to section
  const handleNavigate = useCallback((section) => {
    if (onNavigate) onNavigate(section);
  }, [onNavigate]);

  // Export as Markdown
  const handleExport = useCallback(() => {
    const md = buildMarkdownExport(phases, allTasks, completions);
    navigator.clipboard.writeText(md).then(() => {
      setToast('Copied to clipboard! Paste into Notion or Google Docs 📋');
    });
  }, [phases, allTasks, completions]);

  const hasRoadmap = phases.length > 0 && allTasks.length > 0;
  const completedCount = allTasks.filter(t => completions[t.id]).length;

  return (
    <div className="max-w-3xl mx-auto py-10 px-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-text-primary mb-1">📅 Launch Roadmap</h1>
        <p className="text-text-secondary text-sm">Your AI-powered day-by-day plan, built from all your saved data.</p>
      </div>

      {/* Start Date + Generate */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            Start date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={handleDateChange}
            className="w-full max-w-xs border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary bg-background focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <p className="text-xs text-text-secondary mt-1.5">Starts {formatDateDisplay(startDate)} — weekdays only</p>
        </div>

        {!hasRoadmap ? (
          <button
            onClick={() => generateRoadmap(false)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-semibold text-sm hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Generating roadmap…
              </>
            ) : (
              <>✨ Generate My Roadmap</>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            {!showRegenWarning ? (
              <button
                onClick={() => setShowRegenWarning(true)}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium text-text-secondary hover:bg-border/30 hover:text-text-primary transition-colors"
              >
                🔄 Re-generate Roadmap
              </button>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-warning/10 border border-warning/30 rounded-xl text-sm">
                <span className="text-warning">⚠️</span>
                <span className="text-text-secondary">
                  This replaces your current roadmap. {completedCount > 0 && `${completedCount} completed task${completedCount !== 1 ? 's' : ''} will be preserved.`}
                </span>
                <button
                  onClick={() => generateRoadmap(true)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-semibold hover:bg-accent-hover transition-colors disabled:opacity-60"
                >
                  {loading ? '⏳ Regenerating…' : 'Confirm'}
                </button>
                <button
                  onClick={() => setShowRegenWarning(false)}
                  className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-border/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {hasRoadmap && (
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium text-text-secondary hover:bg-border/30 hover:text-text-primary transition-colors"
              >
                📋 Copy as Markdown
              </button>
            )}
          </div>
        )}

        {(error || parseError) && (
          <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-4 text-sm">
            <strong>Error:</strong> {error || parseError}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {hasRoadmap && (
        <ProgressBar
          phases={phases}
          allTasks={allTasks}
          completions={completions}
        />
      )}

      {/* View Toggle + Content */}
      {hasRoadmap && (
        <div>
          {/* Toggle */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="font-display text-xl text-text-primary">
              Your Launch Roadmap
            </h2>
            <div className="flex items-center gap-1 bg-border/30 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-card text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                ☰ List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-card text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                📆 Calendar
              </button>
            </div>
          </div>

          {viewMode === 'list' ? (
            <ListView
              allTasks={allTasks}
              completions={completions}
              onToggle={handleToggle}
              onNavigate={handleNavigate}
            />
          ) : (
            <CalendarGridView
              allTasks={allTasks}
              completions={completions}
              onToggle={handleToggle}
              onNavigate={handleNavigate}
            />
          )}
        </div>
      )}

      {/* Empty state */}
      {!hasRoadmap && !loading && (
        <div className="text-center py-12 text-text-secondary">
          <div className="text-5xl mb-4">🗺️</div>
          <p className="font-medium text-text-primary mb-2">No roadmap yet</p>
          <p className="text-sm">Set your start date and generate your personalized launch plan.</p>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

export default CalendarChecklist;
