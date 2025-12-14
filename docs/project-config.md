# Project Config - Tài liệu Hệ thống

## Tổng quan

Project Config là hệ thống quản lý cấu hình cho từng project trong FMS Report Management System. Mỗi project có thể có các cấu hình riêng biệt để điều chỉnh hành vi của ứng dụng.

## Cấu trúc

Hệ thống Project Config bao gồm 6 loại cấu hình chính:

1. **Project Metadata** - Dữ liệu metadata tùy chỉnh
2. **Project Auth Config** - Cấu hình xác thực (Keycloak)
3. **Project Checkin Flow** - Cấu hình luồng check-in
4. **Project GPS Config** - Cấu hình GPS và vị trí
5. **Project Attendance Photo Config** - Cấu hình chụp ảnh khi điểm danh
6. **Project Workshift Config** - Cấu hình ca làm việc

---

## 1. Project Metadata

### Mục đích
Lưu trữ các metadata tùy chỉnh dạng key-value cho project. Một project có thể có nhiều metadata entries.

### Cấu trúc Types

```typescript
interface IProjectMetadata {
  id: string;                    // Unique ID
  project_id: string;            // ID của project
  key: string;                   // Key của metadata
  value: string | null;          // Giá trị (có thể là JSON string)
  metadata: Record<string, any> | null;  // Metadata bổ sung
  created_at: string;            // Thời gian tạo
  updated_at: string;            // Thời gian cập nhật
  version: number;              // Version để optimistic locking
}
```

### Cách hoạt động
- Một project có thể có nhiều metadata entries
- Mỗi entry có một `key` duy nhất trong phạm vi project
- `value` có thể là string hoặc JSON string
- `metadata` là object JSON để lưu thông tin bổ sung

### API Functions
- `httpRequestGetProjectMetadata(projectId)` - Lấy tất cả metadata của project
- `httpRequestCreateProjectMetadata(input)` - Tạo metadata mới
- `httpRequestUpdateProjectMetadata(id, input)` - Cập nhật metadata
- `httpRequestDeleteProjectMetadata(id)` - Xóa metadata

---

## 2. Project Auth Config

### Mục đích
Cấu hình xác thực Keycloak cho project. Mỗi project chỉ có một auth config.

### Cấu trúc Types

```typescript
interface IProjectAuthConfig {
  id: string;                              // Unique ID
  project_id: string;                      // ID của project (unique)
  keycloak_client_id: string;              // Keycloak Client ID
  keycloak_client_secret: string | null;    // Keycloak Client Secret
  keycloak_redirect_uri: string | null;    // Redirect URI sau khi login
  created_at: string;
  updated_at: string;
  version: number;
}
```

### Cách hoạt động
- Mỗi project có một auth config duy nhất (one-to-one)
- Sử dụng `upsert` để tạo hoặc cập nhật (dựa trên `project_id`)
- Client secret có thể null nếu sử dụng public client

### API Functions
- `httpRequestGetProjectAuthConfig(projectId)` - Lấy auth config
- `httpRequestUpsertProjectAuthConfig(input)` - Tạo hoặc cập nhật

---

## 3. Project Checkin Flow

### Mục đích
Điều khiển các bước trong quy trình check-in của nhân viên.

### Cấu trúc Types

```typescript
interface IProjectCheckinFlow {
  id: string;
  project_id: string;                      // Unique per project
  require_survey: boolean;                 // Bắt buộc khảo sát trước khi check-in
  require_pre_shift_task: boolean;         // Bắt buộc task trước ca
  require_gps_at_location: boolean;        // Bắt buộc GPS tại địa điểm
  require_attendance: boolean;              // Bắt buộc điểm danh
  require_post_shift_task: boolean;         // Bắt buộc task sau ca
  created_at: string;
  updated_at: string;
  version: number;
}
```

