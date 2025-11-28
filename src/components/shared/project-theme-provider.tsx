"use client";

import React from "react";
import { useProjectTheme } from "@/hooks/use-project-theme";

interface ProjectThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component to apply project theme colors
 * This component uses the useProjectTheme hook to set CSS variables
 * based on project's primary_color and secondary_color
 */
export const ProjectThemeProvider = (props: ProjectThemeProviderProps) => {
  const { children } = props;
  
  // This hook will automatically set CSS variables when project colors change
  useProjectTheme();

  return <>{children}</>;
};

