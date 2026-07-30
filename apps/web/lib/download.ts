import type { ExportResult } from "@starfolio/exporters";

/** Triggers a browser download for an in-memory export result. Runs client-side only —
 * formatting already happened locally, so no second server round-trip is needed. */
export function downloadExportResult(result: ExportResult): void {
  const blob =
    typeof result.content === "string"
      ? new Blob([result.content], { type: `${result.mimeType};charset=utf-8` })
      : new Blob([result.content.slice()], { type: result.mimeType });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = result.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
