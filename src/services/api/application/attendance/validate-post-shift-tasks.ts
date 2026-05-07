import { supabaseFmsService } from "@/services/supabase";
import { IProjectMetadata, IProjectCheckinFlow } from "@/types/model";

interface PostShiftTaskRule {
  field: string;
  table: string;
  error_mesage: string;
  roles_apply?: Array<string | null>;
}

export interface ValidatePostShiftTasksParams {
  attendanceId: number;
  projectCheckinFlow: IProjectCheckinFlow | null;
  projectMetadata: IProjectMetadata[] | null;
  userRoles?: string[];
}

export interface ValidatePostShiftTasksResult {
  valid: boolean;
  errors: string[];
}

function shouldApplyRuleByRoles(rule: PostShiftTaskRule, userRoles: string[]): boolean {
  if (!Array.isArray(rule.roles_apply) || rule.roles_apply.length === 0) {
    return true;
  }

  const allowedRoles = rule.roles_apply
    .filter((role): role is string => typeof role === "string")
    .map((role) => role.trim())
    .filter(Boolean);

  const applyWhenNoRole = rule.roles_apply.some((role) => role === null);
  const normalizedUserRoles = userRoles.map((role) => role.trim()).filter(Boolean);

  if (normalizedUserRoles.length === 0) {
    return applyWhenNoRole;
  }

  if (allowedRoles.length === 0) {
    return false;
  }

  return normalizedUserRoles.some((role) => allowedRoles.includes(role));
}

/**
 * Validates post-shift tasks based on project checkin flow and metadata config.
 *
 * If `require_post_shift_task` is enabled, finds the `require_post_shift_task_config`
 * metadata entry and checks each rule by querying the specified Supabase table.
 * A rule passes when at least one record exists with the given field matching attendanceId.
 */
export async function validatePostShiftTasks(
  params: ValidatePostShiftTasksParams,
): Promise<ValidatePostShiftTasksResult> {
  const { attendanceId, projectCheckinFlow, projectMetadata, userRoles = [] } = params;

  if (!projectCheckinFlow?.require_post_shift_task) {
    return { valid: true, errors: [] };
  }

  const config = projectMetadata?.find((m) => m.key === "require_post_shift_task_config");
  if (!config || !config.metadata) {
    return { valid: true, errors: [] };
  }

  const rules: PostShiftTaskRule[] = Array.isArray(config.metadata) ? config.metadata : [];
  if (rules.length === 0) {
    return { valid: true, errors: [] };
  }

  const errors: string[] = [];

  for (const rule of rules) {
    if (!shouldApplyRuleByRoles(rule, userRoles)) {
      continue;
    }

    const { field, table, error_mesage } = rule;
    if (!field || !table) continue;

    const { count, error } = await supabaseFmsService.client
      .from(table)
      .select("*", { count: "exact", head: true })
      .eq(field, attendanceId);

    if (error || (count ?? 0) === 0) {
      errors.push(error_mesage || "Chưa hoàn thành công việc sau ca");
    }
  }

  return { valid: errors.length === 0, errors };
}
