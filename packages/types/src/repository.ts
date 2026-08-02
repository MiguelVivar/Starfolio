import { z } from "zod";

/** Source-control provider a Repository was fetched from. Only "github" is implemented today;
 * the literal union exists so a future gitlab/bitbucket exporter shares this same type. */
export type Provider = "github";

export type Visibility = "public" | "private";

export const providerSchema = z.literal("github");
export const visibilitySchema = z.enum(["public", "private"]);

export interface RepositoryLanguage {
  readonly name: string;
  /** Hex color GitHub associates with the language, when known. */
  readonly color: string | null;
}

export const repositoryLanguageSchema = z.object({
  name: z.string(),
  color: z.string().nullable(),
});

export interface RepositoryLicense {
  readonly key: string;
  readonly name: string;
  readonly spdxId: string | null;
}

export const repositoryLicenseSchema = z.object({
  key: z.string(),
  name: z.string(),
  spdxId: z.string().nullable(),
});

/**
 * A single starred repository, normalized to a provider-agnostic shape.
 * This is the contract every exporter (web, future CLI, future SaaS) depends on.
 */
export interface Repository {
  /** Stable identifier from the source provider (GitHub's global node id). */
  readonly id: string;
  readonly provider: Provider;

  readonly owner: string;
  readonly ownerAvatar: string;
  readonly ownerUrl: string;

  readonly name: string;
  /** "{owner}/{name}" */
  readonly fullName: string;
  readonly description: string | null;
  readonly url: string;
  readonly homepage: string | null;

  readonly primaryLanguage: RepositoryLanguage | null;
  readonly topics: readonly string[];
  readonly license: RepositoryLicense | null;

  readonly stars: number;
  readonly forks: number;
  readonly watchers: number;
  readonly openIssues: number;

  readonly archived: boolean;
  readonly fork: boolean;
  readonly defaultBranch: string | null;

  readonly createdAt: string;
  readonly updatedAt: string;
  readonly pushedAt: string | null;

  /** Repository size in kilobytes, as reported by the provider. */
  readonly size: number;
  readonly visibility: Visibility;

  /**
   * Repository README content. Always `null` in v1 — fetching every README adds a GraphQL
   * call per repo and would slow exports for large star lists. The field stays on the type
   * so an on-demand README fetch can be added later without a breaking change.
   */
  readonly readme: string | null;
}

export const repositorySchema = z.object({
  id: z.string(),
  provider: providerSchema,
  owner: z.string(),
  ownerAvatar: z.string(),
  ownerUrl: z.string(),
  name: z.string(),
  fullName: z.string(),
  description: z.string().nullable(),
  url: z.string(),
  homepage: z.string().nullable(),
  primaryLanguage: repositoryLanguageSchema.nullable(),
  topics: z.array(z.string()),
  license: repositoryLicenseSchema.nullable(),
  stars: z.number().nonnegative(),
  forks: z.number().nonnegative(),
  watchers: z.number().nonnegative(),
  openIssues: z.number().nonnegative(),
  archived: z.boolean(),
  fork: z.boolean(),
  defaultBranch: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  pushedAt: z.string().nullable(),
  size: z.number().nonnegative(),
  visibility: visibilitySchema,
  readme: z.string().nullable(),
});
