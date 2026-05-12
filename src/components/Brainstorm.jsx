import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChevronDown, ChevronUp, Copy, Check, Loader2 } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { getStorage, updateStorage } from '../utils/storage';

// EXACT system prompt as specified — do not paraphrase or shorten
const SYSTEM_PROMPT = `You are a senior beverage industry consultant who has launched 50+ alcohol brands. You specialize in advising first-time founders. The user is a 24-year-old solo female founder in Canada with less than $30K/year income and no startup capital.

When they share their brand idea, respond with this EXACT structure (use markdown headers):

## First Impression
2-3 sentences on what excites you about this concept and its viability.

## Market Reality Check
- What category does this fall into? (RTD, spirits, beer, wine, non-alc, etc.)
- Estimated market size in Canada for this category
- Is this category growing or shrinking? By how much?
- Who are the top 3 direct competitors and what they charge?

## Challenges You'll Face
List 4-6 specific, real challenges. Be honest but not discouraging. Include:
- Regulatory (LCBO/provincial liquor board requirements)
- Capital requirements (typical range to launch in this category)
- Production minimums from co-packers
- Distribution barriers
- Timeline realities

## What's Working In Your Favor
List 3-5 genuine advantages or tailwinds. Consider:
- Market trends favoring this concept
- Low-barrier entry strategies
- Her demographic advantage (if any)
- Digital-first launch advantages

## Suggested Pivots or Enhancements
2-3 specific tweaks that could make the concept stronger, more fundable, or easier to launch with zero capital.

## One-Line Pitch
Write a punchy one-line pitch she could use for investors or social media.

Be specific with numbers, brand names, and Canadian market data. No fluff. Talk to her like a smart peer, not a student.`;

