import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import React from "react";
import { TextInput } from "@/kits/components/text-input";

const constants = {
  INSTANCE_NAME: "PercentageInput",
};

export interface PercentageInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  label?: string;
  helperText?: string | React.ReactNode;
  error?: boolean;
  value?: number | string;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  decimals?: number;
}

export const PercentageInput = React.memo(
  React.forwardRef<HTMLInputElement, PercentageInputProps>((props, ref) => {
    const {
      label,
      helperText,
      error = false,
      value: valueProp,
      onChange: onChangeProp,
      min = 0,
      max = 100,
      decimals = 0,
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

    const formatPercentage = (value: number | null | undefined): string => {
      if (value === null || value === undefined || isNaN(value)) return "";
      return value.toFixed(decimals);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      if (inputValue === "" || inputValue === null || inputValue === undefined) {
        onChangeProp?.(null);
        return;
      }

      const numValue = parseFloat(inputValue);
      if (!isNaN(numValue)) {
        // Clamp value between min and max
        const clampedValue = Math.max(min, Math.min(max, numValue));
        onChangeProp?.(clampedValue);
      } else {
        onChangeProp?.(null);
      }
    };

    const displayValue = valueProp === null || valueProp === undefined 
      ? "" 
      : formatPercentage(typeof valueProp === "string" ? parseFloat(valueProp) : valueProp);

    return (
      <div id={ids.current.container}>
        <div className="relative">
          <TextInput
            ref={ref}
            id={ids.current.input}
            type="number"
            label={label}
            helperText={helperText}
            error={error}
            value={displayValue}
            onChange={handleChange}
            min={min}
            max={max}
            step={decimals > 0 ? 1 / Math.pow(10, decimals) : 1}
            placeholder={rest.placeholder || "0"}
            {...rest}
          />
          <div className="absolute right-4 top-[38px] text-sm text-gray-70">
            %
          </div>
        </div>
      </div>
    );
  }),
);

PercentageInput.displayName = constants.INSTANCE_NAME;

