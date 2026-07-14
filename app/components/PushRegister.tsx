"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { firebaseVapidKey, firebaseWebConfig, isFirebaseWebConfigured } from "@/lib/firebase-web";

async function saveDeviceToken(token: string, platform: "ios" | "android" | "web") {
  await fetch("/api/user/device-tokens", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token, platform }),
  });
}

async function registerNativePush() {
  const { PushNotifications } = await import("@capacitor/push-notifications");

  const perm = await PushNotifications.checkPermissions();
  if (perm.receive !== "granted") {
    const req = await PushNotifications.requestPermissions();
    if (req.receive !== "granted") return null;
  }

  await PushNotifications.register();

  return Promise.all([
    PushNotifications.addListener("registration", async (ev) => {
      try {
        const platform = Capacitor.getPlatform() as "ios" | "android";
        await saveDeviceToken(ev.value, platform);
      } catch {
        /* retry after login */
      }
    }),
    PushNotifications.addListener("registrationError", () => {}),
    PushNotifications.addListener("pushNotificationReceived", () => {
      window.dispatchEvent(new CustomEvent("APM:notifications-changed"));
    }),
    PushNotifications.addListener("pushNotificationActionPerformed", () => {
      window.dispatchEvent(new CustomEvent("APM:notifications-changed"));
    }),
  ]);
}

async function registerWebPush() {
  if (!isFirebaseWebConfigured()) return null;
  if (!("serviceWorker" in navigator) || !("Notification" in window)) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const { initializeApp, getApps } = await import("firebase/app");
  const { getMessaging, getToken, onMessage, isSupported } = await import("firebase/messaging");

  if (!(await isSupported())) return null;

  const app = getApps().length ? getApps()[0]! : initializeApp(firebaseWebConfig);
  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  const messaging = getMessaging(app);

  const token = await getToken(messaging, {
    vapidKey: firebaseVapidKey,
    serviceWorkerRegistration: registration,
  });

  if (token) {
    try {
      await saveDeviceToken(token, "web");
    } catch {
      /* user may not be logged in yet */
    }
  }

  onMessage(messaging, () => {
    window.dispatchEvent(new CustomEvent("APM:notifications-changed"));
  });

  return null;
}

export default function PushRegister() {
  useEffect(() => {
    let cleanup: (() => void) | null = null;

    void (async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          const handles = await registerNativePush();
          if (handles) {
            cleanup = () => handles.forEach((h) => void h.remove());
          }
        } else {
          await registerWebPush();
        }
      } catch {
        /* noop */
      }
    })();

    return () => cleanup?.();
  }, []);

  return null;
}
