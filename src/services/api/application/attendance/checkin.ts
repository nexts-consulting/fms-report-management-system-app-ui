import { supabaseFmsService } from "@/services/supabase";
import { IAttendance, TimingStatus } from "@/types/model";
import type { CheckinLocation } from "@/app/[tenant_code]/[project_code]/(auth)/checkin/common/types";
import dayjs from "dayjs";
import { useMutation } from "react-query";

export type CheckinMutationParams = {
  userId: string;
  shiftId: number;
  location: CheckinLocation;
  photoUrl: string;
  projectCode: string;
  username: string;
  workshiftName: string;
  locationId: number;
  locationCode: string;
  locationName: string;
  workshiftStartTime: string;
  workshiftEndTime: string;
};

export type CheckinResponseData = {
  data: IAttendance;
};

/**
 * Calculate timing status based on checkin time and workshift start time
 */
const calculateTimingStatus = (
  checkinTime: string,
  workshiftStartTime: string,
): TimingStatus => {
  const checkin = dayjs(checkinTime);
  const startTime = dayjs(workshiftStartTime);
  
  // Calculate difference in minutes
  const diffMinutes = checkin.diff(startTime, "minute");
  
  // Consider on-time if within 15 minutes before or after start time
  if (diffMinutes >= -15 && diffMinutes <= 15) {
    return "ON_TIME";
  }
  
  // Late if checkin is more than 15 minutes after start time
  if (diffMinutes > 15) {
    return "LATE";
  }
  
  // Early if checkin is more than 15 minutes before start time
  return "EARLY";
};

/**
 * Create attendance checkin record
 */
export const httpRequestAttendanceCheckin = async (
  params: CheckinMutationParams,
): Promise<CheckinResponseData> => {
  try {
    const {
      username,
      projectCode,
      shiftId,
      location,
      photoUrl,
      workshiftName,
      locationId,
      locationCode,
      locationName,
      workshiftStartTime,
      workshiftEndTime,
    } = params;


    // Get current timestamp
    const checkinTime = dayjs().toISOString();
    // Calculate timing status
    const timingStatus = calculateTimingStatus(checkinTime, workshiftStartTime);

    // Insert attendance record
    const { data, error } = await supabaseFmsService.client
      .from("fms_app_data_attendance")
      .insert({
        project_code: projectCode,
        username: username,
        workshift_id: shiftId,
        workshift_name: workshiftName,
        shift_start_time: workshiftStartTime,
        shift_end_time: workshiftEndTime,
        location_id: locationId,
        location_code: locationCode,
        location_name: locationName,
        checkin_time: checkinTime,
        checkout_time: null,
        status: "CHECKED_IN",
        timing_status: timingStatus,
        checkin_photo_url: photoUrl || null,
        checkout_photo_url: null,
        checkin_lat: location.lat,
        checkin_lng: location.lng,
        checkout_lat: null,
        checkout_lng: null,
        metadata: {},
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data: data as IAttendance };
  } catch (error) {
    console.error("Error creating attendance checkin:", error);
    throw error;
  }
};

type UseMutationAttendanceCheckinOptions = {
  config?: {
    onSuccess?: (data: CheckinResponseData, variables: CheckinMutationParams, context: unknown) => void | Promise<unknown>;
    onError?: (error: Error, variables: CheckinMutationParams, context: unknown) => void | Promise<unknown>;
    onSettled?: (data: CheckinResponseData | undefined, error: Error | null, variables: CheckinMutationParams, context: unknown) => void | Promise<unknown>;
  };
};

/**
 * Hook for attendance checkin mutation
 */
export const useMutationAttendanceCheckin = ({ config }: UseMutationAttendanceCheckinOptions = {}) => {
  return useMutation({
    mutationFn: httpRequestAttendanceCheckin,
    ...config,
  });
};
