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
    const [isFocused, setIsFocused] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");

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

    // Sync inputValue with valueProp when not focused
    React.useEffect(() => {
      if (!isFocused) {
        const formatted = valueProp === null || valueProp === undefined 
          ? "" 
          : formatPercentage(typeof valueProp === "string" ? parseFloat(valueProp) : valueProp);
        setInputValue(formatted);
      }
    }, [valueProp, isFocused, decimals]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newInputValue = e.target.value;
      setInputValue(newInputValue);

      if (newInputValue === "" || newInputValue === null || newInputValue === undefined) {
        onChangeProp?.(null);
        return;
      }

      const numValue = parseFloat(newInputValue);
      if (!isNaN(numValue)) {
        // Clamp value between min and max
        const clampedValue = Math.max(min, Math.min(max, numValue));
        onChangeProp?.(clampedValue);
      } else {
        onChangeProp?.(null);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      rest.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      
      // Format the value on blur
      if (inputValue !== "" && inputValue !== null && inputValue !== undefined) {
        const numValue = parseFloat(inputValue);
        if (!isNaN(numValue)) {
          const clampedValue = Math.max(min, Math.min(max, numValue));
          const formatted = formatPercentage(clampedValue);
          setInputValue(formatted);
          onChangeProp?.(clampedValue);
        }
      }
      
      rest.onBlur?.(e);
    };

    const displayValue = inputValue;

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
            onFocus={handleFocus}
            onBlur={handleBlur}
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

