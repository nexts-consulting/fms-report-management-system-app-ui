// Workshift Status
export type WorkshiftStatus = "NOT_CHECKED_IN" | "ATTENDED" | "ABSENT";

// Workshift
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

export interface CreateWorkshiftInput {
  project_code: string;
  name: string;
  start_time: string; // timestamp
  end_time: string; // timestamp
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateWorkshiftInput {
  name?: string;
  status?: WorkshiftStatus;
  start_time?: string;
  end_time?: string;
  is_active?: boolean;
  metadata?: Record<string, any>;
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
  // Joined data
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

export interface CreateLocationWorkshiftInput {
  project_code: string;
  location_id: number;
  workshift_id: number;
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
  // Joined data
  workshift_name?: string;
  workshift_start_time?: string;
  workshift_end_time?: string;
  workshift_status?: WorkshiftStatus;
}

export interface CreateUserWorkshiftInput {
  project_code: string;
  username: string;
  workshift_id: number;
}

export interface GetUserWorkshiftsParams {
  project_code: string;
  username?: string;
  workshift_id?: number;
  limit?: number;
  offset?: number;
}

