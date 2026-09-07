"use client";

import React from "react";
import { AxiosError } from "axios";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/kits/components/button";
import { Modal } from "@/kits/components/modal";
import { useNotification } from "@/kits/components/notification";
import { useAuthContext } from "@/contexts/auth.context";
import { getLogContext, logRenderError, logger } from "@/libs/observability";
import {
  DEFAULT_REFRESH_MESSAGE,
  buildRedactedLocalStorageSnapshot,
  getDevicePlatform,
  getOrCreateDeviceId,
  ingestClearLocalStorageEvent,
  listenDataRefreshRequests,
  listenUserDevice,
  markRequestAppliedOnDevice,
  registerFcmToken,
  upsertDeviceSnapshot,
  type DataRefreshRequest,
} from "@/libs/data-refresh";
import { DEVICE_HEARTBEAT_MS } from "@/libs/data-refresh/constants";
import { clearLocalStorageKeepAuth } from "@/libs/data-refresh/local-storage";

interface DataRefreshProviderProps {
  children: React.ReactNode;
}

export const DataRefreshProvider = ({ children }: DataRefreshProviderProps) => {
  const notification = useNotification();
  const authContext = useAuthContext();
  const authenticated = authContext.use.authenticated();
  const user = authContext.use.user();
  const userProfile = authContext.use.userProfile();
  const tenant = authContext.use.tenant();
  const project = authContext.use.project();

  const [pendingRequest, setPendingRequest] = React.useState<DataRefreshRequest | null>(null);
  const [isApplying, setIsApplying] = React.useState(false);
  const appliedIdsRef = React.useRef<Set<string>>(new Set());
  const requestsRef = React.useRef<DataRefreshRequest[]>([]);
  const fcmTokenRef = React.useRef<string | null | undefined>(undefined);

  const tenantCode = tenant?.code;
  const projectCode = project?.code;
  const userId = user?.id || userProfile?.keycloak_user_id || "";

  const resolvePending = React.useCallback(() => {
    const applied = appliedIdsRef.current;
    const next = requestsRef.current
      .filter((request) => request.status === "active")
      .filter((request) => request.target === "all" || request.userId === userId)
      .filter((request) => !applied.has(request.id))
      .sort((a, b) => a.createdAtMs - b.createdAtMs)[0];

    setPendingRequest(next ?? null);
  }, [userId]);

  const uploadSnapshot = React.useCallback(async () => {
    if (!tenantCode || !userId) return;

    const deviceId = getOrCreateDeviceId();
    const { keys, snapshot, snapshotTruncated } = buildRedactedLocalStorageSnapshot();
    if (fcmTokenRef.current === undefined) {
      fcmTokenRef.current = await registerFcmToken();
    }
    const now = Date.now();

    await upsertDeviceSnapshot(tenantCode, userId, {
      deviceId,
      userId,
      username: user?.username || userProfile?.keycloak_username || undefined,
      fullName: user?.fullName || userProfile?.fullname || undefined,
      projectCode,
      userAgent: typeof navigator === "undefined" ? "" : navigator.userAgent,
      platform: getDevicePlatform(),
      lastSeenAt: new Date(now).toISOString(),
      lastSeenAtMs: now,
      keys,
      snapshot,
      snapshotTruncated,
      ...(fcmTokenRef.current ? { fcmToken: fcmTokenRef.current } : {}),
    });
  }, [tenantCode, userId, user, userProfile, projectCode]);

  React.useEffect(() => {
    if (!authenticated || !tenantCode || !projectCode || !userId) {
      setPendingRequest(null);
      return;
    }

    const deviceId = getOrCreateDeviceId();

    const unsubRequests = listenDataRefreshRequests(
      tenantCode,
      projectCode,
      (requests) => {
        requestsRef.current = requests;
        resolvePending();
      },
      (error) => {
        console.warn("[data-refresh] Failed to listen for update requests", error);
      },
    );

    const unsubDevice = listenUserDevice(
      tenantCode,
      userId,
      deviceId,
      (device) => {
        appliedIdsRef.current = new Set(device?.appliedRequestIds || []);
        resolvePending();
      },
      (error) => {
        console.warn("[data-refresh] Failed to listen for device snapshot", error);
      },
    );

    void uploadSnapshot().catch((error) => {
      console.warn("[data-refresh] Failed to upload device snapshot", error);
    });

    const heartbeat = window.setInterval(() => {
      void uploadSnapshot().catch(() => undefined);
    }, DEVICE_HEARTBEAT_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void uploadSnapshot().catch(() => undefined);
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      unsubRequests();
      unsubDevice();
      window.clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [authenticated, tenantCode, projectCode, userId, resolvePending, uploadSnapshot]);

  const handleApply = async () => {
    if (!pendingRequest || !tenantCode || !userId || isApplying) return;

    setIsApplying(true);
    const actor = getLogContext();
    const deviceId = getOrCreateDeviceId();

    try {
      const result = clearLocalStorageKeepAuth();
      await ingestClearLocalStorageEvent(actor, result, "admin_request", pendingRequest.id);
      await markRequestAppliedOnDevice(tenantCode, userId, deviceId, pendingRequest.id);

      notification.success({
        title: "Đã cập nhật",
      });

      window.setTimeout(() => {
        window.location.reload();
      }, 400);
    } catch (error) {
      logger.error(
        "Failed to apply admin data refresh request",
        error,
        {
          action: "clear_local_storage",
          extra_source: "admin_request",
          requestId: pendingRequest.id,
        },
        "app",
      );
      notification.error({
        title: "Không thể cập nhật",
      });
      setIsApplying(false);
    }
  };

  return (
    <>
      <ErrorBoundary
        FallbackComponent={() => <></>}
        onError={(error, errorInfo) => {
          const isApiErr =
            error instanceof AxiosError ||
            (error &&
              typeof error === "object" &&
              (("code" in error && typeof error.code === "string") ||
                ("message" in error && typeof error.message === "string")));
          if (isApiErr) return;
          logRenderError(error, errorInfo);
        }}
      >
        {children}
      </ErrorBoundary>
      <Modal
        isOpen={Boolean(pendingRequest)}
        closeable={false}
        title={pendingRequest?.message || DEFAULT_REFRESH_MESSAGE}
      >
        <div className="px-4 py-4">
          <p className="mb-1 text-sm text-gray-70">
            Có cấu hình mới từ quản trị.
          </p>
          <p className="mb-4 text-sm text-gray-70">
            Dữ liệu trên thiết bị này sẽ được tải lại. Phiên đăng nhập vẫn được giữ.
          </p>
          <Button
            variant="primary"
            size="medium"
            centered
            className="w-full"
            loading={isApplying}
            disabled={isApplying}
            onClick={handleApply}
          >
            Cập nhật
          </Button>
        </div>
      </Modal>
    </>
  );
};
