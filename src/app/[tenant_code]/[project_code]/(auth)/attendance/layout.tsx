import { LeaveEndConfirm } from "@/components/LeaveEndConfirm";
import { AttendanceGuardWrapper } from "@/layouts/attendance-guard-wrapper";

interface AttendanceLayoutProps {
  children: React.ReactNode;
}

export default function AttendanceLayout(props: AttendanceLayoutProps) {
  const { children } = props;

  return (
    <>
      <AttendanceGuardWrapper>{children}</AttendanceGuardWrapper>
      {/* <LeaveEndConfirm /> */}
    </>
  );
}
