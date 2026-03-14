"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LineChart,
  LogOut,
  Receipt,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/insights", label: "Insights", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  user: User;
  className?: string;
}

/**
 * Desktop sidebar navigation.
 */
export function Sidebar({ user, className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.toString();

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
    <aside
      className={cn(
        "glass-card grad-border flex h-screen flex-col p-4 transition-[width] duration-300",
        collapsed ? "w-16" : "w-60",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn("flex items-center gap-3", collapsed && "w-full justify-center")}> 
          <div className="glow-btn flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold">
            FT
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">FinTrack AI</p>
              <p className="text-xs text-slate-600 dark:text-slate-500">Personal finance</p>
            </div>
          )}
        </div>
        <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "hidden md:flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 p-1.5 text-slate-500 dark:text-slate-400",
            "hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20",
            collapsed && "-mr-1",
          )}
          onClick={() => setCollapsed((prev) => !prev)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const href = query ? `${item.href}?${query}` : item.href;
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(active ? "nav-item-active" : "nav-item", collapsed && "justify-center")}
            >
              <Icon className="h-4 w-4" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-slate-200 dark:border-white/10 pt-4">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}> 
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-white">
            {initials}
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm text-slate-900 dark:text-white">{displayName}</p>
              <p className="text-xs text-slate-600 dark:text-slate-500">{user.email}</p>
            </div>
          )}
        </div>
        <div className={cn("mt-3 flex items-center gap-2", collapsed && "justify-center")}> 
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className={cn("flex-1", collapsed && "hidden")}
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
