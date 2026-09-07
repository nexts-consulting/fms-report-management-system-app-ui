# 📘 Hướng dẫn Triển khai - FMS Report Management System App UI

## 📖 Tổng quan

Đây là tài liệu hướng dẫn triển khai module **App UI** của hệ thống **Field Service Management (FMS) Report Management System**. Module này cung cấp giao diện ứng dụng mobile-first cho nhân viên field service để thực hiện check-in/check-out, báo cáo, quản lý ca làm việc, và các chức năng field service khác.

### Thông tin cơ bản

- **Tên dự án**: `fms-report-management-system-app-ui`
- **Framework**: Next.js 16.0.10 (App Router)
- **Ngôn ngữ**: TypeScript 5.9.3
- **UI Library**: Custom components + Tailwind CSS 3.4.19
- **Icons**: Lucide React
- **Port mặc định**: 3000 (Next.js default)

---

## 🏗️ Kiến trúc Hệ thống

### 1. Kiến trúc Multi-tenant & Multi-project

Hệ thống được thiết kế theo mô hình **multi-tenant** và **multi-project** với routing dựa trên cả `tenant_code` và `project_code`:

```
/[tenant_code]/[project_code]/
  ├── (auth)/              # Routes yêu cầu authentication
  │   ├── lobby/          # Main lobby/dashboard
  │   ├── checkin/        # Check-in flow
  │   ├── attendance/     # Attendance management
  │   │   ├── checkout/   # Check-out flow
  │   │   ├── tracking/   # Attendance tracking
  │   │   └── report/     # Reports
  │   ├── shift/          # Shift management
  │   └── location/       # Location selection
  └── login/              # Login page
```

**Đặc điểm:**
- Tenant code và Project code được embed trong URL path: `/{tenant_code}/{project_code}/...`
- Mỗi project có cấu hình riêng (configs, theme, flow settings)
- Project configurations được load tự động khi project được select
- Tenant và Project information được lưu trong auth store và được inject vào mọi API request

### 2. Cấu trúc Thư mục

```
src/
├── app/                              # Next.js App Router
│   └── [tenant_code]/[project_code]/ # Dynamic tenant + project routes
│       ├── (auth)/                  # Authenticated routes group
│       │   ├── lobby/              # Main lobby
│       │   ├── checkin/            # Check-in flow
│       │   ├── attendance/         # Attendance features
│       │   ├── shift/              # Shift management
│       │   ├── location/           # Location selection
│       │   └── layout.tsx          # Auth layout với guards
│       ├── login/                  # Login page
│       ├── layout.tsx              # Root layout
│       └── page.tsx                # Root page
│
├── components/                       # Feature-specific components
│   ├── ActtendanceMenu/            # Attendance menu
│   ├── CheckInConfirm/             # Check-in confirmation
│   ├── CheckoutConfirm/            # Check-out confirmation
│   ├── DynamicForm/                # Dynamic form builder
│   ├── LeaveList/                  # Leave management
│   ├── ReportOOSWarning/           # OOS report warning
│   ├── ScreenFooter/               # Screen footer
│   ├── ScreenHeader/               # Screen header
│   ├── UserHeader/                 # User header
│   ├── UserMenu/                   # User menu
│   └── shared/                     # Shared components
│       └── project-theme-provider.tsx # Project theme provider
│
├── kits/                            # Reusable component library
│   ├── components/                 # UI components với Storybook
│   │   ├── button/
│   │   ├── dialog/
│   │   ├── modal/
│   │   ├── spinner/
│   │   ├── image-capture-input/   # Camera capture
│   │   ├── leaflet/               # Map components
│   │   └── ...
│   ├── hooks/                      # Reusable hooks
│   ├── utils/                      # Utility functions
│   └── widgets/                    # Complex widgets
│       ├── CameraCapture/          # Camera widget
│       ├── CheckinMap/             # Check-in map
│       ├── CheckoutMap/            # Check-out map
│       ├── Localize/               # Localization widget
│       ├── Quizze/                 # Quiz widget
│       └── TrackingProgress/       # Progress tracking
│
├── contexts/                        # React Context providers
│   ├── auth.context.tsx           # Authentication context
│   ├── global.context.tsx         # Global state context
│   └── project-config.context.tsx # Project configurations
│
├── hooks/                           # Custom React hooks
│   ├── check-in/                  # Check-in related hooks
│   ├── project/                   # Project hooks
│   ├── shift/                     # Shift hooks
│   └── use-tenant-project-path.tsx # Routing utilities
│
├── layouts/                         # Layout components
│   ├── auth-guard.tsx             # Authentication guard
│   ├── attendance-guard.tsx       # Attendance guard
│   ├── content.tsx                # Content wrapper
│   └── providers.tsx              # App providers
│
├── libs/                            # Third-party library wrappers
│   ├── axios/                     # Axios API client
│   └── react-query/               # React Query setup
│
├── services/                        # API service layer
│   ├── api/                       # API services
│   │   └── application/          # Application services
│   ├── firebase/                  # Firebase integration
│   └── supabase/                  # Supabase integration
│
├── stores/                          # Zustand state stores
│   ├── auth.store.ts             # Authentication state
│   ├── global.store.ts           # Global state
│   └── survey-progress.store.ts  # Survey progress state
│
├── types/                           # TypeScript type definitions
├── utils/                           # Utility functions
│   ├── routing.ts                # Routing utilities
│   ├── auth.ts                   # Auth utilities
│   └── ...
│
└── config/                          # Configuration files
    ├── index.ts                   # App config
    └── survey-flow.config.ts      # Survey flow config
```

