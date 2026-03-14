"use client";

import { Moon, Sun } from "lucide-react";
import { useColorMode } from "@/components/providers/ColorModeProvider";
import { cn } from "@/lib/utils/cn";

interface ThemeToggleProps {
  className?: string;
}

/**
 * Dark/light toggle with system-aware state.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useColorMode();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border",
        "border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100",
        "dark:border-white/10 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10",
        className,
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
