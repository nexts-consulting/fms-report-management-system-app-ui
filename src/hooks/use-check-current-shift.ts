import { useAuthContext } from "@/contexts/auth.context";
import { useGlobalContext } from "@/contexts/global.context";
import { useQueryCurrentShift } from "@/services/api/attendance/current-shift";
import { EUserAccountRole } from "@/types/model";
import React from "react";
import { useParams } from "next/navigation";

export const useCheckCurrentShift = () => {
  const authStore = useAuthContext();
  const user = authStore.use.user();
  const params = useParams();
  const projectCode = params?.project_code as string;

  const globalStore = useGlobalContext();

  const currentAttendanceQuery = useQueryCurrentShift({
    params: {
      username: user?.account?.username || "",
      project_code: projectCode || "",
    },
    config: {
      enabled: !!user?.account?.username && !!projectCode && user.account?.role !== EUserAccountRole.SALE,
      onSuccess: (data) => {
        if (data.data) {
          globalStore.setState({
            selectedWorkingShift: data.data.shift,
            currentAttendance: data.data,
          });
        } else {
          globalStore.setState({
            selectedWorkingShift: null,
            currentAttendance: null,
          });
        }
      },
      onError: (error) => {
        globalStore.setState({
          selectedWorkingShift: null,
          currentAttendance: null,
        });
      },
    },
  });

  React.useEffect(() => {
    if (!user) return;

    if (user?.account?.role === EUserAccountRole.SALE) {
      return;
    }

    // Only update state if query is not loading
    if (!currentAttendanceQuery.isLoading) {
      if (currentAttendanceQuery.data?.data) {
        globalStore.setState({
          selectedProvince: currentAttendanceQuery.data.data.shift.outlet.province,
          selectedOutlet: currentAttendanceQuery.data.data.shift.outlet,
          selectedWorkingShift: currentAttendanceQuery.data.data.shift,
          currentAttendance: currentAttendanceQuery.data.data,
        });
      } else if (currentAttendanceQuery.isError || !currentAttendanceQuery.data) {
        // Only set null if we got an error or explicitly got null data
        globalStore.setState({
          selectedWorkingShift: null,
          currentAttendance: null,
        });
      }
    }
  }, [
    user,
    currentAttendanceQuery.data,
    currentAttendanceQuery.isLoading,
    currentAttendanceQuery.isError,
  ]);
};
