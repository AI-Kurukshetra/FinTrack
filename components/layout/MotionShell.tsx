"use client";

import { AnimatePresence } from "framer-motion";

interface MotionShellProps {
  children: React.ReactNode;
}

export function MotionShell({ children }: MotionShellProps) {
  return <AnimatePresence mode="wait">{children}</AnimatePresence>;
}