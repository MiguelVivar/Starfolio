import { describe, expect, it } from "vitest";
import type { Repository } from "@starfolio/types";
import { exportToFormat } from "../export-to-format";
import { toCsv } from "../csv";
import { toJson } from "../json";
import { toMarkdown } from "../markdown";
import { toXlsx } from "../xlsx";
import { toRow } from "../rows";

const mockRepo1: Repository = {
  id: "repo-1",
  provider: "github",
  owner: "facebook",
  ownerAvatar: "https://avatars.githubusercontent.com/u/69631",
  ownerUrl: "https://github.com/facebook",
  name: "react",
  fullName: "facebook/react",
  description: "The library for web and native user interfaces.",
  url: "https://github.com/facebook/react",
  homepage: "https://react.dev",
  primaryLanguage: { name: "JavaScript", color: "#f1e05a" },
  topics: ["react", "frontend", "ui"],
  license: { key: "mit", name: "MIT License", spdxId: "MIT" },
  stars: 220000,
  forks: 45000,
  watchers: 6700,
  openIssues: 1200,
  archived: false,
  fork: false,
  defaultBranch: "main",
  createdAt: "2013-05-24T16:15:54Z",
  updatedAt: "2026-08-01T12:00:00Z",
  pushedAt: "2026-08-01T10:00:00Z",
  size: 150000,
  visibility: "public",
  readme: null,
};

const mockRepo2: Repository = {
  id: "repo-2",
  provider: "github",
  owner: "vercel",
  ownerAvatar: "https://avatars.githubusercontent.com/u/14985020",
  ownerUrl: "https://github.com/vercel",
  name: "next.js",
  fullName: "vercel/next.js",
  description: null,
  url: "https://github.com/vercel/next.js",
  homepage: null,
  primaryLanguage: null,
  topics: [],
  license: null,
  stars: 120000,
  forks: 25000,
  watchers: 1500,
  openIssues: 2000,
  archived: false,
  fork: false,
  defaultBranch: "canary",
  createdAt: "2016-10-05T23:32:51Z",
  updatedAt: "2026-08-01T11:00:00Z",
  pushedAt: null,
  size: 85000,
  visibility: "public",
  readme: null,
};

const mockRepositories: readonly Repository[] = [mockRepo1, mockRepo2];

describe("toRow", () => {
  it("flattens a Repository into a RepositoryRow", () => {
    const row1 = toRow(mockRepo1);
    expect(row1.fullName).toBe("facebook/react");
    expect(row1.description).toBe("The library for web and native user interfaces.");
    expect(row1.language).toBe("JavaScript");
    expect(row1.topics).toBe("react;frontend;ui");
    expect(row1.license).toBe("MIT License");
    expect(row1.stars).toBe(220000);

    const row2 = toRow(mockRepo2);
    expect(row2.fullName).toBe("vercel/next.js");
    expect(row2.description).toBe("");
    expect(row2.language).toBe("");
    expect(row2.topics).toBe("");
    expect(row2.license).toBe("");
    expect(row2.pushedAt).toBe("");
  });
});

describe("toMarkdown", () => {
  it("generates markdown table header and formatted rows", () => {
    const markdown = toMarkdown(mockRepositories);
    expect(markdown).toContain("| Repository | Stars | Forks | Language | License | Description |");
    expect(markdown).toContain("| [facebook/react](https://github.com/facebook/react) | 220000 | 45000 | JavaScript | MIT | The library for web and native user interfaces. |");
    expect(markdown).toContain("| [vercel/next.js](https://github.com/vercel/next.js) | 120000 | 25000 | — | — |  |");
  });
});

describe("toCsv", () => {
  it("generates CSV string with headers and correctly escaped cells", () => {
    const csv = toCsv(mockRepositories);
    const lines = csv.split("\r\n");
    expect(lines[0]).toBe("fullName,description,url,homepage,language,topics,license,stars,forks,watchers,openIssues,archived,fork,visibility,sizeKb,createdAt,updatedAt,pushedAt");
    expect(lines[1]).toContain("facebook/react");
    expect(lines[1]).toContain("JavaScript");
    expect(lines[2]).toContain("vercel/next.js");
  });

  it("handles empty repository list", () => {
    const csv = toCsv([]);
    expect(csv).toBe("fullName,description,url,homepage,language,topics,license,stars,forks,watchers,openIssues,archived,fork,visibility,sizeKb,createdAt,updatedAt,pushedAt");
  });
});

describe("toJson", () => {
  it("serializes repositories to formatted JSON string", () => {
    const jsonStr = toJson(mockRepositories);
    const parsed = JSON.parse(jsonStr);
    expect(parsed).toEqual(mockRepositories);
  });
});

describe("toXlsx", () => {
  it("generates a Uint8Array containing valid XLSX binary content", () => {
    const xlsxBuffer = toXlsx(mockRepositories);
    expect(xlsxBuffer).toBeInstanceOf(Uint8Array);
    expect(xlsxBuffer.length).toBeGreaterThan(0);
  });
});

describe("exportToFormat", () => {
  it("exports repositories as CSV", () => {
    const result = exportToFormat(mockRepositories, "csv", "my-stars");
    expect(result.filename).toBe("my-stars.csv");
    expect(result.mimeType).toBe("text/csv");
    expect(typeof result.content).toBe("string");
    expect(result.content as string).toContain("facebook/react");
  });

  it("exports repositories as JSON", () => {
    const result = exportToFormat(mockRepositories, "json", "my-stars");
    expect(result.filename).toBe("my-stars.json");
    expect(result.mimeType).toBe("application/json");
    expect(typeof result.content).toBe("string");
    expect(JSON.parse(result.content as string)).toHaveLength(2);
  });

  it("exports repositories as Markdown", () => {
    const result = exportToFormat(mockRepositories, "markdown", "my-stars");
    expect(result.filename).toBe("my-stars.md");
    expect(result.mimeType).toBe("text/markdown");
    expect(typeof result.content).toBe("string");
    expect(result.content as string).toContain("| Repository | Stars |");
  });

  it("exports repositories as XLSX", () => {
    const result = exportToFormat(mockRepositories, "xlsx", "my-stars");
    expect(result.filename).toBe("my-stars.xlsx");
    expect(result.mimeType).toBe("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    expect(result.content).toBeInstanceOf(Uint8Array);
  });
});
