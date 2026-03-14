"use client";

import { useCallback, useEffect, useState } from "react";

const THEME_KEY = "fintrack-theme";

export type ThemeName = "emerald" | "ocean" | "ember";

const themeClasses: Record<ThemeName, string> = {
  emerald: "theme-emerald",
  ocean: "theme-ocean",
  ember: "theme-ember",
};

const isThemeName = (value: string | null): value is ThemeName => {
  return value === "emerald" || value === "ocean" || value === "ember";
};

const applyThemeClass = (theme: ThemeName) => {
  const root = document.documentElement;
  Object.values(themeClasses).forEach((className) => root.classList.remove(className));
  root.classList.add(themeClasses[theme]);
};

/**
 * Manage persisted UI theme selection.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName>("emerald");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(THEME_KEY) : null;
    const initial = isThemeName(stored) ? stored : "emerald";
    setThemeState(initial);
    applyThemeClass(initial);
    setReady(true);
  }, []);

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_KEY, next);
    }
    applyThemeClass(next);
  }, []);

  return { theme, setTheme, ready };
}
