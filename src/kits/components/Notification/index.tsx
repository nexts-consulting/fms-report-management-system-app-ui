import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import { cva, VariantProps } from "class-variance-authority";
import { StoreApi, createStore } from "zustand";
import React from "react";
import { LibraryUtil } from "@/kits/utils/lib.util";
import { createPortal } from "react-dom";
import { Icons } from "@/kits/components/icons";
import { Spinner } from "@/kits/components/spinner";
import { IconButton } from "@/kits/components/icon-button";

const constants = {
  INSTANCE_NAME: "Notification",
};

const baseVariants = cva("", {
  variants: {
    placement: {
      "top-left": "",
      "top-right": "",
      "top-center": "",
      "bottom-left": "",
      "bottom-right": "",
      "bottom-center": "",
    },
    type: {
      pending: "",
      info: "",
      success: "",
      warning: "",
      error: "",
    },
  },
});

const containerVariants = cva("fixed z-[20000] w-screen px-4 md:px-0 md:w-fit h-fit space-y-2", {
  variants: {
    placement: {
      "top-left": "left-0 top-4 md:top-8 md:left-8",
      "top-right": "right-0 top-4 md:top-8 md:right-8",
      "top-center": "left-1/2 -translate-x-1/2 top-4 md:top-8",
      "bottom-left": "left-0 bottom-4 md:bottom-8 md:left-8",
      "bottom-right": "right-0 bottom-4 md:bottom-8 md:right-8",
      "bottom-center": "left-1/2 -translate-x-1/2 bottom-4 md:bottom-8",
    },
  },
});

const notificationContainerVariants = cva(
  "bg-gray-80 border border-gray-70 w-full md:w-[380px] flex items-start justify-between border-l-[3px]",
  {
    variants: {
      type: {
        pending: StyleUtil.cn("border-l-gray-30"),
        info: StyleUtil.cn("border-l-blue-50"),
        success: StyleUtil.cn("border-l-green-50"),
        warning: StyleUtil.cn("border-l-yellow-400"),
        error: StyleUtil.cn("border-l-red-50"),
      },
    },
  },
);

const notificationIconWrapperVariants = cva("shrink-0 h-11 w-11 flex items-center justify-center", {
  variants: {
    type: {
      pending: "",
      info: "text-blue-50",
      success: "text-green-50",
      warning: "text-yellow-400",
      error: "text-red-50",
    },
  },
});

const styles = {
  container: (placement: VariantProps<typeof baseVariants>["placement"]) =>
    StyleUtil.cn(containerVariants({ placement })),
  notificationContainer: (type: VariantProps<typeof baseVariants>["type"]) =>
    StyleUtil.cn(notificationContainerVariants({ type })),
  notificationIconWrapper: (type: VariantProps<typeof baseVariants>["type"]) =>
    StyleUtil.cn(notificationIconWrapperVariants({ type })),
  notificationIcon: StyleUtil.cn("w-5 h-5"),
  notificationContentWrapper: StyleUtil.cn("flex-1 p-3"),
  notificationTitle: StyleUtil.cn("text-sm text-white mb-1"),
  notificationDescription: StyleUtil.cn("text-xs text-gray-30"),
};

const notificationTypeMapping: Record<
  Extract<VariantProps<typeof baseVariants>["type"], string>,
  {
    defaultTitle: string;
    defaultIcon: React.ReactNode;
  }
> = {
  pending: {
    defaultTitle: "Pending",
    defaultIcon: <Spinner color="#FFFFFF" background="#525252" size="medium" />,
  },
  info: {
    defaultTitle: "Info",
    defaultIcon: <Icons.InformationFilled className={styles.notificationIcon} />,
  },
  success: {
    defaultTitle: "Success",
    defaultIcon: <Icons.CheckedFilled className={styles.notificationIcon} />,
  },
  warning: {
    defaultTitle: "Warning",
    defaultIcon: <Icons.WarningFilled className={styles.notificationIcon} />,
  },
  error: {
    defaultTitle: "Error",
    defaultIcon: <Icons.ErrorFilled className={styles.notificationIcon} />,
  },
};

