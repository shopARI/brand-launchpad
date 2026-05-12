const STORAGE_KEY = 'brandLaunchpad';

export const DEFAULT_STORAGE = {
  user: { name: '', apiKey: '', brandIdea: '' },
  brainstorm: { ideas: [], currentIdea: '', feedback: '' },
  financing: { customGrants: [] },
  pricing: { inputs: {}, outputs: {} },
  branding: { tone: [], colors: {}, name: '', story: '', checklist: {} },
  marketing: { batch1: null, batch2: null, batch3: null },
  preorder: { platform: '', checklist: {} },
  production: { reviewed: false },
  calendar: { startDate: '', tasks: [], completions: {} },
  sectionProgress: {
    brainstorm: 0,
    financing: 0,
    pricing: 0,
    branding: 0,
    marketing: 0,
    preorder: 0,
    production: 0,
    calendar: 0,
  },
};

export function getStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STORAGE };
    const parsed = JSON.parse(raw);
    // Merge defaults to handle schema additions
    return {
      ...DEFAULT_STORAGE,
      ...parsed,
      user: { ...DEFAULT_STORAGE.user, ...parsed.user },
      sectionProgress: { ...DEFAULT_STORAGE.sectionProgress, ...parsed.sectionProgress },
    };
  } catch {
    return { ...DEFAULT_STORAGE };
  }
}

export function setStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Storage write failed:', e);
  }
}

export function updateStorage(updater) {
  const current = getStorage();
  const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  setStorage(updated);
  return updated;
}

export function getApiKey() {
  return getStorage().user.apiKey || '';
}
