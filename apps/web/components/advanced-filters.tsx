"use client";

import type { Repository } from "@starfolio/types";
import {
  Archive,
  Check,
  ChevronDown,
  ChevronUp,
  Filter,
  GitFork,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Tag,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export type ArchivedFilterStatus = "all" | "active" | "archived";
export type ForkFilterStatus = "all" | "sources" | "forks";

export interface FilterState {
  readonly searchQuery: string;
  readonly minStars: number | null;
  readonly maxStars: number | null;
  readonly languages: string[];
  readonly topicQuery: string;
  readonly archivedStatus: ArchivedFilterStatus;
  readonly forkStatus: ForkFilterStatus;
}

export const DEFAULT_FILTERS: FilterState = {
  searchQuery: "",
  minStars: null,
  maxStars: null,
  languages: [],
  topicQuery: "",
  archivedStatus: "all",
  forkStatus: "all",
};

export function getActiveFilterCount(filters: FilterState): number {
  let count = 0;
  if (filters.searchQuery.trim().length > 0) count++;
  if (filters.minStars !== null && filters.minStars > 0) count++;
  if (filters.maxStars !== null && filters.maxStars > 0) count++;
  if (filters.languages.length > 0) count += filters.languages.length;
  if (filters.topicQuery.trim().length > 0) count++;
  if (filters.archivedStatus !== "all") count++;
  if (filters.forkStatus !== "all") count++;
  return count;
}

export function filterRepositories(repositories: readonly Repository[], filters: FilterState): Repository[] {
  return repositories.filter((repo) => {
    // 1. Search Query (matches name, owner, description, topics)
    if (filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.toLowerCase().trim();
      const haystack = `${repo.fullName} ${repo.description ?? ""} ${repo.topics.join(" ")}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    // 2. Min / Max Stars Filter
    if (filters.minStars !== null && repo.stars < filters.minStars) return false;
    if (filters.maxStars !== null && repo.stars > filters.maxStars) return false;

    // 3. Primary Language Multi-Select Filter
    if (filters.languages.length > 0) {
      const repoLang = repo.primaryLanguage?.name;
      if (!repoLang || !filters.languages.includes(repoLang)) return false;
    }

    // 4. Topics / Keywords Search
    if (filters.topicQuery.trim().length > 0) {
      const topicQ = filters.topicQuery.toLowerCase().trim();
      const matchesTopic = repo.topics.some((t) => t.toLowerCase().includes(topicQ));
      if (!matchesTopic) return false;
    }

    // 5. Archived Status Filter
    if (filters.archivedStatus === "active" && repo.archived) return false;
    if (filters.archivedStatus === "archived" && !repo.archived) return false;

    // 6. Fork Status Filter
    if (filters.forkStatus === "sources" && repo.fork) return false;
    if (filters.forkStatus === "forks" && !repo.fork) return false;

    return true;
  });
}

export interface AdvancedFiltersProps {
  readonly filters: FilterState;
  readonly onFilterChange: (filters: FilterState) => void;
  readonly availableLanguages: readonly string[];
  readonly totalCount: number;
  readonly filteredCount: number;
}

export function AdvancedFilters({
  filters,
  onFilterChange,
  availableLanguages,
  totalCount,
  filteredCount,
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [languageSearch, setLanguageSearch] = useState<string>("");

  const activeCount = useMemo(() => getActiveFilterCount(filters), [filters]);

  const filteredLanguageList = useMemo(() => {
    if (!languageSearch.trim()) return availableLanguages;
    const q = languageSearch.toLowerCase().trim();
    return availableLanguages.filter((lang) => lang.toLowerCase().includes(q));
  }, [availableLanguages, languageSearch]);

  function handleReset() {
    onFilterChange(DEFAULT_FILTERS);
    setLanguageSearch("");
  }

  function toggleLanguage(lang: string) {
    const isSelected = filters.languages.includes(lang);
    const nextLanguages = isSelected
      ? filters.languages.filter((l) => l !== lang)
      : [...filters.languages, lang];
    onFilterChange({ ...filters, languages: nextLanguages });
  }

  function handleMinStarsChange(val: string) {
    const parsed = val.trim() === "" ? null : Number.parseInt(val, 10);
    onFilterChange({ ...filters, minStars: Number.isNaN(parsed) ? null : parsed });
  }

  function handleMaxStarsChange(val: string) {
    const parsed = val.trim() === "" ? null : Number.parseInt(val, 10);
    onFilterChange({ ...filters, maxStars: Number.isNaN(parsed) ? null : parsed });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-surface/40 p-4 transition-all">
      {/* Top Search & Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Main Search Input */}
        <div className="relative flex-1 min-w-[18rem]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9 pr-8 text-xs h-9 bg-background focus-visible:ring-accent"
            placeholder="Search by repo name, description, owner..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
          />
          {filters.searchQuery ? (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, searchQuery: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        {/* Quick Filter Controls & Toggle Drawer */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-9 gap-2 text-xs border-border bg-background hover:bg-surface"
          >
            <Filter className="h-3.5 w-3.5 text-accent" />
            <span>Advanced Filters</span>
            {activeCount > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 font-mono text-[10px] font-bold text-accent-foreground">
                {activeCount}
              </span>
            ) : null}
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>

          {activeCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-danger hover:bg-danger/10"
              title="Reset all filters"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Quick Presets Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Presets:</span>
        <button
          type="button"
          onClick={() => onFilterChange({ ...filters, minStars: 1000 })}
          className={`px-2 py-0.5 rounded-full border text-[11px] font-mono transition-colors ${
            filters.minStars === 1000
              ? "border-accent bg-accent/15 text-accent font-semibold"
              : "border-border/60 bg-background/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          ⭐ 1k+ Stars
        </button>
        <button
          type="button"
          onClick={() => onFilterChange({ ...filters, minStars: 5000 })}
          className={`px-2 py-0.5 rounded-full border text-[11px] font-mono transition-colors ${
            filters.minStars === 5000
              ? "border-accent bg-accent/15 text-accent font-semibold"
              : "border-border/60 bg-background/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          ⭐ 5k+ Stars
        </button>
        <button
          type="button"
          onClick={() =>
            onFilterChange({
              ...filters,
              archivedStatus: filters.archivedStatus === "active" ? "all" : "active",
            })
          }
          className={`px-2 py-0.5 rounded-full border text-[11px] transition-colors ${
            filters.archivedStatus === "active"
              ? "border-accent bg-accent/15 text-accent font-semibold"
              : "border-border/60 bg-background/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          ⚡ Active Only
        </button>
        <button
          type="button"
          onClick={() =>
            onFilterChange({
              ...filters,
              forkStatus: filters.forkStatus === "sources" ? "all" : "sources",
            })
          }
          className={`px-2 py-0.5 rounded-full border text-[11px] transition-colors ${
            filters.forkStatus === "sources"
              ? "border-accent bg-accent/15 text-accent font-semibold"
              : "border-border/60 bg-background/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          📦 Sources Only
        </button>
        <button
          type="button"
          onClick={() =>
            onFilterChange({
              ...filters,
              forkStatus: filters.forkStatus === "forks" ? "all" : "forks",
            })
          }
          className={`px-2 py-0.5 rounded-full border text-[11px] transition-colors ${
            filters.forkStatus === "forks"
              ? "border-accent bg-accent/15 text-accent font-semibold"
              : "border-border/60 bg-background/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          🔱 Forks Only
        </button>
      </div>

      {/* Expanded Filter Panel */}
      {isExpanded ? (
        <div className="mt-2 flex flex-col gap-4 border-t border-border/60 pt-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Star Count Range */}
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Star className="h-3.5 w-3.5 text-accent fill-current" />
                <span>Star Count Range</span>
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  placeholder="Min stars"
                  className="h-8 text-xs font-mono bg-background"
                  value={filters.minStars === null ? "" : filters.minStars}
                  onChange={(e) => handleMinStarsChange(e.target.value)}
                />
                <span className="text-muted-foreground text-xs">–</span>
                <Input
                  type="number"
                  min={0}
                  placeholder="Max stars"
                  className="h-8 text-xs font-mono bg-background"
                  value={filters.maxStars === null ? "" : filters.maxStars}
                  onChange={(e) => handleMaxStarsChange(e.target.value)}
                />
              </div>
            </div>

            {/* 2. Topics / Keywords Search */}
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Tag className="h-3.5 w-3.5 text-accent" />
                <span>Topic / Tag Search</span>
              </label>
              <Input
                placeholder="Filter by topic (e.g. react, cli)..."
                className="h-8 text-xs bg-background"
                value={filters.topicQuery}
                onChange={(e) => onFilterChange({ ...filters, topicQuery: e.target.value })}
              />
            </div>

            {/* 3. Archived Status Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Archive className="h-3.5 w-3.5 text-accent" />
                <span>Archived Status</span>
              </label>
              <div className="grid grid-cols-3 gap-1 rounded-md border border-border bg-background p-0.5">
                {(["all", "active", "archived"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onFilterChange({ ...filters, archivedStatus: status })}
                    className={`h-7 rounded text-[11px] font-medium capitalize transition-colors ${
                      filters.archivedStatus === status
                        ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Fork Status Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <GitFork className="h-3.5 w-3.5 text-accent" />
                <span>Fork Type</span>
              </label>
              <div className="grid grid-cols-3 gap-1 rounded-md border border-border bg-background p-0.5">
                {(["all", "sources", "forks"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onFilterChange({ ...filters, forkStatus: status })}
                    className={`h-7 rounded text-[11px] font-medium capitalize transition-colors ${
                      filters.forkStatus === status
                        ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Primary Language Multi-Select */}
          <div className="flex flex-col gap-2 border-t border-border/40 pt-3">
            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span>Languages Multi-Select ({availableLanguages.length} available)</span>
                {filters.languages.length > 0 ? (
                  <Badge className="bg-accent/20 text-accent font-bold">
                    {filters.languages.length} selected
                  </Badge>
                ) : null}
              </label>

              {filters.languages.length > 0 ? (
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filters, languages: [] })}
                  className="text-[11px] text-muted-foreground hover:text-danger underline"
                >
                  Deselect all languages
                </button>
              ) : null}
            </div>

            {availableLanguages.length > 6 ? (
              <Input
                placeholder="Search languages..."
                className="h-7 text-xs max-w-xs bg-background mb-1"
                value={languageSearch}
                onChange={(e) => setLanguageSearch(e.target.value)}
              />
            ) : null}

            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 rounded-lg border border-border/50 bg-background/50">
              {filteredLanguageList.map((lang) => {
                const isSelected = filters.languages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono transition-all ${
                      isSelected
                        ? "bg-accent text-accent-foreground font-medium shadow-xs"
                        : "bg-surface hover:bg-surface-hover text-muted-foreground border border-border/60"
                    }`}
                  >
                    {isSelected ? <Check className="h-3 w-3" /> : null}
                    <span>{lang}</span>
                  </button>
                );
              })}

              {filteredLanguageList.length === 0 ? (
                <span className="text-xs text-muted-foreground p-2">No matching languages found.</span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* Active Filter Chips Summary */}
      {activeCount > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/40 text-xs">
          <span className="text-muted-foreground text-[11px] font-mono">Active:</span>

          {filters.minStars !== null ? (
            <Badge className="bg-accent/10 border-accent/30 text-foreground gap-1">
              ⭐ &gt;= {filters.minStars}
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, minStars: null })}
                className="hover:text-danger"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null}

          {filters.maxStars !== null ? (
            <Badge className="bg-accent/10 border-accent/30 text-foreground gap-1">
              ⭐ &lt;= {filters.maxStars}
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, maxStars: null })}
                className="hover:text-danger"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null}

          {filters.archivedStatus !== "all" ? (
            <Badge className="bg-accent/10 border-accent/30 text-foreground gap-1 capitalize">
              Archived: {filters.archivedStatus}
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, archivedStatus: "all" })}
                className="hover:text-danger"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null}

          {filters.forkStatus !== "all" ? (
            <Badge className="bg-accent/10 border-accent/30 text-foreground gap-1 capitalize">
              Fork: {filters.forkStatus}
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, forkStatus: "all" })}
                className="hover:text-danger"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null}

          {filters.topicQuery ? (
            <Badge className="bg-accent/10 border-accent/30 text-foreground gap-1">
              Topic: {filters.topicQuery}
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, topicQuery: "" })}
                className="hover:text-danger"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null}

          {filters.languages.map((lang) => (
            <Badge key={lang} className="bg-accent/10 border-accent/30 text-foreground gap-1 font-mono">
              {lang}
              <button
                type="button"
                onClick={() => toggleLanguage(lang)}
                className="hover:text-danger"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}

      {/* Results Count Footer */}
      <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1">
        <span>
          Showing <strong className="text-foreground font-semibold">{filteredCount}</strong> of{" "}
          <strong className="text-foreground font-semibold">{totalCount}</strong> repositories
        </span>
        {filteredCount < totalCount ? (
          <span className="text-accent font-medium">
            ({totalCount - filteredCount} filtered out)
          </span>
        ) : null}
      </div>
    </div>
  );
}
