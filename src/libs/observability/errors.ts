import { logger } from "./logger";

let windowWeaved = false;

export const weaveWindowErrors = (): void => {
  if (windowWeaved || typeof window === "undefined") return;
  windowWeaved = true;

  window.addEventListener("error", (event) => {
    logger.error("Unhandled window error", event.error || event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    }, "ui");
  });

  window.addEventListener("unhandledrejection", (event) => {
    logger.error("Unhandled promise rejection", event.reason, undefined, "ui");
  });
};

export const logRenderError = (
  error: unknown,
  errorInfo?: { componentStack?: string | null },
): void => {
  logger.error(
    "Unhandled render error",
    error,
    { componentStack: errorInfo?.componentStack ?? undefined },
    "ui",
  );
};

export const logQueryError = (error: unknown, source: "query" | "mutation"): void => {
  logger.error(`React Query ${source} error`, error, { source }, "query");
};
