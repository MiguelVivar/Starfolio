import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { exportBitbucketRepositories, normalizeBitbucketRepository, type BitbucketRepository } from "../export-repositories";

const sampleBitbucketRepo: BitbucketRepository = {
  type: "repository",
  uuid: "{12345678-1234-1234-1234-1234567890ab}",
  name: "awesome-app",
  full_name: "atlassian/awesome-app",
  slug: "awesome-app",
  is_private: false,
  description: "An awesome app built on Bitbucket",
  created_on: "2023-05-10T12:00:00.000Z",
  updated_on: "2024-01-20T15:30:00.000Z",
  size: 204800,
  language: "typescript",
  mainbranch: {
    type: "branch",
    name: "main",
  },
  owner: {
    username: "atlassian",
    display_name: "Atlassian",
    type: "user",
    links: {
      avatar: { href: "https://avatar-management.services.atlassian.com/avatar/atlassian" },
      html: { href: "https://bitbucket.org/atlassian" },
    },
  },
  links: {
    html: { href: "https://bitbucket.org/atlassian/awesome-app" },
    avatar: { href: "https://bytebucket.org/avatar/awesome-app" },
  },
};

describe("Bitbucket Exporter", () => {
  describe("normalizeBitbucketRepository", () => {
    it("correctly normalizes a Bitbucket repository object to Repository", () => {
      const repo = normalizeBitbucketRepository(sampleBitbucketRepo, "atlassian");
      expect(repo).toEqual({
        id: "{12345678-1234-1234-1234-1234567890ab}",
        provider: "bitbucket",
        owner: "atlassian",
        ownerAvatar: "https://avatar-management.services.atlassian.com/avatar/atlassian",
        ownerUrl: "https://bitbucket.org/atlassian",
        name: "awesome-app",
        fullName: "atlassian/awesome-app",
        description: "An awesome app built on Bitbucket",
        url: "https://bitbucket.org/atlassian/awesome-app",
        homepage: null,
        primaryLanguage: {
          name: "typescript",
          color: null,
        },
        topics: [],
        license: null,
        stars: 0,
        forks: 0,
        watchers: 0,
        openIssues: 0,
        archived: false,
        fork: false,
        defaultBranch: "main",
        createdAt: "2023-05-10T12:00:00.000Z",
        updatedAt: "2024-01-20T15:30:00.000Z",
        pushedAt: "2024-01-20T15:30:00.000Z",
        size: 200,
        visibility: "public",
        readme: null,
      });
    });

    it("handles minimal repository object with fallback values", () => {
      const minimalRepo: BitbucketRepository = {
        type: "repository",
        uuid: "{min-uuid}",
        name: "minimal-repo",
        full_name: "user/minimal-repo",
        slug: "minimal-repo",
        is_private: true,
        created_on: "2024-01-01T00:00:00.000Z",
        updated_on: "2024-01-01T00:00:00.000Z",
        owner: {},
        links: {
          html: { href: "https://bitbucket.org/user/minimal-repo" },
        },
      };

      const repo = normalizeBitbucketRepository(minimalRepo, "user");
      expect(repo.id).toBe("{min-uuid}");
      expect(repo.provider).toBe("bitbucket");
      expect(repo.owner).toBe("user");
      expect(repo.visibility).toBe("private");
      expect(repo.primaryLanguage).toBeNull();
      expect(repo.size).toBe(0);
    });
  });

  describe("exportBitbucketRepositories API fetching", () => {
    beforeEach(() => {
      vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("throws error if username is empty", async () => {
      await expect(exportBitbucketRepositories("  ")).rejects.toThrow("A Bitbucket username is required.");
    });

    it("fetches repositories with pagination and token", async () => {
      const page1Response = {
        pagelen: 1,
        next: "https://api.bitbucket.org/2.0/repositories/atlassian?page=2&pagelen=100",
        values: [sampleBitbucketRepo],
      };
      const page2Response = {
        pagelen: 1,
        values: [],
      };

      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => page1Response,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => page2Response,
        });

      vi.stubGlobal("fetch", mockFetch);

      const repos = await exportBitbucketRepositories("atlassian", { token: "secret-token" });

      expect(repos).toHaveLength(1);
      expect(repos[0]?.fullName).toBe("atlassian/awesome-app");
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        "https://api.bitbucket.org/2.0/repositories/atlassian?pagelen=100",
        {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer secret-token",
          },
        },
      );
    });

    it("handles 404 error", async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });
      vi.stubGlobal("fetch", mockFetch);

      await expect(exportBitbucketRepositories("unknown_user")).rejects.toThrow(
        'Bitbucket user or workspace "unknown_user" not found.',
      );
    });
  });
});
