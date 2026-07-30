import * as XLSX from "xlsx";
import type { Repository } from "@starfolio/types";
import { ROW_COLUMNS, toRow } from "./rows";

export function toXlsx(repositories: readonly Repository[]): Uint8Array {
  const rows = repositories.map(toRow);
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: [...ROW_COLUMNS] });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Starred Repositories");
  const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  return new Uint8Array(buffer);
}
