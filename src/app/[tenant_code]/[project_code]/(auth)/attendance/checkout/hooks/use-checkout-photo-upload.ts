import React from "react";
import { useNotification } from "@/kits/components/notification";
import { firebaseService } from "@/services/firebase";
import { useTenantProjectPath } from "@/hooks/use-tenant-project-path";
import type { KeycloakUser } from "@/types/model";
import { uploadFileToCloud } from "@/components/DynamicForm/services/upload.service";

interface UseCheckoutPhotoUploadOptions {
  user: KeycloakUser;
  attendanceId: number;
  onUploadSuccess?: (photoUrl: string) => void;
  onUploadError?: (error: Error) => void;
}

/**
 * Hook to manage photo upload for check-out process
 */
export const useCheckoutPhotoUpload = ({
  user,
  attendanceId,
  onUploadSuccess,
  onUploadError,
}: UseCheckoutPhotoUploadOptions) => {
  const [isUploadingPhoto, setIsUploadingPhoto] = React.useState(false);
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null);
  const [userImageFile, setUserImageFile] = React.useState<File | null>(null);
  
  const notification = useNotification();
  const uploadNotificationIdRef = React.useRef<string | null>(null);
  const { buildPath } = useTenantProjectPath();

  const uploadPhoto = React.useCallback(
    async (file: File) => {
      setUserImageFile(file);
      setIsUploadingPhoto(true);

      // Show upload notification after a small delay to ensure camera is closed
      setTimeout(() => {
        if (!uploadNotificationIdRef.current) {
          uploadNotificationIdRef.current = notification.pending({
            title: "Đang upload ảnh",
            description: "Vui lòng đợi trong giây lát...",
            options: {
              immortal: true,
            },
          });
        }
      }, 300);

      try {
        // Upload photo to Firebase Storage with progress tracking
        const uploadResult = await uploadFileToCloud(
          file,
          {
            provider: "firebase",
            path: `${buildPath("/uploads")}/attendance/checkout/${user.id}`,
            storage: firebaseService.storage,
            generateFileName: (file) => {
              const timestamp = Date.now();
              const extension = file.name.split(".").pop() || "jpg";
              return `checkout_${attendanceId}_${timestamp}.${extension}`;
            },
          },
          (progress) => {
            // Update notification with progress
            if (uploadNotificationIdRef.current) {
              notification.update(uploadNotificationIdRef.current, {
                title: "Đang upload ảnh",
                description: `Đã upload ${Math.round(progress)}%...`,
                options: {
                  immortal: true,
                },
              });
            }
          },
        );

        // Update notification to success
        if (uploadNotificationIdRef.current) {
          notification.update(uploadNotificationIdRef.current, {
            title: "Upload thành công",
            description: "Ảnh đã được upload thành công",
            options: {
              duration: 2000,
            },
          });
          uploadNotificationIdRef.current = null;
        }

        // Set photo URL and call success callback
        setPhotoUrl(uploadResult.url);
        setIsUploadingPhoto(false);
        onUploadSuccess?.(uploadResult.url);
      } catch (error) {
        console.error("Error uploading photo:", error);
        setIsUploadingPhoto(false);

        // Update notification to error
        if (uploadNotificationIdRef.current) {
          notification.update(uploadNotificationIdRef.current, {
            title: "Lỗi upload ảnh",
            description: "Không thể upload ảnh lên server. Vui lòng thử lại.",
            options: {
              duration: 5000,
            },
          });
          uploadNotificationIdRef.current = null;
        } else {
          // Fallback: show error notification if ref was cleared
          notification.error({
            title: "Lỗi upload ảnh",
            description: "Không thể upload ảnh lên server. Vui lòng thử lại.",
            options: {
              duration: 5000,
            },
          });
        }

        onUploadError?.(error as Error);
      }
    },
    [user.id, attendanceId, buildPath, notification, onUploadSuccess, onUploadError],
  );

  // Cleanup upload notification on unmount
  React.useEffect(() => {
    return () => {
      if (uploadNotificationIdRef.current) {
        notification.remove(uploadNotificationIdRef.current);
        uploadNotificationIdRef.current = null;
      }
    };
  }, [notification]);

  return {
    isUploadingPhoto,
    photoUrl,
    userImageFile,
    uploadPhoto,
  };
};