---

## 🔧 Cấu hình & Biến Môi trường

### Environment Variables

Tạo file `.env.local` trong root directory với các biến sau:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080

# Image Domain (optional, defaults to API URL)
NEXT_PUBLIC_IMAGE_DOMAIN=http://localhost:8080

# Supabase Configuration (nếu sử dụng Supabase)
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY_MASTER=
NEXT_PUBLIC_SUPABASE_ANON_KEY_FMS=

# Firebase Configuration (nếu sử dụng Firebase)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# OpenObserve (AP1 Cloud — org identifier from MCP; password stays local)
NEXT_PUBLIC_OPENOBSERVE_ENABLED=true
NEXT_PUBLIC_OPENOBSERVE_ORG=3J06iIYdw0NGSAOjNpBQNsR6rHo
NEXT_PUBLIC_OPENOBSERVE_SITE=ap1.openobserve.ai
NEXT_PUBLIC_OPENOBSERVE_CLIENT_TOKEN=
NEXT_PUBLIC_OPENOBSERVE_INSECURE_HTTP=false
NEXT_PUBLIC_LOG_LEVEL=debug
NEXT_PUBLIC_APP_ENV=development
OPENOBSERVE_URL=https://ap1.openobserve.ai
OPENOBSERVE_ORG=3J06iIYdw0NGSAOjNpBQNsR6rHo
OPENOBSERVE_STREAM=fms-app-ui
OPENOBSERVE_USER=kienle@nexts-ds.com
OPENOBSERVE_PASSWORD=
```

### Next.js Configuration

File `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    scrollRestoration: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### TypeScript Configuration

File `tsconfig.json` sử dụng path aliases:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 🔐 Authentication & Authorization

### Authentication Flow

1. **Login Process:**
   - User nhập credentials tại `/{tenant_code}/{project_code}/login`
   - System load tenant và project từ URL
   - Request được gửi đến Keycloak với tenant-specific configuration
   - Nhận về: `accessToken`, `refreshToken`, `idToken`
   - Token được lưu vào Zustand store (persist trong localStorage)
   - User info, tenant info, và project info được lưu vào store
   - Project configs được tự động load

2. **Token Management:**
   - Access token được tự động attach vào mọi API request qua Axios interceptor
   - Token refresh được xử lý tự động khi token hết hạn (401 error)
   - Token expiry được track và validate

3. **Storage:**
   - Auth state được persist trong localStorage với key `auth-storage`
   - Bao gồm: `accessToken`, `refreshToken`, `idToken`, `user`, `tenant`, `project`

### Guards & Protection

1. **AuthGuard** (`layouts/auth-guard.tsx`):
   - Kiểm tra authentication status
   - Redirect đến `/login` nếu chưa authenticated
   - Preserve tenant code và project code trong redirect URL

2. **AttendanceGuard** (`layouts/attendance-guard.tsx`):
   - Kiểm tra attendance status
   - Enforce attendance flow requirements

### API Request Headers

Mọi API request tự động include các headers:

```typescript
{
  "Accept": "application/json",
  "x-request-timestamp": "<UTC timestamp>",
  "Authorization": "Bearer <accessToken>"
}
```

---

## 🌐 API Integration

### Axios Setup

File `src/libs/axios/axios-api.ts` cung cấp:

