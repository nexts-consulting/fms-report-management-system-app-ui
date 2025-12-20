/**
 * Centralized Model Types and Interfaces
 * This file contains all TypeScript types/interfaces used across the application
 * All service files should import models from this file instead of defining them locally
 */

// ==============================
// ENUMS & TYPES
// ==============================

// Admin Division Type
export type AdminDivisionType = "ADMIN" | "ZONE" | "REGION" | "AREA";

// Location Category Type
export type LocationCategoryType = "GROUP" | "CATEGORY" | "TYPE";

// App Menu Type
export type AppMenuType = "APP" | "ADMIN";

// Filter Logic Operator
export type FilterLogicOperator =
  | "AND"
  | "OR"
  | "IN"
  | "NOT IN"
  | "LIKE"
  | "NOT LIKE"
  | "IS NULL"
  | "IS NOT NULL"
  | "EXISTS"
  | "NOT EXISTS"
  | "GREATER THAN"
  | "LESS THAN"
  | "GREATER THAN OR EQUAL TO"
  | "LESS THAN OR EQUAL TO";

// Workshift Status
export type WorkshiftStatus = "NOT_CHECKED_IN" | "ATTENDED" | "ABSENT";

// Attendance Status
export type AttendanceStatus = "CHECKED_IN" | "CHECKED_OUT" | "AUTO_CHECKED_OUT";

// Timing Status
export type TimingStatus = "ON_TIME" | "LATE" | "EARLY" | "ABSENT";

// Project GPS Mode
export type ProjectGpsMode = "REQUIRED_AT_LOCATION" | "REQUIRED_BUT_NOT_STRICT" | "VISIBLE_OPTIONAL" | "NOT_REQUIRED";

// Project Photo Mode
export type ProjectPhotoMode = "REQUIRE_IDENTITY_VERIFICATION" | "REQUIRE_FACE_PHOTO" | "REQUIRE_GENERIC_PHOTO" | "NOT_REQUIRED";

// Project Workshift Mode
export type ProjectWorkshiftMode = "FIXED_TIME_WITHIN_WORKSHIFT" | "FIXED_TIME_WITH_ASSIGNED" | "FIXED_TIME_BY_DEFAULT_TIME" | "FLEXIBLE_TIME";

// Tenant Project Status
export type TenantProjectStatus = "ACTIVE" | "INACTIVE" | "ENDED";

// ==============================
// ADMIN DIVISION MODELS
// ==============================

