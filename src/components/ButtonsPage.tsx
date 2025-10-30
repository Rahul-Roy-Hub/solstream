"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { getUserButtons } from "@/actions/buttonActions";
import { toast } from "sonner";
import { ButtonType } from "@/types/button";
import { ButtonList } from "@/components/ButtonList";
import { CreateButtonDialog } from "@/components/CreateButtonDialog";
import { 
  Cpu, 
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ButtonsPage() {
  const { user, isLoaded } = useUser();
  const [buttons, setButtons] = useState<ButtonType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchButtons = useCallback(async () => {
    setLoading(true);
    try {
      if (!user) {
        setButtons([]);
        return;
      }
      const res = await getUserButtons(user.id);
      if (res.success) {
        if (!res.buttons) {
          setButtons([]);
          return;
        }
        setButtons(res?.buttons);
      } else {
        toast.error(res.error || "Failed to fetch buttons");
      }
    } catch (err) {
      console.error("Error fetching buttons:", err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetchButtons();
  }, [user, isLoaded, fetchButtons]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-xl">Please sign in to continue.</p>
      </div>
    );
  }

  const totalRevenue = buttons.reduce((sum, button) => sum + (button.amountUsd || 0), 0);
  const activeButtons = buttons.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col space-y-6">
            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="hover:scale-105 transition-transform duration-200">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <span>Dashboard</span>
                <span>/</span>
                <span className="text-foreground font-medium">Payment Buttons</span>
              </div>
            </div>

            {/* Title Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <Cpu className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">
                    Payment Buttons
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Create and manage your crypto payment buttons
                  </p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="hidden lg:flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{activeButtons}</div>
                  <div className="text-sm text-muted-foreground">Total Buttons</div>
                </div>
                <div className="h-12 w-px bg-border"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(0)}</div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                </div>
                <div className="h-12 w-px bg-border"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {new Set(buttons.flatMap(b => b.chainId)).size}
                  </div>
                  <div className="text-sm text-muted-foreground">Chains</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Your Payment Buttons</h2>
            <p className="text-muted-foreground">Create and manage your crypto payment buttons</p>
          </div>
          <CreateButtonDialog onCreated={fetchButtons} />
        </div>

        <ButtonList buttons={buttons} loading={loading} />
      </div>
    </div>
  );
}