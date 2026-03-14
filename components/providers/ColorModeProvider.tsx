"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type ColorMode = "light" | "dark" | "system";

type ColorModeContextValue = {
  theme: ColorMode;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ColorMode) => void;
};

const STORAGE_KEY = "fintrack-color-mode";

const getSystemTheme = () =>
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

const ColorModeContext = createContext<ColorModeContextValue | undefined>(undefined);

const isValidTheme = (value: string | null): value is ColorMode =>
  value === "light" || value === "dark" || value === "system";

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ColorMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    const initial = isValidTheme(stored) ? stored : "system";
    setThemeState(initial);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const applyTheme = (next: ColorMode) => {
      const systemTheme = getSystemTheme();
      const effective = next === "system" ? systemTheme : next;
      setResolvedTheme(effective);
      const root = document.documentElement;
      root.classList.toggle("dark", effective === "dark");
      root.style.colorScheme = effective;
    };

    applyTheme(theme);

    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = useCallback((next: ColorMode) => {
    setThemeState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
}

export function useColorMode() {
  const ctx = useContext(ColorModeContext);
  if (!ctx) {
    throw new Error("useColorMode must be used within ColorModeProvider");
  }
  return ctx;
}
