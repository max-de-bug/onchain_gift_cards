"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, Transaction, SystemProgram } from "@solana/web3.js";
import {
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  getAccount,
} from "@solana/spl-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useChristmasStore } from "@/lib/store/christmasStore";
import { Copy, ExternalLink, Coins, ArrowRight, RefreshCw, Info, Zap } from "lucide-react";

interface FaucetToken {
  symbol: string;
  name: string;
  mint: string;
  decimals: number;
  faucetUrl?: string;
  description: string;
}

const FAUCET_TOKENS: FaucetToken[] = [
  {
    symbol: "SOL",
    name: "Solana",
    mint: "So11111111111111111111111111111111111111112",
    decimals: 9,
    faucetUrl: "https://faucet.solana.com/",
    description: "Native Solana token - required for all transactions and token account creation"
  },
  {
    symbol: "WSOL",
    name: "Wrapped SOL",
    mint: "So11111111111111111111111111111111111111112",
    decimals: 9,
    faucetUrl: "https://faucet.solana.com/",
    description: "Wrapped SOL - needed for gift cards and DeFi protocols"
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    mint: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr",
    decimals: 6,
    faucetUrl: "https://faucet.circle.com/",
    description: "USD Coin - stablecoin for testing gift card values"
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    decimals: 6,
    faucetUrl: "https://testnet.binance.org/faucet-smart",
    description: "Tether USD - another stablecoin option for gift cards"
  }
];

