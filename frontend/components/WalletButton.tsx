"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function WalletButton() {
  const { publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);

  // Only render wallet content after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR, return empty container to prevent hydration mismatch
  if (!mounted) {
    return <div className="flex items-center gap-4" />;
  }

  return (
    <div className="flex items-center gap-4">
      {publicKey && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {publicKey.toBase58().slice(0, 4)}...
          {publicKey.toBase58().slice(-4)}
        </div>
      )}
      <WalletMultiButton />
    </div>
  );
}

