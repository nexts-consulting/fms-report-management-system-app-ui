"use client";

import dynamic from "next/dynamic";
import React from "react";

const AttendanceGuardDynamic = dynamic(() => import("@/layouts/attendance-guard"), {
  ssr: false,
});

interface AttendanceGuardWrapperProps {
  children: React.ReactNode;
}

export const AttendanceGuardWrapper = (props: AttendanceGuardWrapperProps) => {
  const { children } = props;
  return <AttendanceGuardDynamic>{children}</AttendanceGuardDynamic>;
};
