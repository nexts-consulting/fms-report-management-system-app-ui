import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import React from "react";
import { TextInput } from "@/kits/components/text-input";
import dayjs, { Dayjs } from "dayjs";

const constants = {
  INSTANCE_NAME: "TimePickerInput",
};

export interface TimePickerInputProps {
  label?: string;
  helperText?: string | React.ReactNode;
  error?: boolean;
  value?: string | Dayjs | null;
  onChange?: (value: string | null) => void;
  minTime?: string;
  maxTime?: string;
  format?: "12h" | "24h";
  disabled?: boolean;
  placeholder?: string;
}

export const TimePickerInput = React.memo(
  React.forwardRef<HTMLInputElement, TimePickerInputProps>((props, ref) => {
    const {
      label,
      helperText,
      error = false,
      value: valueProp,
      onChange: onChangeProp,
      minTime,
      maxTime,
      format = "24h",
      disabled,
      placeholder,
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

    const formatTime = React.useCallback((time: string | Dayjs | null | undefined): string => {
      if (!time) return "";
      const t = typeof time === "string" ? dayjs(time, "HH:mm", true) : dayjs(time);
      if (!t.isValid()) return "";
      // Always use 24h format for HTML input type="time"
      return t.format("HH:mm");
    }, []);

    // Local state to hold the current input value to prevent reset during state updates
    const [localValue, setLocalValue] = React.useState<string>(() => formatTime(valueProp));

    // Update local value when valueProp changes from external source
    React.useEffect(() => {
      const formatted = formatTime(valueProp);
      // Only update if valueProp actually has a value (not null/undefined)
      // This prevents resetting when parent hasn't updated yet
      if (formatted) {
        setLocalValue(formatted);
      } else if (valueProp === null) {
        // Explicitly clear if valueProp is explicitly null
        setLocalValue("");
      }
    }, [valueProp, formatTime]);

    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      // Update local state immediately to prevent input reset
      setLocalValue(inputValue);
      
      if (!inputValue) {
        onChangeProp?.(null);
        return;
      }
      onChangeProp?.(inputValue);
    }, [onChangeProp]);

    // Use localValue to ensure input doesn't reset during state updates
    const displayValue = localValue;
    return (
      <div id={ids.current.container}>
        <TextInput
          ref={ref}
          id={ids.current.input}
          type="time"
          label={label}
          helperText={helperText}
          error={error}
          value={displayValue}
          onChange={handleChange}
          min={minTime}
          max={maxTime}
          disabled={disabled}
          placeholder={placeholder || "HH:mm"}
        />
      </div>
    );
  }),
);

TimePickerInput.displayName = constants.INSTANCE_NAME;

