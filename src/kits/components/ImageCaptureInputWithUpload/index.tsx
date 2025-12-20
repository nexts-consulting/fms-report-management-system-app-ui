/**
 * ImageCaptureInputWithUpload Component
 * 
 * A refactored version of ImageCaptureInput that automatically uploads captured images
 * to cloud storage (Firebase/GCP/S3) and returns the URL instead of File object.
 * 
 * @example
 * // Basic usage with Firebase
 * <ImageCaptureInputWithUpload
 *   label="Upload Image"
 *   cloudConfig={{
 *     provider: "firebase",
 *     path: "images/uploads"
 *   }}
 *   value={imageUrl}
 *   onChange={(url) => setImageUrl(url)}
 * />
 * 
 * @example
 * // With custom upload function
 * <ImageCaptureInputWithUpload
 *   label="Upload Image"
 *   cloudConfig={{
 *     provider: "custom",
 *     uploadFunction: async (file) => {
 *       const formData = new FormData();
 *       formData.append("image", file);
 *       const response = await fetch("/api/upload", {
 *         method: "POST",
 *         body: formData
 *       });
 *       const data = await response.json();
 *       return data.url;
 *     }
 *   }}
 *   value={imageUrl}
 *   onChange={(url) => setImageUrl(url)}
 * />
 * 
 * @example
 * // With upload progress tracking
 * <ImageCaptureInputWithUpload
 *   label="Upload Image"
 *   cloudConfig={{
 *     provider: "firebase",
 *     path: "images/uploads",
 *     generateFileName: (file) => `user-${userId}-${Date.now()}.jpg`
 *   }}
 *   value={imageUrl}
 *   onChange={(url) => setImageUrl(url)}
 *   onUploadProgress={(progress) => console.log(`Upload: ${progress}%`)}
 *   onUploadError={(error) => console.error("Upload failed:", error)}
 * />
 */

import { useControllableState } from "@/kits/hooks";
import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import { CameraCapture } from "@/kits/widgets/CameraCapture";
import React from "react";
import { IconButton } from "../IconButton";
import { Icons } from "../Icons";
import { Modal } from "../Modal";
import { LoadingOverlay } from "../LoadingOverlay";
import { NotificationBanner } from "../NotificationBanner";
import { CloudConfig, UploadProgressCallback } from "@/kits/components/ImageCaptureInputWithUpload/types";
import { uploadFileToCloud } from "@/kits/components/ImageCaptureInputWithUpload/upload.service";

const constants = {
  INSTANCE_NAME: "ImageCaptureInputWithUpload",
};

const styles = {
  label: StyleUtil.cn("block text-sm w-fit font-normal text-gray-70 mb-2 line-clamp-2"),
  trigger: StyleUtil.cn(
    "flex flex-col items-center justify-center w-full h-32 px-4 transition-colors duration-200",
    "border border-2 border-dashed cursor-pointer",
    "bg-gray-10 border-gray-30",
    "active:border-primary-50 focus:border-primary-50",
  ),
  triggerContent: StyleUtil.cn(
    "flex flex-col items-center justify-center text-center",
    "text-sm text-gray-70",
  ),
  helperText: StyleUtil.cn("text-sm mt-1 text-gray-70 line-clamp-3"),
  uploadProgress: StyleUtil.cn(
    "absolute inset-0 flex items-center justify-center",
    "bg-black/50 text-white text-sm font-medium",
  ),
};

export interface ImageCaptureInputWithUploadProps {
  /**
   * Label for the input field
   */
  label?: string | React.ReactNode;
  /**
   * Helper text displayed below the trigger button
   */
  helperText?: string | React.ReactNode;
  /**
   * Current image URL value (controlled)
   */
  value?: string | null;
  /**
   * Callback when image URL changes (after successful upload)
   */
  onChange?: (url: string | null) => void;
  /**
   * Cloud storage configuration
   * @required
   */
  cloudConfig: CloudConfig;
  /**
   * Default camera facing mode
   * @default "user"
   */
  defaultFacingMode?: "user" | "environment";
  /**
   * Show error state
   */
  error?: boolean;
  /**
   * Callback for upload progress (0-100)
   */
  onUploadProgress?: UploadProgressCallback;
  /**
   * Callback when upload fails
   */
  onUploadError?: (error: Error) => void;
  /**
   * Callback when upload succeeds
   */
  onUploadSuccess?: (url: string) => void;
  /**
   * Disable the component
   */
  disabled?: boolean;
}

