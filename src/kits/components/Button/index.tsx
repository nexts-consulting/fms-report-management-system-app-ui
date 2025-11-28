import React from "react";
import { cva, VariantProps } from "class-variance-authority";
import { StyleUtil, CommonUtil, StringUtil } from "@/kits/utils";
import { Spinner } from "../Spinner";

const constants = {
  INSTANCE_NAME: "Button",
};

const variants = cva(
  StyleUtil.cn(
    "text-sm border relative",
    "enabled:active:shadow-[inset_0_0_0_1px_#1d35e0,inset_0_0_0_2px_white] enabled:active:border-primary-60",
    "enabled:focus:shadow-[inset_0_0_0_1px_#1d35e0,inset_0_0_0_2px_white] enabled:focus:border-primary-60",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ),
  {
    variants: {
      variant: {
        primary:
          "bg-project-primary border-project-primary text-white hover:bg-project-primary-hover active:bg-project-primary-active",
        secondary: "bg-gray-80 border-gray-80 text-white hover:bg-gray-70 active:bg-gray-60",
        tertiary: StyleUtil.cn(
          "bg-white border-project-primary text-project-primary",
          "enabled:hover:bg-project-primary enabled:hover:text-white",
          "enabled:active:bg-project-primary-hover enabled:active:text-white",
          "enabled:focus:bg-project-primary enabled:focus:text-white",
        ),
        danger: "bg-red-60 border-red-60 text-white hover:bg-red-70 active:bg-red-80",
        "danger-tertiary": StyleUtil.cn(
          "bg-white border-red-60 text-red-60",
          "enabled:hover:bg-red-60 enabled:hover:text-white",
          "enabled:active:bg-red-70 enabled:active:text-white",
          "enabled:focus:bg-red-60 enabled:focus:text-white",
        ),
      },
      size: {
        small: "px-3 py-2",
        medium: "px-3 py-3",
        large: "px-3 py-6",
        xlarge: "px-3 py-8",
      },
      centered: {
        true: "flex items-center justify-center gap-3",
        false: "text-left pr-16",
      },
    },
    defaultVariants: {
      centered: false,
    },
  },
);

const styles = {
  button: (
    variant: VariantProps<typeof variants>["variant"],
    size: VariantProps<typeof variants>["size"],
    centered: VariantProps<typeof variants>["centered"],
  ) => StyleUtil.cn(variants({ variant, size, centered })),
  icon: (isCentered: boolean) =>
    StyleUtil.cn(
      "w-4 h-4 shrink-0",
      !isCentered && "absolute right-0 top-1/2 -translate-y-1/2 -translate-x-4",
    ),
};

const getSpinnerColor = (variant: VariantProps<typeof variants>["variant"]) => {
  switch (variant) {
    case "primary":
    case "secondary":
    case "danger":
      return "#fff";
    case "tertiary":
      return "var(--project-primary-color, #1d35e0)";
    case "danger-tertiary":
      return "#DC2626";
    default:
      return "#fff";
  }
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof variants> {
  icon?: (props: React.ComponentPropsWithoutRef<"svg">) => React.ReactNode;
  centered?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    variant = "primary",
    size = "medium",
    centered = false,
    className,
    children,
    icon,
    loading = false,
    disabled = false,
    ...rest
  } = props;

  const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

  const ids = React.useRef({
    button: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
  });

  return (
    <button
      ref={ref}
      id={ids.current.button}
      type="button"
      className={StyleUtil.cn(styles.button(variant, size, centered), className)}
      disabled={disabled || loading}
      {...rest}
    >
      <div className={StyleUtil.cn({ "opacity-0": loading })}>{children}</div>
      <div className={StyleUtil.cn({ "opacity-0": loading })}>
        {icon && React.createElement(icon, { className: styles.icon(centered) })}
      </div>

      {loading && (
        <div className="absolute inset-0 z-[1] flex items-center justify-center">
          <Spinner color={getSpinnerColor(variant)} withoutBackground size="medium" />
        </div>
      )}
    </button>
  );
});

Button.displayName = constants.INSTANCE_NAME;
