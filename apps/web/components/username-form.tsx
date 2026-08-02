"use client";

import { Check, Key, Loader2, Search, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export interface UsernameFormValues {
  readonly username: string;
  readonly secondaryUsername?: string | undefined;
  readonly customToken?: string | undefined;
}

export interface UsernameFormProps {
  readonly isLoading: boolean;
  readonly initialUsername?: string | undefined;
  readonly onSubmit: (values: UsernameFormValues) => void;
}

const PAT_STORAGE_KEY = "starfolio_github_pat";

export function UsernameForm({ isLoading, initialUsername, onSubmit }: UsernameFormProps) {
  const [username, setUsername] = useState(initialUsername || "");
  const [secondaryUsername, setSecondaryUsername] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [patToken, setPatToken] = useState("");
  const [showPatInput, setShowPatInput] = useState(false);

  useEffect(() => {
    if (initialUsername) {
      setUsername(initialUsername);
    }
  }, [initialUsername]);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(PAT_STORAGE_KEY) || sessionStorage.getItem(PAT_STORAGE_KEY);
      if (storedToken) {
        setPatToken(storedToken);
      }
    } catch {
      // Ignore storage read errors
    }
  }, []);

  function handleSavePat(token: string) {
    const trimmed = token.trim();
    setPatToken(trimmed);
    try {
      if (trimmed) {
        localStorage.setItem(PAT_STORAGE_KEY, trimmed);
      } else {
        localStorage.removeItem(PAT_STORAGE_KEY);
        sessionStorage.removeItem(PAT_STORAGE_KEY);
      }
    } catch {
      // Ignore storage write errors
    }
  }

  function handleClearPat() {
    setPatToken("");
    try {
      localStorage.removeItem(PAT_STORAGE_KEY);
      sessionStorage.removeItem(PAT_STORAGE_KEY);
    } catch {
      // Ignore storage remove errors
    }
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          username,
          secondaryUsername: compareMode ? secondaryUsername : undefined,
          customToken: patToken.trim() || undefined,
        });
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1 text-sm sm:max-w-xs">
          <span className="mb-1 block text-muted-foreground font-medium">GitHub Username</span>
          <Input
            className="font-mono text-sm"
            placeholder="e.g. MiguelVivar"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            required
          />
        </label>

        {compareMode ? (
          <label className="flex-1 text-sm sm:max-w-xs animate-in fade-in duration-200">
            <span className="mb-1 block text-muted-foreground font-medium">Compare with User</span>
            <Input
              className="font-mono text-sm"
              placeholder="e.g. torvalds"
              value={secondaryUsername}
              onChange={(event) => setSecondaryUsername(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              required={compareMode}
            />
          </label>
        ) : null}

        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {isLoading ? "Fetching…" : compareMode ? "Compare Shared Stars" : "Export Stars"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setCompareMode(!compareMode)}
            className={compareMode ? "border-accent text-accent bg-accent/5" : ""}
            title="Toggle user comparison mode"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">{compareMode ? "Single User" : "Compare"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPatInput(!showPatInput)}
            className={patToken ? "border-emerald-500/50 text-emerald-500 bg-emerald-500/10" : showPatInput ? "border-accent text-accent" : ""}
            title="Configure GitHub Personal Access Token"
          >
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">{patToken ? "PAT Set" : "PAT Token"}</span>
          </Button>
        </div>
      </div>

      {showPatInput || patToken ? (
        <div className="flex flex-col gap-1.5 rounded-lg border border-border/80 bg-surface/60 p-3 text-xs animate-in fade-in duration-200 sm:max-w-md">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-accent" />
              Custom GitHub PAT (Optional)
            </span>
            {patToken ? (
              <button
                type="button"
                onClick={handleClearPat}
                className="text-muted-foreground hover:text-danger flex items-center gap-1 text-[11px] transition-colors"
                title="Remove PAT token"
              >
                <X className="h-3 w-3" />
                Clear PAT
              </button>
            ) : null}
          </div>
          <p className="text-muted-foreground text-[11px]">
            Higher rate limits (5,000 req/hr). Token stored locally in your browser.
          </p>
          <div className="flex gap-2">
            <Input
              type="password"
              className="font-mono text-xs h-8"
              placeholder="ghp_... or github_pat_..."
              value={patToken}
              onChange={(event) => handleSavePat(event.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          {patToken ? (
            <div className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium pt-0.5">
              <Check className="h-3 w-3" />
              Token active & saved in local storage
            </div>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
