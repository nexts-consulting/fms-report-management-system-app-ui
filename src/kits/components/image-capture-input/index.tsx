import { useControllableState } from "@/kits/hooks";
import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import { CameraCapture } from "@/kits/widgets/CameraCapture";
import React from "react";
import { IconButton } from "../icon-button";
import { Icons } from "../icons";
import { Modal } from "../modal";

const constants = {
  INSTANCE_NAME: "ImageCaptureInput",
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
};

export interface ImageCaptureInputProps {
  label?: string | React.ReactNode;
  helperText?: string | React.ReactNode;
  value?: File | null;
  onChange?: (v: File | null) => void;
  defaultFacingMode?: "user" | "environment";
  error?: boolean;
}

export const ImageCaptureInput = React.memo(
  React.forwardRef<HTMLDivElement, ImageCaptureInputProps>((props, ref) => {
    const {
      label,
      helperText,
      value: valueProp,
      onChange: onChangeProp,
      defaultFacingMode,
      error,
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

    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onChangeProp,
    });

    const handleConfirmCapture = (file: File) => {
      setValue(file);
      setPreviewImage(URL.createObjectURL(file));
      setShowCamera(false);
    };

    const handleRemoveImage = () => {
      setValue(null);
    };

    return (
      <>
        <div id={ids.current.container} ref={ref} className="relative mb-2">
          {/* Label */}
          <label htmlFor={ids.current.trigger} className={styles.label}>
            {label}
          </label>

          {/* Trigger */}
          {!value && (
            <button
              type="button"
              id={ids.current.trigger}
              className={StyleUtil.cn(styles.trigger, { "border-red-50 bg-red-50/5": error })}
              onClick={() => setShowCamera(true)}
            >
              <div className={styles.triggerContent}>
                <p>{helperText || "Open camera"}</p>
              </div>
            </button>
          )}

          {/* Preview */}
          {value && previewImage && (
            <div className="relative">
              <img
                src={previewImage}
                alt="Preview"
                className="aspect-[3/2] w-full bg-gray-10 object-contain object-center"
              />

              <div className="absolute left-4 top-4">
                <IconButton
                  size="large"
                  variant="white"
                  icon={Icons.Maximize}
                  onClick={() => setIsMaximized(true)}
                />
              </div>

              <div className="absolute right-4 top-4">
                <IconButton
                  size="large"
                  variant="danger"
                  icon={Icons.CloseLarge}
                  onClick={handleRemoveImage}
                />
              </div>
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

ImageCaptureInput.displayName = constants.INSTANCE_NAME;
