import { UAParser } from "ua-parser-js";

export const getNativeAgent = () => {
  return navigator.userAgent;
};

export const getUserAgentParsed = () => {
  const parser = new UAParser();
  return parser.getResult();
};

export const getBrowserInfo = () => {
  const parser = new UAParser();
  const browser = parser.getBrowser();
  return browser;
};

export const isDesktop = () => {
  const result = getUserAgentParsed();
  return result.device.type === undefined;
};

export const checkIsMobile = () => {
  const result = getUserAgentParsed();
  return result.device.type === "mobile";
};

export const isAndroid = () => {
  const result = getUserAgentParsed();
  return result.os.name?.toLowerCase() === "android";
};

export const checkIsIOS = () => {
  const result = getUserAgentParsed();
  return result.os.name?.toLowerCase() === "ios";
};

export const isChrome = () => {
  const browser = getBrowserInfo();
  return browser.name?.toLowerCase() === "chrome";
};

export const isMobileChrome = () => {
  const browser = getBrowserInfo();
  return browser.name?.toLowerCase() === "mobile chrome";
};

export const isFirefox = () => {
  const browser = getBrowserInfo();
  return browser.name?.toLowerCase() === "firefox";
};

export const isSafari = () => {
  const browser = getBrowserInfo();
  return browser.name?.toLowerCase() === "safari";
};

export const isEdge = () => {
  const browser = getBrowserInfo();
  return browser.name?.toLowerCase() === "edge";
};

export const isCameraSupported = async (): Promise<boolean> => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return false;
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputDevices = devices.filter((device) => device.kind === "videoinput");
    return videoInputDevices.length > 0;
  } catch (error) {
    console.error("Error checking camera support:", error);
    return false;
  }
};

export const getCameraCount = async (): Promise<number> => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    console.warn("Camera API not supported");
    return 0;
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputDevices = devices.filter((device) => device.kind === "videoinput");
    return videoInputDevices.length;
  } catch (error) {
    console.error("Error fetching camera devices:", error);
    return 0;
  }
};

export const enterFullscreen = () => {
  try {
    const element = document.documentElement;
    if (element?.requestFullscreen) {
      element?.requestFullscreen();
    } else if ((element as any)?.webkitRequestFullscreen) {
      (element as any)?.webkitRequestFullscreen();
    } else if ((element as any)?.msRequestFullscreen) {
      (element as any)?.msRequestFullscreen();
    }
  } catch (error) {}
};

export const exitFullscreen = () => {
  try {
    if (document?.exitFullscreen) {
      document?.exitFullscreen();
    } else if ((document as any)?.webkitExitFullscreen) {
      (document as any)?.webkitExitFullscreen();
    } else if ((document as any)?.mozCancelFullScreen) {
      (document as any)?.mozCancelFullScreen();
    } else if ((document as any)?.msExitFullscreen) {
      (document as any)?.msExitFullscreen();
    }
  } catch (error) {}
};

export const checkIsFullscreenActive = () => {
  return (
    (document.fullscreenElement ||
      (document as any)?.webkitFullscreenElement ||
      (document as any)?.mozFullScreenElement ||
      (document as any)?.msFullscreenElement) !== null
  );
};
