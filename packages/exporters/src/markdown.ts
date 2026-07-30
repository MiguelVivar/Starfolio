import type { Repository } from "@starfolio/types";

function escapeCell(value: string): string {
  return value.replace(/\|/g, "\|").replace(/\r?\n/g, " ");
}

export function toMarkdown(repositories: readonly Repository[]): string {
  const header = "| Repository | Stars | Forks | Language | License | Description |";
  const divider = "| --- | ---: | ---: | --- | --- | --- |";
  const rows = repositories.map((repo) => {
    const description = escapeCell(repo.description ?? "");
    const license = repo.license?.spdxId ?? repo.license?.name ?? "—";
    const language = repo.primaryLanguage?.name ?? "—";
    return `| [${repo.fullName}](${repo.url}) | ${repo.stars} | ${repo.forks} | ${language} | ${license} | ${description} |`;
  });
  return [header, divider, ...rows].join("\n");
}
