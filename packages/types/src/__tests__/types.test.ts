import { describe, expect, it } from "vitest";
import type { Repository } from "../repository";
import {
  providerSchema,
  repositoryLanguageSchema,
  repositoryLicenseSchema,
  repositorySchema,
  visibilitySchema,
} from "../index";

const validRepo: Repository = {
  id: "R_kgDOH12345",
  provider: "github",
  owner: "octocat",
  ownerAvatar: "https://github.com/images/error/octocat_happy.gif",
  ownerUrl: "https://github.com/octocat",
  name: "Hello-World",
  fullName: "octocat/Hello-World",
  description: "This your first repo!",
  url: "https://github.com/octocat/Hello-World",
  homepage: "https://github.com",
  primaryLanguage: {
    name: "C",
    color: "#555555",
  },
  topics: ["octocat", "atom", "github"],
  license: {
    key: "mit",
    name: "MIT License",
    spdxId: "MIT",
  },
  stars: 80,
  forks: 20,
  watchers: 80,
  openIssues: 0,
  archived: false,
  fork: false,
  defaultBranch: "master",
  createdAt: "2011-01-26T19:01:12Z",
  updatedAt: "2026-01-26T19:14:43Z",
  pushedAt: "2026-01-26T19:06:43Z",
  size: 108,
  visibility: "public",
  readme: null,
};

describe("Zod domain schemas validation", () => {
  it("validates provider enum schema", () => {
    expect(providerSchema.safeParse("github").success).toBe(true);
    expect(providerSchema.safeParse("gitlab").success).toBe(false);
  });

  it("validates visibility enum schema", () => {
    expect(visibilitySchema.safeParse("public").success).toBe(true);
    expect(visibilitySchema.safeParse("private").success).toBe(true);
    expect(visibilitySchema.safeParse("internal").success).toBe(false);
  });

  it("validates repository language schema", () => {
    const validLang = { name: "TypeScript", color: "#3178c6" };
    const nullColorLang = { name: "Unknown", color: null };
    expect(repositoryLanguageSchema.safeParse(validLang).success).toBe(true);
    expect(repositoryLanguageSchema.safeParse(nullColorLang).success).toBe(true);
    expect(repositoryLanguageSchema.safeParse({ name: 123 }).success).toBe(false);
  });

  it("validates repository license schema", () => {
    const validLic = { key: "mit", name: "MIT License", spdxId: "MIT" };
    const nullSpdxLic = { key: "custom", name: "Custom", spdxId: null };
    expect(repositoryLicenseSchema.safeParse(validLic).success).toBe(true);
    expect(repositoryLicenseSchema.safeParse(nullSpdxLic).success).toBe(true);
  });

  it("validates full Repository domain model schema", () => {
    const result = repositorySchema.safeParse(validRepo);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fullName).toBe("octocat/Hello-World");
    }
  });

  it("rejects repository model with invalid negative stars field", () => {
    const invalidRepo = { ...validRepo, stars: -5 };
    const result = repositorySchema.safeParse(invalidRepo);
    expect(result.success).toBe(false);
  });

  it("rejects repository model with invalid provider", () => {
    const invalidRepo = { ...validRepo, provider: "bitbucket" };
    const result = repositorySchema.safeParse(invalidRepo);
    expect(result.success).toBe(false);
  });
});
