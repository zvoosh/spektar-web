import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const TRENDING = [
  { tag: "košutnjak", count: 124 },
  { tag: "volonteri", count: 98 },
  { tag: "biciklizam", count: 87 },
  { tag: "hrana-bg", count: 64 },
  { tag: "događaji", count: 42 },
];

const PEOPLE = [
  { username: "petar_bg", community: "Vračar" },
  { username: "milica_s", community: "Hikers BG" },
  { username: "luka_dev", community: "Zemun" },
];

const UPCOMING_EVENTS = [
  {
    title: "Čišćenje Košutnjaka",
    date: "Sub, 15. jun",
    time: "10:00",
    community: "Vračar",
  },
  {
    title: "Grupna vožnja biciklima",
    date: "Ned, 16. jun",
    time: "08:00",
    community: "Biciklisti BG",
  },
  {
    title: "Farmers market Zemun",
    date: "Sub, 22. jun",
    time: "09:00",
    community: "Zemun",
  },
  {
    title: "Photo walk Kalemegdan",
    date: "Sub, 22. jun",
    time: "17:00",
    community: "Fotografija BG",
  },
];

const RightPanel = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Trending */}
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--color-border)",
          borderRadius: 16,
          padding: "18px 20px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 17,
            color: "var(--color-text-1)",
            marginBottom: 14,
          }}
        >
          Trendujuće teme
        </div>
        {TRENDING.map((t, i) => (
          <div
            key={t.tag}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "9px 0",
              borderBottom:
                i < TRENDING.length - 1
                  ? "1px solid var(--color-surface-2)"
                  : "none",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "var(--color-accent-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--color-accent)",
                marginRight: 10,
                flexShrink: 0,
              }}
            >
              #
            </div>
            <span
              style={{ fontSize: 13, color: "var(--color-text-1)", flex: 1 }}
            >
              {t.tag}
            </span>
            <span style={{ fontSize: 11, color: "var(--color-text-3)" }}>
              {t.count} postova
            </span>
          </div>
        ))}
        <button
          style={{
            fontSize: 12,
            color: "var(--color-accent)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            marginTop: 10,
            display: "block",
          }}
        >
          Vidi sve →
        </button>
      </div>

      {/* Upcoming events */}
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--color-border)",
          borderRadius: 16,
          padding: "18px 20px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 17,
            color: "var(--color-text-1)",
            marginBottom: 14,
          }}
        >
          Predstojeći događaji
        </div>
        {UPCOMING_EVENTS.map((event, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 12,
              padding: "9px 0",
              borderBottom:
                i < UPCOMING_EVENTS.length - 1
                  ? "1px solid var(--color-surface-2)"
                  : "none",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                flexShrink: 0,
                background: "var(--color-accent-soft)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: "var(--color-accent)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {event.date.split(" ")[1].replace(".", "")}
              </span>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--color-accent)",
                  lineHeight: 1,
                }}
              >
                {event.date.split(" ")[2]?.replace(".", "")}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--color-text-1)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginBottom: 3,
                }}
              >
                {event.title}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-3)" }}>
                {event.time} · {event.community}
              </div>
            </div>
          </div>
        ))}
        <button
          style={{
            fontSize: 12,
            color: "var(--color-accent)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            marginTop: 10,
            display: "block",
          }}
        >
          Svi događaji →
        </button>
      </div>

      {/* People */}
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--color-border)",
          borderRadius: 16,
          padding: "18px 20px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 17,
            color: "var(--color-text-1)",
            marginBottom: 14,
          }}
        >
          Možda ih poznajete
        </div>
        {PEOPLE.map((p, i) => (
          <div
            key={p.username}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 0",
              borderBottom:
                i < PEOPLE.length - 1
                  ? "1px solid var(--color-surface-2)"
                  : "none",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "var(--color-accent-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--color-accent)",
                flexShrink: 0,
              }}
            >
              {p.username.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--color-text-1)",
                }}
              >
                {p.username}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-3)" }}>
                {p.community}
              </div>
            </div>
            <button
              style={{
                fontSize: 11,
                padding: "5px 12px",
                borderRadius: 20,
                border: "1px solid var(--color-border)",
                background: "#fff",
                color: "var(--color-accent)",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
              }}
            >
              Prati
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Mobile bottom nav
const BottomNav = () => {
  const navigate = useNavigate();
  const items = [
    { icon: "🏠", label: "Početna", path: "/" },
    { icon: "🔍", label: "Pretraži", path: "/search" },
    { icon: "➕", label: "Objavi", path: "/new-post" },
    { icon: "🔔", label: "Notif", path: "/notifications" },
    { icon: "💬", label: "Chat", path: "/chat" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#fff",
        borderTop: "1px solid var(--color-border)",
        display: "flex",
        zIndex: 200,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {items.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          style={{
            flex: 1,
            padding: "10px 0",
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          <span
            style={{
              fontSize: 9,
              color: "var(--color-text-3)",
              fontFamily: "var(--font-sans)",
            }}
          >
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};

// Mobile drawer sidebar
const DrawerSidebar = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 150,
            backdropFilter: "blur(2px)",
          }}
        />
      )}
      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "min(280px, 85vw)",
          background: "var(--color-bg)",
          zIndex: 200,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
          overflowY: "auto",
          padding: "16px 0",
          boxShadow: open ? "4px 0 24px rgba(0,0,0,0.1)" : "none",
        }}
      >
        <div
          style={{
            padding: "0 16px 16px",
            borderBottom: "1px solid var(--color-border)",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 20,
                color: "var(--color-text-1)",
              }}
            >
              Spektar
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: "var(--color-text-3)",
              }}
            >
              ✕
            </button>
          </div>
        </div>
        <Sidebar />
      </div>
    </>
  );
};

const MainLayout = () => {
  const { isMobile, isTablet } = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const getGridLayout = () => {
    if (isMobile) return { gridTemplateColumns: "1fr", padding: "16px" };
    if (isTablet)
      return { gridTemplateColumns: "220px 1fr", padding: "20px 20px" };
    return { gridTemplateColumns: "260px 1fr 300px", padding: "28px 40px" };
  };

  const layout = getGridLayout();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        paddingBottom: isMobile ? 70 : 0,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid var(--color-border)",
        }}
        className="flex justify-center"
      >
        <Navbar
          onMenuClick={() => setDrawerOpen(true)}
          showMenuButton={isMobile || isTablet}
        />
      </div>

      {/* Mobile/Tablet drawer */}
      {(isMobile || isTablet) && (
        <DrawerSidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      )}

      <div
        style={{
          maxWidth: 1920,
          margin: "0 auto",
          padding: layout.padding,
          display: "grid",
          gridTemplateColumns: layout.gridTemplateColumns,
          gap: isMobile ? 16 : 24,
          alignItems: "start",
        }}
      >
        {/* Sidebar — samo na desktop */}
        {!isMobile && !isTablet && <Sidebar />}
        {isTablet && <Sidebar />}

        {/* Main */}
        <main style={{ minWidth: 0 }}>
          <Outlet />
        </main>

        {/* Right panel — samo na wide desktop */}
        {!isMobile && !isTablet && <RightPanel />}
      </div>

      {/* Mobile bottom nav */}
      {isMobile && <BottomNav />}
    </div>
  );
};

export default MainLayout;
