import { create } from "zustand";
import { NETWORK } from "@/config/solana";
import type { GiftCardData } from "../giftCard";

// WSOL mint address (same on all networks)
const WSOL_MINT = "So11111111111111111111111111111111111111112";

interface GiftCardState {
  // Gift card data
  giftCard: GiftCardData | null;
  setGiftCard: (giftCard: GiftCardData | null) => void;

  // Loading state
  loading: boolean;
  setLoading: (loading: boolean) => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;

  // Form state for creating gift card
  tokenMint: string;
  setTokenMint: (tokenMint: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
  unlockDate: string;
  setUnlockDate: (unlockDate: string) => void;
  refundDate: string;
  setRefundDate: (refundDate: string) => void;

  // Form state for redeeming
  redeemMerchant: string;
  setRedeemMerchant: (merchant: string) => void;
  redeemAmount: string;
  setRedeemAmount: (amount: string) => void;

  // Reset form
  resetCreateForm: () => void;
  resetRedeemForm: () => void;
}

export const useGiftCardStore = create<GiftCardState>((set) => ({
  // Initial state
  giftCard: null,
  loading: false,
  error: null,
  tokenMint: WSOL_MINT,
  amount: "",
  unlockDate: "",
  refundDate: "",
  redeemMerchant: "",
  redeemAmount: "",

  // Setters
  setGiftCard: (giftCard) => set({ giftCard }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setTokenMint: (tokenMint) => set({ tokenMint }),
  setAmount: (amount) => set({ amount }),
  setUnlockDate: (unlockDate) => set({ unlockDate }),
  setRefundDate: (refundDate) => set({ refundDate }),
  setRedeemMerchant: (merchant) => set({ redeemMerchant: merchant }),
  setRedeemAmount: (amount) => set({ redeemAmount: amount }),

  // Reset functions
  resetCreateForm: () =>
    set({
      amount: "",
      unlockDate: "",
      refundDate: "",
    }),
  resetRedeemForm: () =>
    set({
      redeemMerchant: "",
      redeemAmount: "",
    }),
}));

