import type { Repository } from "@starfolio/types";

/** Flat, spreadsheet-friendly shape used by every tabular writer (CSV, XLSX, Markdown).
 * JSON export uses the full nested `Repository` instead — flattening is a tabular-format
 * concern, not a domain concern. */
export interface RepositoryRow {
  readonly fullName: string;
  readonly description: string;
  readonly url: string;
  readonly homepage: string;
  readonly language: string;
  readonly topics: string;
  readonly license: string;
  readonly stars: number;
  readonly forks: number;
  readonly watchers: number;
  readonly openIssues: number;
  readonly archived: boolean;
  readonly fork: boolean;
  readonly visibility: string;
  readonly sizeKb: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly pushedAt: string;
}

export const ROW_COLUMNS: readonly (keyof RepositoryRow)[] = [
  "fullName",
  "description",
  "url",
  "homepage",
  "language",
  "topics",
  "license",
  "stars",
  "forks",
  "watchers",
  "openIssues",
  "archived",
  "fork",
  "visibility",
  "sizeKb",
  "createdAt",
  "updatedAt",
  "pushedAt",
];

export function toRow(repository: Repository): RepositoryRow {
  return {
    fullName: repository.fullName,
    description: repository.description ?? "",
    url: repository.url,
    homepage: repository.homepage ?? "",
    language: repository.primaryLanguage?.name ?? "",
    topics: repository.topics.join(";"),
    license: repository.license?.name ?? "",
    stars: repository.stars,
    forks: repository.forks,
    watchers: repository.watchers,
    openIssues: repository.openIssues,
    archived: repository.archived,
    fork: repository.fork,
    visibility: repository.visibility,
    sizeKb: repository.size,
    createdAt: repository.createdAt,
    updatedAt: repository.updatedAt,
    pushedAt: repository.pushedAt ?? "",
  };
}
