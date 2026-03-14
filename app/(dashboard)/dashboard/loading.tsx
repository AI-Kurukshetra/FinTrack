"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="glass-card p-5 h-28">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="glass-card p-5 h-64">
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-48 w-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-card p-5 h-60">
          <Skeleton className="h-4 w-28 mb-4" />
          <Skeleton className="h-44 w-full" />
        </div>
        <div className="glass-card p-5 h-60">
          <Skeleton className="h-4 w-28 mb-4" />
          <Skeleton className="h-44 w-full" />
        </div>
      </div>
    </div>
  );
}