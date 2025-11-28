"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ScreenOverlayRef {
  show: () => void;
  hide: () => void;
  toggle: () => void;
  isVisible: boolean;
}

interface ScreenOverlayProps {
  bgColor?: string;
  children?: React.ReactNode;
  className?: string;
  onShow?: () => void;
  onHide?: () => void;
  duration?: number; // Animation duration in seconds
  zIndex?: number;
  defaultVisible?: boolean; // Default visibility state
}

export const ScreenOverlay = forwardRef<ScreenOverlayRef, ScreenOverlayProps>(
  (
    {
      bgColor = "rgba(0, 0, 0, 0.5)",
      children,
      className = "",
      onShow,
      onHide,
      duration = 0.3,
      zIndex = 1000,
      defaultVisible = false,
    },
    ref,
  ) => {
    const [isVisible, setIsVisible] = useState(defaultVisible);

    useImperativeHandle(ref, () => ({
      show: () => {
        setIsVisible(true);
        onShow?.();
      },
      hide: () => {
        setIsVisible(false);
        onHide?.();
      },
      toggle: () => {
        if (isVisible) {
          setIsVisible(false);
          onHide?.();
        } else {
          setIsVisible(true);
          onShow?.();
        }
      },
      isVisible,
    }));

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: defaultVisible ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
            className={`fixed inset-0 h-full w-full ${className}`}
            style={{
              backgroundColor: bgColor,
              zIndex,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);

ScreenOverlay.displayName = "ScreenOverlay";
