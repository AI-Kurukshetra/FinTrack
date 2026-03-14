"use client";

import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const titleMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/expenses": "Expenses",
  "/analytics": "Analytics",
  "/insights": "AI Insights",
  "/settings": "Settings",
};

interface HeaderProps {
  user: User;
  className?: string;
}

/**
 * Mobile header bar.
 */
export function Header({ user, className }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const title = titleMap[Object.keys(titleMap).find((key) => pathname.startsWith(key)) ?? ""] ?? "";
  const displayName =
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split("@")[0] ??
    "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header
      className={cn(
        "md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3",
        "bg-white/80 dark:bg-ink-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="glow-btn flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold">FT</div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
          <p className="text-xs text-slate-600 dark:text-slate-500">Welcome back</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-white">
          {initials}
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut} aria-label="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
