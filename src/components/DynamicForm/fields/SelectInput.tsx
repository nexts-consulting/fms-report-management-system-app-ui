import { CommonUtil, StringUtil } from "@/kits/utils";
import React from "react";
import { SelectModal } from "../../SelectModal";
import { SelectOption } from "../types";

const constants = {
  INSTANCE_NAME: "SelectInput",
};

export interface SelectInputProps {
  label?: string;
  helperText?: string | React.ReactNode;
  error?: boolean;
  value?: any;
  onChange?: (value: any) => void;
  options: SelectOption[] | (() => Promise<SelectOption[]>);
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
}

export const SelectInput = React.memo(
  React.forwardRef<HTMLDivElement, SelectInputProps>((props, ref) => {
    const {
      label,
      helperText,
      error = false,
      value: valueProp,
      onChange: onChangeProp,
      options: optionsProp,
      placeholder,
      disabled,
      loading = false,
    } = props;

    const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

    const ids = React.useRef({
      container: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
    });

    const [options, setOptions] = React.useState<SelectOption[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);

    // Load options if it's a function
    React.useEffect(() => {
      if (typeof optionsProp === "function") {
        setIsLoading(true);
        optionsProp()
          .then((loadedOptions) => {
            setOptions(loadedOptions);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        setOptions(optionsProp);
      }
    }, [optionsProp]);

    const selectedOption = React.useMemo(() => {
      return options.find((opt) => opt.value === valueProp) || null;
    }, [options, valueProp]);

    const handleSelect = (option: { label: string; value: any; key?: string | number } | null) => {
      onChangeProp?.(option?.value ?? null);
    };

    return (
      <div id={ids.current.container} ref={ref}>
        <SelectModal
          label={label}
          helperText={helperText}
          error={error}
          options={options.map((opt) => ({
            label: opt.label,
            value: opt.value,
            key: opt.value,
          }))}
          selectedOption={selectedOption ? {
            label: selectedOption.label,
            value: selectedOption.value,
            key: selectedOption.value,
          } : null}
          onSelect={handleSelect}
          placeholder={placeholder || "Select an option"}
          loading={loading || isLoading}
        />
      </div>
    );
  }),
);

SelectInput.displayName = constants.INSTANCE_NAME;

