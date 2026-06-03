import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { communitiesApi } from "@/api/communities";

const NAV_ITEMS = [
  { icon: "🏠", label: "Početna", path: "/" },
  { icon: "🔥", label: "Popularno", path: "/popular" },
  { icon: "📌", label: "Sačuvano", path: "/saved" },
  { icon: "🔔", label: "Obaveštenja", path: "/notifications" },
  { icon: "💬", label: "Poruke", path: "/chat" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: communities } = useQuery({
    queryKey: ["communities"],
    queryFn: communitiesApi.getAll,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Nav */}
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--color-border)",
          borderRadius: 16,
          padding: "8px 0",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <div
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 16px",
                cursor: "pointer",
                background: active ? "var(--color-accent-soft)" : "transparent",
                borderLeft: active
                  ? "3px solid var(--color-accent)"
                  : "3px solid transparent",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => {
                if (!active)
                  (e.currentTarget as HTMLDivElement).style.background =
                    "var(--color-surface-2)";
              }}
              onMouseLeave={(e) => {
                if (!active)
                  (e.currentTarget as HTMLDivElement).style.background =
                    "transparent";
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span
                style={{
                  fontSize: 13,
                  color: active ? "var(--color-accent)" : "var(--color-text-2)",
                  fontWeight: active ? 500 : 400,
                  flex: 1,
                }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* My communities */}
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--color-border)",
          borderRadius: 16,
          padding: "16px 0 10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-text-3)",
            }}
          >
            Moje zajednice
          </span>
          <span
            onClick={() => navigate("/communities/new")}
            style={{
              fontSize: 20,
              color: "var(--color-text-3)",
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            +
          </span>
        </div>

        {communities?.slice(0, 6).map((community) => (
          <div
            key={community.id}
            onClick={() => navigate(`/c/${community.slug}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 16px",
              cursor: "pointer",
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLDivElement).style.background =
                "var(--color-surface-2)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLDivElement).style.background =
                "transparent")
            }
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "var(--color-accent-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                flexShrink: 0,
                fontWeight: 600,
                color: "var(--color-accent)",
              }}
            >
              {community.name.slice(0, 1)}
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
                }}
              >
                {community.name}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-3)" }}>
                {community.membersCount} članova
              </div>
            </div>
            {community.type !== "public" && (
              <span style={{ fontSize: 10, color: "var(--color-text-3)" }}>
                🔒
              </span>
            )}
          </div>
        ))}

        <div style={{ padding: "8px 16px 2px" }}>
          <button
            onClick={() => navigate("/communities")}
            style={{
              fontSize: 12,
              color: "var(--color-accent)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
            }}
          >
            Istraži zajednice →
          </button>
        </div>
      </div>

      {/* CTA — Kreiraj zajednicu */}
      <div
        style={{
          background: "linear-gradient(145deg, #0F3D27, #1B8A5A)",
          borderRadius: 16,
          padding: "20px 18px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 17,
            color: "#fff",
            marginBottom: 6,
            lineHeight: 1.3,
          }}
        >
          Kreiraj svoju{" "}
          <em style={{ fontStyle: "italic", color: "#A8E6C8" }}>zajednicu</em>
        </div>
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.65)",
            marginBottom: 14,
            lineHeight: 1.6,
            fontWeight: 300,
          }}
        >
          Povezi ljude iz tvog kraja na jednom mestu.
        </div>
        <button
          onClick={() => navigate("/communities/new")}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: 8,
            background: "#fff",
            color: "var(--color-accent)",
            border: "none",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
          }}
        >
          Počni →
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
