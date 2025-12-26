/**
 * Field Renderer Component
 * 
 * Renders individual form fields based on their configuration
 */

import React from "react";
import { FieldConfig } from "./types";
import { NumberInput } from "./fields/NumberInput";
import { CurrencyInput } from "./fields/CurrencyInput";
import { PercentageInput } from "./fields/PercentageInput";
import { MaskedInput } from "./fields/MaskedInput";
import { SelectWithDynamic } from "./fields/SelectWithDynamic";
import { MultiSelectWithDynamic } from "./fields/MultiSelectWithDynamic";
import { CheckboxInput } from "./fields/CheckboxInput";
import { SwitchInput } from "./fields/SwitchInput";
import { DatePickerInput } from "./fields/DatePickerInput";
import { TimePickerInput } from "./fields/TimePickerInput";
import { DateTimePickerInput } from "./fields/DateTimePickerInput";
import { DateRangePickerInput } from "./fields/DateRangePickerInput";
import { InputGroup, InputGroupItem } from "./fields/InputGroup";
import { GroupedInputGroup } from "./fields/GroupedInputGroup";

import { TextInput } from "@/kits/components/text-input";
import { TextArea } from "@/kits/components/text-area";
import { ImageCaptureInputWithUpload } from "@/kits/components/image-capture-input-upload";
import { MultipleImagesCaptureInputUpload } from "@/kits/components/multiple-images-capture-input-upload";


