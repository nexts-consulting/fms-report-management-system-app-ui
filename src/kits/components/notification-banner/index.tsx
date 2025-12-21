import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import { cva, VariantProps } from "class-variance-authority";
import React from "react";
import { Spinner } from "@/kits/components/spinner";
import { Icons } from "@/kits/components/icons";
import { IconButton } from "../icon-button";

const constants = {
  INSTANCE_NAME: "NotificationBanner",
};

const baseVariants = cva("", {
  variants: {
    type: {
      pending: "",
      info: "",
      success: "",
      warning: "",
      error: "",
    },
  },
});

const containerVariants = cva(
  "bg-gray-80 border border-gray-70 w-full flex items-start justify-between border-l-[3px]",
  {
    variants: {
      type: {
        pending: StyleUtil.cn("border-l-gray-30"),
        info: StyleUtil.cn("bg-blue-10 border-blue-20 border-l-blue-50"),
        success: StyleUtil.cn("bg-green-10 border-green-20 border-l-green-50"),
        warning: StyleUtil.cn("bg-orange-50 border-orange-200 border-l-orange-400"),
        error: StyleUtil.cn("bg-red-10 border-red-20 border-l-red-50"),
      },
    },
  },
);

const iconWrapperVariants = cva("shrink-0 h-11 w-11 flex items-center justify-center", {
  variants: {
    type: {
      pending: "",
      info: "text-blue-50",
      success: "text-green-50",
      warning: "text-orange-400",
      error: "text-red-50",
    },
  },
});

const titleVariants = cva("text-sm text-white mb-1", {
  variants: {
    type: {
      pending: "",
      info: "text-gray-100 font-medium",
      success: "text-gray-100 font-medium",
      warning: "text-gray-100 font-medium",
      error: "text-gray-100 font-medium",
    },
  },
});

const descriptionVariants = cva("text-xs text-gray-30", {
  variants: {
    type: {
      pending: "",
      info: "text-gray-70",
      success: "text-gray-70",
      warning: "text-gray-70",
      error: "text-gray-70",
    },
  },
});

const styles = {
  container: (type: VariantProps<typeof baseVariants>["type"]) =>
    StyleUtil.cn(containerVariants({ type })),
  iconWrapper: (type: VariantProps<typeof baseVariants>["type"]) =>
    StyleUtil.cn(iconWrapperVariants({ type })),
  icon: StyleUtil.cn("w-5 h-5"),
  contentWrapper: (inline: boolean) =>
    StyleUtil.cn("flex-1 p-3", { "flex items-center justify-start gap-2": inline }),
  title: (type: VariantProps<typeof baseVariants>["type"], inline: boolean) =>
    StyleUtil.cn(titleVariants({ type }), { "m-0": inline }),
  description: (type: VariantProps<typeof baseVariants>["type"]) =>
    StyleUtil.cn(descriptionVariants({ type })),
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
    defaultIcon: <Icons.InformationFilled className={styles.icon} />,
  },
  success: {
    defaultTitle: "Success",
    defaultIcon: <Icons.CheckedFilled className={styles.icon} />,
  },
  warning: {
    defaultTitle: "Warning",
    defaultIcon: <Icons.WarningFilled className={styles.icon} />,
  },
  error: {
    defaultTitle: "Error",
    defaultIcon: <Icons.ErrorFilled className={styles.icon} />,
  },
};

export interface NotificationBannerProps extends VariantProps<typeof baseVariants> {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  icon?: React.ReactNode;
  closeable?: boolean;
  inline?: boolean;
  onDismiss?: () => void;
}

export const NotificationBanner = React.memo((props: NotificationBannerProps) => {
  const {
    type = "info",
    title,
    description,
    icon,
    closeable = true,
    inline = false,
    onDismiss,
  } = props;

  const notifcationMapped = notificationTypeMapping[type!];

  const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

  const ids = {
    notification: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
  };

  const [isActive, setIsActive] = React.useState(true);

  const handleRemoveNotification = () => {
    onDismiss?.();
    setIsActive(false);
  };

  if (!isActive) return <></>;

  return (
    <div id={ids.notification} className={styles.container(type)}>
      <div className={styles.iconWrapper(type)}>{icon ? icon : notifcationMapped.defaultIcon}</div>
      <div className={styles.contentWrapper(inline)}>
        <div className={styles.title(type, inline)}>
          {title ? title : notifcationMapped.defaultTitle}
        </div>
        <div className={styles.description(type)}>{description}</div>
      </div>
      {closeable && (
        <IconButton
          icon={Icons.CloseLarge}
          variant={type === "pending" ? "gray-80" : "default"}
          size="large"
          onClick={handleRemoveNotification}
        />
      )}
    </div>
  );
});

NotificationBanner.displayName = constants.INSTANCE_NAME;
