import { useState } from 'react';
import { updateStorage } from '../utils/storage';

export function OnboardingModal({ onComplete }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [brandIdea, setBrandIdea] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleComplete = () => {
    updateStorage((prev) => ({
      ...prev,
      user: { name, brandIdea, apiKey },
    }));
    onComplete({ name, brandIdea, apiKey });
  };

  const canProceedStep1 = name.trim().length > 0;
  const canProceedStep2 = brandIdea.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/40 backdrop-blur-sm px-4">
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-8 border border-border">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-text-primary mb-2">
            Brand Launchpad
          </h1>
          <p className="text-text-secondary text-sm">
            Your AI co-founder for beverage brand success
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  s === step
                    ? 'bg-accent text-white'
                    : s < step
                    ? 'bg-success text-white'
                    : 'bg-border text-text-secondary'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-8 h-0.5 transition-colors ${
                    s < step ? 'bg-success' : 'bg-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                What's your name?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary placeholder-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && canProceedStep1 && setStep(2)}
                autoFocus
              />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="w-full py-3 px-6 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2: Brand Idea */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Describe your beverage brand idea
              </label>
              <p className="text-xs text-text-secondary mb-3">
                Don't worry — this can be rough. The AI will help you refine it.
              </p>
              <textarea
                value={brandIdea}
                onChange={(e) => setBrandIdea(e.target.value)}
                placeholder="e.g. A craft hard kombucha for outdoor adventurers, featuring local botanicals..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary placeholder-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors resize-none"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 px-6 border border-border text-text-secondary hover:bg-border/30 font-medium rounded-xl transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="flex-1 py-3 px-6 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: API Key */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Anthropic API Key
              </label>
              <p className="text-xs text-text-secondary mb-3">
                Your key is stored locally in your browser — never sent to our servers.
                Get yours at{' '}
                <a
                  href="https://console.anthropic.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  console.anthropic.com
                </a>
              </p>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-background text-text-primary placeholder-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors font-mono text-sm"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors text-xs"
                >
                  {showKey ? 'hide' : 'show'}
                </button>
              </div>
            </div>
            <div className="bg-warning/10 rounded-xl p-3 text-xs text-text-secondary">
              <strong className="text-warning">Optional:</strong> You can skip this and add it
              later via Settings. AI features won't work without it.
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 px-6 border border-border text-text-secondary hover:bg-border/30 font-medium rounded-xl transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 py-3 px-6 bg-accent hover:bg-accent-hover text-white font-medium rounded-xl transition-colors"
              >
                {apiKey ? "Let's go! 🚀" : 'Skip for now'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
