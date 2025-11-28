"use client";

import { useGlobalContext } from "@/contexts/global.context";
import React from "react";
import { useRouter } from "next/navigation";
import { useTenantProjectPath } from "@/hooks/use-tenant-project-path";

interface AttendanceGuardProps {
  children: React.ReactNode;
}

export const AttendanceGuard = (props: AttendanceGuardProps) => {
  const { children } = props;

  const globalStore = useGlobalContext();
  const currentAttendance = globalStore.use.currentAttendance();

  const router = useRouter();
  const { buildPath } = useTenantProjectPath();

  React.useEffect(() => {
    if (!currentAttendance) {
      router.replace(buildPath("/lobby"));
    }
  }, [currentAttendance, buildPath]);

  return currentAttendance && children;
};

export default AttendanceGuard;
