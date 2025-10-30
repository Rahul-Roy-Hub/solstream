"use client";

import { WagmiProvider } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  getDefaultConfig,
  RainbowKitProvider,
  ConnectButton,
} from "@rainbow-me/rainbowkit";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Link from "next/link";
import {
  ClerkProvider,
  SignedIn,
  UserButton,
  SignOutButton,
} from "@clerk/nextjs";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const config = getDefaultConfig({
  appName: "Crypto Checkout",
  projectId: "53688872b6773653b330aeac9b47748d",
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <ClerkProvider>
              <SignedIn>
                <header className="flex justify-between items-center p-4 h-16 border-b">
                  <div className="text-lg font-semibold">
                    <Link href="/">
                      <h2>Settle</h2>
                    </Link>
                  </div>

                  <nav className="hidden sm:flex gap-4 items-center">
                    <ConnectButton />
                    <Link href="/buttons">Buttons</Link>
                    <Link href="/history">History</Link>
                    <Link href="/settings">Settings</Link>
                    <UserButton />
                    <SignOutButton>
                      <button className="bg-red-500 text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                        Sign Out
                      </button>
                    </SignOutButton>
                  </nav>

                  <div className="sm:hidden">
                    <button onClick={() => setOpen(!open)}>
                      {open ? <X size={24} /> : <Menu size={24} />}
                    </button>
                  </div>
                </header>

                {open && (
                  <div className="sm:hidden flex flex-col items-start gap-4 p-4 border-b">
                    <ConnectButton />
                    <Link href="/buttons" onClick={() => setOpen(false)}>
                      Buttons
                    </Link>
                    <Link href="/history" onClick={() => setOpen(false)}>
                      History
                    </Link>
                    <Link href="/settings" onClick={() => setOpen(false)}>
                      Settings
                    </Link>
                    <UserButton />
                    <SignOutButton>
                      <button className="bg-red-500 text-white rounded-full font-medium text-sm h-10 px-4 cursor-pointer">
                        Sign Out
                      </button>
                    </SignOutButton>
                  </div>
                )}
              </SignedIn>

              {children}
            </ClerkProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
