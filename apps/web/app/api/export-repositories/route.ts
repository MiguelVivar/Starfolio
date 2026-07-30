import { exportRepositories, isExporterError } from "@starfolio/github-exporter";
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Server-side API endpoint for exporting GitHub starred repositories.
 * All GitHub fetching logic lives in @starfolio/github-exporter and runs
 * without requiring any tokens or user credentials.
 */

const requestSchema = z.object({
  username: z.string().trim().min(1, "A GitHub username is required."),
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
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: parsed.error.issues[0]?.message ?? "Invalid request." } },
      { status: 400 },
    );
  }

  try {
    const repositories = await exportRepositories(parsed.data.username);
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
