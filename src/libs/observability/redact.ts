const SENSITIVE_KEY = /^(authorization|cookie|set-cookie|x-apikey|api[-_]?key|token|access[-_]?token|refresh[-_]?token|id[-_]?token|password|secret|passwd)$/i;

const SENSITIVE_QUERY = /(token|password|secret|key|auth|code)/i;

const MAX_URL_LENGTH = 500;

export const redactValue = (key: string, value: unknown): unknown => {
  if (SENSITIVE_KEY.test(key)) return "[REDACTED]";
  return value;
};

export const sanitizeUrl = (rawUrl: string | undefined): string | undefined => {
  if (!rawUrl) return undefined;

  try {
    const isAbsolute = /^https?:\/\//i.test(rawUrl);
    const url = isAbsolute
      ? new URL(rawUrl)
      : new URL(rawUrl, typeof window !== "undefined" ? window.location.origin : "http://localhost");

    url.searchParams.forEach((value, key) => {
      if (SENSITIVE_QUERY.test(key)) {
        url.searchParams.set(key, "[REDACTED]");
      }
    });

    const result = isAbsolute ? url.toString() : `${url.pathname}${url.search}`;
    return result.length > MAX_URL_LENGTH ? `${result.slice(0, MAX_URL_LENGTH)}…` : result;
  } catch {
    return rawUrl.length > MAX_URL_LENGTH ? `${rawUrl.slice(0, MAX_URL_LENGTH)}…` : rawUrl;
  }
};

export const sanitizeArgs = (args: unknown[]): unknown[] => {
  return args.map((arg) => sanitizeUnknown(arg, 0));
};

const sanitizeUnknown = (value: unknown, depth: number): unknown => {
  if (depth > 2) return "[Truncated]";
  if (value == null) return value;
  if (typeof value !== "object") return value;

  if (Array.isArray(value)) {
    return value.slice(0, 10).map((item) => sanitizeUnknown(item, depth + 1));
  }

  const output: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    output[key] = redactValue(key, sanitizeUnknown(nested, depth + 1));
  }
  return output;
};

export const isObservabilityUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  return url.includes("/api/observability/logs") || url.includes("openobserve");
};
