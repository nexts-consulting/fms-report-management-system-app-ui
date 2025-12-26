/**
 * Multiple Images Capture Input Upload Component
 * 
 * Allows users to capture and upload multiple images to cloud storage.
 * Returns an array of URLs instead of a single URL.
 */

import { useControllableState } from "@/kits/hooks";
import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import { CameraCapture } from "@/kits/widgets/CameraCapture";
import React from "react";
import { IconButton } from "../icon-button";
import { Icons } from "../icons";
import { Modal } from "../modal";
import { LoadingOverlay } from "../loading-overlay";
import { NotificationBanner } from "../notification-banner";
import { CloudConfig, UploadProgressCallback } from "@/kits/components/image-capture-input-upload/types";
import { uploadFileToCloud } from "@/components/DynamicForm/services/upload.service";

const constants = {
  INSTANCE_NAME: "MultipleImagesCaptureInputUpload",
};

const styles = {
  label: StyleUtil.cn("block text-sm w-fit font-normal text-gray-70 mb-2 line-clamp-2"),
  addButton: StyleUtil.cn(
    "flex flex-col items-center justify-center w-full h-32 px-4 transition-colors duration-200",
    "border border-2 border-dashed cursor-pointer",
    "bg-gray-10 border-gray-30",
    "active:border-primary-50 focus:border-primary-50",
  ),
  buttonContent: StyleUtil.cn(
    "flex flex-col items-center justify-center text-center",
    "text-sm text-gray-70",
  ),
  helperText: StyleUtil.cn("text-sm mt-1 text-gray-70 line-clamp-3"),
  imagesGrid: StyleUtil.cn(
    "grid gap-4 mb-4",
  ),
  imageCard: StyleUtil.cn(
    "relative group",
    "border border-gray-30 bg-white overflow-hidden",
  ),
  uploadProgress: StyleUtil.cn(
    "absolute inset-0 flex items-center justify-center",
    "bg-black/50 text-white text-sm font-medium z-10",
  ),
  imageIndex: StyleUtil.cn(
    "absolute left-2 top-2 px-2 py-1",
    "bg-black/60 text-white text-xs font-medium rounded",
  ),
};

export interface MultipleImagesCaptureInputUploadProps {
  /**
   * Label for the input field
   */
  label?: string | React.ReactNode;
  /**
   * Helper text displayed below the add button
   */
  helperText?: string | React.ReactNode;
  /**
   * Current image URLs array (controlled)
   */
  value?: string[];
  /**
   * Callback when image URLs change
   */
  onChange?: (urls: string[]) => void;
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
   * Maximum number of images allowed
   * @default Infinity
   */
  maxImages?: number;
  /**
   * Minimum number of images required
   * @default 0
   */
  minImages?: number;
  /**
   * Number of columns in grid
   * @default 2
   */
  gridColumns?: 1 | 2 | 3 | 4;
  /**
   * Callback for upload progress per image (0-100)
   */
  onUploadProgress?: (imageIndex: number, progress: number) => void;
  /**
   * Callback when an image upload fails
   */
  onUploadError?: (imageIndex: number, error: Error) => void;
  /**
   * Callback when an image upload succeeds
   */
  onUploadSuccess?: (imageIndex: number, url: string) => void;
  /**
   * Disable the component
   */
  disabled?: boolean;
  /**
   * Show image index badge
   * @default true
   */
  showImageIndex?: boolean;
}

