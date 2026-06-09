import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { notificationsApi } from "@/api/notifications";
import type { Notification } from "@/types";
import { Trash2 } from "lucide-react";
import { NotificationSkeleton } from "@/components/shared/Skeleton";

const NOTIF_ICONS: Record<string, string> = {
  vote: "▲",
  comment: "💬",
  reply: "↩️",
  follow: "👤",
  mention: "@",
  join: "🎉",
  new_post: "📝",
};

const formatDate = (date: string) => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 60) return `pre ${mins}m`;
  if (hours < 24) return `pre ${hours}h`;
  if (days < 7) return `pre ${days}d`;
  return new Date(date).toLocaleDateString("sr-RS");
};

const NOTIF_DESTINATIONS: Record<string, (notif: Notification) => string | null> = {
  post_comment:   (n) => n.entityId ? `/post/${n.entityId}` : null,
  comment_reply:  (n) => n.entityId ? `/post/${n.entityId}` : null,
  post_vote:      (n) => n.entityId ? `/post/${n.entityId}` : null,
  new_post:       (n) => n.entityId ? `/post/${n.entityId}` : null,
  community_join_request:  (n) => n.actor ? `/u/${n.actor.username}` : null,
  community_join_approved: (n) => n.actor ? `/u/${n.actor.username}` : null,
  chat_invite:    () => `/chat`,
  gallery_approved: () => null,
  gallery_rejected: () => null,
};

const NotificationItem = ({ notif }: { notif: Notification }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const readMutation = useMutation({
    mutationFn: () => notificationsApi.markAsRead(notif.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.setQueryData(["notifications", "unread"], (old: number) => Math.max(0, (old ?? 1) - 1));
    },
  });

  const handleClick = () => {
    if (!notif.isRead) readMutation.mutate();
    const dest = NOTIF_DESTINATIONS[notif.type]?.(notif);
    if (dest) navigate(dest);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3.5 px-5 py-4 cursor-pointer hover:bg-surface-2-2 transition-colors border-b border-surface-2 last:border-b-0 ${
        !notif.isRead ? "bg-accent-soft/30" : ""
      }`}
    >
      {/* Actor avatar or icon */}
      <div
        onClick={(e) => { e.stopPropagation(); if (notif.actor) navigate(`/u/${notif.actor.username}`); }}
        className="w-9 h-9 rounded-full bg-accent-soft flex items-center justify-center text-sm font-semibold text-accent shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
      >
        {notif.actor?.avatar
          ? <img loading="lazy" src={notif.actor.avatar} alt="" className="w-full h-full object-cover" />
          : notif.actor
            ? notif.actor.username.slice(0, 2).toUpperCase()
            : (NOTIF_ICONS[notif.type] ?? "🔔")}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[13px] text-text-1 leading-snug">
          {notif.actor && (
            <span className="font-medium">{notif.actor.username} </span>
          )}
          {notif.message}
        </div>
        <div className="text-[11px] text-text-3 mt-1">
          {formatDate(notif.createdAt)}
        </div>
      </div>

      {!notif.isRead && (
        <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1.5" />
      )}
    </div>
  );
};

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.getAll(),
  });

  const notifications: Notification[] = data?.notifications ?? data ?? [];

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.setQueryData(["notif-count"], 0);
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: notificationsApi.clearAll,
    onSuccess: () => {
      queryClient.setQueryData(["notif-count"], 0);
      queryClient.setQueryData(["notifications"], { notifications: [], total: 0 });
    },
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Automatski označi sve kao pročitano pri otvaranju stranice
  useEffect(() => {
    if (unreadCount > 0) {
      markAllMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-serif text-[22px] text-text-1">Obaveštenja</h1>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
              className="text-[13px] text-accent bg-transparent border-none cursor-pointer font-medium hover:text-accent-hover transition-colors"
            >
              Označi sve kao pročitano
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={() => clearAllMutation.mutate()}
              disabled={clearAllMutation.isPending}
              className="flex items-center gap-1.5 text-[13px] text-text-3 hover:text-red-400 bg-transparent border-none cursor-pointer transition-colors disabled:opacity-50"
            >
              <Trash2 size={14} />
              Obriši sve
            </button>
          )}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
        {isLoading && <NotificationSkeleton count={6} />}

        {!isLoading && notifications.length === 0 && (
          <div className="text-center py-16">
            <div className="text-[40px] mb-3">🔔</div>
            <div className="font-serif text-[15px] text-text-1 mb-1">
              Nema obaveštenja
            </div>
            <div className="text-[13px] text-text-3">
              Ovde će se pojaviti aktivnosti vezane za tvoje postove i
              zajednice.
            </div>
          </div>
        )}

        {notifications.map((notif) => (
          <NotificationItem key={notif.id} notif={notif} />
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
