"use client";

import type { Repository } from "@starfolio/types";
import { formatCount } from "@starfolio/utils";
import { Archive, Code, GitFork, Star } from "lucide-react";

interface AnalyticsDashboardProps {
  readonly repositories: Repository[];
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#DEA584",
  Java: "#B07219",
  "C++": "#F34B7D",
  C: "#555555",
  HTML: "#E34C26",
  CSS: "#563D7C",
  Vue: "#41B883",
  React: "#61DAFB",
  Shell: "#89E051",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
};

export function AnalyticsDashboard({ repositories }: AnalyticsDashboardProps) {
  const totalRepos = repositories.length;
  const totalStars = repositories.reduce((acc, r) => acc + r.stars, 0);
  const totalForks = repositories.reduce((acc, r) => acc + r.forks, 0);
  const archivedCount = repositories.filter((r) => r.archived).length;

  // Language aggregation
  const langCounts: Record<string, number> = {};
  for (const repo of repositories) {
    const lang = repo.primaryLanguage?.name || "Unknown";
    langCounts[lang] = (langCounts[lang] || 0) + 1;
  }

  const sortedLanguages = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / totalRepos) * 100),
      color: LANGUAGE_COLORS[name] || "#94A3B8",
    }));

  const topLanguages = sortedLanguages.slice(0, 5);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface/50 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
          <Code className="h-4 w-4 text-accent" /> Portfolio Insights & Analytics
        </h2>
        <span className="text-xs text-muted-foreground">{totalRepos} Repositories Analyzed</span>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex flex-col gap-1 rounded-lg border border-border/60 bg-background/60 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            Total Stars
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">{formatCount(totalStars)}</span>
        </div>

        <div className="flex flex-col gap-1 rounded-lg border border-border/60 bg-background/60 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <GitFork className="h-3.5 w-3.5 text-blue-500" />
            Total Forks
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">{formatCount(totalForks)}</span>
        </div>

        <div className="flex flex-col gap-1 rounded-lg border border-border/60 bg-background/60 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Code className="h-3.5 w-3.5 text-emerald-500" />
            Top Language
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground truncate">
            {topLanguages[0]?.name || "N/A"}
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-lg border border-border/60 bg-background/60 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Archive className="h-3.5 w-3.5 text-rose-500" />
            Archived Repos
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">{archivedCount}</span>
        </div>
      </div>

      {/* Language Bar & Breakdown */}
      {sortedLanguages.length > 0 ? (
        <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
          <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
            <span>Primary Languages</span>
            <span>{topLanguages.map((l) => `${l.name} (${l.percent}%)`).join(" • ")}</span>
          </div>

          {/* Multi-color Bar */}
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-border/40">
            {topLanguages.map((lang) => (
              <div
                key={lang.name}
                style={{ width: `${lang.percent}%`, backgroundColor: lang.color }}
                title={`${lang.name}: ${lang.count} (${lang.percent}%)`}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            {topLanguages.map((lang) => (
              <div key={lang.name} className="flex items-center gap-1.5 text-xs text-foreground">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: lang.color }} />
                <span className="font-medium">{lang.name}</span>
                <span className="text-muted-foreground font-mono text-[11px]">{lang.count}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
