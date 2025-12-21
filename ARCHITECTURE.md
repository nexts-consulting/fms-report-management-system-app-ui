# 🏗️ Kiến trúc Hệ thống - App UI

## 📐 Tổng quan Kiến trúc

Module App UI được xây dựng dựa trên **Next.js App Router** với kiến trúc **multi-tenant** và **multi-project**, **mobile-first design**, và **service-oriented** cho API integration. Module này được tối ưu cho field service workers sử dụng trên mobile devices.

---

## 🔄 Data Flow

### 1. Authentication Flow

```
User Login
    ↓
Login Page (src/app/[tenant_code]/[project_code]/login)
    ↓
Load Tenant từ URL/API
    ↓
Load Project từ URL/API
    ↓
Auth Service (src/services/api/application/auth/login.ts)
    ↓
Keycloak API (OAuth2/OIDC)
    ↓
Receive Tokens (accessToken, refreshToken, idToken)
    ↓
Store in Auth Store (Zustand) → localStorage
    ↓
Auto-load Project Configs
    ↓
Update Auth Context
    ↓
Redirect to Lobby
```

### 2. Project Config Loading Flow

```
Project Selected/Changed
    ↓
ProjectConfigProvider detects change
    ↓
Check if configs exist và match project ID
    ↓
If missing or mismatch:
  - Call API: httpRequestLoadAllProjectConfigs(projectId)
  ↓
Receive configs:
  - projectMetadata
  - projectAuthConfig
  - projectCheckinFlow
  - projectGpsConfig
  - projectAttendancePhotoConfig
  - projectWorkshiftConfig
    ↓
Store in Global Store
    ↓
Update currentProjectId
    ↓
Components use configs from global store
```

### 3. Check-in Flow

```
User navigates to /checkin
    ↓
Check-in Page loads
    ↓
Check-in State initialized:
  - Current step (GPS, Photo, Survey, Submit)
  - Location data
  - Photo data
  - Survey responses
    ↓
Step 1: GPS Verification
  - Get current location
  - Verify within allowed area (projectGpsConfig)
  - Display on map
    ↓
Step 2: Photo Capture
  - Capture photo(s) (projectAttendancePhotoConfig)
  - Upload to server
  - Validate photo requirements
    ↓
Step 3: Survey (if enabled)
  - Render survey questions (projectCheckinFlow)
  - Collect responses
    ↓
Step 4: Submit
  - Validate all data
  - Submit to API
  - Update attendance state
  - Redirect to tracking page
```

### 4. API Request Flow

```
Component
    ↓
Service Function (src/services/api/application/...)
    ↓
Axios Instance (src/libs/axios/axios-api.ts)
    ↓
Request Interceptor:
  - Add Authorization header (Bearer token)
  - Add x-request-timestamp
  - Set baseURL: ${API_URL}/v1
    ↓
Backend API
    ↓
Response Interceptor:
  - Success: Return data
  - Error: Propagate to component
    ↓
Component receives data/error
    ↓
React Query cache/update
```

---

## 🏛️ Component Architecture

### Layer Structure

```
┌─────────────────────────────────────┐
│         Pages (app/*/page.tsx)      │  ← Route pages
├─────────────────────────────────────┤
│      Layouts (layouts/*.tsx)        │  ← Layout components với guards
├─────────────────────────────────────┤
│    Feature Components               │  ← Business logic components
│    (components/*)                   │
├─────────────────────────────────────┤
│    Kits Components                  │  ← Reusable UI components
│    (kits/components/*)              │
├─────────────────────────────────────┤
│    Widgets (kits/widgets/*)         │  ← Complex widgets
└─────────────────────────────────────┘
```

### Guard System

```
Route Component
    ↓
AuthGuard (auth-guard.tsx)
  - Check authentication
  - Redirect to login if not authenticated
  - Preserve tenant + project in redirect
    ↓
AttendanceGuard (attendance-guard.tsx)
  - Check attendance requirements
  - Enforce attendance flow
    ↓
Layout Content
  - Render page content
```

---

## 🔌 Integration Architecture

### API Layer

