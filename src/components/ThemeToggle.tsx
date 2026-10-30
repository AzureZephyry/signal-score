import { useTheme } from "../hooks/useTheme";
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "day" ? "Night" : "Day"} Mode`}
      aria-pressed={theme === "night"}
      title={`${theme === "day" ? "Day" : "Night"} Mode. Switch theme.`}
    >
      <svg
        className={theme === "day" ? "theme-active" : ""}
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </svg>
      <span className="theme-label">{theme === "day" ? "Day" : "Night"}</span>
      <svg
        className={theme === "night" ? "theme-active" : ""}
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M20.6 14A8.8 8.8 0 0 1 10 3.4 8.8 8.8 0 1 0 20.6 14Z" />
      </svg>
    </button>
  );
}
