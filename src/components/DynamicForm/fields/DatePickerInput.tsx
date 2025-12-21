import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import React from "react";
import { TextInput } from "@/kits/components/text-input";
import dayjs, { Dayjs } from "dayjs";

const constants = {
  INSTANCE_NAME: "DatePickerInput",
};

export interface DatePickerInputProps {
  label?: string;
  helperText?: string | React.ReactNode;
  error?: boolean;
  value?: string | Date | Dayjs | null;
  onChange?: (value: string | null) => void;
  minDate?: string | Date;
  maxDate?: string | Date;
  format?: string;
  disabled?: boolean;
  placeholder?: string;
}

export const DatePickerInput = React.memo(
  React.forwardRef<HTMLInputElement, DatePickerInputProps>((props, ref) => {
    const {
      label,
      helperText,
      error = false,
      value: valueProp,
      onChange: onChangeProp,
      minDate,
      maxDate,
      format = "YYYY-MM-DD",
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

    const formatDate = (date: string | Date | Dayjs | null | undefined): string => {
      if (!date) return "";
      const d = dayjs(date);
      return d.isValid() ? d.format(format) : "";
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      if (!inputValue) {
        onChangeProp?.(null);
        return;
      }

      const date = dayjs(inputValue, format);
      if (date.isValid()) {
        onChangeProp?.(date.format(format));
      } else {
        onChangeProp?.(null);
      }
    };

    const displayValue = formatDate(valueProp);
    const minDateStr = minDate ? dayjs(minDate).format("YYYY-MM-DD") : undefined;
    const maxDateStr = maxDate ? dayjs(maxDate).format("YYYY-MM-DD") : undefined;

    return (
      <div id={ids.current.container}>
        <TextInput
          ref={ref}
          id={ids.current.input}
          type="date"
          label={label}
          helperText={helperText}
          error={error}
          value={displayValue}
          onChange={handleChange}
          min={minDateStr}
          max={maxDateStr}
          disabled={disabled}
          placeholder={placeholder || format}
        />
      </div>
    );
  }),
);

DatePickerInput.displayName = constants.INSTANCE_NAME;

