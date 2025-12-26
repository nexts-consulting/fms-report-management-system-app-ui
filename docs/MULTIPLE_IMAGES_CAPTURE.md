# Multiple Images Capture Input Upload

## Overview

`MultipleImagesCaptureInputUpload` component cho phép users capture và upload nhiều ảnh lên cloud storage (Firebase/GCP/S3). Component tự động quản lý array of URLs thay vì single URL.

## Features

- ✅ **Multiple Images** - Upload nhiều ảnh cùng lúc
- ✅ **Firebase Integration** - Tự động upload lên Firebase Storage
- ✅ **Grid Layout** - Hiển thị dạng grid với 1-4 columns
- ✅ **Reorder Images** - Di chuyển ảnh left/right
- ✅ **Progress Tracking** - Progress bar cho từng ảnh
- ✅ **Image Index** - Hiển thị số thứ tự ảnh
- ✅ **Min/Max Validation** - Giới hạn số lượng ảnh
- ✅ **Maximized Preview** - Xem ảnh full screen
- ✅ **Error Handling** - Error messages cho từng ảnh
- ✅ **Responsive** - Hoạt động tốt trên mobile

## Installation

Component đã được tạo tại:
```
src/kits/components/multiple-images-capture-input-upload/index.tsx
```

## Basic Usage

### Standalone Component

```typescript
import { MultipleImagesCaptureInputUpload } from "@/kits/components/multiple-images-capture-input-upload";

function MyForm() {
  const [images, setImages] = useState<string[]>([]);

  return (
    <MultipleImagesCaptureInputUpload
      label="Upload Photos"
      value={images}
      onChange={setImages}
      cloudConfig={{
        provider: "firebase",
        path: "photos/uploads"
      }}
      maxImages={5}
      minImages={1}
      gridColumns={2}
    />
  );
}
```

### In DynamicForm (JSON Config)

```json
{
  "name": "photos",
  "type": "multipleImagesCapture",
  "label": "Report Photos",
  "helperText": "Upload 1-5 photos",
  "span": 12,
  "cloudConfig": {
    "provider": "firebase",
    "path": "reports/photos"
  },
  "maxImages": 5,
  "minImages": 1,
  "gridColumns": 2,
  "showImageIndex": true
}
```

### In DynamicForm (Code-based)

```typescript
const formConfig: FormConfig = {
  sections: [
    {
      fields: [
        {
          name: "photos",
          type: "multipleImagesCapture",
          label: "Report Photos",
          span: 12,
          cloudConfig: {
            provider: "firebase",
            path: "reports/photos"
          },
          maxImages: 5,
          minImages: 1,
          gridColumns: 2,
          showImageIndex: true,
        }
      ]
    }
  ]
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string \| ReactNode` | - | Label for the field |
| `helperText` | `string \| ReactNode` | - | Helper text below add button |
| `value` | `string[]` | `[]` | Array of image URLs |
| `onChange` | `(urls: string[]) => void` | - | Callback when URLs change |
| `cloudConfig` | `CloudConfig` | **required** | Firebase/GCP/S3 config |
| `defaultFacingMode` | `"user" \| "environment"` | `"user"` | Default camera mode |
| `error` | `boolean` | `false` | Show error state |
| `maxImages` | `number` | `Infinity` | Maximum images allowed |
| `minImages` | `number` | `0` | Minimum images required |
| `gridColumns` | `1 \| 2 \| 3 \| 4` | `2` | Grid columns |
| `showImageIndex` | `boolean` | `true` | Show image number badge |
| `disabled` | `boolean` | `false` | Disable component |
| `onUploadProgress` | `(index, progress) => void` | - | Upload progress per image |
| `onUploadError` | `(index, error) => void` | - | Upload error callback |
| `onUploadSuccess` | `(index, url) => void` | - | Upload success callback |

## CloudConfig Options

### Firebase (Recommended)

```typescript
{
  provider: "firebase",
  path: "reports/photos"
}
```

### GCP Storage

```typescript
{
  provider: "gcp",
  bucket: "my-bucket",
  projectId: "my-project",
  path: "photos"
}
```

### AWS S3

```typescript
{
  provider: "s3",
  bucket: "my-bucket",
  region: "us-east-1",
  accessKeyId: "...",
  secretAccessKey: "...",
  path: "photos"
}
```

### Custom Upload

```typescript
{
  provider: "custom",
  uploadFunction: async (file) => {
    // Your upload logic
    const url = await uploadToYourAPI(file);
    return url;
  }
}
```

## Examples

### Example 1: Basic Report Photos

```json
{
  "name": "reportPhotos",
  "type": "multipleImagesCapture",
  "label": "Report Photos",
  "helperText": "Take photos of the site",
  "cloudConfig": {
    "provider": "firebase",
    "path": "reports/photos"
  },
  "maxImages": 10,
  "minImages": 2,
  "gridColumns": 3
}
```

### Example 2: Equipment Photos (2 columns)

```json
{
  "name": "equipmentPhotos",
  "type": "multipleImagesCapture",
  "label": "Equipment Photos",
  "helperText": "Upload equipment photos",
  "cloudConfig": {
    "provider": "firebase",
    "path": "equipment/photos"
  },
  "maxImages": 5,
  "minImages": 1,
  "gridColumns": 2,
  "showImageIndex": true
}
```

### Example 3: Unlimited Photos (4 columns)

```json
{
  "name": "sitePhotos",
  "type": "multipleImagesCapture",
  "label": "Site Photos",
  "cloudConfig": {
    "provider": "firebase",
    "path": "sites/photos"
  },
  "gridColumns": 4,
  "showImageIndex": false
}
```

### Example 4: With Validation

