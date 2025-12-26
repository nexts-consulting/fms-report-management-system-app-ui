import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import React from "react";
import { MultiSelectModal } from "@/kits/components/multi-select-modal";
import { SelectOption } from "../types";

const constants = {
  INSTANCE_NAME: "MultiSelectInput",
};

const styles = {
  selectedTags: StyleUtil.cn("flex flex-wrap gap-2 mt-2"),
  tag: StyleUtil.cn(
    "inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-white text-xs",
  ),
  removeButton: StyleUtil.cn("hover:bg-primary-60 cursor-pointer"),
};

export interface MultiSelectInputProps {
  label?: string;
  helperText?: string | React.ReactNode;
  error?: boolean;
  value?: any[];
  onChange?: (value: any[]) => void;
  options: SelectOption[] | (() => Promise<SelectOption[]>);
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  maxSelections?: number;
}

export const MultiSelectInput = React.memo(
  React.forwardRef<HTMLDivElement, MultiSelectInputProps>((props, ref) => {
    const {
      label,
      helperText,
      error = false,
      value: valueProp = [],
      onChange: onChangeProp,
      options: optionsProp,
      placeholder,
      disabled,
      loading = false,
      maxSelections,
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

    const selectedOptions = React.useMemo(() => {
      if (!Array.isArray(valueProp)) return [];
      return options.filter((opt) => valueProp.includes(opt.value));
    }, [options, valueProp]);

    const handleRemoveOption = (optionValue: any) => {
      const currentValues = Array.isArray(valueProp) ? [...valueProp] : [];
      onChangeProp?.(currentValues.filter((v) => v !== optionValue));
    };

    return (
      <div id={ids.current.container} ref={ref}>
        <MultiSelectModal
          label={label}
          helperText={helperText}
          error={error}
          options={options.map((opt) => ({
            label: opt.label,
            value: opt.value,
            key: opt.value,
            disabled: opt.disabled,
          }))}
          selectedValues={Array.isArray(valueProp) ? valueProp : []}
          onSelect={onChangeProp}
          placeholder={placeholder || "Select options"}
          loading={loading || isLoading}
          maxSelections={maxSelections}
          disabled={disabled}
        />

        {/* Selected Tags */}
        {selectedOptions.length > 0 && (
          <div className={styles.selectedTags}>
            {selectedOptions.map((option) => (
              <span key={option.value} className={styles.tag}>
                {option.label}
                {!disabled && (
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveOption(option.value);
                    }}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }),
);

MultiSelectInput.displayName = constants.INSTANCE_NAME;

