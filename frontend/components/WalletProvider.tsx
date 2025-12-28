"use client";

import { useMemo, ReactNode } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { RPC_URL, NETWORK } from "@/config/solana";

export function AppWalletProvider({ children }: { children: ReactNode }) {
  const network = useMemo(() => {
    if (NETWORK === "localnet") return WalletAdapterNetwork.Devnet;
    if (NETWORK === "devnet") return WalletAdapterNetwork.Devnet;
    if (NETWORK === "testnet") return WalletAdapterNetwork.Testnet;
    return WalletAdapterNetwork.Mainnet;
  }, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={RPC_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

