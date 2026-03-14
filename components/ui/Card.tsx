import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "plain";
}

const variantClasses: Record<NonNullable<CardProps["variant"]>, string> = {
  glass: "glass-card",
  plain: "bg-transparent",
};

/**
 * Card container with optional glass styling.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "glass", ...props }, ref) => (
    <div ref={ref} className={cn(variantClasses[variant], className)} {...props} />
  ),
);

Card.displayName = "Card";