# 🚀 Quick Start Guide - Form Integration

## For Parent App Developers

### 1. Create Form Definition in Database

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
  'my-form',
  'My Form',
  'Form description',
  'https://your-form-url.com',
  'published'
);
```

### 2. Access Form

Navigate to: `/[tenant_code]/[project_code]/form/[form_id]`

That's it! 🎉

---

## For Child Form Developers

### Minimal Implementation

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Form</title>
</head>
<body>
  <h1>My Form</h1>
  <div id="info"></div>
  
  <script>
    // 1. Listen for data from parent
    window.addEventListener('message', function(event) {
      // Security: Validate origin in production
      if (event.data.type === 'INIT_FORM_DATA') {
        const attendance = event.data.payload.currentAttendance;
        
        // Use the data
        if (attendance) {
          document.getElementById('info').innerHTML = `
            Location: ${attendance.location_name}<br>
            User: ${attendance.username}
          `;
        }
      }
    });
    
    // 2. Notify parent you're ready
    window.parent.postMessage({ type: 'FORM_READY' }, '*');
  </script>
</body>
</html>
```

### Available Data

```typescript
currentAttendance: {
  id: number;
  location_name: string;
  username: string;
  workshift_name: string;
  checkin_time: string;
  // ... more fields
} | null
```

---

## 📚 Full Documentation

- **Integration Guide**: [IFRAME_FORM_INTEGRATION.md](./IFRAME_FORM_INTEGRATION.md)
- **System Overview**: [FORM_INTEGRATION_README.md](./FORM_INTEGRATION_README.md)
- **Implementation Summary**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Example Form**: [../public/example-form.html](../public/example-form.html)

---

## 🆘 Common Issues

### Issue: Iframe không load
**Solution**: Check app_url in database, verify URL is accessible

### Issue: Không nhận được data
**Solution**: Check console logs, verify FORM_READY message sent

### Issue: currentAttendance is null
**Solution**: This is normal if user hasn't checked in. Handle null case in your form.

---

## 💬 Message Types

| Type | Direction | Purpose |
|------|-----------|---------|
| `INIT_FORM_DATA` | Parent → Child | Send attendance data |
| `FORM_READY` | Child → Parent | Form ready to receive data |
| `FORM_SUBMITTED` | Child → Parent | Form submitted successfully |
| `FORM_ERROR` | Child → Parent | Error occurred |

---

## 🔐 Security Note

**Production**: Always validate message origin!

```javascript
const allowedOrigins = ['https://your-parent-app.com'];
if (!allowedOrigins.includes(event.origin)) {
  return; // Reject message
}
```

---

Need help? Check the full documentation above! 📖
