# Brand Launchpad

> AI-powered operating system for launching your first beverage brand

Brand Launchpad is a single-page React web app that guides a first-time founder through every step of launching an alcohol/beverage brand — from brainstorming your concept to production planning.

## Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS v3 with custom design tokens
- **AI:** Anthropic Claude (claude-sonnet-4-20250514)
- **Persistence:** localStorage (no backend)
- **Deployment:** GitHub Pages

## Design Tokens

| Token | Value |
|-------|-------|
| Background | `#FAF8F5` |
| Text Primary | `#2C2418` |
| Text Secondary | `#6B5D4F` |
| Accent | `#C4762B` |
| Success | `#4A7C59` |

**Fonts:** Playfair Display (display) + DM Sans (body)

## Modules

1. 🧠 **Brainstorm** — Explore and refine your brand concept
2. 💰 **Financing & Grants** — Discover funding opportunities
3. 🧮 **Pricing Calculator** — Model your margins
4. 🎨 **Branding Guide** — Build your visual identity
5. 📣 **Marketing Plan** — Go-to-market strategy
6. 🛒 **Pre-Order Setup** — Launch your first orders
7. 🏭 **Production Brief** — Co-packer specs & compliance
8. 📅 **Calendar & Checklist** — Track your launch timeline

## Getting Started

```bash
npm install
npm run dev
```

On first load, you'll be prompted for:
- Your name
- Your brand idea
- Your Anthropic API key (from [console.anthropic.com](https://console.anthropic.com))

Your API key and all data are stored **exclusively in your browser's localStorage** — nothing is sent to our servers.

## Privacy

- No backend, no database
- API key stored only in `localStorage`
- All AI calls go directly from your browser to Anthropic's API
