"use client";

import { useOnAppMount } from "@/hooks/use-on-app-mount";

interface ContentProps {
  children: React.ReactNode;
}

export const Content = (props: ContentProps) => {
  const { children } = props;

  useOnAppMount();

  return <>{children}</>;
};
