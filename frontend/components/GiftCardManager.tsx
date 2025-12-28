"use client";

import { useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useProgram } from "@/lib/anchor";
import { 
  createGiftCard, 
  fetchGiftCard, 
  redeemGiftCard, 
  refundGiftCard,
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
import { format } from "date-fns";

export function GiftCardManager() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const program = useProgram();
  
  const {
    giftCard,
    loading,
    error,
    tokenMint,
    amount,
    unlockDate,
    refundDate,
    redeemMerchant,
    redeemAmount,
    setGiftCard,
    setLoading,
    setError,
    setTokenMint,
    setAmount,
    setUnlockDate,
    setRefundDate,
    setRedeemMerchant,
    setRedeemAmount,
    resetCreateForm,
    resetRedeemForm,
  } = useGiftCardStore();

  // Load gift card on mount or when wallet changes
  useEffect(() => {
    if (program && publicKey) {
      loadGiftCard();
    } else {
      setGiftCard(null);
    }
  }, [program, publicKey]);

  async function loadGiftCard() {
    if (!program || !publicKey) return;
    
    setLoading(true);
    setError(null);
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

  async function handleCreateGiftCard(e: React.FormEvent) {
    e.preventDefault();
    if (!program || !publicKey) {
      setError("Wallet not connected");
      toast.error("Wallet not connected");
      return;
    }

    if (!amount || !unlockDate || !refundDate || !tokenMint) {
      setError("Please fill in all fields");
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const unlock = new Date(unlockDate);
      const refund = new Date(refundDate);
      const now = new Date();

      if (unlock <= now) {
        const errorMsg = "Unlock date must be in the future";
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      if (refund <= unlock) {
        const errorMsg = "Refund date must be after unlock date";
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      const tx = await createGiftCard(
        program,
        publicKey,
        connection,
        tokenMint,
        parseFloat(amount),
        unlock,
        refund
      );

      toast.success(`Gift card created! Transaction: ${tx}`);
      
      // Reset form
      resetCreateForm();
      
      // Reload gift card
      await loadGiftCard();
    } catch (e: any) {
      console.error("Error creating gift card:", e);
      const errorMsg = e.message || "Failed to create gift card";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

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

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    if (!program || !publicKey || !giftCard) {
      const errorMsg = "Wallet not connected or no gift card";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!redeemMerchant || !redeemAmount) {
      const errorMsg = "Please fill in merchant and amount";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tx = await redeemGiftCard(
        program,
        publicKey,
        redeemMerchant,
        parseFloat(redeemAmount)
      );

      toast.success(`Redeemed successfully! Transaction: ${tx}`);
      resetRedeemForm();
      await loadGiftCard();
    } catch (e: any) {
      console.error("Error redeeming:", e);
      const errorMsg = e.message || "Failed to redeem gift card";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefund() {
    if (!program || !publicKey || !giftCard) {
      const errorMsg = "Wallet not connected or no gift card";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tx = await refundGiftCard(program, publicKey);
      toast.success(`Refunded successfully! Transaction: ${tx}`);
      await loadGiftCard();
    } catch (e: any) {
      console.error("Error refunding:", e);
      const errorMsg = e.message || "Failed to refund gift card";
      setError(errorMsg);
      toast.error(errorMsg);
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

  if (!publicKey) {
    return (
      <div className="text-center text-zinc-600 dark:text-zinc-400">
        Connect your wallet to manage gift cards
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl space-y-8">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Create Gift Card Form */}
      {!giftCard && (
        <div className="p-6 border rounded-lg border-[var(--border)] bg-[var(--card)]">
          <h2 className="text-2xl font-semibold mb-4 text-[var(--foreground)]">
            Create Gift Card
          </h2>
          <form onSubmit={handleCreateGiftCard} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tokenSelect">Select Token</Label>
              <Select
                value={getTokenByMint(tokenMint)?.symbol || "custom"}
                onValueChange={(value) => {
                  if (value === "custom") {
                    // Keep current value if switching to custom
                    return;
                  }
                  const token = COMMON_TOKENS.find((t) => t.symbol === value);
                  if (token) {
                    setTokenMint(token.mint);
                  }
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

            <div className="space-y-2">
              <Label htmlFor="tokenMint">Token Mint Address</Label>
              <Input
                id="tokenMint"
                type="text"
                value={tokenMint}
                onChange={(e) => {
                  const newMint = e.target.value;
                  setTokenMint(newMint);
                  // If user types a custom address, the dropdown will auto-update to "custom"
                }}
                placeholder="Enter token mint address"
              />
              <div className="space-y-1">
                <p className="text-xs text-[var(--muted-foreground)]">
                  <strong>What is this?</strong> The mint address identifies which token type this gift card will hold. Select from common tokens above or enter a custom address.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.0001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unlockDate">Unlock Date (when card becomes usable)</Label>
              <CustomDatePicker
                date={unlockDateObj}
                onSelect={(date) => {
                  if (date) {
                    setUnlockDate(date.toISOString());
                  } else {
                    setUnlockDate("");
                  }
                }}
                placeholder="Select unlock date and time"
                minDate={now}
                showTime={true}
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                Choose when recipients can start using this gift card.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refundDate">Refund Date (when card can be refunded)</Label>
              <CustomDatePicker
                date={refundDateObj}
                onSelect={(date) => {
                  if (date) {
                    setRefundDate(date.toISOString());
                  } else {
                    setRefundDate("");
                  }
                }}
                placeholder="Select refund date and time"
                minDate={unlockDateObj || now}
                showTime={true}
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                Choose when unused funds can be refunded back to you. Must be after unlock date.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Creating..." : "Create Gift Card"}
            </Button>
          </form>
        </div>
      )}

      {/* Gift Card Details */}
      {giftCard && (
        <div className="space-y-6">
          <div className="p-6 border rounded-lg border-[var(--border)] bg-[var(--card)]">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--foreground)]">
              Your Gift Card
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Balance:</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {formatBalance(giftCard.balance, giftCard.decimals || 9)} tokens
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Unlock Date:</span>
                <span className="text-[var(--foreground)]">
                  {formatDate(giftCard.unlockDate)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Refund Date:</span>
                <span className="text-[var(--foreground)]">
                  {formatDate(giftCard.refundDate)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Token Mint:</span>
                <span className="text-xs text-[var(--foreground)] font-mono">
                  {giftCard.tokenMint.toString().slice(0, 8)}...
                </span>
              </div>

              {giftCard.allowedMerchants && giftCard.allowedMerchants.length > 0 && (
                <div>
                  <span className="text-[var(--muted-foreground)]">Allowed Merchants:</span>
                  <div className="mt-1 space-y-1">
                    {giftCard.allowedMerchants.map((merchant, idx) => (
                      <div key={idx} className="text-xs font-mono text-[var(--foreground)]">
                        {merchant.toString()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Redeem Form */}
          <div className="p-6 border rounded-lg border-[var(--border)] bg-[var(--card)]">
            <h3 className="text-xl font-semibold mb-4 text-[var(--foreground)]">
              Redeem to Merchant
            </h3>
            <form onSubmit={handleRedeem} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="redeemMerchant">Merchant Address</Label>
                <Input
                  id="redeemMerchant"
                  type="text"
                  value={redeemMerchant}
                  onChange={(e) => setRedeemMerchant(e.target.value)}
                  placeholder="Merchant wallet address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="redeemAmount">Amount to Redeem</Label>
                <Input
                  id="redeemAmount"
                  type="number"
                  step="0.0001"
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  placeholder="0.0"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="default"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? "Processing..." : "Redeem"}
              </Button>
            </form>
          </div>

          {/* Refund Button */}
          <div className="p-6 border rounded-lg border-[var(--border)] bg-[var(--card)]">
            <h3 className="text-xl font-semibold mb-4 text-[var(--foreground)]">
              Refund
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Refund remaining balance back to your wallet. Only available after the refund date.
            </p>
            <Button
              onClick={handleRefund}
              disabled={loading}
              variant="default"
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {loading ? "Processing..." : "Refund Balance"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
