# Dynamic Dropdown Integration Guide

## Overview

DynamicForm giờ hỗ trợ load dropdown options từ Supabase database thay vì hard-code trong JSON config!

## Database Schema

```sql
CREATE TABLE fms_mst_report_dropdown (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  project_code TEXT NOT NULL,
  group_code TEXT NOT NULL,
  parent_id UUID,
  item_code TEXT NOT NULL,
  item_label TEXT NOT NULL,
  item_description TEXT,
  condition_1 TEXT,
  condition_2 TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  extra JSONB DEFAULT '{}'
);
```

## Features

- ✅ **Auto-load** from Supabase
- ✅ **Tenant & Project** scoped
- ✅ **Parent-Child** hierarchical dropdowns
- ✅ **Condition 1** filter (location from localStorage)
- ✅ **Condition 2** filter (future)
- ✅ **Caching** via React hooks
- ✅ **JSON-safe** config

## Usage

### 1. Static Options (Old Way)

```json
{
  "name": "country",
  "type": "select",
  "label": "Country",
  "options": [
    { "label": "Vietnam", "value": "vn" },
    { "label": "USA", "value": "us" }
  ]
}
```

### 2. Dynamic Dropdown (New Way)

```json
{
  "name": "equipmentType",
  "type": "select",
  "label": "Equipment Type",
  "options": {
    "groupCode": "EQUIPMENT_TYPE"
  }
}
```

## Configuration Options

### Basic Dynamic Dropdown

```json
{
  "name": "status",
  "type": "select",
  "label": "Status",
  "options": {
    "groupCode": "STATUS"
  }
}
```

### With Condition 1 (Location Filter)

```json
{
  "name": "equipment",
  "type": "select",
  "label": "Equipment",
  "options": {
    "groupCode": "EQUIPMENT",
    "useCondition1": true
  }
}
```

Component sẽ tự động lấy `condition_1` từ `localStorage.getItem('selected_location')`.

### Parent-Child Dropdown

```json
{
  "name": "province",
  "type": "select",
  "label": "Province",
  "options": {
    "groupCode": "PROVINCE"
  }
},
{
  "name": "district",
  "type": "select",
  "label": "District",
  "options": {
    "groupCode": "DISTRICT",
    "parentField": "province"
  }
}
```

Khi user chọn province, district sẽ tự động reload với `parent_id = selected province value`.

### Multi-Select Dynamic

```json
{
  "name": "skills",
  "type": "multiselect",
  "label": "Skills",
  "maxSelections": 10,
  "options": {
    "groupCode": "SKILLS"
  }
}
```

## Complete Examples

### Example 1: Equipment Type Dropdown

```json
{
  "name": "equipmentType",
  "type": "select",
  "label": "Equipment Type",
  "placeholder": "Select equipment type",
  "required": true,
  "span": 12,
  "options": {
    "groupCode": "EQUIPMENT_TYPE"
  },
  "validation": [
    { "type": "required", "message": "Equipment type is required" }
  ]
}
```

**Database data:**
```sql
INSERT INTO fms_mst_report_dropdown (tenant_id, project_code, group_code, item_code, item_label, sort_order)
VALUES
  ('tenant-123', 'proj-456', 'EQUIPMENT_TYPE', 'EXCAVATOR', 'Excavator', 1),
  ('tenant-123', 'proj-456', 'EQUIPMENT_TYPE', 'TRUCK', 'Truck', 2),
  ('tenant-123', 'proj-456', 'EQUIPMENT_TYPE', 'CRANE', 'Crane', 3);
```

### Example 2: Location with Condition 1

```json
{
  "name": "location",
  "type": "select",
  "label": "Location",
  "placeholder": "Select location",
  "span": 12,
  "options": {
    "groupCode": "LOCATION",
    "useCondition1": true
  }
}
```

