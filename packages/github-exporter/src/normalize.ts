import type { Repository } from "@starfolio/types";
import type { RepositoryNode } from "./graphql/schema";

/** Maps one GitHub GraphQL repository node to the provider-agnostic `Repository` shape. */
export function normalizeRepository(node: RepositoryNode): Repository {
  return {
    id: node.id,
    provider: "github",

    owner: node.owner.login,
    ownerAvatar: node.owner.avatarUrl,
    ownerUrl: node.owner.url,

    name: node.name,
    fullName: node.nameWithOwner,
    description: node.description,
    url: node.url,
    homepage: node.homepageUrl,

    primaryLanguage: node.primaryLanguage,
    topics: node.repositoryTopics.nodes.map((entry) => entry.topic.name),
    license: node.licenseInfo,

    stars: node.stargazerCount,
    forks: node.forkCount,
    watchers: node.watchers.totalCount,
    openIssues: node.issues.totalCount,

    archived: node.isArchived,
    fork: node.isFork,
    defaultBranch: node.defaultBranchRef?.name ?? null,

    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    pushedAt: node.pushedAt,

    size: node.diskUsage ?? 0,
    visibility: node.visibility === "PUBLIC" ? "public" : "private",

    readme: null,
  };
}
