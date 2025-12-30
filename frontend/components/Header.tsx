"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { WalletButton } from "@/components/WalletButton";
import { ChristmasToggle } from "@/components/ChristmasToggle";
import { Gift, Home, Package, Info, type LucideIcon } from "lucide-react";
import { useChristmasStore } from "@/lib/store/christmasStore";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/create", label: "Create", icon: Gift },
  { href: "/my-cards", label: "My Cards", icon: Package },
  { href: "/about", label: "About", icon: Info },
];

export function Header() {
  const pathname = usePathname();
  const isChristmasMode = useChristmasStore((state) => state.isChristmasMode);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur transition-colors duration-300",
        isChristmasMode
          ? "border-red-500/30 bg-[#0a1628]/95 supports-[backdrop-filter]:bg-[#0a1628]/95"
          : "border-[var(--border)] bg-[var(--background)]/95 supports-[backdrop-filter]:bg-[var(--background)]/80"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2"
        >
          <Link href="/" className="flex items-center gap-2">
            <Gift
              className={cn(
                "h-6 w-6",
                isChristmasMode ? "text-red-400" : "text-[var(--primary)]"
              )}
            />
            <span
              className={cn(
                "text-xl font-bold",
                isChristmasMode ? "text-white" : "text-[var(--foreground)]"
              )}
            >
              Gift Cards{isChristmasMode && " 🎄"}
            </span>
          </Link>
        </motion.div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={cn(
                    "relative px-4 py-2 rounded-lg transition-colors",
                    isActive
                      ? isChristmasMode
                        ? "text-red-400"
                        : "text-[var(--primary)]"
                      : isChristmasMode
                      ? "text-white/70 hover:text-white"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className={cn(
                        "absolute inset-0 rounded-lg",
                        isChristmasMode ? "bg-red-500/20" : "bg-[var(--primary)]/10"
                      )}
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={cn(
                    "relative p-2 rounded-lg transition-colors",
                    isActive
                      ? isChristmasMode
                        ? "text-red-400"
                        : "text-[var(--primary)]"
                      : isChristmasMode
                      ? "text-white/70"
                      : "text-[var(--muted-foreground)]"
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="h-5 w-5" />
                  {isActive && (
                    <motion.div
                      layoutId="activeTabMobile"
                      className={cn(
                        "absolute inset-0 rounded-lg",
                        isChristmasMode ? "bg-red-500/20" : "bg-[var(--primary)]/10"
                      )}
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Christmas Toggle and Wallet Button */}
        <div className="flex items-center gap-3">
          <ChristmasToggle />
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <WalletButton />
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}