### Cách hoạt động
- Mỗi project có một checkin flow config duy nhất
- Các flag boolean điều khiển từng bước trong flow
- Flow thực thi theo thứ tự:
  1. Survey (nếu `require_survey = true`)
  2. Pre-shift Task (nếu `require_pre_shift_task = true`)
  3. GPS Verification (nếu `require_gps_at_location = true`)
  4. Attendance (nếu `require_attendance = true`)
  5. Post-shift Task (nếu `require_post_shift_task = true`)

### API Functions
- `httpRequestGetProjectCheckinFlow(projectId)` - Lấy checkin flow config
- `httpRequestUpsertProjectCheckinFlow(input)` - Tạo hoặc cập nhật

---

## 4. Project GPS Config

### Mục đích
Cấu hình yêu cầu GPS và bán kính cho phép khi check-in.

### Cấu trúc Types

```typescript
type ProjectGpsMode = 
  | "REQUIRED_AT_LOCATION"      // Bắt buộc tại địa điểm, strict
  | "REQUIRED_BUT_NOT_STRICT"   // Bắt buộc nhưng không strict
  | "VISIBLE_OPTIONAL"          // Hiển thị nhưng không bắt buộc
  | "NOT_REQUIRED";             // Không yêu cầu

interface IProjectGpsConfig {
  id: string;
  project_id: string;                      // Unique per project
  mode: ProjectGpsMode;                     // Chế độ GPS
  gps_radius_meters: number;                // Bán kính cho phép (mét)
  is_required: boolean;                     // Có bắt buộc hay không
  created_at: string;
  updated_at: string;
  version: number;
}
```

### Cách hoạt động
- **REQUIRED_AT_LOCATION**: Nhân viên phải ở trong bán kính `gps_radius_meters` mới check-in được
- **REQUIRED_BUT_NOT_STRICT**: Yêu cầu GPS nhưng cho phép linh hoạt hơn
- **VISIBLE_OPTIONAL**: Hiển thị GPS nhưng không bắt buộc
- **NOT_REQUIRED**: Không yêu cầu GPS

### API Functions
- `httpRequestGetProjectGpsConfig(projectId)` - Lấy GPS config
- `httpRequestUpsertProjectGpsConfig(input)` - Tạo hoặc cập nhật

---

## 5. Project Attendance Photo Config

### Mục đích
Cấu hình yêu cầu chụp ảnh khi điểm danh và độ phân giải tối thiểu.

### Cấu trúc Types

```typescript
type ProjectPhotoMode =
  | "REQUIRE_IDENTITY_VERIFICATION"  // Yêu cầu xác minh danh tính (chụp mặt)
  | "REQUIRE_FACE_PHOTO"             // Yêu cầu ảnh mặt
  | "REQUIRE_GENERIC_PHOTO"          // Yêu cầu ảnh chung
  | "NOT_REQUIRED";                  // Không yêu cầu

interface IProjectAttendancePhotoConfig {
  id: string;
  project_id: string;                      // Unique per project
  mode: ProjectPhotoMode;                  // Chế độ chụp ảnh
  min_resolution_width: number | null;     // Độ rộng tối thiểu (pixels)
  min_resolution_height: number | null;    // Độ cao tối thiểu (pixels)
  created_at: string;
  updated_at: string;
  version: number;
}
```

### Cách hoạt động
- **REQUIRE_IDENTITY_VERIFICATION**: Yêu cầu chụp ảnh để xác minh danh tính (có thể dùng face recognition)
- **REQUIRE_FACE_PHOTO**: Yêu cầu ảnh mặt rõ ràng
- **REQUIRE_GENERIC_PHOTO**: Chỉ cần ảnh chung, không cần mặt
- **NOT_REQUIRED**: Không yêu cầu chụp ảnh

### API Functions
- `httpRequestGetProjectAttendancePhotoConfig(projectId)` - Lấy photo config
- `httpRequestUpsertProjectAttendancePhotoConfig(input)` - Tạo hoặc cập nhật

---

## 6. Project Workshift Config

### Mục đích
Cấu hình chi tiết về ca làm việc, thời gian check-in/check-out, và các quy tắc liên quan.

### Cấu trúc Types