```typescript
{
  name: "photos",
  type: "multipleImagesCapture",
  label: "Photos",
  cloudConfig: {
    provider: "firebase",
    path: "photos"
  },
  maxImages: 5,
  minImages: 2,
  validation: [
    {
      type: "custom",
      validator: (value) => {
        if (!value || value.length < 2) {
          return "At least 2 photos required";
        }
        return true;
      }
    }
  ]
}
```

## Features In Detail

### 1. Grid Layout

Control số columns trong grid:

```json
{
  "gridColumns": 2  // 1, 2, 3, or 4
}
```

### 2. Image Reordering

Users có thể reorder images bằng cách click nút left/right trên mỗi ảnh khi hover.

### 3. Image Index Badge

Hiển thị số thứ tự ảnh (1, 2, 3...):

```json
{
  "showImageIndex": true
}
```

### 4. Min/Max Validation

```json
{
  "minImages": 2,  // Minimum 2 images required
  "maxImages": 10  // Maximum 10 images allowed
}
```

Component sẽ:
- Show error nếu < minImages
- Disable "Add" button khi đạt maxImages
- Display counter: "3 / 10 images"

### 5. Upload Progress

Track progress cho từng ảnh:

```typescript
<MultipleImagesCaptureInputUpload
  onUploadProgress={(index, progress) => {
    console.log(`Image ${index}: ${progress}%`);
  }}
  onUploadSuccess={(index, url) => {
    console.log(`Image ${index} uploaded:`, url);
  }}
  onUploadError={(index, error) => {
    console.error(`Image ${index} failed:`, error);
  }}
/>
```

### 6. Camera Mode

```json
{
  "defaultFacingMode": "environment"  // "user" for selfie, "environment" for back camera
}
```

## Comparison: Single vs Multiple Images

| Feature | `imageCapture` | `multipleImagesCapture` |
|---------|---------------|------------------------|
| **Value Type** | `string \| null` | `string[]` |
| **UI** | Single image preview | Grid of images |
| **Reordering** | ❌ | ✅ |
| **Min/Max** | ❌ | ✅ |
| **Index Badge** | ❌ | ✅ |
| **Grid Columns** | ❌ | ✅ (1-4) |
| **Use Case** | Profile photo, signature | Report photos, gallery |

## Best Practices

### 1. Set Reasonable Limits

```json
{
  "maxImages": 10,  // Don't allow too many
  "minImages": 1    // Require at least 1
}
```

### 2. Use Appropriate Grid Columns

```json
{
  "gridColumns": 2  // 2-3 for mobile, 3-4 for desktop
}
```

### 3. Organize by Path

```json
{
  "cloudConfig": {
    "provider": "firebase",
    "path": "tenants/{tenantId}/reports/{reportId}/photos"
  }
}
```

### 4. Show Helpful Text

```json
{
  "label": "Site Photos",
  "helperText": "Take 2-5 photos of the site from different angles"
}
```

### 5. Add Validation

```typescript
{
  validation: [
    {
      type: "custom",
      validator: (value) => {
        if (!value || value.length === 0) {
          return "At least 1 photo required";
        }
        return true;
      }
    }
  ]
}
```

## Complete Example

```json
{
  "title": "Field Service Report",
  "sections": [
    {
      "title": "Report Photos",
      "description": "Capture photos of the work site",
      "fields": [
        {
          "name": "beforePhotos",
          "type": "multipleImagesCapture",
          "label": "Before Photos",
          "helperText": "Take 2-5 photos before starting work",
          "span": 6,
          "cloudConfig": {
            "provider": "firebase",
            "path": "reports/before-photos"
          },
          "maxImages": 5,
          "minImages": 2,
          "gridColumns": 2,
          "showImageIndex": true,
          "validation": [
            {
              "type": "custom",
              "validator": "@@VALIDATOR:minPhotos",
              "message": "Please take at least 2 before photos"
            }
          ]
        },
        {
          "name": "afterPhotos",
          "type": "multipleImagesCapture",
          "label": "After Photos",
          "helperText": "Take 2-5 photos after completing work",
          "span": 6,
          "cloudConfig": {
            "provider": "firebase",
            "path": "reports/after-photos"
          },
          "maxImages": 5,
          "minImages": 2,
          "gridColumns": 2,
          "showImageIndex": true,
          "validation": [
            {
              "type": "custom",
              "validator": "@@VALIDATOR:minPhotos",
              "message": "Please take at least 2 after photos"
            }
          ]
        },
        {
          "name": "equipmentPhotos",
          "type": "multipleImagesCapture",
          "label": "Equipment Photos",
          "helperText": "Optional: Take photos of equipment used",
          "span": 12,
          "cloudConfig": {
            "provider": "firebase",
            "path": "reports/equipment-photos"
          },
          "maxImages": 10,
          "minImages": 0,
          "gridColumns": 3,
          "showImageIndex": false
        }
      ]
    }
  ]
}
```

## Troubleshooting

### Upload fails

**Solution**: Check Firebase Storage Rules, ensure user has write permission.

### Images not showing

**Solution**: Check Firebase Storage Rules, ensure images are publicly readable or user has read permission.

### Too slow

**Solution**: 
1. Reduce `maxImages`
2. Compress images before upload
3. Use Firebase CDN

### Memory issues

**Solution**: Limit `maxImages` to prevent too many images in memory.

## Summary

✅ **Easy to use** - Just add `type: "multipleImagesCapture"` to field config  
✅ **Firebase ready** - Works with existing Firebase service  
✅ **Flexible** - Support 1-4 grid columns, min/max, reordering  
✅ **User-friendly** - Progress bars, error handling, preview  
✅ **JSON-safe** - Can be stored in database  

Perfect cho: Reports, Galleries, Documentation, Field Service Photos! 🎉

