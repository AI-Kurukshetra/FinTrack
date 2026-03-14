import * as React from "react";
import { cn } from "@/lib/utils/cn";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Shimmering skeleton placeholder.
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("skeleton", className)} {...props} />
  ),
);

Skeleton.displayName = "Skeleton";