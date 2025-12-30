"use client";

import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useProgram } from "@/lib/anchor";
import { fetchGiftCard, GiftCardData } from "@/lib/giftCard";
import { PageTransition } from "@/components/PageTransition";
import { ChristmasWrapper } from "@/components/ChristmasWrapper";
import { Button } from "@/components/ui/button";
import { Package, ExternalLink, Copy, CheckCircle2 } from "lucide-react";
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
  const [giftCard, setGiftCard] = useState<GiftCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (program && publicKey) {
      loadGiftCard();
    } else {
      setGiftCard(null);
      setLoading(false);
    }
  }, [program, publicKey]);

  async function loadGiftCard() {
    if (!program || !publicKey) return;
    
    setLoading(true);
    try {
      const card = await fetchGiftCard(program, publicKey);
      setGiftCard(card);
    } catch (e: any) {
      console.error("Error loading gift card:", e);
      setGiftCard(null);
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

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
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

  if (!giftCard) {
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
                <Button size="lg">Create Gift Card</Button>
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
          <div className="text-center">
            <h1
              className={cn(
                "text-4xl md:text-5xl font-bold mb-4",
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
              View and manage your gift cards
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div
              variants={itemVariants}
              className="p-6 border rounded-lg border-[var(--border)] bg-[var(--card)]"
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={cn(
                    "text-2xl font-semibold flex items-center gap-2",
                    isChristmasMode ? "text-white" : "text-[var(--foreground)]"
                  )}
                >
                  <Package
                    className={cn(
                      "h-6 w-6",
                      isChristmasMode ? "text-red-400" : "text-[var(--primary)]"
                    )}
                  />
                  Gift Card Details
                </h2>
                <Link href="/create">
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p
                    className={cn(
                      "text-sm",
                      isChristmasMode
                        ? "text-white/70"
                        : "text-[var(--muted-foreground)]"
                    )}
                  >
                    Balance
                  </p>
                  <p
                    className={cn(
                      "text-xl font-semibold",
                      isChristmasMode ? "text-white" : "text-[var(--foreground)]"
                    )}
                  >
                    {formatBalance(giftCard.balance, giftCard.decimals || 9)} tokens
                  </p>
                </div>

                <div className="space-y-1">
                  <p
                    className={cn(
                      "text-sm",
                      isChristmasMode
                        ? "text-white/70"
                        : "text-[var(--muted-foreground)]"
                    )}
                  >
                    Unlock Date
                  </p>
                  <p
                    className={cn(
                      isChristmasMode ? "text-white" : "text-[var(--foreground)]"
                    )}
                  >
                    {formatDate(giftCard.unlockDate)}
                  </p>
                </div>

                <div className="space-y-1">
                  <p
                    className={cn(
                      "text-sm",
                      isChristmasMode
                        ? "text-white/70"
                        : "text-[var(--muted-foreground)]"
                    )}
                  >
                    Refund Date
                  </p>
                  <p
                    className={cn(
                      isChristmasMode ? "text-white" : "text-[var(--foreground)]"
                    )}
                  >
                    {formatDate(giftCard.refundDate)}
                  </p>
                </div>

                <div className="space-y-1">
                  <p
                    className={cn(
                      "text-sm",
                      isChristmasMode
                        ? "text-white/70"
                        : "text-[var(--muted-foreground)]"
                    )}
                  >
                    Token Mint
                  </p>
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "text-sm font-mono truncate",
                        isChristmasMode ? "text-white" : "text-[var(--foreground)]"
                      )}
                    >
                      {giftCard.tokenMint.toString()}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => copyToClipboard(giftCard.tokenMint.toString())}
                      className={cn(
                        "p-1 rounded",
                        isChristmasMode
                          ? "hover:bg-white/20"
                          : "hover:bg-[var(--muted)]"
                      )}
                    >
                      {copied ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy
                          className={cn(
                            "h-4 w-4",
                            isChristmasMode
                              ? "text-white/70"
                              : "text-[var(--muted-foreground)]"
                          )}
                        />
                      )}
                    </motion.button>
                  </div>
                </div>

                {giftCard.allowedMerchants && giftCard.allowedMerchants.length > 0 && (
                  <div className="md:col-span-2 space-y-1">
                    <p
                      className={cn(
                        "text-sm",
                        isChristmasMode
                          ? "text-white/70"
                          : "text-[var(--muted-foreground)]"
                      )}
                    >
                      Allowed Merchants
                    </p>
                    <div className="space-y-2">
                      {giftCard.allowedMerchants.map((merchant, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded",
                            isChristmasMode
                              ? "bg-white/10"
                              : "bg-[var(--muted)]/50"
                          )}
                        >
                          <p
                            className={cn(
                              "text-sm font-mono flex-1 truncate",
                              isChristmasMode ? "text-white" : "text-[var(--foreground)]"
                            )}
                          >
                            {merchant.toString()}
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => copyToClipboard(merchant.toString())}
                            className={cn(
                              "p-1 rounded",
                              isChristmasMode
                                ? "hover:bg-white/20"
                                : "hover:bg-[var(--muted)]"
                            )}
                          >
                            <Copy
                              className={cn(
                                "h-4 w-4",
                                isChristmasMode
                                  ? "text-white/70"
                                  : "text-[var(--muted-foreground)]"
                              )}
                            />
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-[var(--border)]">
                <Link href="/create">
                  <Button className="w-full">Go to Gift Card Manager</Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </ChristmasWrapper>
    </PageTransition>
  );
}

