import { useAuthContext } from "@/contexts/auth.context";
import { useGlobalContext } from "@/contexts/global.context";
import { useQueryCurrentShift } from "@/services/api/attendance/current-shift";
import { EUserAccountRole, IProvince } from "@/types/model";
import { IAdminDivision } from "@/services/application/management/master-data/admin-divisions-fms";
import { ILocation } from "@/services/application/management/master-data/locations-fms";
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
        // Map IProvince to IAdminDivision for backward compatibility
        const province: IProvince = currentAttendanceQuery.data.data.shift.location.province;
        const adminDivision: IAdminDivision = {
          id: province.id,
          project_code: projectCode || "",
          code: null,
          name: province.name,
          level: 0,
          type: "AREA",
          parent_id: null,
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Map IOutlet to ILocation for backward compatibility
        const locationData: any = currentAttendanceQuery.data.data.shift.location;
        const location: ILocation = {
          id: locationData.id,
          project_code: locationData.project_code,
          code: locationData.code,
          name: locationData.name,
          address: locationData.address || null,
          latitude: locationData.latitude || null,
          longitude: locationData.longitude || null,
          checkin_radius_meters: locationData.checkin_radius_meters,
          admin_division_id: locationData.admin_division_id,
          metadata: locationData.metadata,
          created_at: locationData.created_at,
          updated_at: locationData.updated_at,
        };

        globalStore.setState({
          selectedAdminDivision: adminDivision,
          selectedLocation: location,
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
    projectCode,
    currentAttendanceQuery.data,
    currentAttendanceQuery.isLoading,
    currentAttendanceQuery.isError,
  ]);
};
