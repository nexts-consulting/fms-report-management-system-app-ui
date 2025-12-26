# Changelog - Multiple Images Capture Feature

## 📅 Date: Dec 25, 2025

## ✨ New Feature: Multiple Images Upload

Added `MultipleImagesCaptureInputUpload` component và tích hợp vào DynamicForm!

## 🎯 What's New

### 1. New Component: `MultipleImagesCaptureInputUpload`

**Location**: `src/kits/components/multiple-images-capture-input-upload/index.tsx`

**Features**:
- ✅ Upload nhiều ảnh cùng lúc
- ✅ Grid layout với 1-4 columns
- ✅ Reorder images (move left/right)
- ✅ Progress tracking per image
- ✅ Image index badges
- ✅ Min/Max validation
- ✅ Maximized preview
- ✅ Error handling per image
- ✅ Firebase Storage integration

### 2. New Field Type in DynamicForm

**Type**: `multipleImagesCapture`

**Usage in JSON**:
```json
{
  "name": "photos",
  "type": "multipleImagesCapture",
  "label": "Photos",
  "cloudConfig": {
    "provider": "firebase",
    "path": "photos"
  },
  "maxImages": 5,
  "minImages": 1,
  "gridColumns": 2
}
```

## 📝 Files Changed

### Created Files

1. **`src/kits/components/multiple-images-capture-input-upload/index.tsx`**
   - New component với 450+ lines
   - Full feature multiple images upload

2. **`docs/MULTIPLE_IMAGES_CAPTURE.md`**
   - Complete documentation
   - Examples và best practices
   - Troubleshooting guide

### Modified Files

1. **`src/components/DynamicForm/types.ts`**
   - Added `"multipleImagesCapture"` to `FieldType`
   - Added `MultipleImagesCaptureFieldConfig` interface
   - Added to `FieldConfig` union type

2. **`src/components/DynamicForm/FieldRenderer.tsx`**
   - Import `MultipleImagesCaptureInputUpload`
   - Added `case "multipleImagesCapture"` handler

3. **`src/components/DynamicForm/exampleJsonConfig.json`**
   - Updated "Image Upload" section
   - Added example với single + multiple images

## 🎨 Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string[]` | `[]` | Array of image URLs |
| `onChange` | `(urls: string[]) => void` | - | URLs change callback |
| `cloudConfig` | `CloudConfig` | **required** | Cloud storage config |
| `maxImages` | `number` | `Infinity` | Max images |
| `minImages` | `number` | `0` | Min images |
| `gridColumns` | `1\|2\|3\|4` | `2` | Grid columns |
| `showImageIndex` | `boolean` | `true` | Show index badge |

## 📊 Comparison: Single vs Multiple

| Feature | `imageCapture` | `multipleImagesCapture` |
|---------|---------------|------------------------|
| **Value** | `string \| null` | `string[]` |
| **UI** | Single preview | Grid of images |
| **Reorder** | ❌ | ✅ |
| **Min/Max** | ❌ | ✅ |
| **Index** | ❌ | ✅ |
| **Grid** | ❌ | ✅ (1-4 columns) |

## 💡 Use Cases

### Single Image (`imageCapture`)
- Profile photo
- Signature
- ID card
- Logo

### Multiple Images (`multipleImagesCapture`)
- Report photos (before/after)
- Site documentation
- Equipment gallery
- Product photos
- Field service photos

## 🚀 How to Use

### Method 1: JSON Config (Database-Safe)

```json
{
  "name": "reportPhotos",
  "type": "multipleImagesCapture",
  "label": "Report Photos",
  "helperText": "Upload 2-10 photos",
  "cloudConfig": {
    "provider": "firebase",
    "path": "reports/photos"
  },
  "maxImages": 10,
  "minImages": 2,
  "gridColumns": 3
}
```

### Method 2: Code-Based Config

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
  minImages: 1,
  gridColumns: 2,
}
```

### Method 3: Standalone Component

```typescript
import { MultipleImagesCaptureInputUpload } from "@/kits/components/multiple-images-capture-input-upload";

<MultipleImagesCaptureInputUpload
  label="Photos"
  value={photos}
  onChange={setPhotos}
  cloudConfig={{
    provider: "firebase",
    path: "photos"
  }}
  maxImages={5}
/>
```

## 🎯 Example: Field Service Report

```json
{
  "sections": [
    {
      "title": "Documentation",
      "fields": [
        {
          "name": "beforePhotos",
          "type": "multipleImagesCapture",
          "label": "Before Photos",
          "helperText": "2-5 photos before work",
          "span": 6,
          "cloudConfig": {
            "provider": "firebase",
            "path": "reports/before"
          },
          "maxImages": 5,
          "minImages": 2,
          "gridColumns": 2
        },
        {
          "name": "afterPhotos",
          "type": "multipleImagesCapture",
          "label": "After Photos",
          "helperText": "2-5 photos after work",
          "span": 6,
          "cloudConfig": {
            "provider": "firebase",
            "path": "reports/after"
          },
          "maxImages": 5,
          "minImages": 2,
          "gridColumns": 2
        }
      ]
    }
  ]
}
```

## 🔥 Key Features

### 1. Grid Layout
```json
{ "gridColumns": 2 }  // 1, 2, 3, or 4
```

### 2. Image Reordering
Users can click left/right arrows to reorder images.

### 3. Min/Max Validation
```json
{
  "minImages": 2,  // Required
  "maxImages": 10  // Limit
}
```

### 4. Upload Progress
Shows progress bar per image during upload.

### 5. Image Index
Shows "1", "2", "3"... on each image.

### 6. Firebase Integration
Automatically uses Firebase service from `src/services/firebase`.

## ⚠️ Breaking Changes

**None!** Hoàn toàn backward compatible.

## 📚 Documentation

- [MULTIPLE_IMAGES_CAPTURE.md](./MULTIPLE_IMAGES_CAPTURE.md) - Full guide
- [FIREBASE_CUSTOM_PATH.md](./FIREBASE_CUSTOM_PATH.md) - Firebase config
- [exampleJsonConfig.json](../src/components/DynamicForm/exampleJsonConfig.json) - Example

## ✅ Testing

Test trong demo page:
1. Navigate to report page
2. Scroll to "Image Upload" section
3. See both single and multiple image fields
4. Test upload, reorder, delete, maximize

## 🎉 Summary

**New field type**: `multipleImagesCapture`

**Key benefits**:
- ✅ Upload nhiều ảnh dễ dàng
- ✅ Grid layout đẹp
- ✅ Reorder images
- ✅ Min/Max validation
- ✅ Firebase ready
- ✅ JSON-safe (database-friendly)
- ✅ Full documentation

**Perfect for**: Reports, Documentation, Field Service, Galleries! 🚀

