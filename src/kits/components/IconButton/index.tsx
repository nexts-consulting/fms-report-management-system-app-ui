import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import { cva, VariantProps } from "class-variance-authority";
import React from "react";
import { Tooltip } from "@/kits/components/Tooltip";
import { Placement } from "@floating-ui/react";

const constants = {
  INSTANCE_NAME: "IconButton",
};

const baseVariants = cva("", {
  variants: {
    variant: {
      default: "",
      white: "",
      "gray-10": "",
      "gray-80": "",
      danger: "",
      tertiary: "",
    },
    size: {
      small: "",
      medium: "",
      large: "",
      xlarge: "",
    },
  },
});

const buttonVariants = cva(
  StyleUtil.cn(
    "group h-8 w-8 flex shrink-0 items-center justify-center",
    "active:outline active:outline-2 active:outline-primary-60 active:-outline-offset-2",
    "focus:outline focus:outline-2 focus:outline-primary-60 focus:-outline-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ),
  {
    variants: {
      variant: {
        default: "",
        white: "bg-white hover:bg-gray-10 active:bg-gray-20 focus:bg-gray-10",
        "gray-10": "bg-gray-10 hover:bg-gray-20 active:bg-gray-30 focus:bg-gray-20",
        "gray-80": "bg-gray-80 hover:bg-gray-90 active:bg-gray-100 focus:bg-gray-90",
        danger: "bg-red-50 hover:bg-red-60 active:bg-red-70 focus:bg-red-60",
        tertiary:
          "bg-white border border-gray-20 hover:bg-gray-10 active:bg-gray-20 focus:bg-gray-10",
      },
      size: {
        small: "h-6 w-6",
        medium: "h-8 w-8",
        large: "h-10 w-10",
        xlarge: "h-12 w-12",
      },
    },
  },
);

const iconVariants = cva("w-4 h-4", {
  variants: {
    variant: {
      default: "text-gray-70 group-hover:text-gray-100",
      white: "text-gray-100",
      "gray-10": "text-gray-100",
      "gray-80": "text-white",
      danger: "text-white",
      tertiary: "text-primary-50",
    },
    size: {
      small: "w-4 h-4",
      medium: "w-4 h-4",
      large: "w-4 h-4",
      xlarge: "w-4 h-4",
    },
  },
});

const styles = {
  button: (
    variant: VariantProps<typeof baseVariants>["variant"],
    size: VariantProps<typeof baseVariants>["size"],
  ) => StyleUtil.cn(buttonVariants({ variant, size })),
  icon: (
    variant: VariantProps<typeof iconVariants>["variant"],
    size: VariantProps<typeof iconVariants>["size"],
  ) => StyleUtil.cn(iconVariants({ variant, size })),
};

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof baseVariants> {
  icon: (props: React.ComponentPropsWithoutRef<"svg">) => React.ReactNode;
  tooltip?: string | React.ReactNode;
  tooltipPlacement?: Placement;
}

export const IconButton = React.memo(
  React.forwardRef<HTMLButtonElement, IconButtonProps>((props, ref) => {
    const {
      icon,
      tooltip,
      tooltipPlacement = "bottom",
      variant = "default",
      size = "medium",
      className,
      ...rest
    } = props;

    const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

    const ids = React.useRef({
      button: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
    });

    return (
      <button
        ref={ref}
        type="button"
        id={ids.current.button}
        className={StyleUtil.cn(styles.button(variant, size), className)}
        {...rest}
      >
        {React.createElement(icon, { className: styles.icon(variant, size) })}
        {tooltip && (
          <Tooltip content={tooltip} triggerId={ids.current.button} placement={tooltipPlacement} />
        )}
      </button>
    );
  }),
);

IconButton.displayName = constants.INSTANCE_NAME;
