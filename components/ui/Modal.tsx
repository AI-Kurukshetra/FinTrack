"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

/**
 * Simple modal with backdrop and centered content.
 */
export function Modal({ open, onClose, title, description, className, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        aria-label="Close modal"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "glass-card grad-border relative w-[92vw] max-w-lg p-6",
          className,
        )}
      >
        {title ? (
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        ) : null}
        {description ? (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
        ) : null}
        <div className={cn("mt-4", title || description ? "" : "mt-0")}>{children}</div>
      </div>
    </div>
  );
}