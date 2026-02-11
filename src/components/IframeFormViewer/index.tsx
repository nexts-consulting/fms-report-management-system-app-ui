"use client";

import React, { useRef, useState, useEffect } from "react";
import { IAttendance } from "@/types/model";
import { useIframeCommunication } from "@/hooks/use-iframe-communication";
import { LoadingOverlay } from "@/kits/components/loading-overlay";
import { Button } from "@/kits/components/button";

interface IframeFormViewerProps {
  appUrl: string;
  currentAttendance: IAttendance | null;
  formName?: string;
}

const IFRAME_LOAD_TIMEOUT = 15000; // 15 seconds

export const IframeFormViewer: React.FC<IframeFormViewerProps> = ({
  appUrl,
  currentAttendance,
  formName,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [loadTimeout, setLoadTimeout] = useState(false);

  // Extract origin from appUrl for security
  const targetOrigin = React.useMemo(() => {
    try {
      const url = new URL(appUrl);
      return url.origin;
    } catch (error) {
      console.error("Invalid app URL:", appUrl);
      return "*"; // Fallback, but less secure
    }
  }, [appUrl]);

  const { isIframeReady, handleIframeLoad } = useIframeCommunication({
    iframeRef,
    targetOrigin,
    currentAttendance,
    onIframeReady: () => {
      setIsLoading(false);
      setLoadTimeout(false);
    },
    onIframeError: (error) => {
      setLoadError(error);
      setIsLoading(false);
    },
  });

  // Handle iframe load event
  const onIframeLoad = () => {
    handleIframeLoad();
  };

  // Setup timeout for iframe loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setLoadTimeout(true);
        setIsLoading(false);
        setLoadError(
          new Error(`Form không thể tải trong ${IFRAME_LOAD_TIMEOUT / 1000} giây. Vui lòng thử lại.`)
        );
      }
    }, IFRAME_LOAD_TIMEOUT);

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Retry loading iframe
  const handleRetry = () => {
    setIsLoading(true);
    setLoadError(null);
    setLoadTimeout(false);
    
    // Force reload iframe
    if (iframeRef.current) {
      iframeRef.current.src = appUrl;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Loading Overlay */}
      <LoadingOverlay active={isLoading} />

      {/* Error State */}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="max-w-md p-6 text-center">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Lỗi tải form
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {loadError.message}
            </p>
            <Button
              variant="primary"
              size="medium"
              onClick={handleRetry}
              className="w-full"
            >
              Thử lại
            </Button>
          </div>
        </div>
      )}

      {/* Iframe */}
      <iframe
        ref={iframeRef}
        src={appUrl}
        allow="camera; microphone; geolocation; clipboard-read; clipboard-write; payment; usb; serial;"
        className="w-full h-full border-0"
        title={formName || "Form"}
        onLoad={onIframeLoad}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        style={{
          minHeight: "calc(100vh - 120px)",
        }}
      />

      {/* Debug Info (only in development) */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
          <div>Ready: {isIframeReady ? "Yes" : "No"}</div>
          <div>Loading: {isLoading ? "Yes" : "No"}</div>
          <div>Error: {loadError ? "Yes" : "No"}</div>
          <div>Timeout: {loadTimeout ? "Yes" : "No"}</div>
        </div>
      )} */}
    </div>
  );
};