export interface FieldRendererProps {
  field: FieldConfig;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
  formData?: Record<string, any>; // Add formData to access other field values
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
  formData = {},
}) => {
  const commonProps = {
    label: field.label,
    helperText: field.helperText,
    error: !!error,
    disabled: disabled || field.disabled,
    placeholder: field.placeholder,
  };

  switch (field.type) {
    case "text":
      return (
        <TextInput
          {...commonProps}
          type={field.inputType || "text"}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          maxLength={field.maxLength}
          minLength={field.minLength}
          readOnly={field.readonly}
        />
      );

    case "textarea":
      return (
        <TextArea
          {...commonProps}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={field.rows}
          maxLength={field.maxLength}
          minLength={field.minLength}
          readOnly={field.readonly}
        />
      );

    case "number":
      return (
        <NumberInput
          {...commonProps}
          value={value}
          onChange={onChange}
          min={field.min}
          max={field.max}
          step={field.step}
          readOnly={field.readonly}
        />
      );

    case "currency":
      return (
        <CurrencyInput
          {...commonProps}
          value={value}
          onChange={onChange}
          currency={field.currency}
          min={field.min}
          max={field.max}
          decimals={field.decimals}
          readOnly={field.readonly}
        />
      );

    case "percentage":
      return (
        <PercentageInput
          {...commonProps}
          value={value}
          onChange={onChange}
          min={field.min}
          max={field.max}
          decimals={field.decimals}
          readOnly={field.readonly}
        />
      );

    case "masked":
      return (
        <MaskedInput
          {...commonProps}
          value={value || ""}
          onChange={onChange}
          mask={field.mask}
          pattern={field.pattern}
          readOnly={field.readonly}
        />
      );

    case "select":
      return (
        <SelectWithDynamic
          field={field}
          value={value}
          onChange={onChange}
          commonProps={commonProps}
          disabled={disabled}
          formData={formData}
        />
      );

    case "multiselect":
      return (
        <MultiSelectWithDynamic
          field={field}
          value={value}
          onChange={onChange}
          commonProps={commonProps}
          disabled={disabled}
          formData={formData}
        />
      );

    case "checkbox":
      return (
        <CheckboxInput
          {...commonProps}
          checkboxLabel={field.checkboxLabel}
          value={value || false}
          onChange={onChange}
        />
      );

    case "switch":
      return (
        <SwitchInput
          {...commonProps}
          switchLabel={field.switchLabel}
          value={value || false}
          onChange={onChange}
        />
      );

    case "date":
      return (
        <DatePickerInput
          {...commonProps}
          value={value}
          onChange={onChange}
          minDate={field.minDate}
          maxDate={field.maxDate}
          format={field.format}
        />
      );

    case "time":
      return (
        <TimePickerInput
          {...commonProps}
          value={value}
          onChange={onChange}
          minTime={field.minTime}
          maxTime={field.maxTime}
          format={field.format}
        />
      );

    case "datetime":
      return (
        <DateTimePickerInput
          {...commonProps}
          value={value}
          onChange={onChange}
          minDateTime={field.minDateTime}
          maxDateTime={field.maxDateTime}
          format={field.format}
        />
      );

    case "dateRange":
      return (
        <DateRangePickerInput
          {...commonProps}
          value={value}
          onChange={onChange}
          minDate={field.minDate}
          maxDate={field.maxDate}
          format={field.format}
        />
      );

    case "imageCapture":
      return (
        <ImageCaptureInputWithUpload
          label={field.label}
          helperText={field.helperText}
          value={value}
          onChange={onChange}
          cloudConfig={field.cloudConfig}
          defaultFacingMode={field.defaultFacingMode}
          error={!!error}
          disabled={disabled || field.disabled}
        />
      );

    case "multipleImagesCapture":
      return (
        <MultipleImagesCaptureInputUpload
          label={field.label}
          helperText={field.helperText}
          value={value || []}
          onChange={onChange}
          cloudConfig={field.cloudConfig}
          defaultFacingMode={field.defaultFacingMode}
          error={!!error}
          disabled={disabled || field.disabled}
          maxImages={field.maxImages}
          minImages={field.minImages}
          gridColumns={field.gridColumns}
          showImageIndex={field.showImageIndex}
        />
      );

    case "inputGroup": {
      const [items, setItems] = React.useState<InputGroupItem[]>(
        Array.isArray(field.items) ? field.items : [],
      );
      const [isLoading, setIsLoading] = React.useState(false);

      React.useEffect(() => {
        if (typeof field.items === "function") {
          setIsLoading(true);
          field.items()
            .then((loadedItems) => {
              setItems(loadedItems);
            })
            .finally(() => {
              setIsLoading(false);
            });
        } else {
          setItems(field.items);
        }
      }, [field.items]);

      return (
        <InputGroup
          label={field.label}
          helperText={field.helperText}
          error={!!error}
          items={items}
          value={value || {}}
          onChange={onChange}
          fieldNamePrefix={field.fieldNamePrefix}
          fieldNameSuffix={field.fieldNameSuffix}
          min={field.min}
          max={field.max}
          step={field.step}
          disabled={disabled || field.disabled}
          readonly={field.readonly}
          errors={error ? { [field.name]: error } : {}}
          layout={field.layout}
          showButtons={field.showButtons}
          buttonStep={field.buttonStep}
        />
      );
    }

    case "groupedInputGroup": {
      const [items, setItems] = React.useState<InputGroupItem[]>(
        Array.isArray(field.items) ? field.items : [],
      );
      const [isLoading, setIsLoading] = React.useState(false);

      React.useEffect(() => {
        if (typeof field.items === "function") {
          setIsLoading(true);
          field.items()
            .then((loadedItems) => {
              setItems(loadedItems);
            })
            .finally(() => {
              setIsLoading(false);
            });
        } else {
          setItems(field.items);
        }
      }, [field.items]);

      return (
        <GroupedInputGroup
          label={field.label}
          helperText={field.helperText}
          error={!!error}
          items={items}
          value={value || {}}
          onChange={onChange}
          groupBy={field.groupBy}
          formatGroupTitle={field.formatGroupTitle}
          fieldNamePrefix={field.fieldNamePrefix}
          fieldNameSuffix={field.fieldNameSuffix}
          min={field.min}
          max={field.max}
          step={field.step}
          disabled={disabled || field.disabled}
          readonly={field.readonly}
          errors={error ? { [field.name]: error } : {}}
          layout={field.layout}
          showButtons={field.showButtons}
          buttonStep={field.buttonStep}
        />
      );
    }

    default:
      return (
        <div className="text-red-60 text-sm">
          Unknown field type: {(field as any).type}
        </div>
      );
  }
};

