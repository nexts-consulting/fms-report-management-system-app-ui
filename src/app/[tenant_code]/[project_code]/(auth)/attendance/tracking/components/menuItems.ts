import { IAppMenu } from "@/types/model";
import { useAppMenuContext } from "@/contexts/app-menu.context";

/**
 * Hook to get app menu items from context
 * Uses AppMenuProvider which handles caching via React Query and localStorage
 * 
 * @returns Object with menu items, loading state, and error
 */
export const useAppMenuItems = () => {
  return useAppMenuContext();
};
