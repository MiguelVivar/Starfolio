"use client";

import type { Repository } from "@starfolio/types";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Logo } from "@/components/logo";
import { ExportMenu } from "@/components/export-menu";
import { RepositoryTable } from "@/components/repository-table";
import { ThemeToggle } from "@/components/theme-toggle";
import { UsernameForm, type UsernameFormValues } from "@/components/username-form";

type ExportState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; username: string; repositories: Repository[] };

interface ApiErrorBody {
  readonly error: { readonly code: string; readonly message: string };
}

export default function HomePage() {
  const [state, setState] = useState<ExportState>({ status: "idle" });

  async function handleSubmit({ username }: UsernameFormValues) {
    setState({ status: "loading" });

    try {
      const response = await fetch("/api/export-repositories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const body = (await response.json()) as { repositories?: Repository[] } & Partial<ApiErrorBody>;

      if (!response.ok || !body.repositories) {
        setState({
          status: "error",
          message: body.error?.message ?? "Something went wrong fetching starred repositories.",
        });
        return;
      }

      setState({ status: "success", username, repositories: body.repositories });
    } catch {
      setState({ status: "error", message: "Could not reach the server. Check your connection and try again." });
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8 shrink-0 rounded-lg shadow-sm transition-transform hover:scale-105" />
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">Starfolio</h1>
        </div>
        <ThemeToggle />
      </header>

      <p className="max-w-2xl text-sm text-muted-foreground">
        Enter any public GitHub username to fetch every repository they&apos;ve starred, then export the
        list to Excel, CSV, JSON, or Markdown.
      </p>

      <UsernameForm isLoading={state.status === "loading"} onSubmit={handleSubmit} />

      {state.status === "error" ? (
        <div className="flex items-start gap-2 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{state.message}</p>
        </div>
      ) : null}

      {state.status === "loading" ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-md bg-surface" />
          ))}
        </div>
      ) : null}

      {state.status === "success" ? (
        state.repositories.length === 0 ? (
          <p className="rounded-md border border-border bg-surface px-4 py-8 text-center text-sm text-muted-foreground">
            {state.username} hasn&apos;t starred any public repositories yet.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-mono text-foreground">{state.repositories.length}</span> starred
                repositories for <span className="font-mono text-foreground">{state.username}</span>
              </p>
              <ExportMenu repositories={state.repositories} username={state.username} />
            </div>
            <RepositoryTable repositories={state.repositories} />
          </div>
        )
      ) : null}
    </main>
  );
}
