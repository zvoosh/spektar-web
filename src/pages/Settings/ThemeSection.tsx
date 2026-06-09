import { useThemeStore, type Theme } from "@/store/themeStore";
import { Sun, Moon, Monitor, Sunset } from "lucide-react";

const THEME_OPTIONS: { value: Theme; label: string; desc: string; Icon: React.ElementType }[] = [
  { value: "dark",      label: "Tamna",      desc: "Uvek tamna tema",            Icon: Moon    },
  { value: "soft-dark", label: "Soft dark",  desc: "Topla tamna tema",           Icon: Sunset  },
  { value: "light",     label: "Svetla",     desc: "Uvek svetla tema",           Icon: Sun     },
  { value: "system",    label: "Sistem",     desc: "Prati podešavanja uređaja",  Icon: Monitor },
];

const ThemeSection = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center">
          <Sun size={18} className="text-text-3" strokeWidth={2} />
        </div>
        <div>
          <div className="font-semibold text-[14px] text-text-1">Izgled</div>
          <div className="text-[12px] text-text-3">Odaberi temu aplikacije</div>
        </div>
      </div>

      <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {THEME_OPTIONS.map(({ value, label, desc, Icon }) => {
          const active = theme === value;
          return (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 cursor-pointer transition-all text-center ${
                active
                  ? "border-accent bg-accent-soft"
                  : "border-border bg-surface-2 hover:border-border-strong"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${active ? "bg-accent text-white" : "bg-surface text-text-3"}`}>
                <Icon size={18} strokeWidth={2} />
              </div>
              <div>
                <div className={`text-[13px] font-semibold ${active ? "text-accent" : "text-text-1"}`}>{label}</div>
                <div className="text-[10.5px] text-text-3 mt-0.5 leading-tight">{desc}</div>
              </div>
              {active && <div className="w-1.5 h-1.5 rounded-full bg-accent mt-0.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSection;
