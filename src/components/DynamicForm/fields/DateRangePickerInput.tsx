import { CommonUtil, StringUtil } from "@/kits/utils";
import React from "react";
import { DatePickerInput } from "./DatePickerInput";
import dayjs, { Dayjs } from "dayjs";

const constants = {
  INSTANCE_NAME: "DateRangePickerInput",
};

export interface DateRangePickerInputProps {
  label?: string;
  helperText?: string | React.ReactNode;
  error?: boolean;
  value?: { start: string | Date | Dayjs | null; end: string | Date | Dayjs | null } | null;
  onChange?: (value: { start: string | null; end: string | null } | null) => void;
  minDate?: string | Date;
  maxDate?: string | Date;
  format?: string;
  disabled?: boolean;
  placeholder?: string;
}

export const DateRangePickerInput = React.memo(
  React.forwardRef<HTMLDivElement, DateRangePickerInputProps>((props, ref) => {
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
    });

    const range = React.useMemo(() => {
      if (!valueProp) return { start: null, end: null };
      return {
        start: valueProp.start || null,
        end: valueProp.end || null,
      };
    }, [valueProp]);

    const handleStartChange = (start: string | null) => {
      onChangeProp?.({
        start,
        end: range.end?.toString() || "",
      });
    };

    const handleEndChange = (end: string | null) => {
      const startDate = range.start ? dayjs(range.start) : null;
      const endDate = end ? dayjs(end) : null;

      // Validate that end is after start
      if (startDate && endDate && endDate.isBefore(startDate)) {
        return; // Don't update if invalid
      }

      onChangeProp?.({
        start: range.start?.toString() || "",
        end,
      });
    };

    const maxStartDate = range.end ? dayjs(range.end).format("YYYY-MM-DD") : maxDate ? dayjs(maxDate).format("YYYY-MM-DD") : undefined;
    const minEndDate = range.start ? dayjs(range.start).format("YYYY-MM-DD") : minDate ? dayjs(minDate).format("YYYY-MM-DD") : undefined;

    return (
      <div id={ids.current.container} ref={ref} className="space-y-4">
        <DatePickerInput
          label={label ? `${label} (Start)` : "Start Date"}
          helperText={helperText}
          error={error}
          value={range.start}
          onChange={handleStartChange}
          minDate={minDate}
          maxDate={maxStartDate}
          format={format}
          disabled={disabled}
          placeholder={placeholder || "Start date"}
        />
        <DatePickerInput
          label={label ? `${label} (End)` : "End Date"}
          error={error}
          value={range.end}
          onChange={handleEndChange}
          minDate={minEndDate}
          maxDate={maxDate}
          format={format}
          disabled={disabled}
          placeholder={placeholder || "End date"}
        />
      </div>
    );
  }),
);

DateRangePickerInput.displayName = constants.INSTANCE_NAME;

