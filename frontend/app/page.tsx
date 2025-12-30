"use client";

import { PageTransition } from "@/components/PageTransition";
import { Gift, Sparkles, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChristmasWrapper } from "@/components/ChristmasWrapper";
import { ChristmasTree } from "@/components/ChristmasTree";
import { useChristmasStore } from "@/lib/store/christmasStore";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Shield,
    title: "Secure & Trustless",
    description: "Built on Solana blockchain with smart contracts ensuring security and transparency.",
  },
  {
    icon: Zap,
    title: "Fast & Low Cost",
    description: "Leverage Solana's high throughput and low transaction fees.",
  },
  {
    icon: Gift,
    title: "Flexible Redemption",
    description: "Set custom unlock and refund dates with merchant restrictions.",
  },
  {
    icon: Sparkles,
    title: "Multi-Token Support",
    description: "Create gift cards with any SPL token including SOL, USDC, USDT, and more.",
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

export default function Home() {
  const isChristmasMode = useChristmasStore((state) => state.isChristmasMode);

  return (
    <PageTransition>
      <ChristmasWrapper className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16">
        <main
          className={cn(
            "flex w-full max-w-6xl flex-col items-center gap-12 relative z-10",
            isChristmasMode && "text-white"
          )}
        >
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col items-center gap-6 text-center relative"
          >
            {/* Christmas Trees */}
            {isChristmasMode && (
              <>
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 hidden lg:block"
                >
                  <ChristmasTree size={60} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block"
                >
                  <ChristmasTree size={60} />
                </motion.div>
              </>
            )}
            
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <Gift
                className={cn(
                  "h-16 w-16",
                  isChristmasMode ? "text-red-400" : "text-[var(--primary)]"
                )}
              />
            </motion.div>
            
            <h1
              className={cn(
                "text-5xl md:text-6xl font-bold",
                isChristmasMode ? "text-white drop-shadow-lg" : "text-[var(--foreground)]"
              )}
            >
              Onchain Gift Cards
              {isChristmasMode && " 🎄"}
            </h1>
            <p
              className={cn(
                "text-xl md:text-2xl leading-8 max-w-2xl",
                isChristmasMode
                  ? "text-white/90 drop-shadow"
                  : "text-[var(--muted-foreground)]"
              )}
            >
              Create, manage, and redeem gift cards on the Solana blockchain
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/create">
                <Button size="lg" className="text-lg px-8 py-6">
                  Get Started
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Features Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-8"
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
                  <div className="flex flex-col items-center gap-4 text-center relative z-10">
                    <div
                      className={cn(
                        "p-3 rounded-full",
                        isChristmasMode ? "bg-red-500/20" : "bg-[var(--primary)]/10"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-8 w-8",
                          isChristmasMode ? "text-red-400" : "text-[var(--primary)]"
                        )}
                      />
                    </div>
                    <h3
                      className={cn(
                        "text-xl font-semibold",
                        isChristmasMode ? "text-white" : "text-[var(--foreground)]"
                      )}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={cn(
                        "text-sm",
                        isChristmasMode ? "text-white/80" : "text-[var(--muted-foreground)]"
                      )}
                    >
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-12 text-center"
          >
            <p
              className={cn(
                "text-lg mb-4",
                isChristmasMode ? "text-white/90" : "text-[var(--muted-foreground)]"
              )}
            >
              Ready to create your first gift card?
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/create">
                <Button variant="outline" size="lg">
                  Create Gift Card
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </main>
      </ChristmasWrapper>
    </PageTransition>
  );
}
