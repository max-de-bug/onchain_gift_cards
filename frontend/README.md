# Onchain Gift Cards Frontend

Next.js frontend application for interacting with the Onchain Gift Cards Solana smart contract.

## Setup

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Configure environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Adjust `NEXT_PUBLIC_SOLANA_NETWORK` based on your needs (localnet, devnet, testnet, mainnet-beta)
   - Optionally set a custom `NEXT_PUBLIC_RPC_URL`

3. Generate the IDL (if not already generated):
   ```bash
   cd ../onchain-gift-cards-smart-contract
   anchor build
   ```
   This will generate the IDL file that the frontend uses to interact with the program.

4. Copy the IDL file to the frontend (recommended approach):
   ```bash
   # From the frontend directory
   cp ../onchain-gift-cards-smart-contract/target/idl/onchain_gift_cards.json ./lib/idl.json
   ```
   
   Alternatively, you can update the IDL import path in `lib/anchor.ts` to point directly to the smart contract's target folder, but copying is more reliable for deployment.

## Development

Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Connecting to Smart Contract

The frontend is configured to:
- Connect to your Anchor program using the program ID from `config/solana.ts`
- Use wallet adapters (Phantom, Solflare) for wallet connections
- Provide utilities for interacting with the gift card program

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `components/` - React components (WalletProvider, WalletButton, etc.)
- `config/` - Solana and program configuration
- `lib/` - Utilities and hooks for Anchor program interactions

## Notes

- Make sure your local Solana validator is running if using localnet
- The IDL path may need adjustment based on where Anchor generates it
- Program ID matches the one in `onchain-gift-cards-smart-contract/Anchor.toml`
