# Tổng quan luồng hoạt động – FMS Report Management App UI

Tài liệu này tóm tắt **kiến trúc** và **các luồng nghiệp vụ chính** của ứng dụng UI dành cho nhân viên hiện trường (field worker) trong hệ thống FMS. Dùng làm bản đồ định hướng khi đọc code; không thay thế cho [ARCHITECTURE.md](./ARCHITECTURE.md) (chi tiết hơn về layered architecture).

---

## 1. Bức tranh tổng thể

- **Stack:** Next.js 16 (App Router) + React 18 + TypeScript, Tailwind + SCSS, Zustand (persist) + React Context, React Query, Axios.
- **Mô hình:** Multi-tenant + Multi-project. URL chuẩn cho user là `/{tenant_code}/{project_code}/...`
- **Backend:**
  - REST API tự xây qua `${NEXT_PUBLIC_API_URL}/v1` (axios instance ở [src/libs/axios/axios-api.ts](src/libs/axios/axios-api.ts)).
  - **Keycloak** cho OAuth2/OIDC (login, refresh, logout) – gọi trực tiếp từ client.
  - **Supabase** + **Firebase** dùng cho dữ liệu phụ trợ và lưu trữ ảnh.
- **Mục tiêu UX:** Mobile-first, hỗ trợ camera/GPS, hoạt động được khi mạng kém.

---

## 2. Cấu trúc thư mục cốt lõi

```
src/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # RootLayout + ProvidersWrapper
│   ├── page.tsx                      # Landing/marketing page
│   ├── (guest)/                      # Public routes (chưa có nội dung chính)
│   ├── (other)/                      # Routes ngoài tenant/project
│   │   ├── configuration/            # Cấu hình thiết bị, debug local storage
│   │   └── profile/                  # Hồ sơ cá nhân (Keycloak ↔ user_profiles)
│   └── [tenant_code]/[project_code]/
│       ├── login/                    # Đăng nhập theo tenant/project
│       ├── preview/report/           # Xem trước báo cáo (không cần auth)
│       └── (auth)/                   # Mọi route phía trong yêu cầu đăng nhập
│           ├── lobby/                # Màn hình chính sau khi login
│           ├── location/             # Chọn admin division + location
│           ├── shift/                # Chọn working shift
│           ├── checkin/              # Luồng chấm công vào ca
│           ├── attendance/
│           │   ├── tracking/         # Đang trong ca
│           │   ├── checkout/         # Luồng tan ca
│           │   ├── report/           # Báo cáo trong ca + lucky-wheel
│           ├── report/[report_id]/   # Tạo report-entry theo report-definition
│           ├── form/[form_id]/       # Mở form-definition trong iframe
│           └── leave-request/        # Tạo & quản lý đơn nghỉ phép
├── layouts/                          # ProvidersWrapper, AuthGuard, AttendanceGuard, Content
├── contexts/                         # auth, global, project-config, theme, app-menu, …
├── stores/                           # Zustand stores (auth, global, survey-progress, …)
├── hooks/                            # use-on-app-mount, use-check-current-shift, …
├── services/
│   ├── api/application/              # Thư viện gọi REST API (theo domain)
│   ├── firebase/                     # Singleton Firebase (storage)
│   └── supabase/                     # Supabase client per route
├── kits/                             # Component library (components/widgets/utils/hooks)
├── components/                       # Component nghiệp vụ ở cấp app
├── libs/{axios,react-query}/         # Cấu hình HTTP & React Query
├── types/, utils/, config/, data/    # Types, helpers, JSON tĩnh
```

Domain trong [src/services/api/application/](src/services/api/application/):
`auth`, `attendance`, `working-shift`, `leave-request`, `staff-leaves`, `report-entry`,
`report-definition`, `form-definition`, `location`, `admin-division`, `app-menu`,
`master-data` (`tenants`, `tenant-projects`, `user-profiles`), `management`
(`projects/configs`, `keycloak/users`).

---

## 3. Provider & Guard pipeline

