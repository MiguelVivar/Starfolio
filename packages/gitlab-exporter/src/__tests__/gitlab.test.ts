import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { exportGitLabRepositories, normalizeGitLabProject, type GitLabProject } from "../export-repositories";

const sampleGitLabProject: GitLabProject = {
  id: 12345,
  name: "starfolio",
  path: "starfolio",
  path_with_namespace: "miguel/starfolio",
  description: "Star management tool",
  web_url: "https://gitlab.com/miguel/starfolio",
  readme_url: "https://gitlab.com/miguel/starfolio/-/blob/main/README.md",
  created_at: "2024-01-15T10:00:00Z",
  last_activity_at: "2024-02-01T12:00:00Z",
  default_branch: "main",
  topics: ["typescript", "cli"],
  star_count: 42,
  forks_count: 5,
  open_issues_count: 2,
  archived: false,
  visibility: "public",
  forked_from_project: null,
  namespace: {
    id: 99,
    name: "miguel",
    path: "miguel",
    avatar_url: "https://gitlab.com/uploads/-/system/user/avatar/99/avatar.png",
    web_url: "https://gitlab.com/miguel",
  },
  license: {
    key: "mit",
    name: "MIT License",
  },
};

describe("GitLab Exporter", () => {
  describe("normalizeGitLabProject", () => {
    it("correctly normalizes a full GitLab project object to Repository", () => {
      const repo = normalizeGitLabProject(sampleGitLabProject, "miguel");
      expect(repo).toEqual({
        id: "12345",
        provider: "gitlab",
        owner: "miguel",
        ownerAvatar: "https://gitlab.com/uploads/-/system/user/avatar/99/avatar.png",
        ownerUrl: "https://gitlab.com/miguel",
        name: "starfolio",
        fullName: "miguel/starfolio",
        description: "Star management tool",
        url: "https://gitlab.com/miguel/starfolio",
        homepage: "https://gitlab.com/miguel/starfolio/-/blob/main/README.md",
        primaryLanguage: null,
        topics: ["typescript", "cli"],
        license: {
          key: "mit",
          name: "MIT License",
          spdxId: "mit",
        },
        stars: 42,
        forks: 5,
        watchers: 42,
        openIssues: 2,
        archived: false,
        fork: false,
        defaultBranch: "main",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-02-01T12:00:00Z",
        pushedAt: "2024-02-01T12:00:00Z",
        size: 0,
        visibility: "public",
        readme: null,
      });
    });

    it("handles minimal project object with fallback values", () => {
      const minimalProject: GitLabProject = {
        id: 999,
        name: "minimal",
        path: "minimal",
        path_with_namespace: "user/minimal",
        description: null,
        web_url: "https://gitlab.com/user/minimal",
        created_at: "2024-01-01T00:00:00Z",
      };

      const repo = normalizeGitLabProject(minimalProject, "user");
      expect(repo.id).toBe("999");
      expect(repo.provider).toBe("gitlab");
      expect(repo.owner).toBe("user");
      expect(repo.description).toBeNull();
      expect(repo.stars).toBe(0);
      expect(repo.license).toBeNull();
      expect(repo.topics).toEqual([]);
      expect(repo.visibility).toBe("public");
    });
  });

  describe("exportGitLabRepositories API fetching", () => {
    beforeEach(() => {
      vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("throws error if username is empty", async () => {
      await expect(exportGitLabRepositories("  ")).rejects.toThrow("A GitLab username is required.");
    });

    it("fetches starred repositories with token and custom baseUrl", async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "x-next-page": "" }),
        json: async () => [sampleGitLabProject],
      });
      vi.stubGlobal("fetch", mockFetch);

      const repos = await exportGitLabRepositories("miguel", {
        token: "glpat-12345",
        baseUrl: "https://gitlab.example.com",
      });

      expect(repos).toHaveLength(1);
      expect(repos[0]?.fullName).toBe("miguel/starfolio");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://gitlab.example.com/api/v4/users/miguel/starred_projects?per_page=100&page=1",
        {
          headers: {
            Accept: "application/json",
            "PRIVATE-TOKEN": "glpat-12345",
          },
        },
      );
    });

    it("handles 404 response", async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });
      vi.stubGlobal("fetch", mockFetch);

      await expect(exportGitLabRepositories("nonexistent")).rejects.toThrow(
        'GitLab user "nonexistent" not found.',
      );
    });
  });
});
