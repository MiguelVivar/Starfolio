"use client";

import type { Repository } from "@starfolio/types";
import { formatCount, formatDate } from "@starfolio/utils";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, BookOpen, CheckSquare, Filter, Search, Star, Square } from "lucide-react";
import { useMemo, useState } from "react";
import { ReadmeModal } from "./readme-modal";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

interface RepositoryTableProps {
  readonly repositories: Repository[];
  readonly selectedIds: Set<string>;
  readonly onSelectionChange: (ids: Set<string>) => void;
}

export function RepositoryTable({ repositories, selectedIds, onSelectionChange }: RepositoryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "stars", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("ALL");
  const [selectedLicense, setSelectedLicense] = useState<string>("ALL");
  const [showOnlyArchived, setShowOnlyArchived] = useState<boolean>(false);
  const [activeModalRepo, setActiveModalRepo] = useState<Repository | null>(null);

  // Extract unique languages & licenses for dropdown filters
  const languages = useMemo(() => {
    const set = new Set<string>();
    for (const r of repositories) {
      if (r.primaryLanguage?.name) set.add(r.primaryLanguage.name);
    }
    return Array.from(set).sort();
  }, [repositories]);

  const licenses = useMemo(() => {
    const set = new Set<string>();
    for (const r of repositories) {
      const name = r.license?.spdxId || r.license?.name;
      if (name) set.add(name);
    }
    return Array.from(set).sort();
  }, [repositories]);

  // Apply language, license & archived filters
  const filteredData = useMemo(() => {
    return repositories.filter((repo) => {
      if (selectedLanguage !== "ALL" && repo.primaryLanguage?.name !== selectedLanguage) {
        return false;
      }
      if (selectedLicense !== "ALL") {
        const lic = repo.license?.spdxId || repo.license?.name;
        if (lic !== selectedLicense) return false;
      }
      if (showOnlyArchived && !repo.archived) {
        return false;
      }
      return true;
    });
  }, [repositories, selectedLanguage, selectedLicense, showOnlyArchived]);

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
              <div className="flex items-center gap-2">
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
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground bg-surface hover:bg-surface/80 px-2 py-1 rounded border border-border transition-colors"
            title="Read README"
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
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const repo = row.original;
      const haystack = `${repo.fullName} ${repo.description ?? ""} ${repo.topics.join(" ")}`.toLowerCase();
      return haystack.includes(filterValue.toLowerCase());
    },
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Dropdown Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface/30 p-3 rounded-xl border border-border/60">
        <div className="relative flex-1 min-w-[16rem]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8 text-xs h-9 bg-background"
            placeholder="Search by name, description, or topic…"
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
          </div>

          {/* Language Dropdown */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="ALL">All Languages ({languages.length})</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          {/* License Dropdown */}
          <select
            value={selectedLicense}
            onChange={(e) => setSelectedLicense(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="ALL">All Licenses ({licenses.length})</option>
            {licenses.map((lic) => (
              <option key={lic} value={lic}>
                {lic}
              </option>
            ))}
          </select>

          {/* Archived Checkbox */}
          <label className="flex items-center gap-1.5 cursor-pointer px-2 py-1.5 rounded border border-border bg-background select-none">
            <input
              type="checkbox"
              checked={showOnlyArchived}
              onChange={(e) => setShowOnlyArchived(e.target.checked)}
              className="rounded accent-accent h-3.5 w-3.5"
            />
            Archived Only
          </label>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
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
                          <ArrowUp className="h-3 w-3" />
                        ) : sortDirection === "desc" ? (
                          <ArrowDown className="h-3 w-3" />
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
              <TableCell colSpan={columns.length} className="py-8 text-center font-sans text-muted-foreground">
                No repositories match the current filter criteria.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id} className={selectedIds.has(row.original.id) ? "bg-accent/5" : ""}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center text-xs text-muted-foreground font-mono">
        <p>
          Showing {rows.length} of {repositories.length} starred repositories.
        </p>
        {selectedIds.size > 0 ? (
          <p className="text-accent font-semibold">
            {selectedIds.size} repository{selectedIds.size > 1 ? "ies" : ""} selected for export
          </p>
        ) : null}
      </div>

      {/* README Modal */}
      <ReadmeModal repo={activeModalRepo} onClose={() => setActiveModalRepo(null)} />
    </div>
  );
}
