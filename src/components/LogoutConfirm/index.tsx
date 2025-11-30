"use client";

import { useGlobalContext } from "@/contexts/global.context";
import { useAuthContext } from "@/contexts/auth.context";
import { Dialog } from "@/kits/components/Dialog";
import { Button } from "@/kits/components/Button";
import React from "react";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";
import { useNotification } from "@/kits/components/Notification";
import { useRouter } from "next/navigation";
import { useTenantProjectPath } from "@/hooks/use-tenant-project-path";

export const LogoutConfirm = () => {
  const authStore = useAuthContext();
  const globalStore = useGlobalContext();
  const showLogoutConfirmation = globalStore.use.showLogoutConfirmation();

  const router = useRouter();
  const notification = useNotification();
  const [fakeLoading, setFakeLoading] = React.useState(false);
  const {buildPath} = useTenantProjectPath();
  const handleLogout = React.useCallback(() => {
    setFakeLoading(true);
    // Reset all states at once
    const resetStates = () => {
      // Reset all states in a single update
      Promise.all([
        globalStore.setState({
          showLogoutConfirmation: false,
          showCheckoutConfirmation: false,
          showLeaveConfirmation: false,
          selectedAdminDivision: null,
          selectedLocation: null,
          selectedWorkingShift: null,
          currentAttendance: null,
          showNavigation: false,
        }),
        authStore.setState({
          authenticated: false,
          user: null,
        }),
      ]).then(() => {
        notification.clear();
        setFakeLoading(false);
        router.replace(buildPath("/login"));
      });
    };

    setTimeout(resetStates, 2000);
  }, [authStore, globalStore, notification, router, buildPath]);

  const handleClose = React.useCallback(() => {
    globalStore.setState({ showLogoutConfirmation: false });
  }, [globalStore]);

  return (
    <>
      <LoadingOverlay active={fakeLoading} />

      <Dialog
        title="Đăng xuất"
        isOpen={showLogoutConfirmation}
        onClose={handleClose}
        actions={
          <>
            <Button variant="secondary" onClick={handleClose}>
              Hủy bỏ
            </Button>
            <Button variant="danger" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </>
        }
      >
        <p className="text-sm">Bạn có chắc chắn muốn đăng xuất?</p>
      </Dialog>
    </>
     );
};
