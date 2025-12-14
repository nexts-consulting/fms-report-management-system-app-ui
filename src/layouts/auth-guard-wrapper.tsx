"use client";

import dynamic from "next/dynamic";
import React from "react";

const AuthGuardDynamic = dynamic(() => import("@/layouts/auth-guard"), {
  ssr: false,
});

interface AuthGuardWrapperProps {
  children: React.ReactNode;
}

export const AuthGuardWrapper = (props: AuthGuardWrapperProps) => {
  const { children } = props;
  return <AuthGuardDynamic>{children}</AuthGuardDynamic>;
};