type CreateNotificationProps = {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  icon?: React.ReactNode;
  options?: {
    immortal?: boolean;
    duration?: number;
  };
  closeable?: boolean;
  onDismiss?: () => void;
};

type Notification = CreateNotificationProps & {
  type: VariantProps<typeof baseVariants>["type"];
  id: string;
};

type NotificationStore = {
  notifications: Notification[];
  pending: (props: CreateNotificationProps) => string;
  info: (props: CreateNotificationProps) => string;
  success: (props: CreateNotificationProps) => string;
  warning: (props: CreateNotificationProps) => string;
  error: (props: CreateNotificationProps) => string;
  update: (
    id: string,
    props: CreateNotificationProps & { type?: VariantProps<typeof baseVariants>["type"] },
  ) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const createNotificationStore = () => {
  return createStore<NotificationStore>((set) => ({
    notifications: [],
    pending: (props) => {
      const id = CommonUtil.nanoid("alphaLower");
      set((state) => {
        const duplicateNotif = state.notifications.find(
          (notif) =>
            notif.title === props.title &&
            notif.description === props.description &&
            notif.type === "pending",
        );

        if (duplicateNotif) {
          return {
            notifications: state.notifications.map((notif) =>
              notif.id === duplicateNotif.id ? { ...notif, options: props.options } : notif,
            ),
          };
        }

        return {
          notifications: [...state.notifications, { id, type: "pending", ...props }],
        };
      });
      return id;
    },
    info: (props) => {
      const id = CommonUtil.nanoid("alphaLower");
      set((state) => {
        const duplicateNotif = state.notifications.find(
          (notif) =>
            notif.title === props.title &&
            notif.description === props.description &&
            notif.type === "info",
        );

        if (duplicateNotif) {
          return {
            notifications: state.notifications.map((notif) =>
              notif.id === duplicateNotif.id ? { ...notif, options: props.options } : notif,
            ),
          };
        }

        return {
          notifications: [...state.notifications, { id, type: "info", ...props }],
        };
      });
      return id;
    },
    success: (props) => {
      const id = CommonUtil.nanoid("alphaLower");
      set((state) => {
        const duplicateNotif = state.notifications.find(
          (notif) =>
            notif.title === props.title &&
            notif.description === props.description &&
            notif.type === "success",
        );

        if (duplicateNotif) {
          return {
            notifications: state.notifications.map((notif) =>
              notif.id === duplicateNotif.id ? { ...notif, options: props.options } : notif,
            ),
          };
        }

        return {
          notifications: [...state.notifications, { id, type: "success", ...props }],
        };
      });
      return id;
    },
    warning: (props) => {
      const id = CommonUtil.nanoid("alphaLower");
      set((state) => {
        const duplicateNotif = state.notifications.find(
          (notif) =>
            notif.title === props.title &&
            notif.description === props.description &&
            notif.type === "warning",
        );

        if (duplicateNotif) {
          return {
            notifications: state.notifications.map((notif) =>
              notif.id === duplicateNotif.id ? { ...notif, options: props.options } : notif,
            ),
          };
        }

        return {
          notifications: [...state.notifications, { id, type: "warning", ...props }],
        };
      });
      return id;
    },
    error: (props) => {
      const id = CommonUtil.nanoid("alphaLower");
      set((state) => {
        const duplicateNotif = state.notifications.find(
          (notif) =>
            notif.title === props.title &&
            notif.description === props.description &&
            notif.type === "error",
        );

        if (duplicateNotif) {
          return {
            notifications: state.notifications.map((notif) =>
              notif.id === duplicateNotif.id ? { ...notif, options: props.options } : notif,
            ),
          };
        }

        return {
          notifications: [...state.notifications, { id, type: "error", ...props }],
        };
      });
      return id;
    },
    update: (id, props) => {
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === id ? { ...notification, ...props } : notification,
        ),
      }));
    },
    remove: (id) => {
      set((state) => ({
        notifications: state.notifications.filter((notification) => notification.id !== id),
      }));
    },
    clear: () => {
      set(() => ({
        notifications: [],
      }));
    },
  }));
};

