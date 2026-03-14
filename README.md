<div align="center">

# 💎 FinTrack AI

### Your Smart Financial Assistant — AI-Powered Personal Expense Tracker

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

**[Live Demo](https://fintrack-ai.vercel.app)** · **[Report Bug](https://github.com/AI-Kurukshetra/FinTrack/issues)** · **[Request Feature](https://github.com/AI-Kurukshetra/FinTrack/issues)**

![FinTrack AI Dashboard](https://via.placeholder.com/1200x600/040d14/10b981?text=FinTrack+AI+Dashboard)

</div>

---

## 📌 What is FinTrack AI?

FinTrack AI is a **production-ready, full-stack personal expense tracker** built for the Indian market. It combines real-time expense logging, intelligent budget management, and AI-powered financial insights — all wrapped in a premium glassmorphism dark UI.

> Built as a complete rewrite from Laravel + React → **Next.js 15 + Supabase** single monorepo, deployed on Vercel with zero cold starts.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Smart Dashboard** | KPI cards, daily bar chart, category donut, 6-month trend — all in one view |
| 💸 **Expense Tracking** | Add, edit, delete expenses with category, amount (₹), date and description |
| 🤖 **AI Insights** | GPT-4o-mini powered spending analysis — patterns, predictions, savings tips |
| 🎯 **Budget Management** | Set monthly budget, track % used, colour-coded alerts at 70% / 90% / 100% |
| 📈 **Analytics** | Category breakdown, day-of-week heatmap, month-on-month comparison |
| 📱 **Fully Responsive** | Mobile bottom nav, tablet sidebar, desktop full layout — works at 320px+ |
| 🌙 **Dark UI** | Premium glassmorphism design with emerald → cyan gradient system |
| 📥 **CSV Export** | Download all expenses as a formatted CSV file |
| ⚡ **Real-time** | Supabase Realtime sync — updates reflect instantly across browser tabs |
| 🔐 **Secure Auth** | Supabase Auth with Row Level Security — each user sees only their data |

---

## 🛠️ Tech Stack

```
Frontend        Next.js 15 (App Router) + React 19 + TypeScript
Styling         Tailwind CSS v4 + Framer Motion + Lucide Icons
Charts          Recharts (dynamic import, SSR-safe)
Auth + DB       Supabase (PostgreSQL + Auth + Row Level Security)
Validation      Zod (all API inputs validated)
AI              OpenAI GPT-4o-mini (streaming insights)
Deployment      Vercel (Edge Network)
Currency        INR (₹) — en-IN locale formatting
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free)
- An [OpenAI](https://platform.openai.com) API key (for AI insights)

### 1. Clone the repository

```bash
git clone https://github.com/AI-Kurukshetra/FinTrack.git
cd FinTrack/fintrack-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-proj-your-openai-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set up Supabase database

Go to your Supabase project → **SQL Editor** and run the migrations in order:

```bash
# Run these files in Supabase SQL Editor:
supabase/migrations/001_create_expenses.sql
supabase/migrations/002_create_budgets.sql
supabase/migrations/003_rls_policies.sql
supabase/migrations/004_indexes.sql
```

Then seed the demo account:

```bash
# Create demo user in Supabase Auth dashboard:
# Email: demo@fintrack.ai | Password: demo123

# Then run seed.sql to populate demo data:
supabase/seed.sql
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploy to Vercel

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AI-Kurukshetra/FinTrack)

### Manual deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# Settings → Environment Variables → add all from .env.local.example
```

---

## 📁 Project Structure

```
FinTrack/
└── fintrack-ai/                    # Next.js application
    ├── app/
    │   ├── (auth)/                 # Login + Signup pages
    │   │   ├── login/page.tsx
    │   │   └── signup/page.tsx
    │   ├── (dashboard)/            # Protected dashboard routes
    │   │   ├── layout.tsx          # Sidebar + BottomNav shell
    │   │   ├── dashboard/page.tsx  # KPIs + Charts + Budget
    │   │   ├── expenses/page.tsx   # Expense list + CRUD
    │   │   ├── analytics/page.tsx  # Deep-dive analytics
    │   │   ├── insights/page.tsx   # AI-generated insights
    │   │   └── settings/page.tsx   # Profile + Budget + Export
    │   └── api/                    # Next.js Route Handlers
    │       ├── expenses/route.ts   # GET list, POST create
    │       ├── expenses/[id]/      # PUT update, DELETE
    │       ├── budget/route.ts     # GET + POST budget
    │       ├── insights/route.ts   # AI insights (streaming)
    │       ├── export/route.ts     # CSV download
    │       └── health/route.ts     # Uptime ping endpoint
    ├── components/
    │   ├── ui/                     # Button, Card, Modal, Badge...
    │   ├── layout/                 # Sidebar, BottomNav, Header
    │   ├── charts/                 # BarChart, PieChart, TrendChart
    │   ├── expenses/               # ExpenseModal, ExpenseList
    │   └── dashboard/              # KPICard, BudgetBar
    ├── lib/
    │   ├── supabase/               # Browser + server clients
    │   ├── utils/                  # formatters, calculations
    │   └── validations/            # Zod schemas
    ├── supabase/
    │   ├── migrations/             # SQL migration files
    │   └── seed.sql                # Demo data
    ├── types/index.ts              # Shared TypeScript interfaces
    ├── middleware.ts               # Auth route protection
    └── .env.local.example          # Environment variable template
```

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server only) |
| `OPENAI_API_KEY` | ✅ | OpenAI API key for AI insights |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your app URL (localhost or production) |

> ⚠️ Never commit `.env.local` — it contains secrets. Only `.env.local.example` is committed.

---

## 🎨 Design System

FinTrack AI uses a custom **glassmorphism dark design system** built on Tailwind CSS v4:

```css
Background   bg-[#040d14]  — Deep ink black
Primary      emerald-400 → teal-400 → cyan-400  — Gradient
Glass cards  backdrop-blur-xl + bg-white/[0.03] + border-white/[0.07]
Fonts        Sora (headings) + DM Sans (body)
```

**Category Colours:**

| Category | Colour |
|----------|--------|
| 🍽️ Food & Dining | Amber |
| ✈️ Travel & Transport | Blue |
| 🛍️ Shopping | Pink |
| 📄 Bills & Utilities | Violet |
| 🎬 Entertainment | Orange |
| ❤️ Health & Fitness | Red |
| 📦 Other | Slate |

---

## 🗄️ Database Schema

```sql
-- expenses
id | user_id | amount | category | description | date | created_at

-- budgets
id | user_id | amount | created_at

-- Row Level Security: each user sees only their own data
```

---

## 🤖 Built Using Vibe Coding

This project was built using the **Vibe Coding** methodology:

```
💭 Idea
  → ChatGPT (refine + structure the prompt)
  → Claude (generate PRD, prompt.md, agents.md, skills.md)
  → Codex CLI /plan mode (architecture planning)
  → Codex CLI build mode (code generation phase by phase)
  → Deploy on Vercel
  → Iterate
```

**AI Tools Used:**
- **ChatGPT** — Idea refinement + prompt structuring
- **Claude** — PRD, architecture docs, deployment guides
- **Codex CLI** — Full-stack code generation (gpt-5.2-codex)
- **Skills from skills.sh** — vercel-react-best-practices, frontend-design, agent-browser, ui-ux-pro-max

---

## 📸 Screenshots

| Dashboard | Expenses | AI Insights |
|-----------|----------|-------------|
| ![Dashboard](https://via.placeholder.com/400x250/040d14/10b981?text=Dashboard) | ![Expenses](https://via.placeholder.com/400x250/040d14/06b6d4?text=Expenses) | ![Insights](https://via.placeholder.com/400x250/040d14/8b5cf6?text=AI+Insights) |

> 📹 [Watch the demo video](https://github.com/AI-Kurukshetra/FinTrack)

---

## 🗺️ Roadmap

- [x] Core expense tracking (CRUD)
- [x] Dashboard with charts
- [x] AI-powered insights
- [x] Budget management
- [x] CSV export
- [ ] PWA + push notifications
- [ ] UPI transaction import
- [ ] Family / shared expense mode
- [ ] React Native mobile app

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ for the Indian market · Currency in ₹ INR

**[⬆ Back to top](#-fintrack-ai)**

</div>