Tại [src/layouts/providers.tsx](src/layouts/providers.tsx), thứ tự bọc provider quyết định data-flow:

```
ErrorBoundary
└── QueryClientProvider                 # React Query
    └── NotificationProvider
        └── GlobalContextProvider       # Zustand: location, shift, configs, attendance
            └── AuthContextProvider     # Zustand: tokens, user, tenant, project (cookie + localStorage)
                └── ProjectConfigProvider   # Auto-load project configs khi đổi project
                    └── AppMenuProvider
                        └── ReportDefinitionContextProvider
                            └── FormDefinitionContextProvider
                                └── ProjectThemeProvider
                                    └── Content (useOnAppMount → useCheckCurrentShift + useCheckConnection)
                                        └── {children}
```

Layout cấp route `(auth)/layout.tsx` bọc thêm [AuthGuardWrapper](src/layouts/auth-guard-wrapper.tsx); các trang trong `attendance/` thêm [AttendanceGuard](src/layouts/attendance-guard.tsx) để bảo đảm có `currentAttendance` mới truy cập được.

---

## 4. Lưu trữ trạng thái

| Lớp | Vai trò | Vị trí lưu |
|-----|---------|-----------|
| `auth.store` | `accessToken`, `refreshToken`, `idToken`, `tokenExpiresAt`, `user`, `userProfile`, `tenant`, `project` | **Tokens → cookies** (HttpOnly-style helpers ở [src/utils/cookie.ts](src/utils/cookie.ts)); phần còn lại → `localStorage` (`auth-storage`) |
| `global.store` | `selectedAdminDivision`, `selectedLocation`, `selectedWorkingShift`, `currentAttendance`, các flag UI, **6 project configs** + `currentProjectId` | `localStorage` (`global-storage`) |
| `survey-progress.store` | Tiến trình khảo sát check-in | `localStorage` |
| `report-definition.store` / `form-definition.store` | Cache definition đang xem | In-memory |

Project configs được load 1 lần per project bởi [ProjectConfigProvider](src/contexts/project-config.context.tsx) qua `httpRequestLoadAllProjectConfigs(projectId)` và bao gồm: `metadata`, `authConfig` (Keycloak client), `checkinFlow`, `gpsConfig`, `attendancePhotoConfig`, `workshiftConfig`.

---

## 5. Luồng nghiệp vụ chính

### 5.1. Bootstrap khi mở app
1. `RootLayout` render `ProvidersWrapper` (load `Providers` qua `next/dynamic({ ssr: false })`).
2. Providers khởi tạo store, AuthContext bắt đầu tick `handleValidateToken` mỗi 30s và proactively refresh khi token còn < 60s.
3. `Content` chạy `useOnAppMount`:
   - `useCheckCurrentShift` – nếu user đã đăng nhập thì query `currentShift`, hydrate `currentAttendance/selectedWorkingShift/selectedLocation/selectedAdminDivision`.
   - `useCheckConnection` – theo dõi trạng thái online/offline và hiện overlay khi mất mạng.
4. `ProjectConfigProvider` so sánh `currentProjectId` với `project.id`; nếu khác hoặc thiếu config sẽ gọi load-all-configs và cập nhật `global.store`.

### 5.2. Tenant + Project + Login
File chính: [login/components/entry.tsx](src/app/[tenant_code]/[project_code]/login/components/entry.tsx).
1. Đọc `tenant_code`, `project_code` từ URL → gọi `httpRequestGetTenantByCode` và `httpRequestGetProjectByCode`.
2. Verify `project.tenant_id === tenant.id`. Nếu sai → màn 404 nội bộ.
3. Khi `project` đã set → `ProjectConfigProvider` tự load configs (đặc biệt cần `projectAuthConfig` để biết Keycloak client).
4. Submit form → `useMutationAuthLogin` POST trực tiếp tới Keycloak token endpoint với `client_id/secret` lấy từ `projectAuthConfig`.
5. `onSuccess`: decode access token → set `auth.store` (`authenticated/user/tokens/tokenExpiresAt`).
6. Redirect: nếu chưa có `selectedAdminDivision`/`selectedLocation` → `/location`, ngược lại → `/lobby`.
7. Sau login, `AuthContextProvider` có effect riêng gọi `httpRequestGetUserProfileByKeycloakId` và cache `user-profile` vào `localStorage`.

