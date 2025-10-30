"use client";

import { SignIn } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Cpu, 
  Sparkles, 
  Shield, 
  Zap, 
  Globe, 
  Lock
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Enterprise Security",
    description: "Bank-grade security with multi-signature wallets"
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Lightning Fast",
    description: "Process payments in seconds"
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Global Reach",
    description: "Accept payments from anywhere in the world"
  }
];

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-blue-900/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
                <Cpu className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent group-hover:from-blue-100 group-hover:to-white transition-all duration-300">
                SolStream
              </span>
            </Link>
            <Link href="/">
              <Button variant="outline" className="border-blue-600/50 text-blue-400 hover:bg-blue-600/10 hover:border-blue-500 hover:text-blue-300 transition-all duration-300 hover:scale-105 font-medium group">
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-7xl mx-auto">
          {/* Left Side - Features */}
          <div className="space-y-8">
            <div className="space-y-6">
              <Badge variant="secondary" className="w-fit bg-blue-600/20 text-blue-300 border-blue-500/30 text-lg px-6 py-3">
                <Sparkles className="h-5 w-5 mr-2" />
                Welcome Back
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                  Sign in to your
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  crypto dashboard
                </span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Access your payment buttons, transaction history, and analytics. 
                Manage your crypto payment infrastructure with ease.
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">Why choose SolStream?</h3>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4 group">
                    <div className="text-blue-400 group-hover:scale-110 transition-transform duration-300 flex-shrink-0 mt-1">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">{feature.title}</h4>
                      <p className="text-gray-300">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600/10 to-blue-400/10 rounded-2xl p-6 border border-blue-900/30">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                  <Lock className="h-4 w-4 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white">Secure & Compliant</h4>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Your data is protected with enterprise-grade security. We&apos;re SOC 2 compliant 
                and follow industry best practices for crypto payment processing.
              </p>
            </div>
          </div>

          {/* Right Side - Sign In Form */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <Card className="p-8 bg-gray-900/80 backdrop-blur-sm border-blue-900/30">
                <div className="text-center mb-8">
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Cpu className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                  <p className="text-gray-400">Sign in to continue to your dashboard</p>
                </div>
                
                <div className="space-y-6">
                  <SignIn />
                </div>

                <div className="mt-8 text-center">
                  <p className="text-gray-400 text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/sign-in" className="text-blue-400 hover:text-blue-300 transition-colors duration-300 font-medium">
                      Sign up here
                    </Link>
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-blue-900/30 py-12 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                <Cpu className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                SolStream
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Built for the crypto community
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
