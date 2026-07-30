<p align="center">
  <img src="apps/web/public/logo.svg" width="80" height="80" alt="Starfolio Logo" />
</p>

<h1 align="center">Starfolio</h1>

<p align="center">
  <strong>Instantly fetch & export any GitHub user's starred repositories — zero tokens or login required.</strong>
</p>

<p align="center">
  <a href="https://starfolio.visox.tech/"><img src="https://img.shields.io/badge/Live%20Demo-starfolio.visox.tech-FF9900.svg?style=for-the-badge&logo=vercel" alt="Live Demo"></a>
</p>

<p align="center">
  <a href="https://github.com/MiguelVivar/Starfolio/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-amber.svg?style=flat-square" alt="License MIT"></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15-black.svg?style=flat-square&logo=next.js" alt="Next.js 15"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-blue.svg?style=flat-square&logo=typescript" alt="TypeScript 5"></a>
  <a href="https://turbo.build"><img src="https://img.shields.io/badge/Turborepo-Monorepo-red.svg?style=flat-square&logo=turborepo" alt="Turborepo"></a>
  <img src="https://img.shields.io/badge/Auth-Zero%20Token%20Required-success.svg?style=flat-square" alt="Zero Auth Required">
</p>

---

## ✨ Features

- ⚡ **Zero Auth Needed**: Type any public GitHub username and fetch their starred repositories instantly — no personal access tokens or login required.
- 📊 **Multi-Format Export**: Download your star portfolio in **Excel (.xlsx)**, **CSV**, **JSON**, or **Markdown**.
- 🔍 **Interactive Table View**: Fast, responsive grid to filter, search, and sort repositories by stars, language, license, or update date.
- 🎨 **Modern Dark & Light Mode**: Tailored HSL colors, glassmorphism aesthetics, and custom SVG branding.
- 🏗️ **Clean Monorepo Architecture**: Decoupled domain models, standalone GitHub fetcher package, and format exporter engine built with Turborepo & pnpm.

---

## 📁 Monorepo Layout

```
Starfolio/
├── apps/
│   └── web/                   # Next.js 15 (App Router) UI & API endpoints
└── packages/
    ├── types/                 # Agnostic Repository domain model (zero runtime dependencies)
    ├── utils/                 # Pure formatting helpers (counts, sizes, dates)
    ├── github-exporter/       # Standalone GitHub REST API fetcher & normalizer
    └── exporters/             # Modular export generators (Excel, CSV, JSON, Markdown)
```

> **Dependency direction is strictly one-way**:  
> `types` ← `utils` / `github-exporter` / `exporters` ← `apps/web`

---

## 🚀 Export Formats

| Format | File Extension | Ideal Use Case |
| :--- | :--- | :--- |
| **Excel** | `.xlsx` | Spreadsheet analysis, sorting in Microsoft Excel or Google Sheets |
| **CSV** | `.csv` | Data science workflows, database import, pandas analysis |
| **JSON** | `.json` | Programmatic processing, backup, custom web integrations |
| **Markdown** | `.md` | Copy-pasting directly into GitHub READMEs or Notion docs |

---

## 💻 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (v20 or higher)
- [pnpm](https://pnpm.io) (v11 or higher)

### Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MiguelVivar/Starfolio.git
   cd Starfolio
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Start development server**:
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Monorepo Scripts

Run any of the following commands from the repository root:

```bash
pnpm build        # Build production bundles for all packages & web app
pnpm typecheck    # Execute TypeScript typechecking across all packages
pnpm lint         # Run ESLint validation
pnpm format       # Auto-format all code with Prettier
```

---

## 🛣️ Roadmap

- [ ] On-demand README preview & full-text search.
- [ ] Multi-provider exporters (`packages/gitlab-exporter`, `packages/bitbucket-exporter`).
- [ ] Standalone CLI utility (`npx @starfolio/cli <username>`).

---

## 📜 License

Distributed under the [MIT License](./LICENSE).
