"use client";

import React from "react";
import { ButtonType } from "@/types/button";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  CreditCard, 
  Globe, 
  Eye, 
  Copy,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type ButtonListProps = {
  buttons: ButtonType[];
  loading: boolean;
};

export function ButtonList({ buttons, loading }: ButtonListProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 space-y-4">
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
              <div className="h-8 w-full bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (buttons.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="h-20 w-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CreditCard className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No Payment Buttons Yet</h3>
          <p className="text-muted-foreground mb-6">Create your first payment button to start accepting crypto payments</p>
          <Button>
            Create Your First Button
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {buttons.map((btn) => (
        <Card key={btn._id} className="hover:border-primary transition-all duration-300 hover:scale-105 group">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                  {btn.name}
                </CardTitle>
                <p className="text-muted-foreground text-sm line-clamp-2">{btn.description}</p>
              </div>
              <Badge variant="secondary">
                ${btn.amountUsd ? btn.amountUsd.toFixed(2) : '0.00'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="text-foreground font-medium">${btn.amountUsd ? btn.amountUsd.toFixed(2) : '0.00'} USD</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Chains:</span>
                <div className="flex items-center space-x-1">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">{btn.chainId.length}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge 
                  variant={btn.isActive ? "default" : "secondary"}
                  className={btn.isActive ? "bg-green-500/20 text-green-600 border-green-500/30 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30" : ""}
                >
                  {btn.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>Merchant Address:</span>
                <button
                  onClick={() => copyToClipboard(btn.merchantAddress)}
                  className="hover:text-primary transition-colors duration-300"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground font-mono break-all">
                {btn.merchantAddress.slice(0, 20)}...{btn.merchantAddress.slice(-8)}
              </p>
            </div>

            <div className="flex space-x-2 pt-2">
              <Link href={`/buttons/${btn._id}`} className="flex-1">
                <Button className="w-full group">
                  <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  View Details
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => copyToClipboard(`${window.location.origin}/buttons/${btn._id}`)}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}