```
┌──────────────────────────────────────┐
│   Components / Pages                 │
└──────────────┬───────────────────────┘
               │
               ↓
┌──────────────────────────────────────┐
│   React Query Hooks                  │  ← Data fetching, caching
│   (useQuery, useMutation)            │
└──────────────┬───────────────────────┘
               │
               ↓
┌──────────────────────────────────────┐
│   Service Functions                  │  ← Business logic, API calls
│   (src/services/api/application/...) │
└──────────────┬───────────────────────┘
               │
               ↓
┌──────────────────────────────────────┐
│   Axios Instance                     │  ← HTTP client với interceptors
│   (src/libs/axios/axios-api.ts)      │
└──────────────┬───────────────────────┘
               │
               ↓
┌──────────────────────────────────────┐
│   Backend API                        │
│   ${API_URL}/v1/*                    │
└──────────────────────────────────────┘
```

### State Management Architecture

```
┌──────────────────────────────────────┐
│   React Context Providers            │
│   (AuthContext, GlobalContext,       │
│    ProjectConfigContext)             │  ← React Context layer
└──────────────┬───────────────────────┘
               │
               ↓
┌──────────────────────────────────────┐
│   Zustand Stores                     │
│   (auth.store.ts, global.store.ts,   │
│    survey-progress.store.ts)         │  ← State management
└──────────────┬───────────────────────┘
               │
               ↓
┌──────────────────────────────────────┐
│   localStorage (persist)             │  ← Persistent storage
└──────────────────────────────────────┘
```

---

## 🌐 Multi-tenant & Multi-project Architecture

### Tenant & Project Isolation

```
┌──────────────────────────────────────────┐
│   URL: /{tenant_code}/{project_code}/...│
│                                          │
│   1. Extract tenant_code và project_code│
│      từ URL                              │
│   2. Load tenant config từ API          │
│   3. Load project config từ API         │
│   4. Store trong auth store              │
│   5. Inject vào API calls                │
│   6. Scope data queries by tenant/project│
└──────────────────────────────────────────┘
```

### Project Configuration System

Mỗi project có configs riêng:
- **Project Metadata**: General project info
- **Auth Config**: Authentication settings
- **Checkin Flow Config**: Check-in flow steps và settings
- **GPS Config**: GPS verification settings (radius, required, etc.)
- **Attendance Photo Config**: Photo requirements (count, size, etc.)
- **Workshift Config**: Workshift settings

Configs được:
- Load tự động khi project được select
- Cache trong global store
- Validate khi project ID changes
- Available globally via global store

---

## 🔐 Security Architecture

### Authentication Layers

1. **Route Protection:**
   - AuthGuard checks authentication status
   - Redirects unauthenticated users

2. **API Protection:**
   - Token in request headers
   - Automatic token refresh (nếu implement)
   - Tenant/Project isolation

3. **Feature Protection:**
   - AttendanceGuard enforces attendance flow
   - Project configs control feature availability

### Token Storage

- **Location:** localStorage (via Zustand persist)
- **Content:**
  - `accessToken`: JWT token cho API calls
  - `refreshToken`: Token để refresh access token
  - `idToken`: Identity token từ Keycloak
  - `tokenExpiresAt`: Timestamp khi token hết hạn

---

## 📦 Module Organization

### Service Layer Pattern

Services được organize theo domain:

```
services/api/application/
├── auth/              # Authentication services
├── attendance/        # Attendance services
├── management/        # Management services
│   └── projects/      # Project services
│       └── configs/   # Project config services
└── reports/           # Report services
```

Mỗi service module có:
- Type definitions
- API request functions
- Response type definitions

### Component Organization

#### Feature Components (`components/`)

Components specific cho features:
- `CheckInConfirm/` - Check-in confirmation
- `CheckoutConfirm/` - Check-out confirmation
- `UserHeader/` - User header component
- `ScreenFooter/` - Screen footer
- `DynamicForm/` - Dynamic form builder

#### Kits Components (`kits/components/`)

Reusable UI component library:
- Base components: `button/`, `input/`, `modal/`, etc.
- Specialized: `image-capture-input/`, `leaflet/`, etc.
- Storybook stories cho documentation

#### Widgets (`kits/widgets/`)

Complex, feature-rich widgets:
- `CameraCapture/` - Camera widget
- `CheckinMap/` - Check-in map widget
- `TrackingProgress/` - Progress tracking widget
- `Quizze/` - Quiz widget

---

## 🎨 Styling Architecture

### CSS Strategy

1. **Tailwind CSS:**
   - Utility-first classes
   - Custom theme configuration
   - Responsive design utilities
   - Mobile-first approach

2. **SCSS Modules:**
   - Component-specific styles (nếu cần)
   - Global styles

3. **Project Theme:**
   - Dynamic theme based on project config
   - Project-specific colors và branding
   - Applied via ProjectThemeProvider

### Theme System

