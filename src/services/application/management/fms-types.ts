/**
 * Centralized FMS Types and Interfaces
 * This file exports all TypeScript types/interfaces for FMS database tables
 * Based on SQL schemas: 2. fms-system.sql and 3. fms-workshift.sql
 */

// ==============================
// ENUMS
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

// ==============================
// LOCATION RELATED TABLES
// ==============================

// fms_mst_admin_divisions
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

// fms_mst_locations
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

// fms_mst_location_categories
export interface ILocationCategory {
  id: number;
  project_code: string;
  code: string;
  name: string;
  description: string | null;
  parent_id: number | null;
  category_type: LocationCategoryType;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ILocationCategoryWithChildren extends ILocationCategory {
  children?: ILocationCategoryWithChildren[];
}

// fms_mst_location_category_assignments
export interface ILocationCategoryAssignment {
  location_id: number;
  category_id: number;
}

// fms_mst_location_admin_divisions
export interface ILocationAdminDivision {
  location_id: number;
  admin_division_id: number;
}

// ==============================
// APP MENU RELATED TABLES
// ==============================

// fms_mst_app_menus
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

// fms_mst_app_menu_role_permissions
export interface IAppMenuRolePermission {
  id: number;
  menu_id: number;
  role_code: string;
  permission: string;
}

// fms_mst_app_menu_user_permissions
export interface IAppMenuUserPermission {
  id: number;
  menu_id: number;
  username: string;
  permission: string;
}

// ==============================
// FILTER RELATED TABLES
// ==============================

// fms_mst_filter_definitions
export interface IFilterDefinition {
  id: number;
  project_code: string;
  table_name: string;
  column_name: string;
  operator: string;
  value: string;
  logic_operator: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// fms_mst_filter_group_filters
export interface IFilterGroupFilter {
  id: number;
  group_code: string;
  project_code: string;
  filter_definition_id: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// fms_mst_filter_user_filters
export interface IFilterUserFilter {
  id: number;
  username: string;
  project_code: string;
  filter_definition_id: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ==============================
// WORKShift RELATED TABLES
// ==============================

// fms_app_data_workshifts
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

// fms_app_data_location_workshifts
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
  workshift_name?: string;
  workshift_start_time?: string;
  workshift_end_time?: string;
}

// fms_app_data_user_workshifts
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
}

// fms_app_data_attendance
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

