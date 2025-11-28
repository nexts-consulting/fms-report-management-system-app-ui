import dynamic from "next/dynamic";
import { LeaveEndConfirm } from "@/components/LeaveEndConfirm";

const AttendanceGuardDynamic = dynamic(() => import("@/layouts/attendance-guard"), {
  ssr: false,
});

interface AttendanceLayoutProps {
  children: React.ReactNode;
}

export default function AttendanceLayout(props: AttendanceLayoutProps) {
  const { children } = props;

  return (
    <>
      <AttendanceGuardDynamic>{children}</AttendanceGuardDynamic>
      <LeaveEndConfirm />
    </>
  );
}
