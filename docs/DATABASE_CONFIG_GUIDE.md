# Database-Safe Form Configuration Guide

## Overview

This guide explains how to create and use form configurations that can be stored in a database as JSON.

## The Problem

When creating form configurations in code, you might use:
- **Date objects** (`new Date()`)
- **Functions** (validators, formatters, upload handlers)
- **Async data loaders**

These cannot be serialized to JSON for database storage.

## The Solution

Use **special string references** that get converted (hydrated) to actual functions/objects at runtime.

---

## Special Value References

### 1. Date References

#### `@@DATE_NOW`
Current date and time.

```json
{
  "name": "eventDate",
  "type": "date",
  "maxDate": "@@DATE_NOW"
}
```

Equivalent to: `maxDate: new Date()`

#### `@@DATE_TODAY`
Today at midnight (00:00:00).

```json
{
  "name": "birthDate",
  "type": "date",
  "maxDate": "@@DATE_TODAY"
}
```

Equivalent to: `maxDate: new Date(now.getFullYear(), now.getMonth(), now.getDate())`

#### ISO Date String
For specific dates, use ISO format.

```json
{
  "name": "deadline",
  "type": "date",
  "minDate": "2025-01-01T00:00:00.000Z"
}
```

---

### 2. Validator References

Format: `@@VALIDATOR:validatorName`

#### Available Predefined Validators

| Name | Description | Example |
|------|-------------|---------|
| `mustBeTrue` | Value must be `true` | Terms acceptance |
| `notEmpty` | Value cannot be empty | Required field alternative |
| `companyEmail` | Email must end with `@company.com` | Company email validation |
| `validUrl` | Value must be a valid URL | Website field |
| `adult` | Age must be >= 18 | Age restriction |

#### Usage Example

```json
{
  "name": "termsAccepted",
  "type": "checkbox",
  "validation": [
    {
      "type": "custom",
      "validator": "@@VALIDATOR:mustBeTrue",
      "message": "You must accept the terms"
    }
  ]
}
```

Equivalent code:
```typescript
{
  name: "termsAccepted",
  type: "checkbox",
  validation: [
    {
      type: "custom",
      validator: (value) => value === true,
      message: "You must accept the terms"
    }
  ]
}
```

#### Register Custom Validators

```typescript
import { registerValidator } from "@/components/DynamicForm/formConfigSerializer";

registerValidator("customValidator", (value, formData) => {
  // Your validation logic
  return value > 100 || "Value must be greater than 100";
});
```

Then use in JSON:
```json
{
  "validator": "@@VALIDATOR:customValidator"
}
```

---

### 3. Formatter References

Format: `@@FORMATTER:formatterName`

Used for `formatGroupTitle` in `groupedInputGroup` fields.

#### Available Predefined Formatters

| Name | Output Example |
|------|----------------|
| `default` | "GroupName (5 items)" |
| `vietnameseProducts` | "GroupName (5 sản phẩm)" |
| `withDash` | "GroupName - 5 items" |
| `nameOnly` | "GroupName" |

#### Usage Example

```json
{
  "name": "productsByBrand",
  "type": "groupedInputGroup",
  "formatGroupTitle": "@@FORMATTER:vietnameseProducts",
  "items": [...]
}
```

Equivalent code:
```typescript
{
  name: "productsByBrand",
  type: "groupedInputGroup",
  formatGroupTitle: (groupKey, items) => `${groupKey} (${items.length} sản phẩm)`,
  items: [...]
}
```

#### Register Custom Formatters

```typescript
import { registerFormatter } from "@/components/DynamicForm/formConfigSerializer";

registerFormatter("customFormatter", (groupKey, items) => {
  return `${groupKey}: ${items.length} products total`;
});
```

---

### 4. Upload Provider References

Format: `@@UPLOAD_PROVIDER:providerName`

Used for `cloudConfig` in `imageCapture` fields.

#### Available Predefined Providers

| Name | Description |
|------|-------------|
| `mock` | Creates object URL (for testing) |
| `firebase` | Firebase Storage upload |
| `supabase` | Supabase Storage upload |

#### Usage Example

```json
{
  "name": "profileImage",
  "type": "imageCapture",
  "cloudConfig": "@@UPLOAD_PROVIDER:mock"
}
```

Equivalent code:
```typescript
{
  name: "profileImage",
  type: "imageCapture",
  cloudConfig: {
    provider: "custom",
    uploadFunction: async (file: File) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return URL.createObjectURL(file);
    }
  }
}
```

