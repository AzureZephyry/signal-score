import { useEffect, useState } from "react";
export type Theme = "day" | "night";
export const THEME_KEY = "signal-score-theme";
function savedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === "day" || value === "night" ? value : null;
  } catch {
    return null;
  }
}
function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "night"
    : "day";
}
function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme =
    theme === "night" ? "dark" : "light";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "night" ? "#242722" : "#eeece3");
}
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === "night" ? "night" : "day",
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      const next = savedTheme() ?? systemTheme();
      apply(next);
      setTheme(next);
    };
    const storage = (event: StorageEvent) => {
      if (event.key === THEME_KEY || event.key === null) sync();
    };
    query.addEventListener("change", sync);
    window.addEventListener("storage", storage);
    return () => {
      query.removeEventListener("change", sync);
      window.removeEventListener("storage", storage);
    };
  }, []);
  const toggle = () => {
    const next = theme === "day" ? "night" : "day";
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* The toggle still works when browser storage is unavailable. */
    }
    document.documentElement.classList.add("theme-changing");
    apply(next);
    setTheme(next);
    window.setTimeout(
      () => document.documentElement.classList.remove("theme-changing"),
      180,
    );
  };
  return { theme, toggle };
}
