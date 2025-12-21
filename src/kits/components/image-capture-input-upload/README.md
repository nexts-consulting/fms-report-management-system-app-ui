# ImageCaptureInputWithUpload Component

Component tự động upload ảnh lên cloud storage (Firebase/GCP/S3) và trả về URL thay vì File object.

## Tính năng

- ✅ Tự động upload ảnh lên cloud storage sau khi capture
- ✅ Hỗ trợ nhiều cloud provider: Firebase Storage, GCP Storage, AWS S3, Custom
- ✅ Hiển thị progress bar khi upload
- ✅ Error handling với thông báo rõ ràng
- ✅ Preview ảnh trước và sau khi upload
- ✅ Tương thích với form libraries (React Hook Form, Formik, etc.)

## Cài đặt

Component này sử dụng các dependencies sau:
- `firebase/storage` (cho Firebase Storage)
- `nanoid` (cho generate unique IDs)

Đảm bảo đã cài đặt các packages cần thiết:

```bash
npm install firebase nanoid
# hoặc
yarn add firebase nanoid
```

## Cấu hình Cloud Provider

### 1. Firebase Storage

```typescript
import { ImageCaptureInputWithUpload } from "@/kits/components/ImageCaptureInputWithUpload";
import { firebaseService } from "@/services/firebase";

const firebaseConfig = {
  provider: "firebase" as const,
  path: "images/uploads", // Optional: folder path in storage
  // Optional: custom filename generator
  generateFileName: (file: File) => `user-${userId}-${Date.now()}.jpg`,
  // Optional: max file size (default: 10MB)
  maxFileSize: 5 * 1024 * 1024, // 5MB
  // Optional: allowed MIME types
  allowedMimeTypes: ["image/jpeg", "image/png"],
  // Optional: use custom storage instance
  storage: firebaseService.storage,
};
```

### 2. Custom Upload Function

Nếu bạn muốn sử dụng backend API của riêng mình:

```typescript
const customConfig = {
  provider: "custom" as const,
  path: "uploads",
  uploadFunction: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error("Upload failed");
    }
    
    const data = await response.json();
    return data.url; // Return the URL of uploaded image
  },
};
```

### 3. GCP Storage

**Lưu ý**: GCP upload yêu cầu backend implementation để bảo mật credentials. Sử dụng custom upload function với backend API.

```typescript
const gcpConfig = {
  provider: "gcp" as const,
  bucket: "my-bucket",
  projectId: "my-project",
  path: "images",
  // Use custom upload function that calls your backend
  uploadFunction: async (file: File) => {
    // Call your backend API that handles GCP upload
    const response = await fetch("/api/upload/gcp", {
      method: "POST",
      body: file,
    });
    const data = await response.json();
    return data.url;
  },
};
```

### 4. AWS S3

**Lưu ý**: S3 upload yêu cầu backend implementation để bảo mật credentials. Sử dụng custom upload function với backend API.

```typescript
const s3Config = {
  provider: "s3" as const,
  bucket: "my-bucket",
  region: "us-east-1",
  path: "images",
  // Use custom upload function that calls your backend
  uploadFunction: async (file: File) => {
    // Call your backend API that handles S3 upload
    const response = await fetch("/api/upload/s3", {
      method: "POST",
      body: file,
    });
    const data = await response.json();
    return data.url;
  },
};
```

## Sử dụng cơ bản

```tsx
import { ImageCaptureInputWithUpload } from "@/kits/components/ImageCaptureInputWithUpload";
import { useState } from "react";

function MyForm() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <ImageCaptureInputWithUpload
      label="Upload Image"
      helperText="Click to capture or upload image"
      cloudConfig={{
        provider: "firebase",
        path: "images/uploads",
      }}
      value={imageUrl}
      onChange={(url) => setImageUrl(url)}
    />
  );
}
```

## Sử dụng với React Hook Form

