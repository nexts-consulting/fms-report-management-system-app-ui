import { Button } from "@/kits/components/button";
import { Icons } from "@/kits/components/icons";
import { NotificationBanner } from "@/kits/components/notification-banner";
import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import { ImageUtil } from "@/kits/utils/image.util";
import React, { useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Webcam from "react-webcam";

const constants = {
  INSTANCE_NAME: "CameraCapture",
};

interface CameraCaptureProps {
  enableUpload?: boolean;
  enableCancel?: boolean;
  defaultFacingMode?: "user" | "environment";
  onCapture?: (image: string) => void;
  onError?: (error: string) => void;
  onConfirm?: (file: File) => void;
  onCancel?: () => void;
}

const initialVideoConstraints = {
  width: { ideal: 2560, max: 3840, min: 2560 },
  height: { ideal: 1440, max: 2160, min: 1440 },
  facingMode: "user",
};

const fallbackConstraints = [
  {
    width: { ideal: 2560, min: 2560, max: 2560 },
    height: { ideal: 1440, min: 1440, max: 1440 },
  },
  {
    width: { ideal: 2400, min: 2400, max: 2400 },
    height: { ideal: 1350, min: 1350, max: 1350 },
  },
  {
    width: { ideal: 2240, min: 2240, max: 2240 },
    height: { ideal: 1260, min: 1260, max: 1260 },
  },
  {
    width: { ideal: 2080, min: 2080, max: 2080 },
    height: { ideal: 1170, min: 1170, max: 1170 },
  },
  {
    width: { ideal: 1920, min: 1920, max: 1920 },
    height: { ideal: 1080, min: 1080, max: 1080 },
  },
  {
    width: { ideal: 1760, min: 1760, max: 1760 },
    height: { ideal: 990, min: 990, max: 990 },
  },
  {
    width: { ideal: 1600, min: 1600, max: 1600 },
    height: { ideal: 900, min: 900, max: 900 },
  },
  {
    width: { ideal: 1440, min: 1440, max: 1440 },
    height: { ideal: 810, min: 810, max: 810 },
  },
  {
    width: { ideal: 1280, min: 1280, max: 1280 },
    height: { ideal: 720, min: 720, max: 720 },
  },
  {
    width: { ideal: 1120, min: 1120, max: 1120 },
    height: { ideal: 630, min: 630, max: 630 },
  },
  {
    width: { ideal: 960, min: 960, max: 960 },
    height: { ideal: 540, min: 540, max: 540 },
  },
  {
    width: { ideal: 800, min: 800, max: 800 },
    height: { ideal: 450, min: 450, max: 450 },
  },
  {
    width: { ideal: 640, min: 640, max: 640 },
    height: { ideal: 360, min: 360, max: 360 },
  },
];

export const CameraCapture = (props: CameraCaptureProps) => {
  const {
    enableUpload = true,
    enableCancel = true,
    defaultFacingMode = "user",
    onCapture,
    onError,
    onConfirm,
    onCancel,
  } = props;

  const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));
  const [currentConstraintIndex, setCurrentConstraintIndex] = useState(-1);
  const [videoConstraints, setVideoConstraints] = useState({
    ...initialVideoConstraints,
    facingMode: defaultFacingMode,
  });

  const ids = React.useRef({
    fileInput: StringUtil.createElementId(
      constants.INSTANCE_NAME,
      instanceId.current,
      "file-input",
    ),
  });

  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(defaultFacingMode);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [cameraAvailable, setCameraAvailable] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    if (imageSrc) {
      const file = ImageUtil.base64ToFile(imageSrc);
      if (file) {
        onConfirm?.(file);
      }
    }
  };

  const handleCapture = () => {
    const image = webcamRef.current?.getScreenshot();
    if (image) {
      setImageSrc(image);
      onCapture?.(image);
    }
  };

  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setCurrentConstraintIndex(-1);
    setVideoConstraints({
      ...initialVideoConstraints,
      facingMode: facingMode === "user" ? "environment" : "user",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          const result = reader.result.toString();
          setImageSrc(result);
          onCapture?.(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setImageSrc(null);
  };

  const handleUserMediaError = useCallback(
    (err: any) => {
      if (currentConstraintIndex < fallbackConstraints.length - 1) {
        const nextIndex = currentConstraintIndex + 1;
        setCurrentConstraintIndex(nextIndex);
        setVideoConstraints({
          ...fallbackConstraints[nextIndex],
          facingMode,
        });
        return;
      }

      setCameraAvailable(false);
      onError?.("Camera không khả dụng hoặc quyền truy cập bị từ chối");
      setError(err.name ?? err.toString());
    },
    [currentConstraintIndex, facingMode, onError],
  );

  const handleUserMedia = useCallback(
    (stream: MediaStream) => {
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      console.log(settings);
    },
    [facingMode, currentConstraintIndex],
  );

  return createPortal(
    <div className="fixed inset-0 z-[10000] h-dvh w-full bg-gray-10">
      <div className="h-full w-full overflow-hidden">
        {imageSrc ? (
          <img src={imageSrc} alt="Captured" className="h-full w-full object-cover" />
        ) : cameraAvailable ? (
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            screenshotQuality={1}
            forceScreenshotSourceSize={true}
            imageSmoothing={true}
            videoConstraints={videoConstraints}
            onUserMediaError={handleUserMediaError}
            onUserMedia={handleUserMedia}
            allowFullScreen
            className={StyleUtil.cn("h-full w-full object-cover")}
          />
        ) : (
          <div className="mt-8 space-y-4 px-4">
            <Button variant="secondary" size="medium" onClick={onCancel} icon={Icons.ArrowLeft}>
              Quay lại
            </Button>
            <NotificationBanner
              type="warning"
              title="Camera không khả dụng"
              description="Camera không khả dụng hoặc quyền truy cập bị từ chối, vui lòng kiểm tra lại..."
              closeable={false}
            />
            <NotificationBanner
              type="error"
              title="Camera không khả dụng"
              description={error}
              closeable={false}
            />
          </div>
        )}
      </div>

      <div className="fixed right-4 top-4 z-10 flex items-center justify-center">
        {cameraAvailable && enableCancel && (
          <Button variant="secondary" size="medium" onClick={onCancel} icon={Icons.CloseLarge}>
            Hủy bỏ
          </Button>
        )}

        {imageSrc && (
          <Button variant="primary" size="medium" onClick={handleConfirm} icon={Icons.ArrowRight}>
            Tiếp tục
          </Button>
        )}
      </div>

      {cameraAvailable && (
        <div className="fixed bottom-8 left-0 right-0 z-10 flex items-center justify-center divide-x divide-gray-30">
          <input
            id={ids.current.fileInput}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={!enableUpload}
          />
          <label
            htmlFor={ids.current.fileInput}
            className={StyleUtil.cn(
              "group bg-white p-6",
              "active:bg-primary-60 active:outline active:outline-2 active:-outline-offset-2 active:outline-primary-60",
              { "cursor-not-allowed bg-gray-30": !enableUpload },
            )}
          >
            <Icons.Image className="h-8 w-8 text-gray-70 group-active:text-white" />
          </label>
          {!imageSrc && (
            <button
              className={StyleUtil.cn(
                "group bg-white p-6",
                "active:bg-primary-60 active:outline active:outline-2 active:-outline-offset-2 active:outline-primary-60",
              )}
              disabled={!cameraAvailable}
              onClick={handleCapture}
            >
              <Icons.Aperture className="h-8 w-8 text-gray-70 group-active:text-white" />
            </button>
          )}
          {imageSrc && (
            <button
              className={StyleUtil.cn(
                "group bg-red-50 p-6",
                "active:bg-primary-60 active:outline active:outline-2 active:-outline-offset-2 active:outline-primary-60",
              )}
              disabled={!cameraAvailable}
              onClick={handleClearImage}
            >
              <Icons.CloseLarge className="h-8 w-8 text-red-80 group-active:text-white" />
            </button>
          )}
          <button
            className={StyleUtil.cn(
              "group bg-white p-6",
              "active:bg-primary-60 active:outline active:outline-2 active:-outline-offset-2 active:outline-primary-60",
              "disabled:cursor-not-allowed disabled:bg-gray-30",
            )}
            disabled={!cameraAvailable || !!imageSrc}
            onClick={handleSwitchCamera}
          >
            <Icons.Rotate className="h-8 w-8 text-gray-70 group-active:text-white" />
          </button>
        </div>
      )}
    </div>,
    document.body,
  );
};