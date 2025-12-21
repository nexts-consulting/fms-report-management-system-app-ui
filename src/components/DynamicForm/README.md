# DynamicForm Component

A powerful, flexible form system that renders forms dynamically from JSON configuration, following IBM Carbon Design principles.

## Features

- 🎨 **IBM Carbon Design** - Consistent, professional UI following Carbon Design System
- 📝 **JSON-Driven** - Define forms using simple JSON configuration
- 🔧 **Type-Safe** - Full TypeScript support with comprehensive types
- ✅ **Validation** - Built-in validation with custom rules
- 🔄 **Conditional Fields** - Show/hide fields based on other field values
- 📱 **Responsive** - Grid-based layout with customizable column spans
- 🎯 **Accessible** - ARIA labels and keyboard navigation support

## Supported Field Types

### Text & Number
- `text` - Text input (supports email, password, tel, url)
- `textarea` - Multi-line text input
- `number` - Number input with min/max/step
- `currency` - Currency input with formatting
- `percentage` - Percentage input (0-100)
- `masked` - Masked input (phone, code, id, custom patterns)

### Selection
- `select` - Single select dropdown
- `multiselect` - Multiple selection
- `checkbox` - Single checkbox
- `checkboxGroup` - Group of checkboxes
- `radioGroup` - Radio button group
- `switch` - Toggle switch

### Date & Time
- `date` - Date picker
- `time` - Time picker
- `datetime` - Date and time picker
- `dateRange` - Date range picker

### Special
- `imageCapture` - Image capture and upload (uses ImageCaptureInputWithUpload)

## Installation

The component is already included in the kits folder. Import it like this:

```typescript
import { DynamicForm, FormConfig } from "@/kits/components/DynamicForm";
```

## Basic Usage

```typescript
import { DynamicForm, FormConfig } from "@/kits/components/DynamicForm";

const formConfig: FormConfig = {
  title: "User Registration",
  description: "Please fill in your information",
  gridColumns: 12,
  fields: [
    {
      name: "fullName",
      type: "text",
      label: "Full Name",
      placeholder: "Enter your name",
      required: true,
      span: 6,
      validation: [
        { type: "required", message: "Name is required" },
        { type: "minLength", value: 2 },
      ],
    },
    {
      name: "email",
      type: "text",
      label: "Email",
      inputType: "email",
      required: true,
      span: 6,
      validation: [
        { type: "required" },
        { type: "email" },
      ],
    },
  ],
};

function MyForm() {
  const handleSubmit = (data: Record<string, any>) => {
    console.log("Form data:", data);
  };

  return (
    <DynamicForm
      config={formConfig}
      onSubmit={handleSubmit}
    />
  );
}
```

## Form Configuration

### FormConfig

```typescript
interface FormConfig {
  title?: string;
  description?: string;
  sections?: FormSection[];
  fields?: FieldConfig[];
  gridColumns?: number; // Default: 12
  className?: string;
  submitLabel?: string;
  cancelLabel?: string;
  showSubmit?: boolean;
  showCancel?: boolean;
}
```

### Field Configuration

All fields share these common properties:

```typescript
interface BaseFieldConfig {
  name: string;              // Required: unique field identifier
  type: FieldType;          // Required: field type
  label?: string;           // Field label
  helperText?: string;      // Helper text below field
  placeholder?: string;     // Placeholder text
  defaultValue?: any;       // Default value
  required?: boolean;       // Is field required
  disabled?: boolean;       // Is field disabled
  readonly?: boolean;       // Is field readonly
  validation?: ValidationRule[];
  conditional?: ConditionalRule[];
  className?: string;
  span?: number;            // Grid column span (1-12)
}
```

## Field Types Examples

### Text Input

```typescript
{
  name: "username",
  type: "text",
  label: "Username",
  inputType: "text" | "email" | "password" | "tel" | "url",
  maxLength: 50,
  minLength: 3,
}
```

### Number Input

```typescript
{
  name: "age",
  type: "number",
  label: "Age",
  min: 0,
  max: 120,
  step: 1,
}
```

### Currency Input

```typescript
{
  name: "price",
  type: "currency",
  label: "Price",
  currency: "VND",
  decimals: 0,
  min: 0,
}
```

### Percentage Input

```typescript
{
  name: "discount",
  type: "percentage",
  label: "Discount",
  min: 0,
  max: 100,
  decimals: 2,
}
```

### Masked Input

```typescript
{
  name: "phone",
  type: "masked",
  label: "Phone",
  mask: "phone", // or "code", "id", or custom pattern like "999-AAA"
}
```

### Select Input

```typescript
{
  name: "country",
  type: "select",
  label: "Country",
  options: [
    { label: "Vietnam", value: "vn" },
    { label: "USA", value: "us" },
  ],
  // Or async options:
  // options: async () => {
  //   const response = await fetch('/api/countries');
  //   return response.json();
  // },
}
```

### Multi-Select Input

```typescript
{
  name: "languages",
  type: "multiselect",
  label: "Languages",
  options: [
    { label: "English", value: "en" },
    { label: "Vietnamese", value: "vi" },
  ],
  maxSelections: 5,
}
```

### Checkbox

```typescript
{
  name: "agree",
  type: "checkbox",
  label: "Terms",
  checkboxLabel: "I agree to the terms",
}
```

### Checkbox Group

```typescript
{
  name: "interests",
  type: "checkboxGroup",
  label: "Interests",
  options: [
    { label: "Tech", value: "tech" },
    { label: "Sports", value: "sports" },
  ],
  grid: 3, // Number of columns
}
```

### Radio Group

