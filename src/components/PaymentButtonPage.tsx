"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type TransactionStatus = "creating" | "pending" | "success" | "failed" | null;
type TransactionState = "success" | "failed" | "timeout" | "error";

interface PaymentButtonProps {
  buttonId: string;
  amountUsd: number;
  currency?: string;
  merchantName?: string;
  onTransactionStateChange?: (
    state: TransactionState,
    transactionId: string
  ) => void;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  onTransactionStateChange,
  buttonId,
  amountUsd,
  currency = "USDC",
  merchantName = "Merchant",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cryptoId, setCryptoId] = useState("");
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatus>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);

  const formatAmount = (amountUsd: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(amountUsd);
  };

  const handlePayment = async () => {
    if (!cryptoId.trim()) {
      toast.error("Please enter your crypto ID");
      return;
    }

    setIsProcessing(true);
    setTransactionStatus("pending");

    try {
      const response = await fetch(`/api/create-transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buttonId, cryptoId, amountUsd, currency }),
      });

      const { transactionId } = await response.json();
      setTransactionStatus("pending");
      pollTransactionStatus(transactionId);
    } catch {
      setTransactionStatus("failed");
      setTimeout(() => closeDialog(), 2000);
    }
  };

  const pollTransactionStatus = async (transactionId: string) => {
    const maxPolls = 60;
    let pollCount = 0;

    const poll = async () => {
      try {
        const response = await fetch(
          `/api/transaction-status/${transactionId}`
        );
        const { status } = await response.json();

        setPollingCount(pollCount);
        setTransactionStatus("pending");

        if (status === "success") {
          setTransactionStatus("success");
          onTransactionStateChange?.("success", transactionId);
          setTimeout(() => closeDialog(), 3000);
          return;
        }

        if (status === "failed") {
          setTransactionStatus("failed");
          onTransactionStateChange?.("failed", transactionId);
          setTimeout(() => closeDialog(), 2000);
          return;
        }

        pollCount++;
        if (pollCount >= maxPolls) {
          setTransactionStatus("failed");
          onTransactionStateChange?.("timeout", transactionId);
          setTimeout(() => closeDialog(), 2000);
          return;
        }

        setTimeout(poll, 5000);
      } catch {
        setTransactionStatus("failed");
        onTransactionStateChange?.("error", transactionId);
        setTimeout(() => closeDialog(), 2000);
      }
    };

    poll();
  };

  const closeDialog = () => {
    setIsOpen(false);
    setCryptoId("");
    setTransactionStatus(null);
    setIsProcessing(false);
    setPollingCount(0);
  };

  const getStatusMessage = () => {
    const messages = {
      creating: "Creating payment...",
      pending: "Processing payment...",
      processing: "Processing payment...",
      success: "Payment completed",
      failed: "Payment failed",
    };
    return transactionStatus ? messages[transactionStatus] : "";
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="font-medium transition-all duration-300 hover:scale-105 shadow-lg"
      >
        Pay {formatAmount(amountUsd)} {currency}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md bg-background text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Complete Payment
            </DialogTitle>
            <p className="text-muted-foreground">
              Pay {merchantName}
            </p>
          </DialogHeader>

          <Card className="mb-6 bg-muted/50">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Amount
                </span>
                <span className="text-2xl font-bold text-foreground">
                  {formatAmount(amountUsd)} {currency}
                </span>
              </div>
            </CardContent>
          </Card>

          {!transactionStatus ? (
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Crypto ID
                </Label>
                <Input
                  type="text"
                  value={cryptoId}
                  onChange={(e) => setCryptoId(e.target.value)}
                  placeholder="Enter your crypto ID"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Enter your wallet address or crypto identifier
                </p>
              </div>

              <Button
                onClick={handlePayment}
                disabled={isProcessing || !cryptoId.trim()}
                className="w-full transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing Payment...
                  </span>
                ) : (
                  `Pay ${formatAmount(amountUsd)} ${currency}`
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              {transactionStatus === "pending" && (
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-2 text-foreground">
                      {getStatusMessage()}
                    </p>
                    <p className="text-muted-foreground mb-4">
                      Please wait while we confirm your transaction
                    </p>
                    <div className="w-full bg-muted rounded-full h-2 mb-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((pollingCount / 60) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This may take a few minutes...
                    </p>
                  </div>
                </div>
              )}

              {transactionStatus === "success" && (
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-2 text-foreground">
                      {getStatusMessage()}
                    </p>
                    <p className="text-muted-foreground">
                      {formatAmount(amountUsd)} {currency} has been
                      successfully transferred
                    </p>
                  </div>
                </div>
              )}

              {(transactionStatus === "failed" ||
                transactionStatus === "creating") && (
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                    <X className="w-8 h-8 text-red-400" />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-2 text-foreground">
                      {getStatusMessage()}
                    </p>
                    <p className="text-muted-foreground mb-6">
                      Something went wrong. Please try again.
                    </p>
                    <Button
                      onClick={closeDialog}
                      className="transition-all duration-300 hover:scale-105"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentButton;