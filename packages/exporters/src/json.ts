import type { Repository } from "@starfolio/types";

export function toJson(repositories: readonly Repository[]): string {
  return JSON.stringify(repositories, null, 2);
}
