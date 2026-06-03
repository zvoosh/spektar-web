import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const Navbar = ({
  onMenuClick,
  showMenuButton,
}: {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);
  const { isMobile } = useBreakpoint();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className={`justify-between w-full h-14.5 max-w-480 flex items-center sticky top-0 z-99 ${isMobile ? "px-3 gap-2" : "px-6 gap-8"}`}
    >
      {showMenuButton && (
        <button
          onClick={onMenuClick}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          ☰
        </button>
      )}

      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "var(--color-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          🗺
        </div>
        {!isMobile && (
          <div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 17,
                color: "var(--color-text-1)",
                lineHeight: 1,
              }}
            >
              Spektar
            </div>
            <div
              style={{
                fontSize: 10,
                color: "var(--color-text-3)",
                letterSpacing: "0.05em",
              }}
            >
              Beograd · zajednica
            </div>
          </div>
        )}
      </div>

      {/* Search — hidden on mobile (accessible via bottom nav) */}
      {!isMobile && (
        <div style={{ flex: 1, maxWidth: 480, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-3)",
              fontSize: 14,
            }}
          >
            🔍
          </div>
          <input
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Pretraži zajednice, postove, ljude..."
            style={{
              width: "100%",
              padding: "9px 40px 9px 36px",
              borderRadius: 10,
              border: `1px solid ${searchFocused ? "var(--color-accent)" : "var(--color-border)"}`,
              background: searchFocused ? "#fff" : "var(--color-bg)",
              fontSize: 13,
              color: "var(--color-text-1)",
              outline: "none",
              fontFamily: "var(--font-sans)",
              boxShadow: searchFocused
                ? "0 0 0 3px var(--color-accent-soft)"
                : "none",
              transition: "all 0.15s",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 10,
              color: "var(--color-text-3)",
              background: "var(--color-surface-2)",
              padding: "2px 6px",
              borderRadius: 4,
              fontFamily: "monospace",
            }}
          >
            ⌘K
          </div>
        </div>
      )}

      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: isMobile ? 6 : 10,
          flexShrink: 0,
        }}
      >
        {/* New post — icon-only on mobile */}
        <button
          onClick={() => navigate("/new-post")}
          style={{
            padding: isMobile ? "8px 10px" : "8px 18px",
            borderRadius: 8,
            background: "var(--color-accent)",
            color: "#fff",
            border: "none",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
          {!isMobile && "Novi post"}
        </button>

        {/* Notifications */}
        <div
          style={{
            position: "relative",
            width: 36,
            height: 36,
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          🔔
          <div
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--color-accent)",
              border: "2px solid #fff",
            }}
          />
        </div>

        {/* User — avatar-only on mobile */}
        <div
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: isMobile ? "4px" : "4px 10px",
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            cursor: "pointer",
            background: "#fff",
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "var(--color-accent-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--color-accent)",
            }}
          >
            {user?.username.slice(0, 2).toUpperCase()}
          </div>
          {!isMobile && (
            <>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--color-text-1)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {user?.username}
              </span>
              <span style={{ fontSize: 10, color: "var(--color-text-3)" }}>
                ▾
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
