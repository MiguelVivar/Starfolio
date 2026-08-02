import type { Repository } from "@starfolio/types";
import { ExporterError } from "../errors";
import { normalizeRestRepository } from "./normalize";

export interface FetchRestStarredOptions {
  readonly login: string;
  readonly token?: string | undefined;
  readonly onProgress?: ((fetched: number, total: number) => void) | undefined;
}

export async function fetchRestStarredRepositories(
  options: FetchRestStarredOptions,
): Promise<Repository[]> {
  const { login, token, onProgress } = options;
  const repositories: Repository[] = [];
  let page = 1;
  const perPage = 100;
  let hasMore = true;

  while (hasMore) {
    const url = `https://api.github.com/users/${encodeURIComponent(login)}/starred?per_page=${perPage}&page=${page}`;
    const headers: Record<string, string> = {
      "User-Agent": "Starfolio-Exporter/1.0",
      Accept: "application/vnd.github.v3+json, application/vnd.github.star+json",
    };

    if (token && token.trim().length > 0) {
      headers["Authorization"] = `Bearer ${token.trim()}`;
    }

    let response: Response;
    try {
      response = await fetch(url, { headers });
    } catch (err) {
      throw new ExporterError(
        "NETWORK_ERROR",
        "Could not reach GitHub. Check your internet connection and try again.",
        { cause: err },
      );
    }

    if (response.status === 404) {
      throw new ExporterError("USER_NOT_FOUND", `GitHub user "${login}" does not exist.`);
    }

    if (response.status === 401) {
      throw new ExporterError("AUTH_FAILED", "GitHub rejected the request.");
    }

    if (response.status === 403 || response.status === 429) {
      const resetHeader = response.headers.get("x-ratelimit-reset");
      const resetAt = resetHeader
        ? new Date(parseInt(resetHeader, 10) * 1000).toLocaleTimeString()
        : "a while";
      throw new ExporterError(
        "RATE_LIMITED",
        `GitHub API rate limit reached (resets at ${resetAt}). Please try again later.`,
      );
    }

    if (!response.ok) {
      throw new ExporterError(
        "GITHUB_API_ERROR",
        `GitHub returned HTTP error status ${response.status}.`,
      );
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
      throw new ExporterError(
        "GITHUB_API_ERROR",
        "GitHub returned an unexpected response format.",
      );
    }

    if (data.length === 0) {
      hasMore = false;
      break;
    }

    for (const rawItem of data) {
      repositories.push(normalizeRestRepository(rawItem));
    }

    onProgress?.(repositories.length, repositories.length);

    if (data.length < perPage) {
      hasMore = false;
    } else {
      page++;
    }
  }

  return repositories;
}
