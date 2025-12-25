import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import React from "react";

const constants = {
  INSTANCE_NAME: "CheckboxInput",
};

const styles = {
  container: StyleUtil.cn("flex items-center gap-3"),
  label: StyleUtil.cn("block text-sm font-normal text-gray-70 mb-2 line-clamp-2"),
  checkbox: StyleUtil.cn(
    "w-5 h-5 rounded border-2 border-gray-60 cursor-pointer",
    "checked:bg-primary-60 checked:border-primary-60",
    "focus:outline focus:outline-2 focus:outline-primary-60 focus:-outline-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ),
  checkboxLabel: StyleUtil.cn("text-sm text-gray-100 cursor-pointer"),
  helperText: StyleUtil.cn("text-sm mt-1 text-gray-70 line-clamp-3"),
};

export interface CheckboxInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  label?: string;
  checkboxLabel?: string;
  helperText?: string | React.ReactNode;
  error?: boolean;
  value?: boolean;
  onChange?: (value: boolean) => void;
}

export const CheckboxInput = React.memo(
  React.forwardRef<HTMLInputElement, CheckboxInputProps>((props, ref) => {
    const {
      label,
      checkboxLabel,
      helperText,
      error = false,
      value: valueProp,
      onChange: onChangeProp,
      disabled,
      ...rest
    } = props;

    const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

    const ids = React.useRef({
      container: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
      checkbox: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current, "checkbox"),
      helperText: StringUtil.createElementId(
        constants.INSTANCE_NAME,
        instanceId.current,
        "helper-text",
      ),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChangeProp?.(e.target.checked);
    };

    return (
      <div id={ids.current.container}>
        {/* Label */}
        {label && (
          <label htmlFor={ids.current.checkbox} className={styles.label}>
            {label}
          </label>
        )}

        {/* Checkbox */}
        <div className={styles.container}>
          <input
            ref={ref}
            id={ids.current.checkbox}
            type="checkbox"
            checked={valueProp || false}
            onChange={handleChange}
            disabled={disabled}
            className={ StyleUtil.cn(styles.checkbox, {
              "border-red-60": error,
            }, "h-5 w-5 border-gray-300 accent-primary-60 text-primary-60 cursor-pointer")}
            {...rest}
          />
          {(checkboxLabel || label) && (
            <label htmlFor={ids.current.checkbox} className={styles.checkboxLabel}>
              {checkboxLabel || label}
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

CheckboxInput.displayName = constants.INSTANCE_NAME;

