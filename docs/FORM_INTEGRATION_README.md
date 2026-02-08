# Form Integration - Iframe Communication System

## 📝 Tổng quan

Hệ thống cho phép nhúng các form từ domain khác (iframe) và chia sẻ dữ liệu `currentAttendance` từ localStorage của parent app.

## 🏗️ Kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│                     Parent Application                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Form Page (/form/[form_id])                         │  │
│  │  - Load form definition từ fms_mst_form_definition   │  │
│  │  - Get currentAttendance từ localStorage             │  │
│  │  - Render IframeFormViewer                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           │ postMessage API                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │        Child Form (Different Domain)           │  │  │
│  │  │  - Receive currentAttendance via postMessage   │  │  │
│  │  │  - Process & submit data to DB                 │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                    Iframe                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Cấu trúc Files

### Files đã tạo

```
fms-report-management-system-app-ui/
├── src/
│   ├── types/
│   │   └── model.ts                         # Added IFormDefinition interface
│   ├── stores/
│   │   └── form-definition.store.ts         # ✅ New - Form definition store với caching
│   ├── contexts/
│   │   └── form-definition.context.tsx      # ✅ New - Form definition context & hook
│   ├── services/api/application/
│   │   └── form-definition/
│   │       └── get-by-id.ts                 # ✅ New - API service
│   ├── hooks/
│   │   └── use-iframe-communication.ts      # ✅ New - postMessage communication hook
│   ├── components/
│   │   └── IframeFormViewer.tsx             # ✅ New - Iframe viewer với error handling
│   ├── app/[tenant_code]/[project_code]/(auth)/form/[form_id]/
│   │   └── page.tsx                         # ✅ Updated - Form page implementation
│   └── layouts/
│       └── providers.tsx                    # ✅ Updated - Added FormDefinitionContextProvider
├── docs/
│   └── IFRAME_FORM_INTEGRATION.md           # ✅ New - Integration documentation
└── public/
    └── example-form.html                    # ✅ New - Example child form
```

## 🚀 Features

### ✅ Parent App Features

1. **Form Definition Management**
   - Load form config từ database `fms_mst_form_definition`
   - Cache trong localStorage (1 hour)
   - Zustand store cho state management

2. **Iframe Communication**
   - PostMessage API cho cross-origin communication
   - Origin validation cho security
   - Auto-retry mechanism nếu iframe không response

3. **Error Handling**
   - Loading overlay khi load form definition & iframe
   - Timeout 15 giây cho iframe loading
   - Retry button nếu có lỗi
   - Friendly error messages

4. **Data Sharing**
   - Share `currentAttendance` từ localStorage
   - Auto-resend khi attendance thay đổi
   - Support null attendance (khi user chưa check-in)

### ✅ Security Features

1. **Origin Validation**
   - Validate origin của messages
   - Support multiple trusted origins
   - Reject messages từ untrusted origins

2. **Sandbox Attributes**
   - Restrict iframe capabilities
   - Allow only necessary permissions

3. **Data Validation**
   - Validate form definition trước khi load
   - Check app_url existence

## 📡 Message Protocol

### Parent → Child: INIT_FORM_DATA

```typescript
{
  type: "INIT_FORM_DATA",
  payload: {
    currentAttendance: IAttendance | null
  }
}
```

### Child → Parent: FORM_READY (Optional)

```typescript
{
  type: "FORM_READY"
}
```

### Child → Parent: FORM_SUBMITTED (Optional)

```typescript
{
  type: "FORM_SUBMITTED",
  payload: { /* any data */ }
}
```

### Child → Parent: FORM_ERROR (Optional)

```typescript
{
  type: "FORM_ERROR",
  payload: {
    message: string
  }
}
```

## 🔧 Cách sử dụng

### 1. Setup Database

Tạo bản ghi trong `fms_mst_form_definition`:

```sql
INSERT INTO fms_mst_form_definition (
  tenant_code,
  project_code,
  code,
  name,
  description,
  app_url,
  status
) VALUES (
  'your-tenant',
  'your-project',
  'inspection-form',
  'Inspection Form',
  'Daily inspection form',
  'https://your-form-app.com/inspection',
  'published'
);
```

### 2. Access Form

Navigate to: `/[tenant_code]/[project_code]/form/[form_id]`

### 3. Implement Child Form

Xem chi tiết tại: [docs/IFRAME_FORM_INTEGRATION.md](./docs/IFRAME_FORM_INTEGRATION.md)

Hoặc tham khảo example: [public/example-form.html](../public/example-form.html)

## 🧪 Testing

### Test với Example Form

1. Update `app_url` trong database:
   ```sql
   UPDATE fms_mst_form_definition 
   SET app_url = 'http://localhost:3000/example-form.html'
   WHERE code = 'your-form-code';
   ```

2. Access form page và observe:
   - Loading overlay xuất hiện
   - Iframe load example form
   - Communication log hiển thị messages
   - Attendance data được hiển thị trong form

### Debug Mode

Development mode bật debug info ở góc dưới bên phải iframe:

```
Ready: Yes/No
Loading: Yes/No
Error: Yes/No
Timeout: Yes/No
```

## 📊 Data Flow

```
1. User navigates to /form/[form_id]
   ↓
2. Load form definition từ:
   - Store (if cached)
   - localStorage cache (if valid)
   - API (if not cached)
   ↓
3. Get currentAttendance từ global store
   ↓
4. Render iframe với app_url
   ↓
5. Wait for iframe load event
   ↓
6. Send INIT_FORM_DATA via postMessage
   ↓
7. Child form receives data & processes
   ↓
8. Child form submits to database
   ↓
9. (Optional) Child sends FORM_SUBMITTED back
```

## ⚙️ Configuration

### Iframe Timeout

Edit trong `IframeFormViewer.tsx`:

```typescript
const IFRAME_LOAD_TIMEOUT = 15000; // 15 seconds
```

### Cache Duration

Edit trong `form-definition.store.ts`:

```typescript
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
```

### Allowed Origins

Edit trong child form implementation:

```typescript
const allowedOrigins = [
  'https://your-parent-app.com',
  'http://localhost:3000', // Development
];
```

## 🐛 Troubleshooting

### Iframe không load

1. Check app_url trong database có đúng không
2. Check CORS policy của child form
3. Check network tab trong DevTools
4. Verify child form accessible từ browser

### Không nhận được data

1. Check Console logs trong child form
2. Verify origin validation logic
3. Check child form đã send FORM_READY chưa
4. Verify postMessage syntax đúng

### CurrentAttendance null

- Normal nếu user chưa check-in
- Handle null case trong child form
- Show appropriate message cho user

## 📚 Related Documentation

- [Iframe Integration Guide](./docs/IFRAME_FORM_INTEGRATION.md) - Chi tiết integration cho child form
- [Example Form](../public/example-form.html) - Working example
- [Database Schema](../fms-report-management-system-admin-ui/docs/supabase-database/4.%20fms-form.sql) - Form definition table

## 🔐 Security Best Practices

1. ✅ Always validate message origin
2. ✅ Use HTTPS in production
3. ✅ Validate data types received
4. ✅ Minimize iframe sandbox permissions
5. ✅ Don't expose sensitive data in URL params
6. ✅ Implement Content Security Policy (CSP)
7. ✅ Regular security audits

## 🎯 Future Improvements

- [ ] Support form submission callback to parent
- [ ] Add form state synchronization
- [ ] Support multiple data sources (not just currentAttendance)
- [ ] Add form analytics & tracking
- [ ] Support form pre-fill from URL params
- [ ] Add form version management
- [ ] Support offline form submission

