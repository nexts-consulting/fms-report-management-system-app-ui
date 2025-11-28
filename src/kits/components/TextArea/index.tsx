import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import React from "react";

const constants = {
  INSTANCE_NAME: "TextArea",
};

const styles = {
  label: StyleUtil.cn("block text-sm font-normal text-gray-70 mb-2 line-clamp-2"),
  textareaWrapper: (error: boolean) =>
    StyleUtil.cn(
      "bg-gray-10 border-b border-b-gray-60 focus-within:outline focus-within:outline-2 focus-within:outline-primary-60 focus-within:-outline-offset-2",
      {
        "border-b-red-60": error,
      },
    ),
  textarea: StyleUtil.cn(
    "text-sm px-4 py-3 w-full bg-transparent text-gray-100 placeholder:text-gray-50 resize-none min-h-[100px] !border-none !outline-none",
  ),
  helperText: StyleUtil.cn("text-sm mt-1 text-gray-70 line-clamp-3"),
};

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string | React.ReactNode;
  error?: boolean;
}

export const TextArea = React.memo(
  React.forwardRef<HTMLTextAreaElement, TextAreaProps>((props, ref) => {
    const { label, helperText, error = false, ...rest } = props;

    const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

    const ids = React.useRef({
      container: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
      textarea: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current, "textarea"),
      helperText: StringUtil.createElementId(
        constants.INSTANCE_NAME,
        instanceId.current,
        "helper-text",
      ),
    });

    return (
      <div id={ids.current.container}>
        {/* Label */}
        <label htmlFor={ids.current.textarea} className={styles.label}>
          {label}
        </label>

        {/* Textarea */}
        <div className={styles.textareaWrapper(error)}>
          <textarea
            ref={ref}
            id={ids.current.textarea}
            aria-describedby={ids.current.helperText}
            {...rest}
            className={styles.textarea}
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

TextArea.displayName = constants.INSTANCE_NAME;
