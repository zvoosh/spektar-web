import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { notificationsApi } from "@/api/notifications";
import { Bell, PenSquare, Menu, User, Bookmark, LogOut } from "lucide-react";

const Navbar = ({
  onMenuClick,
  showMenuButton,
}: {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}) => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
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
      className={`justify-between w-full h-14 max-w-[1440px] flex items-center ${
        isMobile ? "px-3 gap-2" : "px-8 gap-6"
      }`}
    >
      {showMenuButton && (
        <button
          onClick={onMenuClick}
          className="w-9 h-9 rounded-xl border border-border bg-surface flex items-center justify-center cursor-pointer text-text-2 hover:bg-surface-2-2 transition-colors shrink-0"
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
          className="relative w-9 h-9 rounded-xl border border-border bg-surface flex items-center justify-center cursor-pointer text-text-2 hover:bg-surface-2-2 hover:text-accent transition-colors"
        >
          <Bell size={16} strokeWidth={2} />
          {(unreadCount ?? 0) > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-accent border-2 border-surface flex items-center justify-center text-[9px] font-bold text-white px-0.5">
              {unreadCount! > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className={`flex items-center gap-2 rounded-xl border border-border cursor-pointer bg-surface hover:bg-surface-2-2 transition-colors ${
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
          {dropdownOpen && <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] py-1.5 z-50">
            <div className="px-4 py-2 border-b border-surface-2 mb-1">
              <div className="text-[13px] font-semibold text-text-1">{user?.username}</div>
              <div className="text-[11px] text-text-3">{user?.email}</div>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="w-full text-left px-4 py-2 text-[13px] text-text-2 hover:bg-surface-2-2 hover:text-text-1 bg-transparent border-none cursor-pointer flex items-center gap-2.5 transition-colors"
            >
              <User size={14} className="text-text-3" />
              Moj profil
            </button>
            <button
              onClick={() => navigate("/saved")}
              className="w-full text-left px-4 py-2 text-[13px] text-text-2 hover:bg-surface-2-2 hover:text-text-1 bg-transparent border-none cursor-pointer flex items-center gap-2.5 transition-colors"
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
