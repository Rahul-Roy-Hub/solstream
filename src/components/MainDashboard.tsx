"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getUserTransactions, fetchUserTransactions } from "@/actions/transactionActions";
import { getUserButtons } from "@/actions/buttonActions";
import { ButtonType } from "@/types/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Cpu, 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Eye,
  BarChart3,
  Zap,
  Shield,
  Globe
} from "lucide-react";
import Link from "next/link";

interface Transaction {
  _id: string;
  from: string;
  to: string;
  amountUsd: number;
  status: "pending" | "success" | "failed";
  buttonId?: string;
  signature?: string;
  time: string;
}

interface MainDashboardProps {
  profileId: string;
}

const MainDashboard: React.FC<MainDashboardProps> = ({ profileId }) => {
  const { user } = useUser();
  const [latestTransaction, setLatestTransaction] = useState<Transaction | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [recentButtons, setRecentButtons] = useState<ButtonType[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch latest transaction for alert
        const { transaction } = await getUserTransactions(profileId);
        if (transaction) {
          setLatestTransaction(transaction);
          setOpen(true);
        }

        // Fetch recent transactions
        const transactionsRes = await fetchUserTransactions(user.id);
        if (transactionsRes.success) {
          setRecentTransactions(transactionsRes.transactions?.slice(0, 5) || []);
        }

        // Fetch recent buttons
        const buttonsRes = await getUserButtons(user.id);
        if (buttonsRes.success) {
          setRecentButtons(buttonsRes.buttons?.slice(0, 3) || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profileId, user]);

  const totalRevenue = recentTransactions
    .filter(tx => tx.status === "success")
    .reduce((sum, tx) => sum + tx.amountUsd, 0);

  const pendingTransactions = recentTransactions.filter(tx => tx.status === "pending").length;
  const successRate = recentTransactions.length > 0 
    ? (recentTransactions.filter(tx => tx.status === "success").length / recentTransactions.length * 100).toFixed(1)
    : "0";

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {user?.firstName || "Merchant"}!
              </h1>
              <p className="text-muted-foreground mt-2">Here&apos;s what&apos;s happening with your crypto payments</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <Cpu className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:border-primary transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(2)}</p>
                </div>
                <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-primary transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Success Rate</p>
                  <p className="text-2xl font-bold text-foreground">{successRate}%</p>
                </div>
                <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-primary transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Active Buttons</p>
                  <p className="text-2xl font-bold text-foreground">{recentButtons.length}</p>
                </div>
                <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-primary transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Pending</p>
                  <p className="text-2xl font-bold text-foreground">{pendingTransactions}</p>
                </div>
                <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold">Recent Transactions</CardTitle>
                <Link href="/history">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No transactions yet</p>
                    <p className="text-muted-foreground/70 text-sm">Create payment buttons to start accepting crypto</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentTransactions.map((tx) => (
                      <div key={tx._id} className="flex items-center justify-between p-4 bg-muted rounded-lg border hover:border-primary transition-colors duration-300">
                        <div className="flex items-center space-x-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            tx.status === "success" ? "bg-green-500/20" : 
                            tx.status === "failed" ? "bg-red-500/20" : "bg-yellow-500/20"
                          }`}>
                            {tx.status === "success" ? (
                              <CheckCircle className="h-5 w-5 text-green-400" />
                            ) : tx.status === "failed" ? (
                              <XCircle className="h-5 w-5 text-red-400" />
                            ) : (
                              <Clock className="h-5 w-5 text-yellow-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-foreground font-medium">${tx.amountUsd}</p>
                            <p className="text-muted-foreground text-sm">{tx.from}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={tx.status === "success" ? "default" : tx.status === "failed" ? "destructive" : "secondary"}
                            className="mb-2"
                          >
                            {tx.status}
                          </Badge>
                          <p className="text-muted-foreground text-sm">
                            {new Date(tx.time).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Buttons */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/buttons">
                  <Button className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Payment Button
                  </Button>
                </Link>
                <Link href="/history">
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    View Transaction History
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Buttons */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold">Recent Buttons</CardTitle>
                <Link href="/buttons">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentButtons.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
                      <CreditCard className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm">No buttons created yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentButtons.map((button) => (
                      <div key={button._id} className="p-3 bg-muted rounded-lg border hover:border-primary transition-colors duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-foreground font-medium text-sm">{button.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            ${button.amountUsd}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs truncate">{button.description}</p>
                        <div className="flex items-center mt-2">
                          <Globe className="h-3 w-3 text-muted-foreground mr-1" />
                          <span className="text-muted-foreground text-xs">{button.chainId.length} chains</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Transaction Alert Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-400" />
              New Transaction Alert
            </DialogTitle>
          </DialogHeader>
          <div className="my-4 space-y-3">
            <div className="p-4 bg-muted rounded-lg border">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">From:</span> {latestTransaction?.from}
              </p>
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">To:</span> {latestTransaction?.to}
              </p>
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Amount:</span> ${latestTransaction?.amountUsd}
              </p>
            </div>
            <p className="text-muted-foreground">
              You have a recent transaction pending. Click below to complete the payment.
            </p>
          </div>
          <DialogFooter>
            <Button 
              asChild
            >
              <a
                href={`/pay/${latestTransaction?._id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Pay Now
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MainDashboard;