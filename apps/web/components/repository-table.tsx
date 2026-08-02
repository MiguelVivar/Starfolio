"use client";

import type { Provider, Repository } from "@starfolio/types";
import { formatCount, formatDate } from "@starfolio/utils";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BookOpen,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  GitFork,
  Layers,
  Square,
  Star,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  AdvancedFilters,
  DEFAULT_FILTERS,
  type FilterState,
  filterRepositories,
} from "./advanced-filters";
import { ReadmeModal } from "./readme-modal";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

interface RepositoryTableProps {
  readonly repositories: readonly Repository[];
  readonly selectedIds: Set<string>;
  readonly onSelectionChange: (ids: Set<string>) => void;
}

const PROVIDER_BADGES: Record<Provider, { label: string; className: string }> = {
  github: { label: "GitHub", className: "bg-slate-500/10 text-foreground border-slate-500/20" },
  gitlab: { label: "GitLab", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  bitbucket: { label: "Bitbucket", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
};

export function RepositoryTable({ repositories, selectedIds, onSelectionChange }: RepositoryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "stars", desc: true }]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [activeModalRepo, setActiveModalRepo] = useState<Repository | null>(null);
  const [pageSizeOption, setPageSizeOption] = useState<number | "all">(50);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const availableLanguages = useMemo(() => {
    const set = new Set<string>();
    for (const r of repositories) {
      if (r.primaryLanguage?.name) set.add(r.primaryLanguage.name);
    }
    return Array.from(set).sort();
  }, [repositories]);

  const filteredData = useMemo(() => {
    return filterRepositories(repositories, filters);
  }, [repositories, filters]);

  const columns = useMemo<ColumnDef<Repository>[]>(
    () => [
      {
        id: "select",
        header: () => {
          const allSelected = filteredData.length > 0 && filteredData.every((r) => selectedIds.has(r.id));
          return (
            <button
              type="button"
              onClick={() => {
                const next = new Set(selectedIds);
                if (allSelected) {
                  for (const r of filteredData) next.delete(r.id);
                } else {
                  for (const r of filteredData) next.add(r.id);
                }
                onSelectionChange(next);
              }}
              className="text-muted-foreground hover:text-foreground p-1"
              title={allSelected ? "Deselect all visible" : "Select all visible"}
            >
              {allSelected ? <CheckSquare className="h-4 w-4 text-accent" /> : <Square className="h-4 w-4" />}
            </button>
          );
        },
        cell: ({ row }) => {
          const id = row.original.id;
          const isSelected = selectedIds.has(id);
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const next = new Set(selectedIds);
                if (isSelected) {
                  next.delete(id);
                } else {
                  next.add(id);
                }
                onSelectionChange(next);
              }}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              {isSelected ? <CheckSquare className="h-4 w-4 text-accent" /> : <Square className="h-4 w-4 opacity-50" />}
            </button>
          );
        },
      },
      {
        accessorKey: "provider",
        header: "Provider",
        cell: ({ row }) => {
          const p = row.original.provider || "github";
          const badge = PROVIDER_BADGES[p] || PROVIDER_BADGES.github;
          return (
            <span className={`inline-flex items-center gap-1 rounded text-[10px] font-mono font-semibold px-2 py-0.5 border ${badge.className}`}>
              {badge.label}
            </span>
          );
        },
      },
      {
        accessorKey: "stars",
        header: "Stars",
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1 font-mono font-medium text-accent">
            <Star className="h-3.5 w-3.5 fill-current" />
            {formatCount(row.original.stars)}
          </span>
        ),
      },
      {
        accessorKey: "fullName",
        header: "Repository",
        cell: ({ row }) => {
          const repo = row.original;
          return (
            <div className="min-w-[15rem] max-w-md">
              <div className="flex flex-wrap items-center gap-1.5">
                <a
                  className="font-semibold text-foreground hover:text-accent hover:underline"
                  href={repo.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {repo.fullName}
                </a>
                {repo.archived ? (
                  <span className="rounded bg-rose-500/10 text-rose-500 text-[10px] font-mono px-1.5 py-0.5 border border-rose-500/20">
                    Archived
                  </span>
                ) : null}
                {repo.fork ? (
                  <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-mono px-1.5 py-0.5 border border-amber-500/20">
                    <GitFork className="h-3 w-3" /> Fork
                  </span>
                ) : null}
              </div>
              {repo.description ? (
                <p className="mt-0.5 truncate text-xs text-muted-foreground" title={repo.description}>
                  {repo.description}
                </p>
              ) : null}
              {repo.topics.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {repo.topics.slice(0, 4).map((topic) => (
                    <Badge key={topic}>{topic}</Badge>
                  ))}
                  {repo.topics.length > 4 ? (
                    <Badge className="opacity-60">+{repo.topics.length - 4}</Badge>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: "primaryLanguage.name",
        header: "Language",
        cell: ({ row }) =>
          row.original.primaryLanguage?.name ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-accent" />
              {row.original.primaryLanguage.name}
            </span>
          ) : (
            "—"
          ),
      },
      {
        accessorKey: "forks",
        header: "Forks",
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{formatCount(row.original.forks)}</span>,
      },
      {
        accessorKey: "license.name",
        header: "License",
        cell: ({ row }) => row.original.license?.spdxId ?? row.original.license?.name ?? "—",
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) => <span className="text-xs text-muted-foreground font-mono">{formatDate(row.original.updatedAt)}</span>,
      },
      {
        id: "actions",
        header: "README",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => setActiveModalRepo(row.original)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground bg-surface hover:bg-surface-hover px-2 py-1 rounded border border-border transition-colors"
            title="Read formatted README"
          >
            <BookOpen className="h-3 w-3 text-accent" /> Readme
          </button>
        ),
      },
    ],
    [filteredData, selectedIds, onSelectionChange],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      pagination: {
        pageIndex: 0,
        pageSize: pageSizeOption === "all" ? 1000000 : pageSizeOption,
      },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const rows = table.getRowModel().rows;
  const isVirtualMode = pageSizeOption === "all" || filteredData.length > 100;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 54,
    overscan: 12,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalVirtualSize = rowVirtualizer.getTotalSize();

  return (
    <div className="flex flex-col gap-4">
      <AdvancedFilters
        filters={filters}
        onFilterChange={setFilters}
        availableLanguages={availableLanguages}
        totalCount={repositories.length}
        filteredCount={filteredData.length}
      />

      <div
        ref={tableContainerRef}
        className="w-full max-h-[620px] overflow-auto rounded-md border border-border bg-background relative scrollbar-thin"
      >
        <Table className="relative w-full border-collapse text-sm">
          <TableHeader className="sticky top-0 z-20 bg-surface shadow-xs border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortDirection = header.column.getIsSorted();
                  return (
                    <TableHead key={header.id}>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-foreground disabled:pointer-events-none"
                        disabled={!header.column.getCanSort()}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="h-3 w-3 text-accent" />
                          ) : sortDirection === "desc" ? (
                            <ArrowDown className="h-3 w-3 text-accent" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-40" />
                          )
                        ) : null}
                      </button>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center font-sans text-muted-foreground">
                  No repositories match the active filter criteria. Try expanding your search or resetting filters.
                </TableCell>
              </TableRow>
            ) : isVirtualMode ? (
              <>
                {virtualItems[0]?.start ? (
                  <tr style={{ height: `${virtualItems[0].start}px` }} />
                ) : null}

                {virtualItems.map((virtualRow: VirtualItem) => {
                  const row = rows[virtualRow.index];
                  if (!row) return null;
                  return (
                    <TableRow
                      key={row.id}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      className={selectedIds.has(row.original.id) ? "bg-accent/10" : ""}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}

                {virtualItems.length > 0 ? (
                  <tr
                    style={{
                      height: `${totalVirtualSize - (virtualItems[virtualItems.length - 1]?.end ?? 0)}px`,
                    }}
                  />
                ) : null}
              </>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} className={selectedIds.has(row.original.id) ? "bg-accent/10" : ""}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground font-mono pt-2 border-t border-border/40">
        <div className="flex items-center gap-3">
          <p>
            Showing {rows.length} of {filteredData.length} filtered ({repositories.length} total) repos.
          </p>
          {selectedIds.size > 0 ? (
            <p className="text-accent font-semibold border-l border-border/60 pl-3">
              {selectedIds.size} selected
            </p>
          ) : null}
          {isVirtualMode ? (
            <span className="inline-flex items-center gap-1 rounded bg-accent/15 px-2 py-0.5 text-[11px] font-mono text-accent">
              <Layers className="h-3 w-3" /> Virtual Window Active
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span>View Mode:</span>
            <select
              value={pageSizeOption}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "all") {
                  setPageSizeOption("all");
                } else {
                  const size = Number(val);
                  setPageSizeOption(size);
                  table.setPageSize(size);
                }
              }}
              className="h-8 rounded border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
              <option value="all">⚡ All (Virtual Windowed)</option>
            </select>
          </div>

          {pageSizeOption !== "all" ? (
            <div className="flex items-center gap-1">
              <span className="px-2 text-foreground/80 font-medium">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
              </span>
              <button
                type="button"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="p-1.5 rounded border border-border bg-background disabled:opacity-30 hover:bg-surface-hover transition-colors"
                title="First page"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-1.5 rounded border border-border bg-background disabled:opacity-30 hover:bg-surface-hover transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-1.5 rounded border border-border bg-background disabled:opacity-30 hover:bg-surface-hover transition-colors"
                title="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="p-1.5 rounded border border-border bg-background disabled:opacity-30 hover:bg-surface-hover transition-colors"
                title="Last page"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <ReadmeModal repo={activeModalRepo} onClose={() => setActiveModalRepo(null)} />
    </div>
  );
}
