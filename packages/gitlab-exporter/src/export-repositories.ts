import type { Repository, Visibility } from "@starfolio/types";

export interface ExportGitLabRepositoriesOptions {
  readonly token?: string | undefined;
  readonly baseUrl?: string | undefined;
}

export interface GitLabProject {
  id: number;
  name: string;
  name_with_namespace?: string;
  path: string;
  path_with_namespace: string;
  description: string | null;
  web_url: string;
  readme_url?: string | null;
  created_at: string;
  last_activity_at?: string | null;
  default_branch?: string | null;
  topics?: string[];
  tag_list?: string[];
  star_count?: number;
  forks_count?: number;
  open_issues_count?: number;
  archived?: boolean;
  visibility?: string;
  forked_from_project?: object | null;
  namespace?: {
    id: number;
    name: string;
    path: string;
    kind?: string;
    full_path?: string;
    avatar_url?: string | null;
    web_url?: string;
  };
  avatar_url?: string | null;
  license?: {
    key: string;
    name: string;
    nickname?: string;
    html_url?: string;
    source_url?: string;
  } | null;
  statistics?: {
    repository_size?: number;
  };
}

export function normalizeGitLabProject(
  project: GitLabProject,
  fallbackUsername: string,
): Repository {
  const owner = project.namespace?.path ?? project.path_with_namespace.split("/")[0] ?? fallbackUsername;
  const ownerAvatar = project.namespace?.avatar_url ?? project.avatar_url ?? "";
  const ownerUrl = project.namespace?.web_url ?? (project.web_url.includes("/-") ? project.web_url.split("/-")[0]! : project.web_url);

  const topics = Array.isArray(project.topics)
    ? project.topics
    : Array.isArray(project.tag_list)
      ? project.tag_list
      : [];

  const visibility: Visibility = project.visibility === "private" ? "private" : "public";

  const license = project.license
    ? {
        key: project.license.key,
        name: project.license.name,
        spdxId: project.license.key,
      }
    : null;

  const stars = project.star_count ?? 0;

  return {
    id: String(project.id),
    provider: "gitlab",
    owner,
    ownerAvatar,
    ownerUrl,
    name: project.name,
    fullName: project.path_with_namespace || `${owner}/${project.name}`,
    description: project.description ?? null,
    url: project.web_url,
    homepage: project.readme_url ?? null,
    primaryLanguage: null,
    topics,
    license,
    stars,
    forks: project.forks_count ?? 0,
    watchers: stars,
    openIssues: project.open_issues_count ?? 0,
    archived: Boolean(project.archived),
    fork: Boolean(project.forked_from_project),
    defaultBranch: project.default_branch ?? null,
    createdAt: project.created_at,
    updatedAt: project.last_activity_at ?? project.created_at,
    pushedAt: project.last_activity_at ?? null,
    size: project.statistics?.repository_size ? Math.round(project.statistics.repository_size / 1024) : 0,
    visibility,
    readme: null,
  };
}

export async function exportGitLabRepositories(
  username: string,
  options?: ExportGitLabRepositoriesOptions,
): Promise<Repository[]> {
  const trimmedUser = username.trim();
  if (trimmedUser.length === 0) {
    throw new Error("A GitLab username is required.");
  }

  let baseUrl = (options?.baseUrl || "https://gitlab.com").replace(/\/+$/, "");
  if (!baseUrl.endsWith("/api/v4")) {
    baseUrl = `${baseUrl}/api/v4`;
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options?.token) {
    headers["PRIVATE-TOKEN"] = options.token;
  }

  const repositories: Repository[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = `${baseUrl}/users/${encodeURIComponent(trimmedUser)}/starred_projects?per_page=${perPage}&page=${page}`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`GitLab user "${trimmedUser}" not found.`);
      }
      throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as GitLabProject[];
    if (!Array.isArray(data) || data.length === 0) {
      break;
    }

    for (const project of data) {
      repositories.push(normalizeGitLabProject(project, trimmedUser));
    }

    const nextPageHeader = response.headers.get("x-next-page");
    if (nextPageHeader && nextPageHeader.trim().length > 0) {
      const parsedPage = parseInt(nextPageHeader, 10);
      if (isNaN(parsedPage)) break;
      page = parsedPage;
    } else if (data.length < perPage) {
      break;
    } else {
      page++;
    }
  }

  return repositories;
}