#### Register Custom Upload Providers

```typescript
import { registerUploadProvider } from "@/components/DynamicForm/formConfigSerializer";

registerUploadProvider("s3", {
  provider: "custom",
  uploadFunction: async (file: File) => {
    // Upload to S3
    const url = await uploadToS3(file);
    return url;
  }
});
```

---

## Complete Workflow

### 1. Create JSON Config

Create a JSON file with special references:

```json
{
  "title": "My Form",
  "sections": [
    {
      "title": "Personal Info",
      "fields": [
        {
          "name": "birthDate",
          "type": "date",
          "label": "Birth Date",
          "maxDate": "@@DATE_NOW"
        },
        {
          "name": "terms",
          "type": "checkbox",
          "label": "Terms",
          "validation": [
            {
              "type": "custom",
              "validator": "@@VALIDATOR:mustBeTrue"
            }
          ]
        }
      ]
    }
  ]
}
```

### 2. Store in Database

Store the JSON string in your database:

```typescript
const jsonString = JSON.stringify(formConfig);
await db.formConfigs.create({ config: jsonString });
```

### 3. Load and Hydrate

Load from database and hydrate:

```typescript
import { hydrateFormConfig } from "@/components/DynamicForm/formConfigSerializer";

// Load from database
const configRecord = await db.formConfigs.findById(id);
const jsonConfig = JSON.parse(configRecord.config);

// Hydrate to runtime config
const runtimeConfig = hydrateFormConfig(jsonConfig);

// Use in DynamicForm
<DynamicForm config={runtimeConfig} />
```

### 4. Display Form

The hydrated config is now a full `FormConfig` with all functions and dates restored.

---

## API Reference

### `hydrateFormConfig(config: any): FormConfig`

Converts a JSON-safe config to a runtime FormConfig with hydrated functions and dates.

```typescript
import { hydrateFormConfig } from "@/components/DynamicForm/formConfigSerializer";

const jsonConfig = { /* ... */ };
const runtimeConfig = hydrateFormConfig(jsonConfig);
```

### `serializeFormConfig(config: FormConfig): string`

Serializes a FormConfig to JSON string (for debugging/inspection).

```typescript
import { serializeFormConfig } from "@/components/DynamicForm/formConfigSerializer";

const jsonString = serializeFormConfig(formConfig);
console.log(jsonString);
```

### `registerValidator(name: string, validator: Function)`

Registers a custom validator that can be referenced in JSON.

```typescript
import { registerValidator } from "@/components/DynamicForm/formConfigSerializer";

registerValidator("myValidator", (value, formData) => {
  return value > 0 || "Must be positive";
});
```

### `registerFormatter(name: string, formatter: Function)`

Registers a custom formatter for grouped input groups.

```typescript
import { registerFormatter } from "@/components/DynamicForm/formConfigSerializer";

registerFormatter("myFormatter", (groupKey, items) => {
  return `${groupKey}: ${items.length}`;
});
```

### `registerUploadProvider(name: string, provider: any)`

Registers a custom upload provider for image capture.

```typescript
import { registerUploadProvider } from "@/components/DynamicForm/formConfigSerializer";

registerUploadProvider("myProvider", {
  provider: "custom",
  uploadFunction: async (file) => {
    // Upload logic
    return url;
  }
});
```

---

## Best Practices

### 1. Register Custom Functions Early

Register all custom validators, formatters, and upload providers before hydrating any configs:

```typescript
// app/layout.tsx or similar
import { registerValidator, registerFormatter, registerUploadProvider } from "@/components/DynamicForm/formConfigSerializer";

// Register on app initialization
registerValidator("customValidator", ...);
registerFormatter("customFormatter", ...);
registerUploadProvider("customProvider", ...);
```

### 2. Use Descriptive Names

Use clear, descriptive names for your custom functions:

```typescript
// Good
registerValidator("phoneNumberVietnam", ...);
registerValidator("addressWithinCity", ...);

// Bad
registerValidator("v1", ...);
registerValidator("check", ...);
```

### 3. Document Custom Functions

Create a document listing all custom validators, formatters, and providers:

```markdown
## Custom Validators
- `phoneNumberVietnam`: Validates Vietnamese phone numbers
- `addressWithinCity`: Checks if address is within city limits

## Custom Formatters
- `productCountVN`: Formats product count in Vietnamese

## Custom Upload Providers
- `companyS3`: Uploads to company S3 bucket
```

