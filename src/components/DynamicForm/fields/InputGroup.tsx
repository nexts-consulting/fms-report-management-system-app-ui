import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import React from "react";
import { IconButton } from "@/kits/components/icon-button";
import { Icons } from "@/kits/components/icons";

const constants = {
  INSTANCE_NAME: "InputGroup",
};

const styles = {
  container: StyleUtil.cn("divide-y divide-gray-200 bg-white"),
  item: StyleUtil.cn("py-2"),
  itemContent: StyleUtil.cn("grid grid-cols-3 items-center gap-2"),
  itemInfo: StyleUtil.cn("col-span-2"),
  itemName: StyleUtil.cn("text-sm font-medium text-gray-900"),
  itemDescription: (hasValue: boolean) =>
    StyleUtil.cn("text-xs", {
      "font-semibold text-primary-50": hasValue,
      "text-gray-500": !hasValue,
    }),
  itemInputWrapper: StyleUtil.cn("flex items-center justify-end gap-2"),
  itemInputWithButtons: StyleUtil.cn("flex items-center gap-2"),
  itemUnit: StyleUtil.cn("text-sm text-gray-500"),
  input: (hasError: boolean, hasValue: boolean, showButtons: boolean) =>
    StyleUtil.cn(
      "border px-3 py-2 text-right font-medium",
      "focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-primary-50",
      {
        "w-20": !showButtons,
        "w-16": showButtons,
        "border-red-500": hasError,
        "border-gray-300": !hasError && !hasValue,
        "border-green-30 bg-green-10/10 text-green-50": hasValue && !hasError,
      },
    ),
  helperText: StyleUtil.cn("text-sm mt-1 text-gray-70 line-clamp-3"),
};

export interface InputGroupItem {
  /**
   * Unique identifier for the item
   */
  code: string;
  /**
   * Item name/title
   */
  name: string;
  /**
   * Item description (e.g., gift, SKU, etc.)
   */
  description?: string;
  /**
   * Unit label (e.g., "pcs", "kg", etc.)
   */
  unit?: string;
  /**
   * Additional data for the item
   */
  data?: Record<string, any>;

  /**
   * Group key for grouping (used in GroupedInputGroup)
   */
  groupKey?: string;
}

export interface InputGroupProps {
  /**
   * Label for the input group
   */
  label?: string;
  /**
   * Helper text
   */
  helperText?: string | React.ReactNode;
  /**
   * Error state
   */
  error?: boolean;
  /**
   * Items to display
   */
  items: InputGroupItem[];
  /**
   * Current values: { [itemCode]: number }
   */
  value?: Record<string, number>;
  /**
   * Callback when value changes
   */
  onChange?: (value: Record<string, number>) => void;
  /**
   * Field name prefix for each item (e.g., "items" will create "items.${code}.pcs")
   */
  fieldNamePrefix?: string;
  /**
   * Field name suffix for each item (default: "pcs")
   */
  fieldNameSuffix?: string;
  /**
   * Minimum value for inputs
   */
  min?: number;
  /**
   * Maximum value for inputs
   */
  max?: number;
  /**
   * Step value for inputs
   */
  step?: number;
  /**
   * Whether inputs are disabled
   */
  disabled?: boolean;
  /**
   * Whether inputs are readonly
   */
  readonly?: boolean;
  /**
   * Custom error messages per item: { [itemCode]: string }
   */
  errors?: Record<string, string>;
  /**
   * Layout variant
   */
  layout?: "grid" | "flex";
  /**
   * Show increment/decrement buttons (+ and -)
   */
  showButtons?: boolean;
  /**
   * Step value for increment/decrement buttons (default: 1)
   */
  buttonStep?: number;
}

