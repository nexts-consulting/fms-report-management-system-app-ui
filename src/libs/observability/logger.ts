import { getLogContext } from "./context";
import { getObservabilityConfig, shouldLogLevel } from "./config";
import type { LogCategory, LogEvent, LogLevel, LogSink, SerializedError } from "./types";

const BATCH_SIZE = 20;
const FLUSH_MS = 2000;

const serializeError = (error: unknown): SerializedError | undefined => {
  if (error == null) return undefined;

  if (error instanceof Error) {
    const extra = error as Error & { code?: string | number };
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: extra.code,
    };
  }

  if (typeof error === "object") {
    const err = error as Record<string, unknown>;
    return {
      name: typeof err.name === "string" ? err.name : "Error",
      message: typeof err.message === "string" ? err.message : JSON.stringify(err).slice(0, 500),
      code: typeof err.code === "string" || typeof err.code === "number" ? err.code : undefined,
    };
  }

  return { message: String(error) };
};

const createConsoleSink = (): LogSink => ({
  name: "console",
  write: (event) => {
    if (process.env.NODE_ENV === "production" && event.level !== "warn" && event.level !== "error") {
      return;
    }
    const payload = {
      category: event.category,
      context: event.context,
      http: event.http,
      error: event.error,
      extra: event.extra,
    };
    const prefix = `[O2:${event.category}]`;
    if (event.level === "error") console.error(prefix, event.message, payload);
    else if (event.level === "warn") console.warn(prefix, event.message, payload);
    else if (event.level === "debug") console.debug(prefix, event.message, payload);
    else console.info(prefix, event.message, payload);
  },
});

const createHttpSink = (proxyPath: string): LogSink => {
  let buffer: LogEvent[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = (useBeacon = false): Promise<void> => {
    if (typeof window === "undefined") return Promise.resolve();
    if (buffer.length === 0) return Promise.resolve();

    const batch = buffer;
    buffer = [];
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    const body = JSON.stringify(batch);
    const send = () =>
      fetch(proxyPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).then(() => undefined)
        .catch(() => undefined);

    if (
      useBeacon &&
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function" &&
      body.length < 60_000
    ) {
      const blob = new Blob([body], { type: "application/json" });
      const queued = navigator.sendBeacon(proxyPath, blob);
      if (!queued) return send();
      return Promise.resolve();
    }

    return send();
  };

  const schedule = () => {
    if (timer) return;
    timer = setTimeout(() => {
      void flush(false);
    }, FLUSH_MS);
  };

  if (typeof window !== "undefined") {
    window.addEventListener("pagehide", () => {
      void flush(true);
    });
    window.addEventListener("beforeunload", () => {
      void flush(true);
    });
  }

  return {
    name: "openobserve-http",
    write: (event) => {
      buffer.push(event);
      if (buffer.length >= BATCH_SIZE) void flush(false);
      else schedule();
    },
    flush: () => flush(false),
  };
};

class ObservabilityLogger {
  private sinks: LogSink[] = [createConsoleSink()];
  private service: string;
  private inited = false;
  private httpSink: LogSink | null = null;

  constructor() {
    this.service = getObservabilityConfig().service;
  }

  init(options?: { service?: string; version?: string }): void {
    if (typeof window === "undefined") return;

    const config = getObservabilityConfig();
    this.service = options?.service || this.service || config.service;

    if (config.remoteEnabled && !this.httpSink) {
      this.httpSink = createHttpSink(config.proxyPath);
      this.sinks.push(this.httpSink);
    }

    if (this.inited) return;
    this.inited = true;

    if (config.remoteEnabled && config.clientToken && config.site) {
      void this.initOpenObserveSdk(config);
    }
  }

  private async initOpenObserveSdk(config: ReturnType<typeof getObservabilityConfig>): Promise<void> {
    try {
      const { openobserveLogs } = await import("@openobserve/browser-logs");
      openobserveLogs.init({
        clientToken: config.clientToken as string,
        site: config.site as string,
        organizationIdentifier: config.org,
        service: this.service,
        env: config.env,
        version: config.version,
        forwardErrorsToLogs: true,
        sessionSampleRate: 100,
        insecureHTTP: config.insecureHTTP,
      });
      this.sinks.push({
        name: "openobserve-sdk",
        write: (event) => {
          const extra = {
            category: event.category,
            context: event.context,
            http: event.http,
            extra: event.extra,
          };
          if (event.level === "error") {
            openobserveLogs.logger.error(event.message, extra);
          } else if (event.level === "warn") {
            openobserveLogs.logger.warn(event.message, extra);
          } else if (event.level === "debug") {
            openobserveLogs.logger.debug(event.message, extra);
          } else {
            openobserveLogs.logger.info(event.message, extra);
          }
        },
      });
    } catch (error) {
      console.warn("[O2] Failed to init OpenObserve browser SDK", error);
    }
  }

  emit(partial: {
    level: LogLevel;
    message: string;
    category?: LogCategory;
    http?: LogEvent["http"];
    error?: unknown;
    extra?: Record<string, unknown>;
  }): void {
    const config = getObservabilityConfig();
    if (!shouldLogLevel(partial.level, config.logLevel)) return;

    const context = getLogContext();
    const event: LogEvent = {
      timestamp: new Date().toISOString(),
      level: partial.level,
      message: partial.message,
      category: partial.category || "app",
      service: this.service,
      env: config.env,
      version: config.version,
      action: typeof partial.extra?.action === "string" ? partial.extra.action : undefined,
      actorUserId: context.userId,
      actorUsername: context.username,
      actorFullName: context.fullName,
      actorEmail: context.email,
      actorEmployeeCode: context.employeeCode,
      tenantCode: context.tenantCode,
      projectCode: context.projectCode,
      context,
      http: partial.http,
      error: serializeError(partial.error),
      extra: partial.extra,
    };

    for (const sink of this.sinks) {
      try {
        sink.write(event);
      } catch {
        // Never let logging break the app.
      }
    }
  }

  debug(message: string, extra?: Record<string, unknown>, category: LogCategory = "app"): void {
    this.emit({ level: "debug", message, extra, category });
  }

  info(message: string, extra?: Record<string, unknown>, category: LogCategory = "app"): void {
    this.emit({ level: "info", message, extra, category });
  }

  warn(message: string, extra?: Record<string, unknown>, category: LogCategory = "app"): void {
    this.emit({ level: "warn", message, extra, category });
  }

  error(
    message: string,
    error?: unknown,
    extra?: Record<string, unknown>,
    category: LogCategory = "app",
  ): void {
    this.emit({ level: "error", message, error, extra, category });
  }

  flush(): Promise<void> {
    return Promise.resolve(this.httpSink?.flush?.());
  }
}

export const logger = new ObservabilityLogger();
export { serializeError };
