/**
 * MultiSelect Input with Dynamic Dropdown Support
 * 
 * Wrapper component that handles both static and dynamic dropdown options
 */

import React from "react";
import { FieldConfig } from "../types";
import { DynamicDropdownConfig } from "../types/dropdown.types";
import { MultiSelectInput } from "./MultiSelectInput";
import { useDynamicDropdown } from "../services/dropdown.service";

// Helper function to check if options is DynamicDropdownConfig
const isDynamicDropdownConfig = (opts: any): opts is DynamicDropdownConfig => {
  return opts && typeof opts === "object" && "groupCode" in opts && !Array.isArray(opts);
};

export interface MultiSelectWithDynamicProps {
  field: FieldConfig & {
    options?: any;
    placeholder?: string;
    disabled?: boolean;
    maxSelections?: number;
  };
  value: any;
  onChange: (value: any) => void;
  commonProps: {
    label?: string;
    helperText?: string | React.ReactNode;
    error?: boolean;
    disabled?: boolean;
    placeholder?: string;
  };
  disabled?: boolean;
  formData: Record<string, any>;
}

// Base component for MultiSelect with dynamic dropdown
const MultiSelectWithDynamicBase: React.FC<MultiSelectWithDynamicProps> = ({
  field,
  value,
  onChange,
  commonProps,
  disabled,
  formData,
}) => {
  // Check if using dynamic dropdown
  if (field.options && isDynamicDropdownConfig(field.options)) {
    const config = field.options as DynamicDropdownConfig;
    const parentValue = config.parentField ? formData[config.parentField] : undefined;
    const { options, loading } = useDynamicDropdown(config, parentValue, formData);

    return (
      <MultiSelectInput
        {...commonProps}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={field.placeholder || (loading ? "Loading..." : "Select options")}
        disabled={disabled || field.disabled || loading}
        maxSelections={field.maxSelections}
      />
    );
  }

  // Use static options
  return (
    <MultiSelectInput
      {...commonProps}
      value={value}
      onChange={onChange}
      options={field.options}
      placeholder={field.placeholder}
      maxSelections={field.maxSelections}
    />
  );
};

// Memoized version for dropdowns with parentField
const MultiSelectWithDynamicMemo = React.memo(MultiSelectWithDynamicBase, (prevProps, nextProps) => {
  // Always re-render if value or disabled changed
  if (prevProps.value !== nextProps.value || prevProps.disabled !== nextProps.disabled) {
    return false;
  }
  
  const prevConfig = prevProps.field.options as DynamicDropdownConfig;
  const nextConfig = nextProps.field.options as DynamicDropdownConfig;
  
  // Only memo optimization for dynamic dropdowns with parentField
  if (isDynamicDropdownConfig(prevConfig) && isDynamicDropdownConfig(nextConfig)) {
    if (prevConfig.parentField && nextConfig.parentField) {
      const prevParentValue = prevProps.formData[prevConfig.parentField];
      const nextParentValue = nextProps.formData[nextConfig.parentField];
      
      // Only skip re-render if parent value unchanged
      return prevParentValue === nextParentValue;
    }
  }
  
  // For others, always re-render
  return false;
});

// Choose memoized or non-memoized based on whether it has parentField
export const MultiSelectWithDynamic: React.FC<MultiSelectWithDynamicProps> = ({ field, ...props }) => {
  // Check if it's a dynamic dropdown with parentField
  const isDynamic = field.options && isDynamicDropdownConfig(field.options);
  const hasParentField = isDynamic && (field.options as DynamicDropdownConfig).parentField;
  
  // Only use memo for dropdowns with parentField
  if (hasParentField) {
    return <MultiSelectWithDynamicMemo field={field} {...props} />;
  }
  
  // For others, use non-memoized to ensure values always update
  return <MultiSelectWithDynamicBase field={field} {...props} />;
};

