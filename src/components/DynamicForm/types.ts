/**
 * Dynamic Form Types
 * 
 * Type definitions for the dynamic form system that allows rendering
 * forms from JSON configuration following IBM Carbon Design principles.
 */

/**
 * Supported field types
 */
export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "currency"
  | "percentage"
  | "masked"
  | "select"
  | "multiselect"
  | "checkbox"
  | "checkboxGroup"
  | "radioGroup"
  | "switch"
  | "date"
  | "time"
  | "datetime"
  | "dateRange"
  | "imageCapture"
  | "inputGroup"
  | "groupedInputGroup";

/**
 * Mask types for MaskedInput
 */
export type MaskType = "phone" | "code" | "id" | "custom";

/**
 * Validation rule
 */
export interface ValidationRule {
  type: "required" | "min" | "max" | "minLength" | "maxLength" | "pattern" | "email" | "custom";
  value?: any;
  message?: string;
  validator?: (value: any, formData: Record<string, any>) => boolean | string;
}

/**
 * Conditional display rule
 */
export interface ConditionalRule {
  field: string;
  operator: "equals" | "notEquals" | "contains" | "notContains" | "greaterThan" | "lessThan" | "isEmpty" | "isNotEmpty";
  value: any;
}

/**
 * Base field configuration
 */
export interface BaseFieldConfig {
  /**
   * Unique identifier for the field
   */
  name: string;
  /**
   * Field type
   */
  type: FieldType;
  /**
   * Label displayed above the field
   */
  label?: string;
  /**
   * Helper text displayed below the field
   */
  helperText?: string;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Default value
   */
  defaultValue?: any;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Whether the field is disabled
   */
  disabled?: boolean;
  /**
   * Whether the field is readonly
   */
  readonly?: boolean;
  /**
   * Validation rules
   */
  validation?: ValidationRule[];
  /**
   * Conditional display rules (field is shown only if conditions are met)
   */
  conditional?: ConditionalRule[];
  /**
   * Custom CSS class for the field container
   */
  className?: string;
  /**
   * Grid column span (1-12)
   */
  span?: number;
}

/**
 * Text input field configuration
 */
export interface TextFieldConfig extends BaseFieldConfig {
  type: "text";
  /**
   * Input type (text, email, password, etc.)
   */
  inputType?: "text" | "email" | "password" | "tel" | "url";
  /**
   * Maximum length
   */
  maxLength?: number;
  /**
   * Minimum length
   */
  minLength?: number;
}

/**
 * Textarea field configuration
 */
export interface TextareaFieldConfig extends BaseFieldConfig {
  type: "textarea";
  /**
   * Number of rows
   */
  rows?: number;
  /**
   * Maximum length
   */
  maxLength?: number;
  /**
   * Minimum length
   */
  minLength?: number;
}

/**
 * Number input field configuration
 */
export interface NumberFieldConfig extends BaseFieldConfig {
  type: "number";
  /**
   * Minimum value
   */
  min?: number;
  /**
   * Maximum value
   */
  max?: number;
  /**
   * Step value
   */
  step?: number;
}

/**
 * Currency input field configuration
 */
export interface CurrencyFieldConfig extends BaseFieldConfig {
  type: "currency";
  /**
   * Currency code (e.g., "USD", "VND")
   */
  currency?: string;
  /**
   * Minimum value
   */
  min?: number;
  /**
   * Maximum value
   */
  max?: number;
  /**
   * Number of decimal places
   */
  decimals?: number;
}

/**
 * Percentage input field configuration
 */
export interface PercentageFieldConfig extends BaseFieldConfig {
  type: "percentage";
  /**
   * Minimum value (0-100)
   */
  min?: number;
  /**
   * Maximum value (0-100)
   */
  max?: number;
  /**
   * Number of decimal places
   */
  decimals?: number;
}

/**
 * Masked input field configuration
 */
export interface MaskedFieldConfig extends BaseFieldConfig {
  type: "masked";
  /**
   * Mask type or custom mask pattern
   */
  mask: MaskType | string;
  /**
   * Custom mask pattern (if mask is "custom")
   */
  pattern?: string;
}

/**
 * Select option
 */
export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
}

/**
 * Select input field configuration
 */
export interface SelectFieldConfig extends BaseFieldConfig {
  type: "select";
  /**
   * Options for the select
   */
  options: SelectOption[] | (() => Promise<SelectOption[]>);
  /**
   * Whether to allow clearing the selection
   */
  clearable?: boolean;
  /**
   * Placeholder when no option is selected
   */
  placeholder?: string;
}

/**
 * Multi-select input field configuration
 */
export interface MultiSelectFieldConfig extends BaseFieldConfig {
  type: "multiselect";
  /**
   * Options for the multi-select
   */
  options: SelectOption[] | (() => Promise<SelectOption[]>);
  /**
   * Maximum number of selections
   */
  maxSelections?: number;
  /**
   * Placeholder when no options are selected
   */
  placeholder?: string;
}

/**
 * Checkbox field configuration
 */
export interface CheckboxFieldConfig extends BaseFieldConfig {
  type: "checkbox";
  /**
   * Checkbox label (if different from field label)
   */
  checkboxLabel?: string;
}

/**
 * Checkbox group field configuration
 */
export interface CheckboxGroupFieldConfig extends BaseFieldConfig {
  type: "checkboxGroup";
  /**
   * Options for the checkbox group
   */
  options: SelectOption[];
  /**
   * Number of columns in the grid
   */
  grid?: number;
}

/**
 * Radio group field configuration
 */
export interface RadioGroupFieldConfig extends BaseFieldConfig {
  type: "radioGroup";
  /**
   * Options for the radio group
   */
  options: SelectOption[];
  /**
   * Layout direction
   */
  direction?: "horizontal" | "vertical";
}

