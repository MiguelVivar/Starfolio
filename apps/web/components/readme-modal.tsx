"use client";

import type { Repository } from "@starfolio/types";
import { BookOpen, ExternalLink, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
      <div className="relative flex max-h-[85vh] w-full max-w-4xl flex-col rounded-xl border border-border bg-background shadow-2xl overflow-hidden">
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
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1 rounded bg-surface border border-border"
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
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p>Fetching and rendering README...</p>
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
            <div className="markdown-body text-sm space-y-4">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold border-b border-border/60 pb-2 mt-4 mb-3 text-foreground">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold border-b border-border/40 pb-1 mt-6 mb-2 text-foreground">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground">{children}</h3>
                  ),
                  p: ({ children }) => <p className="mb-3 leading-relaxed text-foreground/90">{children}</p>,
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:underline font-medium"
                    >
                      {children}
                    </a>
                  ),
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-4 pl-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-4 pl-2">{children}</ol>,
                  li: ({ children }) => <li className="text-foreground/90">{children}</li>,
                  code: ({ className, children, ...props }) => {
                    const isBlock = Boolean(className);
                    return isBlock ? (
                      <code
                        className="block bg-surface border border-border/80 p-3 rounded-lg font-mono text-xs overflow-x-auto my-3 text-foreground"
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <code
                        className="bg-surface border border-border/60 px-1.5 py-0.5 rounded font-mono text-xs text-accent"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-accent/60 pl-4 py-1 italic bg-surface/30 my-3 rounded-r text-muted-foreground">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4 rounded-lg border border-border">
                      <table className="w-full text-left text-xs border-collapse">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="bg-surface px-3 py-2 font-semibold border-b border-border text-foreground">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-3 py-2 border-b border-border/50 text-foreground/90">{children}</td>
                  ),
                  img: ({ src, alt }) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={alt || "README image"} className="max-w-full rounded-lg my-3 inline-block" />
                  ),
                }}
              >
                {content || ""}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
