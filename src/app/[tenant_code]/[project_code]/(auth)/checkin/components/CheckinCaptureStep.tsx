import React from "react";
import { CameraCapture } from "@/kits/widgets/CameraCapture";

interface CheckinCaptureStepProps {
  onConfirm: (file: File) => void;
  onCapture: () => void;
  onError: () => void;
}

/**
 * Photo capture step component for check-in process
 */
export const CheckinCaptureStep: React.FC<CheckinCaptureStepProps> = ({
  onConfirm,
  onCapture,
  onError,
}) => {
  return (
    <div className="flex flex-1">
      <CameraCapture
        enableUpload={false}
        enableCancel={false}
        onConfirm={onConfirm}
        onCapture={onCapture}
        onError={onError}
      />
    </div>
  );
};
