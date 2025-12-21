import { CommonUtil, StringUtil } from "@/kits/utils";
import React from "react";
import { DatePickerInput } from "./DatePickerInput";
import { TimePickerInput } from "./TimePickerInput";
import dayjs, { Dayjs } from "dayjs";

const constants = {
  INSTANCE_NAME: "DateTimePickerInput",
};

export interface DateTimePickerInputProps {
  label?: string;
  helperText?: string | React.ReactNode;
  error?: boolean;
  value?: string | Date | Dayjs | null;
  onChange?: (value: string | null) => void;
  minDateTime?: string | Date;
  maxDateTime?: string | Date;
  format?: string;
  disabled?: boolean;
  placeholder?: string;
}

export const DateTimePickerInput = React.memo(
  React.forwardRef<HTMLDivElement, DateTimePickerInputProps>((props, ref) => {
    const {
      label,
      helperText,
      error = false,
      value: valueProp,
      onChange: onChangeProp,
      minDateTime,
      maxDateTime,
      format = "YYYY-MM-DD HH:mm",
      disabled,
      placeholder,
    } = props;

    const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

    const ids = React.useRef({
      container: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
    });

    const dateTime = React.useMemo(() => {
      if (!valueProp) return { date: null, time: null };
      const dt = dayjs(valueProp);
      return {
        date: dt.isValid() ? dt.format("YYYY-MM-DD") : null,
        time: dt.isValid() ? dt.format("HH:mm") : null,
      };
    }, [valueProp]);

    const handleDateChange = (date: string | null) => {
      const time = dateTime.time || "00:00";
      if (date) {
        const newDateTime = dayjs(`${date} ${time}`, "YYYY-MM-DD HH:mm");
        onChangeProp?.(newDateTime.isValid() ? newDateTime.format(format) : null);
      } else {
        onChangeProp?.(null);
      }
    };

    const handleTimeChange = (time: string | null) => {
      const date = dateTime.date || dayjs().format("YYYY-MM-DD");
      if (time) {
        const newDateTime = dayjs(`${date} ${time}`, "YYYY-MM-DD HH:mm");
        onChangeProp?.(newDateTime.isValid() ? newDateTime.format(format) : null);
      } else if (dateTime.date) {
        onChangeProp?.(dayjs(`${dateTime.date} 00:00`, "YYYY-MM-DD HH:mm").format(format));
      }
    };

    return (
      <div id={ids.current.container} ref={ref} className="space-y-4">
        <DatePickerInput
          label={label}
          helperText={helperText}
          error={error}
          value={dateTime.date}
          onChange={handleDateChange}
          minDate={minDateTime ? dayjs(minDateTime).format("YYYY-MM-DD") : undefined}
          maxDate={maxDateTime ? dayjs(maxDateTime).format("YYYY-MM-DD") : undefined}
          disabled={disabled}
          placeholder={placeholder}
        />
        <TimePickerInput
          label="Time"
          value={dateTime.time}
          onChange={handleTimeChange}
          disabled={disabled}
        />
      </div>
    );
  }),
);

DateTimePickerInput.displayName = constants.INSTANCE_NAME;

