import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import React from "react";
import { TextInput } from "@/kits/components/text-input";
import { MaskType } from "../types";

const constants = {
  INSTANCE_NAME: "MaskedInput",
};

// Predefined mask patterns
const maskPatterns: Record<MaskType, string> = {
  phone: "(999) 999-9999",
  code: "AAA-999",
  id: "999999999",
  custom: "",
};

export interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  label?: string;
  helperText?: string | React.ReactNode;
  error?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  mask: MaskType | string;
  pattern?: string;
}

export const MaskedInput = React.memo(
  React.forwardRef<HTMLInputElement, MaskedInputProps>((props, ref) => {
    const {
      label,
      helperText,
      error = false,
      value: valueProp,
      onChange: onChangeProp,
      mask,
      pattern,
      ...rest
    } = props;

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

    // Get the actual mask pattern
    const getMaskPattern = (): string => {
      if (mask === "custom" && pattern) {
        return pattern;
      }
      if (typeof mask === "string" && mask !== "custom") {
        return maskPatterns[mask as MaskType] || mask;
      }
      return maskPatterns[mask as MaskType] || "";
    };

    const applyMask = (value: string, maskPattern: string): string => {
      if (!maskPattern) return value;

      const maskChars = maskPattern.split("");
      const valueChars = value.replace(/\D/g, "").split("");
      let result = "";
      let valueIndex = 0;

      for (let i = 0; i < maskChars.length && valueIndex < valueChars.length; i++) {
        const maskChar = maskChars[i];
        if (maskChar === "9") {
          // Digit
          if (/[0-9]/.test(valueChars[valueIndex])) {
            result += valueChars[valueIndex];
            valueIndex++;
          } else {
            break;
          }
        } else if (maskChar === "A") {
          // Letter
          if (/[A-Za-z]/.test(valueChars[valueIndex])) {
            result += valueChars[valueIndex].toUpperCase();
            valueIndex++;
          } else {
            break;
          }
        } else {
          // Literal character
          result += maskChar;
        }
      }

      return result;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const maskPattern = getMaskPattern();
      const maskedValue = maskPattern ? applyMask(inputValue, maskPattern) : inputValue;
      onChangeProp?.(maskedValue);
    };

    return (
      <div id={ids.current.container}>
        <TextInput
          ref={ref}
          id={ids.current.input}
          type="text"
          label={label}
          helperText={helperText}
          error={error}
          value={valueProp || ""}
          onChange={handleChange}
          {...rest}
        />
      </div>
    );
  }),
);

MaskedInput.displayName = constants.INSTANCE_NAME;

