export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogCategory = "http" | "ui" | "query" | "app" | "auth" | "aspect";

export type LogContext = {
  tenantCode?: string;
  userId?: string | number;
  username?: string;
  fullName?: string;
  email?: string;
  employeeCode?: string;
  projectCode?: string;
  path?: string;
  sessionId?: string;
  userAgent?: string;
};

export type HttpLogFields = {
  method?: string;
  url?: string;
  status?: number;
  durationMs?: number;
  ok?: boolean;
  transport?: "axios" | "fetch";
};

export type SerializedError = {
  name?: string;
  message?: string;
  stack?: string;
  code?: string | number;
};

export type LogEvent = {
  timestamp: string;
  level: LogLevel;
  message: string;
  category: LogCategory;
  service: string;
  env: string;
  version?: string;
  action?: string;
  actorUserId?: string | number;
  actorUsername?: string;
  actorFullName?: string;
  actorEmail?: string;
  actorEmployeeCode?: string;
  tenantCode?: string;
  projectCode?: string;
  context: LogContext;
  http?: HttpLogFields;
  error?: SerializedError;
  extra?: Record<string, unknown>;
};

export type AspectAdvice = {
  name: string;
  category?: LogCategory;
  logArgs?: boolean;
  logResult?: boolean;
  level?: LogLevel;
};

export type ObservabilityInitOptions = {
  service: string;
  version?: string;
};

export type LogSink = {
  name: string;
  write: (event: LogEvent) => void;
  flush?: () => void | Promise<void>;
};
