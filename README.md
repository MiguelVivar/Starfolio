# Starfolio

Export every public repository a GitHub user has starred — browse it in a
fast, searchable table, then export to Excel, CSV, JSON, or Markdown.

Starfolio's GitHub-fetching logic lives in a standalone, fully-typed package
(`packages/github-exporter`) with a single entry point,
`exportRepositories(username, { token })`. The web app is a thin UI on top of
it — the package itself is designed to be reused by a future CLI, API, or SaaS
without modification.

## Why a token is required

GitHub's GraphQL API (unlike its REST API) has **no unauthenticated path** —
every request must carry a token. Rather than asking every visitor to create
one, Starfolio reads a single token from the server environment
(`GITHUB_TOKEN`) — set it once when you run or deploy the app; visitors only
ever type a username. [Create a token](https://github.com/settings/tokens/new?description=Starfolio&scopes=public_repo)
with `public_repo` (read) scope — it takes about ten seconds. All visitors of
one deployment share that token's 5,000 req/hr limit.

## Monorepo layout

```
apps/
  web/                   Next.js 15 (App Router) UI — no GitHub logic
packages/
  types/                 Repository domain model, zero runtime deps
  utils/                 Pure formatting helpers (counts, sizes, dates)
  github-exporter/       All GitHub logic: GraphQL, pagination, rate limits, normalization
  exporters/             Format writers: CSV, JSON, Markdown, Excel (provider-agnostic)
```

Dependency direction is one-way: `types` ← `utils`/`github-exporter`/`exporters` ← `apps/web`.
`github-exporter` (source) and `exporters` (output format) don't know about
each other beyond the shared `Repository` type, which is what lets
`exporters` serve a future GitLab/Bitbucket source without changes.

See [PRODUCT.md](./PRODUCT.md) for product intent and [DESIGN.md](./DESIGN.md)
for the visual system.

## Getting started

Requires Node 20+ and [pnpm](https://pnpm.io).

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local   # then paste a real GITHUB_TOKEN into it
pnpm dev        # apps/web on http://localhost:3000
```

Other scripts (run from the repo root, via Turborepo):

```bash
pnpm build       # production build, every package
pnpm typecheck    # tsc --noEmit, every package
pnpm lint         # eslint, every package
pnpm format       # prettier --write
```

## Roadmap

- On-demand README fetching (the `Repository.readme` field exists but is
  always `null` today — fetching every README up front would slow large
  exports).
- Additional providers (`packages/gitlab-exporter`, etc.) implementing the
  same `exportRepositories(username, options): Promise<Repository[]>` shape.
- A CLI and/or API surface reusing `packages/github-exporter` and
  `packages/exporters` directly.

## License

[MIT](./LICENSE)
