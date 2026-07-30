import type { Repository } from "@starfolio/types";

export interface RawRestRepo {
  id?: number | string;
  node_id?: string;
  name?: string;
  full_name?: string;
  owner?: {
    login?: string;
    avatar_url?: string;
    html_url?: string;
  };
  html_url?: string;
  description?: string | null;
  homepage?: string | null;
  language?: string | null;
  topics?: string[];
  license?: {
    key?: string;
    name?: string;
    spdx_id?: string | null;
  } | null;
  stargazers_count?: number;
  forks_count?: number;
  watchers_count?: number;
  open_issues_count?: number;
  archived?: boolean;
  fork?: boolean;
  default_branch?: string | null;
  created_at?: string;
  updated_at?: string;
  pushed_at?: string | null;
  size?: number;
  private?: boolean;
  visibility?: string;
}

export function normalizeRestRepository(rawItem: unknown): Repository {
  const obj = (rawItem && typeof rawItem === "object" ? rawItem : {}) as Record<string, unknown>;
  const item: RawRestRepo = (obj.repo && typeof obj.repo === "object" ? obj.repo : obj) as RawRestRepo;

  const fullName = item.full_name || `${item.owner?.login || ""}/${item.name || ""}`;
  const [ownerPart, namePart] = fullName.split("/");

  const ownerName = item.owner?.login || ownerPart || "";
  const repoName = item.name || namePart || "";

  return {
    id: item.node_id || String(item.id || fullName),
    provider: "github",

    owner: ownerName,
    ownerAvatar: item.owner?.avatar_url || `https://github.com/${ownerName}.png`,
    ownerUrl: item.owner?.html_url || `https://github.com/${ownerName}`,

    name: repoName,
    fullName: fullName,
    description: item.description || null,
    url: item.html_url || `https://github.com/${fullName}`,
    homepage: item.homepage || null,

    primaryLanguage: item.language ? { name: item.language, color: null } : null,
    topics: Array.isArray(item.topics) ? item.topics : [],
    license: item.license
      ? {
          key: item.license.key || "unknown",
          name: item.license.name || "Unknown License",
          spdxId: item.license.spdx_id || null,
        }
      : null,

    stars: item.stargazers_count ?? 0,
    forks: item.forks_count ?? 0,
    watchers: item.watchers_count ?? 0,
    openIssues: item.open_issues_count ?? 0,

    archived: Boolean(item.archived),
    fork: Boolean(item.fork),
    defaultBranch: item.default_branch || null,

    createdAt: item.created_at || new Date().toISOString(),
    updatedAt: item.updated_at || new Date().toISOString(),
    pushedAt: item.pushed_at || null,

    size: item.size ?? 0,
    visibility: item.private ? "private" : "public",

    readme: null,
  };
}
