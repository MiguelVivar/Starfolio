"use client";

import type { Provider, Repository } from "@starfolio/types";
import { AlertTriangle, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { ExportMenu } from "@/components/export-menu";
import { Logo } from "@/components/logo";
import { RecentSearches, saveRecentSearch } from "@/components/recent-searches";
import { RepositoryTable } from "@/components/repository-table";
import { ThemeToggle } from "@/components/theme-toggle";
import { UsernameForm, type UsernameFormValues } from "@/components/username-form";

type ExportState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; username: string; provider: Provider; repositories: Repository[]; isComparison?: boolean };

interface ApiErrorBody {
  readonly error: { readonly code: string; readonly message: string };
}

const STORAGE_KEY = "starfolio_cached_session_v3";
const DEFAULT_USER = "MiguelVivar";

export default function HomePage() {
  const [state, setState] = useState<ExportState>({ status: "idle" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached && cached.username && Array.isArray(cached.repositories) && cached.repositories.length > 0) {
          setState({
            status: "success",
            username: cached.username,
            provider: cached.provider || "github",
            repositories: cached.repositories,
            isComparison: Boolean(cached.isComparison),
          });
          return;
        }
      }
    } catch {
      // Ignore storage read errors
    }

    handleSubmit({ username: DEFAULT_USER, provider: "github" });
  }, []);

  async function fetchUserStars(username: string, provider: Provider = "github", customToken?: string): Promise<Repository[]> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (customToken) {
      headers["x-github-token"] = customToken;
    }

    const response = await fetch("/api/export-repositories", {
      method: "POST",
      headers,
      body: JSON.stringify({
        username,
        provider,
        ...(customToken ? { customToken } : {}),
      }),
    });

    const body = (await response.json()) as { repositories?: Repository[] } & Partial<ApiErrorBody>;
    if (!response.ok || !body.repositories) {
      throw new Error(body.error?.message ?? `Failed to fetch stars for "${username}".`);
    }
    return body.repositories;
  }

  async function handleSubmit({ username, provider = "github", secondaryUsername, customToken }: UsernameFormValues) {
    const targetUser = username.trim() || DEFAULT_USER;
    setState({ status: "loading" });
    setSelectedIds(new Set());

    try {
      if (secondaryUsername && secondaryUsername.trim().length > 0) {
        const secondary = secondaryUsername.trim();
        const [repos1, repos2] = await Promise.all([
          fetchUserStars(targetUser, provider, customToken),
          fetchUserStars(secondary, provider, customToken),
        ]);

        saveRecentSearch(targetUser);
        saveRecentSearch(secondary);

        const set2 = new Set(repos2.map((r) => r.fullName));
        const sharedRepos = repos1.filter((r) => set2.has(r.fullName));

        const comparisonName = `${targetUser} & ${secondary}`;
        const newState: ExportState = {
          status: "success",
          username: comparisonName,
          provider,
          repositories: sharedRepos,
          isComparison: true,
        };

        setState(newState);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        } catch {
          // Ignore storage write errors
        }
      } else {
        const repositories = await fetchUserStars(targetUser, provider, customToken);
        saveRecentSearch(targetUser);

        const newState: ExportState = { status: "success", username: targetUser, provider, repositories };
        setState(newState);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        } catch {
          // Ignore storage write errors
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not reach the server. Check your connection and try again.";
      setState({ status: "error", message: msg });
    }
  }

  function handleClearCache() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setState({ status: "idle" });
    setSelectedIds(new Set());
  }

  const currentUsername = state.status === "success" ? state.username : DEFAULT_USER;
  const currentProvider = state.status === "success" ? state.provider : "github";

  const exportRepos =
    state.status === "success"
      ? selectedIds.size > 0
        ? state.repositories.filter((r) => selectedIds.has(r.id))
        : state.repositories
      : [];

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8 shrink-0 rounded-lg shadow-sm transition-transform hover:scale-105" />
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
            Starfolio
          </h1>
        </div>
        <ThemeToggle />
      </header>

      <p className="max-w-2xl text-sm text-muted-foreground">
        Select your source control provider (GitHub, GitLab, or Bitbucket) and enter any username to fetch starred repositories, analyze portfolio insights, and export to Excel, CSV, JSON, or Markdown.
      </p>

      <div className="flex flex-col gap-4">
        <UsernameForm
          isLoading={state.status === "loading"}
          initialUsername={currentUsername}
          initialProvider={currentProvider}
          onSubmit={handleSubmit}
        />
        <RecentSearches
          onSelectSearch={(username) => handleSubmit({ username, provider: currentProvider })}
          currentUsername={currentUsername}
        />
      </div>

      {state.status === "error" ? (
        <div className="flex items-start gap-2 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger animate-in fade-in">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{state.message}</p>
        </div>
      ) : null}

      {state.status === "loading" ? (
        <div className="flex flex-col gap-3">
          <div className="h-32 animate-pulse rounded-xl bg-surface" />
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-md bg-surface" />
          ))}
        </div>
      ) : null}

      {state.status === "success" ? (
        state.repositories.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-12 text-center text-sm text-muted-foreground">
            <Sparkles className="h-8 w-8 text-accent/60" />
            <p>
              {state.isComparison
                ? `No shared starred repositories were found between ${state.username}.`
                : `${state.username} hasn't starred any public repositories on ${state.provider} yet.`}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <AnalyticsDashboard repositories={state.repositories} />

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-mono text-foreground font-semibold">{state.repositories.length}</span>{" "}
                  {state.isComparison ? "shared starred repositories" : "starred repositories"} for{" "}
                  <span className="font-mono text-foreground font-semibold">{state.username}</span> ({state.provider})
                </p>

                <button
                  type="button"
                  onClick={() => handleSubmit({ username: state.username, provider: state.provider })}
                  className="text-xs text-muted-foreground hover:text-accent p-1 transition-colors"
                  title="Refresh from provider"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleClearCache}
                  className="text-xs text-muted-foreground hover:text-danger p-1 transition-colors"
                  title="Clear saved cache"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <ExportMenu
                repositories={exportRepos}
                username={state.username}
                selectedCount={selectedIds.size}
              />
            </div>

            <RepositoryTable
              repositories={state.repositories}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          </div>
        )
      ) : null}
    </main>
  );
}
