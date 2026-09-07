import { nanoid } from "nanoid";
import type { LogContext } from "./types";

const SESSION_KEY = "o2-session-id";

let extraContext: Partial<LogContext> = {};

const readSessionId = (): string | undefined => {
  if (typeof window === "undefined") return undefined;

  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const sessionId = nanoid(16);
    sessionStorage.setItem(SESSION_KEY, sessionId);
    return sessionId;
  } catch {
    return undefined;
  }
};

const readAuthContext = (): Pick<
  LogContext,
  "tenantCode" | "userId" | "username" | "fullName" | "email" | "employeeCode" | "projectCode"
> => {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const state = parsed?.state ?? {};
    const user = state.user ?? {};
    const profile = state.userProfile ?? {};

    return {
      tenantCode: state.tenant?.code,
      userId: user.id || profile.id || profile.keycloak_user_id,
      username: user.username || profile.keycloak_username,
      fullName: user.fullName || profile.fullname,
      email: user.email || profile.email,
      employeeCode: profile.employee_code,
      projectCode: state.project?.code || state.selectedProject?.code,
    };
  } catch {
    return {};
  }
};

export const setLogContext = (partial: Partial<LogContext>): void => {
  extraContext = { ...extraContext, ...partial };
};

export const getLogContext = (): LogContext => {
  return {
    ...readAuthContext(),
    ...extraContext,
    path: typeof window !== "undefined" ? window.location.pathname : undefined,
    sessionId: readSessionId(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
  };
};

export const getSessionId = (): string | undefined => readSessionId();
