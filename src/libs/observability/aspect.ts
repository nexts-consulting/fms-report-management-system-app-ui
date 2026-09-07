import { logger } from "./logger";
import { sanitizeArgs } from "./redact";
import type { AspectAdvice } from "./types";

const isPromiseLike = (value: unknown): value is Promise<unknown> => {
  return !!value && typeof (value as { then?: unknown }).then === "function";
};

const durationMs = (start: number): number => Math.round(performance.now() - start);

/**
 * Around advice — wraps a join point (function) with before/after/throw logging.
 * This is the core AOP primitive used by `logged()`, `@Logged`, and `weaveObject()`.
 */
export const around = <T extends (...args: any[]) => any>(joinPoint: T, advice: AspectAdvice): T => {
  const wrapped = function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
    const start = performance.now();
    const extra: Record<string, unknown> = { joinPoint: advice.name };
    if (advice.logArgs) extra.args = sanitizeArgs(args);

    const onSuccess = (result: unknown) => {
      if (advice.logResult) extra.result = result;
      logger.emit({
        level: advice.level || "info",
        message: `${advice.name} completed`,
        category: advice.category || "aspect",
        extra: { ...extra, durationMs: durationMs(start), ok: true },
      });
      return result;
    };

    const onError = (error: unknown): never => {
      logger.error(
        `${advice.name} failed`,
        error,
        { ...extra, durationMs: durationMs(start), ok: false },
        advice.category || "aspect",
      );
      throw error;
    };

    try {
      const result = joinPoint.apply(this, args);
      if (isPromiseLike(result)) {
        return result.then(onSuccess, onError) as ReturnType<T>;
      }
      return onSuccess(result) as ReturnType<T>;
    } catch (error) {
      return onError(error);
    }
  };

  Object.defineProperty(wrapped, "name", { value: joinPoint.name || advice.name, configurable: true });
  return wrapped as T;
};

/**
 * Higher-order function aspect for plain service functions.
 *
 * @example
 * export const httpRequestGetTenants = logged(async () => { ... }, "httpRequestGetTenants");
 */
export const logged = <T extends (...args: any[]) => any>(
  fn: T,
  name?: string,
  advice?: Omit<AspectAdvice, "name">,
): T => {
  return around(fn, { name: name || fn.name || "anonymous", ...advice });
};

/**
 * Native TypeScript 5 method decorator (no experimentalDecorators required).
 *
 * @example
 * class TenantService {
 *   @Logged({ category: "http" })
 *   async getTenants() { ... }
 * }
 */
export function Logged(advice?: Omit<AspectAdvice, "name">) {
  return function <This, Args extends unknown[], Return>(
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
  ) {
    const name = String(context.name);
    return around(target as (...args: any[]) => Return, { name, ...advice });
  };
}

/**
 * Weaves every function on an object with around advice (Proxy-based AOP).
 *
 * @example
 * export const tenantApi = weaveObject({ httpRequestGetTenants, httpRequestGetTenantByCode }, "tenants");
 */
export const weaveObject = <T extends object>(target: T, prefix: string, advice?: Omit<AspectAdvice, "name">): T => {
  return new Proxy(target, {
    get(obj, prop, receiver) {
      const value = Reflect.get(obj, prop, receiver);
      if (typeof value !== "function") return value;
      const name = `${prefix}.${String(prop)}`;
      return around((value as (...args: any[]) => any).bind(obj), { name, ...advice });
    },
  });
};
