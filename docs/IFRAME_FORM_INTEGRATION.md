# Hướng dẫn tích hợp Form với Parent Application

## 📋 Tổng quan

Document này hướng dẫn cách tích hợp form được nhúng (iframe) với parent application để nhận dữ liệu từ localStorage của parent.

## 🔄 Luồng hoạt động

```
Parent App                          Child Form (Iframe)
    |                                      |
    |---(1) Load iframe------------------>|
    |                                      |
    |<--(2) FORM_READY (optional)---------|
    |                                      |
    |---(3) INIT_FORM_DATA--------------->|
    |       (currentAttendance)            |
    |                                      |
    |                             (4) Use data & save to DB
```

## 📡 Message Types

### 1. INIT_FORM_DATA (Parent → Child)

Parent gửi dữ liệu khởi tạo cho child form khi iframe load xong.

**Cấu trúc:**
```typescript
{
  type: "INIT_FORM_DATA",
  payload: {
    currentAttendance: {
      id: number;
      project_code: string;
      username: string;
      workshift_id: number | null;
      workshift_name: string;
      shift_start_time: string | null;
      shift_end_time: string | null;
      location_id: number | null;
      location_code: string;
      location_name: string;
      checkin_time: string | null;
      checkout_time: string | null;
      status: "CHECKED_IN" | "CHECKED_OUT" | "AUTO_CHECKED_OUT";
      timing_status: "ON_TIME" | "LATE" | "EARLY" | "ABSENT";
      checkin_photo_url: string | null;
      checkout_photo_url: string | null;
      checkin_lat: number | null;
      checkin_lng: number | null;
      checkout_lat: number | null;
      checkout_lng: number | null;
      metadata: Record<string, any>;
      created_at: string;
      updated_at: string;
    } | null
  }
}
```

### 2. FORM_READY (Child → Parent) - Optional

Child form có thể gửi message này khi đã sẵn sàng nhận dữ liệu.

**Cấu trúc:**
```typescript
{
  type: "FORM_READY"
}
```

### 3. FORM_SUBMITTED (Child → Parent) - Optional

Child form có thể gửi message này sau khi submit thành công (nếu cần).

**Cấu trúc:**
```typescript
{
  type: "FORM_SUBMITTED",
  payload: {
    // Any data you want to send back
  }
}
```

### 4. FORM_ERROR (Child → Parent) - Optional

Child form có thể gửi message này khi có lỗi xảy ra (nếu cần).

**Cấu trúc:**
```typescript
{
  type: "FORM_ERROR",
  payload: {
    message: string;
    // Other error details
  }
}
```

## 💻 Implementation trong Child Form

### Basic Setup

```typescript
// Listen for messages from parent
window.addEventListener("message", (event) => {
  // Validate origin for security
  const allowedOrigins = [
    "https://your-parent-app.com",
    "http://localhost:3000", // For development
  ];
  
  if (!allowedOrigins.includes(event.origin)) {
    console.warn("Message from untrusted origin:", event.origin);
    return;
  }

  // Handle message
  const message = event.data;
  
  switch (message.type) {
    case "INIT_FORM_DATA":
      handleInitData(message.payload);
      break;
    default:
      console.log("Unknown message type:", message.type);
  }
});

// Optional: Notify parent that form is ready
window.parent.postMessage(
  { type: "FORM_READY" },
  "https://your-parent-app.com" // Parent origin
);
```

### React Example

```typescript
import { useEffect, useState } from "react";

interface CurrentAttendance {
  id: number;
  project_code: string;
  username: string;
  location_name: string;
  // ... other fields
}

export default function MyForm() {
  const [attendance, setAttendance] = useState<CurrentAttendance | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin
      const allowedOrigins = [
        "https://your-parent-app.com",
        "http://localhost:3000",
      ];
      
      if (!allowedOrigins.includes(event.origin)) {
        return;
      }

      if (event.data.type === "INIT_FORM_DATA") {
        setAttendance(event.data.payload.currentAttendance);
      }
    };

    window.addEventListener("message", handleMessage);

    // Notify parent that form is ready
    window.parent.postMessage(
      { type: "FORM_READY" },
      "https://your-parent-app.com"
    );

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // Use attendance data in your form
  return (
    <div>
      <h1>Form Title</h1>
      {attendance && (
        <div>
          <p>Location: {attendance.location_name}</p>
          <p>Username: {attendance.username}</p>
          {/* Your form fields */}
        </div>
      )}
    </div>
  );
}
```

