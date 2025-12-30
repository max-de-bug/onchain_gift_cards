"use client";

import { motion } from "framer-motion";
import { Snowflake } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useChristmasStore } from "@/lib/store/christmasStore";
import { cn } from "@/lib/utils";

export function ChristmasToggle() {
  const { isChristmasMode, setIsChristmasMode } = useChristmasStore();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-sm px-3 py-1.5 shadow-lg"
    >
      <Snowflake
        className={cn(
          "h-4 w-4 transition-colors",
          isChristmasMode ? "text-red-500" : "text-[var(--muted-foreground)]"
        )}
      />
      <Label
        htmlFor="christmas-mode"
        className="text-sm font-medium cursor-pointer text-[var(--foreground)] hidden sm:inline-block"
      >
        Christmas
      </Label>
      <Switch
        id="christmas-mode"
        checked={isChristmasMode}
        onCheckedChange={setIsChristmasMode}
        className="data-[state=checked]:bg-red-500"
      />
    </motion.div>
  );
}

