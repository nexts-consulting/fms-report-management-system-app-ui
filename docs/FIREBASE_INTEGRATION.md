# Firebase Storage Integration Guide

## Tổng quan

DynamicForm đã được tích hợp sẵn với Firebase Storage service của project. Bạn có thể sử dụng trực tiếp trong JSON config mà không cần config gì thêm.

## Firebase Service đã config sẵn

Firebase service đã được khởi tạo tại `src/services/firebase/index.ts` với các biến môi trường:

```env
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

## Sử dụng Firebase trong JSON Config

### 1. Upload Provider đã định nghĩa sẵn

Hiện có 4 Firebase upload providers:

| Provider Name | Path | Mô tả |
|---------------|------|-------|
| `firebase` | `images/uploads` | Upload chung cho images |
| `firebaseReports` | `reports/attachments` | Upload cho reports |
| `firebaseProfiles` | `users/profiles` | Upload cho user profiles |
| `mock` | - | Mock upload (tạo object URL, không upload thật) |

### 2. Sử dụng trong JSON config

```json
{
  "name": "profileImage",
  "type": "imageCapture",
  "label": "Profile Image",
  "helperText": "Take a photo or upload an image",
  "span": 12,
  "cloudConfig": "@@UPLOAD_PROVIDER:firebase"
}
```

hoặc với custom path:

```json
{
  "name": "reportAttachment",
  "type": "imageCapture",
  "label": "Report Attachment",
  "cloudConfig": "@@UPLOAD_PROVIDER:firebaseReports"
}
```

### 3. Sử dụng trong code-based config

```typescript
const config: FormConfig = {
  sections: [
    {
      fields: [
        {
          name: "profileImage",
          type: "imageCapture",
          label: "Profile Image",
          cloudConfig: {
            provider: "firebase",
            path: "images/uploads"
          }
        }
      ]
    }
  ]
};
```

## Đăng ký custom Firebase upload provider

Nếu bạn cần thêm folder path khác:

```typescript
import { registerUploadProvider } from "@/components/DynamicForm";

// Đăng ký provider mới
registerUploadProvider("firebaseDocuments", {
  provider: "firebase",
  path: "documents/uploads",
});
```

Sau đó sử dụng trong JSON:

```json
{
  "cloudConfig": "@@UPLOAD_PROVIDER:firebaseDocuments"
}
```

## Cấu trúc thư mục trong Firebase Storage

Upload providers mặc định tạo cấu trúc như sau:

```
firebase-storage/
├── images/
│   └── uploads/
│       └── <filename>.jpg
├── reports/
│   └── attachments/
│       └── <filename>.jpg
└── users/
    └── profiles/
        └── <filename>.jpg
```

## Custom filename generation

Nếu muốn custom cách generate filename:

```typescript
registerUploadProvider("firebaseCustom", {
  provider: "firebase",
  path: "images/custom",
  generateFileName: (file: File) => {
    const userId = getCurrentUserId(); // Your logic
    const timestamp = Date.now();
    const ext = file.name.split('.').pop();
    return `user-${userId}-${timestamp}.${ext}`;
  }
});
```

## Upload Progress và Error Handling

Component ImageCapture tự động xử lý:
- ✅ Upload progress bar
- ✅ Error messages
- ✅ Upload success notification
- ✅ Retry mechanism

Bạn có thể listen các events:

```typescript
<DynamicForm
  config={config}
  onChange={(data, fieldName, value) => {
    if (fieldName === "profileImage") {
      console.log("Image URL:", value);
    }
  }}
/>
```

## Giới hạn file size và type

Thêm validation trong config:

```json
{
  "name": "profileImage",
  "type": "imageCapture",
  "label": "Profile Image",
  "cloudConfig": "@@UPLOAD_PROVIDER:firebase",
  "validation": [
    {
      "type": "custom",
      "validator": "@@VALIDATOR:validImageSize",
      "message": "Image size must be less than 5MB"
    }
  ]
}
```

Và đăng ký validator:

```typescript
import { registerValidator } from "@/components/DynamicForm";

registerValidator("validImageSize", (value) => {
  // value là URL string sau khi upload
  // Validation xảy ra sau khi upload thành công
  return true; // hoặc false với error message
});
```

## Lưu ý bảo mật

1. **Firebase Storage Rules**: Đảm bảo đã config Firebase Storage Rules phù hợp:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload to their folders
    match /images/uploads/{imageId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /reports/attachments/{imageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /users/profiles/{imageId} {
      allow read: if true;
      allow write: if request.auth != null 
                  && request.resource.size < 5 * 1024 * 1024; // Max 5MB
    }
  }
}
```

2. **File Size Limits**: Firebase Storage có giới hạn:
   - Free tier: 5GB storage, 1GB/day download
   - Paid tier: Unlimited với phí theo usage

3. **File Types**: Giới hạn file types trong config:

```typescript
registerUploadProvider("firebaseSecure", {
  provider: "firebase",
  path: "images/uploads",
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  maxFileSize: 5 * 1024 * 1024, // 5MB
});
```

## Troubleshooting

### Upload thất bại với "Storage is not initialized"

**Giải pháp**: Đảm bảo Firebase service đã được khởi tạo. Check console logs:
```
🚀 Initializing Firebase Service...
✅ Firebase Service initialized successfully
```

### Upload thất bại với "Permission denied"

**Giải pháp**: Check Firebase Storage Rules, đảm bảo user có quyền write.

### Upload chậm

**Giải pháp**: 
1. Resize/compress ảnh trước khi upload
2. Sử dụng Firebase CDN regions gần user
3. Check network connection

## Demo

Xem file `exampleJsonConfig.json` và `page.tsx` để xem demo đầy đủ.

## API Reference

### Predefined Firebase Providers

```typescript
// Default provider
"@@UPLOAD_PROVIDER:firebase"
// -> uploads to "images/uploads"

// Reports provider
"@@UPLOAD_PROVIDER:firebaseReports"  
// -> uploads to "reports/attachments"

// Profiles provider
"@@UPLOAD_PROVIDER:firebaseProfiles"
// -> uploads to "users/profiles"

// Mock provider (không upload thật)
"@@UPLOAD_PROVIDER:mock"
// -> tạo object URL local
```

### Register New Provider

```typescript
import { registerUploadProvider } from "@/components/DynamicForm";

registerUploadProvider(name: string, config: {
  provider: "firebase";
  path?: string;
  generateFileName?: (file: File) => string;
  maxFileSize?: number;
  allowedMimeTypes?: string[];
});
```

## Best Practices

1. ✅ Sử dụng JSON config với `@@UPLOAD_PROVIDER:firebase` để dễ lưu database
2. ✅ Đặt tên provider có ý nghĩa (firebaseReports, firebaseProfiles, etc.)
3. ✅ Giới hạn file size và types
4. ✅ Config Firebase Storage Rules phù hợp
5. ✅ Monitor Firebase usage để tránh vượt quota
6. ✅ Sử dụng CDN cho download nhanh hơn
7. ✅ Cleanup unused files định kỳ

## Kết luận

Firebase Storage integration đã sẵn sàng và dễ sử dụng. Chỉ cần thêm `"cloudConfig": "@@UPLOAD_PROVIDER:firebase"` vào field config là xong!

