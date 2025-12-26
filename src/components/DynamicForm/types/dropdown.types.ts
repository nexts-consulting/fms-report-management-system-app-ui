/**
 * Dynamic Dropdown Types
 * 
 * Types for loading dropdown options from API/Database
 */

/**
 * Dropdown item từ database
 */
export interface DropdownItem {
  id: string;
  project_code: string;
  group_code: string;
  parent: string | null;
  item_code: string;
  item_label: string;
  item_description?: string;
  condition_1?: string | null;
  condition_2?: string | null;
  is_active: boolean;
  extra?: Record<string, any>;
  sort_order: number;
}

/**
 * Config để load dropdown từ API
 */
export interface DynamicDropdownConfig {
  /**
   * Group code để identify dropdown group
   * Ví dụ: "LOCATION", "EQUIPMENT_TYPE", "STATUS"
   */
  groupCode: string;

  /**
   * Có sử dụng condition 1 (location filter) không
   * @default false
   */
  useCondition1?: boolean;

  /**
   * Có sử dụng condition 2 không
   * @default false
   */
  useCondition2?: boolean;

  /**
   * Field name của parent field (cho hierarchical dropdown)
   * Khi field này thay đổi, sẽ load lại child options
   * 
   * @example "province" - khi province thay đổi, load lại district options
   */
  parentField?: string;

  /**
   * Custom filter function (optional)
   */
  filterItems?: (items: DropdownItem[]) => DropdownItem[];

  /**
   * Custom transform function để convert DropdownItem sang SelectOption
   */
  transformItem?: (item: DropdownItem) => {
    label: string;
    value: any;
    disabled?: boolean;
  };

  /**
   * Cache duration in seconds
   * @default 300 (5 minutes)
   */
  cacheDuration?: number;

  /**
   * Show loading state
   * @default true
   */
  showLoading?: boolean;

  /**
   * Error message khi load fail
   */
  errorMessage?: string;
}

/**
 * API Request params để fetch dropdown
 */
export interface FetchDropdownParams {
  projectCode: string;
  groupCode: string;
  parent?: string | null;
  condition1?: string | null;
  condition2?: string | null;
  isActive?: boolean;
}

/**
 * API Response
 */
export interface FetchDropdownResponse {
  success: boolean;
  data: DropdownItem[];
  error?: string;
}

