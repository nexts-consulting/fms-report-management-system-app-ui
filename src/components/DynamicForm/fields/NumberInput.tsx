import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import React from "react";
import { TextInput } from "@/kits/components/text-input";

const constants = {
  INSTANCE_NAME: "NumberInput",
};

const styles = {
  label: StyleUtil.cn("block text-sm font-normal text-gray-70 mb-2 line-clamp-2"),
  inputWrapper: (error: boolean) =>
    StyleUtil.cn(
      "bg-gray-10 border-b border-b-gray-60",
      "has-[input:focus]:outline has-[input:focus]:outline-2 has-[input:focus]:outline-primary-60 has-[input:focus]:-outline-offset-2",
      {
        "border-b-red-60": error,
      },
    ),
  input: StyleUtil.cn(
    "text-sm px-4 h-10 w-full bg-transparent text-gray-100 placeholder:text-gray-50",
  ),
  helperText: StyleUtil.cn("text-sm mt-1 text-gray-70 line-clamp-3"),
};

export interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  label?: string;
  helperText?: string | React.ReactNode;
  error?: boolean;
  value?: number | string;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const NumberInput = React.memo(
  React.forwardRef<HTMLInputElement, NumberInputProps>((props, ref) => {
    const {
      label,
      helperText,
      error = false,
      value: valueProp,
      onChange: onChangeProp,
      min,
      max,
      step,
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      if (inputValue === "" || inputValue === null || inputValue === undefined) {
        onChangeProp?.(null);
        return;
      }

      const numValue = parseFloat(inputValue);
      if (!isNaN(numValue)) {
        onChangeProp?.(numValue);
      } else {
        onChangeProp?.(null);
      }
    };

    const displayValue = valueProp === null || valueProp === undefined ? "" : String(valueProp);

    return (
      <div id={ids.current.container}>
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
          step={step}
          {...rest}
        />
      </div>
    );
  }),
);

NumberInput.displayName = constants.INSTANCE_NAME;

