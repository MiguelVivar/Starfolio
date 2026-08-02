import { getGitHubAuthUrl } from "@/lib/oauth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/auth/github/callback`;
  const authUrl = getGitHubAuthUrl(redirectUri);

  return NextResponse.redirect(authUrl);
}
