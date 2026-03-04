import React from "react";
import { CameraCapture, type CameraCaptureTimeMarkConfig } from "@/kits/widgets/CameraCapture";

interface CheckoutCaptureStepProps {
  onConfirm: (file: File) => void;
  onCapture: () => void;
  onError: () => void;
  timeMarkConfig?: CameraCaptureTimeMarkConfig;
}

/**
 * Photo capture step component for check-out process
 */
export const CheckoutCaptureStep: React.FC<CheckoutCaptureStepProps> = ({
  onConfirm,
  onCapture,
  onError,
  timeMarkConfig,
}) => {
  return (
    <div className="flex flex-1">
      <CameraCapture
        enableUpload={false}
        enableCancel={false}
        timeMarkConfig={timeMarkConfig}
        onConfirm={onConfirm}
        onCapture={onCapture}
        onError={onError}
      />
    </div>
  );
};
