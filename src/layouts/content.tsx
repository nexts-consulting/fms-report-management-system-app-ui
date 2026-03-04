"use client";

import { useOnAppMount } from "@/hooks/use-on-app-mount";
import { useGlobalContext } from "@/contexts/global.context";
import { LoadingOverlay } from "@/kits/components/loading-overlay";

interface ContentProps {
  children: React.ReactNode;
}

export const Content = (props: ContentProps) => {
  const { children } = props;
  const globalStore = useGlobalContext();
  const isCheckingCurrentShift = globalStore.use.isCheckingCurrentShift();

  useOnAppMount();

  return (
    <>
      <LoadingOverlay active={isCheckingCurrentShift} />
      {children}
    </>
  );
};
