// Project Metadata
export interface IProjectMetadata {
  id: string;
  project_id: string;
  key: string;
  value: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface CreateProjectMetadataInput {
  project_id: string;
  key: string;
  value?: string | null;
  metadata?: Record<string, any> | null;
}

export interface UpdateProjectMetadataInput {
  key?: string;
  value?: string | null;
  metadata?: Record<string, any> | null;
}

// Project Auth Config
export interface IProjectAuthConfig {
  id: string;
  project_id: string;
  keycloak_client_id: string;
  keycloak_client_secret: string | null;
  keycloak_redirect_uri: string | null;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface CreateProjectAuthConfigInput {
  project_id: string;
  keycloak_client_id: string;
  keycloak_client_secret?: string | null;
  keycloak_redirect_uri?: string | null;
}

export interface UpdateProjectAuthConfigInput {
  keycloak_client_id?: string;
  keycloak_client_secret?: string | null;
  keycloak_redirect_uri?: string | null;
}

// Project Checkin Flow
export interface IProjectCheckinFlow {
  id: string;
  project_id: string;
  require_survey: boolean;
  require_pre_shift_task: boolean;
  require_gps_at_location: boolean;
  require_attendance: boolean;
  require_post_shift_task: boolean;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface CreateProjectCheckinFlowInput {
  project_id: string;
  require_survey?: boolean;
  require_pre_shift_task?: boolean;
  require_gps_at_location?: boolean;
  require_attendance?: boolean;
  require_post_shift_task?: boolean;
}

export interface UpdateProjectCheckinFlowInput {
  require_survey?: boolean;
  require_pre_shift_task?: boolean;
  require_gps_at_location?: boolean;
  require_attendance?: boolean;
  require_post_shift_task?: boolean;
}

// Project GPS Config
export type ProjectGpsMode = "REQUIRED_AT_LOCATION" | "REQUIRED_BUT_NOT_STRICT" | "VISIBLE_OPTIONAL" | "NOT_REQUIRED";

export interface IProjectGpsConfig {
  id: string;
  project_id: string;
  mode: ProjectGpsMode;
  gps_radius_meters: number;
  is_required: boolean;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface CreateProjectGpsConfigInput {
  project_id: string;
  mode: ProjectGpsMode;
  gps_radius_meters?: number;
  is_required?: boolean;
}

export interface UpdateProjectGpsConfigInput {
  mode?: ProjectGpsMode;
  gps_radius_meters?: number;
  is_required?: boolean;
}

// Project Attendance Photo Config
export type ProjectPhotoMode = "REQUIRE_IDENTITY_VERIFICATION" | "REQUIRE_FACE_PHOTO" | "REQUIRE_GENERIC_PHOTO" | "NOT_REQUIRED";

export interface IProjectAttendancePhotoConfig {
  id: string;
  project_id: string;
  mode: ProjectPhotoMode;
  min_resolution_width: number | null;
  min_resolution_height: number | null;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface CreateProjectAttendancePhotoConfigInput {
  project_id: string;
  mode: ProjectPhotoMode;
  min_resolution_width?: number | null;
  min_resolution_height?: number | null;
}

export interface UpdateProjectAttendancePhotoConfigInput {
  mode?: ProjectPhotoMode;
  min_resolution_width?: number | null;
  min_resolution_height?: number | null;
}

// Project Workshift Config
export type ProjectWorkshiftMode = "FIXED_TIME_WITHIN_WORKSHIFT" | "FIXED_TIME_WITH_ASSIGNED" | "FIXED_TIME_BY_DEFAULT_TIME" | "FLEXIBLE_TIME";

export interface IProjectWorkshiftConfig {
  id: string;
  project_id: string;
  default_start_time: string | null; // time format
  default_end_time: string | null; // time format
  mode: ProjectWorkshiftMode;
  is_limit_checkin_time: boolean;
  is_limit_checkout_time: boolean;
  is_auto_checkout: boolean;
  is_multiple_attendance_allowed: boolean;
  min_checkin_minutes_before: number | null;
  max_checkin_minutes_after: number | null;
  min_checkout_minutes_before: number | null;
  max_checkout_minutes_after: number | null;
  auto_checkout_at_time: string | null; // time format
  allow_access_after_checked_out: boolean;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface CreateProjectWorkshiftConfigInput {
  project_id: string;
  default_start_time?: string | null;
  default_end_time?: string | null;
  mode: ProjectWorkshiftMode;
  is_limit_checkin_time?: boolean;
  is_limit_checkout_time?: boolean;
  is_auto_checkout?: boolean;
  is_multiple_attendance_allowed?: boolean;
  min_checkin_minutes_before?: number | null;
  max_checkin_minutes_after?: number | null;
  min_checkout_minutes_before?: number | null;
  max_checkout_minutes_after?: number | null;
  auto_checkout_at_time?: string | null;
  allow_access_after_checked_out?: boolean;
}

export interface UpdateProjectWorkshiftConfigInput {
  default_start_time?: string | null;
  default_end_time?: string | null;
  mode?: ProjectWorkshiftMode;
  is_limit_checkin_time?: boolean;
  is_limit_checkout_time?: boolean;
  is_auto_checkout?: boolean;
  is_multiple_attendance_allowed?: boolean;
  min_checkin_minutes_before?: number | null;
  max_checkin_minutes_after?: number | null;
  min_checkout_minutes_before?: number | null;
  max_checkout_minutes_after?: number | null;
  auto_checkout_at_time?: string | null;
  allow_access_after_checked_out?: boolean;
}
