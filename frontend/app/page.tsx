import { WalletButton } from "@/components/WalletButton";
import { GiftCardManager } from "@/components/GiftCardManager";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-start py-16 px-8 bg-white dark:bg-black">
        <div className="w-full flex justify-end mb-8">
          <WalletButton />
        </div>
        
        <div className="flex flex-col items-center gap-8 text-center w-full">
          <h1 className="text-4xl font-bold text-black dark:text-zinc-50">
            Onchain Gift Cards
          </h1>
          <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Create, manage, and redeem gift cards on the Solana blockchain
          </p>
          
          <GiftCardManager />
        </div>
      </main>
    </div>
  );
}
