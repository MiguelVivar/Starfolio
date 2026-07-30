export type ExporterErrorCode =
  | "INVALID_USERNAME"
  | "USER_NOT_FOUND"
  | "AUTH_FAILED"
  | "RATE_LIMITED"
  | "GITHUB_API_ERROR"
  | "NETWORK_ERROR";

/** Typed error for every failure mode `exportRepositories` can produce, so callers can branch on `.code` instead of parsing message strings. */
export class ExporterError extends Error {
  readonly code: ExporterErrorCode;

  constructor(code: ExporterErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.code = code;
    this.name = "ExporterError";
  }
}

export function isExporterError(error: unknown): error is ExporterError {
  return error instanceof ExporterError;
}
