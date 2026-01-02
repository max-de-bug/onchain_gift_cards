import { create } from "zustand";
import type { GiftCardWithPDA } from "../giftCard";

// WSOL mint address (same on all networks)
const WSOL_MINT = "So11111111111111111111111111111111111111112";

interface GiftCardState {
  // Multiple gift cards support
  giftCards: GiftCardWithPDA[];
  setGiftCards: (giftCards: GiftCardWithPDA[]) => void;
  
  // Currently selected card for actions
  selectedCardId: bigint | null;
  setSelectedCardId: (cardId: bigint | null) => void;

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
  allowedMerchants: string[];
  addAllowedMerchant: (merchant: string) => void;
  removeAllowedMerchant: (index: number) => void;
  clearAllowedMerchants: () => void;

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
  giftCards: [],
  selectedCardId: null,
  loading: false,
  error: null,
  tokenMint: WSOL_MINT,
  amount: "",
  unlockDate: "",
  refundDate: "",
  allowedMerchants: [],
  redeemMerchant: "",
  redeemAmount: "",

  // Setters
  setGiftCards: (giftCards) => set({ giftCards }),
  setSelectedCardId: (cardId) => set({ selectedCardId: cardId }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setTokenMint: (tokenMint) => set({ tokenMint }),
  setAmount: (amount) => set({ amount }),
  setUnlockDate: (unlockDate) => set({ unlockDate }),
  setRefundDate: (refundDate) => set({ refundDate }),
  addAllowedMerchant: (merchant) =>
    set((state) => {
      const trimmed = merchant.trim();
      if (!trimmed || state.allowedMerchants.includes(trimmed)) {
        return state;
      }
      if (state.allowedMerchants.length >= 10) {
        return state; // Max 10 merchants
      }
      return { allowedMerchants: [...state.allowedMerchants, trimmed] };
    }),
  removeAllowedMerchant: (index) =>
    set((state) => ({
      allowedMerchants: state.allowedMerchants.filter((_, i) => i !== index),
    })),
  clearAllowedMerchants: () => set({ allowedMerchants: [] }),
  setRedeemMerchant: (merchant) => set({ redeemMerchant: merchant }),
  setRedeemAmount: (amount) => set({ redeemAmount: amount }),

  // Reset functions
  resetCreateForm: () =>
    set({
      amount: "",
      unlockDate: "",
      refundDate: "",
      allowedMerchants: [],
    }),
  resetRedeemForm: () =>
    set({
      redeemMerchant: "",
      redeemAmount: "",
    }),
}));
