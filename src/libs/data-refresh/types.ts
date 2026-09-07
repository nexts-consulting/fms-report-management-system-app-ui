export type DataRefreshTarget = "all" | "user";
export type DataRefreshStatus = "active" | "cancelled";

export interface DataRefreshActor {
  userId?: string;
  username?: string;
  fullName?: string;
}

export interface DataRefreshRequest {
  id: string;
  target: DataRefreshTarget;
  userId?: string;
  username?: string;
  projectCode: string;
  projectId?: string;
  message: string;
  createdAtMs: number;
  createdAtIso: string;
  createdBy: DataRefreshActor;
  status: DataRefreshStatus;
}

export interface DeviceLocalStorageSnapshot {
  deviceId: string;
  userId: string;
  username?: string;
  fullName?: string;
  projectCode?: string;
  userAgent: string;
  platform?: string;
  lastSeenAt: string;
  lastSeenAtMs: number;
  keys: string[];
  snapshot: Record<string, unknown>;
  snapshotTruncated?: boolean;
  appliedRequestIds?: string[];
  lastAppliedRequestId?: string;
  lastAppliedAt?: string;
  fcmToken?: string | null;
}
