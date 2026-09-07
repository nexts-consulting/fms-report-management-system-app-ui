/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAoLKruxIHv8Kou9x60DMGt6y4czItT15A",
  authDomain: "nexts-fms-report.firebaseapp.com",
  projectId: "nexts-fms-report",
  storageBucket: "nexts-fms-report.firebasestorage.app",
  messagingSenderId: "1075610306824",
  appId: "1:1075610306824:web:1c661268bedb4742a6c4bd",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || "Yêu cầu cập nhật dữ liệu";
  const body =
    payload?.notification?.body || "Quản trị viên yêu cầu bạn cập nhật dữ liệu cấu hình trên app.";

  self.registration.showNotification(title, {
    body,
    data: payload?.data || {},
  });
});
