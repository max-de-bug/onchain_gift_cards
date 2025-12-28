import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";

// Program ID from your Anchor.toml
export const PROGRAM_ID = new PublicKey("GcoSaa4P2NADPsf6R5urbrUEv9SccPTP5Xjd6GznV8p");

// Network configuration
// Next.js exposes NEXT_PUBLIC_* env vars at build time for client-side code
const getEnvVar = (key: string, defaultValue: string): string => {
  if (typeof process !== "undefined" && process.env[key]) {
    return process.env[key] as string;
  }
  return defaultValue;
};

export const NETWORK = getEnvVar("NEXT_PUBLIC_SOLANA_NETWORK", "devnet");
export const RPC_URL = 
  getEnvVar(
    "NEXT_PUBLIC_RPC_URL",
    NETWORK === "localnet" 
      ? "http://127.0.0.1:8899" 
      : clusterApiUrl(NETWORK as "devnet" | "testnet" | "mainnet-beta")
  );

// Create connection
export function getConnection(): Connection {
  return new Connection(RPC_URL, "confirmed");
}

// Create Anchor provider (will be used in client components)
export function getAnchorProvider(wallet: Wallet): AnchorProvider {
  const connection = getConnection();
  return new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
}

