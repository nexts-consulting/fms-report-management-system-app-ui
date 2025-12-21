import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import React from "react";
import { Icons } from "@/kits/components/icons";
import { IconButton } from "@/kits/components/icon-button";

const constants = {
  INSTANCE_NAME: "PasswordInput",
};

const styles = {
  label: StyleUtil.cn("block text-sm font-normal text-gray-70 mb-2 line-clamp-2"),
  inputWrapper: (error: boolean) =>
    StyleUtil.cn(
      "flex items-center justify-between border-b bg-gray-10 border-b-gray-60",
      "has-[input:focus]:outline has-[input:focus]:outline-2 has-[input:focus]:outline-primary-60 has-[input:focus]:-outline-offset-2",
      {
        "border-b-red-60": error,
      },
    ),
  input: StyleUtil.cn(
    "text-sm bg-transparent px-4 h-10 w-full text-gray-100 placeholder:text-gray-50",
  ),
  helperText: StyleUtil.cn("text-sm mt-1 text-gray-70 line-clamp-3"),
};

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string | React.ReactNode;
  error?: boolean;
}

export const PasswordInput = React.memo(
  React.forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
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

    const [showPassword, setShowPassword] = React.useState(false);

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
            type={showPassword ? "text" : "password"}
            className={styles.input}
          />
          <IconButton
            aria-label={showPassword ? "Hide password" : "Show password"}
            variant="default"
            size="large"
            icon={showPassword ? Icons.ViewOff : Icons.View}
            onClick={() => setShowPassword(!showPassword)}
            tooltip={showPassword ? "Hide password" : "Show password"}
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

PasswordInput.displayName = constants.INSTANCE_NAME;
