import { logger } from "./logger";
import { weaveWindowErrors } from "./errors";
import type { ObservabilityInitOptions } from "./types";

let initialized = false;

export const initObservability = (options: ObservabilityInitOptions): void => {
  if (typeof window === "undefined") return;

  logger.init(options);

  if (initialized) return;
  initialized = true;

  weaveWindowErrors();
  logger.info("Observability initialized", { service: options.service }, "app");
};