export function SolanaFaucet() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const isChristmasMode = useChristmasStore((state) => state.isChristmasMode);

  const [loading, setLoading] = useState(false);
  const [wrapLoading, setWrapLoading] = useState(false);
  const [solAmount, setSolAmount] = useState("2");
  const [wrapAmount, setWrapAmount] = useState("0.5");
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [wsolBalance, setWsolBalance] = useState<number | null>(null);

  // Check if we're on devnet
  const isDevnet = connection.rpcEndpoint.includes('devnet') ||
                   connection.rpcEndpoint.includes('localhost');

  // Fetch balances
  const fetchBalances = useCallback(async () => {
    if (!publicKey) return;

    try {
      // Get SOL balance
      const balance = await connection.getBalance(publicKey);
      setSolBalance(balance / LAMPORTS_PER_SOL);

      // Get WSOL balance
      try {
        const wsolAta = await getAssociatedTokenAddress(
          NATIVE_MINT,
          publicKey,
          false,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );
        const wsolAccount = await getAccount(connection, wsolAta, "confirmed", TOKEN_PROGRAM_ID);
        setWsolBalance(Number(wsolAccount.amount) / LAMPORTS_PER_SOL);
      } catch {
        // WSOL account doesn't exist
        setWsolBalance(0);
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  }, [publicKey, connection]);

  useEffect(() => {
    fetchBalances();
    // Refresh balances every 10 seconds
    const interval = setInterval(fetchBalances, 10000);
    return () => clearInterval(interval);
  }, [fetchBalances]);

  // Wrap SOL to WSOL
  const wrapSOLtoWSOL = async () => {
    if (!publicKey) {
      toast.error("Wallet not connected");
      return;
    }

    setWrapLoading(true);
    try {
      const amount = parseFloat(wrapAmount);
      if (amount <= 0) {
        toast.error("Amount must be greater than 0");
        setWrapLoading(false);
        return;
      }

      if (solBalance !== null && amount > solBalance - 0.01) {
        toast.error(`Insufficient SOL balance. You have ${solBalance.toFixed(4)} SOL (need ~0.01 SOL for fees)`);
        setWrapLoading(false);
        return;
      }

      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

      // Get the WSOL ATA address
      const wsolAta = await getAssociatedTokenAddress(
        NATIVE_MINT,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const transaction = new Transaction();

      // Check if WSOL ATA exists
      let ataExists = false;
      try {
        await getAccount(connection, wsolAta, "confirmed", TOKEN_PROGRAM_ID);
        ataExists = true;
      } catch {
        ataExists = false;
      }

      // Create ATA if it doesn't exist
      if (!ataExists) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey, // payer
            wsolAta, // ata
            publicKey, // owner
            NATIVE_MINT, // mint
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      // Transfer SOL to the WSOL ATA
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: wsolAta,
          lamports: lamports,
        })
      );

      // Sync the native account to update the WSOL balance
      transaction.add(
        createSyncNativeInstruction(wsolAta, TOKEN_PROGRAM_ID)
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      toast.success(`Successfully wrapped ${amount} SOL to WSOL`);

      // Refresh balances
      await fetchBalances();

    } catch (error: any) {
      console.error("Wrap SOL failed:", error);
      toast.error(error.message || "Failed to wrap SOL to WSOL");
    } finally {
      setWrapLoading(false);
    }
  };

  const openOfficialFaucet = () => {
    if (publicKey) {
      window.open(`https://faucet.solana.com/?address=${publicKey.toString()}`, '_blank');
    } else {
      window.open('https://faucet.solana.com/', '_blank');
    }
  };

  const requestSOLAirdrop = async () => {
    if (!publicKey) {
      toast.error("Wallet not connected");
      return;
    }

    if (!isDevnet) {
      toast.error("Faucet only works on Solana Devnet. Please switch to devnet.");
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(solAmount);
      if (amount <= 0 || amount > 2) {
        toast.error("Amount must be between 0.1 and 2 SOL");
        setLoading(false);
        return;
      }

      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

      const signature = await connection.requestAirdrop(publicKey, lamports);

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      toast.success(`Successfully requested ${amount} SOL`);

    } catch (error: any) {
      console.error("Airdrop failed:", error);
      
      // Check for rate limiting or internal errors
      const errorMessage = error.message || "";
      if (errorMessage.includes("Internal error") || errorMessage.includes("429") || errorMessage.includes("rate")) {
        toast.error(
          "Rate limit reached. Use the Official Faucet button instead.",
          { duration: 6000 }
        );
      } else {
        toast.error(errorMessage || "Failed to request airdrop. Try the official faucet.");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Copied to clipboard");
  };

  const openFaucetUrl = (url: string) => {
    window.open(url, '_blank');
  };

  if (!publicKey) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "text-center p-8 rounded-lg border",
          isChristmasMode
            ? "bg-gradient-to-br from-red-50/50 to-green-50/50 dark:from-red-950/20 dark:to-green-950/20 border-red-200 dark:border-red-800"
            : "bg-[var(--muted)]/30 border-[var(--border)]"
        )}
      >
        <div className="space-y-4">
          <Coins className={cn(
            "w-12 h-12 mx-auto",
            isChristmasMode ? "text-red-500" : "text-[var(--muted-foreground)]"
          )} />
          <h3 className={cn(
            "text-xl font-bold",
            isChristmasMode ? "text-red-700 dark:text-red-400" : "text-[var(--foreground)]"
          )}>
            Connect Your Wallet
          </h3>
          <p className={cn(
            isChristmasMode ? "text-green-700 dark:text-green-400" : "text-[var(--muted-foreground)]"
          )}>
            Connect your wallet to access the Solana faucet
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center space-y-3"
      >
        <div className="flex items-center justify-center gap-3">
          <Coins className={cn(
            "w-8 h-8",
            isChristmasMode ? "text-red-500" : "text-[var(--primary)]"
          )} />
          <h1 className={cn(
            "text-3xl md:text-4xl font-bold",
            isChristmasMode ? "text-white" : "text-[var(--foreground)]"
          )}>
            Solana Faucet
          </h1>
        </div>
        <p className={cn(
          "text-lg max-w-2xl mx-auto",
          isChristmasMode ? "text-white/80" : "text-[var(--muted-foreground)]"
        )}>
          Get free tokens for testing your gift cards on Solana Devnet
        </p>
      </motion.div>

      {/* Network Status */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "p-4 rounded-lg border text-center",
          isDevnet
            ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
            : "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400"
        )}
      >
        <div className="flex items-center justify-center gap-2">
          <div className={cn(
            "w-2.5 h-2.5 rounded-full",
            isDevnet ? "bg-green-500" : "bg-orange-500"
          )} />
          <span className="font-medium">
            {isDevnet ? "Connected to Solana Devnet" : "Please switch to Devnet"}
          </span>
        </div>
        {!isDevnet && (
          <p className="text-sm mt-1">
            The faucet only works on Solana Devnet.
          </p>
        )}
      </motion.div>

      {/* SOL Airdrop Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={cn(
          "p-6 border rounded-lg",
          isChristmasMode
            ? "bg-[var(--card)]/80 border-red-200 dark:border-red-800"
            : "border-[var(--border)] bg-[var(--card)]"
        )}
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap className={cn(
            "w-5 h-5",
            isChristmasMode ? "text-red-500" : "text-[var(--primary)]"
          )} />
          <h2 className={cn(
            "text-xl font-semibold",
            isChristmasMode ? "text-red-700 dark:text-red-400" : "text-[var(--foreground)]"
          )}>
            Request SOL Airdrop
          </h2>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          Get free SOL tokens directly to your wallet. Maximum 2 SOL per request.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="solAmount" className="font-medium">
              Amount (SOL)
            </Label>
            <Input
              id="solAmount"
              type="number"
              step="0.1"
              min="0.1"
              max="2"
              value={solAmount}
              onChange={(e) => setSolAmount(e.target.value)}
              placeholder="2.0"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={requestSOLAirdrop}
              disabled={loading || !isDevnet}
              className={cn(
                "flex-1",
                isChristmasMode
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : ""
              )}
            >
              {loading ? "Requesting..." : `Request ${solAmount} SOL`}
            </Button>
            
            <Button
              onClick={openOfficialFaucet}
              variant="outline"
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Official Faucet
            </Button>
          </div>

          <div className={cn(
            "flex items-start gap-2 p-3 rounded-lg text-sm",
            "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400"
          )}>
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>If the in-app airdrop fails due to rate limits, use the Official Faucet button.</span>
          </div>
        </div>
      </motion.div>

      {/* Wrap SOL to WSOL Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className={cn(
          "p-6 border rounded-lg",
          isChristmasMode
            ? "bg-[var(--card)]/80 border-green-200 dark:border-green-800"
            : "border-[var(--border)] bg-[var(--card)]"
        )}
      >
        <div className="flex items-center gap-2 mb-4">
          <ArrowRight className={cn(
            "w-5 h-5",
            isChristmasMode ? "text-green-500" : "text-[var(--primary)]"
          )} />
          <h2 className={cn(
            "text-xl font-semibold",
            isChristmasMode ? "text-green-700 dark:text-green-400" : "text-[var(--foreground)]"
          )}>
            Wrap SOL to WSOL
          </h2>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          Convert your native SOL to Wrapped SOL (WSOL). <strong>Required for creating gift cards.</strong>
        </p>

        {/* Balances Display */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className={cn(
            "p-4 rounded-lg border",
            "bg-[var(--muted)]/30 border-[var(--border)]"
          )}>
            <div className="text-sm text-[var(--muted-foreground)]">SOL Balance</div>
            <div className="text-xl font-bold text-[var(--foreground)]">
              {solBalance !== null ? solBalance.toFixed(4) : "..."} SOL
            </div>
          </div>
          <div className={cn(
            "p-4 rounded-lg border",
            "bg-[var(--muted)]/30 border-[var(--border)]"
          )}>
            <div className="text-sm text-[var(--muted-foreground)]">WSOL Balance</div>
            <div className="text-xl font-bold text-[var(--foreground)]">
              {wsolBalance !== null ? wsolBalance.toFixed(4) : "..."} WSOL
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wrapAmount" className="font-medium">
              Amount to Wrap (SOL)
            </Label>
            <Input
              id="wrapAmount"
              type="number"
              step="0.01"
              min="0.01"
              value={wrapAmount}
              onChange={(e) => setWrapAmount(e.target.value)}
              placeholder="0.5"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={wrapSOLtoWSOL}
              disabled={wrapLoading || !publicKey}
              className={cn(
                "flex-1",
                isChristmasMode
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              )}
            >
              {wrapLoading ? (
                "Wrapping..."
              ) : (
                <span className="flex items-center justify-center">
                  SOL <ArrowRight className="w-4 h-4 mx-2" /> WSOL
                </span>
              )}
            </Button>

            <Button
              onClick={fetchBalances}
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className={cn(
            "flex items-start gap-2 p-3 rounded-lg text-sm",
            "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"
          )}>
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Gift cards require SPL tokens like WSOL. Wrapped SOL is the SPL token version of native SOL.</span>
          </div>
        </div>
      </motion.div>

      {/* Other Tokens Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={cn(
          "p-6 border rounded-lg",
          isChristmasMode
            ? "bg-[var(--card)]/80 border-purple-200 dark:border-purple-800"
            : "border-[var(--border)] bg-[var(--card)]"
        )}
      >
        <div className="flex items-center gap-2 mb-4">
          <Coins className={cn(
            "w-5 h-5",
            isChristmasMode ? "text-purple-500" : "text-[var(--primary)]"
          )} />
          <h2 className={cn(
            "text-xl font-semibold",
            isChristmasMode ? "text-purple-700 dark:text-purple-400" : "text-[var(--foreground)]"
          )}>
            Other Tokens
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {FAUCET_TOKENS.slice(1).map((token, index) => (
            <motion.div
              key={token.symbol}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={cn(
                "p-4 border rounded-lg",
                "bg-[var(--muted)]/30 border-[var(--border)]"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-[var(--foreground)]">
                  {token.symbol}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyAddress(token.mint)}
                  className="h-8 px-2"
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>

              <p className="text-sm text-[var(--muted-foreground)] mb-3">
                {token.description}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyAddress(token.mint)}
                  className="flex-1"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy Mint
                </Button>
                {token.faucetUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openFaucetUrl(token.faucetUrl!)}
                    className="flex-1"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Faucet
                  </Button>
                )}
              </div>

              <div className="mt-2 text-xs font-mono text-[var(--muted-foreground)] break-all">
                {token.mint}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={cn(
          "p-6 border rounded-lg",
          isChristmasMode
            ? "bg-[var(--card)]/80 border-[var(--border)]"
            : "border-[var(--border)] bg-[var(--card)]"
        )}
      >
        <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">
          How to Use Tokens for Gift Cards
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className={cn(
              "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
              isChristmasMode
                ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                : "bg-[var(--primary)]/10 text-[var(--primary)]"
            )}>1</span>
            <span className="text-[var(--muted-foreground)]">
              Get SOL from the airdrop above (needed for transaction fees)
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className={cn(
              "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
              isChristmasMode
                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                : "bg-[var(--primary)]/10 text-[var(--primary)]"
            )}>2</span>
            <span className="text-[var(--muted-foreground)]">
              Wrap SOL to WSOL using the section above (required for gift card creation)
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className={cn(
              "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
              isChristmasMode
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                : "bg-[var(--primary)]/10 text-[var(--primary)]"
            )}>3</span>
            <span className="text-[var(--muted-foreground)]">
              Use the faucet links above to get USDC/USDT if needed
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className={cn(
              "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
              isChristmasMode
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                : "bg-[var(--primary)]/10 text-[var(--primary)]"
            )}>4</span>
            <span className="text-[var(--muted-foreground)]">
              Create your gift card on the Create page
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}