export const MultipleImagesCaptureInputUpload = React.memo(
  React.forwardRef<HTMLDivElement, MultipleImagesCaptureInputUploadProps>((props, ref) => {
    const {
      label,
      helperText,
      value: valueProp,
      onChange: onChangeProp,
      cloudConfig,
      defaultFacingMode = "user",
      error = false,
      maxImages = Infinity,
      minImages = 0,
      gridColumns = 2,
      onUploadProgress,
      onUploadError,
      onUploadSuccess,
      disabled = false,
      showImageIndex = true,
    } = props;

    const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

    const ids = React.useRef({
      container: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
      addButton: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current, "add-button"),
    });

    const [showCamera, setShowCamera] = React.useState(false);
    const [maximizedIndex, setMaximizedIndex] = React.useState<number | null>(null);
    const [uploadingImages, setUploadingImages] = React.useState<Set<number>>(new Set());
    const [uploadProgress, setUploadProgress] = React.useState<Map<number, number>>(new Map());
    const [uploadErrors, setUploadErrors] = React.useState<Map<number, string>>(new Map());

    const [value, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: [],
      onChange: onChangeProp,
    });

    const images = value || [];
    const canAddMore = images.length < maxImages;
    const hasMinImages = images.length >= minImages;

    const getGridClass = () => {
      switch (gridColumns) {
        case 1:
          return "grid-cols-1";
        case 2:
          return "grid-cols-2";
        case 3:
          return "grid-cols-3";
        case 4:
          return "grid-cols-4";
        default:
          return "grid-cols-2";
      }
    };

    const handleConfirmCapture = async (file: File) => {
      setShowCamera(false);

      // Calculate next image index
      const imageIndex = images.length;

      // Add uploading state
      setUploadingImages((prev) => new Set(prev).add(imageIndex));
      setUploadProgress((prev) => new Map(prev).set(imageIndex, 0));

      try {
        // Create temporary preview
        const tempPreview = URL.createObjectURL(file);

        // Add temporary image to array
        const newImages = [...images, tempPreview];
        setValue(newImages);

        // Upload to cloud
        const result = await uploadFileToCloud(
          file,
          cloudConfig,
          (progress) => {
            setUploadProgress((prev) => new Map(prev).set(imageIndex, progress));
            onUploadProgress?.(imageIndex, progress);
          },
        );

        // Clean up temporary preview
        URL.revokeObjectURL(tempPreview);

        // Replace temporary preview with actual URL
        const finalImages = [...images, result.url];
        setValue(finalImages);
        onUploadSuccess?.(imageIndex, result.url);

        // Clear error if exists
        setUploadErrors((prev) => {
          const newMap = new Map(prev);
          newMap.delete(imageIndex);
          return newMap;
        });
      } catch (error) {
        // Remove failed image from array
        setValue(images);

        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        setUploadErrors((prev) => new Map(prev).set(imageIndex, errorMessage));
        onUploadError?.(imageIndex, error instanceof Error ? error : new Error(errorMessage));
      } finally {
        // Remove uploading state
        setUploadingImages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(imageIndex);
          return newSet;
        });
        setUploadProgress((prev) => {
          const newMap = new Map(prev);
          newMap.delete(imageIndex);
          return newMap;
        });
      }
    };

    const handleRemoveImage = (index: number) => {
      const newImages = images.filter((_, i) => i !== index);
      setValue(newImages);

      // Clear any errors for this image
      setUploadErrors((prev) => {
        const newMap = new Map(prev);
        newMap.delete(index);
        return newMap;
      });
    };

    const handleMoveImage = (fromIndex: number, direction: "left" | "right") => {
      const toIndex = direction === "left" ? fromIndex - 1 : fromIndex + 1;

      if (toIndex < 0 || toIndex >= images.length) return;

      const newImages = [...images];
      [newImages[fromIndex], newImages[toIndex]] = [newImages[toIndex], newImages[fromIndex]];
      setValue(newImages);
    };

    const isUploading = uploadingImages.size > 0;

    return (
      <>
        <div id={ids.current.container} ref={ref} className="relative mb-2">
          {/* Label */}
          {label && (
            <label className={styles.label}>
              {label}
              {minImages > 0 && (
                <span className="text-xs ml-2">
                  (Min: {minImages}, Max: {maxImages === Infinity ? "∞" : maxImages})
                </span>
              )}
            </label>
          )}

          {/* Upload Errors */}
          {uploadErrors.size > 0 && (
            <div className="mb-2 space-y-2">
              {Array.from(uploadErrors.entries()).map(([index, errorMessage]) => (
                <NotificationBanner
                  key={`error-${index}`}
                  type="error"
                  title={`Image ${index + 1} Upload Failed`}
                  description={errorMessage}
                  closeable
                  onDismiss={() => {
                    setUploadErrors((prev) => {
                      const newMap = new Map(prev);
                      newMap.delete(index);
                      return newMap;
                    });
                  }}
                />
              ))}
            </div>
          )}

          {/* Images Grid */}
          {images.length > 0 && (
            <div className={StyleUtil.cn(styles.imagesGrid, getGridClass())}>
              {images.map((imageUrl, index) => {
                const isCurrentlyUploading = uploadingImages.has(index);
                const progress = uploadProgress.get(index) || 0;

                return (
                  <div key={`image-${index}`} className={styles.imageCard}>
                    <img
                      src={imageUrl}
                      alt={`Image ${index + 1}`}
                      className="aspect-[3/2] w-full bg-gray-10 object-cover"
                    />

                    {/* Image Index Badge */}
                    {showImageIndex && !isCurrentlyUploading && (
                      <div className={styles.imageIndex}>
                        {index + 1}
                      </div>
                    )}

                    {/* Upload Progress Overlay */}
                    {isCurrentlyUploading && (
                      <div className={styles.uploadProgress}>
                        <div className="text-center">
                          <p>Uploading...</p>
                          <p className="text-xs mt-1">{Math.round(progress)}%</p>
                        </div>
                      </div>
                    )}

                    {/* Loading Overlay */}
                    {isCurrentlyUploading && <LoadingOverlay />}

                    {/* Action Buttons */}
                    {!isCurrentlyUploading && (
                      <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        {/* Maximize */}
                        <IconButton
                          size="medium"
                          variant="white"
                          icon={Icons.Maximize}
                          onClick={() => setMaximizedIndex(index)}
                          disabled={disabled}
                        />

                        {/* Move Left */}
                        {index > 0 && (
                          <IconButton
                            size="medium"
                            variant="white"
                            icon={Icons.ChevronLeft}
                            onClick={() => handleMoveImage(index, "left")}
                            disabled={disabled}
                          />
                        )}

                        {/* Move Right */}
                        {index < images.length - 1 && (
                          <IconButton
                            size="medium"
                            variant="white"
                            icon={Icons.ChevronRight}
                            onClick={() => handleMoveImage(index, "right")}
                            disabled={disabled}
                          />
                        )}

                        {/* Delete */}
                        <IconButton
                          size="medium"
                          variant="danger"
                          icon={Icons.CloseLarge}
                          onClick={() => handleRemoveImage(index)}
                          disabled={disabled}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Image Button */}
          {canAddMore && (
            <button
              type="button"
              id={ids.current.addButton}
              className={StyleUtil.cn(styles.addButton, {
                "border-red-50 bg-red-50/5": error && !hasMinImages,
                "cursor-not-allowed opacity-50": disabled || isUploading,
              })}
              onClick={() => !disabled && !isUploading && setShowCamera(true)}
              disabled={disabled || isUploading}
            >
              <div className={styles.buttonContent}>
                <Icons.Add className="w-8 h-8 mb-2 text-gray-70" />
                <p>
                  {images.length === 0
                    ? helperText || "Add Image"
                    : `Add Image (${images.length}/${maxImages === Infinity ? "∞" : maxImages})`}
                </p>
              </div>
            </button>
          )}

          {/* Helper Text */}
          {helperText && images.length === 0 && (
            <p className={styles.helperText}>{helperText}</p>
          )}

          {/* Image Count Info */}
          {images.length > 0 && (
            <p className={styles.helperText}>
              {images.length} image{images.length !== 1 ? "s" : ""} uploaded
              {!hasMinImages && minImages > 0 && (
                <span className="text-red-60 ml-2">
                  (Minimum {minImages} required)
                </span>
              )}
            </p>
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
          isOpen={maximizedIndex !== null}
          onClose={() => setMaximizedIndex(null)}
          title={`${label} - Image ${(maximizedIndex ?? 0) + 1}`}
        >
          {maximizedIndex !== null && images[maximizedIndex] && (
            <img
              src={images[maximizedIndex]}
              alt={`Preview ${maximizedIndex + 1}`}
              className="h-[65vh] w-full bg-gray-10 object-contain object-center"
            />
          )}
        </Modal>
      </>
    );
  }),
);

MultipleImagesCaptureInputUpload.displayName = constants.INSTANCE_NAME;

// Export types
export type { CloudConfig, UploadProgressCallback } from "@/kits/components/image-capture-input-upload/types";