1. **Axios Instance:**
   - Base URL: `${NEXT_PUBLIC_API_URL}/v1`
   - Request interceptor để thêm headers (token, timestamp)
   - Response interceptor để handle errors

2. **Error Handling:**
   - Errors được propagate lên component
   - React Query handle retry logic

### React Query Integration

File `src/libs/react-query/react-query.ts`:

- QueryClient được configure với default options
- Global error handling
- Caching strategies

### Service Layer Pattern

Services được organize theo feature/module:

```typescript
// Example: src/services/api/application/attendance/checkin.ts
export const httpRequestCheckin = async (data: CheckinData) => {
  const response = await axios.post('/attendance/checkin', data);
  return response.data;
};
```

---

## 📱 Features Chính

### 1. Attendance Management

#### Check-in Flow (`/checkin`)
- Multi-step check-in process:
  1. GPS verification
  2. Photo capture
  3. Survey (nếu có)
  4. Submit

#### Check-out Flow (`/attendance/checkout`)
- Multi-step check-out process:
  1. GPS verification
  2. Photo capture
  3. Submit

#### Attendance Tracking (`/attendance/tracking`)
- Real-time attendance tracking
- Current shift information
- Location tracking
- Menu để access các reports

### 2. Reports

- **Stock Reports**: Tồn đầu ca, tồn cuối ca
- **Sampling Reports**: Báo cáo sampling
- **Activity Reports**: Báo cáo hoạt động
- **OOS Reports**: Báo cáo out-of-stock

### 3. Shift Management (`/shift`)

- View current shift
- View upcoming shifts
- Shift duration tracking
- Shift status management

### 4. Location Selection (`/location`)

- Select admin division
- Select location
- Location-based features

### 5. Lobby (`/lobby`)

- Main dashboard sau khi login
- Quick access to features
- Current attendance status
- Navigation menu

---

## 🎨 UI & Styling

### Design System

1. **Tailwind CSS:**
   - Utility-first classes
   - Custom color palette
   - Responsive design utilities
   - Mobile-first approach

2. **Custom Components (Kits):**
   - Reusable UI components trong `src/kits/components/`
   - Storybook support cho component documentation
   - Consistent design patterns

3. **Project Theme:**
   - Dynamic theme based on project configuration
   - Project-specific colors và branding
   - Theme provider trong `components/shared/project-theme-provider.tsx`

### Mobile-First Design

- Touch-optimized interactions
- Responsive layouts
- Mobile-friendly components
- Full-screen experiences
- Camera và GPS integration

---

## 🔄 State Management

### Zustand Stores

1. **Auth Store** (`stores/auth.store.ts`):
   - Authentication state
   - User information
   - Tenant information
   - Project information
   - Token management
   - Persist trong localStorage

2. **Global Store** (`stores/global.store.ts`):
   - Global application state
   - Selected admin division
   - Selected location
   - Current attendance
   - Project configs:
     - `projectMetadata`
     - `projectAuthConfig`
     - `projectCheckinFlow`
     - `projectGpsConfig`
     - `projectAttendancePhotoConfig`
     - `projectWorkshiftConfig`

3. **Survey Progress Store** (`stores/survey-progress.store.ts`):
   - Survey progress tracking
   - Survey state management

### React Context

1. **AuthContext** - Wrapper cho auth store
2. **GlobalContext** - Global state context
3. **ProjectConfigContext** - Auto-load và manage project configs

---

## 🗂️ Routing Patterns

### Tenant + Project Routing

Sử dụng hook `useTenantProjectPath()` để build paths với tenant code và project code:

```typescript
import { useTenantProjectPath } from '@/hooks/use-tenant-project-path';

function MyComponent() {
  const { tenantCode, projectCode, buildPath } = useTenantProjectPath();
  
  // Build path: /fms/project1/lobby (với tenantCode = "fms", projectCode = "project1")
  const lobbyPath = buildPath('/lobby');
  
  return <Link href={lobbyPath}>Lobby</Link>;
}
```

### Route Groups

- `(auth)` - Routes yêu cầu authentication, có layout với guards

### Dynamic Routes

- `[tenant_code]` - Dynamic tenant parameter
- `[project_code]` - Dynamic project parameter
- `[report_code]` - Dynamic report code parameter

---

## 📦 Project Configuration

### Project Configs

Mỗi project có các configs riêng được load tự động:

