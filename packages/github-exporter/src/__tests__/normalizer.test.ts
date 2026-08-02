import { describe, expect, it } from "vitest";
import { normalizeRepository } from "../normalize";
import type { RepositoryNode } from "../graphql/schema";

const sampleGraphQLNode: RepositoryNode = {
  id: "MDEwOlJlcG9zaXRvcnkxMjM0NTY=",
  name: "starfolio",
  nameWithOwner: "MiguelVivar/starfolio",
  description: "Starred repositories exporter & viewer",
  url: "https://github.com/MiguelVivar/starfolio",
  homepageUrl: "https://starfolio.dev",
  isArchived: false,
  isFork: false,
  visibility: "PUBLIC",
  stargazerCount: 150,
  forkCount: 25,
  diskUsage: 2048,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-07-30T10:00:00Z",
  pushedAt: "2026-07-30T12:00:00Z",
  defaultBranchRef: { name: "main" },
  primaryLanguage: { name: "TypeScript", color: "#3178c6" },
  licenseInfo: { key: "mit", name: "MIT License", spdxId: "MIT" },
  repositoryTopics: {
    nodes: [
      { topic: { name: "typescript" } },
      { topic: { name: "nextjs" } },
      { topic: { name: "github-api" } },
    ],
  },
  watchers: { totalCount: 12 },
  issues: { totalCount: 4 },
  owner: {
    login: "MiguelVivar",
    avatarUrl: "https://avatars.githubusercontent.com/u/1000",
    url: "https://github.com/MiguelVivar",
  },
};

describe("normalizeRepository", () => {
  it("normalizes a complete GraphQL RepositoryNode to a Repository domain model", () => {
    const repo = normalizeRepository(sampleGraphQLNode);

    expect(repo.id).toBe("MDEwOlJlcG9zaXRvcnkxMjM0NTY=");
    expect(repo.provider).toBe("github");
    expect(repo.owner).toBe("MiguelVivar");
    expect(repo.ownerAvatar).toBe("https://avatars.githubusercontent.com/u/1000");
    expect(repo.ownerUrl).toBe("https://github.com/MiguelVivar");
    expect(repo.name).toBe("starfolio");
    expect(repo.fullName).toBe("MiguelVivar/starfolio");
    expect(repo.description).toBe("Starred repositories exporter & viewer");
    expect(repo.url).toBe("https://github.com/MiguelVivar/starfolio");
    expect(repo.homepage).toBe("https://starfolio.dev");
    expect(repo.primaryLanguage).toEqual({ name: "TypeScript", color: "#3178c6" });
    expect(repo.topics).toEqual(["typescript", "nextjs", "github-api"]);
    expect(repo.license).toEqual({ key: "mit", name: "MIT License", spdxId: "MIT" });
    expect(repo.stars).toBe(150);
    expect(repo.forks).toBe(25);
    expect(repo.watchers).toBe(12);
    expect(repo.openIssues).toBe(4);
    expect(repo.archived).toBe(false);
    expect(repo.fork).toBe(false);
    expect(repo.defaultBranch).toBe("main");
    expect(repo.createdAt).toBe("2026-01-01T00:00:00Z");
    expect(repo.updatedAt).toBe("2026-07-30T10:00:00Z");
    expect(repo.pushedAt).toBe("2026-07-30T12:00:00Z");
    expect(repo.size).toBe(2048);
    expect(repo.visibility).toBe("public");
    expect(repo.readme).toBeNull();
  });

  it("handles null and optional fields correctly", () => {
    const nodeWithNulls: RepositoryNode = {
      ...sampleGraphQLNode,
      description: null,
      homepageUrl: null,
      defaultBranchRef: null,
      primaryLanguage: null,
      licenseInfo: null,
      pushedAt: null,
      diskUsage: null,
      visibility: "PRIVATE",
    };

    const repo = normalizeRepository(nodeWithNulls);

    expect(repo.description).toBeNull();
    expect(repo.homepage).toBeNull();
    expect(repo.defaultBranch).toBeNull();
    expect(repo.primaryLanguage).toBeNull();
    expect(repo.license).toBeNull();
    expect(repo.pushedAt).toBeNull();
    expect(repo.size).toBe(0);
    expect(repo.visibility).toBe("private");
  });
});
