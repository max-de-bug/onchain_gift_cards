"use client";

import { PageTransition } from "@/components/PageTransition";
import { ChristmasWrapper } from "@/components/ChristmasWrapper";
import { GiftCardManager } from "@/components/GiftCardManager";
import { useChristmasStore } from "@/lib/store/christmasStore";
import { cn } from "@/lib/utils";

export default function CreatePage() {
  const isChristmasMode = useChristmasStore((state) => state.isChristmasMode);

  return (
    <PageTransition>
      <ChristmasWrapper className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16">
        <main className="flex w-full max-w-4xl flex-col items-center gap-8 relative z-10">
          <div className="text-center">
            <h1
              className={cn(
                "text-4xl md:text-5xl font-bold mb-4",
                isChristmasMode ? "text-white" : "text-[var(--foreground)]"
              )}
            >
              Create Gift Card{isChristmasMode && " 🎁"}
            </h1>
            <p
              className={cn(
                "text-lg",
                isChristmasMode
                  ? "text-white/90"
                  : "text-[var(--muted-foreground)]"
              )}
            >
              Create a new gift card on the Solana blockchain
            </p>
          </div>

          <GiftCardManager />
        </main>
      </ChristmasWrapper>
    </PageTransition>
  );
}

