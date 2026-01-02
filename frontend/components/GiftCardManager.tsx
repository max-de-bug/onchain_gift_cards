"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useProgram } from "@/lib/anchor";
import { 
  createGiftCard, 
  fetchAllGiftCards, 
  redeemGiftCard, 
  refundGiftCard,
  setGiftCardRules,
  GiftCardWithPDA,
} from "@/lib/giftCard";
import { useGiftCardStore } from "@/lib/store/giftCardStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomDatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import { BN } from "@coral-xyz/anchor";
import { COMMON_TOKENS, getTokenByMint } from "@/lib/tokens";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useChristmasStore } from "@/lib/store/christmasStore";
import Link from "next/link";
import { 
  Coins, 
  Lock, 
  Unlock, 
  Plus, 
  CreditCard, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  Gift,
  Calendar,
  Wallet,
  X,
  Store
} from "lucide-react";

// Separate Create Form Component for better organization
function CreateGiftCardForm({ 
  onSuccess, 
  isChristmasMode 
}: { 
  onSuccess: () => void;
  isChristmasMode: boolean;
}) {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const program = useProgram();
  
  const {
    tokenMint,
    amount,
    unlockDate,
    refundDate,
    allowedMerchants,
    setTokenMint,
    setAmount,
    setUnlockDate,
    setRefundDate,
    addAllowedMerchant,
    removeAllowedMerchant,
    resetCreateForm,
  } = useGiftCardStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [merchantInput, setMerchantInput] = useState("");

  // Convert string dates to Date objects for DatePicker
  const unlockDateObj = unlockDate 
    ? (() => {
        const date = new Date(unlockDate);
        return isNaN(date.getTime()) ? undefined : date;
      })()
    : undefined;
  const refundDateObj = refundDate 
    ? (() => {
        const date = new Date(refundDate);
        return isNaN(date.getTime()) ? undefined : date;
      })()
    : undefined;
  const now = new Date();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!program || !publicKey) {
      setFormError("Wallet not connected");
      toast.error("Please connect your wallet first");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setFormError("Please enter a valid amount");
      toast.error("Please enter a valid amount");
      return;
    }

    if (!unlockDate) {
      setFormError("Please select an unlock date");
      toast.error("Please select an unlock date");
      return;
    }

    if (!refundDate) {
      setFormError("Please select a refund date");
      toast.error("Please select a refund date");
      return;
    }

    if (!tokenMint) {
      setFormError("Please select a token");
      toast.error("Please select a token");
      return;
    }

    const unlock = new Date(unlockDate);
    const refund = new Date(refundDate);

    if (unlock <= now) {
      setFormError("Unlock date must be in the future");
      toast.error("Unlock date must be in the future");
      return;
    }

    if (refund <= unlock) {
      setFormError("Refund date must be after unlock date");
      toast.error("Refund date must be after unlock date");
      return;
    }

    setIsSubmitting(true);

    try {
      const { txSignature, cardId } = await createGiftCard(
        program,
        publicKey,
        connection,
        tokenMint,
        parseFloat(amount),
        unlock,
        refund
      );

      // If merchants were specified, set them after creation
      if (allowedMerchants.length > 0) {
        try {
          const ruleTx = await setGiftCardRules(
            program,
            publicKey,
            cardId,
            allowedMerchants
          );
          toast.success("Gift card created with merchant rules!", {
            description: `Card: ${txSignature.slice(0, 8)}... | Rules: ${ruleTx.slice(0, 8)}...`,
          });
        } catch (ruleError: any) {
          // Card was created but rules failed - still show success but warn
          toast.success("Gift card created!", {
            description: `Note: Merchant rules failed to set. You can update them later.`,
          });
          console.error("Failed to set merchant rules:", ruleError);
        }
      } else {
        toast.success("Gift card created successfully!", {
          description: `Transaction: ${txSignature.slice(0, 8)}...`,
        });
      }
      
      resetCreateForm();
      onSuccess();
    } catch (e: any) {
      console.error("Error creating gift card:", e);
      const errorMsg = e.message || "Failed to create gift card";
      setFormError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-6 md:p-8 border rounded-xl relative overflow-hidden shadow-lg",
        isChristmasMode
          ? "bg-gradient-to-br from-red-50/95 to-green-50/95 dark:from-red-950/40 dark:to-green-950/40 border-red-300 dark:border-red-700"
          : "border-[var(--border)] bg-[var(--card)]"
      )}
    >
      {/* Christmas decorative elements */}
      {isChristmasMode && (
        <>
          <div className="absolute top-4 left-4 text-2xl animate-bounce">🎄</div>
          <div className="absolute top-4 right-4 text-2xl animate-pulse">🎁</div>
        </>
      )}

      <div className="relative z-10 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className={cn(
            "p-2 rounded-lg",
            isChristmasMode 
              ? "bg-red-100 dark:bg-red-900/30" 
              : "bg-[var(--primary)]/10"
          )}>
            <Gift className={cn(
              "w-6 h-6",
              isChristmasMode 
                ? "text-red-600 dark:text-red-400" 
                : "text-[var(--primary)]"
            )} />
          </div>
          <h2 className={cn(
            "text-2xl md:text-3xl font-bold",
            isChristmasMode ? "text-red-700 dark:text-red-400" : "text-[var(--foreground)]"
          )}>
            {isChristmasMode ? "Create Christmas Gift Card" : "Create New Gift Card"}
          </h2>
        </div>
        <p className={cn(
          "text-sm",
          isChristmasMode ? "text-green-700 dark:text-green-400" : "text-[var(--muted-foreground)]"
        )}>
          Fill in the details below to create your gift card. Need tokens?{" "}
          <Link
            href="/faucet"
            className={cn(
              "font-semibold underline hover:no-underline",
              isChristmasMode ? "text-blue-600 dark:text-blue-400" : "text-[var(--primary)]"
            )}
          >
            Get free tokens here
          </Link>
        </p>
      </div>

      {formError && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Token Selection */}
        <div className="space-y-2">
          <Label htmlFor="tokenSelect" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Select Token
          </Label>
          <Select
            value={getTokenByMint(tokenMint)?.symbol || "custom"}
            onValueChange={(value) => {
              if (value === "custom") return;
              const token = COMMON_TOKENS.find((t) => t.symbol === value);
              if (token) setTokenMint(token.mint);
            }}
          >
            <SelectTrigger id="tokenSelect" className="w-full">
              <SelectValue placeholder="Select a token" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_TOKENS.map((token) => (
                <SelectItem key={token.mint} value={token.symbol}>
                  {token.name} ({token.symbol})
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom Token Address</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Token Mint Address */}
        <div className="space-y-2">
          <Label htmlFor="tokenMint">Token Mint Address</Label>
          <Input
            id="tokenMint"
            type="text"
            value={tokenMint}
            onChange={(e) => setTokenMint(e.target.value)}
            placeholder="Enter token mint address"
            className="font-mono text-sm"
          />
          <p className="text-xs text-[var(--muted-foreground)]">
            The mint address identifies which token this gift card will hold.
          </p>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="flex items-center gap-2">
            <Coins className="w-4 h-4" />
            Amount
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.0001"
            min="0.0001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount (e.g., 1.0)"
            required
          />
        </div>

        {/* Date Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="unlockDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Unlock Date
            </Label>
            <CustomDatePicker
              date={unlockDateObj}
              onSelect={(date) => {
                if (date) {
                  setUnlockDate(date.toISOString());
                } else {
                  setUnlockDate("");
                }
              }}
              placeholder="When card becomes usable"
              minDate={now}
              showTime={true}
            />
            <p className="text-xs text-[var(--muted-foreground)]">
              Recipients can use the card after this date.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="refundDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Refund Date
            </Label>
            <CustomDatePicker
              date={refundDateObj}
              onSelect={(date) => {
                if (date) {
                  setRefundDate(date.toISOString());
                } else {
                  setRefundDate("");
                }
              }}
              placeholder="When you can reclaim funds"
              minDate={unlockDateObj || now}
              showTime={true}
            />
            <p className="text-xs text-[var(--muted-foreground)]">
              Unused funds can be refunded after this date.
            </p>
          </div>
        </div>

        {/* Merchant Rules (Optional) */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            Allowed Merchants (Optional)
          </Label>
          <p className="text-xs text-[var(--muted-foreground)]">
            Restrict redemption to specific merchant addresses. Leave empty to allow all merchants.
          </p>
          
          <div className="flex gap-2">
            <Input
              type="text"
              value={merchantInput}
              onChange={(e) => setMerchantInput(e.target.value)}
              placeholder="Enter merchant wallet address"
              className="font-mono text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (merchantInput.trim()) {
                    addAllowedMerchant(merchantInput);
                    setMerchantInput("");
                  }
                }
              }}
              disabled={allowedMerchants.length >= 10}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (merchantInput.trim()) {
                  addAllowedMerchant(merchantInput);
                  setMerchantInput("");
                }
              }}
              disabled={!merchantInput.trim() || allowedMerchants.length >= 10}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {allowedMerchants.length >= 10 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Maximum of 10 merchants allowed.
            </p>
          )}

          {/* List of added merchants */}
          {allowedMerchants.length > 0 && (
            <div className="space-y-2 mt-3 p-3 bg-[var(--muted)]/30 rounded-lg border border-[var(--border)]">
              <p className="text-xs font-medium text-[var(--muted-foreground)]">
                Allowed Merchants ({allowedMerchants.length})
              </p>
              <div className="space-y-2">
                {allowedMerchants.map((merchant, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-[var(--card)] rounded border border-[var(--border)]"
                  >
                    <code className="text-xs font-mono text-[var(--foreground)] truncate flex-1">
                      {merchant}
                    </code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAllowedMerchant(index)}
                      className="h-6 w-6 p-0 text-[var(--muted-foreground)] hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  allowedMerchants.forEach((_, index) => removeAllowedMerchant(0));
                }}
                className="w-full text-xs"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full h-12 text-base font-semibold",
            isChristmasMode
              ? "bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700"
              : ""
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating Gift Card...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              Create Gift Card
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
}

// Existing Gift Cards List Component
function GiftCardsList({ 
  cards, 
  isLoading,
  onRefresh,
  isChristmasMode 
}: { 
  cards: GiftCardWithPDA[];
  isLoading: boolean;
  onRefresh: () => void;
  isChristmasMode: boolean;
}) {
  const { publicKey } = useWallet();
  const program = useProgram();
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingMerchants, setEditingMerchants] = useState<string | null>(null);
  const [merchantInputs, setMerchantInputs] = useState<{ [key: string]: string[] }>({});
  
  const {
    redeemMerchant,
    redeemAmount,
    setRedeemMerchant,
    setRedeemAmount,
    resetRedeemForm,
  } = useGiftCardStore();

  function formatDate(timestamp: BN): string {
    return new Date(timestamp.toNumber() * 1000).toLocaleString();
  }

  function formatBalance(balance: BN, decimals: number = 9): string {
    return (balance.toNumber() / Math.pow(10, decimals)).toFixed(4);
  }

  function getCardIdString(cardId: BN): string {
    return cardId.toString();
  }

  function isCardUnlocked(card: GiftCardWithPDA): boolean {
    return new Date() >= new Date(Number(card.unlockDate) * 1000);
  }

  function isCardExpired(card: GiftCardWithPDA): boolean {
    return new Date() >= new Date(Number(card.refundDate) * 1000);
  }

  async function handleRedeem(e: React.FormEvent, card: GiftCardWithPDA) {
    e.preventDefault();
    if (!program || !publicKey) {
      toast.error("Wallet not connected");
      return;
    }

    if (!redeemMerchant || !redeemAmount) {
      toast.error("Please fill in merchant address and amount");
      return;
    }

    const cardIdStr = getCardIdString(card.cardId);
    setActionLoading(cardIdStr);

    try {
      const cardId = BigInt(card.cardId.toString());
      const tx = await redeemGiftCard(
        program,
        publicKey,
        cardId,
        redeemMerchant,
        parseFloat(redeemAmount)
      );

      toast.success("Redeemed successfully!", {
        description: `Transaction: ${tx.slice(0, 8)}...`,
      });
      resetRedeemForm();
      onRefresh();
    } catch (e: any) {
      console.error("Error redeeming:", e);
      toast.error(e.message || "Failed to redeem gift card");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRefund(card: GiftCardWithPDA) {
    if (!program || !publicKey) {
      toast.error("Wallet not connected");
      return;
    }

    const cardIdStr = getCardIdString(card.cardId);
    setActionLoading(cardIdStr);

    try {
      const cardId = BigInt(card.cardId.toString());
      const tx = await refundGiftCard(program, publicKey, cardId);
      toast.success("Refunded successfully!", {
        description: `Transaction: ${tx.slice(0, 8)}...`,
      });
      onRefresh();
    } catch (e: any) {
      console.error("Error refunding:", e);
      toast.error(e.message || "Failed to refund gift card");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSetMerchantRules(card: GiftCardWithPDA) {
    if (!program || !publicKey) {
      toast.error("Wallet not connected");
      return;
    }

    const cardIdStr = getCardIdString(card.cardId);
    const merchants = (merchantInputs[cardIdStr] || [])
      .map(addr => addr.trim())
      .filter(addr => addr.length > 0);
    
    // Validate merchant addresses
    try {
      merchants.forEach(addr => new PublicKey(addr));
    } catch (e) {
      toast.error("Invalid merchant address format");
      return;
    }

    setActionLoading(cardIdStr);

    try {
      const cardId = BigInt(card.cardId.toString());
      const tx = await setGiftCardRules(program, publicKey, cardId, merchants);
      toast.success("Merchant rules updated!", {
        description: `Transaction: ${tx.slice(0, 8)}...`,
      });
      setEditingMerchants(null);
      onRefresh();
    } catch (e: any) {
      console.error("Error setting merchant rules:", e);
      toast.error(e.message || "Failed to update merchant rules");
    } finally {
      setActionLoading(null);
    }
  }

  function startEditingMerchants(card: GiftCardWithPDA) {
    const cardIdStr = getCardIdString(card.cardId);
    setMerchantInputs({
      ...merchantInputs,
      [cardIdStr]: card.allowedMerchants.map(m => m.toString()),
    });
    setEditingMerchants(cardIdStr);
  }

  function cancelEditingMerchants() {
    setEditingMerchants(null);
  }

  if (isLoading && cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-[var(--muted-foreground)]">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading your gift cards...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return null; // Don't show anything if no cards
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className={cn(
          "text-xl font-semibold flex items-center gap-2",
          isChristmasMode ? "text-white" : "text-[var(--foreground)]"
        )}>
          <CreditCard className="w-5 h-5" />
          Your Gift Cards ({cards.length})
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
        </Button>
      </div>
      
      <div className="space-y-3">
        {cards.map((card, index) => {
          const cardIdStr = getCardIdString(card.cardId);
          const isExpanded = expandedCardId === cardIdStr;
          const unlocked = isCardUnlocked(card);
          const expired = isCardExpired(card);
          const isThisCardLoading = actionLoading === cardIdStr;
          
          return (
            <motion.div
              key={cardIdStr}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "border rounded-xl overflow-hidden transition-shadow",
                isChristmasMode
                  ? "border-white/20 bg-white/10 backdrop-blur-sm"
                  : "border-[var(--border)] bg-[var(--card)]",
                isExpanded && "shadow-lg"
              )}
            >
              {/* Card Header */}
              <button
                onClick={() => setExpandedCardId(isExpanded ? null : cardIdStr)}
                className="w-full p-4 flex items-center justify-between hover:bg-[var(--muted)]/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-2.5 rounded-full",
                    unlocked 
                      ? "bg-green-100 dark:bg-green-900/30" 
                      : "bg-amber-100 dark:bg-amber-900/30"
                  )}>
                    {unlocked ? (
                      <Unlock className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className={cn(
                      "font-semibold text-lg",
                      isChristmasMode ? "text-white" : "text-[var(--foreground)]"
                    )}>
                      {formatBalance(card.balance, card.decimals || 9)} tokens
                    </div>
                    <div className={cn(
                      "text-sm",
                      isChristmasMode ? "text-white/70" : "text-[var(--muted-foreground)]"
                    )}>
                      {unlocked 
                        ? (expired ? "Ready for refund" : "Active & Unlocked") 
                        : `Unlocks ${formatDate(card.unlockDate)}`
                      }
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-xs px-3 py-1.5 rounded-full font-medium",
                    card.balance.toNumber() > 0
                      ? expired
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                        : unlocked
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  )}>
                    {card.balance.toNumber() === 0 
                      ? "Empty" 
                      : expired 
                        ? "Refundable" 
                        : unlocked 
                          ? "Active" 
                          : "Locked"
                    }
                  </span>
                  {isExpanded ? (
                    <ChevronUp className={cn(
                      "w-5 h-5",
                      isChristmasMode ? "text-white/70" : "text-[var(--muted-foreground)]"
                    )} />
                  ) : (
                    <ChevronDown className={cn(
                      "w-5 h-5",
                      isChristmasMode ? "text-white/70" : "text-[var(--muted-foreground)]"
                    )} />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-[var(--border)] p-4 space-y-5"
                  >
                    {/* Card Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-[var(--muted-foreground)]">Unlock Date</span>
                        <p className="font-medium text-[var(--foreground)]">{formatDate(card.unlockDate)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-[var(--muted-foreground)]">Refund Date</span>
                        <p className="font-medium text-[var(--foreground)]">{formatDate(card.refundDate)}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm text-[var(--muted-foreground)]">Token Mint</span>
                        <p className="font-mono text-xs text-[var(--foreground)] break-all bg-[var(--muted)]/30 p-2 rounded mt-1">
                          {card.tokenMint.toString()}
                        </p>
                      </div>
                    </div>

                    {/* Merchant Rules Section */}
                    <div className="border-t border-[var(--border)] pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                          <Store className="w-4 h-4" />
                          Allowed Merchants
                        </h4>
                        {editingMerchants !== cardIdStr && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => startEditingMerchants(card)}
                            disabled={isThisCardLoading}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                      
                      {editingMerchants === cardIdStr ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label className="text-sm">Merchant Addresses (up to 10)</Label>
                            <div className="space-y-2">
                              {(merchantInputs[cardIdStr] || []).map((merchant, idx) => (
                                <div key={idx} className="flex gap-2">
                                  <Input
                                    type="text"
                                    value={merchant}
                                    onChange={(e) => {
                                      const updated = [...(merchantInputs[cardIdStr] || [])];
                                      updated[idx] = e.target.value;
                                      setMerchantInputs({
                                        ...merchantInputs,
                                        [cardIdStr]: updated,
                                      });
                                    }}
                                    placeholder="Merchant wallet address"
                                    className="font-mono text-sm"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const updated = merchantInputs[cardIdStr].filter((_, i) => i !== idx);
                                      setMerchantInputs({
                                        ...merchantInputs,
                                        [cardIdStr]: updated,
                                      });
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                              {(merchantInputs[cardIdStr] || []).length < 10 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setMerchantInputs({
                                      ...merchantInputs,
                                      [cardIdStr]: [...(merchantInputs[cardIdStr] || []), ""],
                                    });
                                  }}
                                  className="w-full"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Merchant
                                </Button>
                              )}
                            </div>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              Leave empty to allow all merchants. Maximum 10 merchants.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="default"
                              onClick={() => handleSetMerchantRules(card)}
                              disabled={isThisCardLoading}
                              className="flex-1"
                            >
                              {isThisCardLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                "Save Rules"
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={cancelEditingMerchants}
                              disabled={isThisCardLoading}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {card.allowedMerchants && card.allowedMerchants.length > 0 ? (
                            <div className="space-y-2">
                              {card.allowedMerchants.map((merchant, idx) => (
                                <div
                                  key={idx}
                                  className="p-2 bg-[var(--muted)]/30 rounded border border-[var(--border)]"
                                >
                                  <code className="text-xs font-mono text-[var(--foreground)] break-all">
                                    {merchant.toString()}
                                  </code>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-[var(--muted-foreground)] italic">
                              All merchants are allowed (no restrictions)
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Redeem Section */}
                    {unlocked && !expired && card.balance.toNumber() > 0 && (
                      <div className="border-t border-[var(--border)] pt-4">
                        <h4 className="font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
                          <Coins className="w-4 h-4" />
                          Redeem to Merchant
                        </h4>
                        <form onSubmit={(e) => handleRedeem(e, card)} className="space-y-3">
                          <Input
                            type="text"
                            value={redeemMerchant}
                            onChange={(e) => setRedeemMerchant(e.target.value)}
                            placeholder="Merchant wallet address"
                            required
                            disabled={isThisCardLoading}
                          />
                          <Input
                            type="number"
                            step="0.0001"
                            value={redeemAmount}
                            onChange={(e) => setRedeemAmount(e.target.value)}
                            placeholder="Amount to redeem"
                            required
                            disabled={isThisCardLoading}
                          />
                          <Button
                            type="submit"
                            disabled={isThisCardLoading}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            {isThisCardLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              "Redeem"
                            )}
                          </Button>
                        </form>
                      </div>
                    )}

                    {/* Lock Warning */}
                    {!unlocked && (
                      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium mb-1">
                          <Lock className="h-4 w-4" />
                          Gift Card is Locked
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          This card will unlock on {formatDate(card.unlockDate)}. You cannot redeem tokens until then.
                        </p>
                      </div>
                    )}

                    {/* Refund Button */}
                    {expired && card.balance.toNumber() > 0 && (
                      <div className="border-t border-[var(--border)] pt-4">
                        <h4 className="font-semibold text-[var(--foreground)] mb-2">Refund Available</h4>
                        <p className="text-sm text-[var(--muted-foreground)] mb-3">
                          The refund period has started. You can now refund the remaining balance back to your wallet.
                        </p>
                        <Button
                          type="button"
                          onClick={() => handleRefund(card)}
                          disabled={isThisCardLoading}
                          className="w-full bg-orange-600 hover:bg-orange-700"
                        >
                          {isThisCardLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Refund Balance"
                          )}
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Main GiftCardManager Component
export function GiftCardManager() {
  const { publicKey } = useWallet();
  const program = useProgram();
  const isChristmasMode = useChristmasStore((state) => state.isChristmasMode);
  
  const {
    giftCards,
    loading,
    setGiftCards,
    setLoading,
    setError,
  } = useGiftCardStore();

  const loadGiftCards = useCallback(async () => {
    if (!program || !publicKey) {
      setGiftCards([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const cards = await fetchAllGiftCards(program, publicKey);
      setGiftCards(cards);
    } catch (e: any) {
      console.error("Error loading gift cards:", e);
      setGiftCards([]);
    } finally {
      setLoading(false);
    }
  }, [program, publicKey, setGiftCards, setLoading, setError]);

  // Load gift cards on mount or when wallet changes
  useEffect(() => {
    loadGiftCards();
  }, [loadGiftCards]);

  if (!publicKey) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "text-center p-8 md:p-12 rounded-xl",
          isChristmasMode
            ? "bg-gradient-to-br from-red-50/50 to-green-50/50 dark:from-red-950/20 dark:to-green-950/20 border border-red-200 dark:border-red-800"
            : "bg-[var(--muted)]/30 border border-[var(--border)]"
        )}
      >
        <div className="space-y-4">
          {isChristmasMode && <div className="text-5xl animate-bounce">🎄</div>}
          <Wallet className={cn(
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
            Connect your wallet to create and manage gift cards
          </p>
          <Link href="/faucet">
            <Button className={cn(
              "mt-4",
              isChristmasMode
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                : ""
            )}>
              <Coins className="w-4 h-4 mr-2" />
              Get Free Tokens
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-4xl space-y-8">
      {/* Create Form - Always visible */}
      <CreateGiftCardForm 
        onSuccess={loadGiftCards} 
        isChristmasMode={isChristmasMode}
      />

      {/* Existing Gift Cards */}
      <GiftCardsList
        cards={giftCards}
        isLoading={loading}
        onRefresh={loadGiftCards}
        isChristmasMode={isChristmasMode}
      />
    </div>
  );
}
