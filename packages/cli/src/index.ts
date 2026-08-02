#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  generateExport,
  type ExportFormat,
  type ExportResult,
} from "@starfolio/exporters";
import { ExporterError, exportRepositories } from "@starfolio/github-exporter";
import type { Repository } from "@starfolio/types";
import { Command } from "commander";

interface CliOptions {
  readonly format?: string | undefined;
  readonly output?: string | undefined;
  readonly token?: string | undefined;
}

const VALID_FORMATS = new Set<string>(["json", "csv", "markdown", "md", "xlsx"]);

function normalizeFormat(inputFormat: string): ExportFormat {
  const normalized = inputFormat.toLowerCase().trim();
  if (!VALID_FORMATS.has(normalized)) {
    throw new Error(
      `Invalid format "${inputFormat}". Supported formats are: json, csv, md (markdown), xlsx.`,
    );
  }
  return normalized === "md" ? "markdown" : (normalized as ExportFormat);
}

async function runCli(username: string, options: CliOptions): Promise<void> {
  const formatInput = options.format ?? "json";
  const format = normalizeFormat(formatInput);
  const token = options.token ?? process.env.GITHUB_TOKEN;

  console.log(`Fetching starred repositories for @${username}...`);

  let repoCount = 0;
  const repositories: Repository[] = await exportRepositories(username, {
    token,
    onProgress: (fetched, _total) => {
      repoCount = fetched;
      if (process.stdout.isTTY) {
        process.stdout.write(`\rFetched ${fetched} repositories...`);
      }
    },
  });

  if (process.stdout.isTTY && repoCount > 0) {
    process.stdout.write("\n");
  }

  console.log(`Found ${repositories.length} starred repositories.`);
  console.log(`Generating ${format} export...`);

  const exportResult: ExportResult = generateExport(repositories, format);

  const outputPath = options.output;

  if (outputPath === "-" || outputPath === "stdout") {
    if (typeof exportResult.content === "string") {
      process.stdout.write(exportResult.content);
    } else {
      process.stdout.write(Buffer.from(exportResult.content));
    }
    return;
  }

  const targetPath = outputPath
    ? resolve(process.cwd(), outputPath)
    : resolve(process.cwd(), exportResult.filename);

  mkdirSync(dirname(targetPath), { recursive: true });

  if (typeof exportResult.content === "string") {
    writeFileSync(targetPath, exportResult.content, "utf8");
  } else {
    writeFileSync(targetPath, Buffer.from(exportResult.content));
  }

  console.log(`✓ Export complete! Saved to ${targetPath}`);
}

const program = new Command();

program
  .name("starfolio")
  .description("CLI tool to export GitHub starred repositories into CSV, JSON, Markdown, or Excel")
  .version("1.0.0")
  .argument("<username>", "GitHub username to export stars for")
  .option("-f, --format <format>", "Export format: json | csv | md | xlsx", "json")
  .option("-o, --output <path>", "Output file path (or '-' for stdout)")
  .option("-t, --token <token>", "Custom GitHub Personal Access Token")
  .action(async (username: string, options: CliOptions) => {
    try {
      await runCli(username, options);
    } catch (err: unknown) {
      if (err instanceof ExporterError) {
        console.error(`\nError [${err.code}]: ${err.message}`);
      } else if (err instanceof Error) {
        console.error(`\nError: ${err.message}`);
      } else {
        console.error(`\nAn unknown error occurred:`, err);
      }
      process.exit(1);
    }
  });

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error("CLI Execution Error:", err);
  process.exit(1);
});
