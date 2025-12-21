import { useControllableState } from "@/kits/hooks";
import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import { CameraCapture } from "@/kits/widgets/CameraCapture";
import React from "react";
import { Button } from "../button";
import { IconButton } from "../IconButton";
import { Icons } from "../Icons";
import { Modal } from "../Modal";

const constants = {
  INSTANCE_NAME: "MultipleImagesCaptureInput",
};

export interface MultipleImagesCaptureInputProps {
  label?: string | React.ReactNode;
  min?: number;
  max?: number;
  helperText?: string | React.ReactNode;
  error?: boolean;
  value?: File[];
  onChange?: (files: File[]) => void;
  defaultFacingMode?: "user" | "environment";
}

export const MultipleImagesCaptureInput = React.memo(
  React.forwardRef<HTMLDivElement, MultipleImagesCaptureInputProps>((props, ref) => {
    const {
      label,
      min = 0,
      max = 1,
      helperText,
      error = false,
      value: valueProp,
      onChange: onChangeProp,
      defaultFacingMode = "environment",
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
    const [previewImages, setPreviewImages] = React.useState<string[]>([]);
    const [selectedImageIndex, setSelectedImageIndex] = React.useState<number | null>(null);
    const [isMaximized, setIsMaximized] = React.useState(false);

    const [value, setValue] = useControllableState<File[]>({
      prop: valueProp,
      onChange: onChangeProp,
      defaultProp: [],
    });

    const handleConfirmCapture = (file: File) => {
      const newFiles = [...(value || []), file];
      setValue(newFiles);
      setPreviewImages([...previewImages, URL.createObjectURL(file)]);
      setShowCamera(false);
    };

    const handleRemoveImage = (index: number) => {
      const newFiles = (value || []).filter((_, i) => i !== index);
      const newPreviews = previewImages.filter((_, i) => i !== index);
      setValue(newFiles);
      setPreviewImages(newPreviews);
    };

    const handleMaximize = (index: number) => {
      setSelectedImageIndex(index);
      setIsMaximized(true);
    };

    return (
      <>
        <div ref={ref} id={ids.current.container} className="relative">
          <div className="mb-2">
            {/* Label */}
            <label
              htmlFor={ids.current.trigger}
              className="line-clamp-2 block w-fit text-sm font-normal text-gray-70"
            >
              {label}
            </label>

            {/* Helper text */}
            <p id={ids.current.helperText} className="line-clamp-3 text-xs text-gray-50">
              {helperText}
            </p>
          </div>

          <div
            className={StyleUtil.cn(
              "flex flex-wrap items-center justify-between gap-4 border border-gray-30 p-2",
              {
                "border-red-50": error,
              },
            )}
          >
            <Button
              size="small"
              icon={Icons.Camera}
              onClick={() => setShowCamera(true)}
              disabled={(value?.length || 0) >= max}
            >
              Mở máy ảnh
            </Button>

            <div className="flex items-center justify-between gap-2">
              <div
                className={StyleUtil.cn("flex items-center justify-center bg-gray-10 px-3 py-1", {
                  "bg-green-10": (value?.length ?? 0) >= min,
                  "bg-red-10": (value?.length ?? 0) > 0 && (value?.length ?? 0) < min,
                })}
              >
                <p
                  className={StyleUtil.cn("text-sm font-medium text-gray-80", {
                    "text-green-50": (value?.length ?? 0) >= min,
                    "text-red-50": (value?.length ?? 0) > 0 && (value?.length ?? 0) < min,
                  })}
                >
                  {value?.length || 0}/{max}
                </p>
              </div>
            </div>
          </div>

          {/* Preview Grid */}
          {previewImages.length > 0 && (
            <div
              className={StyleUtil.cn(
                "grid grid-cols-2 gap-2 border border-t-0 border-gray-30 p-2",
                {
                  "border-red-50": error,
                },
              )}
            >
              {previewImages.map((preview, index) => (
                <div key={index} className="relative aspect-[3/2] bg-gray-10">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="h-full w-full object-contain object-center"
                  />
                  <div className="absolute left-2 top-2">
                    <IconButton
                      size="medium"
                      variant="white"
                      icon={Icons.Maximize}
                      onClick={() => handleMaximize(index)}
                    />
                  </div>
                  <div className="absolute right-2 top-2">
                    <IconButton
                      size="medium"
                      variant="danger"
                      icon={Icons.CloseLarge}
                      onClick={() => handleRemoveImage(index)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showCamera && (
          <CameraCapture
            enableUpload={false}
            enableCancel={true}
            defaultFacingMode={defaultFacingMode}
            onConfirm={handleConfirmCapture}
            onCancel={() => setShowCamera(false)}
          />
        )}

        <Modal
          isOpen={isMaximized && selectedImageIndex !== null}
          onClose={() => setIsMaximized(false)}
          title={label + " " + (selectedImageIndex !== null ? `(${selectedImageIndex + 1})` : "")}
        >
          {selectedImageIndex !== null && previewImages[selectedImageIndex] && (
            <img
              src={previewImages[selectedImageIndex]}
              alt="Preview"
              className="h-[65vh] w-full bg-gray-10 object-contain object-center"
            />
          )}
        </Modal>
      </>
    );
  }),
);

MultipleImagesCaptureInput.displayName = constants.INSTANCE_NAME;