export const InputGroup = React.memo(
  React.forwardRef<HTMLDivElement, InputGroupProps>((props, ref) => {
    const {
      label,
      helperText,
      error = false,
      items,
      value: valueProp = {},
      onChange: onChangeProp,
      fieldNamePrefix = "items",
      fieldNameSuffix = "pcs",
      min = 0,
      max,
      step,
      disabled = false,
      readonly = false,
      errors: errorsProp = {},
      layout = "grid",
      showButtons = false,
      buttonStep = 1,
    } = props;

    const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

    const ids = React.useRef({
      container: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
      helperText: StringUtil.createElementId(
        constants.INSTANCE_NAME,
        instanceId.current,
        "helper-text",
      ),
      input: (itemCode: string) =>
        StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current, "input", itemCode),
    });

    const getItemValue = (itemCode: string): number => {
      const fieldPath = fieldNamePrefix
        ? `${fieldNamePrefix}.${itemCode}.${fieldNameSuffix}`
        : `${itemCode}.${fieldNameSuffix}`;
      return valueProp[itemCode] ?? valueProp[fieldPath] ?? 0;
    };

    const getItemError = (itemCode: string): boolean => {
      const fieldPath = fieldNamePrefix
        ? `${fieldNamePrefix}.${itemCode}.${fieldNameSuffix}`
        : `${itemCode}.${fieldNameSuffix}`;
      return !!errorsProp[itemCode] || !!errorsProp[fieldPath];
    };

    const hasValue = (itemCode: string): boolean => {
      const val = getItemValue(itemCode);
      return val !== undefined && val !== null && !isNaN(val) && val > 0;
    };

    const handleItemChange = (itemCode: string, newValue: number | null) => {
      const numValue = newValue === null || isNaN(newValue) ? 0 : newValue;
      // Clamp value between min and max
      const clampedValue = max !== undefined 
        ? Math.max(min || 0, Math.min(max, numValue))
        : Math.max(min || 0, numValue);
      const newValues = { ...valueProp, [itemCode]: clampedValue };
      onChangeProp?.(newValues);
    };

    const handleIncrement = (itemCode: string) => {
      const currentValue = getItemValue(itemCode);
      const newValue = currentValue + (step || buttonStep || 1);
      handleItemChange(itemCode, newValue);
    };

    const handleDecrement = (itemCode: string) => {
      const currentValue = getItemValue(itemCode);
      const newValue = Math.max(min || 0, currentValue - (step || buttonStep || 1));
      handleItemChange(itemCode, newValue);
    };

    return (
      <div id={ids.current.container} ref={ref}>
        {/* Items */}
        <div className={styles.container}>
          {items.map((item) => {
            const itemValue = getItemValue(item.code);
            const itemError = getItemError(item.code);
            const itemHasValue = hasValue(item.code);

            return (
              <div key={item.code} className={styles.item}>
                {layout === "grid" ? (
                  <div className={styles.itemContent}>
                    <div className={styles.itemInfo}>
                      <p className={styles.itemName}>{item.name}</p>
                      {item.description && (
                        <p className={styles.itemDescription(itemHasValue)}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className={styles.itemInputWrapper}>
                      {item.unit && <span className={styles.itemUnit}>{item.unit}</span>}
                      {showButtons ? (
                        <div className={styles.itemInputWithButtons}>
                          <IconButton
                            size="large"
                            variant="tertiary"
                            icon={Icons.Subtract}
                            onClick={() => handleDecrement(item.code)}
                            disabled={disabled || readonly || itemValue <= (min || 0)}
                          />
                          <input
                            id={ids.current.input(item.code)}
                            type="number"
                            min={min}
                            max={max}
                            step={step}
                            value={itemValue || ""}
                            onChange={(e) => {
                              const numValue = e.target.value === "" ? null : parseFloat(e.target.value);
                              handleItemChange(item.code, numValue);
                            }}
                            disabled={disabled}
                            readOnly={readonly || showButtons}
                            className={styles.input(itemError, itemHasValue, showButtons)}
                          />
                          <IconButton
                            size="large"
                            variant="tertiary"
                            icon={Icons.Add}
                            onClick={() => handleIncrement(item.code)}
                            disabled={
                              disabled ||
                              readonly ||
                              (max !== undefined && itemValue >= max)
                            }
                          />
                        </div>
                      ) : (
                        <input
                          id={ids.current.input(item.code)}
                          type="number"
                          min={min}
                          max={max}
                          step={step}
                          value={itemValue || ""}
                          onChange={(e) => {
                            const numValue = e.target.value === "" ? null : parseFloat(e.target.value);
                            handleItemChange(item.code, numValue);
                          }}
                          disabled={disabled}
                          readOnly={readonly}
                          className={styles.input(itemError, itemHasValue, showButtons)}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className={styles.itemName}>{item.name}</p>
                      {item.description && (
                        <p className={styles.itemDescription(itemHasValue)}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className={styles.itemInputWrapper}>
                      {item.unit && <span className={styles.itemUnit}>{item.unit}</span>}
                      {showButtons ? (
                        <div className={styles.itemInputWithButtons}>
                          <IconButton
                            size="large"
                            variant="tertiary"
                            icon={Icons.Subtract}
                            onClick={() => handleDecrement(item.code)}
                            disabled={disabled || readonly || itemValue <= (min || 0)}
                          />
                          <input
                            id={ids.current.input(item.code)}
                            type="number"
                            min={min}
                            max={max}
                            step={step}
                            value={itemValue || ""}
                            onChange={(e) => {
                              const numValue = e.target.value === "" ? null : parseFloat(e.target.value);
                              handleItemChange(item.code, numValue);
                            }}
                            disabled={disabled}
                            readOnly={readonly || showButtons}
                            className={styles.input(itemError, itemHasValue, showButtons)}
                          />
                          <IconButton
                            size="large"
                            variant="tertiary"
                            icon={Icons.Add}
                            onClick={() => handleIncrement(item.code)}
                            disabled={
                              disabled ||
                              readonly ||
                              (max !== undefined && itemValue >= max)
                            }
                          />
                        </div>
                      ) : (
                        <input
                          id={ids.current.input(item.code)}
                          type="number"
                          min={min}
                          max={max}
                          step={step}
                          value={itemValue || ""}
                          onChange={(e) => {
                            const numValue = e.target.value === "" ? null : parseFloat(e.target.value);
                            handleItemChange(item.code, numValue);
                          }}
                          disabled={disabled}
                          readOnly={readonly}
                          className={styles.input(itemError, itemHasValue, showButtons)}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Helper text */}
        {helperText && (
          <p id={ids.current.helperText} className={styles.helperText}>
            {helperText}
          </p>
        )}
      </div>
    );
  }),
);

InputGroup.displayName = constants.INSTANCE_NAME;

