"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  Receipt,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/insights", label: "Insights", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface BottomNavProps {
  className?: string;
}

/**
 * Mobile bottom navigation bar.
 */
export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 right-4 z-40 md:hidden",
        "glass-card border border-slate-200 dark:border-white/10 backdrop-blur-xl",
        className,
      )}
    >
      <nav className="flex items-center justify-between px-4 py-3">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const href = query ? `${item.href}?${query}` : item.href;
          return (
            <Link
              key={item.href}
              href={href}
              className="flex flex-col items-center gap-1 text-xs"
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  active ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-500",
                )}
              />
              <span
                className={cn(
                  active ? "grad-text" : "text-slate-600 dark:text-slate-500",
                )}
              >
                {item.label}
              </span>
              <span
                className={cn(
                  "h-1 w-1 rounded-full",
                  active ? "bg-emerald-400" : "bg-transparent",
                )}
              />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
