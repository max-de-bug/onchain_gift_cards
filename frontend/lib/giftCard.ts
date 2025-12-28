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
import { getGiftCardPDA } from "./anchor";
import { PROGRAM_ID } from "@/config/solana";

export interface GiftCardData {
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
): Promise<string> {
  const mintPubkey = new PublicKey(tokenMint);
  
  // Get the gift card PDA
  const [giftCardPDA] = getGiftCardPDA(wallet, PROGRAM_ID);
  
  // Get associated token account address
  const giftGiverTokenAccount = await getAssociatedTokenAddress(
    mintPubkey,
    wallet,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // Check if token account exists, create it if it doesn't
  let needsATA = false;
  try {
    await getAccount(connection, giftGiverTokenAccount, "confirmed", TOKEN_PROGRAM_ID);
  } catch (e) {
    // Account doesn't exist, we need to create it
    needsATA = true;
  }

  // Get token mint info for decimals
  let decimals = 9; // default
  try {
    const mintInfo = await getMint(connection, mintPubkey);
    decimals = mintInfo.decimals;
  } catch (e) {
    console.warn("Could not fetch mint decimals, using default 9:", e);
  }
  
  // Convert amount to token units (accounting for decimals)
  const amountBN = new BN(amount * Math.pow(10, decimals));
  
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

  // Build the createGiftCard instruction
  const createGiftCardIx = await program.methods
    .createGiftCard(amountBN, unlockTimestamp, refundTimestamp)
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
  const tx = await program.provider.sendAndConfirm(transaction);

  return tx;
}

/**
 * Fetch a gift card account
 */
export async function fetchGiftCard(
  program: any,
  owner: PublicKey
): Promise<GiftCardData | null> {
  try {
    const [giftCardPDA] = getGiftCardPDA(owner, PROGRAM_ID);
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
  merchant: string,
  amount: number
): Promise<string> {
  const merchantPubkey = new PublicKey(merchant);
  const [giftCardPDA, bump] = getGiftCardPDA(wallet, PROGRAM_ID);
  
  // Fetch gift card to get token mint and escrow account
  const giftCard = await program.account.giftCard.fetch(giftCardPDA);
  const tokenMint = giftCard.tokenMint;
  const escrowTokenAccount = giftCard.escrowTokenAccount;
  const decimals = giftCard.decimals;
  
  // Convert amount to token units
  const amountBN = new BN(amount * Math.pow(10, decimals));
  
  // Get merchant's token account
  const merchantTokenAccount = await getAssociatedTokenAddress(
    tokenMint,
    merchantPubkey,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const tx = await program.methods
    .redeem(amountBN)
    .accounts({
      giftCard: giftCardPDA,
      escrowTokenAccount: escrowTokenAccount,
      tokenMint: tokenMint,
      merchantTokenAccount: merchantTokenAccount,
      merchant: merchantPubkey,
      owner: wallet,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();

  return tx;
}

/**
 * Refund remaining balance back to gift giver
 */
export async function refundGiftCard(
  program: any,
  wallet: PublicKey
): Promise<string> {
  const [giftCardPDA] = getGiftCardPDA(wallet, PROGRAM_ID);
  
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
    .refund()
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
 * Get WSOL (Wrapped SOL) mint address for devnet/mainnet
 */
export function getWSOLMint(network: string): string {
  // WSOL is the same on all networks
  return "So11111111111111111111111111111111111111112";
}

