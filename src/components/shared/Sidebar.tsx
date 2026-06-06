import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { communitiesApi } from "@/api/communities";
import { notificationsApi } from "@/api/notifications";
import { useAuthStore } from "@/store/authStore";
import {
  Home,
  Flame,
  Bookmark,
  Bell,
  MessageCircle,
  Plus,
  ChevronRight,
  Search,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: Home, label: "Početna", path: "/" },
  { icon: Flame, label: "Popularno", path: "/popular" },
  { icon: Bookmark, label: "Sačuvano", path: "/saved" },
  { icon: Bell, label: "Obaveštenja", path: "/notifications" },
  { icon: MessageCircle, label: "Poruke", path: "/chat" },
  { icon: Search, label: "Pretraga", path: "/search" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const { data: communities } = useQuery({
    queryKey: ["communities"],
    queryFn: communitiesApi.getAll,
  });

  const { data: unreadCount } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: notificationsApi.getUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });

  return (
    <div className="flex flex-col gap-3 pb-10">
      {/* Nav */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`relative flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors duration-100 ${
                active
                  ? "bg-accent-soft text-accent"
                  : "text-text-2 hover:bg-surface-2-2 hover:text-text-1"
              }`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] bg-accent rounded-r-full" />
              )}
              <Icon
                size={17}
                strokeWidth={active ? 2.5 : 2}
                className={active ? "text-accent" : "text-text-3"}
              />
              <span className={`text-[13.5px] flex-1 ${active ? "font-semibold" : "font-medium"}`}>
                {item.label}
              </span>
              {item.path === "/notifications" && (unreadCount ?? 0) > 0 && (
                <span className="min-w-[18px] h-[18px] rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {unreadCount! > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* My communities */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
          <span className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-text-3">
            Moje zajednice
          </span>
          <button
            onClick={() => navigate("/communities/new")}
            className="w-5 h-5 rounded-md bg-accent-soft flex items-center justify-center cursor-pointer border-none hover:bg-accent hover:text-white transition-colors"
          >
            <Plus size={12} className="text-accent hover:text-white" strokeWidth={2.5} />
          </button>
        </div>

        {communities?.filter((c) => c.isMember).slice(0, 6).map((community) => (
          <div
            key={community.id}
            onClick={() => navigate(`/c/${community.slug}`)}
            className="flex items-center gap-2.5 px-4 py-2 cursor-pointer hover:bg-surface-2-2 transition-colors duration-100 group"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 bg-accent-soft flex items-center justify-center text-[11px] font-bold text-accent border border-border">
              {community.avatar ? (
                <img src={community.avatar} alt={community.name} className="w-full h-full object-cover" />
              ) : (
                community.name.slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-text-1 truncate group-hover:text-accent transition-colors">
                {community.name}
              </div>
              <div className="text-[11px] text-text-3">
                {community.membersCount?.toLocaleString("sr-RS")} č.
              </div>
            </div>
            {community.type !== "public" && (
              <div className="w-3.5 h-3.5 opacity-40">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-text-3">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            )}
          </div>
        ))}

        <div className="px-4 py-2.5 border-t border-surface-2 mt-1">
          <button
            onClick={() => navigate("/communities")}
            className="flex items-center gap-1 text-[12.5px] text-accent bg-transparent border-none cursor-pointer font-semibold hover:gap-2 transition-all"
          >
            Istraži zajednice
            <ChevronRight size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl p-5 bg-gradient-to-br from-[#0d4f2e] via-[#155e38] to-[#1a8a57] shadow-[0_4px_20px_rgba(26,138,87,0.25)]">
        <div className="font-serif text-[16px] text-white mb-1.5 leading-[1.35]">
          Kreiraj svoju <em className="italic text-[#7de0b0]">zajednicu</em>
        </div>
        <div className="text-[12px] text-white/60 mb-4 leading-relaxed font-light">
          Poveži ljude iz svog kraja na jednom mestu.
        </div>
        <button
          onClick={() => navigate("/communities/new")}
          className="w-full py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-[13px] font-semibold cursor-pointer transition-colors backdrop-blur-sm"
        >
          Počni →
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
