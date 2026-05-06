import type { IProjectWorkshiftConfig } from "@/types/model";

export const isAssignedWorkshiftMode = (
  config?: IProjectWorkshiftConfig | null,
): boolean => {
  return config?.mode === "FIXED_TIME_WITH_ASSIGNED";
};
