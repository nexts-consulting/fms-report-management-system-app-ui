/**
 * Form Config Serializer/Deserializer
 * 
 * Utilities to convert FormConfig to/from JSON-safe format for database storage.
 * Handles special values like Date objects, functions, and async data loaders.
 */

import { FormConfig, ValidationRule, FieldConfig, InputGroupItem } from "./types";

/**
 * Special string prefixes for non-serializable values
 */
const SPECIAL_VALUES = {
  DATE_NOW: "@@DATE_NOW",
  DATE_TODAY: "@@DATE_TODAY",
  VALIDATOR_PREFIX: "@@VALIDATOR:",
  FORMATTER_PREFIX: "@@FORMATTER:",
  UPLOAD_PROVIDER_PREFIX: "@@UPLOAD_PROVIDER:",
  ASYNC_OPTIONS_PREFIX: "@@ASYNC_OPTIONS:",
  ASYNC_ITEMS_PREFIX: "@@ASYNC_ITEMS:",
} as const;

/**
 * Predefined validators that can be used in JSON configs
 */
export const PREDEFINED_VALIDATORS: Record<string, (value: any, formData: Record<string, any>) => boolean | string> = {
  /**
   * Check if value is true (for terms acceptance)
   */
  mustBeTrue: (value) => {
    return value === true || "This field must be accepted";
  },
  
  /**
   * Check if value is not empty
   */
  notEmpty: (value) => {
    if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
      return "This field cannot be empty";
    }
    return true;
  },

  /**
   * Check if email ends with specific domain
   */
  companyEmail: (value) => {
    if (typeof value === "string" && !value.endsWith("@company.com")) {
      return "Must be a company email";
    }
    return true;
  },

  /**
   * Check if value is a valid URL
   */
  validUrl: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return "Must be a valid URL";
    }
  },

  /**
   * Check if age is >= 18
   */
  adult: (value) => {
    if (typeof value === "number" && value < 18) {
      return "Must be at least 18 years old";
    }
    return true;
  },
};

/**
 * Predefined formatters for grouped input groups
 */
export const PREDEFINED_FORMATTERS: Record<string, (groupKey: string, items: InputGroupItem[]) => string> = {
  /**
   * Format: "GroupName (X items)"
   */
  default: (groupKey, items) => `${groupKey} (${items.length} items)`,

  /**
   * Format: "GroupName (X sản phẩm)"
   */
  vietnameseProducts: (groupKey, items) => `${groupKey} (${items.length} sản phẩm)`,

  /**
   * Format: "GroupName - X items"
   */
  withDash: (groupKey, items) => `${groupKey} - ${items.length} items`,

  /**
   * Format: Just the group name
   */
  nameOnly: (groupKey) => groupKey,
};

/**
 * Predefined upload providers for image capture
 */
export const PREDEFINED_UPLOAD_PROVIDERS: Record<string, any> = {
  api: {
    provider: "custom",
    uploadFunction: async (file: File) => {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return URL.createObjectURL(file);
    },
  },

  /**
   * Firebase upload provider (uses Firebase Storage service)
   * Uploads to "images/uploads" folder by default
   */
  firebase: {
    provider: "firebase",
    path: "images/uploads",
  },

  /**
   * Firebase with custom path for reports
   */
  firebaseReports: {
    provider: "firebase",
    path: "reports/attachments",
  },

  /**
   * Firebase with custom path for profiles
   */
  firebaseProfiles: {
    provider: "firebase",
    path: "users/profiles",
  },
};

/**
 * Register a custom validator
 */
export function registerValidator(
  name: string,
  validator: (value: any, formData: Record<string, any>) => boolean | string
): void {
  PREDEFINED_VALIDATORS[name] = validator;
}

/**
 * Register a custom formatter
 */
export function registerFormatter(
  name: string,
  formatter: (groupKey: string, items: InputGroupItem[]) => string
): void {
  PREDEFINED_FORMATTERS[name] = formatter;
}

/**
 * Register a custom upload provider
 */
export function registerUploadProvider(
  name: string,
  provider: any
): void {
  PREDEFINED_UPLOAD_PROVIDERS[name] = provider;
}

