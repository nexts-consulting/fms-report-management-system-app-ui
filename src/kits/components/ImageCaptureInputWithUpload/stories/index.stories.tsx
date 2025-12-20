/**
 * Storybook examples for ImageCaptureInputWithUpload component
 * 
 * This file demonstrates various usage patterns of the component
 * with different cloud provider configurations.
 */

import { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";
import { ImageCaptureInputWithUpload, ImageCaptureInputWithUploadProps } from "..";
import { CloudConfig } from "../types";

export default {
  title: "Components/ImageCaptureInputWithUpload",
  component: ImageCaptureInputWithUpload,
  parameters: {
    docs: {
      description: {
        component:
          "Component tự động upload ảnh lên cloud storage và trả về URL. Hỗ trợ Firebase Storage, GCP, S3, và custom upload functions.",
      },
    },
  },
} as Meta;

// Template with state management
const Template: StoryFn<ImageCaptureInputWithUploadProps> = (args) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  return (
    <div className="max-w-md space-y-4">
      <ImageCaptureInputWithUpload
        {...args}
        value={imageUrl}
        onChange={(url) => {
          setImageUrl(url);
          console.log("Image URL changed:", url);
        }}
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
      {imageUrl && (
        <div className="p-4 bg-gray-10 rounded">
          <p className="text-sm font-medium mb-2">Current Image URL:</p>
          <p className="text-xs text-gray-70 break-all">{imageUrl}</p>
        </div>
      )}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="p-4 bg-blue-10 rounded">
          <p className="text-sm font-medium">Upload Progress: {Math.round(uploadProgress)}%</p>
        </div>
      )}
    </div>
  );
};

/**
 * Basic usage with Firebase Storage
 * 
 * Note: Requires Firebase to be configured in your project.
 * See @/services/firebase for Firebase setup.
 */
export const FirebaseBasic = Template.bind({});
FirebaseBasic.args = {
  label: "Upload Image (Firebase)",
  helperText: "Click to capture or upload image",
  cloudConfig: {
    provider: "firebase",
    path: "images/uploads",
  } as CloudConfig,
};

/**
 * With custom filename generator
 */
export const FirebaseWithCustomFilename = Template.bind({});
FirebaseWithCustomFilename.args = {
  label: "Upload with Custom Filename",
  helperText: "Files will be named with timestamp and user ID",
  cloudConfig: {
    provider: "firebase",
    path: "images/uploads",
    generateFileName: (file: File) => {
      const timestamp = Date.now();
      const extension = file.name.split(".").pop() || "jpg";
      return `user-123-${timestamp}.${extension}`;
    },
  } as CloudConfig,
};

/**
 * With file size and type restrictions
 */
export const FirebaseWithRestrictions = Template.bind({});
FirebaseWithRestrictions.args = {
  label: "Upload (Max 5MB, JPEG/PNG only)",
  helperText: "Only JPEG and PNG images up to 5MB are allowed",
  cloudConfig: {
    provider: "firebase",
    path: "images/uploads",
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ["image/jpeg", "image/png"],
  } as CloudConfig,
};

/**
 * Custom upload function example
 * 
 * This demonstrates how to use a custom backend API for uploads.
 * Replace the uploadFunction with your actual API endpoint.
 */
export const CustomUpload = Template.bind({});
CustomUpload.args = {
  label: "Upload via Custom API",
  helperText: "Uploads to your custom backend API",
  cloudConfig: {
    provider: "custom",
    path: "uploads",
    uploadFunction: async (file: File) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In real implementation, replace this with your API call:
      // const formData = new FormData();
      // formData.append("image", file);
      // const response = await fetch("/api/upload", {
      //   method: "POST",
      //   body: formData,
      // });
      // const data = await response.json();
      // return data.url;

      // For demo purposes, return a mock URL
      return `https://example.com/uploads/${file.name}`;
    },
  } as CloudConfig,
};

/**
 * With error state
 */
export const WithError = Template.bind({});
WithError.args = {
  label: "Upload Image",
  helperText: "This example shows error state",
  error: true,
  cloudConfig: {
    provider: "firebase",
    path: "images/uploads",
  } as CloudConfig,
};

/**
 * Disabled state
 */
export const Disabled = Template.bind({});
Disabled.args = {
  label: "Upload Image (Disabled)",
  helperText: "This component is disabled",
  disabled: true,
  cloudConfig: {
    provider: "firebase",
    path: "images/uploads",
  } as CloudConfig,
};

/**
 * With existing image URL
 */
export const WithExistingImage = Template.bind({});
WithExistingImage.args = {
  label: "Profile Image",
  helperText: "Image already uploaded",
  cloudConfig: {
    provider: "firebase",
    path: "images/uploads",
  } as CloudConfig,
};
// Set initial value
WithExistingImage.decorators = [
  (Story) => {
    const [imageUrl] = useState<string | null>(
      "https://via.placeholder.com/800x600?text=Existing+Image",
    );
    return <Story args={{ ...WithExistingImage.args, value: imageUrl }} />;
  },
];

/**
 * Complete example with all features
 */
export const CompleteExample = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="max-w-md space-y-4">
      <ImageCaptureInputWithUpload
        label="Complete Example"
        helperText="This example demonstrates all features including progress tracking and error handling"
        cloudConfig={{
          provider: "firebase",
          path: "images/uploads",
          generateFileName: (file) => {
            const timestamp = Date.now();
            const extension = file.name.split(".").pop() || "jpg";
            return `upload-${timestamp}.${extension}`;
          },
        }}
        value={imageUrl}
        onChange={(url) => {
          setImageUrl(url);
          setUploadStatus("success");
        }}
        onUploadProgress={(progress) => {
          setUploadProgress(progress);
          setUploadStatus("uploading");
        }}
        onUploadSuccess={(url) => {
          setUploadStatus("success");
          setError(null);
          console.log("Upload successful:", url);
        }}
        onUploadError={(err) => {
          setUploadStatus("error");
          setError(err.message);
          console.error("Upload failed:", err);
        }}
      />

      {/* Status Display */}
      <div className="p-4 bg-gray-10 rounded space-y-2">
        <div>
          <p className="text-sm font-medium">Upload Status:</p>
          <p className="text-xs text-gray-70 capitalize">{uploadStatus}</p>
        </div>
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div>
            <p className="text-sm font-medium">Progress:</p>
            <div className="w-full bg-gray-30 rounded-full h-2 mt-1">
              <div
                className="bg-primary-50 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-70 mt-1">{Math.round(uploadProgress)}%</p>
          </div>
        )}
        {imageUrl && (
          <div>
            <p className="text-sm font-medium">Image URL:</p>
            <p className="text-xs text-gray-70 break-all">{imageUrl}</p>
          </div>
        )}
        {error && (
          <div>
            <p className="text-sm font-medium text-red-50">Error:</p>
            <p className="text-xs text-red-60">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};
