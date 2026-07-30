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
import { ArrowDown, ArrowUp, ArrowUpDown, Search, Star } from "lucide-react";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

const columns: ColumnDef<Repository>[] = [
  {
    accessorKey: "stars",
    header: "Stars",
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1 text-accent">
        <Star className="h-3 w-3 fill-current" />
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
        <div className="min-w-[16rem] max-w-md">
          <a
            className="font-medium text-foreground hover:text-accent hover:underline"
            href={repo.url}
            target="_blank"
            rel="noreferrer"
          >
            {repo.fullName}
          </a>
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
    cell: ({ row }) => row.original.primaryLanguage?.name ?? "—",
  },
  {
    accessorKey: "forks",
    header: "Forks",
    cell: ({ row }) => formatCount(row.original.forks),
  },
  {
    accessorKey: "license.name",
    header: "License",
    cell: ({ row }) => row.original.license?.spdxId ?? row.original.license?.name ?? "—",
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ row }) => formatDate(row.original.updatedAt),
  },
];

export function RepositoryTable({ repositories }: { repositories: Repository[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "stars", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data: repositories,
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
    <div className="flex flex-col gap-3">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Search by name, description, or topic…"
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
        />
      </div>

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
                No repositories match &quot;{globalFilter}&quot;.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <p className="text-xs text-muted-foreground">
        Showing {rows.length} of {repositories.length} starred repositories.
      </p>
    </div>
  );
}
