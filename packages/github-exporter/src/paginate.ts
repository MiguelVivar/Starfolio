import { ExporterError } from "./errors";
import { fetchStarredRepositoriesPage } from "./graphql/client";
import type { RepositoryNode } from "./graphql/schema";

export interface PaginateOptions {
  readonly login: string;
  readonly token: string;
  /** Called after each page lands, with cumulative fetched count and the known total. */
  readonly onPage?: (fetched: number, totalCount: number) => void;
}

/** Walks every page of a user's starred repositories, stopping only once GitHub reports
 * no further pages. Aborts early with a typed error if the rate limit is exhausted before
 * pagination completes, rather than firing a request guaranteed to fail. */
export async function paginateStarredRepositories(
  options: PaginateOptions,
): Promise<RepositoryNode[]> {
  const { login, token, onPage } = options;
  const nodes: RepositoryNode[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const page = await fetchStarredRepositoriesPage({ login, cursor, token });
    const { starredRepositories, rateLimit } = page;

    nodes.push(...starredRepositories.nodes);
    onPage?.(nodes.length, starredRepositories.totalCount);

    hasNextPage = starredRepositories.pageInfo.hasNextPage;
    cursor = starredRepositories.pageInfo.endCursor;

    if (hasNextPage && rateLimit.remaining <= 0) {
      throw new ExporterError(
        "RATE_LIMITED",
        `GitHub's rate limit was reached after fetching ${nodes.length} of ${starredRepositories.totalCount} starred repositories. It resets at ${rateLimit.resetAt}.`,
      );
    }
  }

  return nodes;
}
