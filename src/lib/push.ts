import { api } from "./api";

const urlBase64ToUint8Array = (base64: string) => {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

export const isPushSupported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

export async function getPushSubscription() {
  if (!isPushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  return (await reg?.pushManager.getSubscription()) ?? null;
}

/** Asks for permission, registers the service worker and stores the subscription on the server. */
export async function enablePush() {
  if (!isPushSupported()) throw new Error("This browser does not support notifications");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notification permission was not granted");

  const { data } = await api.get<{ publicKey: string | null; enabled: boolean }>("/notifications/push/config");
  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  if (!data.enabled || !data.publicKey) return { push: false }; // in-page alerts still work

  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey),
    }));
  await api.post("/notifications/push/subscribe", subscription.toJSON());
  return { push: true };
}

export async function disablePush() {
  const sub = await getPushSubscription();
  if (!sub) return;
  await api.delete("/notifications/push/subscribe", { endpoint: sub.endpoint }).catch(() => undefined);
  await sub.unsubscribe();
}
