import type { Repository, Visibility } from "@starfolio/types";

export interface ExportBitbucketRepositoriesOptions {
  readonly token?: string | undefined;
}

export interface BitbucketRepository {
  type: string;
  uuid: string;
  name: string;
  full_name: string;
  slug: string;
  is_private: boolean;
  description?: string | null;
  created_on: string;
  updated_on: string;
  size?: number;
  language?: string | null;
  mainbranch?: {
    type?: string;
    name?: string;
  } | null;
  parent?: {
    type: string;
    full_name: string;
    name: string;
    uuid: string;
  } | null;
  owner: {
    display_name?: string;
    uuid?: string;
    username?: string;
    type?: string;
    links?: {
      avatar?: { href?: string };
      html?: { href?: string };
    };
  };
  links: {
    html: { href: string };
    avatar?: { href?: string };
  };
}

export interface BitbucketPaginatedResponse {
  pagelen: number;
  size?: number;
  page?: number;
  next?: string;
  values: BitbucketRepository[];
}

export function normalizeBitbucketRepository(
  repo: BitbucketRepository,
  fallbackUsername: string,
): Repository {
  const owner = repo.owner.username ?? repo.owner.display_name ?? fallbackUsername;
  const ownerAvatar = repo.owner.links?.avatar?.href ?? repo.links.avatar?.href ?? "";
  const ownerUrl = repo.owner.links?.html?.href ?? `https://bitbucket.org/${owner}`;

  const visibility: Visibility = repo.is_private ? "private" : "public";

  const primaryLanguage = repo.language
    ? {
        name: repo.language,
        color: null,
      }
    : null;

  const sizeKb = repo.size ? Math.round(repo.size / 1024) : 0;

  return {
    id: repo.uuid,
    provider: "bitbucket",
    owner,
    ownerAvatar,
    ownerUrl,
    name: repo.name,
    fullName: repo.full_name || `${owner}/${repo.name}`,
    description: repo.description ?? null,
    url: repo.links.html.href,
    homepage: null,
    primaryLanguage,
    topics: [],
    license: null,
    stars: 0,
    forks: 0,
    watchers: 0,
    openIssues: 0,
    archived: false,
    fork: Boolean(repo.parent),
    defaultBranch: repo.mainbranch?.name ?? null,
    createdAt: repo.created_on,
    updatedAt: repo.updated_on || repo.created_on,
    pushedAt: repo.updated_on ?? null,
    size: sizeKb,
    visibility,
    readme: null,
  };
}

export async function exportBitbucketRepositories(
  username: string,
  options?: ExportBitbucketRepositoriesOptions,
): Promise<Repository[]> {
  const trimmedUser = username.trim();
  if (trimmedUser.length === 0) {
    throw new Error("A Bitbucket username is required.");
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options?.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const repositories: Repository[] = [];
  let nextUrl: string | undefined = `https://api.bitbucket.org/2.0/repositories/${encodeURIComponent(trimmedUser)}?pagelen=100`;

  while (nextUrl) {
    const response: Response = await fetch(nextUrl, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Bitbucket user or workspace "${trimmedUser}" not found.`);
      }
      throw new Error(`Bitbucket API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as BitbucketPaginatedResponse;
    if (!data.values || !Array.isArray(data.values) || data.values.length === 0) {
      break;
    }

    for (const repo of data.values) {
      repositories.push(normalizeBitbucketRepository(repo, trimmedUser));
    }

    nextUrl = data.next;
  }

  return repositories;
}
