import type { Repository } from "@starfolio/types";
import { toCsv } from "./csv";
import { toJson } from "./json";
import { toMarkdown } from "./markdown";
import { toXlsx } from "./xlsx";

export type ExportFormat = "csv" | "json" | "markdown" | "xlsx";

export interface ExportResult {
  readonly filename: string;
  readonly mimeType: string;
  readonly content: string | Uint8Array;
}

const FORMAT_CONFIG: Record<ExportFormat, { extension: string; mimeType: string }> = {
  csv: { extension: "csv", mimeType: "text/csv" },
  json: { extension: "json", mimeType: "application/json" },
  markdown: { extension: "md", mimeType: "text/markdown" },
  xlsx: {
    extension: "xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
};

/** Serializes a repository list to the requested export format. Every writer only knows
 * `Repository[]` — never GitHub or any other source — so the same writers serve whatever
 * provider produces the data next. */
export function exportToFormat(
  repositories: readonly Repository[],
  format: ExportFormat,
  baseFilename = "starred-repositories",
): ExportResult {
  const { extension, mimeType } = FORMAT_CONFIG[format];
  const filename = `${baseFilename}.${extension}`;

  switch (format) {
    case "csv":
      return { filename, mimeType, content: toCsv(repositories) };
    case "json":
      return { filename, mimeType, content: toJson(repositories) };
    case "markdown":
      return { filename, mimeType, content: toMarkdown(repositories) };
    case "xlsx":
      return { filename, mimeType, content: toXlsx(repositories) };
  }
}
