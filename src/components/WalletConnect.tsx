"use client";

import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

export function WalletConnect() {
  const { publicKey, disconnect } = useWallet();

  if (publicKey) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900 px-3 py-1.5 rounded-lg">
          <Wallet className="h-4 w-4" />
          <span className="text-sm font-medium">
            {publicKey.toBase58().slice(0, 6)}...{publicKey.toBase58().slice(-4)}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnect()}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="wallet-adapter-button-trigger">
      <WalletMultiButton />
    </div>
  );
}