### 5.3. Lobby & lựa chọn ca
File: [lobby/components/entry.tsx](src/app/[tenant_code]/[project_code]/(auth)/lobby/components/entry.tsx).
- Nếu đang có `currentAttendance` → redirect `/attendance/tracking` (trừ khi URL có `?force=true`, dùng để admin reset state).
- Nếu thiếu `selectedAdminDivision/Location` → redirect `/location`.
- Hai action: **Bắt đầu ca làm việc** → `/shift`; **Thay đổi địa điểm** → `/location`.

`/location` cho phép chọn admin-division + outlet/location. `/shift` cho phép chọn shift mặc định, shift theo location, hoặc tạo flexible shift (`create-flexible-shift`).

### 5.4. Check-in
Folder: [(auth)/checkin/](src/app/[tenant_code]/[project_code]/(auth)/checkin/). Logic flow trong `hooks/use-checkin-state.ts`, render qua `Entry` + step components:

```
Step "gps"      → CheckinGpsStep      (nếu projectCheckinFlow.require_gps_verification)
Step "capture"  → CheckinCaptureStep  (nếu require_photo_verification)
Step "survey"   → CheckinSurveyStep   (nếu require_survey)
Step "submit"   → CheckinSubmitStep   (gọi POST /attendance/checkin)
```

- GPS verify so với `projectGpsConfig` (radius, lat/lng của location).
- Ảnh chấm công sinh từ `buildAttendancePhotoTimeMarkConfig` (dán watermark thời gian, tên nhân viên, ca, location) rồi upload qua `ImageCaptureInputWithUpload` → Firebase Storage.
- Survey lưu tiến trình ở `survey-progress.store` để khôi phục khi reload.
- Submit thành công → cập nhật `currentAttendance` trong global store, redirect `/attendance/tracking`.

### 5.5. Trong ca: tracking, report, leave start
Trong `/attendance/tracking`: hiển thị tiến trình ca, các action chính.
- **Báo cáo trong ca:** `/attendance/report` mở danh sách `report-definition` áp dụng cho project; chọn 1 report → vào `/report/[report_id]` để tạo `report-entry` (gồm field động, ảnh, GPS). Có nhánh `lucky-wheel` cho gamification.
- **Mở form bên ngoài:** `/form/[form_id]` render iframe theo `form-definition` (xem [docs/IFRAME_FORM_INTEGRATION.md](./IFRAME_FORM_INTEGRATION.md)).
- **Leave request:** `/leave-request/create` tạo đơn nghỉ; component `LeaveStartConfirm` / `LeaveEndConfirm` cho phép bắt đầu/kết thúc nghỉ trong ca.

### 5.6. Check-out
Folder: [(auth)/attendance/checkout/](src/app/[tenant_code]/[project_code]/(auth)/attendance/checkout/). Tương tự check-in, theo các step `gps → capture → submit` (theo `projectCheckinFlow`). Khi POST `/attendance/checkout` thành công → reset `currentAttendance/selectedWorkingShift` → quay về `/lobby`.

### 5.7. Profile & Configuration (ngoài tenant/project)
- `/profile` ([src/app/(other)/profile/page.tsx](src/app/(other)/profile/page.tsx)): lấy/upsert `user_profiles` (Supabase) và set attribute `profile-updated` trên Keycloak. Ảnh upload Firebase tại `user-profiles/{keycloak_user_id}/...`.
- `/configuration`: kiểm tra/permission camera & geolocation, xoá local storage (giữ `auth-storage`), copy debug snapshot.

---

## 6. Luồng request HTTP

```
Component → React Query hook (services/api/application/<domain>) →
  axiosApi (src/libs/axios/axios-api.ts)
    Request interceptor:
      - baseURL = ${NEXT_PUBLIC_API_URL}/v1
      - Authorization: Bearer <accessToken cookie>
      - x-tenant-code (đọc từ localStorage auth-storage)
      - x-request-timestamp
    Response interceptor: passthrough (lỗi propagate)
```

