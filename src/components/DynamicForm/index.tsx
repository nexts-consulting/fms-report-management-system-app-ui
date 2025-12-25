/**
 * DynamicForm Component
 * 
 * Renders a form dynamically based on JSON configuration
 * following IBM Carbon Design principles
 */

import React from "react";
import { FormConfig, FieldConfig, FormSection, FormValidationResult, FormSubmitHandler, FormChangeHandler } from "./types";
import { FieldRenderer } from "./FieldRenderer";
import { validateForm, shouldDisplayField } from "./utils";
import { StyleUtil } from "@/kits/utils";
import { Button } from "@/kits/components/button";

// Export form config serializer utilities
export {
  hydrateFormConfig,
  serializeFormConfig,
  deserializeFormConfig,
  registerValidator,
  registerFormatter,
  registerUploadProvider,
  createValidatorReference,
  createFormatterReference,
  createUploadProviderReference,
  convertToJsonSafe,
  PREDEFINED_VALIDATORS,
  PREDEFINED_FORMATTERS,
  PREDEFINED_UPLOAD_PROVIDERS,
} from "./formConfigSerializer";

// Export types
export type { FormConfig, FieldConfig, FormSection, FormValidationResult, FormSubmitHandler, FormChangeHandler } from "./types";

const constants = {
  INSTANCE_NAME: "DynamicForm",
};

const styles = {
  form: StyleUtil.cn("w-full"),
  title: StyleUtil.cn("text-2xl font-semibold text-gray-100 mb-2"),
  description: StyleUtil.cn("text-sm text-gray-70 mb-6"),
  section: StyleUtil.cn("mb-6"),
  sectionTitle: StyleUtil.cn("mb-1 text-base font-semibold text-gray-800"),
  sectionDescription: StyleUtil.cn("text-sm text-gray-70 mb-1"),
  sectionContent: (
    borderLeft?: boolean,
    divideY?: boolean,
    padding?: "p-4" | "p-5" | "p-6",
    spacing?: "space-y-2" | "space-y-3" | "space-y-4",
    contentClassName?: string,
  ) =>
    StyleUtil.cn(
      "bg-white",
      padding || "p-5",
      spacing || "space-y-4",
      {
        "border-l-4 border-primary-50": borderLeft,
        "divide-y divide-gray-200": divideY,
      },
      contentClassName,
    ),
  fieldsGrid: (columns: number) =>
    StyleUtil.cn("grid gap-4", {
      "grid-cols-1": columns === 1,
      "grid-cols-2": columns === 2,
      "grid-cols-3": columns === 3,
      "grid-cols-4": columns === 4,
      "grid-cols-6": columns === 6,
      "grid-cols-12": columns === 12,
    }),
  fieldWrapper: (span: number, columns: number) => {
    const colSpan = span || 1;
    const gridCols = columns || 12;
    return StyleUtil.cn({
      "col-span-1": colSpan === 1,
      "col-span-2": colSpan === 2,
      "col-span-3": colSpan === 3,
      "col-span-4": colSpan === 4,
      "col-span-6": colSpan === 6,
      "col-span-12": colSpan === 12 || colSpan > gridCols,
    });
  },
  actions: StyleUtil.cn("flex gap-4 justify-end mt-8"),
};

export interface DynamicFormProps {
  /**
   * Form configuration
   */
  config: FormConfig;
  /**
   * Initial form values
   */
  initialValues?: Record<string, any>;
  /**
   * Form values (controlled)
   */
  values?: Record<string, any>;
  /**
   * Callback when form values change
   */
  onChange?: FormChangeHandler;
  /**
   * Callback when form is submitted
   */
  onSubmit?: FormSubmitHandler;
  /**
   * Callback when form is cancelled
   */
  onCancel?: () => void;
  /**
   * Whether the form is disabled
   */
  disabled?: boolean;
  /**
   * Custom validation errors
   */
  errors?: Record<string, string>;
  /**
   * Whether to show validation errors
   */
  showErrors?: boolean;
}

