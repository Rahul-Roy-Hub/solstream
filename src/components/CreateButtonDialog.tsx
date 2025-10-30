"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createButton as createButtonAction } from "@/actions/buttonActions";
import { useUser } from "@clerk/nextjs";
import { chains } from "@/utils/chain";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, CreditCard } from "lucide-react";

type CreateButtonDialogProps = {
  onCreated: () => Promise<void>;
};

export function CreateButtonDialog({ onCreated }: CreateButtonDialogProps) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    description: string;
    amountUsd: string;
    tokenAddress: string;
    chainId: string[];
    merchantAddress: string;
  }>({
    name: "",
    description: "",
    amountUsd: "",
    tokenAddress: "",
    chainId: [],
    merchantAddress: "",
  });

  const [pricePreview, setPricePreview] = useState<Record<string, { nativeAmount: number; tokenSymbol: string }>>({});
  const [loadingPrices, setLoadingPrices] = useState(false);

  const handleChange = (key: string, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      amountUsd: "",
      tokenAddress: "",
      chainId: [],
      merchantAddress: "",
    });
    setPricePreview({});
  };

  // Fetch price preview when USD amount or chains change
  const fetchPricePreview = useCallback(async () => {
    if (!form.amountUsd || form.chainId.length === 0) {
      console.log("No amount or chains, clearing preview");
      setPricePreview({});
      return;
    }

    const usdAmount = parseFloat(form.amountUsd);
    if (isNaN(usdAmount) || usdAmount <= 0) {
      console.log("Invalid amount, clearing preview");
      setPricePreview({});
      return;
    }

    console.log("Fetching price preview for:", {
      usdAmount,
      chains: form.chainId,
    });
    setLoadingPrices(true);
    try {
      const response = await fetch(`/api/prices?amount=${usdAmount}`);
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (data.success && data.data && data.data.conversions) {
        console.log("Setting price preview:", data.data.conversions);
        setPricePreview(data.data.conversions);
      } else {
        console.error("Invalid response structure:", data);
        setPricePreview({});
      }
    } catch (error) {
      console.error("Error fetching price preview:", error);
      setPricePreview({});
    } finally {
      setLoadingPrices(false);
    }
  }, [form.amountUsd, form.chainId]);

  // Use effect to fetch prices when form changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPricePreview();
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [fetchPricePreview]);

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);

    try {
      const res = await createButtonAction({
        name: form.name,
        description: form.description,
        amountUsd: parseFloat(form.amountUsd),
        chainId: form.chainId,
        merchantAddress: form.merchantAddress,
        userId: user.id,
      });

      if (!res.success) {
        toast.error(res.message || "Failed to create button");
        return;
      }
      setOpen(false);
      onCreated();

      resetForm();

      toast.success("Button created successfully!");
    } catch (error) {
      console.error("Error creating button:", error);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleChain = (id: string) => {
    handleChange(
      "chainId",
      form.chainId.includes(id)
        ? form.chainId.filter((c) => c !== id)
        : [...form.chainId, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Button
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[98vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-primary" />
            Create a Payment Button
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div>
            <Label className="font-medium">Button Name</Label>
            <Input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., Premium Subscription"
            />
          </div>
          <div>
            <Label className="font-medium">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe what this payment is for..."
            />
          </div>
          <div>
            <Label className="font-medium">Amount (USD)</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="10.00"
              value={form.amountUsd}
              onChange={(e) => handleChange("amountUsd", e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the USD amount customers will pay
            </p>
          </div>

          {/* Chain Selection with Checkbox */}
          <div>
            <Label className="font-medium">Supported Chains</Label>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {chains.map((chain) => (
                <label
                  key={chain.id}
                  className="flex items-center gap-3 cursor-pointer p-3 bg-muted rounded-lg border hover:border-primary transition-colors duration-300"
                >
                  <Checkbox
                    checked={form.chainId.includes(chain.id)}
                    onCheckedChange={() => toggleChain(chain.id)}
                  />
                  <span className="text-foreground">{chain.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label className="font-medium">Merchant Address</Label>
            <Input
              value={form.merchantAddress}
              onChange={(e) => handleChange("merchantAddress", e.target.value)}
              placeholder="Enter Solana wallet address (e.g., ABC123...xyz789)"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your wallet address where payments will be sent
            </p>
          </div>

          {/* Live Price Preview */}
          {form.amountUsd && form.chainId.length > 0 && (
            <div className="border border-border rounded-lg p-2 bg-muted/50">
              <Label className="text-xs font-medium text-primary">Live Price Preview</Label>
              {loadingPrices ? (
                <div className="mt-1 space-y-1">
                  {form.chainId.map((chainId) => (
                    <div key={chainId} className="animate-pulse">
                      <div className="h-2 bg-muted rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-1 space-y-1 text-xs">
                  {form.chainId.map((chainId) => {
                    const chainName =
                      chains.find((c) => c.id === chainId)?.name || chainId;
                    const priceInfo = pricePreview[chainId];

                    return (
                      <div key={chainId} className="flex justify-between items-center">
                        <span className="text-muted-foreground">{chainName}:</span>
                        {priceInfo ? (
                          <span className="font-mono text-foreground bg-muted px-1 py-0.5 rounded text-xs">
                            {priceInfo.nativeAmount.toFixed(4)}{" "}
                            {priceInfo.tokenSymbol}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            Loading...
                          </span>
                        )}
                      </div>
                    );
                  })}
                  <div className="text-xs text-primary mt-1 flex items-center">
                    <span className="mr-1">💡</span>
                    Real-time prices via Pyth Network
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter className="gap-3">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Button"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}