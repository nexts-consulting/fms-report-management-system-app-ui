"use client";

import React from "react";
import { useAuthContext } from "@/contexts/auth.context";

/**
 * Hook to apply project theme colors as CSS variables
 * Automatically updates CSS variables when project colors change
 */
export const useProjectTheme = () => {
  const authStore = useAuthContext();
  const project = authStore.use.project();

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;

    if (project?.primary_color || project?.secondary_color) {
      // Set primary color (use for buttons, links, etc.)
      if (project.primary_color) {
        root.style.setProperty("--project-primary-color", project.primary_color);
        // Generate shades for primary color
        root.style.setProperty("--project-primary-hover", adjustBrightness(project.primary_color, -10));
        root.style.setProperty("--project-primary-active", adjustBrightness(project.primary_color, -20));
        // Generate lighter shades for text and other uses
        root.style.setProperty("--project-primary-10", adjustBrightness(project.primary_color, 80));
        root.style.setProperty("--project-primary-20", adjustBrightness(project.primary_color, 60));
        root.style.setProperty("--project-primary-30", adjustBrightness(project.primary_color, 40));
        root.style.setProperty("--project-primary-40", adjustBrightness(project.primary_color, 20));
        root.style.setProperty("--project-primary-50", adjustBrightness(project.primary_color, 10));
        root.style.setProperty("--project-primary-90", adjustBrightness(project.primary_color, -30));
        root.style.setProperty("--project-primary-100", adjustBrightness(project.primary_color, -40));
      }

      // Set secondary color
      if (project.secondary_color) {
        root.style.setProperty("--project-secondary-color", project.secondary_color);
        root.style.setProperty("--project-secondary-hover", adjustBrightness(project.secondary_color, -10));
        root.style.setProperty("--project-secondary-active", adjustBrightness(project.secondary_color, -20));
      }
    } else {
      // Reset to default colors if project doesn't have custom colors
      root.style.removeProperty("--project-primary-color");
      root.style.removeProperty("--project-primary-hover");
      root.style.removeProperty("--project-primary-active");
      root.style.removeProperty("--project-primary-10");
      root.style.removeProperty("--project-primary-20");
      root.style.removeProperty("--project-primary-30");
      root.style.removeProperty("--project-primary-40");
      root.style.removeProperty("--project-primary-50");
      root.style.removeProperty("--project-primary-90");
      root.style.removeProperty("--project-primary-100");
      root.style.removeProperty("--project-secondary-color");
      root.style.removeProperty("--project-secondary-hover");
      root.style.removeProperty("--project-secondary-active");
    }
  }, [project?.primary_color, project?.secondary_color]);

  return {
    primaryColor: project?.primary_color,
    secondaryColor: project?.secondary_color,
  };
};

/**
 * Helper function to adjust brightness of a hex color
 * @param color - Hex color string (e.g., "#1d35e0")
 * @param percent - Percentage to adjust brightness (-100 to 100, negative = darker, positive = lighter)
 * @returns Adjusted hex color string
 */
function adjustBrightness(color: string, percent: number): string {
  // Remove # if present and handle 3-digit hex
  let hex = color.replace("#", "");
  
  // Convert 3-digit to 6-digit
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  
  // Validate hex color
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
    console.warn(`Invalid hex color: ${color}, using default`);
    return color; // Return original if invalid
  }
  
  // Convert to RGB
  const num = parseInt(hex, 16);
  const r = num >> 16;
  const g = (num >> 8) & 0x00ff;
  const b = num & 0x0000ff;
  
  // Adjust brightness
  // For darker: multiply by (1 - percent/100)
  // For lighter: add percent to each channel
  const factor = 1 + percent / 100;
  const newR = Math.round(r * factor);
  const newG = Math.round(g * factor);
  const newB = Math.round(b * factor);
  
  // Clamp values between 0 and 255
  const clamp = (val: number) => Math.min(255, Math.max(0, val));
  
  // Convert back to hex
  const toHex = (val: number) => {
    const hex = clamp(val).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

