"use client";

import { ThemeProvider } from "@/components/ui/theme-provider";
import {
  ClerkProvider,
  SignedIn,
} from "@clerk/nextjs";
import { NavBar } from "@/components/NavBar";
import { SolanaWalletProvider } from "@/components/SolanaWalletProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SolanaWalletProvider>
        <ClerkProvider>
          <SignedIn>
            <NavBar variant="authenticated" />
          </SignedIn>

          {children}
        </ClerkProvider>
      </SolanaWalletProvider>
    </ThemeProvider>
  );
}
