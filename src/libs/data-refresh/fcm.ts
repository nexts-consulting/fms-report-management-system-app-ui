import { firebaseService } from "@/services/firebase";

export const registerFcmToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) return null;

  try {
    const { getMessaging, getToken, isSupported } = await import("firebase/messaging");
    const supported = await isSupported();
    if (!supported || !("Notification" in window) || Notification.permission !== "granted") {
      return null;
    }

    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const messaging = getMessaging(firebaseService.firebaseApp);
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
    return token || null;
  } catch (error) {
    console.warn("[data-refresh] FCM token registration skipped", error);
    return null;
  }
};
