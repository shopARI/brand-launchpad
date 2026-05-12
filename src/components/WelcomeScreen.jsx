import { useState, useEffect } from 'react';
import { updateStorage } from '../utils/storage';

export function WelcomeScreen({ onComplete }) {
  const [name, setName] = useState('');
  const [brandIdea, setBrandIdea] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [visible, setVisible] = useState(false);

  // Subtle fade-in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedIdea = brandIdea.trim();
    const trimmedKey = apiKey.trim();
    updateStorage((prev) => ({
      ...prev,
      user: { name: trimmedName, brandIdea: trimmedIdea, apiKey: trimmedKey },
    }));
    onComplete({ name: trimmedName, brandIdea: trimmedIdea, apiKey: trimmedKey });
  };

  const canSubmit = name.trim().length > 0 && brandIdea.trim().length > 0;

  return (
    <div
      className={`min-h-screen bg-background flex items-start justify-center px-6 py-16 transition-opacity duration-700 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="w-full max-w-xl">
        {/* Dynamic headline — updates as user types */}
        <h1 className="font-display text-4xl text-text-primary mb-6">
          Hi {name || 'there'} 👋
        </h1>

        {/* Personal intro copy */}
        <div className="space-y-4">
          <p className="text-text-secondary leading-relaxed text-base">
            This is Brand Launchpad — your playbook for turning a beverage idea into a real brand.
          </p>
          <p className="text-text-secondary leading-relaxed text-base">
            I know you're a solo founder. Based in Canada. Maybe you've got a killer idea for a
            drink, maybe it's still half-formed. Either way — this walks you through everything:
            validating your concept, finding funding, building a brand, getting pre-orders, and
            actually making the thing.
          </p>
          <p className="text-text-secondary leading-relaxed text-base">
            You might build an empire. You might build a fun side project. You might try it and
            decide it's not for you. All of those are totally fine.
          </p>
          <p className="text-text-primary font-medium text-base">Let's just start.</p>
        </div>

        {/* Form — same page, no step transition */}
        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Your name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jasmine"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary placeholder-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
            />
          </div>

          {/* Brand idea */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              What's your brand idea?
            </label>
            <textarea
              value={brandIdea}
              onChange={(e) => setBrandIdea(e.target.value)}
              rows={3}
              placeholder="Even if it's vague. 'Something with tequila and ginger' counts."
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary placeholder-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors resize-none"
            />
            <p className="text-xs text-text-secondary mt-1">You can always change this later.</p>
          </div>

          {/* API key */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Anthropic API key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary placeholder-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors font-mono text-sm"
            />
            <p className="text-xs text-text-secondary mt-1">
              Powers the AI features. Get one free at{' '}
              <a
                href="https://console.anthropic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                console.anthropic.com
              </a>
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full mt-4 px-6 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-base"
          >
            Let's Go →
          </button>
        </form>
      </div>
    </div>
  );
}
