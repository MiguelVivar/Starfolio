import { graphql as octokitGraphql, GraphqlResponseError } from "@octokit/graphql";
import { RequestError } from "@octokit/request-error";
import { ExporterError } from "../errors";
import { STARRED_REPOSITORIES_QUERY } from "./query";
import {
  apiMessageSchema,
  starredRepositoriesResponseSchema,
  type StarredRepositoriesPage,
} from "./schema";

export interface FetchPageParams {
  readonly login: string;
  readonly cursor: string | null;
  readonly token: string;
}

const TRANSIENT_RETRY_DELAYS_MS = [500, 1500];

/** Fetches and validates a single page of starred repositories. Throws a typed `ExporterError`
 * for every GitHub/network failure mode instead of letting octokit's raw error leak out.
 * Retries transient gateway errors (502/503/504) with backoff — GitHub's edge occasionally
 * bounces a request that succeeds moments later; auth/rate-limit/not-found errors never
 * retry, since retrying those can't change the outcome. */
export async function fetchStarredRepositoriesPage(
  params: FetchPageParams,
): Promise<StarredRepositoriesPage> {
  const { login, cursor, token } = params;

  let raw: unknown;

  for (let attempt = 0; ; attempt++) {
    try {
      raw = await octokitGraphql(STARRED_REPOSITORIES_QUERY, {
        login,
        cursor,
        headers: {
          authorization: `bearer ${token}`,
        },
      });
      break;
    } catch (error) {
      const delay = TRANSIENT_RETRY_DELAYS_MS[attempt];
      if (delay === undefined || !isTransientStatus(error)) {
        throw translateGraphqlError(error);
      }
      await sleep(delay);
    }
  }

  const parsed = starredRepositoriesResponseSchema.safeParse(raw);
  if (!parsed.success) {
    const apiMessage = apiMessageSchema.safeParse(raw);
    if (apiMessage.success) {
      throw new ExporterError("RATE_LIMITED", apiMessage.data.message, { cause: raw });
    }

    throw new ExporterError(
      "GITHUB_API_ERROR",
      "GitHub returned a response Starfolio didn't recognize. Try again in a moment.",
      { cause: parsed.error },
    );
  }

  if (parsed.data.user === null) {
    throw new ExporterError("USER_NOT_FOUND", `GitHub user "${login}" does not exist.`);
  }

  return {
    starredRepositories: parsed.data.user.starredRepositories,
    rateLimit: parsed.data.rateLimit,
  };
}

const TRANSIENT_STATUSES = new Set([502, 503, 504]);

function isTransientStatus(error: unknown): boolean {
  return error instanceof RequestError && TRANSIENT_STATUSES.has(error.status);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Translates every failure mode into a typed `ExporterError` with our own controlled
 * message text. Deliberately never surfaces `error.message` from an HTTP-level failure
 * (`RequestError`) — GitHub's edge can return a non-JSON body (e.g. a raw HTML 502 page
 * from its gateway), and octokit's own message construction dumps that body verbatim.
 */
function translateGraphqlError(error: unknown): ExporterError {
  if (error instanceof GraphqlResponseError) {
    const firstError = error.errors?.[0];
    const type = firstError?.type;

    if (type === "RATE_LIMITED") {
      return new ExporterError("RATE_LIMITED", "GitHub GraphQL rate limit exceeded.", {
        cause: error,
      });
    }
    if (type === "NOT_FOUND") {
      return new ExporterError(
        "USER_NOT_FOUND",
        firstError?.message ?? "GitHub user not found.",
        { cause: error },
      );
    }
    return new ExporterError(
      "GITHUB_API_ERROR",
      firstError?.message ?? "GitHub GraphQL returned an error.",
      { cause: error },
    );
  }

  if (error instanceof RequestError) {
    return translateRequestError(error);
  }

  return new ExporterError(
    "NETWORK_ERROR",
    "Could not reach GitHub. Check your connection and try again.",
    { cause: error },
  );
}

/** HTTP-level failures (non-2xx responses) — @octokit/graphql throws these directly,
 * outside the GraphQL-error-shaped `GraphqlResponseError` path above. */
function translateRequestError(error: RequestError): ExporterError {
  switch (error.status) {
    case 401:
      return new ExporterError(
        "AUTH_FAILED",
        "GitHub rejected the configured token. Check that it is valid and has not expired.",
        { cause: error },
      );
    case 403:
      return new ExporterError(
        "RATE_LIMITED",
        "GitHub refused the request — this is usually a rate limit, or a token missing the public_repo read scope.",
        { cause: error },
      );
    case 502:
    case 503:
    case 504:
      return new ExporterError(
        "GITHUB_API_ERROR",
        `GitHub's API is temporarily unavailable (HTTP ${error.status}). Try again in a moment.`,
        { cause: error },
      );
    default:
      return new ExporterError(
        "GITHUB_API_ERROR",
        `GitHub returned an unexpected error (HTTP ${error.status}).`,
        { cause: error },
      );
  }
}