```typescript
type ProjectWorkshiftMode =
  | "FIXED_TIME_WITHIN_WORKSHIFT"      // Thời gian cố định trong ca
  | "FIXED_TIME_WITH_ASSIGNED"         // Thời gian cố định với ca được gán
  | "FIXED_TIME_BY_DEFAULT_TIME"       // Thời gian cố định theo mặc định
  | "FLEXIBLE_TIME";                   // Thời gian linh hoạt

interface IProjectWorkshiftConfig {
  id: string;
  project_id: string;                      // Unique per project
  
  // Default times
  default_start_time: string | null;        // Thời gian bắt đầu mặc định (HH:mm)
  default_end_time: string | null;          // Thời gian kết thúc mặc định (HH:mm)
  
  // Mode
  mode: ProjectWorkshiftMode;               // Chế độ ca làm việc
  
  // Time restrictions
  is_limit_checkin_time: boolean;          // Có giới hạn thời gian check-in
  is_limit_checkout_time: boolean;         // Có giới hạn thời gian check-out
  min_checkin_minutes_before: number | null;  // Số phút tối thiểu trước khi bắt đầu ca
  max_checkin_minutes_after: number | null;   // Số phút tối đa sau khi bắt đầu ca
  min_checkout_minutes_before: number | null; // Số phút tối thiểu trước khi kết thúc ca
  max_checkout_minutes_after: number | null;  // Số phút tối đa sau khi kết thúc ca
  
  // Auto checkout
  is_auto_checkout: boolean;                // Tự động check-out
  auto_checkout_at_time: string | null;     // Thời gian tự động check-out (HH:mm)
  
  // Multiple attendance
  is_multiple_attendance_allowed: boolean;  // Cho phép nhiều attendance trong một ca
  allow_access_after_checked_out: boolean;  // Cho phép truy cập sau khi đã check-out
  
  created_at: string;
  updated_at: string;
  version: number;
}
```

### Cách hoạt động

#### Workshift Modes:

1. **FIXED_TIME_WITHIN_WORKSHIFT**
   - Thời gian check-in/out phải nằm trong khoảng thời gian của ca làm việc
   - Sử dụng thời gian từ workshift assignment

2. **FIXED_TIME_WITH_ASSIGNED**
   - Thời gian cố định dựa trên ca được gán cho nhân viên
   - Phải có workshift assignment

3. **FIXED_TIME_BY_DEFAULT_TIME**
   - Sử dụng `default_start_time` và `default_end_time`
   - Áp dụng cho tất cả nhân viên

4. **FLEXIBLE_TIME**
   - Thời gian linh hoạt, không bắt buộc theo ca cụ thể
   - Nhân viên có thể check-in/out bất kỳ lúc nào

#### Time Restrictions:

- `is_limit_checkin_time = true`: Áp dụng giới hạn thời gian check-in
  - `min_checkin_minutes_before`: Có thể check-in sớm nhất X phút trước ca
  - `max_checkin_minutes_after`: Có thể check-in muộn nhất X phút sau khi ca bắt đầu

- `is_limit_checkout_time = true`: Áp dụng giới hạn thời gian check-out
  - `min_checkout_minutes_before`: Có thể check-out sớm nhất X phút trước khi ca kết thúc
  - `max_checkout_minutes_after`: Có thể check-out muộn nhất X phút sau khi ca kết thúc

#### Auto Checkout:

- `is_auto_checkout = true`: Tự động check-out nhân viên
- `auto_checkout_at_time`: Thời gian tự động check-out (ví dụ: "17:00")

#### Multiple Attendance:

- `is_multiple_attendance_allowed = true`: Cho phép nhân viên có nhiều attendance records trong một ca
- `allow_access_after_checked_out = true`: Cho phép nhân viên vẫn truy cập app sau khi đã check-out

### API Functions
- `httpRequestGetProjectWorkshiftConfig(projectId)` - Lấy workshift config
- `httpRequestUpsertProjectWorkshiftConfig(input)` - Tạo hoặc cập nhật

---

## Load All Configs

### Function: `httpRequestLoadAllProjectConfigs`

Load tất cả configs của một project cùng lúc (parallel) để tối ưu performance.

