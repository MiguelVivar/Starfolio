"use client";

import { Clock, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";

const RECENT_SEARCHES_KEY = "starfolio_recent_searches_v1";
const MAX_RECENT = 8;

export interface RecentSearchesProps {
  readonly onSelectSearch: (username: string) => void;
  readonly currentUsername?: string | undefined;
}

export function saveRecentSearch(username: string): void {
  if (typeof window === "undefined" || !username.trim()) return;
  const clean = username.trim();
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    let list: string[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) list = [];

    list = [clean, ...list.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage errors
  }
}

export function RecentSearches({ onSelectSearch, currentUsername }: RecentSearchesProps) {
  const [searches, setSearches] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSearches(parsed.filter((item): item is string => typeof item === "string"));
        }
      }
    } catch {
      // Ignore
    }
  }, [currentUsername]);

  function handleClear() {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore
    }
    setSearches([]);
  }

  if (!mounted || searches.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-surface/40 p-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Recent Searches</span>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-muted-foreground hover:text-danger flex items-center gap-1 text-[11px] transition-colors"
          title="Clear recent searches"
        >
          <Trash2 className="h-3 w-3" />
          <span>Clear history</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {searches.map((item) => {
          const isActive = currentUsername?.toLowerCase() === item.toLowerCase();
          return (
            <button
              key={item}
              type="button"
              onClick={() => onSelectSearch(item)}
              className="group inline-flex items-center gap-1 text-xs"
            >
              <Badge
                className={`flex items-center gap-1.5 cursor-pointer py-1 px-2.5 transition-all ${
                  isActive
                    ? "border-accent bg-accent/15 text-accent font-semibold shadow-sm"
                    : "bg-surface hover:border-accent/50 hover:bg-surface-hover"
                }`}
              >
                <User className="h-3 w-3 opacity-70" />
                <span className="font-mono">{item}</span>
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}
