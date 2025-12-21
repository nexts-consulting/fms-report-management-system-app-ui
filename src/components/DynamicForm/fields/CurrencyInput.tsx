import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import React from "react";
import { TextInput } from "@/kits/components/text-input";

const constants = {
  INSTANCE_NAME: "CurrencyInput",
};

export interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  label?: string;
  helperText?: string | React.ReactNode;
  error?: boolean;
  value?: number | string;
  onChange?: (value: number | null) => void;
  currency?: string;
  min?: number;
  max?: number;
  decimals?: number;
}

export const CurrencyInput = React.memo(
  React.forwardRef<HTMLInputElement, CurrencyInputProps>((props, ref) => {
    const {
      label,
      helperText,
      error = false,
      value: valueProp,
      onChange: onChangeProp,
      currency = "VND",
      min,
      max,
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

    const formatCurrency = (value: number | null | undefined): string => {
      if (value === null || value === undefined || isNaN(value)) return "";
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
        .format(value)
        .replace(/[₫$€£¥]/g, "")
        .trim();
    };

    const parseCurrency = (value: string): number | null => {
      const cleaned = value.replace(/[^\d.,]/g, "").replace(/\./g, "").replace(",", ".");
      const numValue = parseFloat(cleaned);
      return isNaN(numValue) ? null : numValue;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      if (inputValue === "" || inputValue === null || inputValue === undefined) {
        onChangeProp?.(null);
        return;
      }

      const numValue = parseCurrency(inputValue);
      onChangeProp?.(numValue);
    };

    const displayValue = valueProp === null || valueProp === undefined 
      ? "" 
      : formatCurrency(typeof valueProp === "string" ? parseFloat(valueProp) : valueProp);

    return (
      <div id={ids.current.container}>
        <div className="relative">
          <TextInput
            ref={ref}
            id={ids.current.input}
            type="text"
            label={label}
            helperText={helperText}
            error={error}
            value={displayValue}
            onChange={handleChange}
            placeholder={rest.placeholder || `0 ${currency}`}
            {...rest}
          />
          <div className="absolute right-4 top-[38px] text-sm text-gray-70">
            {currency}
          </div>
        </div>
      </div>
    );
  }),
);

CurrencyInput.displayName = constants.INSTANCE_NAME;

