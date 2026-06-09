import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import React from "react";

const constants = {
  INSTANCE_NAME: "RateInput",
};

export type RateInputVariant = "star" | "number";

const SHARP_STAR_PATH =
  "M12 1.75 L14.95 8.6 L22.25 9.15 L16.6 14.05 L18.2 21.3 L12 17.85 L5.8 21.3 L7.4 14.05 L1.75 9.15 L9.05 8.6 Z";

const styles = {
  label: StyleUtil.cn("block text-sm font-normal text-gray-70 mb-2 line-clamp-2"),
  options: StyleUtil.cn("flex flex-wrap items-center gap-1"),
  optionButton: (active: boolean, disabled: boolean, hasError: boolean, square = false) =>
    StyleUtil.cn(
      "inline-flex items-center justify-center border text-sm font-medium transition-colors",
      "focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-primary-60",
      square ? "h-9 w-9" : "h-9 min-w-9 px-2",
      {
        "border-primary-50 text-primary-60": active,
        "border-gray-30 bg-white text-gray-70 hover:border-primary-40 hover:text-primary-50":
          !active && !disabled,
        "cursor-not-allowed opacity-50": disabled,
        "border-red-60": hasError,
      },
    ),
  helperText: StyleUtil.cn("text-sm mt-1 text-gray-70 line-clamp-3"),
  errorText: StyleUtil.cn("text-sm mt-1 text-red-60"),
};

function SharpStarIcon(props: { filled?: boolean; className?: string }) {
  const { filled = false, className } = props;
  return (
    <svg
      className={StyleUtil.cn("h-5 w-5", className)}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        d={SHARP_STAR_PATH}
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.25}
        strokeLinejoin="miter"
        strokeLinecap="butt"
      />
    </svg>
  );
}

export interface RateInputProps {
  label?: string;
  helperText?: string | React.ReactNode;
  error?: boolean;
  value?: number | null;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  count?: number;
  variant?: RateInputVariant;
  allowClear?: boolean;
  disabled?: boolean;
  readonly?: boolean;
}

export const RateInput = React.memo(
  React.forwardRef<HTMLDivElement, RateInputProps>((props, ref) => {
    const {
      label,
      helperText,
      error = false,
      value: valueProp,
      onChange: onChangeProp,
      min = 1,
      max,
      count = 5,
      variant = "star",
      allowClear = true,
      disabled = false,
      readonly = false,
    } = props;

    const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));
    const effectiveMax = max ?? min + count - 1;
    const options = React.useMemo(() => {
      const items: number[] = [];
      for (let i = min; i <= effectiveMax; i += 1) {
        items.push(i);
      }
      return items;
    }, [min, effectiveMax]);

    const ids = React.useRef({
      container: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
      helperText: StringUtil.createElementId(
        constants.INSTANCE_NAME,
        instanceId.current,
        "helper-text",
      ),
      option: (score: number) =>
        StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current, "option", String(score)),
    });

    const handleSelect = (score: number) => {
      if (disabled || readonly) return;
      if (allowClear && valueProp === score) {
        onChangeProp?.(null);
        return;
      }
      onChangeProp?.(score);
    };

    const isOptionActive = (score: number): boolean => {
      if (valueProp === null || valueProp === undefined) return false;
      if (variant === "number") return valueProp === score;
      return score <= valueProp;
    };

    return (
      <div id={ids.current.container} ref={ref}>
        {label && <label className={styles.label}>{label}</label>}
        <div className={styles.options} role="radiogroup" aria-label={label || "Rate input"}>
          {options.map((score) => {
            const active = isOptionActive(score);
            return (
              <button
                key={score}
                id={ids.current.option(score)}
                type="button"
                role="radio"
                aria-checked={valueProp === score}
                aria-label={`${score}`}
                disabled={disabled || readonly}
                className={styles.optionButton(active, disabled || readonly, error, variant === "number")}
                onClick={() => handleSelect(score)}
              >
                {variant === "number" ? score : <SharpStarIcon filled={active} />}
              </button>
            );
          })}
        </div>
        {error && typeof helperText === "string" && helperText ? (
          <p className={styles.errorText}>{helperText}</p>
        ) : helperText ? (
          <p id={ids.current.helperText} className={styles.helperText}>
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }),
);

RateInput.displayName = constants.INSTANCE_NAME;
