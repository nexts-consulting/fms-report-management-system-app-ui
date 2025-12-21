# ⚡ Quick Start Guide - App UI

## 🚀 Cài đặt Nhanh

### 1. Clone & Install

```bash
cd fms-report-management-system-app-ui
pnpm install  # hoặc yarn install / npm install
```

### 2. Cấu hình Environment Variables

Tạo file `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_IMAGE_DOMAIN=http://localhost:8080  # Optional
```

### 3. Chạy Development Server

```bash
pnpm dev
```

Truy cập: `http://localhost:3000`

**Note:** Cần truy cập với tenant và project code trong URL:
```
http://localhost:3000/{tenant_code}/{project_code}/login
```

---

## 📁 Cấu trúc Chính

```
src/
├── app/[tenant_code]/[project_code]/  # Multi-tenant + multi-project routes
│   ├── (auth)/                        # Protected routes
│   │   ├── lobby/                    # Main lobby
│   │   ├── checkin/                  # Check-in flow
│   │   ├── attendance/               # Attendance features
│   │   ├── shift/                    # Shift management
│   │   └── location/                 # Location selection
│   └── login/                        # Login page
├── components/                        # Feature components
├── kits/                             # Reusable component library
│   ├── components/                   # UI components
│   └── widgets/                      # Complex widgets
├── contexts/                         # React contexts
├── hooks/                            # Custom hooks
├── services/                         # API services
└── stores/                           # Zustand stores
```

---

## 🔑 Key Concepts

### Multi-tenant + Multi-project Routing

```typescript
// URL structure
/{tenant_code}/{project_code}/lobby
/{tenant_code}/{project_code}/checkin
/{tenant_code}/{project_code}/attendance/tracking

// Sử dụng hook để build paths
import { useTenantProjectPath } from '@/hooks/use-tenant-project-path';

const { tenantCode, projectCode, buildPath } = useTenantProjectPath();
const lobbyPath = buildPath('/lobby'); // → /fms/project1/lobby
```

### Authentication

- Token lưu trong Zustand store (localStorage)
- Auto-load project configs sau khi login
- Headers: `Authorization: Bearer <token>`

### Project Configs

Mỗi project có configs riêng:
- Check-in flow settings
- GPS verification settings
- Photo requirements
- Workshift configuration

Configs được load tự động và cache trong global store.

### API Calls

```typescript
// Service pattern
import { axios } from '@/libs/axios';

export const getAttendance = async () => {
  const response = await axios.get('/attendance');
  return response.data;
};
```

---

## 🎯 Main Features

### 1. Check-in Flow
- GPS verification
- Photo capture
- Survey (optional)
- Submit attendance

### 2. Attendance Tracking
- Real-time tracking
- Current shift info
- Location tracking
- Report access

### 3. Reports
- Stock reports
- Sampling reports
- Activity reports
- OOS reports

### 4. Shift Management
- View current shift
- Shift duration tracking
- Upcoming shifts

---

## 🛠️ Commands

```bash
pnpm dev          # Development server
pnpm build        # Build production
pnpm start        # Run production
pnpm lint         # ESLint
pnpm prettier     # Format code
```

---

## 📖 Xem thêm

- `DEPLOYMENT_GUIDE.md` - Hướng dẫn chi tiết đầy đủ
- `ARCHITECTURE.md` - Kiến trúc và design patterns
- Storybook stories trong `src/kits/components/*/stories/`