export interface IAdminDivision {
  id: number;
  project_code: string;
  code: string | null;
  name: string;
  level: number;
  type: AdminDivisionType;
  parent_id: number | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface IAdminDivisionWithChildren extends IAdminDivision {
  children?: IAdminDivisionWithChildren[];
}

// ==============================
// LOCATION MODELS
// ==============================

export interface ILocation {
  id: number;
  project_code: string;
  code: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  checkin_radius_meters: number;
  admin_division_id: number | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface GetLocationsParams {
  project_code: string;
  search?: string;
  admin_division_id?: number | null;
  admin_division_ids?: number[];
  location_ids?: number[];
  limit?: number;
  offset?: number;
}

// ==============================
// APP MENU MODELS
// ==============================

export interface IAppMenu {
  id: number;
  project_code: string;
  code: string;
  name: string;
  menu_type: AppMenuType;
  icon: string | null;
  path: string | null;
  parent_id: number | null;
  sort_order: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface IAppMenuWithChildren extends IAppMenu {
  children?: IAppMenuWithChildren[];
}

// App Menu Permissions
export interface IAppMenuRolePermission {
  id: number;
  menu_id: number;
  role_code: string;
  permission: string;
}

export interface IAppMenuUserPermission {
  id: number;
  menu_id: number;
  username: string;
  permission: string;
}

// ==============================
// WORKSHIFT MODELS
// ==============================

export interface IWorkshift {
  id: number;
  project_code: string;
  name: string;
  status: WorkshiftStatus;
  start_time: string; // timestamp
  end_time: string; // timestamp
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface GetWorkshiftsParams {
  project_code: string;
  search?: string;
  status?: WorkshiftStatus;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

// Location Workshift Assignment
export interface ILocationWorkshift {
  id: number;
  project_code: string;
  location_id: number;
  workshift_id: number;
  user_attended_count: number;
  created_at: string;
  updated_at: string;
  // Joined data (optional)
  location_name?: string;
  location_code?: string;
  location_address?: string;
  location_latitude?: number;
  location_longitude?: number;
  location_checkin_radius_meters?: number;
  location_admin_division_id?: number;
  location_metadata?: Record<string, any>;
  location_created_at?: string;
  location_updated_at?: string;
  workshift_name?: string;
  workshift_start_time?: string;
  workshift_end_time?: string;
}

export interface GetLocationWorkshiftsParams {
  project_code: string;
  location_id?: number;
  workshift_id?: number;
  limit?: number;
  offset?: number;
}

// User Workshift Assignment
export interface IUserWorkshift {
  id: number;
  project_code: string;
  username: string;
  workshift_id: number;
  created_at: string;
  updated_at: string;
  // Joined data (optional)
  workshift_name?: string;
  workshift_start_time?: string;
  workshift_end_time?: string;
  workshift_status?: WorkshiftStatus;
  location_name?: string;
  location_code?: string;
  location_address?: string;
  location_latitude?: number;
  location_longitude?: number;
  location_checkin_radius_meters?: number;
  location_admin_division_id?: number;
  location_metadata?: Record<string, any>;
}

export interface GetUserWorkshiftsParams {
  project_code: string;
  username?: string;
  workshift_id?: number;
  limit?: number;
  offset?: number;
}

// Working Shift (UI Model - includes location info)
export interface IWorkingShiftLocation {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  location: ILocation;
}

// ==============================
// ATTENDANCE MODELS
// ==============================

export interface IAttendance {
  id: number;
  project_code: string;
  username: string;
  workshift_id: number | null;
  workshift_name: string;
  shift_start_time: string | null;
  shift_end_time: string | null;
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

// ==============================
// PROJECT CONFIG MODELS
// ==============================

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

// Project Checkin Flow
export interface IProjectCheckinFlow {
  id: string;
  project_id: string;
  require_survey: boolean;
  require_pre_shift_task: boolean;
  require_gps_verification: boolean;
  require_photo_verification: boolean;
  require_post_shift_task: boolean;
  created_at: string;
  updated_at: string;
  version: number;
}

// Project GPS Config
export interface IProjectGpsConfig {
  id: string;
  project_id: string;
  mode: ProjectGpsMode;
  gps_radius_meters: number;
  created_at: string;
  updated_at: string;
  version: number;
}

// Project Attendance Photo Config
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

// Project Workshift Config
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

// Project All Configs
export interface IProjectAllConfigs {
  metadata: IProjectMetadata[];
  authConfig: IProjectAuthConfig | null;
  checkinFlow: IProjectCheckinFlow | null;
  gpsConfig: IProjectGpsConfig | null;
  attendancePhotoConfig: IProjectAttendancePhotoConfig | null;
  workshiftConfig: IProjectWorkshiftConfig | null;
}

// ==============================
// TENANT MODELS
// ==============================

export interface ITenant {
  id: string;
  code: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  address: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  start_date: string;
  end_date: string;
  keycloak_base_url: string;
  keycloak_realm: string;
  kong_gateway_url: string;
  status: string;
  metadata: any | null;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface ITenantProject {
  id: string;
  tenant_id: string;
  client_code: string | null;
  client_name: string | null;
  code: string;
  name: string;
  status: TenantProjectStatus;
  start_date: string | null;
  end_date: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  banner_url: string | null;
  created_at: string;
  updated_at: string;
  version: number;
}

// ==============================
// KEYCLOAK MODELS
// ==============================

export interface KeycloakUser {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  emailVerified?: boolean;
  createdTimestamp?: number;
  attributes?: Record<string, string[]>;
  groups?: string[];
  realmRoles?: string[];
  clientRoles?: Record<string, string[]>;
}

export interface GetKeycloakUsersParams {
  search?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  exact?: boolean;
  first?: number; // pagination offset
  max?: number; // pagination limit
}

export interface KeycloakGroup {
  id: string;
  name: string;
  path: string;
  subGroups?: KeycloakGroup[];
}

export interface GetKeycloakGroupsParams {
  search?: string;
  first?: number;
  max?: number;
}