### 4. Version Your Configs

Add a version field to your configs for migration:

```json
{
  "version": "1.0",
  "title": "My Form",
  "sections": [...]
}
```

### 5. Validate Before Saving

Validate configs before saving to database:

```typescript
function validateConfig(config: any): boolean {
  // Check all validator references exist
  // Check all formatter references exist
  // Check all upload provider references exist
  // ...
  return true;
}
```

---

## Example: Complete Setup

```typescript
// app/providers/FormConfigProvider.tsx
"use client";

import { useEffect } from "react";
import {
  registerValidator,
  registerFormatter,
  registerUploadProvider
} from "@/components/DynamicForm/formConfigSerializer";

export function FormConfigProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register custom validators
    registerValidator("vietnamesePhone", (value) => {
      const phoneRegex = /^(0|\+84)[3-9][0-9]{8}$/;
      return phoneRegex.test(value) || "Số điện thoại không hợp lệ";
    });

    // Register custom formatters
    registerFormatter("productCountVN", (groupKey, items) => {
      return `${groupKey} (${items.length} sản phẩm)`;
    });

    // Register custom upload providers
    registerUploadProvider("companyS3", {
      provider: "custom",
      uploadFunction: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });
        const data = await response.json();
        return data.url;
      }
    });
  }, []);

  return <>{children}</>;
}
```

```typescript
// app/layout.tsx
import { FormConfigProvider } from "./providers/FormConfigProvider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <FormConfigProvider>
          {children}
        </FormConfigProvider>
      </body>
    </html>
  );
}
```

```typescript
// app/forms/[id]/page.tsx
import { hydrateFormConfig } from "@/components/DynamicForm/formConfigSerializer";
import { DynamicForm } from "@/components/DynamicForm";

export default async function FormPage({ params }: { params: { id: string } }) {
  // Load from database
  const configRecord = await db.formConfigs.findById(params.id);
  const jsonConfig = JSON.parse(configRecord.config);

  // Hydrate
  const runtimeConfig = hydrateFormConfig(jsonConfig);

  return (
    <DynamicForm
      config={runtimeConfig}
      onSubmit={handleSubmit}
    />
  );
}
```

---

## Troubleshooting

### Issue: "Validator X not found in PREDEFINED_VALIDATORS"

**Solution:** Make sure to register the validator before hydrating the config:

```typescript
registerValidator("X", ...);
```

### Issue: "Date is not being converted"

**Solution:** Check the date format in your JSON. Use:
- `@@DATE_NOW` for current date/time
- `@@DATE_TODAY` for today at midnight
- ISO string for specific dates

### Issue: "Upload function is not working"

**Solution:** Make sure the upload provider is registered:

```typescript
registerUploadProvider("myProvider", ...);
```

And referenced correctly in JSON:

```json
{
  "cloudConfig": "@@UPLOAD_PROVIDER:myProvider"
}
```

---

## Migration from Code-Based to JSON-Based

If you have existing code-based configs, here's how to migrate:

### Before (Code-Based)

```typescript
const config: FormConfig = {
  sections: [
    {
      fields: [
        {
          name: "birthDate",
          type: "date",
          maxDate: new Date(), // ❌ Not JSON-safe
        },
        {
          name: "terms",
          type: "checkbox",
          validation: [
            {
              type: "custom",
              validator: (value) => value === true, // ❌ Not JSON-safe
            }
          ]
        }
      ]
    }
  ]
};
```

### After (JSON-Based)

```json
{
  "sections": [
    {
      "fields": [
        {
          "name": "birthDate",
          "type": "date",
          "maxDate": "@@DATE_NOW"
        },
        {
          "name": "terms",
          "type": "checkbox",
          "validation": [
            {
              "type": "custom",
              "validator": "@@VALIDATOR:mustBeTrue"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## Summary

✅ **Use special references** for dates, validators, formatters, and upload providers  
✅ **Register custom functions** before hydrating configs  
✅ **Store JSON in database** safely  
✅ **Hydrate at runtime** to restore full functionality  

This approach allows you to:
- Store form configurations in database
- Dynamically create and update forms
- Share form templates
- Version control form designs
- A/B test different form layouts

---

For more information, see:
- [DynamicForm README](./README.md)
- [DynamicForm Types](./types.ts)
- [Form Config Serializer](./formConfigSerializer.ts)

