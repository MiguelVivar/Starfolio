import { exchangeGitLabCodeForToken, getGitLabUserInfo } from "@/lib/oauth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const errorParam = url.searchParams.get("error");

  if (errorParam || !code) {
    const redirectUrl = new URL("/", url.origin);
    redirectUrl.searchParams.set("error", errorParam || "missing_code");
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const redirectUri = `${url.origin}/api/auth/gitlab/callback`;
    const accessToken = await exchangeGitLabCodeForToken(code, redirectUri);
    let username: string | undefined;

    try {
      const userInfo = await getGitLabUserInfo(accessToken);
      username = userInfo.username;
    } catch {
      // User info optional fallback if API call fails
    }

    const sessionData = JSON.stringify({
      token: accessToken,
      provider: "gitlab",
      user: username,
    });

    const redirectUrl = new URL("/", url.origin);
    redirectUrl.searchParams.set("auth", "success");
    redirectUrl.searchParams.set("provider", "gitlab");

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set("starfolio_oauth_token", sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    const redirectUrl = new URL("/", url.origin);
    const message = err instanceof Error ? err.message : "auth_failed";
    redirectUrl.searchParams.set("error", message);
    return NextResponse.redirect(redirectUrl);
  }
}
