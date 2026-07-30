import { exportRepositories, isExporterError } from "@starfolio/github-exporter";
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * The only place this app talks to GitHub. Runs server-side so no GitHub-specific logic
 * leaks into client code — all of that lives in @starfolio/github-exporter. The GitHub
 * token is a server-side secret (GITHUB_TOKEN env var), not something each visitor
 * supplies: GitHub's GraphQL API requires a token for every request, but there's no
 * reason to make every visitor create one just to try the tool.
 */

const requestSchema = z.object({
  username: z.string().trim().min(1, "A GitHub username is required."),
});

const ERROR_STATUS: Record<string, number> = {
  MISSING_TOKEN: 500,
  INVALID_USERNAME: 400,
  USER_NOT_FOUND: 404,
  AUTH_FAILED: 401,
  RATE_LIMITED: 429,
  GITHUB_API_ERROR: 502,
  NETWORK_ERROR: 502,
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: parsed.error.issues[0]?.message ?? "Invalid request." } },
      { status: 400 },
    );
  }

  const token = process.env.GITHUB_TOKEN?.trim() || undefined;

  try {
    const repositories = await exportRepositories(parsed.data.username, { token });
    return NextResponse.json({ repositories });
  } catch (error) {
    if (isExporterError(error)) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: ERROR_STATUS[error.code] ?? 500 },
      );
    }
    return NextResponse.json(
      { error: { code: "UNKNOWN", message: "An unexpected error occurred." } },
      { status: 500 },
    );
  }
}
