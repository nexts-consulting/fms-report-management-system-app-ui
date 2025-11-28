export type AttendanceStatus = "CHECKED_IN" | "CHECKED_OUT" | "AUTO_CHECKED_OUT";
export type TimingStatus = "ON_TIME" | "LATE" | "EARLY" | "ABSENT";

export interface IAttendance {
  id: number;
  project_code: string;
  username: string;
  workshift_id: number | null;
  workshift_name: string;
  location_id: number | null;
  location_code: string;
  location_name: string;
  checkin_time: string | null;
  checkout_time: string | null;
  status: AttendanceStatus;
  timing_status: TimingStatus;
  checkin_photo_url: string | null;
  checkout_photo_url: string | null;
  checkin_lat: number | null;
  checkin_lng: number | null;
  checkout_lat: number | null;
  checkout_lng: number | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface GetAttendanceParams {
  project_code: string;
  start_date?: string;
  end_date?: string;
  username?: string;
  location_id?: number;
  workshift_id?: number;
  status?: AttendanceStatus;
  timing_status?: TimingStatus;
  limit?: number;
  offset?: number;
}

export interface AttendanceStatistics {
  total: number;
  checked_in: number;
  checked_out: number;
  auto_checked_out: number;
  on_time: number;
  late: number;
  early: number;
  absent: number;
}