```tsx
import { useForm, Controller } from "react-hook-form";
import { ImageCaptureInputWithUpload } from "@/kits/components/ImageCaptureInputWithUpload";

interface FormData {
  imageUrl: string | null;
}

function MyForm() {
  const { control, handleSubmit } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log("Image URL:", data.imageUrl);
    // Save to database
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="imageUrl"
        control={control}
        render={({ field }) => (
          <ImageCaptureInputWithUpload
            label="Profile Image"
            cloudConfig={{
              provider: "firebase",
              path: "profiles",
            }}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Với Upload Progress Tracking

```tsx
function MyForm() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  return (
    <ImageCaptureInputWithUpload
      label="Upload Image"
      cloudConfig={{
        provider: "firebase",
        path: "images/uploads",
      }}
      value={imageUrl}
      onChange={(url) => setImageUrl(url)}
      onUploadProgress={(progress) => {
        setUploadProgress(progress);
        console.log(`Upload progress: ${progress}%`);
      }}
      onUploadSuccess={(url) => {
        console.log("Upload successful:", url);
      }}
      onUploadError={(error) => {
        console.error("Upload failed:", error);
      }}
    />
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string \| ReactNode` | No | - | Label for the input field |
| `helperText` | `string \| ReactNode` | No | - | Helper text displayed below trigger |
| `value` | `string \| null` | No | - | Current image URL (controlled) |
| `onChange` | `(url: string \| null) => void` | No | - | Callback when image URL changes |
| `cloudConfig` | `CloudConfig` | **Yes** | - | Cloud storage configuration |
| `defaultFacingMode` | `"user" \| "environment"` | No | `"user"` | Default camera facing mode |
| `error` | `boolean` | No | `false` | Show error state |
| `onUploadProgress` | `(progress: number) => void` | No | - | Callback for upload progress (0-100) |
| `onUploadError` | `(error: Error) => void` | No | - | Callback when upload fails |
| `onUploadSuccess` | `(url: string) => void` | No | - | Callback when upload succeeds |
| `disabled` | `boolean` | No | `false` | Disable the component |

## CloudConfig Types

### FirebaseConfig
```typescript
{
  provider: "firebase";
  path?: string;
  generateFileName?: (file: File) => string;
  maxFileSize?: number;
  allowedMimeTypes?: string[];
  storage?: FirebaseStorage; // Optional, uses default if not provided
  bucket?: string; // Optional, uses default if not provided
}
```

### CustomConfig
```typescript
{
  provider: "custom";
  path?: string;
  generateFileName?: (file: File) => string;
  maxFileSize?: number;
  allowedMimeTypes?: string[];
  uploadFunction: (file: File, config: CustomConfig) => Promise<string>;
}
```

## Best Practices

1. **Luôn sử dụng Custom Upload Function cho Production**: Để bảo mật credentials và có control tốt hơn, nên tạo backend API endpoint để xử lý upload.

2. **Error Handling**: Luôn implement `onUploadError` để xử lý lỗi một cách graceful.

3. **File Size Limits**: Set `maxFileSize` phù hợp với use case của bạn để tránh upload files quá lớn.

4. **Path Organization**: Sử dụng `path` để tổ chức files trong storage bucket (e.g., `users/{userId}/photos`, `products/{productId}/images`).

5. **Filename Generation**: Sử dụng `generateFileName` để tạo unique filenames và tránh conflicts.

## Migration từ ImageCaptureInput

Nếu bạn đang sử dụng `ImageCaptureInput` và muốn migrate sang `ImageCaptureInputWithUpload`:

**Trước:**
```tsx
<ImageCaptureInput
  value={file}
  onChange={(file) => setFile(file)}
/>
// File object cần được upload manually
```

**Sau:**
```tsx
<ImageCaptureInputWithUpload
  cloudConfig={{ provider: "firebase", path: "uploads" }}
  value={imageUrl}
  onChange={(url) => setImageUrl(url)}
/>
// URL được trả về tự động sau khi upload
```

## Troubleshooting

### Firebase Storage không khởi tạo
Đảm bảo Firebase đã được cấu hình đúng trong `@/services/firebase` hoặc truyền `storage` instance vào config.

### Upload fails với CORS error
Nếu sử dụng custom upload function, đảm bảo backend API đã cấu hình CORS đúng cách.

### File size quá lớn
Tăng `maxFileSize` trong config hoặc compress image trước khi upload.

## Examples

Xem thêm examples trong file `stories/index.stories.tsx`.
