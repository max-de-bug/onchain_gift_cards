"use client";

import { PageTransition } from "@/components/PageTransition";
import { ChristmasWrapper } from "@/components/ChristmasWrapper";
import { ChristmasTree } from "@/components/ChristmasTree";
import { Shield, Zap, Gift, Code, Database, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useChristmasStore } from "@/lib/store/christmasStore";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Shield,
    title: "Smart Contract Security",
    description: "Built on Solana using Anchor framework with battle-tested security patterns.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Leverage Solana's sub-second finality and high throughput for instant transactions.",
  },
  {
    icon: Gift,
    title: "Flexible Gift Cards",
    description: "Set custom unlock dates, refund dates, and merchant restrictions for complete control.",
  },
  {
    icon: Database,
    title: "Multi-Token Support",
    description: "Create gift cards with any SPL token - SOL, USDC, USDT, or any custom token.",
  },
  {
    icon: Lock,
    title: "Escrow Protection",
    description: "Funds are held in secure escrow accounts until redemption or refund conditions are met.",
  },
  {
    icon: Code,
    title: "Open Source",
    description: "Fully transparent and open source codebase for maximum trust and security.",
  },
];

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
    transition: {
      duration: 0.5,
    },
  },
};

export default function AboutPage() {
  const isChristmasMode = useChristmasStore((state) => state.isChristmasMode);

  return (
    <PageTransition>
      <ChristmasWrapper className="flex min-h-[calc(100vh-4rem)] flex-col items-center px-4 py-16">
        <main className="flex w-full max-w-4xl flex-col gap-12 relative z-10">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="text-center relative"
          >
            {/* Christmas Trees */}
            {isChristmasMode && (
              <>
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:block"
                >
                  <ChristmasTree size={50} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block"
                >
                  <ChristmasTree size={50} />
                </motion.div>
              </>
            )}
            
            <h1
              className={cn(
                "text-4xl md:text-5xl font-bold mb-4",
                isChristmasMode ? "text-white" : "text-[var(--foreground)]"
              )}
            >
              About Onchain Gift Cards{isChristmasMode && " 🎄"}
            </h1>
            <p
              className={cn(
                "text-xl max-w-2xl mx-auto",
                isChristmasMode
                  ? "text-white/90"
                  : "text-[var(--muted-foreground)]"
              )}
            >
              A decentralized gift card platform built on the Solana blockchain,
              enabling secure, transparent, and programmable gift card management.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={cn(
                    "p-6 border rounded-lg hover:shadow-lg transition-all relative overflow-hidden",
                    isChristmasMode
                      ? "border-red-500/40 bg-gradient-to-br from-[#1a2332]/90 to-[#0f172a]/90 shadow-lg shadow-red-500/10 christmas-card"
                      : "border-[var(--border)] bg-[var(--card)]"
                  )}
                >
                  {isChristmasMode && (
                    <>
                      {/* Top-left triangle */}
                      <div className="absolute top-0 left-0 w-0 h-0 border-l-[30px] border-l-red-500 border-t-[30px] border-t-transparent opacity-60"></div>
                      {/* Top-right triangle */}
                      <div className="absolute top-0 right-0 w-0 h-0 border-r-[30px] border-r-green-600 border-t-[30px] border-t-transparent opacity-60"></div>
                      {/* Bottom-left triangle */}
                      <div className="absolute bottom-0 left-0 w-0 h-0 border-l-[30px] border-l-green-600 border-b-[30px] border-b-transparent opacity-60"></div>
                      {/* Bottom-right triangle */}
                      <div className="absolute bottom-0 right-0 w-0 h-0 border-r-[30px] border-r-red-500 border-b-[30px] border-b-transparent opacity-60"></div>
                    </>
                  )}
                  <div className="flex flex-col gap-4 relative z-10">
                    <div
                      className={cn(
                        "p-3 rounded-full w-fit",
                        isChristmasMode
                          ? "bg-red-500/20"
                          : "bg-[var(--primary)]/10"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-6 w-6",
                          isChristmasMode ? "text-red-400" : "text-[var(--primary)]"
                        )}
                      />
                    </div>
                    <h3
                      className={cn(
                        "text-lg font-semibold",
                        isChristmasMode ? "text-white" : "text-[var(--foreground)]"
                      )}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={cn(
                        "text-sm",
                        isChristmasMode
                          ? "text-white/80"
                          : "text-[var(--muted-foreground)]"
                      )}
                    >
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* How It Works Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-6"
          >
            <h2
              className={cn(
                "text-3xl font-bold text-center",
                isChristmasMode ? "text-white" : "text-[var(--foreground)]"
              )}
            >
              How It Works
            </h2>
            
            <div className="space-y-4">
              <div className="p-6 border rounded-lg border-[var(--border)] bg-[var(--card)]">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3
                      className={cn(
                        "text-xl font-semibold mb-2",
                        isChristmasMode ? "text-white" : "text-[var(--foreground)]"
                      )}
                    >
                      Create a Gift Card
                    </h3>
                    <p
                      className={cn(
                        isChristmasMode
                          ? "text-white/80"
                          : "text-[var(--muted-foreground)]"
                      )}
                    >
                      Choose a token, set the amount, unlock date, and refund date. 
                      Your tokens are locked in a secure escrow account on-chain.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border rounded-lg border-[var(--border)] bg-[var(--card)]">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3
                      className={cn(
                        "text-xl font-semibold mb-2",
                        isChristmasMode ? "text-white" : "text-[var(--foreground)]"
                      )}
                    >
                      Gift or Share
                    </h3>
                    <p
                      className={cn(
                        isChristmasMode
                          ? "text-white/80"
                          : "text-[var(--muted-foreground)]"
                      )}
                    >
                      Share the gift card with your recipient. They can redeem it 
                      after the unlock date to any merchant you've allowed (or any merchant if none specified).
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border rounded-lg border-[var(--border)] bg-[var(--card)]">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3
                      className={cn(
                        "text-xl font-semibold mb-2",
                        isChristmasMode ? "text-white" : "text-[var(--foreground)]"
                      )}
                    >
                      Redeem or Refund
                    </h3>
                    <p
                      className={cn(
                        isChristmasMode
                          ? "text-white/80"
                          : "text-[var(--muted-foreground)]"
                      )}
                    >
                      Recipients can redeem tokens to merchants after the unlock date. 
                      Unused funds can be refunded back to you after the refund date.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Technology Stack */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="p-6 border rounded-lg border-[var(--border)] bg-[var(--card)]"
          >
            <h2
              className={cn(
                "text-2xl font-bold mb-4",
                isChristmasMode ? "text-white" : "text-[var(--foreground)]"
              )}
            >
              Technology Stack
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: "Solana", desc: "Blockchain" },
                { name: "Anchor", desc: "Smart Contracts" },
                { name: "Next.js", desc: "Frontend" },
                { name: "TypeScript", desc: "Type Safety" },
                { name: "Framer Motion", desc: "Animations" },
                { name: "Wallet Adapter", desc: "Wallet Integration" },
              ].map((tech) => (
                <div
                  key={tech.name}
                  className={cn(
                    "text-center p-4 rounded",
                    isChristmasMode ? "bg-white/10" : "bg-[var(--muted)]/50"
                  )}
                >
                  <p
                    className={cn(
                      "font-semibold",
                      isChristmasMode ? "text-white" : "text-[var(--foreground)]"
                    )}
                  >
                    {tech.name}
                  </p>
                  <p
                    className={cn(
                      "text-sm",
                      isChristmasMode
                        ? "text-white/70"
                        : "text-[var(--muted-foreground)]"
                    )}
                  >
                    {tech.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </main>
      </ChristmasWrapper>
    </PageTransition>
  );
}

