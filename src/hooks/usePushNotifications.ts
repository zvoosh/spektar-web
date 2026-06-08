import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/api/axios";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export type PushPermission = "default" | "granted" | "denied";

export function usePushNotifications() {
  const { isAuthenticated } = useAuthStore();
  const [permission, setPermission] = useState<PushPermission>(
    typeof Notification !== "undefined" ? (Notification.permission as PushPermission) : "denied"
  );
  const [supported] = useState(
    typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window
  );

  useEffect(() => {
    if (!supported || !isAuthenticated) return;
    // Register service worker
    navigator.serviceWorker.register("/sw.js").catch(console.error);
  }, [supported, isAuthenticated]);

  const subscribe = async (): Promise<boolean> => {
    if (!supported) return false;

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm as PushPermission);
      if (perm !== "granted") return false;

      const reg = await navigator.serviceWorker.ready;

      // Get VAPID public key from server
      const { data } = await api.get("/notifications/vapid-public-key");
      const applicationServerKey = urlBase64ToUint8Array(data.publicKey);

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      const subJson = sub.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      await api.post("/notifications/subscribe", subJson);
      return true;
    } catch (err) {
      console.error("Push subscribe error:", err);
      return false;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    if (!supported) return false;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await api.post("/notifications/unsubscribe", { endpoint: sub.endpoint });
        await sub.unsubscribe();
      }
      setPermission("default");
      return true;
    } catch {
      return false;
    }
  };

  const checkSubscribed = async (): Promise<boolean> => {
    if (!supported || permission !== "granted") return false;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      return !!sub;
    } catch {
      return false;
    }
  };

  return { supported, permission, subscribe, unsubscribe, checkSubscribed };
}
