import { z } from "zod";

/** Runtime validation for GitHub's GraphQL response — an external API boundary, so we
 * never trust the shape blindly even though it's typed upstream. */

const languageSchema = z.object({
  name: z.string(),
  color: z.string().nullable(),
});

const licenseSchema = z.object({
  key: z.string(),
  name: z.string(),
  spdxId: z.string().nullable(),
});

const repositoryNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameWithOwner: z.string(),
  description: z.string().nullable(),
  url: z.string(),
  homepageUrl: z.string().nullable(),
  isArchived: z.boolean(),
  isFork: z.boolean(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "INTERNAL"]),
  stargazerCount: z.number(),
  forkCount: z.number(),
  diskUsage: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  pushedAt: z.string().nullable(),
  defaultBranchRef: z.object({ name: z.string() }).nullable(),
  primaryLanguage: languageSchema.nullable(),
  licenseInfo: licenseSchema.nullable(),
  repositoryTopics: z.object({
    nodes: z.array(z.object({ topic: z.object({ name: z.string() }) })),
  }),
  watchers: z.object({ totalCount: z.number() }),
  issues: z.object({ totalCount: z.number() }),
  owner: z.object({
    login: z.string(),
    avatarUrl: z.string(),
    url: z.string(),
  }),
});

const rateLimitSchema = z.object({
  remaining: z.number(),
  resetAt: z.string(),
  cost: z.number(),
  limit: z.number(),
});

/** GitHub occasionally returns HTTP 200 with this plain envelope instead of the normal
 * `{ data, errors }` GraphQL shape — typically abuse/secondary-rate-limit detection.
 * Checked as a fallback when the main schema doesn't match. */
export const apiMessageSchema = z.object({
  message: z.string(),
  documentation_url: z.string().optional(),
});

export const starredRepositoriesResponseSchema = z.object({
  user: z
    .object({
      starredRepositories: z.object({
        totalCount: z.number(),
        pageInfo: z.object({
          hasNextPage: z.boolean(),
          endCursor: z.string().nullable(),
        }),
        nodes: z.array(repositoryNodeSchema),
      }),
    })
    .nullable(),
  rateLimit: rateLimitSchema,
});

export type RepositoryNode = z.infer<typeof repositoryNodeSchema>;
export type RateLimitInfo = z.infer<typeof rateLimitSchema>;
export type StarredRepositoriesResponse = z.infer<typeof starredRepositoriesResponseSchema>;

export interface StarredRepositoriesConnection {
  readonly totalCount: number;
  readonly pageInfo: {
    readonly hasNextPage: boolean;
    readonly endCursor: string | null;
  };
  readonly nodes: readonly RepositoryNode[];
}

/** A page with `user` already confirmed non-null — the shape `fetchStarredRepositoriesPage` returns. */
export interface StarredRepositoriesPage {
  readonly starredRepositories: StarredRepositoriesConnection;
  readonly rateLimit: RateLimitInfo;
}
