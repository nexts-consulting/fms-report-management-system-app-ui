"use client";

import dynamic from "next/dynamic";
import React from "react";

const ProvidersDynamic = dynamic(() => import("@/layouts/providers"), {
  ssr: false,
});

interface ProvidersWrapperProps {
  children: React.ReactNode;
}

export const ProvidersWrapper = (props: ProvidersWrapperProps) => {
  const { children } = props;
  return <ProvidersDynamic>{children}</ProvidersDynamic>;
};
