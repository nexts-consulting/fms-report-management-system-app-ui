import { supabaseFmsService } from "@/services/supabase";

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

/**
 * Get role permissions for an app menu
 */
export const httpRequestGetAppMenuRolePermissions = async (
  menuId: number,
): Promise<IAppMenuRolePermission[]> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_app_menu_role_permissions")
      .select("*")
      .eq("menu_id", menuId);

    if (error) {
      throw error;
    }

    return (data || []) as IAppMenuRolePermission[];
  } catch (error) {
    console.error("Error fetching app menu role permissions:", error);
    throw error;
  }
};

/**
 * Get user permissions for an app menu
 */
export const httpRequestGetAppMenuUserPermissions = async (
  menuId: number,
): Promise<IAppMenuUserPermission[]> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_app_menu_user_permissions")
      .select("*")
      .eq("menu_id", menuId);

    if (error) {
      throw error;
    }

    return (data || []) as IAppMenuUserPermission[];
  } catch (error) {
    console.error("Error fetching app menu user permissions:", error);
    throw error;
  }
};

/**
 * Assign role permissions to an app menu
 */
export const httpRequestAssignAppMenuRolePermissions = async (
  menuId: number,
  roleCodes: string[],
  permission: string = "ACCESS",
): Promise<void> => {
  try {
    // First, delete all existing role permissions
    const { error: deleteError } = await supabaseFmsService.client
      .from("fms_mst_app_menu_role_permissions")
      .delete()
      .eq("menu_id", menuId);

    if (deleteError) {
      throw deleteError;
    }

    // Then, insert new permissions
    if (roleCodes.length > 0) {
      const permissions = roleCodes.map((roleCode) => ({
        menu_id: menuId,
        role_code: roleCode,
        permission,
      }));

      const { error: insertError } = await supabaseFmsService.client
        .from("fms_mst_app_menu_role_permissions")
        .insert(permissions);

      if (insertError) {
        throw insertError;
      }
    }
  } catch (error) {
    console.error("Error assigning app menu role permissions:", error);
    throw error;
  }
};

/**
 * Assign user permissions to an app menu
 */
export const httpRequestAssignAppMenuUserPermissions = async (
  menuId: number,
  usernames: string[],
  permission: string = "ACCESS",
): Promise<void> => {
  try {
    // First, delete all existing user permissions
    const { error: deleteError } = await supabaseFmsService.client
      .from("fms_mst_app_menu_user_permissions")
      .delete()
      .eq("menu_id", menuId);

    if (deleteError) {
      throw deleteError;
    }

    // Then, insert new permissions
    if (usernames.length > 0) {
      const permissions = usernames.map((username) => ({
        menu_id: menuId,
        username,
        permission,
      }));

      const { error: insertError } = await supabaseFmsService.client
        .from("fms_mst_app_menu_user_permissions")
        .insert(permissions);

      if (insertError) {
        throw insertError;
      }
    }
  } catch (error) {
    console.error("Error assigning app menu user permissions:", error);
    throw error;
  }
};

