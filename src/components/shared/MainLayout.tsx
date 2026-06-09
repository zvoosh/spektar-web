import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useAuthStore } from "@/store/authStore";
import {
  Home,
  Search,
  PenSquare,
  Bell,
  MessageCircle,
  TrendingUp,
  Calendar,
  Cloud,
  LogIn,
} from "lucide-react";
import { communitiesApi } from "@/api/communities";

const WEATHER_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: "Sunčano", icon: "☀️" },
  1: { label: "Pretežno sunčano", icon: "🌤️" },
  2: { label: "Delimično oblačno", icon: "⛅" },
  3: { label: "Oblačno", icon: "☁️" },
  45: { label: "Magla", icon: "🌫️" },
  48: { label: "Magla", icon: "🌫️" },
  51: { label: "Rosulja", icon: "🌦️" },
  61: { label: "Kiša", icon: "🌧️" },
  71: { label: "Sneg", icon: "🌨️" },
  80: { label: "Pljusak", icon: "⛈️" },
  95: { label: "Grmljavina", icon: "⛈️" },
};

const card =
  "bg-surface border border-border rounded-2xl py-4 px-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]";

const RightPanel = () => {
  const navigate = useNavigate();

  const { data: trending } = useQuery({
    queryKey: ["trending-tags"],
    queryFn: communitiesApi.getTrendingTags,
    staleTime: 30_000,
  });

  const { data: events } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: communitiesApi.getUpcomingEvents,
    staleTime: 5 * 60_000,
  });

  const { data: weather } = useQuery({
    queryKey: ["weather-belgrade"],
    queryFn: async () => {
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=44.8176&longitude=20.4569&current=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m,uv_index",
      );
      const data = await res.json();
      return data.current;
    },
    staleTime: 30 * 60_000,
  });

  return (
    <div className="flex flex-col gap-3.5">
      {/* Trending */}
      <div className={card}>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={15} className="text-accent" strokeWidth={2.5} />
          <span className="font-semibold text-[14px] text-text-1">
            Trending teme
          </span>
        </div>
        {trending && trending.length > 0 ? (
          trending.map((t, i) => (
            <div
              key={t.tag}
              onClick={() => navigate(`/search?tag=${encodeURIComponent(t.tag.replace(/^#+/, ""))}`)}
              className={`flex items-center py-2 cursor-pointer hover:bg-surface-2-2 rounded-lg px-1 -mx-1 transition-colors ${
                i < trending.length - 1 ? "border-b border-surface-2" : ""
              }`}
            >
              <div className="w-6 h-6 rounded-md bg-accent-soft flex items-center justify-center text-[10px] font-bold text-accent mr-2.5 shrink-0">
                #
              </div>
              <span className="text-[13px] text-text-1 flex-1 font-medium">
                #{t.tag.replace(/^#+/, "")}
              </span>
              <span className="text-[11px] text-text-3 bg-surface-2 px-2 py-0.5 rounded-full">
                {t.count}
              </span>
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-[12px] text-text-3">
            Nema trending tema za sada
          </div>
        )}
        <button
          onClick={() => navigate("/popular")}
          className="text-[12px] text-accent bg-transparent border-none cursor-pointer font-semibold mt-2.5 block hover:underline"
        >
          Vidi sve →
        </button>
      </div>

      {/* Events */}
      <div className={card}>
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={15} className="text-accent" strokeWidth={2.5} />
          <span className="font-semibold text-[14px] text-text-1">
            Predstojeći događaji
          </span>
        </div>
        {events && events.length > 0 ? (
          events.map((event, i) => {
            const d = new Date(event.eventDate);
            return (
              <div
                key={event.id}
                onClick={() => navigate(`/post/${event.id}`)}
                className={`flex gap-3 py-2 cursor-pointer hover:bg-surface-2-2 rounded-lg px-1 -mx-1 transition-colors ${
                  i < events.length - 1 ? "border-b border-surface-2" : ""
                }`}
              >
                <div className="w-9 h-9 rounded-xl shrink-0 bg-accent-soft flex flex-col items-center justify-center border border-accent/20">
                  <span className="text-[14px] font-bold text-accent leading-none">
                    {d.getDate()}
                  </span>
                  <span className="text-[8px] font-semibold text-accent/70 uppercase tracking-wider">
                    {d.toLocaleDateString("sr-RS", { month: "short" })}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-text-1 truncate">
                    {event.title}
                  </div>
                  <div className="text-[11px] text-text-3 mt-0.5">
                    {d.toLocaleTimeString("sr-RS", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {event.eventLocation && ` · ${event.eventLocation}`}
                    {` · ${event.communityName}`}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-4 text-center text-[12px] text-text-3">
            Nema predstojećih događaja
          </div>
        )}
      </div>

      {/* Weather */}
      <div
        className={`${card} bg-gradient-to-br from-[#1a8a57]/8 to-transparent`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Cloud size={15} className="text-accent" strokeWidth={2.5} />
          <span className="font-semibold text-[14px] text-text-1">
            Danas u Beogradu
          </span>
        </div>
        {weather ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[36px] leading-none">
                {WEATHER_CODES[weather.weathercode]?.icon ?? "🌤️"}
              </span>
              <div>
                <div className="text-[28px] font-bold text-text-1 leading-none">
                  {Math.round(weather.temperature_2m)}°
                </div>
                <div className="text-[11px] text-text-3 mt-0.5">
                  {WEATHER_CODES[weather.weathercode]?.label ?? ""}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 text-right">
              <div className="text-[11.5px] text-text-2">
                Vlažnost{" "}
                <span className="text-text-1 font-semibold">
                  {weather.relativehumidity_2m}%
                </span>
              </div>
              <div className="text-[11.5px] text-text-2">
                Vetar{" "}
                <span className="text-text-1 font-semibold">
                  {Math.round(weather.windspeed_10m)} km/h
                </span>
              </div>
              <div className="text-[11.5px] text-text-2">
                UV{" "}
                <span className="text-text-1 font-semibold">
                  {Math.round(weather.uv_index ?? 0)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-[12px] text-text-3 text-center py-2">
            Učitavam...
          </div>
        )}
      </div>
    </div>
  );
};

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const guestItems = [
    { icon: Home, label: "Početna", path: "/" },
    { icon: Search, label: "Pretraži", path: "/search" },
    { icon: LogIn, label: "Prijavi se", path: "/login" },
  ];

  const authItems = [
    { icon: Home, label: "Početna", path: "/" },
    { icon: Search, label: "Pretraži", path: "/search" },
    { icon: PenSquare, label: "Objavi", path: "/new-post" },
    { icon: Bell, label: "Notif", path: "/notifications" },
    { icon: MessageCircle, label: "Chat", path: "/chat" },
  ];

  const items = isAuthenticated ? authItems : guestItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-bg/95 backdrop-blur-md border-t border-border flex z-[200] pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.07)]">
      {items.map((item) => {
        const active = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => {
              const isAuth =
                item.path === "/login" || item.path === "/register";
              navigate(
                item.path,
                isAuth
                  ? { state: { background: location, from: location } }
                  : undefined,
              );
            }}
            className="flex-1 py-2.5 bg-transparent border-none cursor-pointer flex flex-col items-center gap-0.5"
          >
            <Icon
              size={20}
              strokeWidth={active ? 2.5 : 1.75}
              className={active ? "text-accent" : "text-text-3"}
            />
            <span
              className={`text-[9px] font-semibold ${active ? "text-accent" : "text-text-3"}`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

const DrawerSidebar = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => (
  <>
    {open && (
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/30 z-[150] backdrop-blur-[2px]"
      />
    )}
    <div
      className={`fixed top-0 left-0 bottom-0 w-[min(290px,85vw)] bg-bg z-[200] transition-transform duration-300 ease-out flex flex-col ${
        open
          ? "translate-x-0 shadow-[6px_0_30px_rgba(0,0,0,0.12)]"
          : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between px-4 pb-4 mb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <img loading="lazy" src="/spektarLogo.png" className="w-10 h-10 object-contain" />
          <span className="font-serif font-bold text-[17px] text-text-1">
            Spektar
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center border-none cursor-pointer text-text-3 hover:bg-border transition-colors"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-6">
        <Sidebar onNavigate={onClose} />
      </div>
    </div>
  </>
);

const MainLayout = () => {
  const { isMobile, isTablet } = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Drži trending-tags query aktivan uvek (ne samo kad je RightPanel vidljiv)
  // Tako invalidateQueries iz CreatePostPage uvek ima aktivnog subscribera
  useQuery({
    queryKey: ["trending-tags"],
    queryFn: communitiesApi.getTrendingTags,
    staleTime: 30_000,
  });

  const gridCols = isMobile
    ? "grid-cols-1"
    : isTablet
      ? "grid-cols-[230px_1fr]"
      : "grid-cols-[240px_1fr_280px]";

  const padding = isMobile ? "p-4" : isTablet ? "p-5" : "px-8 py-6";

  return (
    <div className={`min-h-screen bg-bg ${isMobile ? "pb-[70px]" : ""}`}>
      <div className="bg-bg/95 backdrop-blur-md border-b border-border sticky top-0 z-[100] flex justify-center shadow-[0_1px_0_rgba(0,0,0,0.05)]">
        <Navbar
          onMenuClick={() => setDrawerOpen(true)}
          showMenuButton={isMobile || isTablet}
        />
      </div>

      {(isMobile || isTablet) && (
        <DrawerSidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      )}

      <div
        className={`max-w-[1440px] mx-auto ${padding} grid ${gridCols} ${isMobile ? "gap-4" : "gap-5"} items-start`}
      >
        {!isMobile && !isTablet && <Sidebar />}
        {isTablet && <Sidebar />}

        <main className="min-w-0">
          <Outlet />
        </main>

        {!isMobile && !isTablet && <RightPanel />}
      </div>

      {isMobile && <BottomNav />}
    </div>
  );
};

export default MainLayout;
