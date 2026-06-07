import { create } from "zustand";

export type Theme = "dark" | "light" | "system";

const STORAGE_KEY = "spektar_theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("light", !prefersDark);
  } else {
    root.classList.toggle("light", theme === "light");
  }
}

// Read initial value synchronously
const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "dark";

// Apply before first render
applyTheme(stored);

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: stored,
  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
    set({ theme });
  },
}));

// Listen for system preference changes
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  const current = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "dark";
  if (current === "system") applyTheme("system");
});
