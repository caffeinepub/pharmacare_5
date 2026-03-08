import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pharmacare-theme";

// Apply theme immediately on module load (before first render)
function initTheme(): boolean {
  const saved = localStorage.getItem(STORAGE_KEY);
  let dark: boolean;
  if (saved === "dark") {
    dark = true;
  } else if (saved === "light") {
    dark = false;
  } else {
    // Fallback: system preference
    dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  if (dark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  return dark;
}

// Run once at module load to avoid flash
const _initial = initTheme();

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(_initial);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  const toggle = useCallback(() => setIsDark((prev) => !prev), []);

  return { isDark, toggle };
}
