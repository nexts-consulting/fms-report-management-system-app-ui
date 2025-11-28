import { Icons } from "@/kits/components/Icons";
import React from "react";
import { useControllableState } from "@/kits/hooks/use-controllable-state";
import { cssClamp, StyleUtil } from "@/kits/utils";
import { motion } from "framer-motion";
import { CheckIcon } from "lucide-react";

const constants = {
  INSTANCE_NAME: "CheckboxGroupInput",
};

export interface CheckboxOption {
  label: string;
  value: any;
}

export interface CheckboxGroupInputProps {
  label?: string;
  options: CheckboxOption[];
  value?: any;
  onChange?: (value: any) => void;
  multiple?: boolean;
  grid?: number;
  error?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  onToggleOption?: (optionValue: any, isChecked: boolean) => void;
}

export const CheckboxGroupInput = React.memo(
  React.forwardRef<HTMLDivElement, CheckboxGroupInputProps>((props, ref) => {
    const {
      label,
      options,
      value: controlledValue,
      onChange,
      multiple = false,
      error,
      grid = 2,
      readonly = false,
      disabled = false,
      onToggleOption,
    } = props;

    const [value, setValue] = useControllableState({
      prop: controlledValue,
      onChange,
    });

    const handleChange = (optionValue: any) => {
      if (readonly || disabled) return;

      if (multiple) {
        const currentValue = Array.isArray(value) ? value : [];
        const newValue = currentValue.includes(optionValue)
          ? currentValue.filter((v) => v !== optionValue)
          : [...currentValue, optionValue];
        setValue(newValue);
        if (onToggleOption) {
          const isChecked = multiple
            ? Array.isArray(newValue) && newValue.includes(optionValue)
            : value === optionValue;
          onToggleOption(optionValue, isChecked);
        }
      } else {
        setValue(optionValue);
        if (onToggleOption) {
          const isChecked = value === optionValue;
          onToggleOption(optionValue, isChecked);
        }
      }
    };

    return (
      <div ref={ref} role="group" aria-label={label}>
        {label && (
          <p className="mb-2 line-clamp-2 block text-sm font-normal text-gray-70">{label}</p>
        )}
        <div
          className={StyleUtil.cn("grid select-none gap-2", {
            "grid-cols-1": grid === 1,
            "grid-cols-2": grid === 2,
            "grid-cols-3": grid === 3,
            "grid-cols-4": grid === 4,
          })}
        >
          {options.map((option) => {
            const isChecked = multiple
              ? Array.isArray(value) && value.includes(option.value)
              : value === option.value;

            return (
              <div
                key={option.value}
                className={StyleUtil.cn(
                  "flex cursor-pointer items-center gap-3 rounded-full bg-white p-3",
                  {
                    "cursor-not-allowed opacity-50": disabled,
                    "bg-[#e7f9a1]": isChecked,
                  },
                )}
                onClick={() => handleChange(option.value)}
              >
                <div
                  role="checkbox"
                  tabIndex={0}
                  aria-checked={isChecked}
                  data-checked={isChecked}
                  className="shrink-0"
                >
                  {!isChecked && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-600 bg-white" />
                  )}
                  {isChecked && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        damping: 15,
                        stiffness: 300,
                        duration: 0.4,
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#6cec52] bg-[#6cec52]"
                    >
                      <CheckIcon className="h-4 w-4 text-[#050ba9]" />
                    </motion.div>
                  )}
                </div>
                <p
                  className={StyleUtil.cn(
                    "line-clamp-2 cursor-pointer font-vnm-sans-display text-sm leading-none",
                    {
                      "text-[#050ba9]": isChecked,
                      "text-slate-600": !isChecked,
                    },
                  )}
                  style={{
                    fontSize: cssClamp(20, 24, 250, 500),
                  }}
                >
                  {option.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }),
);

CheckboxGroupInput.displayName = constants.INSTANCE_NAME;
