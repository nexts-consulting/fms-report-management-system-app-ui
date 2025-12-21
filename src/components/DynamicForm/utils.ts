/**
 * Utility functions for DynamicForm
 */

import { FieldConfig, ValidationRule, ConditionalRule, FormValidationResult } from "./types";

/**
 * Validate a single field value against its validation rules
 */
export function validateField(
  field: FieldConfig,
  value: any,
  formData: Record<string, any>,
): string | null {
  if (!field.validation || field.validation.length === 0) {
    return null;
  }

  for (const rule of field.validation) {
    const error = validateRule(rule, value, formData, field);
    if (error) {
      return error;
    }
  }

  return null;
}

/**
 * Validate a single validation rule
 */
function validateRule(
  rule: ValidationRule,
  value: any,
  formData: Record<string, any>,
  field: FieldConfig,
): string | null {
  switch (rule.type) {
    case "required":
      if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
        return rule.message || `${field.label || field.name} is required`;
      }
      break;

    case "min":
      if (value !== null && value !== undefined && value !== "" && typeof value === "number") {
        if (value < (rule.value ?? 0)) {
          return rule.message || `${field.label || field.name} must be at least ${rule.value}`;
        }
      }
      break;

    case "max":
      if (value !== null && value !== undefined && value !== "" && typeof value === "number") {
        if (value > (rule.value ?? Infinity)) {
          return rule.message || `${field.label || field.name} must be at most ${rule.value}`;
        }
      }
      break;

    case "minLength":
      if (value !== null && value !== undefined && value !== "") {
        const strValue = String(value);
        if (strValue.length < (rule.value ?? 0)) {
          return rule.message || `${field.label || field.name} must be at least ${rule.value} characters`;
        }
      }
      break;

    case "maxLength":
      if (value !== null && value !== undefined && value !== "") {
        const strValue = String(value);
        if (strValue.length > (rule.value ?? Infinity)) {
          return rule.message || `${field.label || field.name} must be at most ${rule.value} characters`;
        }
      }
      break;

    case "pattern":
      if (value !== null && value !== undefined && value !== "") {
        const regex = new RegExp(rule.value);
        if (!regex.test(String(value))) {
          return rule.message || `${field.label || field.name} format is invalid`;
        }
      }
      break;

    case "email":
      if (value !== null && value !== undefined && value !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          return rule.message || `${field.label || field.name} must be a valid email`;
        }
      }
      break;

    case "custom":
      if (rule.validator) {
        const result = rule.validator(value, formData);
        if (result === false) {
          return rule.message || `${field.label || field.name} is invalid`;
        }
        if (typeof result === "string") {
          return result;
        }
      }
      break;
  }

  return null;
}

/**
 * Check if a field should be displayed based on conditional rules
 */
export function shouldDisplayField(
  field: FieldConfig,
  formData: Record<string, any>,
): boolean {
  if (!field.conditional || field.conditional.length === 0) {
    return true;
  }

  // All conditions must be met (AND logic)
  return field.conditional.every((condition) => {
    const fieldValue = formData[condition.field];
    return evaluateCondition(condition, fieldValue);
  });
}

/**
 * Evaluate a single conditional rule
 */
function evaluateCondition(condition: ConditionalRule, fieldValue: any): boolean {
  switch (condition.operator) {
    case "equals":
      return fieldValue === condition.value;

    case "notEquals":
      return fieldValue !== condition.value;

    case "contains":
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(condition.value);
      }
      if (typeof fieldValue === "string") {
        return fieldValue.includes(String(condition.value));
      }
      return false;

    case "notContains":
      if (Array.isArray(fieldValue)) {
        return !fieldValue.includes(condition.value);
      }
      if (typeof fieldValue === "string") {
        return !fieldValue.includes(String(condition.value));
      }
      return true;

    case "greaterThan":
      return typeof fieldValue === "number" && fieldValue > condition.value;

    case "lessThan":
      return typeof fieldValue === "number" && fieldValue < condition.value;

    case "isEmpty":
      return (
        fieldValue === null ||
        fieldValue === undefined ||
        fieldValue === "" ||
        (Array.isArray(fieldValue) && fieldValue.length === 0)
      );

    case "isNotEmpty":
      return !(
        fieldValue === null ||
        fieldValue === undefined ||
        fieldValue === "" ||
        (Array.isArray(fieldValue) && fieldValue.length === 0)
      );

    default:
      return true;
  }
}

/**
 * Validate entire form
 */
export function validateForm(
  fields: FieldConfig[],
  formData: Record<string, any>,
): FormValidationResult {
  const errors: Record<string, string> = {};

  fields.forEach((field) => {
    if (!shouldDisplayField(field, formData)) {
      return; // Skip validation for hidden fields
    }

    const value = formData[field.name];
    const error = validateField(field, value, formData);
    if (error) {
      errors[field.name] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

