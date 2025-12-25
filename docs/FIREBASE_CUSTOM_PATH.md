# JSON Config với Firebase - Quick Guide

## 🔥 2 Cách config Firebase trong JSON

### 1️⃣ Predefined Provider (Path cố định)

Sử dụng string reference cho các path phổ biến:

```json
{
  "name": "photo",
  "type": "imageCapture",
  "label": "Photo",
  "cloudConfig": "@@UPLOAD_PROVIDER:firebase"
}
```

**Available Providers:**
- `"@@UPLOAD_PROVIDER:firebase"` → `images/uploads`
- `"@@UPLOAD_PROVIDER:firebaseReports"` → `reports/attachments`
- `"@@UPLOAD_PROVIDER:firebaseProfiles"` → `users/profiles`
- `"@@UPLOAD_PROVIDER:api"` → Custom API upload

### 2️⃣ Custom Path (Linh hoạt hơn) ⭐

Sử dụng object config để tự định nghĩa path:

```json
{
  "name": "photo",
  "type": "imageCapture",
  "label": "Photo",
  "cloudConfig": {
    "provider": "firebase",
    "path": "your/custom/path"
  }
}
```

## 📝 Ví dụ thực tế

### Example 1: Upload theo user ID

```json
{
  "name": "avatar",
  "type": "imageCapture",
  "label": "Avatar",
  "cloudConfig": {
    "provider": "firebase",
    "path": "users/avatars"
  }
}
```

Kết quả: `users/avatars/filename.jpg`

### Example 2: Upload theo project

```json
{
  "name": "projectImage",
  "type": "imageCapture",
  "label": "Project Image",
  "cloudConfig": {
    "provider": "firebase",
    "path": "projects/images"
  }
}
```

Kết quả: `projects/images/filename.jpg`

### Example 3: Upload theo tenant và project

```json
{
  "name": "reportAttachment",
  "type": "imageCapture",
  "label": "Report Attachment",
  "cloudConfig": {
    "provider": "firebase",
    "path": "tenants/ABC/projects/XYZ/reports"
  }
}
```

Kết quả: `tenants/ABC/projects/XYZ/reports/filename.jpg`

### Example 4: Nhiều fields với paths khác nhau

```json
{
  "fields": [
    {
      "name": "profilePicture",
      "type": "imageCapture",
      "label": "Profile Picture",
      "span": 6,
      "cloudConfig": "@@UPLOAD_PROVIDER:firebaseProfiles"
    },
    {
      "name": "reportPhoto1",
      "type": "imageCapture",
      "label": "Report Photo 1",
      "span": 6,
      "cloudConfig": {
        "provider": "firebase",
        "path": "reports/daily/photos"
      }
    },
    {
      "name": "reportPhoto2",
      "type": "imageCapture",
      "label": "Report Photo 2",
      "span": 6,
      "cloudConfig": {
        "provider": "firebase",
        "path": "reports/daily/photos"
      }
    },
    {
      "name": "signature",
      "type": "imageCapture",
      "label": "Signature",
      "span": 6,
      "cloudConfig": {
        "provider": "firebase",
        "path": "reports/signatures"
      }
    }
  ]
}
```

## 🎯 Khi nào dùng cách nào?

| Trường hợp | Nên dùng |
|------------|----------|
| Path cố định, phổ biến | **String reference** `"@@UPLOAD_PROVIDER:firebase"` |
| Path theo tenant/project | **Object config** với custom path |
| Path dynamic (theo user, date, etc.) | **Object config** + đăng ký provider |
| Path thay đổi thường xuyên | **Object config** |

## 🔧 Advanced: Custom Provider với dynamic path

Nếu cần path thực sự dynamic (dựa vào runtime data), đăng ký provider:

```typescript
import { registerUploadProvider } from "@/components/DynamicForm";

// Assume you have these from context
const tenantCode = "TENANT_ABC";
const projectCode = "PROJECT_123";

registerUploadProvider("dynamicReports", {
  provider: "firebase",
  path: `tenants/${tenantCode}/projects/${projectCode}/reports`,
});
```

Sau đó trong JSON:

```json
{
  "cloudConfig": "@@UPLOAD_PROVIDER:dynamicReports"
}
```

## ⚠️ Lưu ý quan trọng

### 1. Path structure

```
✅ GOOD:
- "images/uploads"
- "reports/attachments"
- "users/profiles/avatars"

❌ BAD:
- "/images/uploads" (không bắt đầu bằng /)
- "images//uploads" (không double slash)
- "images/uploads/" (không kết thúc bằng /)
```

### 2. Firebase Storage Rules

Đảm bảo path bạn dùng có trong Storage Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow custom paths
    match /reports/{folder}/{imageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Allow tenant-specific paths
    match /tenants/{tenantId}/projects/{projectId}/reports/{imageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### 3. Database storage

Object config vẫn JSON-safe và có thể lưu database:

```json
{
  "cloudConfig": {
    "provider": "firebase",
    "path": "custom/path"
  }
}
```

Khi load từ database, `hydrateFormConfig()` sẽ giữ nguyên object này.

## 📊 So sánh

| Feature | String Reference | Object Config |
|---------|-----------------|---------------|
| **Syntax** | `"@@UPLOAD_PROVIDER:firebase"` | `{ "provider": "firebase", "path": "..." }` |
| **Flexibility** | ⭐⭐ Fixed paths | ⭐⭐⭐⭐⭐ Fully customizable |
| **Setup** | No setup needed | No setup needed |
| **Database-safe** | ✅ Yes | ✅ Yes |
| **Best for** | Common paths | Custom paths |

## 🚀 Recommendation

**Use Object Config với custom path** cho hầu hết các trường hợp!

Nó:
- ✅ Linh hoạt hơn
- ✅ Vẫn JSON-safe
- ✅ Dễ đọc và maintain
- ✅ Không cần đăng ký trước

**Use String Reference** chỉ khi:
- Path cố định và được dùng nhiều nơi
- Muốn tránh duplicate config
- Có logic phức tạp cần xử lý trong provider

## 📚 Complete Example

```json
{
  "title": "Field Service Report",
  "sections": [
    {
      "title": "Report Images",
      "fields": [
        {
          "name": "sitePhoto",
          "type": "imageCapture",
          "label": "Site Photo",
          "span": 6,
          "cloudConfig": {
            "provider": "firebase",
            "path": "field-service/site-photos"
          }
        },
        {
          "name": "equipmentPhoto",
          "type": "imageCapture",
          "label": "Equipment Photo",
          "span": 6,
          "cloudConfig": {
            "provider": "firebase",
            "path": "field-service/equipment-photos"
          }
        },
        {
          "name": "signaturePhoto",
          "type": "imageCapture",
          "label": "Customer Signature",
          "span": 12,
          "cloudConfig": {
            "provider": "firebase",
            "path": "field-service/signatures"
          }
        }
      ]
    }
  ]
}
```

## 🎉 Summary

**Cách đơn giản nhất:**

```json
{
  "cloudConfig": {
    "provider": "firebase",
    "path": "your/custom/path"
  }
}
```

Thế là xong! Firebase sẽ upload vào path bạn chỉ định. 🚀