function formatTimestamp(ts) {
  try {
    return new Date(ts).toLocaleString('en-CA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return ts;
  }
}

// Prose classes for rendering AI markdown (headers, lists, bold, paragraphs)
const PROSE_CLASSES = [
  '[&_h2]:font-display [&_h2]:text-lg [&_h2]:text-text-primary [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:first:mt-0',
  '[&_p]:text-text-secondary [&_p]:leading-relaxed [&_p]:mb-2',
  '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-text-secondary [&_ul]:mb-3',
  '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:text-text-secondary [&_ol]:mb-3',
  '[&_li]:mb-1 [&_li]:leading-relaxed',
  '[&_strong]:text-text-primary [&_strong]:font-semibold',
].join(' ');

// Compact prose classes for history entries
const PROSE_COMPACT = [
  '[&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-text-primary [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:first:mt-0',
  '[&_p]:text-xs [&_p]:text-text-secondary [&_p]:leading-relaxed [&_p]:mb-1.5',
  '[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:text-text-secondary [&_ul]:mb-2',
  '[&_ol]:list-decimal [&_ol]:pl-4 [&_ul]:text-text-secondary [&_ol]:mb-2',
  '[&_li]:text-xs [&_li]:mb-0.5 [&_li]:leading-relaxed',
  '[&_strong]:text-text-primary [&_strong]:font-semibold',
].join(' ');

export function Brainstorm() {
  // Initialize state from localStorage (pre-populate from onboarding if no saved brainstorm)
  const [idea, setIdea] = useState(() => {
    const data = getStorage();
    return data.brainstorm.currentIdea || data.user.brandIdea || '';
  });
  const [feedback, setFeedback] = useState(() => getStorage().brainstorm.feedback || '');
  const [ideas, setIdeas] = useState(() => getStorage().brainstorm.ideas || []);
  const [refineText, setRefineText] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(() => {
    const data = getStorage();
    return !!(data.brainstorm.feedback && data.brainstorm.currentIdea);
  });
  const [copied, setCopied] = useState(false);

  const { callAI, loading, error, reset } = useAI();

  const handleGetFeedback = useCallback(async () => {
    if (!idea.trim() || loading) return;
    reset();
    const result = await callAI(SYSTEM_PROMPT, idea.trim());
    if (result) {
      setFeedback(result);
      setIsSaved(false);
    }
  }, [idea, loading, callAI, reset]);

  const handleRefine = useCallback(async () => {
    if (!refineText.trim() || loading) return;
    reset();
    const userMessage = [
      `My original brand idea: ${idea.trim()}`,
      '',
      `Your previous feedback:`,
      feedback || '(no previous feedback)',
      '',
      `My refinement or follow-up: ${refineText.trim()}`,
    ].join('\n');
    const result = await callAI(SYSTEM_PROMPT, userMessage);
    if (result) {
      setFeedback(result);
      setIsSaved(false);
      setRefineText('');
    }
  }, [idea, feedback, refineText, loading, callAI, reset]);

  const handleSave = useCallback(() => {
    if (!idea.trim() || !feedback) return;
    const newEntry = {
      idea: idea.trim(),
      feedback,
      timestamp: new Date().toISOString(),
    };
    const updatedIdeas = [...ideas, newEntry];
    setIdeas(updatedIdeas);
    setIsSaved(true);
    updateStorage((data) => ({
      ...data,
      brainstorm: {
        ...data.brainstorm,
        ideas: updatedIdeas,
        currentIdea: idea.trim(),
        feedback,
      },
      sectionProgress: {
        ...data.sectionProgress,
        brainstorm: 2,
      },
    }));
  }, [idea, feedback, ideas]);

  const handleCopyFeedback = useCallback(() => {
    if (!feedback) return;
    navigator.clipboard.writeText(feedback).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [feedback]);

  return (
    <div className="max-w-2xl mx-auto py-10 px-6 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-text-primary mb-2">
          What&rsquo;s Your Brand Idea?
        </h1>
        <p className="text-text-secondary leading-relaxed">
          Describe your concept and get real feedback from an AI beverage industry advisor.
        </p>
      </div>

      {/* Idea Input Card */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <label
          htmlFor="brand-idea"
          className="block text-sm font-medium text-text-primary mb-2"
        >
          Your Brand Concept
        </label>
        <textarea
          id="brand-idea"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={5}
          placeholder="Describe your beverage brand idea — the product, who it's for, what makes it different, why you're excited about it..."
          className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors text-sm leading-relaxed"
          disabled={loading}
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleGetFeedback}
            disabled={!idea.trim() || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Analyzing&hellip;
              </>
            ) : (
              'Get Feedback'
            )}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 mb-6 text-sm text-danger">
          {error}
        </div>
      )}

      {/* AI Feedback Area */}
      {(feedback || loading) && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-text-secondary">
              <Loader2 size={28} className="animate-spin text-accent" />
              <p className="text-sm">Analyzing your concept&hellip;</p>
              <p className="text-xs text-text-secondary/60">This takes about 10&ndash;20 seconds</p>
            </div>
          ) : (
            <>
              {/* Feedback header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-text-primary">
                  Advisor Feedback
                </h2>
                <button
                  onClick={handleCopyFeedback}
                  title="Copy feedback to clipboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-border/40 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={13} className="text-success" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Markdown-rendered feedback */}
              <div className={`text-sm ${PROSE_CLASSES}`}>
                <ReactMarkdown>{feedback}</ReactMarkdown>
              </div>

              {/* Save & Continue */}
              <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
                <p className="text-xs text-text-secondary/70">
                  {isSaved
                    ? 'Progress saved. Come back anytime to refine further.'
                    : 'Save your idea and feedback to track progress.'}
                </p>
                {isSaved ? (
                  <span className="flex items-center gap-1.5 text-success text-sm font-medium">
                    <Check size={15} />
                    Saved
                  </span>
                ) : (
                  <button
                    onClick={handleSave}
                    className="px-5 py-2.5 rounded-xl bg-success text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Save &amp; Continue &rarr;
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Refine My Idea */}
      {feedback && !loading && (
        <div className="bg-background border border-dashed border-border/60 rounded-2xl p-6 mb-6">
          <h2 className="font-display text-lg text-text-primary mb-1 flex items-center">
            Refine Your Idea
            <span className="text-xs bg-border/40 text-text-secondary px-2 py-0.5 rounded-full ml-2">Optional</span>
          </h2>
          <p className="text-sm text-text-secondary mb-4 leading-relaxed">
            Dig deeper or ask a follow-up.
          </p>
          <textarea
            id="refine-idea"
            value={refineText}
            onChange={(e) => setRefineText(e.target.value)}
            rows={3}
            placeholder="What would you like to refine or explore further? E.g. 'Can you focus on the RTD market?' or 'What if I position it as a premium product?'"
            className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors text-sm leading-relaxed"
            disabled={loading}
          />
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleRefine}
              disabled={!refineText.trim() || loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-accent text-accent bg-transparent hover:bg-accent/10 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Refining&hellip;
                </>
              ) : (
                'Refine Your Idea'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Brainstorm History Accordion */}
      {ideas.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <button
            onClick={() => setHistoryOpen((open) => !open)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-border/20 transition-colors"
            aria-expanded={historyOpen}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-primary">
                Brainstorm History
              </span>
              <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                {ideas.length} iteration{ideas.length !== 1 ? 's' : ''}
              </span>
            </div>
            {historyOpen ? (
              <ChevronUp size={16} className="text-text-secondary flex-shrink-0" />
            ) : (
              <ChevronDown size={16} className="text-text-secondary flex-shrink-0" />
            )}
          </button>

          {historyOpen && (
            <div className="divide-y divide-border">
              {[...ideas].reverse().map((entry, i) => {
                const iterationNumber = ideas.length - i;
                return (
                  <div key={`${entry.timestamp}-${i}`} className="px-6 py-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-text-secondary">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                      <span className="text-xs text-text-secondary/50">
                        Iteration {iterationNumber}
                      </span>
                    </div>
                    <p className="text-sm text-text-primary font-medium mb-3 leading-snug">
                      &ldquo;
                      {entry.idea.length > 140
                        ? entry.idea.slice(0, 140) + '\u2026'
                        : entry.idea}
                      &rdquo;
                    </p>
                    <div className={`text-sm ${PROSE_COMPACT}`}>
                      <ReactMarkdown>{entry.feedback}</ReactMarkdown>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
