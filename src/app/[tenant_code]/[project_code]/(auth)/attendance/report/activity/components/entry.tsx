"use client";

import { ScreenHeader } from "@/components/ScreenHeader";
import { useNotification } from "@/kits/components/Notification";
import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "@/kits/components/Button";
import { NotificationBanner } from "@/kits/components/NotificationBanner";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";
import { useGlobalContext } from "@/contexts/global.context";
import { 
  useMutationUploadActivityImages, 
  useMutationDeleteActivityImage,
  httpRequestGetActivityReport
} from "@/services/api/reports/activity-report";
import { useQueryClient } from "react-query";
import { MultipleImagesCaptureInput } from "@/kits/components/MultipleImagesCaptureInput";
import { IconButton } from "@/kits/components/IconButton";
import { Icons } from "@/kits/components/Icons";
import { Modal } from "@/kits/components/Modal";
import { AppConfig } from "@/config";

interface ActivityImage {
  fileId: string;
  fileName: string;
  url: string;
}

export const Entry = () => {
  const globalStore = useGlobalContext();
  const currentAttendance = globalStore.use.currentAttendance();

  const router = useRouter();
  const notification = useNotification();
  const queryClient = useQueryClient();

  const [newImages, setNewImages] = React.useState<File[]>([]);
  const [existingImages, setExistingImages] = React.useState<ActivityImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState<number | null>(null);
  const [isMaximized, setIsMaximized] = React.useState(false);
  const [componentKey, setComponentKey] = React.useState(0);

  const submitStatusNotifyIdRef = React.useRef<string | null>(null);

  // Load existing images from currentAttendance
  React.useEffect(() => {
    if (currentAttendance?.activityReport?.data) {
      setExistingImages(currentAttendance.activityReport.data);
    }
  }, [currentAttendance?.activityReport]);

  const uploadImagesMutation = useMutationUploadActivityImages({
    config: {
      onSuccess: (response) => {
        // Add new images to existing images
        setExistingImages(prev => [...prev, ...response.data]);
        setNewImages([]);
        
        // Reset the MultipleImagesCaptureInput component by changing its key
        setComponentKey(prev => prev + 1);
        
        // Invalidate queries to refresh attendance data
        queryClient.invalidateQueries({
          queryKey: ["query/attendance/current-shift"],
          exact: false,
        });

        if (submitStatusNotifyIdRef.current) {
          notification.update(submitStatusNotifyIdRef.current, {
            type: "success",
            title: "Upload thành công",
            description: `Đã upload ${response.data.length} hình ảnh thành công`,
            options: {
              duration: 5000,
            },
          });
        }
      },
      onError: () => {
        if (submitStatusNotifyIdRef.current) {
          notification.update(submitStatusNotifyIdRef.current, {
            type: "error",
            title: "Lỗi hệ thống",
            description: "Không thể upload hình ảnh. Vui lòng thử lại sau.",
            options: {
              duration: 10000,
            },
          });
        }
      },
    },
  });

  const deleteImageMutation = useMutationDeleteActivityImage({
    config: {
      onSuccess: (_, variables) => {
        // Remove image from existing images
        setExistingImages(prev => prev.filter(img => img.fileId !== variables.fileId));
        
        // Invalidate queries to refresh attendance data
        queryClient.invalidateQueries({
          queryKey: ["query/attendance/current-shift"],
          exact: false,
        });

        notification.success({
          title: "Xóa thành công",
          description: "Đã xóa hình ảnh thành công",
          options: {
            duration: 3000,
          },
        });
      },
      onError: () => {
        notification.error({
          title: "Lỗi hệ thống",
          description: "Không thể xóa hình ảnh. Vui lòng thử lại sau.",
          options: {
            duration: 5000,
          },
        });
      },
    },
  });

  const handleUploadImages = () => {
    if (!currentAttendance?.id || newImages.length === 0) return;

    notification.clear();
    submitStatusNotifyIdRef.current = notification.pending({
      title: "Đang upload hình ảnh",
      description: `Đang upload ${newImages.length} hình ảnh, vui lòng đợi...`,
      options: {
        immortal: true,
      },
    });

    uploadImagesMutation.mutate({
      attendanceId: currentAttendance.id,
      images: newImages,
    });
  };

  const handleDeleteImage = (fileId: string) => {
    if (!currentAttendance?.id) return;

    deleteImageMutation.mutate({
      attendanceId: currentAttendance.id,
      fileId,
    });
  };

  const handleMaximizeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setSelectedImageIndex(index);
    } else {
      setSelectedImageIndex(existingImages.length + index);
    }
    setIsMaximized(true);
  };

  const allImages = React.useMemo(() => {
    const existing = existingImages.map(img => ({ type: 'existing' as const, data: img }));
    const newImgs = newImages.map(file => ({ type: 'new' as const, data: file }));
    return [...existing, ...newImgs];
  }, [existingImages, newImages]);

  const selectedImage = React.useMemo(() => {
    if (selectedImageIndex === null || !allImages[selectedImageIndex]) return null;
    return allImages[selectedImageIndex];
  }, [selectedImageIndex, allImages]);

  React.useEffect(() => {
    return () => {
      notification.clear();
    };
  }, []);

  return (
    <>
      <LoadingOverlay active={uploadImagesMutation.isLoading || deleteImageMutation.isLoading} />

      <ScreenHeader
        title="Báo cáo hoạt động"
        onBack={() => router.back()}
      />

      <div className="flex h-full flex-col">
        <div className="mb-4 space-y-2 px-4">
          <NotificationBanner
            title="Hướng dẫn"
            description="Chụp và upload hình ảnh hoạt động của bạn trong ca làm việc. Bạn có thể upload nhiều hình ảnh và xem lại lịch sử đã upload."
            type="info"
          />
        </div>

        <div className="flex-1 overflow-auto px-4">
          {/* Upload new images section */}
          <div className="mb-6">
            <h3 className="mb-3 text-base font-semibold text-gray-800">Chụp hình ảnh mới</h3>
            <MultipleImagesCaptureInput
              key={componentKey}
              label="Hình ảnh hoạt động"
              helperText="Chụp hình ảnh hoạt động trong ca làm việc"
              value={newImages}
              onChange={setNewImages}
              min={0}
              max={3}
              defaultFacingMode="environment"
            />
            
            {newImages.length > 0 && (
              <div className="mt-4">
                <Button
                  onClick={handleUploadImages}
                  disabled={uploadImagesMutation.isLoading || newImages.length === 0}
                  variant="primary"
                  className="w-full"
                  centered
                >
                  {uploadImagesMutation.isLoading 
                    ? `Đang upload ${newImages.length} hình ảnh...` 
                    : `Upload ${newImages.length} hình ảnh`
                  }
                </Button>
              </div>
            )}
          </div>

          {/* Existing images section */}
          {existingImages.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-base font-semibold text-gray-800">
                Hình ảnh đã upload ({existingImages.length})
              </h3>
              <div className="grid grid-cols-2 gap-2 border border-gray-30 p-2">
                {existingImages.map((image, index) => (
                  <div key={image.fileId} className="relative aspect-[3/2] bg-gray-10">
                    <img
                      src={AppConfig.imageDomain + image.url}
                      alt={image.fileName}
                      className="h-full w-full object-contain object-center"
                    />
                    <div className="absolute left-2 top-2">
                      <IconButton
                        size="medium"
                        variant="white"
                        icon={Icons.Maximize}
                        onClick={() => handleMaximizeImage(index, true)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {existingImages.length === 0 && newImages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 text-gray-400">
                <Icons.Camera className="w-10 h-10" />
              </div>
              <p className="text-gray-500">Chưa có hình ảnh nào</p>
              <p className="text-sm text-gray-400">Hãy chụp hình ảnh hoạt động của bạn</p>
            </div>
          )}
        </div>
      </div>

      {/* Image preview modal */}
      <Modal
        isOpen={isMaximized && selectedImage !== null}
        onClose={() => setIsMaximized(false)}
        title={`Hình ảnh hoạt động ${selectedImageIndex !== null ? `(${selectedImageIndex + 1}/${allImages.length})` : ""}`}
      >
        {selectedImage && (
          <img
            src={selectedImage.type === 'existing' 
              ? AppConfig.imageDomain + selectedImage.data.url 
              : URL.createObjectURL(selectedImage.data)
            }
            alt="Preview"
            className="h-[65vh] w-full bg-gray-10 object-contain object-center"
          />
        )}
      </Modal>
    </>
  );
};