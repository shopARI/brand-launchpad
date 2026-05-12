import { useState } from 'react';
import { X } from 'lucide-react';
import { getStorage, updateStorage } from '../utils/storage';

export function SettingsModal({ onClose, onSave }) {
  const storage = getStorage();
  const [apiKey, setApiKey] = useState(storage.user.apiKey || '');
  const [name, setName] = useState(storage.user.name || '');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateStorage((prev) => ({
      ...prev,
      user: { ...prev.user, name, apiKey },
    }));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onSave?.({ name, apiKey });
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/40 backdrop-blur-sm px-4">
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-8 border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-text-primary">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-border/40 text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary placeholder-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Anthropic API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-background text-text-primary placeholder-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors text-xs"
              >
                {showKey ? 'hide' : 'show'}
              </button>
            </div>
            <p className="mt-2 text-xs text-text-secondary">
              Your key is stored locally in your browser.{' '}
              <a
                href="https://console.anthropic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Get one at console.anthropic.com
              </a>
            </p>
          </div>

          <div className="bg-background rounded-xl p-4 text-xs text-text-secondary space-y-1">
            <p className="font-medium text-text-primary">🔒 Privacy Note</p>
            <p>Your API key and all data are stored exclusively in your browser's localStorage. Nothing is sent to our servers.</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 border border-border text-text-secondary hover:bg-border/30 font-medium rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 px-6 bg-accent hover:bg-accent-hover text-white font-medium rounded-xl transition-colors"
          >
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
