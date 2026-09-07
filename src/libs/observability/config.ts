import type { LogLevel } from "./types";

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const readEnv = (key: string): string | undefined => {
  const value = process.env[key];
  if (!value || value.trim().length === 0) return undefined;
  return value.trim();
};

export const OPENOBSERVE_DEFAULTS = {
  url: "https://ap1.openobserve.ai",
  site: "ap1.openobserve.ai",
  org: "3J06iIYdw0NGSAOjNpBQNsR6rHo",
};

export const getObservabilityConfig = () => {
  const env = readEnv("NEXT_PUBLIC_APP_ENV") || process.env.NODE_ENV || "development";
  const logLevel = (readEnv("NEXT_PUBLIC_LOG_LEVEL") as LogLevel | undefined) ||
    (env === "production" ? "info" : "debug");

  return {
    env,
    logLevel,
    service: readEnv("NEXT_PUBLIC_O2_SERVICE") || "fms-app-ui",
    version: readEnv("NEXT_PUBLIC_APP_VERSION") || "1.0.0",
    remoteEnabled: readEnv("NEXT_PUBLIC_OPENOBSERVE_ENABLED") === "true",
    site: readEnv("NEXT_PUBLIC_OPENOBSERVE_SITE") || OPENOBSERVE_DEFAULTS.site,
    org: readEnv("NEXT_PUBLIC_OPENOBSERVE_ORG") || OPENOBSERVE_DEFAULTS.org,
    clientToken: readEnv("NEXT_PUBLIC_OPENOBSERVE_CLIENT_TOKEN"),
    insecureHTTP: readEnv("NEXT_PUBLIC_OPENOBSERVE_INSECURE_HTTP") === "true",
    proxyPath: "/api/observability/logs",
  };
};

export const shouldLogLevel = (level: LogLevel, minLevel: LogLevel): boolean => {
  return LEVEL_RANK[level] >= LEVEL_RANK[minLevel];
};