/**
 * Switch field configuration
 */
export interface SwitchFieldConfig extends BaseFieldConfig {
  type: "switch";
  /**
   * Switch label (if different from field label)
   */
  switchLabel?: string;
}

/**
 * Date picker field configuration
 */
export interface DateFieldConfig extends BaseFieldConfig {
  type: "date";
  /**
   * Minimum selectable date
   */
  minDate?: string | Date;
  /**
   * Maximum selectable date
   */
  maxDate?: string | Date;
  /**
   * Date format
   */
  format?: string;
}

/**
 * Time picker field configuration
 */
export interface TimeFieldConfig extends BaseFieldConfig {
  type: "time";
  /**
   * Time format (12h or 24h)
   */
  format?: "12h" | "24h";
  /**
   * Minimum selectable time
   */
  minTime?: string;
  /**
   * Maximum selectable time
   */
  maxTime?: string;
}

/**
 * DateTime picker field configuration
 */
export interface DateTimeFieldConfig extends BaseFieldConfig {
  type: "datetime";
  /**
   * Minimum selectable date/time
   */
  minDateTime?: string | Date;
  /**
   * Maximum selectable date/time
   */
  maxDateTime?: string | Date;
  /**
   * Date/time format
   */
  format?: string;
}

/**
 * Date range picker field configuration
 */
export interface DateRangeFieldConfig extends BaseFieldConfig {
  type: "dateRange";
  /**
   * Minimum selectable date
   */
  minDate?: string | Date;
  /**
   * Maximum selectable date
   */
  maxDate?: string | Date;
  /**
   * Date format
   */
  format?: string;
}

/**
 * Image capture field configuration
 */
export interface ImageCaptureFieldConfig extends BaseFieldConfig {
  type: "imageCapture";
  /**
   * Cloud storage configuration (required for ImageCaptureInputWithUpload)
   */
  cloudConfig: any; // CloudConfig from ImageCaptureInputWithUpload
  /**
   * Default camera facing mode
   */
  defaultFacingMode?: "user" | "environment";
}

/**
 * Input group item
 */
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

/**
 * Input group field configuration
 */
export interface InputGroupFieldConfig extends BaseFieldConfig {
  type: "inputGroup";
  /**
   * Items to display in the group
   */
  items: InputGroupItem[] | (() => Promise<InputGroupItem[]>);
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

/**
 * Grouped input group field configuration
 */
export interface GroupedInputGroupFieldConfig extends BaseFieldConfig {
  type: "groupedInputGroup";
  /**
   * Items to display (should have groupKey or data with groupBy field)
   */
  items: InputGroupItem[] | (() => Promise<InputGroupItem[]>);
  /**
   * Field name to group by (if items don't have groupKey, will extract from item data)
   */
  groupBy?: string;
  /**
   * Custom group title formatter
   */
  formatGroupTitle?: (groupKey: string, items: InputGroupItem[]) => string;
  /**
   * Field name prefix for each item
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

/**
 * Union type for all field configurations
 */
export type FieldConfig =
  | TextFieldConfig
  | TextareaFieldConfig
  | NumberFieldConfig
  | CurrencyFieldConfig
  | PercentageFieldConfig
  | MaskedFieldConfig
  | SelectFieldConfig
  | MultiSelectFieldConfig
  | CheckboxFieldConfig
  | CheckboxGroupFieldConfig
  | RadioGroupFieldConfig
  | SwitchFieldConfig
  | DateFieldConfig
  | TimeFieldConfig
  | DateTimeFieldConfig
  | DateRangeFieldConfig
  | ImageCaptureFieldConfig
  | InputGroupFieldConfig
  | GroupedInputGroupFieldConfig;

/**
 * Form section configuration
 */
export interface FormSection {
  /**
   * Section title
   */
  title?: string;
  /**
   * Section description
   */
  description?: string;
  /**
   * Fields in this section
   */
  fields: FieldConfig[];
  /**
   * Custom CSS class for the section
   */
  className?: string;
  /**
   * Show left border accent (border-l-4 border-primary-50)
   */
  borderLeft?: boolean;
  /**
   * Use divide-y styling for list-like sections
   */
  divideY?: boolean;
  /**
   * Custom padding for section content
   * @default "p-5"
   */
  padding?: "p-4" | "p-5" | "p-6";
  /**
   * Custom spacing between fields
   * @default "space-y-4"
   */
  spacing?: "space-y-2" | "space-y-3" | "space-y-4";
  /**
   * Additional wrapper classes for section content
   */
  contentClassName?: string;
}

/**
 * Complete form configuration
 */
export interface FormConfig {
  /**
   * Form title
   */
  title?: string;
  /**
   * Form description
   */
  description?: string;
  /**
   * Form sections (if using sections) or flat fields
   */
  sections?: FormSection[];
  /**
   * Flat list of fields (if not using sections)
   */
  fields?: FieldConfig[];
  /**
   * Grid columns (default: 12)
   */
  gridColumns?: number;
  /**
   * Custom CSS class for the form
   */
  className?: string;
  /**
   * Submit button label
   */
  submitLabel?: string;
  /**
   * Cancel button label
   */
  cancelLabel?: string;
  /**
   * Whether to show submit button
   */
  showSubmit?: boolean;
  /**
   * Whether to show cancel button
   */
  showCancel?: boolean;
}

/**
 * Form validation result
 */
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Form submission handler
 */
export type FormSubmitHandler = (data: Record<string, any>) => void | Promise<void>;

/**
 * Form change handler
 */
export type FormChangeHandler = (data: Record<string, any>, fieldName: string, value: any) => void;

