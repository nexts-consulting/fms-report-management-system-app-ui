# JSON Config Quick Start

## Vấn đề đã được giải quyết ✅

Các vấn đề sau trong FormConfig không thể serialize thành JSON để lưu database:

1. ❌ **Date objects**: `maxDate: new Date()`
2. ❌ **Functions**: `validator: (value) => value === true`
3. ❌ **Upload handlers**: `uploadFunction: async (file) => {...}`
4. ❌ **Formatters**: `formatGroupTitle: (key, items) => {...}`

## Giải pháp

Sử dụng **special string references** thay thế:

| Thay vì | Sử dụng |
|---------|---------|
| `new Date()` | `"@@DATE_NOW"` |
| `new Date(y, m, d)` | `"@@DATE_TODAY"` |
| `validator: (v) => v === true` | `"validator": "@@VALIDATOR:mustBeTrue"` |
| `formatGroupTitle: (k, i) => ...` | `"formatGroupTitle": "@@FORMATTER:vietnameseProducts"` |
| `uploadFunction: async (f) => ...` | `"cloudConfig": "@@UPLOAD_PROVIDER:mock"` |

## Cách sử dụng nhanh

### 1. Tạo JSON config với special references

```json
{
  "title": "My Form",
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
        },
        {
          "name": "photo",
          "type": "imageCapture",
          "cloudConfig": "@@UPLOAD_PROVIDER:mock"
        },
        {
          "name": "products",
          "type": "groupedInputGroup",
          "formatGroupTitle": "@@FORMATTER:vietnameseProducts",
          "items": [...]
        }
      ]
    }
  ]
}
```

### 2. Lưu vào database

```typescript
// Lưu JSON string vào database
const jsonString = JSON.stringify(formConfig);
await db.formConfigs.create({ config: jsonString });
```

### 3. Load và hydrate

```typescript
import { hydrateFormConfig } from "@/components/DynamicForm";

// Load từ database
const configRecord = await db.formConfigs.findById(id);
const jsonConfig = JSON.parse(configRecord.config);

// Hydrate để restore functions và dates
const runtimeConfig = hydrateFormConfig(jsonConfig);

// Sử dụng trong DynamicForm
<DynamicForm config={runtimeConfig} />
```

## Predefined Values có sẵn

### Validators
- `mustBeTrue` - Giá trị phải là true
- `notEmpty` - Không được để trống
- `companyEmail` - Email phải có @company.com
- `validUrl` - Phải là URL hợp lệ
- `adult` - Tuổi >= 18

### Formatters
- `default` - "GroupName (5 items)"
- `vietnameseProducts` - "GroupName (5 sản phẩm)"
- `withDash` - "GroupName - 5 items"
- `nameOnly` - "GroupName"

### Upload Providers
- `mock` - Tạo object URL (để test)
- `firebase` - Firebase Storage
- `supabase` - Supabase Storage

## Đăng ký custom functions

```typescript
import {
  registerValidator,
  registerFormatter,
  registerUploadProvider
} from "@/components/DynamicForm";

// Đăng ký validator
registerValidator("vietnamesePhone", (value) => {
  const regex = /^(0|\+84)[3-9][0-9]{8}$/;
  return regex.test(value) || "Số điện thoại không hợp lệ";
});

// Đăng ký formatter
registerFormatter("myFormatter", (groupKey, items) => {
  return `${groupKey}: ${items.length}`;
});

// Đăng ký upload provider
registerUploadProvider("s3", {
  provider: "custom",
  uploadFunction: async (file) => {
    // Upload logic
    return url;
  }
});
```

Sau đó sử dụng trong JSON:
```json
{
  "validator": "@@VALIDATOR:vietnamesePhone",
  "formatGroupTitle": "@@FORMATTER:myFormatter",
  "cloudConfig": "@@UPLOAD_PROVIDER:s3"
}
```

## Demo

Xem file `page.tsx` để demo đầy đủ cả code-based và JSON-based config.

Xem file `exampleJsonConfig.json` để xem JSON config mẫu.

## Chi tiết đầy đủ

Xem [DATABASE_CONFIG_GUIDE.md](./DATABASE_CONFIG_GUIDE.md) để biết chi tiết đầy đủ.