### Vue Example

```vue
<template>
  <div>
    <h1>Form Title</h1>
    <div v-if="attendance">
      <p>Location: {{ attendance.location_name }}</p>
      <p>Username: {{ attendance.username }}</p>
      <!-- Your form fields -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const attendance = ref(null);

const handleMessage = (event) => {
  // Validate origin
  const allowedOrigins = [
    'https://your-parent-app.com',
    'http://localhost:3000',
  ];
  
  if (!allowedOrigins.includes(event.origin)) {
    return;
  }

  if (event.data.type === 'INIT_FORM_DATA') {
    attendance.value = event.data.payload.currentAttendance;
  }
};

onMounted(() => {
  window.addEventListener('message', handleMessage);
  
  // Notify parent that form is ready
  window.parent.postMessage(
    { type: 'FORM_READY' },
    'https://your-parent-app.com'
  );
});

onUnmounted(() => {
  window.removeEventListener('message', handleMessage);
});
</script>
```

### Vanilla JavaScript Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Form</title>
</head>
<body>
  <h1>Form Title</h1>
  <div id="attendance-info"></div>
  <form id="my-form">
    <!-- Your form fields -->
  </form>

  <script>
    let currentAttendance = null;

    // Listen for messages from parent
    window.addEventListener("message", function(event) {
      // Validate origin
      const allowedOrigins = [
        "https://your-parent-app.com",
        "http://localhost:3000"
      ];
      
      if (!allowedOrigins.includes(event.origin)) {
        return;
      }

      if (event.data.type === "INIT_FORM_DATA") {
        currentAttendance = event.data.payload.currentAttendance;
        displayAttendanceInfo();
      }
    });

    // Display attendance info
    function displayAttendanceInfo() {
      if (currentAttendance) {
        document.getElementById("attendance-info").innerHTML = `
          <p>Location: ${currentAttendance.location_name}</p>
          <p>Username: ${currentAttendance.username}</p>
        `;
      }
    }

    // Notify parent that form is ready
    window.parent.postMessage(
      { type: "FORM_READY" },
      "https://your-parent-app.com"
    );
  </script>
</body>
</html>
```

## 🔒 Security Considerations

### 1. Origin Validation (QUAN TRỌNG!)

Luôn validate origin của message để tránh XSS attacks:

```typescript
const allowedOrigins = [
  "https://your-parent-app.com",
  "http://localhost:3000", // Development only
];

if (!allowedOrigins.includes(event.origin)) {
  console.warn("Untrusted origin:", event.origin);
  return;
}
```

### 2. Data Validation

Validate dữ liệu nhận được từ parent:

```typescript
function isValidAttendance(data: any): boolean {
  return (
    data &&
    typeof data.id === "number" &&
    typeof data.project_code === "string" &&
    typeof data.username === "string"
  );
}

if (event.data.type === "INIT_FORM_DATA") {
  const attendance = event.data.payload.currentAttendance;
  if (attendance && isValidAttendance(attendance)) {
    setAttendance(attendance);
  }
}
```

## 🧪 Testing

### Test với console

Mở Developer Console trong iframe và chạy:

```javascript
// Simulate parent message
window.postMessage(
  {
    type: "INIT_FORM_DATA",
    payload: {
      currentAttendance: {
        id: 1,
        project_code: "TEST",
        username: "testuser",
        location_name: "Test Location",
        // ... other fields
      }
    }
  },
  "*"
);
```

## 📝 Notes

1. **Không cần callback từ child về parent** - Child form tự lưu data vào database
2. **currentAttendance có thể null** - Xử lý trường hợp user chưa check-in
3. **Data sẽ được gửi lại** - Khi currentAttendance thay đổi, parent sẽ gửi lại INIT_FORM_DATA
4. **Timeout 15 giây** - Nếu iframe không load trong 15s, parent sẽ hiển thị lỗi
5. **Fallback mechanism** - Nếu child không gửi FORM_READY, parent sẽ tự động gửi data sau 500ms

## 🔗 Related Files

- Parent implementation: `src/components/IframeFormViewer.tsx`
- Communication hook: `src/hooks/use-iframe-communication.ts`
- Page implementation: `src/app/[tenant_code]/[project_code]/(auth)/form/[form_id]/page.tsx`




