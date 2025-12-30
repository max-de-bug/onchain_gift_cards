"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useChristmasStore } from "@/lib/store/christmasStore";
import { cn } from "@/lib/utils";

export function WalletButton() {
  const { publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);
  const isChristmasMode = useChristmasStore((state) => state.isChristmasMode);

  // Only render wallet content after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR, return empty container to prevent hydration mismatch
  if (!mounted) {
    return <div className="flex items-center gap-4" />;
  }

  return (
    <div className={cn("flex items-center gap-4", isChristmasMode && "wallet-christmas")}>
      {publicKey && (
        <div
          className={cn(
            "text-sm font-medium",
            isChristmasMode ? "text-white/90" : "text-gray-600 dark:text-gray-400"
          )}
        >
          {publicKey.toBase58().slice(0, 4)}...
          {publicKey.toBase58().slice(-4)}
        </div>
      )}
      <div className={isChristmasMode ? "wallet-button-christmas" : ""}>
        <WalletMultiButton />
      </div>
    </div>
  );
}

