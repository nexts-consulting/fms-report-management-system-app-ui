import { supabaseFmsService } from "@/services/supabase";

export type AppMenuType = "APP" | "ADMIN";

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

export interface CreateAppMenuInput {
  project_code: string;
  code: string;
  name: string;
  menu_type?: AppMenuType;
  icon?: string | null;
  path?: string | null;
  parent_id?: number | null;
  sort_order?: number;
  metadata?: Record<string, any>;
}

export interface UpdateAppMenuInput {
  name?: string;
  menu_type?: AppMenuType;
  icon?: string | null;
  path?: string | null;
  parent_id?: number | null;
  sort_order?: number;
  metadata?: Record<string, any>;
}

/**
 * Get all app menus for a project
 */
export const httpRequestGetAppMenus = async (
  projectCode: string,
): Promise<IAppMenu[]> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_app_menus")
      .select("*")
      .eq("project_code", projectCode)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    return (data || []) as IAppMenu[];
  } catch (error) {
    console.error("Error fetching app menus:", error);
    throw error;
  }
};

/**
 * Get app menu by ID
 */
export const httpRequestGetAppMenuById = async (
  id: number,
): Promise<IAppMenu | null> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_app_menus")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data as IAppMenu;
  } catch (error) {
    console.error("Error fetching app menu by ID:", error);
    throw error;
  }
};

/**
 * Create a new app menu
 */
export const httpRequestCreateAppMenu = async (
  input: CreateAppMenuInput,
): Promise<IAppMenu> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_app_menus")
      .insert({
        ...input,
        menu_type: input.menu_type || "APP",
        sort_order: input.sort_order || 0,
        metadata: input.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as IAppMenu;
  } catch (error) {
    console.error("Error creating app menu:", error);
    throw error;
  }
};

/**
 * Update an app menu
 */
export const httpRequestUpdateAppMenu = async (
  id: number,
  input: UpdateAppMenuInput,
): Promise<IAppMenu> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_app_menus")
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as IAppMenu;
  } catch (error) {
    console.error("Error updating app menu:", error);
    throw error;
  }
};

/**
 * Delete an app menu
 */
export const httpRequestDeleteAppMenu = async (id: number): Promise<void> => {
  try {
    const { error } = await supabaseFmsService.client
      .from("fms_mst_app_menus")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting app menu:", error);
    throw error;
  }
};

/**
 * Build tree structure from flat list of app menus
 */
export const buildAppMenuTree = (menus: IAppMenu[]): IAppMenuWithChildren[] => {
  const menuMap = new Map<number, IAppMenuWithChildren>();
  const rootMenus: IAppMenuWithChildren[] = [];

  // First pass: create map of all menus
  menus.forEach((menu) => {
    menuMap.set(menu.id, { ...menu, children: [] });
  });

  // Second pass: build tree structure
  menus.forEach((menu) => {
    const menuWithChildren = menuMap.get(menu.id)!;
    if (menu.parent_id && menuMap.has(menu.parent_id)) {
      const parent = menuMap.get(menu.parent_id)!;
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(menuWithChildren);
    } else {
      rootMenus.push(menuWithChildren);
    }
  });

  // Sort children by sort_order
  const sortChildren = (items: IAppMenuWithChildren[]) => {
    items.sort((a, b) => a.sort_order - b.sort_order);
    items.forEach((item) => {
      if (item.children) {
        sortChildren(item.children);
      }
    });
  };

  sortChildren(rootMenus);
  return rootMenus;
};

