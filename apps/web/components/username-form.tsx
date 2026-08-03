"use client";

import type { Provider } from "@starfolio/types";
import { Check, Github, Key, Loader2, LogOut, Search, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export interface OAuthUser {
  readonly username: string;
  readonly provider: Provider;
  readonly avatarUrl?: string;
}

export interface UsernameFormValues {
  readonly username: string;
  readonly provider: Provider;
  readonly secondaryUsername?: string | undefined;
  readonly customToken?: string | undefined;
}

export interface UsernameFormProps {
  readonly isLoading: boolean;
  readonly initialUsername?: string | undefined;
  readonly initialProvider?: Provider;
  readonly onSubmit: (values: UsernameFormValues) => void | Promise<void>;
}

const PAT_STORAGE_KEY = "starfolio_pat_token";

export function UsernameForm({
  isLoading,
  initialUsername,
  initialProvider = "github",
  onSubmit,
}: UsernameFormProps) {
  const [provider, setProvider] = useState<Provider>(initialProvider);
  const [username, setUsername] = useState(initialUsername || "");
  const [secondaryUsername, setSecondaryUsername] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [patToken, setPatToken] = useState("");
  const [showPatInput, setShowPatInput] = useState(false);
  const [oauthUser, setOauthUser] = useState<OAuthUser | null>(null);
  const submitLockRef = useRef(false);

  useEffect(() => {
    if (initialUsername) {
      setUsername(initialUsername);
    }
  }, [initialUsername]);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(PAT_STORAGE_KEY) || sessionStorage.getItem(PAT_STORAGE_KEY);
      if (storedToken) setPatToken(storedToken);

    } catch {
      // Ignore storage read errors
    }

    void fetch("/api/auth/me")
      .then((response) => response.json())
      .then((session: { authenticated?: boolean; provider?: Provider; user?: string }) => {
        if (session.authenticated && session.provider && session.user) {
          const authenticatedUser = { username: session.user, provider: session.provider };
          setOauthUser(authenticatedUser);
          setProvider(session.provider);
          setUsername(session.user);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!isLoading) submitLockRef.current = false;
  }, [isLoading]);

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
      // Ignore
    }
  }

  function handleOAuthLogin(targetProvider: "github" | "gitlab") {
    window.location.assign(`/api/auth/${targetProvider}`);
  }

  async function handleOAuthLogout() {
    await fetch("/api/auth/me", { method: "DELETE" }).catch(() => undefined);
    setOauthUser(null);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Provider selection tabs & OAuth login header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-1.5 bg-surface/80 p-1 rounded-lg border border-border/80">
          <button
            type="button"
            onClick={() => setProvider("github")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              provider === "github"
                ? "bg-accent text-accent-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
            }`}
          >
            <Github className="h-3.5 w-3.5" />
            GitHub
          </button>
          <button
            type="button"
            onClick={() => setProvider("gitlab")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              provider === "gitlab"
                ? "bg-amber-500 text-white shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
            }`}
          >
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 5.5 2a.43.43 0 0 1 .4.28l2.25 6.94h7.7l2.25-6.94a.43.43 0 0 1 .4-.28.42.42 0 0 1 .79.16l2.44 7.51 1.22 3.78a.84.84 0 0 1-.3.94z" />
            </svg>
            GitLab
          </button>
          <button
            type="button"
            onClick={() => setProvider("bitbucket")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              provider === "bitbucket"
                ? "bg-blue-600 text-white shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
            }`}
          >
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M.778 1.213a.768.768 0 0 0-.768.892l3.263 19.81c.084.5.515.868 1.022.873h15.412a.77.77 0 0 0 .764-.646l3.32-19.16a.768.768 0 0 0-.763-.896H.778zm14.1 13.567H9.103L7.79 8.27h8.43l-1.342 6.51z" />
            </svg>
            Bitbucket
          </button>
        </div>

        {/* OAuth Badge or Login Buttons */}
        {oauthUser ? (
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-500 animate-in fade-in">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">
              Logged in as <span className="font-semibold">@{oauthUser.username}</span> ({oauthUser.provider})
            </span>
            <button
              type="button"
              onClick={handleOAuthLogout}
              className="ml-1 hover:text-rose-400 text-muted-foreground transition-colors"
              title="Sign out of OAuth"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleOAuthLogin("github")}
              className="gap-1.5 text-xs hover:border-accent hover:text-accent"
            >
              <Github className="h-3.5 w-3.5" />
              Sign in with GitHub
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleOAuthLogin("gitlab")}
              className="gap-1.5 text-xs hover:border-amber-500 hover:text-amber-500"
            >
              <svg className="h-3.5 w-3.5 fill-amber-500" viewBox="0 0 24 24">
                <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 5.5 2a.43.43 0 0 1 .4.28l2.25 6.94h7.7l2.25-6.94a.43.43 0 0 1 .4-.28.42.42 0 0 1 .79.16l2.44 7.51 1.22 3.78a.84.84 0 0 1-.3.94z" />
              </svg>
              Sign in with GitLab
            </Button>
          </div>
        )}
      </div>

      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (isLoading || submitLockRef.current) return;

          submitLockRef.current = true;
          void onSubmit({
            username,
            provider,
            secondaryUsername: compareMode ? secondaryUsername : undefined,
            customToken: patToken.trim() || undefined,
          });
        }}
        aria-busy={isLoading}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 text-sm sm:max-w-xs">
            <span className="mb-1 block text-muted-foreground font-medium capitalize">
              {provider} Username
            </span>
            <Input
              className="font-mono text-sm"
              placeholder={`e.g. ${provider === "gitlab" ? "miguel_vivar" : provider === "bitbucket" ? "atlassian" : "MiguelVivar"}`}
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
              title="Configure Personal Access Token"
            >
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">{patToken ? "Token Set" : "API Token"}</span>
            </Button>
          </div>
        </div>

        {showPatInput || patToken ? (
          <div className="flex flex-col gap-1.5 rounded-lg border border-border/80 bg-surface/60 p-3 text-xs animate-in fade-in duration-200 sm:max-w-md">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground flex items-center gap-1.5 capitalize">
                <Key className="h-3.5 w-3.5 text-accent" />
                Custom {provider} Access Token (Optional)
              </span>
              {patToken ? (
                <button
                  type="button"
                  onClick={handleClearPat}
                  className="text-muted-foreground hover:text-danger flex items-center gap-1 text-[11px] transition-colors"
                  title="Remove token"
                >
                  <X className="h-3 w-3" />
                  Clear Token
                </button>
              ) : null}
            </div>
            <p className="text-muted-foreground text-[11px]">
              Bypass rate limits. Token stored locally in your browser session.
            </p>
            <div className="flex gap-2">
              <Input
                type="password"
                className="font-mono text-xs h-8"
                placeholder="Personal access token..."
                value={patToken}
                onChange={(event) => handleSavePat(event.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            {patToken ? (
              <div className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium pt-0.5">
                <Check className="h-3 w-3" />
                Token active & saved locally
              </div>
            ) : null}
          </div>
        ) : null}
      </form>
    </div>
  );
}
