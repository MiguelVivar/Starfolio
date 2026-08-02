import { exportRepositories, isExporterError } from "@starfolio/github-exporter";
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Server-side API endpoint for exporting GitHub starred repositories.
 * Checks for a custom GitHub token passed in the request header `x-github-token`
 * or body `customToken`, and passes it to `@starfolio/github-exporter`.
 */

const requestSchema = z.object({
  username: z.string().trim().min(1, "A GitHub username is required."),
  customToken: z.string().trim().optional(),
});

const ERROR_STATUS: Record<string, number> = {
  INVALID_USERNAME: 400,
  USER_NOT_FOUND: 404,
  AUTH_FAILED: 401,
  RATE_LIMITED: 429,
  GITHUB_API_ERROR: 502,
  NETWORK_ERROR: 502,
};

export async function POST(request: Request) {
  const headerToken = request.headers.get("x-github-token")?.trim() || undefined;
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: parsed.error.issues[0]?.message ?? "Invalid request." } },
      { status: 400 },
    );
  }

  const token = headerToken || parsed.data.customToken || undefined;

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
