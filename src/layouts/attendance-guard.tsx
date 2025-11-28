"use client";

import { useGlobalContext } from "@/contexts/global.context";
import React from "react";
import { useRouter } from "next/navigation";

interface AttendanceGuardProps {
  children: React.ReactNode;
}

export const AttendanceGuard = (props: AttendanceGuardProps) => {
  const { children } = props;

  const globalStore = useGlobalContext();
  const currentAttendance = globalStore.use.currentAttendance();

  const router = useRouter();

  React.useEffect(() => {
    if (!currentAttendance) {
      router.replace("/lobby");
    }
  }, [currentAttendance]);

  return currentAttendance && children;
};

export default AttendanceGuard;
