"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap } from "lucide-react";
import { WalletConnect } from "@/components/WalletConnect";
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignOutButton,
} from "@clerk/nextjs";

interface NavBarProps {
  variant?: "landing" | "authenticated";
  isScrolled?: boolean;
}

export function NavBar({ variant = "landing", isScrolled = false }: NavBarProps) {
  const [open, setOpen] = useState(false);

  if (variant === "authenticated") {
    return (
      <header className="flex justify-between items-center p-4 h-16 border-b bg-background">
        <div className="text-lg font-semibold">
          <Link href="/">
            <h2>SolStream</h2>
          </Link>
        </div>

        <nav className="hidden sm:flex gap-4 items-center">
          <WalletConnect />
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

        {open && (
          <div className="sm:hidden absolute top-16 left-0 right-0 bg-background border-b flex flex-col items-start gap-4 p-4 z-50">
            <WalletConnect />
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
      </header>
    );
  }

  // Landing page variant
  return (
    <nav className={`border-b border-blue-900/30 backdrop-blur-md sticky top-0 z-50 shadow-lg transition-all duration-300 ${
      isScrolled 
        ? 'bg-black/98 shadow-blue-900/20' 
        : 'bg-black/95 shadow-blue-900/10'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent group-hover:from-blue-100 group-hover:to-white transition-all duration-300">
              SolStream
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <a 
              href="#features" 
              className="relative px-4 py-2 text-gray-300 hover:text-white hover:bg-blue-600/10 rounded-lg transition-all duration-300 hover:scale-105 font-medium group"
            >
              Features
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-500 group-hover:w-3/4 transition-all duration-300 rounded-full"></span>
            </a>
            <a 
              href="#how-it-works" 
              className="relative px-4 py-2 text-gray-300 hover:text-white hover:bg-blue-600/10 rounded-lg transition-all duration-300 hover:scale-105 font-medium group"
            >
              How it Works
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-500 group-hover:w-3/4 transition-all duration-300 rounded-full"></span>
            </a>
            <a 
              href="#pricing" 
              className="relative px-4 py-2 text-gray-300 hover:text-white hover:bg-blue-600/10 rounded-lg transition-all duration-300 hover:scale-105 font-medium group"
            >
              Pricing
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-500 group-hover:w-3/4 transition-all duration-300 rounded-full"></span>
            </a>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <SignedOut>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-blue-600/50 text-blue-400 hover:bg-blue-600/10 hover:border-blue-500 hover:text-blue-300 transition-all duration-300 hover:scale-105 font-medium px-6"
                asChild
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-300 hover:scale-105 font-medium px-6"
                asChild
              >
                <Link href="/onboard">Get Started</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-blue-600/50 text-blue-400 hover:bg-blue-600/10 hover:border-blue-500 hover:text-blue-300 transition-all duration-300 hover:scale-105 font-medium px-6"
                asChild
              >
                <Link href="/buttons">Dashboard</Link>
              </Button>
              <UserButton />
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setOpen(!open)}
              className="border-blue-600/50 text-blue-400 hover:bg-blue-600/10 hover:border-blue-500 hover:text-blue-300 transition-all duration-300"
            >
              {open ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/98 backdrop-blur-md border-t border-blue-900/30 shadow-lg shadow-blue-900/20 animate-in slide-in-from-top-2 duration-300">
            <div className="px-4 py-6 space-y-4">
              <a 
                href="#features" 
                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-blue-600/10 rounded-lg transition-all duration-300 font-medium"
                onClick={() => setOpen(false)}
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-blue-600/10 rounded-lg transition-all duration-300 font-medium"
                onClick={() => setOpen(false)}
              >
                How it Works
              </a>
              <a 
                href="#pricing" 
                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-blue-600/10 rounded-lg transition-all duration-300 font-medium"
                onClick={() => setOpen(false)}
              >
                Pricing
              </a>
              <div className="pt-4 space-y-3">
                <SignedOut>
                  <Button 
                    variant="outline" 
                    className="w-full border-blue-600/50 text-blue-400 hover:bg-blue-600/10 hover:border-blue-500 hover:text-blue-300 transition-all duration-300 font-medium"
                    asChild
                  >
                    <Link href="/sign-in" onClick={() => setOpen(false)}>Sign In</Link>
                  </Button>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-300 font-medium"
                    asChild
                  >
                    <Link href="/onboard" onClick={() => setOpen(false)}>Get Started</Link>
                  </Button>
                </SignedOut>
                <SignedIn>
                  <Button 
                    variant="outline" 
                    className="w-full border-blue-600/50 text-blue-400 hover:bg-blue-600/10 hover:border-blue-500 hover:text-blue-300 transition-all duration-300 font-medium"
                    asChild
                  >
                    <Link href="/buttons" onClick={() => setOpen(false)}>Dashboard</Link>
                  </Button>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
