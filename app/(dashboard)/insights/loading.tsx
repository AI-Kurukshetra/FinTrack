"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function InsightsLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card p-5 h-16">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="glass-card p-5">
            <Skeleton className="h-4 w-32 mb-3" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}