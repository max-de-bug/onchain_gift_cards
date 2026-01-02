"use client";

import { PageTransition } from "@/components/PageTransition";
import { ChristmasWrapper } from "@/components/ChristmasWrapper";
import { SolanaFaucet } from "@/components/SolanaFaucet";
import { useChristmasStore } from "@/lib/store/christmasStore";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function FaucetPage() {
  const isChristmasMode = useChristmasStore((state) => state.isChristmasMode);

  return (
    <PageTransition>
      <ChristmasWrapper className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-8 md:py-16">
        <main className="flex w-full max-w-6xl flex-col items-center gap-8 md:gap-12 relative z-10">
          {/* Back Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-4xl"
          >
            <Link
              href="/create"
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105",
                isChristmasMode
                  ? "text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                  : "text-[var(--foreground)] hover:bg-[var(--muted)]/50"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Create Gift Card
            </Link>
          </motion.div>

          {/* Faucet Component */}
          <SolanaFaucet />
        </main>
      </ChristmasWrapper>
    </PageTransition>
  );
}