export const NotificationContext = React.createContext<StoreApi<NotificationStore> | undefined>(
  undefined,
);

interface NotificationProviderProps {
  placement?: VariantProps<typeof baseVariants>["placement"];
  children: React.ReactNode;
}

export const NotificationProvider = React.memo((props: NotificationProviderProps) => {
  const { placement = "bottom-right", children } = props;

  const storeRef = React.useRef<StoreApi<NotificationStore>>();
  if (!storeRef.current) {
    storeRef.current = createNotificationStore();
  }

  const selectors = LibraryUtil.zustand.createSelectors(storeRef.current);
  const notifications = selectors.use.notifications();
  const removeFn = selectors.use.remove();

  const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

  const ids = {
    container: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
    notification: (id: string) =>
      StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current, "notification", id),
  };

  return (
    <NotificationContext.Provider value={storeRef.current}>
      {children}
      {createPortal(
        <>
          {notifications.length > 0 && (
            <div id={ids.container} className={styles.container(placement)}>
              {notifications.map((notification) => (
                <NotificationInstance
                  key={notification.id}
                  elementId={ids.notification(notification.id)}
                  notification={notification}
                  removeFn={removeFn}
                />
              ))}
            </div>
          )}
        </>,
        document.body,
      )}
    </NotificationContext.Provider>
  );
});

NotificationProvider.displayName = `${constants.INSTANCE_NAME}.Provider`;

export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error("Notification must be used within a NotificationProvider");
  }

  const selectors = LibraryUtil.zustand.createSelectors(context);

  return {
    pending: selectors.use.pending(),
    info: selectors.use.info(),
    success: selectors.use.success(),
    warning: selectors.use.warning(),
    error: selectors.use.error(),
    update: selectors.use.update(),
    remove: selectors.use.remove(),
    clear: selectors.use.clear(),
  };
};

interface NotificationInstanceProps {
  elementId: string;
  notification: Notification;
  removeFn: (id: string) => void;
}

const NotificationInstance = React.memo((props: NotificationInstanceProps) => {
  const { elementId, notification, removeFn } = props;
  const {
    id,
    title,
    description,
    icon,
    type = "info",
    options = { immortal: false, duration: 3000 },
    closeable = true,
    onDismiss = () => {},
  } = notification;

  const notifcationMapped = notificationTypeMapping[type!];

  const timeoutIdRef = React.useRef<any>();

  const handleRemoveNotification = () => {
    removeFn(id);
    onDismiss?.();
  };

  // Remove notification after duration
  React.useEffect(() => {
    if (options.immortal) return;

    timeoutIdRef.current = setTimeout(handleRemoveNotification, options.duration);
    return () => {
      clearTimeout(timeoutIdRef.current);
    };
  }, [options.duration]);

  return (
    <div id={elementId} className={styles.notificationContainer(type)}>
      <div className={styles.notificationIconWrapper(type)}>
        {icon ? icon : notifcationMapped.defaultIcon}
      </div>
      <div className={styles.notificationContentWrapper}>
        <div className={styles.notificationTitle}>
          {title ? title : notifcationMapped.defaultTitle}
        </div>
        <div className={styles.notificationDescription}>{description}</div>
      </div>
      {closeable && (
        <IconButton
          icon={Icons.CloseLarge}
          variant="gray-80"
          size="large"
          onClick={handleRemoveNotification}
        />
      )}
    </div>
  );
});

NotificationInstance.displayName = `${constants.INSTANCE_NAME}.Instance`;