```typescript
interface IProjectAllConfigs {
  metadata: IProjectMetadata[];
  authConfig: IProjectAuthConfig | null;
  checkinFlow: IProjectCheckinFlow | null;
  gpsConfig: IProjectGpsConfig | null;
  attendancePhotoConfig: IProjectAttendancePhotoConfig | null;
  workshiftConfig: IProjectWorkshiftConfig | null;
}
```

### Cách hoạt động
- Load tất cả 6 loại configs song song bằng `Promise.all()`
- Trả về object chứa tất cả configs
- Nếu config không tồn tại, trả về `null` (trừ metadata trả về array rỗng)

---

## Sử dụng trong Application

### Hook: `useProjectConfigs`

Hook tự động load và quản lý project configs:

```typescript
const {
  projectMetadata,
  projectAuthConfig,
  projectCheckinFlow,
  projectGpsConfig,
  projectAttendancePhotoConfig,
  projectWorkshiftConfig,
  isLoading,
  error,
  reloadConfigs,
} = useProjectConfigs();
```

### Cách hoạt động
1. Tự động load configs khi project được set trong auth context
2. Lưu configs vào global store
3. Validate configs thuộc về project hiện tại
4. Tự động reload nếu project thay đổi

### Global Store

Configs được lưu trong `GlobalStore`:
- `projectMetadata: IProjectMetadata[]`
- `projectAuthConfig: IProjectAuthConfig | null`
- `projectCheckinFlow: IProjectCheckinFlow | null`
- `projectGpsConfig: IProjectGpsConfig | null`
- `projectAttendancePhotoConfig: IProjectAttendancePhotoConfig | null`
- `projectWorkshiftConfig: IProjectWorkshiftConfig | null`
- `currentProjectId: string` - Để validate configs thuộc về project nào

---

## Database Tables

Tất cả configs được lưu trong Supabase (master-data service):

- `project_metadata` - Bảng metadata (one-to-many với project)
- `project_auth_config` - Bảng auth config (one-to-one với project)
- `project_checkin_flow` - Bảng checkin flow (one-to-one với project)
- `project_gps_config` - Bảng GPS config (one-to-one với project)
- `project_attendance_photo_config` - Bảng photo config (one-to-one với project)
- `project_workshift_config` - Bảng workshift config (one-to-one với project)

Tất cả bảng đều có:
- `project_id` - Foreign key đến project
- `version` - Optimistic locking
- `created_at`, `updated_at` - Timestamps

---

## Best Practices

1. **Load configs sớm**: Load configs ngay sau khi project được xác định
2. **Cache configs**: Sử dụng global store để cache, tránh load lại nhiều lần
3. **Validate project**: Luôn kiểm tra `currentProjectId` để đảm bảo configs đúng project
4. **Error handling**: Xử lý trường hợp configs không tồn tại (null)
5. **Default values**: Có default values khi configs chưa được set

---

## Ví dụ sử dụng

### Kiểm tra GPS requirement
```typescript
const gpsConfig = useGlobalContext().use.projectGpsConfig();
if (gpsConfig?.mode === "REQUIRED_AT_LOCATION") {
  // Yêu cầu GPS tại địa điểm
  const distance = calculateDistance(userLocation, location);
  if (distance > gpsConfig.gps_radius_meters) {
    // Quá xa, không cho check-in
  }
}
```

### Kiểm tra checkin flow
```typescript
const checkinFlow = useGlobalContext().use.projectCheckinFlow();
if (checkinFlow?.require_survey) {
  // Hiển thị survey trước khi check-in
}
if (checkinFlow?.require_gps_at_location) {
  // Yêu cầu GPS verification
}
```

### Kiểm tra workshift mode
```typescript
const workshiftConfig = useGlobalContext().use.projectWorkshiftConfig();
if (workshiftConfig?.mode === "FLEXIBLE_TIME") {
  // Cho phép check-in/out linh hoạt
} else {
  // Áp dụng time restrictions
  const canCheckin = validateCheckinTime(workshiftConfig);
}
```

