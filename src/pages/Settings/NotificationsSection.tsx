import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { usersApi } from "@/api/users";
import { useAuthStore } from "@/store/authStore";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Bell, BellOff, BellRing } from "lucide-react";
import { Toggle, DEFAULT_NOTIF_PREFS } from "./settingsHelpers";

const NOTIF_ITEMS = [
  { key: "comments" as const, label: "Komentari na mom postu",  desc: "Kada neko komentariše tvoj post" },
  { key: "upvotes"  as const, label: "Upvote",                  desc: "Kada neko upvotuje tvoj post" },
  { key: "friends"  as const, label: "Novi prijatelji",          desc: "Kada neko pošalje zahtev za prijateljstvo" },
  { key: "messages" as const, label: "Direktne poruke",          desc: "Kada primiš novu poruku" },
];

// ─── Push notification row ────────────────────────────────────────────────────

const PushNotificationRow = () => {
  const { supported, permission, subscribe, unsubscribe, checkSubscribed } = usePushNotifications();
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSubscribed().then(setSubscribed);
  }, [permission]);

  if (!supported) return null;

  const handleToggle = async () => {
    setLoading(true);
    if (subscribed) {
      await unsubscribe();
      setSubscribed(false);
    } else {
      const ok = await subscribe();
      setSubscribed(ok);
    }
    setLoading(false);
  };

  return (
    <div className="border-t border-border px-5 py-4 flex items-center gap-4">
      <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center shrink-0">
        {subscribed
          ? <BellRing size={18} className="text-accent" />
          : <BellOff size={18} className="text-text-3" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-text-1">Push notifikacije</div>
        <div className="text-[11.5px] text-text-3 mt-0.5">
          {permission === "denied"
            ? "Blokirano u podešavanjima browsera"
            : subscribed
            ? "Primaš notifikacije čak i kad je app zatvorena"
            : "Dozvoli da browser šalje notifikacije"}
        </div>
      </div>
      {permission === "denied" ? (
        <span className="text-[11px] text-danger font-medium">Blokirano</span>
      ) : (
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border cursor-pointer transition-all disabled:opacity-50 ${
            subscribed
              ? "bg-surface-2 text-text-2 border-border hover:bg-danger-soft hover:text-danger hover:border-danger/20"
              : "bg-accent text-white border-accent hover:bg-accent-hover"
          }`}
        >
          {loading ? "..." : subscribed ? "Isključi" : "Uključi"}
        </button>
      )}
    </div>
  );
};

// ─── Notifications section ────────────────────────────────────────────────────

const NotificationsSection = () => {
  const { user, setAuth } = useAuthStore();
  const prefs = { ...DEFAULT_NOTIF_PREFS, ...(user?.notificationPrefs ?? {}) };
  const [local, setLocal] = useState(prefs);

  useEffect(() => {
    setLocal({ ...DEFAULT_NOTIF_PREFS, ...(user?.notificationPrefs ?? {}) });
  }, [user?.notificationPrefs]);

  const mutation = useMutation({
    mutationFn: (notificationPrefs: typeof prefs) => usersApi.updateMe({ notificationPrefs }),
    onSuccess: (updated) => {
      setAuth(updated, localStorage.getItem("token")!);
    },
  });

  const handleToggle = (key: keyof typeof prefs, value: boolean) => {
    const next = { ...local, [key]: value };
    setLocal(next);
    mutation.mutate(next);
  };

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center">
          <Bell size={18} className="text-text-3" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-[14px] text-text-1">Obaveštenja</div>
          <div className="text-[12px] text-text-3">Bira za šta primaš notifikacije</div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {NOTIF_ITEMS.map((item) => (
          <div key={item.key} className="flex items-center justify-between px-5 py-3.5 gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-text-1">{item.label}</div>
              <div className="text-[11.5px] text-text-3 mt-0.5">{item.desc}</div>
            </div>
            <Toggle value={local[item.key]} onChange={(v) => handleToggle(item.key, v)} />
          </div>
        ))}
      </div>

      <PushNotificationRow />
    </div>
  );
};

export default NotificationsSection;