```typescript
{
  name: "gender",
  type: "radioGroup",
  label: "Gender",
  options: [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
  ],
  direction: "horizontal" | "vertical",
}
```

### Switch

```typescript
{
  name: "notifications",
  type: "switch",
  label: "Notifications",
  switchLabel: "Enable notifications",
}
```

### Date Picker

```typescript
{
  name: "birthDate",
  type: "date",
  label: "Birth Date",
  format: "YYYY-MM-DD",
  minDate: "1900-01-01",
  maxDate: new Date(),
}
```

### Time Picker

```typescript
{
  name: "appointmentTime",
  type: "time",
  label: "Time",
  format: "24h" | "12h",
  minTime: "09:00",
  maxTime: "17:00",
}
```

### DateTime Picker

```typescript
{
  name: "eventDateTime",
  type: "datetime",
  label: "Event Date & Time",
  format: "YYYY-MM-DD HH:mm",
  minDateTime: new Date(),
}
```

### Date Range Picker

```typescript
{
  name: "vacationRange",
  type: "dateRange",
  label: "Vacation Period",
  format: "YYYY-MM-DD",
  minDate: new Date(),
}
```

### Image Capture

```typescript
{
  name: "profileImage",
  type: "imageCapture",
  label: "Profile Image",
  cloudConfig: {
    provider: "firebase",
    path: "images/profiles",
  },
  // Or custom upload:
  // cloudConfig: {
  //   provider: "custom",
  //   uploadFunction: async (file) => {
  //     const formData = new FormData();
  //     formData.append("image", file);
  //     const response = await fetch("/api/upload", {
  //       method: "POST",
  //       body: formData,
  //     });
  //     const data = await response.json();
  //     return data.url;
  //   },
  // },
}
```

## Validation

### Validation Rules

```typescript
interface ValidationRule {
  type: "required" | "min" | "max" | "minLength" | "maxLength" | "pattern" | "email" | "custom";
  value?: any;
  message?: string;
  validator?: (value: any, formData: Record<string, any>) => boolean | string;
}
```

### Examples

```typescript
{
  name: "email",
  type: "text",
  validation: [
    { type: "required", message: "Email is required" },
    { type: "email", message: "Invalid email format" },
    { type: "minLength", value: 5 },
    {
      type: "custom",
      validator: (value, formData) => {
        return value.endsWith("@company.com") || "Must be company email";
      },
    },
  ],
}
```

## Conditional Fields

Show/hide fields based on other field values:

```typescript
{
  name: "vehicleModel",
  type: "text",
  label: "Vehicle Model",
  conditional: [
    {
      field: "hasVehicle",
      operator: "equals",
      value: true,
    },
  ],
}
```

### Conditional Operators

- `equals` - Field equals value
- `notEquals` - Field does not equal value
- `contains` - Field contains value (for arrays/strings)
- `notContains` - Field does not contain value
- `greaterThan` - Field is greater than value (numbers)
- `lessThan` - Field is less than value (numbers)
- `isEmpty` - Field is empty
- `isNotEmpty` - Field is not empty

## Form Sections

Organize fields into sections:

```typescript
const formConfig: FormConfig = {
  sections: [
    {
      title: "Personal Information",
      description: "Enter your personal details",
      fields: [
        { name: "name", type: "text", label: "Name" },
        { name: "email", type: "text", label: "Email" },
      ],
    },
    {
      title: "Preferences",
      fields: [
        { name: "theme", type: "select", label: "Theme", options: [...] },
      ],
    },
  ],
};
```

## Controlled vs Uncontrolled

### Uncontrolled (Default)

```typescript
<DynamicForm
  config={formConfig}
  initialValues={{ name: "John" }}
  onSubmit={handleSubmit}
/>
```

### Controlled

```typescript
const [formData, setFormData] = useState({});

<DynamicForm
  config={formConfig}
  values={formData}
  onChange={(data, fieldName, value) => {
    setFormData(data);
    console.log(`${fieldName} changed to:`, value);
  }}
  onSubmit={handleSubmit}
/>
```

## API Reference

### DynamicForm Props

```typescript
interface DynamicFormProps {
  config: FormConfig;                    // Required: form configuration
  initialValues?: Record<string, any>;  // Initial form values
  values?: Record<string, any>;        // Controlled form values
  onChange?: FormChangeHandler;         // Callback when values change
  onSubmit?: FormSubmitHandler;         // Callback on form submit
  onCancel?: () => void;                // Callback on cancel
  disabled?: boolean;                    // Disable all fields
  errors?: Record<string, string>;      // External validation errors
  showErrors?: boolean;                 // Show validation errors (default: true)
}
```

## Demo

See the demo page at:
`/dynamic-form-demo`

Or import the demo configuration:

```typescript
import { DynamicForm } from "@/kits/components/DynamicForm";
// See demo page for full example
```

## Design Principles

This component follows IBM Carbon Design System principles:

1. **Consistency** - All fields follow the same design patterns
2. **Accessibility** - ARIA labels, keyboard navigation, focus management
3. **Responsive** - Grid-based layout adapts to screen size
4. **Feedback** - Clear error states and validation messages
5. **Flexibility** - Easy to extend with new field types

## Styling

The component uses Tailwind CSS classes following the existing design system:

- Colors: `gray-10`, `gray-70`, `primary-60`, `red-60`
- Spacing: Consistent 8px grid
- Typography: `text-sm`, `font-normal`, `font-semibold`
- Focus states: `outline-primary-60`

## Contributing

When adding new field types:

1. Create the field component in `fields/` directory
2. Add the field type to `types.ts`
3. Add the render case in `FieldRenderer.tsx`
4. Update this README with examples
5. Add to the demo page

## License

Part of the FMS Report Management System.

