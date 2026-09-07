export { AUTH_STORAGE_KEY, DEVICE_ID_KEY, DEFAULT_REFRESH_MESSAGE } from "./constants";
export { getOrCreateDeviceId } from "./device-id";
export { clearLocalStorageKeepAuth, listLocalStorageKeys, PRESERVED_STORAGE_KEYS } from "./local-storage";
export { buildRedactedLocalStorageSnapshot, getDevicePlatform } from "./snapshot";
export { ingestClearLocalStorageEvent } from "./ingest-clear";
export {
  listenDataRefreshRequests,
  listenUserDevice,
  upsertDeviceSnapshot,
  markRequestAppliedOnDevice,
} from "./rtdb";
export { registerFcmToken } from "./fcm";
export type { DataRefreshRequest, DeviceLocalStorageSnapshot } from "./types";
