"use client";

import { FC, ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

export const SolanaWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // Use a more reliable public RPC endpoint
  // You can also set NEXT_PUBLIC_SOLANA_RPC_URL in your .env file to use a custom RPC
  const endpoint = useMemo(() => {
    // Check for custom RPC URL from environment variable
    // In Next.js, client-side env vars must be prefixed with NEXT_PUBLIC_
    const customRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    if (customRpc) {
      return customRpc;
    }
    
    // Use Ankr's public RPC endpoint (more reliable than official Solana endpoint)
    // Ankr provides a free public endpoint with better rate limits
    // Alternative: "https://api.mainnet-beta.solana.com" (official, but rate-limited)
    return "https://rpc.ankr.com/solana";
  }, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

