import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export interface AuthMeResponse {
  authenticated: boolean;
  provider?: string | undefined;
  user?: string | undefined;
}

export async function GET() {
  const cookieStore = await cookies();
  const oauthCookie = cookieStore.get("starfolio_oauth_token");

  if (!oauthCookie || !oauthCookie.value) {
    return NextResponse.json<AuthMeResponse>({
      authenticated: false,
    });
  }

  try {
    const parsed = JSON.parse(oauthCookie.value) as {
      token?: string;
      provider?: string;
      user?: string;
    };

    return NextResponse.json<AuthMeResponse>({
      authenticated: true,
      provider: parsed.provider,
      user: parsed.user,
    });
  } catch {
    return NextResponse.json<AuthMeResponse>({
      authenticated: true,
    });
  }
}

export async function DELETE() {
  const response = NextResponse.json<AuthMeResponse>({ authenticated: false });
  response.cookies.set("starfolio_oauth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
