"use client";

import { Loader2, Search, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export interface UsernameFormValues {
  readonly username: string;
  readonly secondaryUsername?: string | undefined;
}

export interface UsernameFormProps {
  readonly isLoading: boolean;
  readonly onSubmit: (values: UsernameFormValues) => void;
}

export function UsernameForm({ isLoading, onSubmit }: UsernameFormProps) {
  const [username, setUsername] = useState("");
  const [secondaryUsername, setSecondaryUsername] = useState("");
  const [compareMode, setCompareMode] = useState(false);

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ username, secondaryUsername: compareMode ? secondaryUsername : undefined });
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
        </div>
      </div>
    </form>
  );
}
