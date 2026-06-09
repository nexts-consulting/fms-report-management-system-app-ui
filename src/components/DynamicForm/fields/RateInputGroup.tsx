import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import React from "react";
import { RateInput, RateInputVariant } from "./RateInput";

const constants = {
  INSTANCE_NAME: "RateInputGroup",
};

const styles = {
  container: StyleUtil.cn("divide-y divide-gray-200 bg-white"),
  item: StyleUtil.cn("py-3"),
  itemName: StyleUtil.cn("text-sm font-medium text-gray-900"),
  itemDescription: (hasValue: boolean) =>
    StyleUtil.cn("text-xs mt-1", {
      "font-semibold text-primary-50": hasValue,
      "text-gray-500": !hasValue,
    }),
  itemInputWrapper: StyleUtil.cn("mt-2"),
  helperText: StyleUtil.cn("text-sm mt-1 text-gray-70 line-clamp-3"),
};

export interface RateInputGroupItem {
  code: string;
  name: string;
  description?: string;
  data?: Record<string, any>;
  groupKey?: string;
}

export interface RateInputGroupProps {
  label?: string;
  helperText?: string | React.ReactNode;
  error?: boolean;
  items: RateInputGroupItem[];
  value?: Record<string, number>;
  onChange?: (value: Record<string, number>) => void;
  min?: number;
  max?: number;
  count?: number;
  allowClear?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  variant?: RateInputVariant;
}

export const RateInputGroup = React.memo(
  React.forwardRef<HTMLDivElement, RateInputGroupProps>((props, ref) => {
    const {
      label,
      helperText,
      error = false,
      items,
      value: valueProp = {},
      onChange: onChangeProp,
      min = 1,
      max,
      count = 5,
      allowClear = true,
      variant = "star",
      disabled = false,
      readonly = false,
    } = props;

    const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

    const ids = React.useRef({
      container: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
      helperText: StringUtil.createElementId(
        constants.INSTANCE_NAME,
        instanceId.current,
        "helper-text",
      ),
    });

    const getItemValue = (itemCode: string): number | null => {
      const raw = valueProp[itemCode];
      if (raw === null || raw === undefined) return null;
      const num = typeof raw === "number" ? raw : parseFloat(String(raw));
      return Number.isFinite(num) ? num : null;
    };

    const hasValue = (itemCode: string): boolean => {
      const val = getItemValue(itemCode);
      return val !== null && val !== undefined && !Number.isNaN(val);
    };

    const handleItemChange = (itemCode: string, newValue: number | null) => {
      const next = { ...valueProp };
      if (newValue === null || Number.isNaN(newValue)) {
        delete next[itemCode];
      } else {
        next[itemCode] = newValue;
      }
      onChangeProp?.(next);
    };

    return (
      <div id={ids.current.container} ref={ref}>
        {label && <div className="mb-2 text-sm font-medium text-gray-900">{label}</div>}
        <div className={styles.container}>
          {items.map((item) => {
            const itemValue = getItemValue(item.code);
            const itemHasValue = hasValue(item.code);

            return (
              <div key={item.code} className={styles.item}>
                <p className={styles.itemName}>{item.name}</p>
                {item.description && (
                  <p className={styles.itemDescription(itemHasValue)}>{item.description}</p>
                )}
                <div className={styles.itemInputWrapper}>
                  <RateInput
                    value={itemValue}
                    onChange={(value) => handleItemChange(item.code, value)}
                    min={min}
                    max={max}
                    count={count}
                    variant={variant}
                    allowClear={allowClear}
                    disabled={disabled}
                    readonly={readonly}
                    error={error}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {helperText && (
          <p id={ids.current.helperText} className={styles.helperText}>
            {helperText}
          </p>
        )}
      </div>
    );
  }),
);

RateInputGroup.displayName = constants.INSTANCE_NAME;