**Database data:**
```sql
INSERT INTO fms_mst_report_dropdown (tenant_id, project_code, group_code, item_code, item_label, condition_1, sort_order)
VALUES
  ('tenant-123', 'proj-456', 'LOCATION', 'HN_SITE_1', 'Hanoi Site 1', 'HANOI', 1),
  ('tenant-123', 'proj-456', 'LOCATION', 'HN_SITE_2', 'Hanoi Site 2', 'HANOI', 2),
  ('tenant-123', 'proj-456', 'LOCATION', 'HCM_SITE_1', 'Ho Chi Minh Site 1', 'HCM', 3);
```

**localStorage:**
```javascript
localStorage.setItem('selected_location', JSON.stringify({ code: 'HANOI' }));
```

Component sẽ chỉ load sites có `condition_1 = 'HANOI'`.

### Example 3: Province -> District Hierarchy

```json
{
  "fields": [
    {
      "name": "province",
      "type": "select",
      "label": "Province",
      "placeholder": "Select province",
      "span": 6,
      "options": {
        "groupCode": "PROVINCE"
      }
    },
    {
      "name": "district",
      "type": "select",
      "label": "District",
      "placeholder": "Select district",
      "span": 6,
      "options": {
        "groupCode": "DISTRICT",
        "parentField": "province"
      }
    }
  ]
}
```

**Database data:**
```sql
-- Provinces (parent_id = NULL)
INSERT INTO fms_mst_report_dropdown (id, tenant_id, project_code, group_code, item_code, item_label, parent_id, sort_order)
VALUES
  ('prov-1', 'tenant-123', 'proj-456', 'PROVINCE', 'HN', 'Hanoi', NULL, 1),
  ('prov-2', 'tenant-123', 'proj-456', 'PROVINCE', 'HCM', 'Ho Chi Minh', NULL, 2);

-- Districts (parent_id = province id)
INSERT INTO fms_mst_report_dropdown (tenant_id, project_code, group_code, item_code, item_label, parent_id, sort_order)
VALUES
  ('tenant-123', 'proj-456', 'DISTRICT', 'HN_DIST_1', 'Ba Dinh', 'prov-1', 1),
  ('tenant-123', 'proj-456', 'DISTRICT', 'HN_DIST_2', 'Hoan Kiem', 'prov-1', 2),
  ('tenant-123', 'proj-456', 'DISTRICT', 'HCM_DIST_1', 'District 1', 'prov-2', 3),
  ('tenant-123', 'proj-456', 'DISTRICT', 'HCM_DIST_2', 'District 2', 'prov-2', 4);
```

### Example 4: Multi-Select Skills

```json
{
  "name": "technician_skills",
  "type": "multiselect",
  "label": "Technician Skills",
  "placeholder": "Select skills",
  "span": 12,
  "maxSelections": 10,
  "options": {
    "groupCode": "TECHNICIAN_SKILLS"
  }
}
```

## How It Works

### 1. Auto Tenant & Project

Component tự động lấy `tenant_id` và `project_code` từ URL:
```
/[tenant_code]/[project_code]/(auth)/report/...
              ↓
tenant_id: URL segment 1
project_code: URL segment 2
```

### 2. Query Construction

```typescript
supabase
  .from("fms_mst_report_dropdown")
  .select("*")
  .eq("tenant_id", tenantId)
  .eq("project_code", projectCode)
  .eq("group_code", "EQUIPMENT_TYPE")
  .eq("is_active", true)
  .order("sort_order");
```

### 3. With Condition 1

```typescript
const locationCode = getLocationCode(); // From localStorage

supabase
  .from("fms_mst_report_dropdown")
  .select("*")
  ...
  .eq("condition_1", locationCode);
```

### 4. With Parent Filter

```typescript
const parentValue = formData["province"]; // Get from form

supabase
  .from("fms_mst_report_dropdown")
  .select("*")
  ...
  .eq("parent_id", parentValue);
```

## Data Transformation

Database item → Select option:

```typescript
// Database
{
  id: "uuid-123",
  item_code: "EXCAVATOR",
  item_label: "Excavator",
  is_active: true
}

// Transform to
{
  value: "EXCAVATOR",      // item_code
  label: "Excavator",      // item_label
  disabled: false          // !is_active
}
```

