import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import React from "react";

const constants = {
  INSTANCE_NAME: "TextInput",
};

const styles = {
  label: StyleUtil.cn("block text-sm font-normal text-gray-70 mb-2 line-clamp-2"),
  inputWrapper: (error: boolean) =>
    StyleUtil.cn(
      "bg-gray-10 border-b border-b-gray-60",
      "has-[input:focus]:outline has-[input:focus]:outline-2 has-[input:focus]:outline-primary-60 has-[input:focus]:-outline-offset-2",
      {
        "border-b-red-60": error,
      },
    ),
  input: StyleUtil.cn(
    "text-sm px-4 h-10 w-full bg-transparent text-gray-100 placeholder:text-gray-50",
  ),
  helperText: StyleUtil.cn("text-sm mt-1 text-gray-70 line-clamp-3"),
};

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string | React.ReactNode;
  error?: boolean;
}

export const TextInput = React.memo(
  React.forwardRef<HTMLInputElement, TextInputProps>((props, ref) => {
    const { label, helperText, error = false, ...rest } = props;

    const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

    const ids = React.useRef({
      container: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
      input: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current, "input"),
      helperText: StringUtil.createElementId(
        constants.INSTANCE_NAME,
        instanceId.current,
        "helper-text",
      ),
    });

    return (
      <div id={ids.current.container}>
        {/* Label */}
        <label htmlFor={ids.current.input} className={styles.label}>
          {label}
        </label>

        {/* Input */}
        <div className={styles.inputWrapper(error)}>
          <input
            ref={ref}
            id={ids.current.input}
            aria-describedby={ids.current.helperText}
            {...rest}
            className={styles.input}
          />
        </div>

        {/* Helper text */}
        <p id={ids.current.helperText} className={styles.helperText}>
          {helperText}
        </p>
      </div>
    );
  }),
);

TextInput.displayName = constants.INSTANCE_NAME;
