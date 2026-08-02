export interface OAuthTokenResponse {
  access_token: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

export interface OAuthUserInfo {
  username: string;
  id?: string | number | undefined;
  name?: string | undefined;
  email?: string | undefined;
  avatarUrl?: string | undefined;
}

/**
 * Generates GitHub OAuth authorization URL.
 * Redirects user to https://github.com/login/oauth/authorize with client_id, redirect_uri, and scope.
 */
export function getGitHubAuthUrl(redirectUri: string, state?: string): string {
  const clientId = process.env.GITHUB_CLIENT_ID || "";
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "read:user user:email",
  });
  if (state) {
    params.set("state", state);
  }
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

/**
 * Generates GitLab OAuth authorization URL.
 * Redirects user to https://gitlab.com/oauth/authorize with client_id, redirect_uri, response_type, and scope.
 */
export function getGitLabAuthUrl(redirectUri: string, state?: string): string {
  const clientId = process.env.GITLAB_CLIENT_ID || "";
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "read_user read_api",
  });
  if (state) {
    params.set("state", state);
  }
  return `https://gitlab.com/oauth/authorize?${params.toString()}`;
}

/**
 * Exchanges GitHub authorization code for access token using client ID & secret.
 */
export async function exchangeGitHubCodeForToken(
  code: string,
  redirectUri: string,
): Promise<string> {
  const clientId = process.env.GITHUB_CLIENT_ID || "";
  const clientSecret = process.env.GITHUB_CLIENT_SECRET || "";

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub token exchange failed: HTTP ${response.status}`);
  }

  const data = (await response.json()) as OAuthTokenResponse;
  if (data.error || !data.access_token) {
    throw new Error(
      data.error_description || data.error || "Failed to obtain GitHub access token",
    );
  }

  return data.access_token;
}

/**
 * Exchanges GitLab authorization code for access token using client ID & secret.
 */
export async function exchangeGitLabCodeForToken(
  code: string,
  redirectUri: string,
): Promise<string> {
  const clientId = process.env.GITLAB_CLIENT_ID || "";
  const clientSecret = process.env.GITLAB_CLIENT_SECRET || "";

  const response = await fetch("https://gitlab.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`GitLab token exchange failed: HTTP ${response.status}`);
  }

  const data = (await response.json()) as OAuthTokenResponse;
  if (data.error || !data.access_token) {
    throw new Error(
      data.error_description || data.error || "Failed to obtain GitLab access token",
    );
  }

  return data.access_token;
}

/**
 * Fetches authenticated user details from GitHub API.
 */
export async function getGitHubUserInfo(accessToken: string): Promise<OAuthUserInfo> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "Starfolio-App",
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch GitHub user info: HTTP ${response.status}`);
  }

  const data = (await response.json()) as {
    login: string;
    id: number;
    name?: string;
    email?: string;
    avatar_url?: string;
  };

  return {
    username: data.login,
    id: data.id,
    name: data.name,
    email: data.email,
    avatarUrl: data.avatar_url,
  };
}

/**
 * Fetches authenticated user details from GitLab API.
 */
export async function getGitLabUserInfo(accessToken: string): Promise<OAuthUserInfo> {
  const response = await fetch("https://gitlab.com/api/v4/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch GitLab user info: HTTP ${response.status}`);
  }

  const data = (await response.json()) as {
    username: string;
    id: number;
    name?: string;
    email?: string;
    avatar_url?: string;
  };

  return {
    username: data.username,
    id: data.id,
    name: data.name,
    email: data.email,
    avatarUrl: data.avatar_url,
  };
}