export const ImageCaptureInputWithUpload = React.memo(
  React.forwardRef<HTMLDivElement, ImageCaptureInputWithUploadProps>((props, ref) => {
    const {
      label,
      helperText,
      value: valueProp,
      onChange: onChangeProp,
      cloudConfig,
      defaultFacingMode,
      error,
      onUploadProgress,
      onUploadError,
      onUploadSuccess,
      disabled,
    } = props;

    const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

    const ids = React.useRef({
      container: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
      trigger: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current, "trigger"),
      helperText: StringUtil.createElementId(
        constants.INSTANCE_NAME,
        instanceId.current,
        "helper-text",
      ),
    });

    const [showCamera, setShowCamera] = React.useState(false);
    const [previewImage, setPreviewImage] = React.useState<string | null>(null);
    const [isMaximized, setIsMaximized] = React.useState(false);
    const [isUploading, setIsUploading] = React.useState(false);
    const [uploadProgress, setUploadProgress] = React.useState(0);
    const [uploadError, setUploadError] = React.useState<string | null>(null);

    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onChangeProp,
    });

    // Update preview when value changes
    React.useEffect(() => {
      if (value) {
        setPreviewImage(value);
      } else {
        setPreviewImage(null);
      }
    }, [value]);

    const handleConfirmCapture = async (file: File) => {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);
      setShowCamera(false);

      try {
        // Create temporary preview while uploading
        const tempPreview = URL.createObjectURL(file);
        setPreviewImage(tempPreview);

        // Upload to cloud
        const result = await uploadFileToCloud(
          file,
          cloudConfig,
          (progress) => {
            setUploadProgress(progress);
            onUploadProgress?.(progress);
          },
        );

        // Clean up temporary preview
        URL.revokeObjectURL(tempPreview);

        // Set the uploaded URL
        setValue(result.url);
        setPreviewImage(result.url);
        onUploadSuccess?.(result.url);
      } catch (error) {
        // Clean up temporary preview on error
        if (previewImage && previewImage.startsWith("blob:")) {
          URL.revokeObjectURL(previewImage);
        }
        setPreviewImage(null);

        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        setUploadError(errorMessage);
        onUploadError?.(error instanceof Error ? error : new Error(errorMessage));
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    };

    const handleRemoveImage = () => {
      setValue(null);
      setPreviewImage(null);
      setUploadError(null);
    };

    return (
      <>
        <div id={ids.current.container} ref={ref} className="relative mb-2">
          {/* Label */}
          <label htmlFor={ids.current.trigger} className={styles.label}>
            {label}
          </label>

          {/* Upload Error Banner */}
          {uploadError && (
            <div className="mb-2">
              <NotificationBanner
                type="error"
                title="Upload Failed"
                description={uploadError}
                closeable
                onDismiss={() => setUploadError(null)}
              />
            </div>
          )}

          {/* Trigger */}
          {!value && !isUploading && (
            <button
              type="button"
              id={ids.current.trigger}
              className={StyleUtil.cn(styles.trigger, {
                "border-red-50 bg-red-50/5": error,
                "cursor-not-allowed opacity-50": disabled,
              })}
              onClick={() => !disabled && setShowCamera(true)}
              disabled={disabled}
            >
              <div className={styles.triggerContent}>
                <p>{helperText || "Open camera"}</p>
              </div>
            </button>
          )}

          {/* Preview with Upload Progress */}
          {(value || isUploading) && previewImage && (
            <div className="relative">
              <img
                src={previewImage}
                alt="Preview"
                className="aspect-[3/2] w-full bg-gray-10 object-contain object-center"
              />

              {/* Upload Progress Overlay */}
              {isUploading && (
                <div className={styles.uploadProgress}>
                  <div className="text-center">
                    <p>Uploading...</p>
                    <p className="text-xs mt-1">{Math.round(uploadProgress)}%</p>
                  </div>
                </div>
              )}

              {/* Loading Overlay */}
              {isUploading && <LoadingOverlay />}

              {/* Action Buttons */}
              {!isUploading && (
                <>
                  <div className="absolute left-4 top-4">
                    <IconButton
                      size="large"
                      variant="white"
                      icon={Icons.Maximize}
                      onClick={() => setIsMaximized(true)}
                      disabled={disabled}
                    />
                  </div>

                  <div className="absolute right-4 top-4">
                    <IconButton
                      size="large"
                      variant="danger"
                      icon={Icons.CloseLarge}
                      onClick={handleRemoveImage}
                      disabled={disabled}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Camera Capture Modal */}
        {showCamera && (
          <CameraCapture
            enableUpload={false}
            enableCancel={true}
            defaultFacingMode={defaultFacingMode}
            onConfirm={handleConfirmCapture}
            onCancel={() => setShowCamera(false)}
          />
        )}

        {/* Maximized Preview Modal */}
        <Modal
          isOpen={!!previewImage && isMaximized}
          onClose={() => setIsMaximized(false)}
          title={label}
        >
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="h-[65vh] w-full bg-gray-10 object-contain object-center"
            />
          )}
        </Modal>
      </>
    );
  }),
);

ImageCaptureInputWithUpload.displayName = constants.INSTANCE_NAME;

// Export types and utilities
export type { CloudConfig, CloudProvider, UploadResult, UploadProgressCallback } from "@/kits/components/ImageCaptureInputWithUpload/types";
export type {
  FirebaseConfig,
  GCPConfig,
  S3Config,
  CustomConfig,
} from "@/kits/components/ImageCaptureInputWithUpload/types";
export { uploadFileToCloud } from "@/kits/components/ImageCaptureInputWithUpload/upload.service";
