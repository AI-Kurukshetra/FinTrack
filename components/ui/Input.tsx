"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Styled input with FinTrack theme.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn("fin-input", className)} {...props} />
  ),
);

Input.displayName = "Input";