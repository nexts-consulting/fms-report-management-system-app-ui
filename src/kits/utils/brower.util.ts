export class BrowserUtil {
  static isBrowser = (): boolean => {
    return typeof window !== "undefined";
  };

  static isFullscreen = (): boolean => {
    if (!this.isBrowser()) return false;

    try {
      return !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
    } catch (error) {
      console.warn("Failed to check fullscreen:", error);
      return false;
    }
  };

  static enterFullscreen = (element?: HTMLElement) => {
    if (!this.isBrowser()) return;

    try {
      const targetElement = element || document.documentElement;

      if (targetElement.requestFullscreen) {
        targetElement.requestFullscreen();
      } else if ((targetElement as any).webkitRequestFullscreen) {
        (targetElement as any).webkitRequestFullscreen();
      } else if ((targetElement as any).mozRequestFullScreen) {
        (targetElement as any).mozRequestFullScreen();
      } else if ((targetElement as any).msRequestFullscreen) {
        (targetElement as any).msRequestFullscreen();
      }
    } catch (error) {
      console.warn("Failed to enter fullscreen:", error);
    }
  };

  static exitFullscreen = () => {
    if (!this.isBrowser()) return;

    try {
      if (!this.isFullscreen()) {
        return;
      }

      if (!document.hasFocus()) {
        return;
      }

      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    } catch (error) {
      console.warn("Failed to exit fullscreen:", error);
    }
  };

  static toggleFullscreen = (element?: HTMLElement) => {
    if (!this.isBrowser()) return;

    if (this.isFullscreen()) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen(element);
    }
  };

  static addFullscreenChangeListener = (callback: () => void) => {
    if (!this.isBrowser()) return;

    document.addEventListener("fullscreenchange", callback);
    document.addEventListener("webkitfullscreenchange", callback);
    document.addEventListener("mozfullscreenchange", callback);
    document.addEventListener("MSFullscreenChange", callback);
  };

  static removeFullscreenChangeListener = (callback: () => void) => {
    if (!this.isBrowser()) return;

    document.removeEventListener("fullscreenchange", callback);
    document.removeEventListener("webkitfullscreenchange", callback);
    document.removeEventListener("mozfullscreenchange", callback);
    document.removeEventListener("MSFullscreenChange", callback);
  };
}
