import type { Repository } from "@starfolio/types";
import { ExporterError } from "./errors";
import { normalizeRepository } from "./normalize";
import { paginateStarredRepositories } from "./paginate";
import { fetchRestStarredRepositories } from "./rest/client";

export interface ExportRepositoriesOptions {
  /** Optional GitHub personal access token. If provided, uses GraphQL API for high-rate-limit fetching. If omitted or if token fails, falls back to public REST API without requiring any token. */
  readonly token?: string | undefined;
  /** Invoked after each page fetch with the running total, for progress reporting. */
  readonly onProgress?: ((fetched: number, total: number) => void) | undefined;
}

/**
 * Fetches, paginates, and normalizes every repository a GitHub user has starred.
 * The single entry point this package exposes — the web app, and any future CLI or
 * API surface, depend on this function and nothing else from this package.
 */
export async function exportRepositories(
  username: string,
  options?: ExportRepositoriesOptions,
): Promise<Repository[]> {
  const login = username.trim();
  if (login.length === 0) {
    throw new ExporterError("INVALID_USERNAME", "A GitHub username is required.");
  }

  const token = options?.token?.trim();

  if (token) {
    try {
      const nodes = await paginateStarredRepositories({
        login,
        token,
        ...(options?.onProgress ? { onPage: options.onProgress } : {}),
      });
      return nodes.map(normalizeRepository);
    } catch (error) {
      if (
        error instanceof ExporterError &&
        (error.code === "AUTH_FAILED" || error.code === "MISSING_TOKEN")
      ) {
        return fetchRestStarredRepositories({
          login,
          token,
          onProgress: options?.onProgress,
        });
      }
      throw error;
    }
  }

  return fetchRestStarredRepositories({
    login,
    token,
    onProgress: options?.onProgress,
  });
}