1. **Project Metadata**: Project information và metadata
2. **Auth Config**: Authentication configuration
3. **Checkin Flow Config**: Check-in flow settings
4. **GPS Config**: GPS verification settings
5. **Attendance Photo Config**: Photo capture settings
6. **Workshift Config**: Workshift configuration

### Loading Project Configs

ProjectConfigProvider tự động load configs khi:
- Project được select
- Project ID changes
- Configs missing hoặc không match current project

```typescript
// Configs được store trong global store
const projectAuthConfig = globalStore.use.projectAuthConfig();
const projectCheckinFlow = globalStore.use.projectCheckinFlow();
```

---

## 🚀 Development Setup

### Prerequisites

- Node.js 18+
- pnpm/yarn/npm
- Git

### Installation

```bash
# Install dependencies
pnpm install
# hoặc
yarn install
# hoặc
npm install
```

### Development Server

```bash
# Run development server
pnpm dev
```

Application sẽ chạy tại: `http://localhost:3000`

### Build & Production

```bash
# Build production bundle
pnpm build

# Run production server
pnpm start

# Lint
pnpm lint

# Prettier
pnpm prettier
```

---

## 📦 Dependencies Chính

### Core Framework
- `next@16.0.10` - Next.js framework
- `react@18.3.1` - React library
- `typescript@5.9.3` - TypeScript

### UI Libraries
- `tailwindcss@3.4.19` - Utility-first CSS framework
- `lucide-react@0.561.0` - Icon library
- `framer-motion@12.23.26` - Animation library
- `leaflet@1.9.4` - Map library
- `react-leaflet@4.2.1` - React wrapper cho Leaflet

### State Management
- `zustand@5.0.9` - Lightweight state management
- `react-query@3.39.3` - Data fetching & caching

### Forms & Validation
- `react-hook-form@7.68.0` - Form handling
- `@hookform/resolvers@4.1.3` - Form validation resolvers
- `zod@3.25.76` - Schema validation

### Utilities
- `dayjs@1.11.19` - Date manipulation
- `moment@2.30.1` - Date manipulation
- `lodash@4.17.21` - Utility functions
- `clsx@2.1.1` - Conditional className utility

### Special Features
- `react-webcam@7.2.0` - Webcam integration
- `react-canvas-confetti@2.0.7` - Confetti effects
- `swiper@11.2.10` - Touch slider
- `ua-parser-js@2.0.7` - User agent parsing

### Development
- `storybook@8.6.15` - Component documentation và testing

---

## 🎯 Key Features & Components

### Camera Integration

- **Image Capture Input**: Component để capture images từ camera
- **Multiple Images Capture**: Support multiple images
- **Photo Upload**: Upload photos to server

### GPS & Maps

- **CheckinMap**: Map component cho check-in
- **CheckoutMap**: Map component cho check-out
- **OutletMap**: Map component cho outlets
- **Geolocation Tracking**: Real-time location tracking

### Dynamic Forms

- **DynamicForm**: Form builder component
- **Field Renderer**: Dynamic field rendering
- **Multiple field types**: Text, select, checkbox, etc.

### Surveys & Quizzes

- **Survey Component**: Survey/questionnaire component
- **Quiz Widget**: Quiz component
- **Survey Progress Tracking**: Track survey completion

### Reports

- **OOS Report Warning**: Out-of-stock report warnings
- **Report Forms**: Dynamic report forms
- **Lucky Wheel**: Gamification component

---

## 🧪 Testing

### Storybook

Component library có Storybook support:

```bash
# Run Storybook (nếu có script)
npm run storybook
```

Stories trong `src/kits/components/*/stories/`

---

## 📊 Performance Optimization

### Code Splitting

- Route-based splitting (Next.js automatic)
- Dynamic imports cho heavy components
- Lazy loading cho non-critical components

### Image Optimization

- Images trong `public/`
- Next.js Image component (nếu cần)
- Config: `images.unoptimized: true` trong next.config.mjs

### Bundle Optimization

- Tree shaking (automatic)
- Minification (production build)
- Mobile-optimized bundle sizes

---

## 🔍 Debugging

### Console Logs

Application có logging cho:
- Authentication flow
- API requests/responses
- Project config loading
- State updates

### DevTools

- Zustand DevTools được enable trong development
- React Query DevTools có thể được add nếu cần

---

## 🚢 Deployment

### Build Output

```bash
pnpm build
```

Output directory: `.next/`

### Environment Variables

