import { useState, useCallback } from 'react';
import { getApiKey } from '../utils/storage';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 2000;

/**
 * useAI hook — calls Anthropic API directly from the browser.
 *
 * NOTE: Direct browser calls to api.anthropic.com require the
 * `anthropic-dangerous-direct-browser-access: "true"` header.
 * If your API key is restricted or CORS is blocked, you may need
 * to proxy requests through a simple server (e.g. Cloudflare Worker
 * or Vercel Edge Function) that forwards them to Anthropic.
 *
 * Returns: { callAI, response, loading, error, reset }
 */
export function useAI() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reset = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  const callAI = useCallback(async (systemPrompt, userMessage) => {
    const apiKey = getApiKey();

    if (!apiKey) {
      setError('No API key found. Please add your Anthropic API key in Settings.');
      return null;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `API error: ${res.status}`);
      }

      const data = await res.json();
      const text = data.content?.[0]?.text ?? '';
      setResponse(text);
      return text;
    } catch (err) {
      const message = err.message || 'Unknown error calling Anthropic API';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { callAI, response, loading, error, reset };
}