## Best Practices

### 1. Group Code Naming

Use SCREAMING_SNAKE_CASE:
```
✅ EQUIPMENT_TYPE
✅ WORK_ORDER_STATUS
✅ TECHNICIAN_SKILLS

❌ equipment-type
❌ workOrderStatus
❌ TechnicianSkills
```

### 2. Item Code Naming

Use SCREAMING_SNAKE_CASE or code format:
```
✅ EXCAVATOR
✅ IN_PROGRESS
✅ HN_SITE_1

❌ excavator
❌ In Progress
❌ hn-site-1
```

### 3. Sort Order

Always set meaningful sort_order:
```sql
INSERT ... VALUES (..., 1),  -- Most important first
                  (..., 2),
                  (..., 3);
```

### 4. Condition 1 Structure

localStorage key: `selected_location`

```javascript
{
  code: "HANOI",           // Used as condition_1
  name: "Hanoi Branch",
  // ... other fields
}
```

### 5. Parent-Child Structure

```sql
-- Parent (parent_id = NULL)
INSERT ... VALUES ('parent-uuid', ..., NULL, ...);

-- Children (parent_id = parent UUID)
INSERT ... VALUES (..., 'parent-uuid', ...);
```

## Migration from Static to Dynamic

### Before (Static)

```json
{
  "name": "status",
  "type": "select",
  "options": [
    { "label": "Pending", "value": "PENDING" },
    { "label": "In Progress", "value": "IN_PROGRESS" },
    { "label": "Completed", "value": "COMPLETED" }
  ]
}
```

### After (Dynamic)

**1. Insert data to database:**
```sql
INSERT INTO fms_mst_report_dropdown (tenant_id, project_code, group_code, item_code, item_label, sort_order)
VALUES
  ('tenant-123', 'proj-456', 'STATUS', 'PENDING', 'Pending', 1),
  ('tenant-123', 'proj-456', 'STATUS', 'IN_PROGRESS', 'In Progress', 2),
  ('tenant-123', 'proj-456', 'STATUS', 'COMPLETED', 'Completed', 3);
```

**2. Update JSON config:**
```json
{
  "name": "status",
  "type": "select",
  "options": {
    "groupCode": "STATUS"
  }
}
```

Done! 🎉

## API Reference

### DynamicDropdownConfig

```typescript
interface DynamicDropdownConfig {
  groupCode: string;           // Required: GROUP_CODE in database
  useCondition1?: boolean;     // Optional: Use location filter
  useCondition2?: boolean;     // Optional: Future use
  parentField?: string;        // Optional: Parent field name for hierarchy
}
```

### DropdownItem (Database Schema)

```typescript
interface DropdownItem {
  id: string;
  tenant_id: string;
  project_code: string;
  group_code: string;
  parent_id: string | null;
  item_code: string;
  item_label: string;
  item_description?: string;
  condition_1?: string | null;
  condition_2?: string | null;
  is_active: boolean;
  sort_order: number;
  extra?: Record<string, any>;
}
```

## Troubleshooting

### Options không load

**Check:**
1. Database có data với đúng `tenant_id`, `project_code`, `group_code`
2. `is_active = true`
3. Supabase service đã init
4. Console có error gì không

### Parent-Child không hoạt động

**Check:**
1. `parentField` match với field name
2. `parent_id` trong database là UUID của parent item
3. Parent field đã có value chưa

### Condition 1 không filter

**Check:**
1. localStorage có `selected_location` chưa
2. `selected_location.code` match với `condition_1` trong database
3. `useCondition1: true` đã set chưa

## Summary

✅ **Easy**: Chỉ cần config `groupCode`  
✅ **Flexible**: Support parent-child, conditions  
✅ **Auto**: Tự động lấy tenant, project từ URL  
✅ **JSON-safe**: Có thể lưu trong database  
✅ **Real-time**: Hook tự động reload khi dependencies thay đổi  

Perfect để quản lý dropdowns trong hệ thống lớn! 🚀

