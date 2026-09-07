import { onValue, ref, update } from "firebase/database";
import { firebaseService } from "@/services/firebase";
import { REQUEST_LISTEN_LIMIT } from "./constants";
import { dataRefreshRequestsPath, userDevicesPath } from "./paths";
import type { DataRefreshRequest, DeviceLocalStorageSnapshot } from "./types";

const omitUndefined = (value: Record<string, unknown>) => {
  const output: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    if (nested !== undefined) output[key] = nested;
  }
  return output;
};

const toIso = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return new Date(value).toISOString();
  return new Date().toISOString();
};

const parseRequest = (id: string, data: Record<string, unknown>): DataRefreshRequest => {
  const createdAtMs =
    typeof data.createdAtMs === "number" ? data.createdAtMs : Date.parse(toIso(data.createdAt));

  return {
    id,
    target: data.target === "user" ? "user" : "all",
    userId: typeof data.userId === "string" ? data.userId : undefined,
    username: typeof data.username === "string" ? data.username : undefined,
    projectCode: typeof data.projectCode === "string" ? data.projectCode : "",
    projectId: typeof data.projectId === "string" ? data.projectId : undefined,
    message: typeof data.message === "string" ? data.message : "",
    createdAtMs: Number.isFinite(createdAtMs) ? createdAtMs : Date.now(),
    createdAtIso: toIso(data.createdAtIso ?? data.createdAt),
    createdBy: (data.createdBy as DataRefreshRequest["createdBy"]) || {},
    status: data.status === "cancelled" ? "cancelled" : "active",
  };
};

const appliedIdsFromValue = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>);
  }
  return [];
};

export const listenDataRefreshRequests = (
  tenantCode: string,
  projectCode: string,
  onChange: (requests: DataRefreshRequest[]) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  const requestsRef = ref(firebaseService.rtdb, dataRefreshRequestsPath(tenantCode, projectCode));

  return onValue(
    requestsRef,
    (snapshot) => {
      const value = snapshot.val() as Record<string, Record<string, unknown>> | null;
      const requests = Object.entries(value || {})
        .map(([id, data]) => parseRequest(id, data || {}))
        .sort((a, b) => b.createdAtMs - a.createdAtMs)
        .slice(0, REQUEST_LISTEN_LIMIT);
      onChange(requests);
    },
    (error) => onError?.(error),
  );
};

export const listenUserDevice = (
  tenantCode: string,
  userId: string,
  deviceId: string,
  onChange: (device: DeviceLocalStorageSnapshot | null) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  const deviceRef = ref(firebaseService.rtdb, `${userDevicesPath(tenantCode, userId)}/${deviceId}`);

  return onValue(
    deviceRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange(null);
        return;
      }
      const data = snapshot.val() as DeviceLocalStorageSnapshot;
      onChange({
        ...data,
        deviceId,
        appliedRequestIds: appliedIdsFromValue(data.appliedRequestIds),
      });
    },
    (error) => onError?.(error),
  );
};

export const upsertDeviceSnapshot = async (
  tenantCode: string,
  userId: string,
  payload: Omit<DeviceLocalStorageSnapshot, "appliedRequestIds" | "lastAppliedAt" | "lastAppliedRequestId">,
) => {
  const deviceRef = ref(
    firebaseService.rtdb,
    `${userDevicesPath(tenantCode, userId)}/${payload.deviceId}`,
  );
  await update(deviceRef, omitUndefined({ ...payload }));
};

export const markRequestAppliedOnDevice = async (
  tenantCode: string,
  userId: string,
  deviceId: string,
  requestId: string,
) => {
  const deviceRef = ref(firebaseService.rtdb, `${userDevicesPath(tenantCode, userId)}/${deviceId}`);
  await update(deviceRef, {
    lastAppliedRequestId: requestId,
    lastAppliedAt: new Date().toISOString(),
    [`appliedRequestIds/${requestId}`]: true,
  });
};
