import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { notificationsApi } from "@/api/notifications";
import { Search, Bell, PenSquare, Menu, User, Bookmark, LogOut } from "lucide-react";

const Navbar = ({
  onMenuClick,
  showMenuButton,
}: {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}) => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const { data: unreadCount } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: notificationsApi.getUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className={`justify-between w-full h-14 max-w-[1920px] flex items-center ${
        isMobile ? "px-3 gap-2" : "px-8 gap-6"
      }`}
    >
      {showMenuButton && (
        <button
          onClick={onMenuClick}
          className="w-9 h-9 rounded-xl border border-border bg-white flex items-center justify-center cursor-pointer text-text-2 hover:bg-surface-2 transition-colors shrink-0"
        >
          <Menu size={17} strokeWidth={2} />
        </button>
      )}

      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-2.5 cursor-pointer shrink-0"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-[0_2px_8px_rgba(26,138,87,0.35)] shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
        {!isMobile && (
          <div>
            <div className="font-serif font-bold text-[17px] text-text-1 leading-none tracking-tight">
              Spektar
            </div>
            <div className="text-[10px] font-semibold text-text-3 tracking-widest uppercase mt-0.5">
              Beograd
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      {!isMobile && (
        <div className="flex-1 max-w-[480px] relative">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none"
            strokeWidth={2}
          />
          <input
            onFocus={() => { setSearchFocused(true); navigate("/search"); }}
            onBlur={() => setSearchFocused(false)}
            placeholder="Pretraži zajednice, postove, ljude..."
            className={`w-full py-2 pl-9.5 pr-10 rounded-xl border text-[13px] text-text-1 outline-none font-sans transition-all duration-200 ${
              searchFocused
                ? "border-accent bg-white shadow-[0_0_0_3px_rgba(26,138,87,0.12)]"
                : "border-border bg-surface-2 hover:bg-white hover:border-border-strong"
            }`}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-3 bg-white border border-border px-1.5 py-0.5 rounded font-mono shadow-[0_1px_2px_rgba(0,0,0,0.06)] pointer-events-none">
            ⌘K
          </kbd>
        </div>
      )}

      <div className={`ml-auto flex items-center shrink-0 ${isMobile ? "gap-1.5" : "gap-2"}`}>
        {/* New post */}
        <button
          onClick={() => navigate("/new-post")}
          className={`rounded-xl bg-accent hover:bg-accent-hover text-white border-none text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 transition-colors shadow-[0_2px_8px_rgba(26,138,87,0.3)] ${
            isMobile ? "px-2.5 py-2" : "px-4 py-2"
          }`}
        >
          <PenSquare size={14} strokeWidth={2.5} />
          {!isMobile && "Novi post"}
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate("/notifications")}
          className="relative w-9 h-9 rounded-xl border border-border bg-white flex items-center justify-center cursor-pointer text-text-2 hover:bg-surface-2 hover:text-accent transition-colors"
        >
          <Bell size={16} strokeWidth={2} />
          {(unreadCount ?? 0) > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-accent border-2 border-white flex items-center justify-center text-[9px] font-bold text-white px-0.5">
              {unreadCount! > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className={`flex items-center gap-2 rounded-xl border border-border cursor-pointer bg-white hover:bg-surface-2 transition-colors ${
              isMobile ? "p-1.5" : "py-1.5 px-2.5"
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-accent-soft flex items-center justify-center text-[10px] font-bold text-accent shrink-0 overflow-hidden border border-border">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                user?.username.slice(0, 2).toUpperCase()
              )}
            </div>
            {!isMobile && (
              <span className="text-[13px] font-semibold text-text-1">{user?.username}</span>
            )}
          </button>

          {/* Dropdown */}
          {dropdownOpen && <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-border rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] py-1.5 z-50">
            <div className="px-4 py-2 border-b border-surface-2 mb-1">
              <div className="text-[13px] font-semibold text-text-1">{user?.username}</div>
              <div className="text-[11px] text-text-3">{user?.email}</div>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="w-full text-left px-4 py-2 text-[13px] text-text-2 hover:bg-surface-2 hover:text-text-1 bg-transparent border-none cursor-pointer flex items-center gap-2.5 transition-colors"
            >
              <User size={14} className="text-text-3" />
              Moj profil
            </button>
            <button
              onClick={() => navigate("/saved")}
              className="w-full text-left px-4 py-2 text-[13px] text-text-2 hover:bg-surface-2 hover:text-text-1 bg-transparent border-none cursor-pointer flex items-center gap-2.5 transition-colors"
            >
              <Bookmark size={14} className="text-text-3" />
              Sačuvano
            </button>
            <div className="my-1 mx-3 border-t border-surface-2" />
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-[13px] text-danger hover:bg-danger-soft bg-transparent border-none cursor-pointer flex items-center gap-2.5 transition-colors"
            >
              <LogOut size={14} />
              Odjavi se
            </button>
          </div>}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
