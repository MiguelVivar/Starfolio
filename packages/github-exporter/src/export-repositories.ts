import type { Repository } from "@starfolio/types";
import { ExporterError } from "./errors";
import { normalizeRepository } from "./normalize";
import { paginateStarredRepositories } from "./paginate";

export interface ExportRepositoriesOptions {
  /** GitHub personal access token. Required: GitHub's GraphQL API has no unauthenticated path. */
  readonly token: string;
  /** Invoked after each page fetch with the running total, for progress reporting. */
  readonly onProgress?: (fetched: number, total: number) => void;
}

/**
 * Fetches, paginates, and normalizes every repository a GitHub user has starred.
 * The single entry point this package exposes — the web app, and any future CLI or
 * API surface, depend on this function and nothing else from this package.
 */
export async function exportRepositories(
  username: string,
  options: ExportRepositoriesOptions,
): Promise<Repository[]> {
  const login = username.trim();
  if (login.length === 0) {
    throw new ExporterError("INVALID_USERNAME", "A GitHub username is required.");
  }

  const token = options.token?.trim();
  if (!token) {
    throw new ExporterError(
      "MISSING_TOKEN",
      "A GitHub personal access token is required — GitHub's GraphQL API does not support unauthenticated requests.",
    );
  }

  const nodes = await paginateStarredRepositories({
    login,
    token,
    ...(options.onProgress ? { onPage: options.onProgress } : {}),
  });

  return nodes.map(normalizeRepository);
}
