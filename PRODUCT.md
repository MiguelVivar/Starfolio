# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: developers who want to export the full list of GitHub repositories a given public GitHub username has starred (their own or someone else's), for personal use, research, or curation.

Secondary (future, not built now): this package becomes the data-acquisition layer for a later AI-powered SaaS built on top of exported star data. That SaaS is explicitly out of scope for this build.

## Product Purpose

Given any public GitHub username, fetch every public repository that user has starred and let them browse and export that data. Success = a complete, accurate, fully-typed export (no missed pages, no truncated fields) in the visitor's format of choice.

## Positioning

The GitHub-fetching logic is not a page-level fetch call — it is a standalone, strongly-typed, provider-agnostic package (`packages/github-exporter`) with a single entry point (`exportRepositories(username): Promise<Repository[]>`) that a web UI, a future CLI, a future API, and a future SaaS can all depend on without duplicating logic. The web app is intentionally a thin UI layer only; it contains no GitHub-specific logic itself. This separation is the thing a quick one-off script could not truthfully claim.

## Operating Context

- pnpm workspaces monorepo, Turborepo for task orchestration.
- `apps/web`: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, TanStack Table.
- `packages/github-exporter`: all GitHub GraphQL logic (via `@octokit/graphql`), pagination, rate-limit handling, normalization.
- `packages/exporters`: format writers (Excel via SheetJS, CSV, JSON, Markdown).
- `packages/types`, `packages/utils`: shared strongly-typed domain model and helpers.
- Validation via Zod. Linting/formatting via ESLint/Prettier.
- Architecture must anticipate future GitLab and Bitbucket exporters without a rewrite (provider-agnostic interfaces).

## Capabilities and Constraints

- Web app responsibilities: accept a GitHub username, trigger the export package, render results in a searchable/sortable table, show loading/empty/error states, and export the current result set to Excel, CSV, JSON, and Markdown.
- All GitHub API access, pagination, rate-limit handling, and data normalization must live in `packages/github-exporter` — the web app must not talk to GitHub directly.
- `Repository` domain model (strongly typed, no `any`) includes: id, provider, owner, ownerAvatar, ownerUrl, name, fullName, description, url, homepage, primaryLanguage, topics, license, stars, forks, watchers, openIssues, archived, fork, defaultBranch, createdAt, updatedAt, pushedAt, size, visibility, readme (nullable).
- Auth: GitHub's GraphQL API requires authentication on every request (unlike its REST API, it has no unauthenticated path at all). Rather than asking each visitor to create and paste their own token — real friction for a tool meant to be tried casually — the token is a server-side secret (`GITHUB_TOKEN` env var, see `apps/web/.env.example`), configured once by whoever deploys/runs Starfolio. The visitor only ever provides a username. Trade-off: all visitors of a given deployment share that one token's 5,000 req/hr rate limit; acceptable for a self-hosted/personal tool, worth revisiting (per-visitor OAuth) if this ever runs as a public multi-tenant service.
- The `readme` field stays in the `Repository` type for future use but is not fetched in v1 (always `null`), to keep exports fast for large star lists.
- The GitHub GraphQL call runs server-side, behind a Next.js route handler/server action — the browser never talks to GitHub directly. This keeps a future shared server token possible and avoids CORS entirely.
- Explicitly undecided: hosting target.

## Brand Commitments

Working name: "Starfolio" (open to change; not a finalized brand). No existing logo, palette, or identity constraints yet.

## Evidence on Hand

None. Greenfield build — no existing code, content, testimonials, or assets. Nothing here should be fabricated; the only real GitHub data is whatever the export call returns at runtime.

## Product Principles

1. The exporter logic is provider-agnostic and UI-agnostic — it must be reusable by a future CLI, API, or SaaS without modification.
2. Type safety and correctness outrank speed of shipping; no `any`, no silently-swallowed pagination or rate-limit failures.
3. The web UI is a thin, fast, minimal surface — not where product complexity lives.
4. Architecture stays open to additional source-control providers (GitLab, Bitbucket) and to the future SaaS layer, without premature abstraction beyond what those are known to need.
5. This is meant to hold up as a credible public open-source project, not a throwaway script.
