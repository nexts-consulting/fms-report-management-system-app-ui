import React from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  arrow,
  type Placement,
} from "@floating-ui/react";
import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import { cva, VariantProps } from "class-variance-authority";

const constants = {
  INSTANCE_NAME: "Tooltip",
};

const variants = cva("relative z-[10000] bg-gray-90 text-white", {
  variants: {
    size: {
      small: "px-2 py-1 text-sm",
      medium: "px-4 py-3 text-sm",
    },
  },
});

const styles = {
  tooltip: (size: VariantProps<typeof variants>["size"]) => StyleUtil.cn(variants({ size })),
  arrow: (arrowRotation?: string) =>
    StyleUtil.cn("absolute h-2 w-2 bg-gray-90", "pointer-events-none", arrowRotation),
};

export interface TooltipProps extends VariantProps<typeof variants> {
  content: string | React.ReactNode;
  triggerId: string;
  placement?: Placement;
  className?: string;
  showArrow?: boolean;
}

export const Tooltip = (props: TooltipProps) => {
  const {
    content,
    triggerId,
    placement = "top",
    className,
    showArrow = true,
    size = "medium",
  } = props;

  const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

  const ids = React.useRef({
    container: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
  });

  const [isOpen, setIsOpen] = React.useState(false);
  const arrowRef = React.useRef(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);

  const {
    x,
    y,
    refs,
    strategy,
    context,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} },
  } = useFloating({
    placement,
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(12), flip(), shift(), showArrow && arrow({ element: arrowRef })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    move: false,
    enabled: true,
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  // Merge all interactions
  const { getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  // Find and track trigger element
  React.useEffect(() => {
    const trigger = document.getElementById(triggerId);
    if (trigger) {
      triggerRef.current = trigger;
      refs.setReference(trigger);

      // Add event listeners
      const showTooltip = () => setIsOpen(true);
      const hideTooltip = () => setIsOpen(false);

      trigger.addEventListener("mouseenter", showTooltip);
      trigger.addEventListener("mouseleave", hideTooltip);
      trigger.addEventListener("focus", showTooltip);
      trigger.addEventListener("blur", hideTooltip);

      return () => {
        trigger.removeEventListener("mouseenter", showTooltip);
        trigger.removeEventListener("mouseleave", hideTooltip);
        trigger.removeEventListener("focus", showTooltip);
        trigger.removeEventListener("blur", hideTooltip);
      };
    }
  }, [triggerId, refs]);

  const staticSide = {
    top: "bottom",
    right: "left",
    bottom: "top",
    left: "right",
  }[placement.split("-")[0]];

  const arrowRotation = {
    top: "rotate-45", // (↓)
    right: "-rotate-45", // (←)
    bottom: "-rotate-45", // (↑)
    left: "rotate-45", // (→)
  }[placement.split("-")[0]];

  // Render only tooltip content
  return isOpen && triggerRef.current ? (
    <FloatingPortal>
      <div
        id={ids.current.container}
        ref={refs.setFloating}
        style={{
          position: strategy,
          top: y ?? 0,
          left: x ?? 0,
          width: "max-content",
        }}
        {...getFloatingProps()}
        role="tooltip"
        aria-hidden={!isOpen}
        className={StyleUtil.cn(styles.tooltip(size), className)}
      >
        {content}
        {showArrow && (
          <div
            ref={arrowRef}
            className={styles.arrow(arrowRotation)}
            style={{
              left: arrowX != null ? `${arrowX}px` : "",
              top: arrowY != null ? `${arrowY}px` : "",
              right: "",
              bottom: "",
              [staticSide as any]: "-4px",
            }}
          />
        )}
      </div>
    </FloatingPortal>
  ) : null;
};

Tooltip.displayName = constants.INSTANCE_NAME;
