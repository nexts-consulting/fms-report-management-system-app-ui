import { logger, getLogContext } from "@/libs/observability";
import type { ClearLocalStorageResult } from "./local-storage";

const formatActorLabel = (actor: ReturnType<typeof getLogContext>): string => {
  return (
    [actor.fullName, actor.username, actor.employeeCode, actor.userId]
      .map((value) => (value == null ? "" : String(value).trim()))
      .find((value) => value.length > 0) || "unknown"
  );
};

export const ingestClearLocalStorageEvent = async (
  actor: ReturnType<typeof getLogContext>,
  result: ClearLocalStorageResult,
  source: "manual" | "admin_request",
  requestId?: string,
) => {
  const actorLabel = formatActorLabel(actor);
  const event = {
    timestamp: new Date().toISOString(),
    level: "info",
    message: `${actorLabel} cleared localStorage`,
    category: "app",
    service: "fms-app-ui",
    action: "clear_local_storage",
    extra_action: "clear_local_storage",
    extra_source: source,
    requestId: requestId ?? "",
    actorUserId: actor.userId ?? "",
    actorUsername: actor.username ?? "",
    actorFullName: actor.fullName ?? "",
    actorEmail: actor.email ?? "",
    actorEmployeeCode: actor.employeeCode ?? "",
    tenantCode: actor.tenantCode ?? "",
    projectCode: actor.projectCode ?? "",
    keysCleared: result.keysCleared,
    preservedAuth: result.preservedAuth,
    preservedDeviceId: result.preservedDeviceId,
  };

  logger.info(
    event.message,
    {
      action: "clear_local_storage",
      extra_source: source,
      requestId,
      actorUserId: actor.userId,
      actorUsername: actor.username,
      actorFullName: actor.fullName,
      ...result,
    },
    "app",
  );

  const response = await fetch("/api/observability/logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([event]),
    keepalive: true,
  });

  if (!response.ok) {
    throw new Error(`OpenObserve ingest failed (${response.status})`);
  }

  await logger.flush();
};
