/**
 * Select Input with Dynamic Dropdown Support
 * 
 * Wrapper component that handles both static and dynamic dropdown options
 */

import React from "react";
import { FieldConfig } from "../types";
import { DynamicDropdownConfig } from "../types/dropdown.types";
import { SelectInput } from "./SelectInput";
import { useDynamicDropdown } from "../services/dropdown.service";

// Helper function to check if options is DynamicDropdownConfig
const isDynamicDropdownConfig = (opts: any): opts is DynamicDropdownConfig => {
  return opts && typeof opts === "object" && "groupCode" in opts && !Array.isArray(opts);
};

export interface SelectWithDynamicProps {
  field: FieldConfig & {
    options?: any;
    placeholder?: string;
    disabled?: boolean;
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

// Base component for Select with dynamic dropdown
const SelectWithDynamicBase: React.FC<SelectWithDynamicProps> = ({
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
      <SelectInput
        {...commonProps}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={field.placeholder || (loading ? "Loading..." : "Select an option")}
        disabled={disabled || field.disabled || loading}
      />
    );
  }

  // Use static options
  return (
    <SelectInput
      {...commonProps}
      value={value}
      onChange={onChange}
      options={field.options}
      placeholder={field.placeholder}
    />
  );
};

// Memoized version for dropdowns with parentField (to optimize parent-child relationships)
const SelectWithDynamicMemo = React.memo(SelectWithDynamicBase, (prevProps, nextProps) => {
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
export const SelectWithDynamic: React.FC<SelectWithDynamicProps> = ({ field, ...props }) => {
  // Check if it's a dynamic dropdown with parentField
  const isDynamic = field.options && isDynamicDropdownConfig(field.options);
  const hasParentField = isDynamic && (field.options as DynamicDropdownConfig).parentField;
  
  // Only use memo for dropdowns with parentField
  if (hasParentField) {
    return <SelectWithDynamicMemo field={field} {...props} />;
  }
  
  // For others, use non-memoized to ensure values always update
  return <SelectWithDynamicBase field={field} {...props} />;
};