Login/refresh KHÔNG đi qua axios instance này; chúng gọi thẳng Keycloak endpoint với client credentials trong `projectAuthConfig`.

---

## 7. Token lifecycle

[AuthContextProvider](src/contexts/auth.context.tsx):
1. Mỗi 30s `handleValidateToken(accessToken, tokenExpiresAt)`:
   - Hết hạn theo `tokenExpiresAt` hoặc JWT `exp` → `httpRequestAuthRefresh` (Keycloak) → cập nhật bộ token.
   - Còn dưới 60s → refresh chủ động.
2. Refresh thất bại → clear toàn bộ token + state → `window.location.reload()` → AuthGuard đẩy về `/login`.
3. Logout (`LogoutConfirm`) → `httpRequestAuthLogout` → clear tokens + cookies + state.

---

## 8. Tích hợp ngoài

| Hệ thống | Mục đích | Vị trí |
|---------|----------|--------|
| **Keycloak** | OAuth2/OIDC login, refresh, logout (per tenant realm + per project client) | `services/api/application/auth/*`, `auth.context.tsx` |
| **Backend API** (FMS) | Toàn bộ data nghiệp vụ (attendance, shift, location, report, leave, profile, master data, config) | `services/api/application/*` |
| **Supabase** | User profile + form/report definition (đọc trực tiếp) | `services/supabase/index.ts` |
| **Firebase Storage** | Upload ảnh chấm công, ảnh hồ sơ, ảnh báo cáo | `services/firebase/index.ts`, `ImageCaptureInputWithUpload` |
| **Browser APIs** | Geolocation, MediaDevices (camera), Permissions API | `kits/widgets/CameraCapture`, `useWatchGeolocation`, page `/configuration` |

---

## 9. Mở rộng & sửa đổi

- **Thêm route con trong tenant/project:** đặt vào `[tenant_code]/[project_code]/(auth)/<feature>/page.tsx` rồi dùng `useTenantProjectPath().buildPath` cho mọi điều hướng.
- **Thêm domain API:** tạo thư mục mới trong `src/services/api/application/<domain>/` với pattern `httpRequest*` + optional `useQuery*/useMutation*` theo mẫu các domain hiện có.
- **Thêm step check-in/out:** mở rộng `useCheckinState` (state machine `currentStep`) và component cùng cấp; bật/tắt qua field tương ứng trong `projectCheckinFlow`.
- **Thay đổi config project:** chỉnh trên admin UI; client tự rehydrate khi `projectMetadata`/`projectCheckinFlow`/... thay đổi vì `ProjectConfigProvider` so khớp `currentProjectId`.

---

## 10. Tài liệu liên quan

- [ARCHITECTURE.md](./ARCHITECTURE.md) – chi tiết layered architecture, security, performance.
- [ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md) – biểu đồ kiến trúc.
- [QUICK_START.md](./QUICK_START.md) – setup nhanh.
- [IFRAME_FORM_INTEGRATION.md](./IFRAME_FORM_INTEGRATION.md), [FORM_INTEGRATION_README.md](./FORM_INTEGRATION_README.md) – tích hợp form iframe.
- [FIREBASE_INTEGRATION.md](./FIREBASE_INTEGRATION.md), [FIREBASE_CUSTOM_PATH.md](./FIREBASE_CUSTOM_PATH.md) – Firebase Storage.
- [DATABASE_CONFIG_GUIDE.md](./DATABASE_CONFIG_GUIDE.md), [DYNAMIC_DROPDOWN_GUIDE.md](./DYNAMIC_DROPDOWN_GUIDE.md), [JSON_CONFIG_QUICK_START.md](./JSON_CONFIG_QUICK_START.md) – config động.
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) – triển khai (OpenNext + Cloudflare).

---

_Last scanned: 2026-04-26 (branch `refactor-2604`)._
