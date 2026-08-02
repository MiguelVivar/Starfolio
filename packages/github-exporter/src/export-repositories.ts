import type { Repository } from "@starfolio/types";
import { ExporterError } from "./errors";
import { fetchRestStarredRepositories } from "./rest/client";

export interface ExportRepositoriesOptions {
  readonly token?: string | undefined;
  /** Invoked after each page fetch with the running total, for progress reporting. */
  readonly onProgress?: ((fetched: number, total: number) => void) | undefined;
}

/**
 * Fetches, paginates, and normalizes every repository a GitHub user has starred.
 * Supports optional Personal Access Token (PAT) to bypass unauthenticated rate limits.
 */
export async function exportRepositories(
  username: string,
  options?: ExportRepositoriesOptions,
): Promise<Repository[]> {
  const login = username.trim();
  if (login.length === 0) {
    throw new ExporterError("INVALID_USERNAME", "A GitHub username is required.");
  }

  return fetchRestStarredRepositories({
    login,
    token: options?.token,
    onProgress: options?.onProgress,
  });
}
