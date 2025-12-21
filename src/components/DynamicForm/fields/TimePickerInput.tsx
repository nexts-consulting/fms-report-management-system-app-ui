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

    const formatTime = (time: string | Dayjs | null | undefined): string => {
      if (!time) return "";
      const t = typeof time === "string" ? dayjs(time, "HH:mm") : dayjs(time);
      if (!t.isValid()) return "";
      return format === "24h" ? t.format("HH:mm") : t.format("hh:mm A");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      if (!inputValue) {
        onChangeProp?.(null);
        return;
      }

      const time = dayjs(inputValue, "HH:mm");
      if (time.isValid()) {
        onChangeProp?.(time.format("HH:mm"));
      } else {
        onChangeProp?.(null);
      }
    };

    const displayValue = formatTime(valueProp);

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
          placeholder={placeholder || (format === "24h" ? "HH:mm" : "hh:mm AM/PM")}
        />
      </div>
    );
  }),
);

TimePickerInput.displayName = constants.INSTANCE_NAME;

