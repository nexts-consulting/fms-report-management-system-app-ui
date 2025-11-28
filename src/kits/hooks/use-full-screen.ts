import React from "react";
import { BrowserUtil } from "../utils/brower.util";

export const useFullscreen = (element?: HTMLElement) => {
  const [isFullscreen, setIsFullscreen] = React.useState(() =>
    BrowserUtil.isBrowser() ? BrowserUtil.isFullscreen() : false,
  );

  React.useEffect(() => {
    if (!BrowserUtil.isBrowser()) return;

    const handleFullscreenChange = () => {
      setIsFullscreen(BrowserUtil.isFullscreen());
    };

    BrowserUtil.addFullscreenChangeListener(handleFullscreenChange);
    return () => {
      BrowserUtil.removeFullscreenChangeListener(handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = React.useCallback(() => {
    if (!BrowserUtil.isBrowser()) return;
    BrowserUtil.toggleFullscreen(element);
  }, [element]);

  const enterFullscreen = React.useCallback(() => {
    if (!BrowserUtil.isBrowser()) return;
    BrowserUtil.enterFullscreen(element);
  }, [element]);

  const exitFullscreen = React.useCallback(() => {
    if (!BrowserUtil.isBrowser()) return;
    BrowserUtil.exitFullscreen();
  }, []);

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
};
