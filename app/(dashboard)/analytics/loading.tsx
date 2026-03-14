"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="glass-card p-5 h-24">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-28" />
          </div>
        ))}
      </div>
      <div className="glass-card p-5 h-64">
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-48 w-full" />
      </div>
      <div className="glass-card p-5 h-64">
        <Skeleton className="h-4 w-40 mb-4" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}