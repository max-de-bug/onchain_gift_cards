"use client";

import { ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import { useChristmasStore } from "@/lib/store/christmasStore";
import { SnowAnimation } from "@/components/SnowAnimation";
import { cn } from "@/lib/utils";

interface ChristmasWrapperProps {
  children: ReactNode;
  className?: string;
}

export function ChristmasWrapper({ children, className }: ChristmasWrapperProps) {
  const isChristmasMode = useChristmasStore((state) => state.isChristmasMode);

  return (
    <div
      className={cn(
        "relative transition-all duration-700 ease-in-out overflow-hidden",
        isChristmasMode
          ? "christmas-bg"
          : "bg-gradient-to-b from-[var(--background)] to-[var(--muted)]/20",
        className
      )}
    >
      <AnimatePresence>
        {isChristmasMode && <SnowAnimation key="snow" />}
      </AnimatePresence>
      {children}
    </div>
  );
}

