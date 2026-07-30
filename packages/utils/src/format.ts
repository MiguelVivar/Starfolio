/** Formats a count for compact display: 950 -> "950", 12500 -> "12.5k", 2000000 -> "2M". */
export function formatCount(value: number): string {
  if (value < 1000) return String(value);
  if (value < 1_000_000) {
    const thousands = value / 1000;
    return `${trimTrailingZero(thousands)}k`;
  }
  const millions = value / 1_000_000;
  return `${trimTrailingZero(millions)}M`;
}

function trimTrailingZero(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "");
}

/** Formats a repository size (reported in kilobytes by GitHub) for display. */
export function formatSize(sizeInKb: number): string {
  if (sizeInKb < 1024) return `${sizeInKb} KB`;
  const mb = sizeInKb / 1024;
  if (mb < 1024) return `${trimTrailingZero(mb)} MB`;
  return `${trimTrailingZero(mb / 1024)} GB`;
}

/** Formats an ISO date string as an absolute, locale-independent date (e.g. "2026-07-28"). */
export function formatDate(iso: string): string {
  return iso.slice(0, 10);
}
