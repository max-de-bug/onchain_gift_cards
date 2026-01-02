"use client";

import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useProgram } from "@/lib/anchor";
import { fetchAllGiftCards, GiftCardWithPDA } from "@/lib/giftCard";
import { PageTransition } from "@/components/PageTransition";
import { ChristmasWrapper } from "@/components/ChristmasWrapper";
import { Button } from "@/components/ui/button";
import { Package, ExternalLink, Copy, CheckCircle2, Lock, Unlock, CreditCard, Plus } from "lucide-react";
import { BN } from "@coral-xyz/anchor";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { useChristmasStore } from "@/lib/store/christmasStore";
import { cn } from "@/lib/utils";

export default function MyCardsPage() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const program = useProgram();
  const isChristmasMode = useChristmasStore((state) => state.isChristmasMode);
  const [giftCards, setGiftCards] = useState<GiftCardWithPDA[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (program && publicKey) {
      loadGiftCards();
    } else {
      setGiftCards([]);
      setLoading(false);
    }
  }, [program, publicKey]);

  async function loadGiftCards() {
    if (!program || !publicKey) return;
    
    setLoading(true);
    try {
      const cards = await fetchAllGiftCards(program, publicKey);
      setGiftCards(cards);
    } catch (e: any) {
      console.error("Error loading gift cards:", e);
      setGiftCards([]);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(timestamp: BN): string {
    return new Date(timestamp.toNumber() * 1000).toLocaleString();
  }

  function formatBalance(balance: BN, decimals: number = 9): string {
    return (balance.toNumber() / Math.pow(10, decimals)).toFixed(4);
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  }

  function isCardUnlocked(card: GiftCardWithPDA): boolean {
    return new Date() >= new Date(Number(card.unlockDate) * 1000);
  }

  function isCardExpired(card: GiftCardWithPDA): boolean {
    return new Date() >= new Date(Number(card.refundDate) * 1000);
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  if (!publicKey) {
    return (
      <PageTransition>
        <ChristmasWrapper className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16">
          <div className="text-center relative z-10">
            <Package
              className={cn(
                "h-16 w-16 mx-auto mb-4",
                isChristmasMode
                  ? "text-white/80"
                  : "text-[var(--muted-foreground)]"
              )}
            />
            <h2
              className={cn(
                "text-2xl font-semibold mb-2",
                isChristmasMode ? "text-white" : "text-[var(--foreground)]"
              )}
            >
              Connect Your Wallet
            </h2>
            <p
              className={cn(
                isChristmasMode ? "text-white/80" : "text-[var(--muted-foreground)]"
              )}
            >
              Connect your wallet to view your gift cards
            </p>
          </div>
        </ChristmasWrapper>
      </PageTransition>
    );
  }

  if (loading) {
    return (
      <PageTransition>
        <ChristmasWrapper className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16">
          <div className="text-center relative z-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Package
                className={cn(
                  "h-12 w-12 mx-auto mb-4",
                  isChristmasMode ? "text-red-400" : "text-[var(--primary)]"
                )}
              />
            </motion.div>
            <p
              className={cn(
                isChristmasMode ? "text-white/80" : "text-[var(--muted-foreground)]"
              )}
            >
              Loading your gift cards...
            </p>
          </div>
        </ChristmasWrapper>
      </PageTransition>
    );
  }

  if (giftCards.length === 0) {
    return (
      <PageTransition>
        <ChristmasWrapper className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-md relative z-10"
          >
            <Package
              className={cn(
                "h-16 w-16 mx-auto mb-4",
                isChristmasMode
                  ? "text-white/80"
                  : "text-[var(--muted-foreground)]"
              )}
            />
            <h2
              className={cn(
                "text-2xl font-semibold mb-2",
                isChristmasMode ? "text-white" : "text-[var(--foreground)]"
              )}
            >
              No Gift Cards Found
            </h2>
            <p
              className={cn(
                "mb-6",
                isChristmasMode ? "text-white/80" : "text-[var(--muted-foreground)]"
              )}
            >
              You don't have any gift cards yet. Create your first one to get started!
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/create">
                <Button size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Gift Card
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </ChristmasWrapper>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <ChristmasWrapper className="flex min-h-[calc(100vh-4rem)] flex-col items-center px-4 py-16">
        <main className="flex w-full max-w-4xl flex-col gap-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1
                className={cn(
                  "text-4xl md:text-5xl font-bold mb-2",
                  isChristmasMode ? "text-white" : "text-[var(--foreground)]"
                )}
              >
                My Gift Cards{isChristmasMode && " 🎁"}
              </h1>
              <p
                className={cn(
                  "text-lg",
                  isChristmasMode
                    ? "text-white/90"
                    : "text-[var(--muted-foreground)]"
                )}
              >
                You have {giftCards.length} gift card{giftCards.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Link href="/create">
              <Button
                className={cn(
                  isChristmasMode
                    ? "bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700"
                    : ""
                )}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Card
              </Button>
            </Link>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {giftCards.map((card, index) => {
              const cardIdStr = card.cardId.toString();
              const unlocked = isCardUnlocked(card);
              const expired = isCardExpired(card);
              const hasBalance = card.balance.toNumber() > 0;
              
              return (
                <motion.div
                  key={cardIdStr}
                  variants={itemVariants}
                  className={cn(
                    "p-6 border rounded-lg relative overflow-hidden",
                    isChristmasMode
                      ? "bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-sm"
                      : "border-[var(--border)] bg-[var(--card)]"
                  )}
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={cn(
                      "text-xs px-3 py-1 rounded-full font-medium",
                      hasBalance
                        ? unlocked
                          ? expired
                            ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                            : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    )}>
                      {!hasBalance ? "Empty" : expired ? "Refundable" : unlocked ? "Active" : "Locked"}
                    </span>
                  </div>

                  {/* Card Icon */}
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-4",
                    unlocked
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-amber-100 dark:bg-amber-900/30"
                  )}>
                    {unlocked ? (
                      <Unlock className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>

                  {/* Balance */}
                  <div className="mb-4">
                    <p className={cn(
                      "text-sm",
                      isChristmasMode ? "text-white/70" : "text-[var(--muted-foreground)]"
                    )}>
                      Balance
                    </p>
                    <p className={cn(
                      "text-2xl font-bold",
                      isChristmasMode ? "text-white" : "text-[var(--foreground)]"
                    )}>
                      {formatBalance(card.balance, card.decimals || 9)}
                      <span className="text-sm font-normal ml-1">tokens</span>
                    </p>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className={cn(
                        isChristmasMode ? "text-white/70" : "text-[var(--muted-foreground)]"
                      )}>
                        Unlocks
                      </span>
                      <span className={cn(
                        "font-medium",
                        isChristmasMode ? "text-white" : "text-[var(--foreground)]"
                      )}>
                        {formatDate(card.unlockDate)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={cn(
                        isChristmasMode ? "text-white/70" : "text-[var(--muted-foreground)]"
                      )}>
                        Refund After
                      </span>
                      <span className={cn(
                        "font-medium",
                        isChristmasMode ? "text-white" : "text-[var(--foreground)]"
                      )}>
                        {formatDate(card.refundDate)}
                      </span>
                    </div>
                  </div>

                  {/* Token Mint */}
                  <div className="mb-4">
                    <p className={cn(
                      "text-sm mb-1",
                      isChristmasMode ? "text-white/70" : "text-[var(--muted-foreground)]"
                    )}>
                      Token Mint
                    </p>
                    <div className="flex items-center gap-2">
                      <code className={cn(
                        "text-xs font-mono truncate flex-1 p-2 rounded",
                        isChristmasMode
                          ? "bg-white/10 text-white"
                          : "bg-[var(--muted)] text-[var(--foreground)]"
                      )}>
                        {card.tokenMint.toString()}
                      </code>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => copyToClipboard(card.tokenMint.toString(), `mint-${cardIdStr}`)}
                        className={cn(
                          "p-2 rounded",
                          isChristmasMode ? "hover:bg-white/20" : "hover:bg-[var(--muted)]"
                        )}
                      >
                        {copiedId === `mint-${cardIdStr}` ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className={cn(
                            "h-4 w-4",
                            isChristmasMode ? "text-white/70" : "text-[var(--muted-foreground)]"
                          )} />
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* Manage Button */}
                  <Link href="/create">
                    <Button
                      variant="outline"
                      className="w-full"
                    >
                      Manage Card
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </main>
      </ChristmasWrapper>
    </PageTransition>
  );
}
