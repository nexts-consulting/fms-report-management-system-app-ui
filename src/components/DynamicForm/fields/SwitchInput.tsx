import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import React from "react";

const constants = {
  INSTANCE_NAME: "SwitchInput",
};

const styles = {
  label: StyleUtil.cn("block text-sm font-normal text-gray-70 mb-2 line-clamp-2"),
  container: StyleUtil.cn("flex items-center gap-3"),
  switch: (checked: boolean, disabled: boolean) =>
    StyleUtil.cn(
      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
      {
        "bg-primary-60": checked && !disabled,
        "bg-gray-60": !checked && !disabled,
        "bg-gray-40 opacity-50 cursor-not-allowed": disabled,
        "cursor-pointer": !disabled,
      },
    ),
  switchThumb: (checked: boolean) =>
    StyleUtil.cn(
      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
      {
        "translate-x-6": checked,
        "translate-x-1": !checked,
      },
    ),
  switchLabel: StyleUtil.cn("text-sm text-gray-100 cursor-pointer"),
  helperText: StyleUtil.cn("text-sm mt-1 text-gray-70 line-clamp-3"),
};

export interface SwitchInputProps {
  label?: string;
  switchLabel?: string;
  helperText?: string | React.ReactNode;
  error?: boolean;
  value?: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
}

export const SwitchInput = React.memo(
  React.forwardRef<HTMLButtonElement, SwitchInputProps>((props, ref) => {
    const {
      label,
      switchLabel,
      helperText,
      error = false,
      value: valueProp = false,
      onChange: onChangeProp,
      disabled,
    } = props;

    const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

    const ids = React.useRef({
      container: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
      switch: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current, "switch"),
      helperText: StringUtil.createElementId(
        constants.INSTANCE_NAME,
        instanceId.current,
        "helper-text",
      ),
    });

    const handleToggle = () => {
      if (!disabled) {
        onChangeProp?.(!valueProp);
      }
    };

    return (
      <div id={ids.current.container}>
        {/* Label */}
        {label && (
          <label className={styles.label}>
            {label}
          </label>
        )}

        {/* Switch */}
        <div className={styles.container}>
          <button
            ref={ref}
            id={ids.current.switch}
            type="button"
            role="switch"
            aria-checked={valueProp}
            disabled={disabled}
            onClick={handleToggle}
            className={StyleUtil.cn(styles.switch(valueProp, disabled || false), {
              "ring-2 ring-red-60": error,
            })}
          >
            <span className={styles.switchThumb(valueProp)} />
          </button>
          {switchLabel && (
            <label
              htmlFor={ids.current.switch}
              className={styles.switchLabel}
              onClick={handleToggle}
            >
              {switchLabel}
            </label>
          )}
        </div>

        {/* Helper text */}
        {helperText && (
          <p id={ids.current.helperText} className={styles.helperText}>
            {helperText}
          </p>
        )}
      </div>
    );
  }),
);

SwitchInput.displayName = constants.INSTANCE_NAME;

