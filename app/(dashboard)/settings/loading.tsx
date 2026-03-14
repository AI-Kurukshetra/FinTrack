"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card p-5 h-32">
        <Skeleton className="h-4 w-32 mb-3" />
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="glass-card p-5 h-40">
        <Skeleton className="h-4 w-32 mb-3" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="glass-card p-5 h-40">
        <Skeleton className="h-4 w-32 mb-3" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}