/**
 * Serialize FormConfig to JSON-safe format
 */
export function serializeFormConfig(config: FormConfig): string {
  const serialized = JSON.stringify(config, (key, value) => {
    // Handle Date objects
    if (value instanceof Date) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Check if it's "now"
      if (Math.abs(value.getTime() - now.getTime()) < 1000) {
        return SPECIAL_VALUES.DATE_NOW;
      }
      
      // Check if it's "today"
      if (value.getTime() === today.getTime()) {
        return SPECIAL_VALUES.DATE_TODAY;
      }
      
      // Return ISO string for other dates
      return value.toISOString();
    }

    // Handle functions (we can't serialize them, so we skip)
    if (typeof value === "function") {
      return undefined;
    }

    return value;
  }, 2);

  return serialized;
}

/**
 * Deserialize JSON to FormConfig with hydrated functions and dates
 */
export function deserializeFormConfig(json: string): FormConfig {
  const parsed = JSON.parse(json);
  return hydrateFormConfig(parsed);
}

/**
 * Hydrate a parsed JSON config to restore functions and dates
 */
export function hydrateFormConfig(config: any): FormConfig {
  const hydrated = { ...config };

  // Process sections if they exist
  if (hydrated.sections) {
    hydrated.sections = hydrated.sections.map((section: any) => ({
      ...section,
      fields: section.fields.map((field: any) => hydrateField(field)),
    }));
  }

  // Process flat fields if they exist
  if (hydrated.fields) {
    hydrated.fields = hydrated.fields.map((field: any) => hydrateField(field));
  }

  return hydrated as FormConfig;
}

/**
 * Hydrate a single field config
 */
function hydrateField(field: any): FieldConfig {
  const hydrated: any = { ...field };

  // Hydrate date fields
  if (field.minDate) {
    hydrated.minDate = hydrateDate(field.minDate);
  }
  if (field.maxDate) {
    hydrated.maxDate = hydrateDate(field.maxDate);
  }
  if (field.minDateTime) {
    hydrated.minDateTime = hydrateDate(field.minDateTime);
  }
  if (field.maxDateTime) {
    hydrated.maxDateTime = hydrateDate(field.maxDateTime);
  }

  // Hydrate validation rules
  if (field.validation) {
    hydrated.validation = field.validation.map((rule: any) => hydrateValidationRule(rule));
  }

  // Hydrate cloudConfig for imageCapture
  if (field.type === "imageCapture" && field.cloudConfig) {
    hydrated.cloudConfig = hydrateCloudConfig(field.cloudConfig);
  }

  // Hydrate formatGroupTitle for groupedInputGroup
  if (field.type === "groupedInputGroup" && field.formatGroupTitle) {
    hydrated.formatGroupTitle = hydrateFormatter(field.formatGroupTitle);
  }

  // Hydrate options if it's a string reference
  if (field.options && typeof field.options === "string" && field.options.startsWith(SPECIAL_VALUES.ASYNC_OPTIONS_PREFIX)) {
    const loaderName = field.options.substring(SPECIAL_VALUES.ASYNC_OPTIONS_PREFIX.length);
    // In a real app, you'd have a registry of async loaders
    console.warn(`Async options loader "${loaderName}" not implemented. Using empty array.`);
    hydrated.options = [];
  }

  // Hydrate items if it's a string reference
  if (field.items && typeof field.items === "string" && field.items.startsWith(SPECIAL_VALUES.ASYNC_ITEMS_PREFIX)) {
    const loaderName = field.items.substring(SPECIAL_VALUES.ASYNC_ITEMS_PREFIX.length);
    // In a real app, you'd have a registry of async loaders
    console.warn(`Async items loader "${loaderName}" not implemented. Using empty array.`);
    hydrated.items = [];
  }

  return hydrated as FieldConfig;
}

/**
 * Hydrate a date value
 */
