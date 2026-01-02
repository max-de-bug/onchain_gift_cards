"use client";

import { 
  PublicKey, 
  SystemProgram,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  getMint,
  getAccount,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Transaction } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { getGiftCardPDA, generateCardId } from "./anchor";
import { PROGRAM_ID } from "@/config/solana";

export interface GiftCardData {
  cardId: BN;
  owner: PublicKey;
  balance: BN;
  unlockDate: BN;
  refundDate: BN;
  tokenMint: PublicKey;
  escrowTokenAccount: PublicKey;
  allowedMerchants: PublicKey[];
  bump: number;
  decimals: number;
}

export interface GiftCardWithPDA extends GiftCardData {
  publicKey: PublicKey;
}

/**
 * Create a new gift card
 */
export async function createGiftCard(
  program: any,
  wallet: PublicKey,
  connection: any,
  tokenMint: string,
  amount: number,
  unlockDate: Date,
  refundDate: Date
): Promise<{ txSignature: string; cardId: bigint }> {
  const mintPubkey = new PublicKey(tokenMint);
  
  // Generate a unique card ID
  const cardId = generateCardId();
  const cardIdBN = new BN(cardId.toString());
  
  // Get the gift card PDA with card ID
  const [giftCardPDA] = getGiftCardPDA(wallet, cardId, PROGRAM_ID);
  
  // Get associated token account address
  const giftGiverTokenAccount = await getAssociatedTokenAddress(
    mintPubkey,
    wallet,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // Get token mint info for decimals first
  let decimals = 9; // default
  try {
    const mintInfo = await getMint(connection, mintPubkey);
    decimals = mintInfo.decimals;
  } catch (e) {
    console.warn("Could not fetch mint decimals, using default 9:", e);
  }
  
  // Convert amount to token units (accounting for decimals)
  const amountBN = new BN(amount * Math.pow(10, decimals));

  // Check if token account exists, and verify balance
  let needsATA = false;
  let hasInsufficientBalance = false;
  let currentBalance = 0;

  try {
    const tokenAccount = await getAccount(connection, giftGiverTokenAccount, "confirmed", TOKEN_PROGRAM_ID);
    const balanceBN = new BN(tokenAccount.amount.toString());
    currentBalance = balanceBN.toNumber() / Math.pow(10, decimals);
    
    if (balanceBN.lt(amountBN)) {
      hasInsufficientBalance = true;
    }
  } catch (e) {
    // Account doesn't exist, we need to create it
    // But if it doesn't exist, the user has 0 balance (can't have tokens without an ATA)
    needsATA = true;
    hasInsufficientBalance = true;
    currentBalance = 0;
  }

  // Check balance and provide helpful error message
  if (hasInsufficientBalance) {
    if (needsATA) {
      throw new Error(
        `Your token account doesn't exist yet. Please receive at least ${amount.toFixed(4)} tokens first. Once you receive tokens, your token account will be created automatically.`
      );
    } else {
      throw new Error(
        `Insufficient token balance. You have ${currentBalance.toFixed(4)} tokens, but need ${amount.toFixed(4)} tokens. Please add more tokens to your account before creating a gift card.`
      );
    }
  }
  
  // Convert dates to unix timestamps
  const unlockTimestamp = new BN(Math.floor(unlockDate.getTime() / 1000));
  const refundTimestamp = new BN(Math.floor(refundDate.getTime() / 1000));

  // Find the escrow token account PDA
  const [escrowTokenAccount] = PublicKey.findProgramAddressSync(
    [
      giftCardPDA.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      mintPubkey.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // Build the createGiftCard instruction with card_id as first arg
  const createGiftCardIx = await program.methods
    .createGiftCard(cardIdBN, amountBN, unlockTimestamp, refundTimestamp)
    .accounts({
      giftCard: giftCardPDA,
      escrowTokenAccount: escrowTokenAccount,
      tokenMint: mintPubkey,
      giftGiverTokenAccount: giftGiverTokenAccount,
      giftGiver: wallet,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    .instruction();

  // Create transaction
  const transaction = new Transaction();

  // Add ATA creation instruction first if needed
  if (needsATA) {
    const createATAInstruction = createAssociatedTokenAccountInstruction(
      wallet, // payer
      giftGiverTokenAccount, // ata
      wallet, // owner
      mintPubkey, // mint
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    transaction.add(createATAInstruction);
  }

  // Add the createGiftCard instruction
  transaction.add(createGiftCardIx);

  // Send and confirm the transaction
  const txSignature = await program.provider.sendAndConfirm(transaction);

  return { txSignature, cardId };
}

/**
 * Fetch all gift cards for an owner
 */
export async function fetchAllGiftCards(
  program: any,
  owner: PublicKey
): Promise<GiftCardWithPDA[]> {
  try {
    // Fetch all gift card accounts where owner matches
    const allGiftCards = await program.account.giftCard.all([
      {
        memcmp: {
          offset: 8 + 8, // After discriminator (8 bytes) + card_id (8 bytes)
          bytes: owner.toBase58(),
        },
      },
    ]);
    
    return allGiftCards.map((item: any) => ({
      ...item.account,
      publicKey: item.publicKey,
    }));
  } catch (e) {
    console.error("Error fetching gift cards:", e);
    return [];
  }
}

/**
 * Fetch a specific gift card by card ID
 */
export async function fetchGiftCard(
  program: any,
  owner: PublicKey,
  cardId: bigint
): Promise<GiftCardData | null> {
  try {
    const [giftCardPDA] = getGiftCardPDA(owner, cardId, PROGRAM_ID);
    const giftCard = await program.account.giftCard.fetch(giftCardPDA);
    return giftCard;
  } catch (e) {
    return null;
  }
}

/**
 * Redeem tokens from a gift card to a merchant
 */
export async function redeemGiftCard(
  program: any,
  wallet: PublicKey,
  cardId: bigint,
  merchant: string,
  amount: number
): Promise<string> {
  const merchantPubkey = new PublicKey(merchant);
  const cardIdBN = new BN(cardId.toString());
  const [giftCardPDA] = getGiftCardPDA(wallet, cardId, PROGRAM_ID);
  
  // Fetch gift card to get token mint and escrow account
  const giftCard = await program.account.giftCard.fetch(giftCardPDA);
  const tokenMint = giftCard.tokenMint;
  const escrowTokenAccount = giftCard.escrowTokenAccount;
  const decimals = giftCard.decimals;
  
  // Convert amount to token units
  const amountBN = new BN(amount * Math.pow(10, decimals));
  
  // Get merchant's token account address
  const merchantTokenAccount = await getAssociatedTokenAddress(
    tokenMint,
    merchantPubkey,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // Check if merchant's token account exists
  let merchantATAExists = false;
  try {
    await getAccount(
      program.provider.connection,
      merchantTokenAccount,
      "confirmed",
      TOKEN_PROGRAM_ID
    );
    merchantATAExists = true;
  } catch {
    merchantATAExists = false;
  }

  // Build transaction
  const transaction = new Transaction();

  // If merchant's ATA doesn't exist, create it first
  if (!merchantATAExists) {
    const createATAInstruction = createAssociatedTokenAccountInstruction(
      wallet, // payer (the gift card owner pays for ATA creation)
      merchantTokenAccount, // ata to create
      merchantPubkey, // owner of the new ATA
      tokenMint, // token mint
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    transaction.add(createATAInstruction);
  }

  // Build the redeem instruction with card_id as first arg
  const redeemIx = await program.methods
    .redeem(cardIdBN, amountBN)
    .accounts({
      giftCard: giftCardPDA,
      escrowTokenAccount: escrowTokenAccount,
      tokenMint: tokenMint,
      merchantTokenAccount: merchantTokenAccount,
      merchant: merchantPubkey,
      owner: wallet,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();

  transaction.add(redeemIx);

  // Send and confirm the transaction
  const tx = await program.provider.sendAndConfirm(transaction);

  return tx;
}

/**
 * Refund remaining balance back to gift giver
 */
export async function refundGiftCard(
  program: any,
  wallet: PublicKey,
  cardId: bigint
): Promise<string> {
  const cardIdBN = new BN(cardId.toString());
  const [giftCardPDA] = getGiftCardPDA(wallet, cardId, PROGRAM_ID);
  
  // Fetch gift card to get token mint and escrow account
  const giftCard = await program.account.giftCard.fetch(giftCardPDA);
  const tokenMint = giftCard.tokenMint;
  const escrowTokenAccount = giftCard.escrowTokenAccount;
  
  // Get gift giver's token account
  const giftGiverTokenAccount = await getAssociatedTokenAddress(
    tokenMint,
    wallet,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const tx = await program.methods
    .refund(cardIdBN)
    .accounts({
      giftCard: giftCardPDA,
      escrowTokenAccount: escrowTokenAccount,
      tokenMint: tokenMint,
      giftGiverTokenAccount: giftGiverTokenAccount,
      owner: wallet,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();

  return tx;
}

/**
 * Set allowed merchants for a gift card
 */
export async function setGiftCardRules(
  program: any,
  wallet: PublicKey,
  cardId: bigint,
  allowedMerchants: string[]
): Promise<string> {
  const cardIdBN = new BN(cardId.toString());
  const [giftCardPDA] = getGiftCardPDA(wallet, cardId, PROGRAM_ID);
  
  // Convert merchant addresses to PublicKeys
  const merchantPubkeys = allowedMerchants.map(addr => new PublicKey(addr));
  
  const tx = await program.methods
    .ruleSet(cardIdBN, merchantPubkeys)
    .accounts({
      giftCard: giftCardPDA,
      owner: wallet,
    })
    .rpc();

  return tx;
}

/**
 * Get WSOL (Wrapped SOL) mint address for devnet/mainnet
 */
export function getWSOLMint(network: string): string {
  // WSOL is the same on all networks
  return "So11111111111111111111111111111111111111112";
}
