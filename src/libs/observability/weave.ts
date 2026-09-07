import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { getSessionId } from "./context";
import { logger } from "./logger";
import { isObservabilityUrl, sanitizeUrl } from "./redact";

type ObservedConfig = InternalAxiosRequestConfig & {
  __o2?: { start: number };
};

const CORRELATION_HEADER = "x-correlation-id";

const resolveUrl = (config?: InternalAxiosRequestConfig): string | undefined => {
  if (!config) return undefined;
  const base = config.baseURL || "";
  const path = config.url || "";
  if (!base) return path;
  if (!path) return base;
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
};

const logHttp = (
  config: InternalAxiosRequestConfig | undefined,
  status: number | undefined,
  ok: boolean,
  error?: unknown,
): void => {
  const url = sanitizeUrl(resolveUrl(config));
  if (isObservabilityUrl(url)) return;

  const start = (config as ObservedConfig | undefined)?.__o2?.start;
  logger.emit({
    level: ok ? "debug" : "error",
    message: ok ? `HTTP ${config?.method?.toUpperCase() || "GET"} ${url}` : `HTTP failed ${config?.method?.toUpperCase() || "GET"} ${url}`,
    category: "http",
    http: {
      method: config?.method?.toUpperCase(),
      url,
      status,
      durationMs: start ? Math.round(performance.now() - start) : undefined,
      ok,
      transport: "axios",
    },
    error,
  });
};

export const weaveAxios = (instance: AxiosInstance): AxiosInstance => {
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const observed = config as ObservedConfig;
    observed.__o2 = { start: performance.now() };
    const sessionId = getSessionId();
    if (sessionId && !observed.headers[CORRELATION_HEADER]) {
      observed.headers[CORRELATION_HEADER] = sessionId;
    }
    return observed;
  });

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      logHttp(response.config, response.status, true);
      return response;
    },
    (error: AxiosError) => {
      logHttp(error.config, error.response?.status, false, error);
      return Promise.reject(error);
    },
  );

  return instance;
};

export const createObservedFetch = (baseFetch: typeof fetch = fetch): typeof fetch => {
  const observedFetch: typeof fetch = async (input, init) => {
    const method = init?.method || (input instanceof Request ? input.method : "GET");
    const rawUrl = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const url = sanitizeUrl(rawUrl);
    if (isObservabilityUrl(url)) {
      return baseFetch(input, init);
    }

    const start = performance.now();
    const sessionId = getSessionId();
    const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
    if (sessionId && !headers.has(CORRELATION_HEADER)) {
      headers.set(CORRELATION_HEADER, sessionId);
    }

    try {
      const response = await baseFetch(input, { ...init, headers });
      logger.emit({
        level: response.ok ? "debug" : "error",
        message: response.ok ? `HTTP ${method} ${url}` : `HTTP failed ${method} ${url}`,
        category: "http",
        http: {
          method,
          url,
          status: response.status,
          durationMs: Math.round(performance.now() - start),
          ok: response.ok,
          transport: "fetch",
        },
      });
      return response;
    } catch (error) {
      logger.emit({
        level: "error",
        message: `HTTP failed ${method} ${url}`,
        category: "http",
        http: {
          method,
          url,
          durationMs: Math.round(performance.now() - start),
          ok: false,
          transport: "fetch",
        },
        error,
      });
      throw error;
    }
  };

  return observedFetch;
};
