import { useAuthContext } from "@/contexts/auth.context";
import { useGlobalContext } from "@/contexts/global.context";
import { useQueryCurrentShift } from "@/services/api/application/attendance/current-shift";
import { useQueryWorkshiftById } from "@/services/api/application/working-shift/get-by-id";
import { useQueryLocationById } from "@/services/api/application/location/get-by-id";
import { ILocation, IWorkingShiftLocation } from "@/types/model";
import React, { useEffect } from "react";
import { useParams } from "next/navigation";

export const useCheckCurrentShift = () => {
  const authStore = useAuthContext();
  const user = authStore.use.user();
  const params = useParams();
  const projectCode = params?.project_code as string;

  const globalStore = useGlobalContext();

  // Centralized state reset for current shift
  const resetShiftStates = () => {
    globalStore.setState({
      selectedWorkingShift: null,
      selectedLocation: null,
      selectedAdminDivision: null,
      currentAttendance: null,
    });
  };

  const currentAttendanceQuery = useQueryCurrentShift({
    params: {
      username: user?.username || "",
      project_code: projectCode || "",
    },
    config: {
      enabled: Boolean(user?.username && projectCode),
      onSuccess: (data) => {
        if (data.data) {
          globalStore.setState({ currentAttendance: data.data });
        } else {
          resetShiftStates();
        }
      },
      onError: () => {
        resetShiftStates();
      },
    },
  });

  const attendanceData = currentAttendanceQuery.data?.data;

  // Query workshift by ID - only when attendance data exists and has workshift_id
  const workshiftQuery = useQueryWorkshiftById({
    params: { id: attendanceData?.workshift_id ?? 0 },
    config: {
      enabled: Boolean(attendanceData?.workshift_id && attendanceData.workshift_id > 0),
    },
  });

  // Query location by ID - only when attendance data exists and has location_id
  const locationQuery = useQueryLocationById({
    params: { id: attendanceData?.location_id ?? 0 },
    config: {
      enabled: Boolean(attendanceData?.location_id && attendanceData.location_id > 0),
    },
  });

  useEffect(() => {
    if (!user) return;

    // If query is still loading, don't update state
    if (currentAttendanceQuery.isLoading) return;

    // If there's an error or no data, reset states
    if (currentAttendanceQuery.isError || !attendanceData) {
      resetShiftStates();
      return;
    }

    // If we have attendance data, check if workshift and location queries are ready
    if (attendanceData) {
      
      globalStore.setState({
        currentAttendance: attendanceData,
      });


      if(locationQuery.isSuccess) {
        const location = locationQuery.data?.data;
        globalStore.setState({
          selectedLocation: location,
        });
      }

      if (workshiftQuery.isSuccess && locationQuery.isSuccess) {
        const workshift = workshiftQuery.data?.data;
        const location = locationQuery.data?.data;
        globalStore.setState({
          selectedWorkingShift: {
            id: workshift?.id ?? 0,
            name: workshift?.name ?? attendanceData?.workshift_name ?? "",
            start_time: workshift?.start_time ?? "",
            end_time: workshift?.end_time ?? "",
            location: location as ILocation,
          },
        });
      }
    } else {
      resetShiftStates();
    }
  }, [
    user,
    projectCode,
    attendanceData,
    currentAttendanceQuery.isSuccess,
    workshiftQuery.isSuccess,
    locationQuery.isSuccess,
    globalStore,
  ]);
};
