import { useState, useEffect } from 'react';
import { updateStorage } from '../utils/storage';

export function WelcomeScreen({ onComplete }) {
  const [name, setName] = useState('');
  const [brandIdea, setBrandIdea] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [visible, setVisible] = useState(false);
  const [showBegin, setShowBegin] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem('brandLaunchpad') || '{}');
      return !data?.beginDismissed;
    } catch {
      return true;
    }
  });

  // Subtle fade-in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, []);

  const dismissBegin = () => {
    setShowBegin(false);
    try {
      const data = JSON.parse(localStorage.getItem('brandLaunchpad') || '{}');
      data.beginDismissed = true;
      localStorage.setItem('brandLaunchpad', JSON.stringify(data));
    } catch {
      // ignore
    }
  };

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
    <div className="relative min-h-screen overflow-hidden">
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={`${import.meta.env.BASE_URL}welcome-video.mp4`} type="video/mp4" />
      </video>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50 z-10" />

      {/* Main content */}
      <div
        className={`relative z-20 flex items-start justify-center px-6 py-16 min-h-screen transition-opacity duration-700 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="w-full max-w-xl">
          {/* Dynamic headline — updates as user types */}
          <h1 className="font-display text-4xl text-white mb-6">
            Hi {name || 'there'} 👋
          </h1>

          {/* Personal intro copy */}
          <div className="space-y-4">
            <p className="text-white/85 leading-relaxed text-base">
              This is Brand Launchpad — your playbook for turning a beverage idea into a real brand.
            </p>
            <p className="text-white/85 leading-relaxed text-base">
              I know you're a solo founder. Based in Canada. Maybe you've got a killer idea for a
              drink, maybe it's still half-formed. Either way — this walks you through everything:
              validating your concept, finding funding, building a brand, getting pre-orders, and
              actually making the thing.
            </p>
            <p className="text-white/85 leading-relaxed text-base">
              You might build an empire. You might build a fun side project. You might try it and
              decide it's not for you. All of those are totally fine.
            </p>
            <p className="text-white font-medium text-base">Let's just start.</p>
          </div>

          {/* Form — same page, no step transition */}
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1.5">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jasmine"
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/90 text-text-primary placeholder-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
              />
            </div>

            {/* Brand idea */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1.5">
                What's your brand idea?
              </label>
              <textarea
                value={brandIdea}
                onChange={(e) => setBrandIdea(e.target.value)}
                rows={3}
                placeholder="Even if it's vague. 'Something with tequila and ginger' counts."
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/90 text-text-primary placeholder-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors resize-none"
              />
              <p className="text-xs text-white/60 mt-1">You can always change this later.</p>
            </div>

            {/* API key */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1.5">
                Anthropic API key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/90 text-text-primary placeholder-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors font-mono text-sm"
              />
              <p className="text-xs text-white/60 mt-1">
                Powers the AI features. Get one free at{' '}
                <a
                  href="https://console.anthropic.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-300 hover:underline"
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

      {/* BEGIN!!!! popup — first visit only */}
      {showBegin && (
        <div
          onClick={dismissBegin}
          className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer"
          style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.72)' }}
        >
          <div className="flex flex-col items-center gap-8 px-8 text-center select-none">
            <div className="begin-bounce">
              <span className="text-7xl md:text-8xl font-display font-bold text-white leading-none tracking-tight drop-shadow-2xl">
                ✨ BEGIN!!!! ✨
              </span>
            </div>
            <p className="text-white/70 text-lg">Your brand journey starts here.</p>
            <button
              onClick={dismissBegin}
              className="px-10 py-4 rounded-2xl bg-accent text-white text-xl font-bold hover:bg-accent-hover transition-colors shadow-2xl"
            >
              Let's Go! →
            </button>
            <p className="text-white/40 text-sm">click anywhere to continue</p>
          </div>
        </div>
      )}
    </div>
  );
}
