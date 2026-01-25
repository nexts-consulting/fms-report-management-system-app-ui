import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import React from "react";
import { createPortal } from "react-dom";
import { IconButton } from "@/kits/components/icon-button";
import { Icons } from "@/kits/components/icons";
import { Tooltip } from "@/kits/components/tooltip";

const constants = {
  INSTANCE_NAME: "Modal",
};

const styles = {
  container: StyleUtil.cn(
    "fixed inset-0 overflow-y-auto z-[1000] flex items-start justify-center h-dvh bg-black/30",
  ),
  panel: StyleUtil.cn(
    "z-[2] bg-white shadow-sm w-full max-w-lg mx-4 md:mx-auto my-16 relative overflow-hidden",
  ),
  header: StyleUtil.cn("flex items-start justify-between gap-4 border-b border-b-gray-20"),
  headerContentWrapper: StyleUtil.cn("flex-1 mb-4 pl-4 pt-4"),
  headerTitle: StyleUtil.cn("flex-1 text-base font-medium text-gray-100 line-clamp-2"),
  headerDescription: StyleUtil.cn("text-sm text-gray-50"),
};

export interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  closeable?: boolean;
  children: React.ReactNode;
}

export const Modal = React.memo((props: ModalProps) => {
  const { isOpen, onClose, title, description, children, closeable = true } = props;

  const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

  const ids = React.useRef({
    container: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
    panel: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current, "panel"),
    header: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current, "header"),
    content: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current, "content"),
    closeButton: StringUtil.createElementId(
      constants.INSTANCE_NAME,
      instanceId.current,
      "close-button",
    ),
  });

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  // Handle ESC key
  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
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
        <div id={ids.current.panel} role="dialog" aria-modal="true" className={styles.panel}>
          {/* Header */}
          {title && (
            <div id={ids.current.header} className={styles.header}>
              <div className={styles.headerContentWrapper}>
                <h2 className={styles.headerTitle}>{title}</h2>
                {description && <p className={styles.headerDescription}>{description}</p>}
              </div>

              {closeable && (
                <>
                  <IconButton
                    id={ids.current.closeButton}
                    icon={Icons.CloseLarge}
                    size="xlarge"
                    variant="white"
                    onClick={onClose}
                  />
                  <Tooltip
                    content="Close"
                    placement="left"
                    size="medium"
                    triggerId={ids.current.closeButton}
                  />
                </>
              )}
            </div>
          )}

          {/* Content */}
          <div id={ids.current.content}>{children}</div>
        </div>
      </div>
    </>,
    document.body,
  );
});

Modal.displayName = constants.INSTANCE_NAME;