export const DynamicForm = React.memo<DynamicFormProps>((props) => {
  const {
    config,
    initialValues = {},
    values: valuesProp,
    onChange: onChangeProp,
    onSubmit: onSubmitProp,
    onCancel,
    disabled = false,
    errors: externalErrors = {},
    showErrors = true,
  } = props;

  const [internalValues, setInternalValues] = React.useState<Record<string, any>>(initialValues);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  // Use controlled or uncontrolled values
  const values = valuesProp !== undefined ? valuesProp : internalValues;
  const isControlled = valuesProp !== undefined;

  // Get all fields from config
  const allFields = React.useMemo(() => {
    if (config.sections) {
      return config.sections.flatMap((section) => section.fields);
    }
    return config.fields || [];
  }, [config]);

  // Initialize default values
  React.useEffect(() => {
    const defaults: Record<string, any> = {};
    allFields.forEach((field) => {
      if (field.defaultValue !== undefined && values[field.name] === undefined) {
        defaults[field.name] = field.defaultValue;
      }
    });
    if (Object.keys(defaults).length > 0) {
      if (isControlled) {
        onChangeProp?.({ ...values, ...defaults }, "", null);
      } else {
        setInternalValues((prev) => ({ ...prev, ...defaults }));
      }
    }
  }, []);

  // Handle field value change
  const handleFieldChange = React.useCallback(
    (fieldName: string, value: any) => {
      const newValues = { ...values, [fieldName]: value };

      if (isControlled) {
        onChangeProp?.(newValues, fieldName, value);
      } else {
        setInternalValues(newValues);
        onChangeProp?.(newValues, fieldName, value);
      }

      // Clear validation error for this field
      if (validationErrors[fieldName]) {
        setValidationErrors((prev) => {
          const next = { ...prev };
          delete next[fieldName];
          return next;
        });
      }
    },
    [values, isControlled, onChangeProp, validationErrors],
  );

  // Validate form
  const validate = React.useCallback((): FormValidationResult => {
    const result = validateForm(allFields, values);
    if (showErrors) {
      setValidationErrors(result.errors);
    }
    return result;
  }, [allFields, values, showErrors]);

  // Handle form submit
  const handleSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const validation = validate();
      if (validation.isValid) {
        onSubmitProp?.(values);
      }
    },
    [validate, onSubmitProp, values],
  );

  // Get error for a field
  const getFieldError = React.useCallback(
    (fieldName: string): string | undefined => {
      return externalErrors[fieldName] || validationErrors[fieldName];
    },
    [externalErrors, validationErrors],
  );

  // Render a single field
  const renderField = React.useCallback(
    (field: FieldConfig) => {
      if (!shouldDisplayField(field, values)) {
        return null;
      }

      const fieldValue = values[field.name];
      const fieldError = getFieldError(field.name);
      const gridColumns = config.gridColumns || 12;
      const fieldSpan = field.span || 12;

      return (
        <div key={field.name} className={styles.fieldWrapper(fieldSpan, gridColumns)}>
          <FieldRenderer
            field={field}
            value={fieldValue}
            onChange={(value) => handleFieldChange(field.name, value)}
            error={fieldError}
            disabled={disabled}
          />
        </div>
      );
    },
    [values, getFieldError, disabled, config.gridColumns, handleFieldChange],
  );

  // Render fields in a section
  const renderSection = React.useCallback(
    (section: FormSection) => {
      const gridColumns = config.gridColumns || 12;
      const visibleFields = section.fields.filter((field) => shouldDisplayField(field, values));

      if (visibleFields.length === 0) {
        return null;
      }

      return (
        <div key={section.title || "default"} className={StyleUtil.cn(styles.section, section.className)}>
          {section.title && <h3 className={styles.sectionTitle}>{section.title}</h3>}
          {section.description && <p className={styles.sectionDescription}>{section.description}</p>}
          <div
            className={styles.sectionContent(
              section.borderLeft,
              section.divideY,
              section.padding,
              section.spacing,
              section.contentClassName,
            )}
          >
            {section.divideY ? (
              // For divide-y sections, render fields directly without grid
              visibleFields.map((field) => {
                const fieldValue = values[field.name];
                const fieldError = getFieldError(field.name);
                return (
                  <div key={field.name}>
                    <FieldRenderer
                      field={field}
                      value={fieldValue}
                      onChange={(value) => handleFieldChange(field.name, value)}
                      error={fieldError}
                      disabled={disabled}
                    />
                  </div>
                );
              })
            ) : (
              // For regular sections, use grid layout
              <div className={styles.fieldsGrid(gridColumns)}>
                {visibleFields.map(renderField)}
              </div>
            )}
          </div>
        </div>
      );
    },
    [config.gridColumns, renderField, values, getFieldError, disabled, handleFieldChange],
  );

  return (
    <form className={StyleUtil.cn(styles.form, config.className)} onSubmit={handleSubmit}>
      {config.title && <h2 className={styles.title}>{config.title}</h2>}
      {config.description && <p className={styles.description}>{config.description}</p>}

      {config.sections ? (
        config.sections.map(renderSection)
      ) : (
        <div className={styles.fieldsGrid(config.gridColumns || 12)}>
          {allFields.map(renderField)}
        </div>
      )}

      {(config.showSubmit !== false || config.showCancel) && (
        <div className={styles.actions}>
          {config.showCancel && (
            <Button type="button" variant="secondary" onClick={onCancel} disabled={disabled}>
              {config.cancelLabel || "Cancel"}
            </Button>
          )}
          {config.showSubmit !== false && (
            <Button type="submit" variant="primary" disabled={disabled}>
              {config.submitLabel || "Submit"}
            </Button>
          )}
        </div>
      )}
    </form>
  );
});

DynamicForm.displayName = constants.INSTANCE_NAME;

// Export types and utilities
export * from "./types";
export { validateForm, shouldDisplayField } from "./utils";
export { FieldRenderer } from "./FieldRenderer";

