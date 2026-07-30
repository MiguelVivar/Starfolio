"use client";

import type { Repository } from "@starfolio/types";
import { exportToFormat, type ExportFormat } from "@starfolio/exporters";
import { Download } from "lucide-react";
import { downloadExportResult } from "@/lib/download";
import { Button } from "./ui/button";

const FORMATS: { format: ExportFormat; label: string }[] = [
  { format: "csv", label: "CSV" },
  { format: "json", label: "JSON" },
  { format: "markdown", label: "Markdown" },
  { format: "xlsx", label: "Excel" },
];

export function ExportMenu({
  repositories,
  username,
  selectedCount,
}: {
  repositories: Repository[];
  username: string;
  selectedCount?: number;
}) {
  const isFilteredExport = typeof selectedCount === "number" && selectedCount > 0 && selectedCount < repositories.length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isFilteredExport ? (
        <span className="text-xs font-mono bg-accent/10 text-accent border border-accent/20 px-2 py-1 rounded">
          Exporting {selectedCount} selected
        </span>
      ) : null}
      {FORMATS.map(({ format, label }) => (
        <Button
          key={format}
          variant="outline"
          size="sm"
          onClick={() => downloadExportResult(exportToFormat(repositories, format, `${username}-stars`))}
        >
          <Download className="h-3.5 w-3.5" />
          {label}
        </Button>
      ))}
    </div>
  );
}
