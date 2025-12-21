"use client";

import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import React from "react";
import { createPortal } from "react-dom";
import { Icons } from "@/kits/components/Icons";
import { useGlobalContext } from "@/contexts/global.context";
import { useRouter } from "next/navigation";
import { useNotification } from "@/kits/components/Notification";
import { useAuthContext } from "@/contexts/auth.context";
import { useTenantProjectPath } from "@/hooks/use-tenant-project-path";
import { User, Exit, Logout, Settings } from "@carbon/icons-react";

const constants = {
  INSTANCE_NAME: "UserMenu",
};

const styles = {
  container: StyleUtil.cn("fixed inset-0 z-[1000] flex items-start justify-end h-dvh bg-black/30"),
  panel: StyleUtil.cn("z-[2] bg-white shadow-sm w-52 mx-4 mt-24 mb-4 relative overflow-hidden "),
  content: StyleUtil.cn("p-2"),
  menuItem: StyleUtil.cn(
    "flex w-full items-center gap-4 px-4 py-3 text-sm text-gray-100 hover:bg-gray-10 cursor-pointer",
    "active:outline active:outline-2 active:outline-primary-60 active:-outline-offset-2",
    "focus:outline focus:outline-2 focus:outline-primary-60 focus:-outline-offset-2",
  ),
};

export interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserMenu = React.memo((props: UserMenuProps) => {

  const authStore = useAuthContext();
  const user = authStore.use.user();
  const { buildPath } = useTenantProjectPath();
  const { isOpen, onClose } = props;

  const globalStore = useGlobalContext();
  const currentAttendance = globalStore.use.currentAttendance();

  const isCheckoutAvailable = React.useMemo(() => {
    return true;
  }, [currentAttendance]);

  const router = useRouter();
  const notification = useNotification();

  const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

  const ids = React.useRef({
    container: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
    panel: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current, "panel"),
    content: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current, "content"),
  });

  const items = [
    {
      label: "Profile",
      className: "",
      active: true,
      icon: User,
      action: () => {
        router.push(buildPath("/profile"));
      },
    },
    {
      label: "Hệ thống",
      className: "",
      active: true,
      icon: Settings,
      action: () => {
        router.push(buildPath("/configuration"));
      },
    },
    {
      icon: Exit,
      label: "Check out",
      className: "",
      active: !!currentAttendance,
      action: () => {
        if (!isCheckoutAvailable) {
          notification.warning({
            title: "Chưa thể check out",
            description: "Vui lòng hoàn tất các báo cáo trước khi check out!",
          });
          onClose();
          return;
        }

        setTimeout(() => {
          globalStore.setState({ showCheckoutConfirmation: true });
          onClose();
        }, 100);
      },
    },
    {
      icon: Logout,
      label: "Đăng xuất",
      className: StyleUtil.cn("text-red-50"),
      active: true,
      action: () => {
        setTimeout(() => {
          globalStore.setState({ showLogoutConfirmation: true });
          onClose();
        }, 100);
      },
    },
  ];

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle ESC key
  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return <></>;

  return createPortal(
    <>
      <div id={ids.current.container} className={styles.container} onClick={handleBackdropClick}>
        <div id={ids.current.panel} role="menu" className={styles.panel}>
          <div id={ids.current.content} className={styles.content}>
            {items
              .filter((item) => item.active)
              .map((item, index) => (
                <button
                  key={index}
                  className={StyleUtil.cn(styles.menuItem, item.className)}
                  onClick={item.action}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </button>
              ))}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
});

UserMenu.displayName = constants.INSTANCE_NAME;
