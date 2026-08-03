import { exportRepositories as exportGitHub, isExporterError as isGitHubError } from "@starfolio/github-exporter";
import { exportGitLabRepositories as exportGitLab } from "@starfolio/gitlab-exporter";
import { exportBitbucketRepositories as exportBitbucket } from "@starfolio/bitbucket-exporter";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

/**
 * Server-side API endpoint for exporting starred repositories across multiple providers:
 * GitHub, GitLab, or Bitbucket.
 */

const requestSchema = z.object({
  username: z.string().trim().min(1, "A username is required."),
  provider: z.enum(["github", "gitlab", "bitbucket"]).default("github"),
  customToken: z.string().trim().optional(),
});

const ERROR_STATUS: Record<string, number> = {
  INVALID_USERNAME: 400,
  USER_NOT_FOUND: 404,
  AUTH_FAILED: 401,
  RATE_LIMITED: 429,
  GITHUB_API_ERROR: 502,
  GITLAB_API_ERROR: 502,
  BITBUCKET_API_ERROR: 502,
  NETWORK_ERROR: 502,
};

export async function POST(request: Request) {
  const headerToken = request.headers.get("x-github-token")?.trim() || request.headers.get("authorization")?.replace("Bearer ", "").trim() || undefined;
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: parsed.error.issues[0]?.message ?? "Invalid request." } },
      { status: 400 },
    );
  }

  const { username, provider, customToken } = parsed.data;
  const cookieStore = await cookies();
  const oauthCookie = cookieStore.get("starfolio_oauth_token")?.value;
  let sessionToken: string | undefined;
  if (oauthCookie) {
    try {
      const session = JSON.parse(oauthCookie) as { provider?: string; token?: string };
      if (session.provider === provider) sessionToken = session.token;
    } catch {
      // Ignore malformed or legacy session cookies.
    }
  }
  const token = headerToken || customToken || sessionToken;

  try {
    let repositories;
    if (provider === "gitlab") {
      repositories = await exportGitLab(username, { token });
    } else if (provider === "bitbucket") {
      repositories = await exportBitbucket(username, { token });
    } else {
      repositories = await exportGitHub(username, { token });
    }

    return NextResponse.json({ repositories });
  } catch (error: unknown) {
    if (isGitHubError(error)) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: ERROR_STATUS[error.code] ?? 500 },
      );
    }
    const err = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json(
      { error: { code: "UNKNOWN", message: err } },
      { status: 500 },
    );
  }
}
