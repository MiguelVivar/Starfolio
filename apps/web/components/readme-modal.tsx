"use client";

import type { Repository } from "@starfolio/types";
import { BookOpen, ExternalLink, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ReadmeModalProps {
  readonly repo: Repository | null;
  readonly onClose: () => void;
}

export function ReadmeModal({ repo, onClose }: ReadmeModalProps) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!repo) {
      setContent(null);
      setError(null);
      return;
    }

    setLoading(true);
    setContent(null);
    setError(null);

    const branch = repo.defaultBranch || "main";
    const url = `/api/readme?owner=${encodeURIComponent(repo.owner)}&name=${encodeURIComponent(repo.name)}&branch=${encodeURIComponent(branch)}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("No README found for this repository.");
        return res.json();
      })
      .then((data) => {
        setContent(data.readme || "README is empty.");
      })
      .catch((err) => {
        setError(err.message || "Failed to load README.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [repo]);

  if (!repo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl border border-border bg-background shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface/50">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold tracking-tight text-foreground truncate max-w-lg">
              {repo.fullName} — README
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded bg-surface border border-border"
            >
              GitHub <ExternalLink className="h-3 w-3" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-sm leading-relaxed text-foreground">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p>Fetching README content...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-danger font-medium">{error}</p>
              <a
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-accent hover:underline text-xs"
              >
                View directly on GitHub <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : (
            <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap font-mono text-xs bg-surface/40 p-4 rounded-lg border border-border/50">
              {content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
