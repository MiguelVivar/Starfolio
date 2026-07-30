import type { Repository } from "@starfolio/types";
import { ROW_COLUMNS, toRow } from "./rows";

function escapeCsvCell(value: string | number | boolean): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(repositories: readonly Repository[]): string {
  const header = ROW_COLUMNS.join(",");
  const body = repositories
    .map(toRow)
    .map((row) => ROW_COLUMNS.map((column) => escapeCsvCell(row[column])).join(","))
    .join("\r\n");
  return body.length > 0 ? `${header}\r\n${body}` : header;
}