```
Project Config (projectMetadata)
    ↓
ProjectThemeProvider
    ↓
Extract theme colors
    ↓
Apply CSS variables / Tailwind config
    ↓
Components use theme values
```

---

## 🚀 Performance Optimizations

### Code Splitting

- Route-based splitting (Next.js automatic)
- Dynamic imports cho heavy components
- Lazy loading cho non-critical components
- Widgets được load on-demand

### Caching Strategy

- React Query cache cho API responses
- Browser cache cho static assets
- Zustand persist cho auth và global state
- Project configs cached trong global store

### Bundle Optimization

- Tree shaking (automatic)
- Minification (production build)
- Mobile-optimized bundle sizes
- Image optimization (nếu enable)

---

## 🔍 Error Handling Architecture

### Error Types

1. **Network Errors:**
   - Handled by Axios interceptors
   - User-friendly error messages
   - Retry logic via React Query

2. **Validation Errors:**
   - Form validation errors
   - Display inline errors
   - Highlight invalid fields

3. **Business Logic Errors:**
   - API error responses
   - Display error notifications
   - Handle gracefully

### Error Flow

```
Error occurs
    ↓
Axios Interceptor / Component
    ↓
Error type detection:
  - Network: Retry hoặc show error
  - Validation: Show inline error
  - Business: Show notification
    ↓
User notification (Notification component)
```

---

## 📊 Data Fetching Architecture

### React Query Integration

```
Component
    ↓
useQuery / useMutation hook
    ↓
Service function call
    ↓
API request (Axios)
    ↓
Response/Error
    ↓
React Query cache/update
    ↓
Component re-render với data
```

### Query Configuration

- Default: React Query defaults
- Cache time: Configurable per query
- Stale time: Configurable per query
- Retry: Configurable per query

---

## 🔗 External Integrations

### Keycloak

- OAuth2/OIDC provider
- Tenant-specific realms
- Token management
- User authentication

### Supabase (Optional)

- Direct database access
- Real-time subscriptions
- Route-specific instances
- Automatic header injection

### Firebase (Optional)

- Firebase services
- Singleton pattern
- Config từ environment variables

### Browser APIs

- **Geolocation API**: GPS tracking
- **MediaDevices API**: Camera access
- **Storage API**: LocalStorage cho persistence

---

## 🧩 Key Patterns

### 1. Service Pattern

```typescript
// services/api/application/attendance/checkin.ts
export const httpRequestCheckin = async (data: CheckinData) => {
  const response = await axios.post('/attendance/checkin', data);
  return response.data;
};
```

### 2. Hook Pattern

```typescript
// hooks/check-in/use-checkin-submit.ts
export const useCheckinSubmit = () => {
  const mutation = useMutation({
    mutationFn: httpRequestCheckin,
    onSuccess: (data) => {
      // Handle success
    },
  });
  
  return mutation;
};
```

### 3. Component Pattern

```typescript
// components/CheckInConfirm/index.tsx
export const CheckInConfirm = () => {
  const { buildPath } = useTenantProjectPath();
  const checkinSubmit = useCheckinSubmit();
  
  const handleSubmit = () => {
    checkinSubmit.mutate(data);
  };
  
  return <Button onClick={handleSubmit}>Submit</Button>;
};
```

### 4. Widget Pattern

```typescript
// kits/widgets/CheckinMap/index.tsx
export const CheckinMap = ({ onLocationSelected }) => {
  const [location, setLocation] = useState(null);
  
  // Map logic
  // GPS logic
  
  return <MapComponent />;
};
```

---

## 📱 Mobile-First Patterns

### Touch Interactions

- Large touch targets
- Swipe gestures (Swiper component)
- Pull-to-refresh patterns
- Full-screen experiences

### Camera Integration

- Direct camera access
- Photo capture
- Multiple photos support
- Photo upload with progress

### GPS Integration

- Real-time location tracking
- Location verification
- Map display
- Geofencing support

### Offline Considerations

- LocalStorage persistence
- Offline state detection
- Queue actions for when online
- Sync when connection restored

---

## 📝 Best Practices

### 1. Always use TypeScript types
### 2. Use service layer cho API calls
### 3. Use React Query cho data fetching
### 4. Handle errors gracefully
### 5. Preserve tenant + project code trong routing
### 6. Use Zustand stores cho global state
### 7. Use React Context sparingly
### 8. Follow existing patterns trong codebase
### 9. Test trên mobile devices
### 10. Optimize for mobile performance
### 11. Use project configs for feature flags
### 12. Handle GPS và camera permissions properly

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0.0

