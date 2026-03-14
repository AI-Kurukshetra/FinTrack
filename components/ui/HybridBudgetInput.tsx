"use client";

import { Target } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/Input";

interface HybridBudgetInputProps {
  value: number;
  min?: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  statusSlot?: React.ReactNode;
  layout?: "inline" | "split";
  className?: string;
}

/**
 * Hybrid control with range slider + number input.
 */
export function HybridBudgetInput({
  value,
  min = 0,
  max,
  step = 100,
  onChange,
  statusSlot,
  layout = "inline",
  className,
  disabled = false,
}: HybridBudgetInputProps) {
  const containerClass =
    layout === "split"
      ? "contents"
      : "grid gap-4 md:grid-cols-[1fr_auto] items-center";

  return (
    <div className={cn(containerClass, className)}>
      <div className="space-y-2">
        {statusSlot ? <div>{statusSlot}</div> : null}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={String(value)}
          onChange={(event) => onChange(Number(event.target.value))}
          disabled={disabled}
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full",
            "bg-slate-200 dark:bg-white/10 accent-emerald-400",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
      </div>
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-emerald-400" />
        <Input
          type="number"
          min="0"
          step={step}
          value={String(value)}
          onChange={(event) => onChange(Number(event.target.value))}
          disabled={disabled}
          className="w-28 text-right"
        />
      </div>
    </div>
  );
}
