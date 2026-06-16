import { useEffect, useRef, useCallback, useState } from "react";
import { IAttendance } from "@/types/model";

export interface IframeMessageData {
  type: string;
  payload?: any;
}

export interface IframeInitPayload {
  currentAttendance: IAttendance | null;
  user_full_name: string | null;
}

const INIT_RETRY_INTERVAL_MS = 400;
const MAX_INIT_RETRIES = 10;

interface UseIframeCommunicationOptions {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  targetOrigin: string;
  currentAttendance: IAttendance | null;
  userFullName?: string | null;
  onIframeReady?: () => void;
  onIframeError?: (error: Error) => void;
}

export const useIframeCommunication = ({
  iframeRef,
  targetOrigin,
  currentAttendance,
  userFullName,
  onIframeReady,
  onIframeError,
}: UseIframeCommunicationOptions) => {
  const [isIframeReady, setIsIframeReady] = useState(false);
  const initAckedRef = useRef(false);
  const initRetryCountRef = useRef(0);
  const initRetryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    const initPayload: IframeInitPayload = {
      currentAttendance,
      user_full_name: userFullName ?? currentAttendance?.full_name ?? null,
    };

    sendMessageToIframe({
      type: "INIT_FORM_DATA",
      payload: initPayload,
    });
  }, [currentAttendance, userFullName, sendMessageToIframe]);

  const clearInitRetry = useCallback(() => {
    if (initRetryTimerRef.current) {
      clearInterval(initRetryTimerRef.current);
      initRetryTimerRef.current = null;
    }
  }, []);

  const markIframeReady = useCallback(() => {
    setIsIframeReady((prev) => {
      if (!prev) {
        onIframeReady?.();
      }
      return true;
    });
  }, [onIframeReady]);

  const startInitHandshake = useCallback(() => {
    if (initRetryTimerRef.current) return;

    // Hybrid mode:
    // - Legacy child forms: parent does not block on ACK
    // - Updated child forms: parent still listens for ACK and stops retries early
    sendInitData();
    markIframeReady();

    initRetryCountRef.current = 0;
    initRetryTimerRef.current = setInterval(() => {
      if (initAckedRef.current) {
        clearInitRetry();
        return;
      }

      initRetryCountRef.current += 1;
      if (initRetryCountRef.current >= MAX_INIT_RETRIES) {
        clearInitRetry();
        return;
      }

      sendInitData();
    }, INIT_RETRY_INTERVAL_MS);
  }, [clearInitRetry, markIframeReady, sendInitData]);

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
          // Iframe is ready, start retry-until-ack handshake
          startInitHandshake();
          break;

        case "INIT_ACK":
          initAckedRef.current = true;
          clearInitRetry();
          markIframeReady();
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
    [clearInitRetry, markIframeReady, onIframeError, startInitHandshake, targetOrigin]
  );

  /**
   * Handle iframe load event
   */
  const handleIframeLoad = useCallback(() => {
    // Reset handshake state whenever iframe loads/reloads
    initAckedRef.current = false;
    initRetryCountRef.current = 0;
    clearInitRetry();
    setIsIframeReady(false);

    // Fallback: if FORM_READY is missed, still start handshake
    const timeoutId = setTimeout(() => {
      if (!initRetryTimerRef.current && !initAckedRef.current) {
        startInitHandshake();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [clearInitRetry, startInitHandshake]);

  /**
   * Setup message listener
   */
  useEffect(() => {
    window.addEventListener("message", handleMessage);

    return () => {
      clearInitRetry();
      window.removeEventListener("message", handleMessage);
    };
  }, [clearInitRetry, handleMessage]);

  /**
   * Reset when currentAttendance changes
   */
  useEffect(() => {
    if (isIframeReady) {
      // Re-run handshake if attendance changes after initial init
      initAckedRef.current = false;
      clearInitRetry();
      startInitHandshake();
    }
  }, [clearInitRetry, currentAttendance, userFullName, isIframeReady, startInitHandshake]);

  return {
    isIframeReady,
    sendMessageToIframe,
    handleIframeLoad,
  };
};