function hydrateDate(value: any): Date | string {
  if (typeof value === "string") {
    if (value === SPECIAL_VALUES.DATE_NOW) {
      return new Date();
    }
    if (value === SPECIAL_VALUES.DATE_TODAY) {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    // Try to parse ISO string
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return value;
}

/**
 * Hydrate a validation rule
 */
function hydrateValidationRule(rule: any): ValidationRule {
  const hydrated: any = { ...rule };

  // Hydrate validator function if it's a string reference
  if (rule.validator && typeof rule.validator === "string" && rule.validator.startsWith(SPECIAL_VALUES.VALIDATOR_PREFIX)) {
    const validatorName = rule.validator.substring(SPECIAL_VALUES.VALIDATOR_PREFIX.length);
    const validator = PREDEFINED_VALIDATORS[validatorName];
    
    if (validator) {
      hydrated.validator = validator;
    } else {
      console.warn(`Validator "${validatorName}" not found in PREDEFINED_VALIDATORS`);
      hydrated.validator = undefined;
    }
  }

  return hydrated as ValidationRule;
}

/**
 * Hydrate cloud config for image capture
 */
function hydrateCloudConfig(config: any): any {
  // Handle string reference: "@@UPLOAD_PROVIDER:providerName"
  if (typeof config === "string" && config.startsWith(SPECIAL_VALUES.UPLOAD_PROVIDER_PREFIX)) {
    const providerName = config.substring(SPECIAL_VALUES.UPLOAD_PROVIDER_PREFIX.length);
    const provider = PREDEFINED_UPLOAD_PROVIDERS[providerName];
    
    if (provider) {
      return provider;
    } else {
      console.warn(`Upload provider "${providerName}" not found in PREDEFINED_UPLOAD_PROVIDERS`);
      return config;
    }
  }
  
  // Handle object config: { provider: "firebase", path: "custom/path" }
  // This is already JSON-safe, just return as-is
  if (typeof config === "object" && config !== null) {
    return config;
  }
  
  return config;
}

/**
 * Hydrate formatter function
 */
function hydrateFormatter(formatter: any): ((groupKey: string, items: InputGroupItem[]) => string) | undefined {
  if (typeof formatter === "string" && formatter.startsWith(SPECIAL_VALUES.FORMATTER_PREFIX)) {
    const formatterName = formatter.substring(SPECIAL_VALUES.FORMATTER_PREFIX.length);
    const formatterFunc = PREDEFINED_FORMATTERS[formatterName];
    
    if (formatterFunc) {
      return formatterFunc;
    } else {
      console.warn(`Formatter "${formatterName}" not found in PREDEFINED_FORMATTERS`);
      return undefined;
    }
  }
  
  return formatter;
}

/**
 * Helper to create a JSON-safe validation rule with predefined validator
 */
export function createValidatorReference(validatorName: keyof typeof PREDEFINED_VALIDATORS): string {
  return `${SPECIAL_VALUES.VALIDATOR_PREFIX}${validatorName}`;
}

/**
 * Helper to create a JSON-safe formatter reference
 */
export function createFormatterReference(formatterName: keyof typeof PREDEFINED_FORMATTERS): string {
  return `${SPECIAL_VALUES.FORMATTER_PREFIX}${formatterName}`;
}

/**
 * Helper to create a JSON-safe upload provider reference
 */
export function createUploadProviderReference(providerName: keyof typeof PREDEFINED_UPLOAD_PROVIDERS): string {
  return `${SPECIAL_VALUES.UPLOAD_PROVIDER_PREFIX}${providerName}`;
}

/**
 * Convert a code-based FormConfig to JSON-safe format
 * This function converts functions and dates to string references
 */
export function convertToJsonSafe(config: FormConfig): any {
  const jsonSafe = JSON.parse(JSON.stringify(config, (key, value) => {
    // Handle Date objects
    if (value instanceof Date) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (Math.abs(value.getTime() - now.getTime()) < 1000) {
        return SPECIAL_VALUES.DATE_NOW;
      }
      if (value.getTime() === today.getTime()) {
        return SPECIAL_VALUES.DATE_TODAY;
      }
      
      return value.toISOString();
    }

    // Skip functions (will be handled separately)
    if (typeof value === "function") {
      return undefined;
    }

    return value;
  }));

  return jsonSafe;
}

