import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import React from "react";
import { SelectOption } from "../types";

const constants = {
  INSTANCE_NAME: "RadioGroupInput",
};

const styles = {
  label: StyleUtil.cn("block text-sm font-normal text-gray-70 mb-2 line-clamp-2"),
  container: (direction: "horizontal" | "vertical") =>
    StyleUtil.cn("flex gap-4", {
      "flex-col": direction === "vertical",
      "flex-row": direction === "horizontal",
    }),
  radioOption: StyleUtil.cn(
    "flex items-center gap-2 cursor-pointer",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ),
  radio: StyleUtil.cn(
    "w-5 h-5 rounded-full border-2 border-gray-60 cursor-pointer",
    "checked:bg-primary-60 checked:border-primary-60",
    "focus:outline focus:outline-2 focus:outline-primary-60 focus:-outline-offset-2",
  ),
  radioLabel: StyleUtil.cn("text-sm text-gray-100 cursor-pointer"),
  helperText: StyleUtil.cn("text-sm mt-1 text-gray-70 line-clamp-3"),
};

export interface RadioGroupInputProps {
  label?: string;
  helperText?: string | React.ReactNode;
  error?: boolean;
  value?: any;
  onChange?: (value: any) => void;
  options: SelectOption[];
  direction?: "horizontal" | "vertical";
  disabled?: boolean;
}

export const RadioGroupInput = React.memo(
  React.forwardRef<HTMLDivElement, RadioGroupInputProps>((props, ref) => {
    const {
      label,
      helperText,
      error = false,
      value: valueProp,
      onChange: onChangeProp,
      options,
      direction = "vertical",
      disabled,
    } = props;

    const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

    const ids = React.useRef({
      container: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
      helperText: StringUtil.createElementId(
        constants.INSTANCE_NAME,
        instanceId.current,
        "helper-text",
      ),
      radio: (index: number) =>
        StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current, "radio", index),
    });

    const handleChange = (optionValue: any) => {
      if (!disabled) {
        onChangeProp?.(optionValue);
      }
    };

    return (
      <div id={ids.current.container} ref={ref}>
        {/* Label */}
        {label && (
          <label className={styles.label}>
            {label}
          </label>
        )}

        {/* Radio Options */}
        <div className={styles.container(direction)}>
          {options.map((option, index) => {
            const isSelected = valueProp === option.value;

            return (
              <div
                key={option.value}
                className={styles.radioOption}
                onClick={() => handleChange(option.value)}
              >
                <input
                  id={ids.current.radio(index)}
                  type="radio"
                  checked={isSelected}
                  onChange={() => handleChange(option.value)}
                  disabled={disabled || option.disabled}
                  className={StyleUtil.cn(styles.radio, {
                    "border-red-60": error && isSelected,
                  })}
                />
                <label
                  htmlFor={ids.current.radio(index)}
                  className={styles.radioLabel}
                >
                  {option.label}
                </label>
              </div>
            );
          })}
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

RadioGroupInput.displayName = constants.INSTANCE_NAME;