Đảm bảo set các environment variables trong production:
- `NEXT_PUBLIC_API_URL` - Production API URL
- `NEXT_PUBLIC_IMAGE_DOMAIN` - Image domain URL
- Các Supabase keys (nếu dùng)
- Các Firebase keys (nếu dùng)

### Deployment Options

1. **Vercel** (Recommended cho Next.js):
   - Connect GitHub repository
   - Auto-deploy từ main branch
   - Environment variables trong Vercel dashboard

2. **Docker**:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

3. **Self-hosted**:
   - Build production bundle
   - Run `npm start` với PM2 hoặc systemd
   - Setup reverse proxy (Nginx) nếu cần

---

## 📝 Code Conventions

### TypeScript

- Strict mode được enable
- Use interfaces cho object types
- Use types cho unions, intersections, utilities
- Avoid `any`, use `unknown` nếu cần

### Component Structure

```typescript
// 1. Imports
import React from 'react';

// 2. Types/Interfaces
interface MyComponentProps {
  title: string;
}

// 3. Component
export const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  // 4. Hooks
  const { buildPath } = useTenantProjectPath();
  
  // 5. Logic
  // ...
  
  // 6. Render
  return <div>{title}</div>;
};
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `UserHeader.tsx`)
- Utilities: `kebab-case.ts` (e.g., `routing.ts`)
- Types: `kebab-case.ts` hoặc `model.ts`
- Constants: `UPPER_SNAKE_CASE.ts` hoặc `kebab-case.constant.ts`

---

## 🔗 Integration Points

### Backend API

- Base URL: `${NEXT_PUBLIC_API_URL}/v1`
- Authentication: Bearer token trong header `Authorization`
- Request timestamp: `x-request-timestamp` header

### Keycloak

- Tenant-specific Keycloak realms
- OAuth2/OIDC flow
- Token management

### Supabase (Optional)

- Real-time subscriptions (nếu cần)
- Direct database queries qua Supabase client
- Route-specific Supabase instances

### Firebase (Optional)

- Firebase services (Storage, Auth, etc.)
- Singleton pattern cho Firebase service

---

## ⚠️ Common Issues & Solutions

### 1. Project Config Not Loading

**Symptom:** Project configs missing hoặc không update

**Solution:**
- Check ProjectConfigProvider setup
- Verify project ID trong store
- Check API endpoint cho load configs
- Clear localStorage và reload

### 2. GPS Not Working

**Symptom:** GPS verification fails

**Solution:**
- Check browser permissions cho geolocation
- Verify GPS config trong project configs
- Check GPS coordinates accuracy
- Test trên real device (not emulator)

### 3. Camera Not Accessible

**Symptom:** Camera capture fails

**Solution:**
- Check browser permissions cho camera
- Verify HTTPS (camera requires secure context)
- Test trên real device
- Check camera component implementation

### 4. Routing Issues với Tenant/Project Code

**Symptom:** 404 errors hoặc incorrect routes

**Solution:**
- Verify tenant code và project code trong URL
- Check `useTenantProjectPath()` hook usage
- Verify tenant và project trong auth store
- Check routing utilities

---

## 📚 Additional Resources

### Documentation Files

- Component READMEs trong `src/components/` và `src/kits/components/`
- Storybook stories cho component documentation

### Key Files to Review

- `src/layouts/providers.tsx` - App providers setup
- `src/contexts/auth.context.tsx` - Authentication logic
- `src/contexts/project-config.context.tsx` - Project config management
- `src/libs/axios/axios-api.ts` - API client configuration
- `src/utils/routing.ts` - Routing utilities

---

## 🎯 Next Steps cho Development

### Recommended Tasks

1. **Environment Setup:**
   - Create `.env.local` với production values
   - Verify API connectivity
   - Test authentication flow

2. **Feature Development:**
   - Follow existing patterns trong codebase
   - Use service layer cho API calls
   - Use React Query cho data fetching
   - Implement proper error handling
   - Test trên mobile devices

3. **Testing:**
   - Add unit tests cho utilities
   - Add integration tests cho critical flows
   - Test multi-tenant và multi-project scenarios
   - Test GPS và camera features

4. **Performance:**
   - Monitor bundle size
   - Optimize images
   - Add loading states
   - Implement proper caching strategies
   - Test trên slow networks

---

## 📞 Support

### Questions & Issues

- Review existing documentation
- Check code comments
- Review similar implementations trong codebase
- Check Storybook stories cho component usage
- Contact development team

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0.0  
**Maintained by:** FMS Development Team

