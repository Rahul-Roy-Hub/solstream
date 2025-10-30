"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getButtonById } from "@/actions/buttonActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { chains } from "@/utils/chain";
import getButtonComponentById from "@/utils/buttonComponentCode";
import PaymentButton from "@/components/PaymentButtonPage";
import { 
  Download, 
  Check, 
  Copy, 
  ArrowLeft, 
  Cpu, 
  DollarSign, 
  Globe, 
  XCircle,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

type Transaction = {
  _id: string;
  from: string;
  to: string;
  signature: string;
  time: string;
  amountUsd: number;
};

type ButtonType = {
  _id: string;
  name: string;
  description?: string;
  amountUsd: number;
  tokenAddress?: string;
  chainId: string[];
  merchantAddress: string;
  isActive: boolean;
  transactions: Transaction[];
};

type TransactionState = "success" | "failed" | "timeout" | "error";

export default function ButtonDetailsPage() {
  const { id } = useParams();
  const [button, setButton] = useState<ButtonType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const buttonComponentCode = getButtonComponentById(id as string);

  const handleTransactionStateChange = (
    state: TransactionState,
    transactionId: string
  ) => {
    toast.message(`Transaction ${state}: ${transactionId}`);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(buttonComponentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  useEffect(() => {
    if (!id) return;
    async function fetchButton() {
      setLoading(true);
      try {
        const res = await getButtonById(id as string);

        if (res.success) {
          setButton(res.button);
        } else {
          toast.message("Invalid url or something went wrong");
        }
      } catch {
        toast.message("Error fetching button details");
      } finally {
        setLoading(false);
      }
    }
    fetchButton();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!button) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="h-20 w-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Button Not Found</h2>
          <p className="text-muted-foreground mb-6">The payment button you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/buttons">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Buttons
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getChainName = (id: string) =>
    chains.find((c) => c.id === id)?.name || id;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col space-y-6">
            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <Link href="/buttons">
                <Button variant="outline" size="sm" className="hover:scale-105 transition-transform duration-200">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Buttons
                </Button>
              </Link>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <span>Dashboard</span>
                <span>/</span>
                <span>Payment Buttons</span>
                <span>/</span>
                <span className="text-foreground font-medium">{button.name}</span>
              </div>
            </div>

            {/* Title Section */}
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <Cpu className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  {button.name}
                </h1>
                <p className="text-lg text-muted-foreground">
                  Payment Button Details
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Button Details Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-bold text-foreground">{button.name}</CardTitle>
                  <Badge 
                    variant={button.isActive ? "default" : "secondary"}
                    className={button.isActive ? "bg-green-500/20 text-green-600 border-green-500/30 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30" : ""}
                  >
                    {button.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {button.description || "No description provided"}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Amount</p>
                        <p className="text-xl font-bold text-foreground">
                          ${(button.amountUsd || 0).toFixed(2)} USD
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Chains</p>
                        <p className="text-xl font-bold text-foreground">
                          {button.chainId.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chain Details */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Supported Chains</h3>
                  <div className="flex flex-wrap gap-2">
                    {button.chainId.length > 0 ? (
                      button.chainId.map((cid) => (
                        <Badge key={cid} variant="secondary">
                          {getChainName(cid)}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No chains selected</p>
                    )}
                  </div>
                </div>

                {/* Merchant Address */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Merchant Address</h3>
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <p className="text-muted-foreground text-sm font-mono break-all">
                      {button.merchantAddress}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={() => setShowDialog(true)}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Component
                  </Button>

                  <PaymentButton
                    buttonId={button._id}
                    onTransactionStateChange={handleTransactionStateChange}
                    amountUsd={button.amountUsd}
                    currency="USDC"
                    merchantName={button.name}
                  />
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Transactions</span>
                  <span className="text-foreground font-bold">{button.transactions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Revenue</span>
                  <span className="text-foreground font-bold">
                    ${button.transactions.reduce((sum, txn) => sum + (txn.amountUsd || 0), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge 
                    variant={button.isActive ? "default" : "secondary"}
                    className={button.isActive ? "bg-green-500/20 text-green-600 border-green-500/30 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30" : ""}
                  >
                    {button.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Share Button */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground">Share Button</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">
                  Share this payment button with your customers
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/buttons/${button._id}`);
                    toast.success("Button URL copied to clipboard!");
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Copy Button URL
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center">
              <Download className="h-5 w-5 mr-2 text-primary" />
              Copy Payment Button Component
            </DialogTitle>
          </DialogHeader>

          <p className="text-muted-foreground mb-4">
            Copy this React component to integrate the payment button into your
            application:
          </p>

          <Button 
            size="sm" 
            onClick={copyToClipboard} 
            className="mb-4"
          >
            {copied ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {copied ? "Copied!" : "Copy Code"}
          </Button>

          <ScrollArea className="h-64 w-full rounded-md border bg-muted p-4">
            <pre className="text-sm font-mono whitespace-pre-wrap text-foreground">
              {buttonComponentCode}
            </pre>
          </ScrollArea>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
            <h4 className="font-medium text-primary mb-3 flex items-center">
              <span className="mr-2">💡</span>
              Integration Notes:
            </h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>
                • The onTransactionStateChange callback will notify you of
                payment status
              </li>
              <li>
                • Transaction polling runs for 10 minutes (60 polls × 10
                seconds)
              </li>
              <li>
                • Make sure to handle the transaction states in your merchant
                application
              </li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}