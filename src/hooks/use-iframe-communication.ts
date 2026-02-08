import { useEffect, useRef, useCallback, useState } from "react";
import { IAttendance } from "@/types/model";

export interface IframeMessageData {
  type: string;
  payload?: any;
}

export interface IframeInitPayload {
  currentAttendance: IAttendance | null;
}

interface UseIframeCommunicationOptions {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  targetOrigin: string;
  currentAttendance: IAttendance | null;
  onIframeReady?: () => void;
  onIframeError?: (error: Error) => void;
}

export const useIframeCommunication = ({
  iframeRef,
  targetOrigin,
  currentAttendance,
  onIframeReady,
  onIframeError,
}: UseIframeCommunicationOptions) => {
  const [isIframeReady, setIsIframeReady] = useState(false);
  const initSentRef = useRef(false);

  /**
   * Send message to iframe
   */
  const sendMessageToIframe = useCallback(
    (message: IframeMessageData) => {
      if (!iframeRef.current?.contentWindow) {
        console.warn("Iframe not ready to receive messages");
        return;
      }

      try {
        iframeRef.current.contentWindow.postMessage(message, targetOrigin);
      } catch (error) {
        console.error("Error sending message to iframe:", error);
        onIframeError?.(
          error instanceof Error ? error : new Error("Failed to send message to iframe")
        );
      }
    },
    [iframeRef, targetOrigin, onIframeError]
  );

  /**
   * Send initialization data to iframe
   */
  const sendInitData = useCallback(() => {
    if (initSentRef.current) return;

    const initPayload: IframeInitPayload = {
      currentAttendance,
    };

    sendMessageToIframe({
      type: "INIT_FORM_DATA",
      payload: initPayload,
    });

    initSentRef.current = true;
    setIsIframeReady(true);
    onIframeReady?.();
  }, [currentAttendance, sendMessageToIframe, onIframeReady]);

  /**
   * Handle messages from iframe (if needed in the future)
   */
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // Validate origin for security
      if (event.origin !== targetOrigin) {
        console.warn("Message from untrusted origin:", event.origin);
        return;
      }

      const message = event.data as IframeMessageData;

      switch (message.type) {
        case "FORM_READY":
          // Iframe is ready, send init data
          sendInitData();
          break;

        case "FORM_SUBMITTED":
          // Handle form submission if needed
          console.log("Form submitted:", message.payload);
          break;

        case "FORM_ERROR":
          // Handle form errors if needed
          console.error("Form error:", message.payload);
          onIframeError?.(
            new Error(message.payload?.message || "Form error occurred")
          );
          break;

        default:
          console.log("Unknown message type from iframe:", message.type);
      }
    },
    [targetOrigin, sendInitData, onIframeError]
  );

  /**
   * Handle iframe load event
   */
  const handleIframeLoad = useCallback(() => {
    // Reset init sent flag
    initSentRef.current = false;

    // Wait a bit for iframe to be fully ready, then send init data
    // If iframe sends FORM_READY, we'll send init data in response
    // Otherwise, send after a short delay as fallback
    const timeoutId = setTimeout(() => {
      if (!initSentRef.current) {
        sendInitData();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [sendInitData]);

  /**
   * Setup message listener
   */
  useEffect(() => {
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [handleMessage]);

  /**
   * Reset when currentAttendance changes
   */
  useEffect(() => {
    if (isIframeReady && initSentRef.current) {
      // Re-send init data if attendance changes
      initSentRef.current = false;
      sendInitData();
    }
  }, [currentAttendance, isIframeReady, sendInitData]);

  return {
    isIframeReady,
    sendMessageToIframe,
    handleIframeLoad,
  };
};

