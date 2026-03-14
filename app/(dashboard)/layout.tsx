import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { FilterBar } from "@/components/layout/FilterBar";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { createClient } from "@/lib/supabase/server";
import { MotionShell } from "@/components/layout/MotionShell";

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Dashboard shell layout.
 */
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-ink-900">
      <Sidebar user={user} className="hidden md:flex" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} className="md:hidden" />

        <main className="flex-1 overflow-y-auto px-4 pb-24 pt-6 md:px-6 md:pb-6 lg:px-8 space-y-6">
          <FilterBar />
          <MotionShell>{children}</MotionShell>
        </main>
      </div>

      <BottomNav className="md:hidden" />
    </div>
  );
}
