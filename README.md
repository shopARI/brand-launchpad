# Brand Launchpad 🚀

> AI-powered operating system for launching your first beverage brand

**Live App:** [shopARI.github.io/brand-launchpad](https://shopARI.github.io/brand-launchpad/)

Brand Launchpad is a single-page React web app that guides a first-time founder through every step of launching an alcohol/beverage brand — from brainstorming your concept all the way to production planning and launch scheduling.

---

## Features

| Module | Description |
|--------|-------------|
| 🧠 **Brainstorm** | AI-powered brand concept exploration and refinement |
| 💰 **Financing & Grants** | Discover funding opportunities specific to beverage/alcohol brands |
| 🧮 **Pricing Calculator** | Model your margins, COGS, and retail pricing |
| 🎨 **Branding Guide** | Build your visual identity, tone of voice, and brand story |
| 📣 **Marketing Plan** | AI-generated go-to-market strategy and channel playbook |
| 🛒 **Pre-Order Setup** | Launch your first orders before production begins |
| 🏭 **Production Brief** | Co-packer specs, compliance checklist, and MOQ planning |
| 📅 **Calendar & Checklist** | AI-powered day-by-day launch roadmap with timeline view |

---

## Tech Stack

- **Frontend:** React 19 + Vite 8
- **Styling:** Tailwind CSS v3 with custom design tokens
- **AI:** Anthropic Claude (`claude-sonnet-4-20250514`)
- **Persistence:** `localStorage` — no backend, no database
- **Deployment:** GitHub Pages via GitHub Actions

---

## Getting Started

### Prerequisites

- Node.js 20+
- An Anthropic API key ([get one here](https://console.anthropic.com))

### Local Development

```bash
# Clone the repo
git clone https://github.com/shopARI/brand-launchpad.git
cd brand-launchpad

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173/brand-launchpad/](http://localhost:5173/brand-launchpad/) in your browser.

### First Launch

On first load you'll be prompted for:
1. **Your name** — used to personalize AI responses
2. **Your brand idea** — a short description of what you're building
3. **Anthropic API key** — stored only in your browser's `localStorage`

---

## API Key & CORS

This app calls Anthropic's API **directly from your browser** — there is no backend proxy.

### Getting an API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account or sign in
3. Navigate to **API Keys** and create a new key
4. Paste it into Brand Launchpad on first launch

### CORS Note

Direct browser-to-Anthropic API calls require the special header:

```
anthropic-dangerous-direct-browser-access: true
```

This header is automatically included in all API calls made by Brand Launchpad. Anthropic permits direct browser access for prototyping — for a production deployment, you should route API calls through a backend proxy to keep your API key secret.

> ⚠️ **Security:** Your API key is stored in `localStorage`. It is never sent to any server other than `api.anthropic.com`. For shared or public computers, clear your browser storage after use.

---

## Deployment

The app is deployed to GitHub Pages automatically via GitHub Actions on every push to `main`.

### GitHub Actions Workflow

```
.github/workflows/deploy.yml
```

**Trigger:** Push to `main` branch  
**URL:** `https://shopARI.github.io/brand-launchpad/`

### Manual Deploy

You can also trigger a deploy manually from the [Actions tab](https://github.com/shopARI/brand-launchpad/actions) using the `workflow_dispatch` trigger.

### GitHub Pages Setup (one-time)

1. Go to **Settings → Pages** in the repository
2. Set **Source** to `GitHub Actions`
3. Save — the workflow handles the rest

### SPA Routing on GitHub Pages

GitHub Pages doesn't natively support client-side routing (it 404s on page refresh). This is solved by:

1. **`public/404.html`** — Intercepts 404s and redirects to the app root with the path encoded as a query param
2. **`index.html` inline script** — Decodes the redirect param and uses `history.replaceState` to restore the correct URL before React mounts

---

## Project Structure

```
brand-launchpad/
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Pages deployment workflow
├── public/
│   ├── 404.html              # SPA routing fix for GitHub Pages
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/           # Shared UI components
│   ├── modules/              # One directory per module
│   ├── App.jsx               # Root component + routing
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles + Tailwind
├── index.html                # App shell (includes SPA redirect handler)
├── vite.config.js            # Vite config (base: '/brand-launchpad/')
├── tailwind.config.js        # Tailwind config
└── package.json
```

---

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#FAF8F5` | Page background |
| Text Primary | `#2C2418` | Headings, body |
| Text Secondary | `#6B5D4F` | Subtext, captions |
| Accent | `#C4762B` | CTAs, highlights |
| Success | `#4A7C59` | Completed states |

**Fonts:** [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) (display) + [DM Sans](https://fonts.google.com/specimen/DM+Sans) (body)

---

## Privacy

- ✅ No backend or database
- ✅ API key stored only in your browser's `localStorage`
- ✅ All AI calls go directly from your browser to `api.anthropic.com`
- ✅ No analytics, no tracking, no cookies

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

*Built by [ARI](https://shopari.com) · [Report an issue](https://github.com/shopARI/brand-launchpad/issues)*
