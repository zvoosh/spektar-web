import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Bell, UserPlus, Heart, MessageSquare, Users, Check, Building2 } from "lucide-react";
import { notificationsApi } from "@/api/notifications";
import { communitiesApi } from "@/api/communities";
import { useAuthStore } from "@/store/authStore";
import { useSocket } from "@/hooks/useSocket";
import type { Notification } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { sr } from "date-fns/locale";

const TYPE_ICON: Record<string, React.ReactNode> = {
  friend_request: <UserPlus size={14} className="text-accent" />,
  friend_accepted: <UserPlus size={14} className="text-accent" />,
  post_vote: <Heart size={14} className="text-red-400" />,
  post_comment: <MessageSquare size={14} className="text-blue-400" />,
  comment_reply: <MessageSquare size={14} className="text-blue-400" />,
  community_join_request: <Users size={14} className="text-amber-400" />,
  community_join_approved: <Users size={14} className="text-accent" />,
  community_invite: <Building2 size={14} className="text-accent" />,
  chat_invite: <MessageSquare size={14} className="text-text-3" />,
};

function notifLink(n: Notification): string {
  switch (n.type) {
    case "friend_request":
    case "friend_accepted":
      return n.actor ? `/u/${n.actor.username}` : "/";
    case "post_vote":
    case "post_comment":
    case "comment_reply":
    case "new_post":
      return n.entityId ? `/post/${n.entityId}` : "/";
    case "community_invite":
      return n.entityId ? `/c/${n.entityId}` : "/communities";
    case "community_join_request":
    case "community_join_approved":
    case "community_join_rejected":
    case "gallery_approved":
    case "gallery_rejected":
      return "/communities";
    case "chat_invite":
      return "/chat";
    default:
      return "/";
  }
}

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const socket = useSocket();

  const { data: countData } = useQuery({
    queryKey: ["notif-count"],
    queryFn: notificationsApi.getUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });

  const { data: notifsData, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.getAll(1),
    enabled: isAuthenticated && open,
  });

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.setQueryData(["notif-count"], 0);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notif-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const acceptInviteMutation = useMutation({
    mutationFn: ({ communityId, notifId }: { communityId: string; notifId: string }) =>
      communitiesApi.acceptInvite(communityId).then(() => notificationsApi.markAsRead(notifId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notif-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const rejectInviteMutation = useMutation({
    mutationFn: ({ communityId, notifId }: { communityId: string; notifId: string }) =>
      communitiesApi.rejectInvite(communityId).then(() => notificationsApi.markAsRead(notifId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notif-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Real-time: listen for new notification via socket
  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ["notif-count"] });
      if (open) queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };
    socket.on("notification", handler);
    return () => { socket.off("notification", handler); };
  }, [socket, open, queryClient]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isAuthenticated) return null;

  const unread = typeof countData === "number" ? countData : 0;
  const notifications: Notification[] = notifsData?.notifications ?? [];

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open) refetch();
  };

  const handleClick = (n: Notification) => {
    if (!n.isRead) markOneMutation.mutate(n.id);
    setOpen(false);
    navigate(notifLink(n));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center cursor-pointer hover:bg-surface-2 transition-colors"
      >
        <Bell size={17} className="text-text-2" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-16 sm:top-11 sm:w-80 bg-surface border border-border rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.18)] z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-[14px] text-text-1">Notifikacije</span>
            {unread > 0 && (
              <button
                onClick={() => markAllMutation.mutate()}
                className="flex items-center gap-1 text-[11px] text-accent hover:text-accent-hover cursor-pointer bg-transparent border-none transition-colors"
              >
                <Check size={12} />
                Označi sve
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-text-3 text-[13px]">
                <Bell size={28} className="mx-auto mb-2 opacity-30" />
                Nema notifikacija
              </div>
            ) : (
              notifications.map((n) => {
              if (n.type === "community_invite" && !n.isRead) {
                // Inline accept/reject for community invites
                return (
                  <div
                    key={n.id}
                    onClick={() => { setOpen(false); navigate(`/c/${n.entityId}`); }}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0 bg-accent-soft/30 cursor-pointer hover:bg-accent-soft/50 transition-colors`}
                  >
                    <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center text-[11px] font-bold text-accent shrink-0 overflow-hidden">
                      {n.actor?.avatar ? (
                        <img src={n.actor.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        n.actor?.username?.slice(0, 2).toUpperCase() ?? "?"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {TYPE_ICON["community_invite"]}
                        <span className="text-[12px] font-semibold text-text-1 truncate">
                          {n.actor?.displayName || n.actor?.username}
                        </span>
                      </div>
                      <p className="text-[12px] text-text-2 leading-snug line-clamp-2">{n.message}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); acceptInviteMutation.mutate({ communityId: n.entityId!, notifId: n.id }); }}
                          disabled={acceptInviteMutation.isPending || rejectInviteMutation.isPending}
                          className="px-3 py-1 rounded-lg bg-accent text-white text-[11px] font-semibold cursor-pointer hover:bg-accent-hover transition-colors disabled:opacity-50"
                        >
                          Prihvati
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); rejectInviteMutation.mutate({ communityId: n.entityId!, notifId: n.id }); }}
                          disabled={acceptInviteMutation.isPending || rejectInviteMutation.isPending}
                          className="px-3 py-1 rounded-lg bg-surface-2 text-text-2 text-[11px] font-semibold cursor-pointer hover:bg-surface border border-border transition-colors disabled:opacity-50"
                        >
                          Odbij
                        </button>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1.5" />
                  </div>
                );
              }

              return (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-surface-2 transition-colors border-b border-border/50 last:border-0 cursor-pointer ${
                    !n.isRead ? "bg-accent-soft/30" : ""
                  }`}
                >
                  {/* Actor avatar */}
                  <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center text-[11px] font-bold text-accent shrink-0 overflow-hidden">
                    {n.actor?.avatar ? (
                      <img src={n.actor.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      n.actor?.username?.slice(0, 2).toUpperCase() ?? "?"
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {TYPE_ICON[n.type] ?? <Bell size={14} className="text-text-3" />}
                      <span className="text-[12px] font-semibold text-text-1 truncate">
                        {n.actor?.displayName || n.actor?.username}
                      </span>
                    </div>
                    <p className="text-[12px] text-text-2 leading-snug line-clamp-2">{n.message}</p>
                    <span className="text-[11px] text-text-3 mt-0.5 block">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: sr })}
                    </span>
                  </div>

                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1.5" />
                  )}
                </button>
              );
            })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
