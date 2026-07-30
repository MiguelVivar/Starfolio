/**
 * Fetches one page (100) of a user's starred repositories, newest star first, plus the
 * caller's current rate-limit status so the pagination loop can pace or abort itself.
 */
export const STARRED_REPOSITORIES_QUERY = /* GraphQL */ `
  query StarredRepositories($login: String!, $cursor: String) {
    user(login: $login) {
      starredRepositories(
        first: 100
        after: $cursor
        orderBy: { field: STARRED_AT, direction: DESC }
      ) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          name
          nameWithOwner
          description
          url
          homepageUrl
          isArchived
          isFork
          visibility
          stargazerCount
          forkCount
          diskUsage
          createdAt
          updatedAt
          pushedAt
          defaultBranchRef {
            name
          }
          primaryLanguage {
            name
            color
          }
          licenseInfo {
            key
            name
            spdxId
          }
          repositoryTopics(first: 20) {
            nodes {
              topic {
                name
              }
            }
          }
          watchers {
            totalCount
          }
          issues(states: OPEN) {
            totalCount
          }
          owner {
            login
            avatarUrl
            url
          }
        }
      }
    }
    rateLimit {
      remaining
      resetAt
      cost
      limit
    }
  }
`;
