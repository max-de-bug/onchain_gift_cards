// Common token mint addresses for Solana
export interface TokenInfo {
  symbol: string;
  name: string;
  mint: string;
  decimals: number;
  logo?: string;
}

export const COMMON_TOKENS: TokenInfo[] = [
  {
    symbol: "WSOL",
    name: "Wrapped SOL (WSOL)",
    mint: "So11111111111111111111111111111111111111112",
    decimals: 9,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    mint: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr", // Devnet
    decimals: 6,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // Devnet (same as mainnet)
    decimals: 6,
  },
];

export function getTokenByMint(mint: string): TokenInfo | undefined {
  return COMMON_TOKENS.find((token) => token.mint === mint);
}

export function getTokenBySymbol(symbol: string): TokenInfo | undefined {
  return COMMON_TOKENS.find((token) => token.symbol.toUpperCase() === symbol.toUpperCase());
}

