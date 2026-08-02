import { getGitLabAuthUrl } from "@/lib/oauth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/auth/gitlab/callback`;
  const authUrl = getGitLabAuthUrl(redirectUri);

  return NextResponse.redirect(authUrl);
}
