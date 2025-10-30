"use client";
import React, { useEffect, useState, useCallback } from "react";
import { fetchUserTransactions } from "@/actions/transactionActions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Cpu, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Filter,
  RefreshCw,
  Copy
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Link from "next/link";
import { toast } from "sonner";

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

interface HistroyPageProps {
  userId: string;
  initialTransactions: Transaction[];
}

const HistroyPage = ({ userId, initialTransactions }: HistroyPageProps) => {
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [loading, setLoading] = useState(initialTransactions.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "pending" | "success" | "failed"
  >("all");

  const fetchTxns = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const res = await fetchUserTransactions(userId);
      if (res.success) {
        setTransactions(res.transactions || []);
        if (showRefresh) {
          toast.success("Transactions refreshed!");
        }
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      toast.error("Failed to refresh transactions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  // Optionally refresh transactions on mount
  useEffect(() => {
    if (initialTransactions.length === 0) {
      fetchTxns();
    }
  }, [initialTransactions.length, fetchTxns]);

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((txn) => txn.status === filter);

  // Calculate total transactions for display
  const totalTransactions = transactions.length;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-400" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500/20 text-green-600 border-green-500/30 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30";
      case "failed":
        return "bg-red-500/20 text-red-600 border-red-500/30 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30";
      default:
        return "";
    }
  };

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
                <span className="text-foreground font-medium">Transaction History</span>
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
                    Transaction History
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    View all your crypto payment transactions
                  </p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="hidden lg:flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{totalTransactions}</div>
                  <div className="text-sm text-muted-foreground">Total Transactions</div>
                </div>
                <div className="h-12 w-px bg-border"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {transactions.filter(t => t.status === 'success').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Successful</div>
                </div>
                <div className="h-12 w-px bg-border"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {transactions.filter(t => t.status === 'pending').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
                <div className="h-12 w-px bg-border"></div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => fetchTxns(true)}
                    disabled={refreshing}
                    variant="outline"
                    size="sm"
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

       <div className="container mx-auto px-4 py-8">
         {/* Filter and Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="text-foreground font-medium">Filter by status:</span>
            <Select value={filter} onValueChange={(val) => setFilter(val as "all" | "pending" | "success" | "failed")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="success">Successful</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {filteredTransactions.length} of {totalTransactions} transactions
          </div>
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="h-20 w-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Transactions Found</h3>
              <p className="text-muted-foreground mb-6">
                {filter === "all" 
                  ? "You haven't made any transactions yet." 
                  : `No ${filter} transactions found.`}
              </p>
              <Link href="/buttons">
                <Button>
                  Create Payment Button
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTransactions.map((txn) => (
              <Card
                key={txn._id}
                className="hover:border-primary transition-all duration-300 hover:shadow-lg group overflow-hidden"
              >
                <CardContent className="p-0">
                  {/* Header Section */}
                  <div className="p-6 pb-4 border-b border-border/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="h-14 w-14 bg-muted rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            {getStatusIcon(txn.status)}
                          </div>
                          <div className={`absolute -top-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center ${
                            txn.status === 'success' ? 'bg-green-500' : 
                            txn.status === 'failed' ? 'bg-red-500' : 
                            'bg-yellow-500'
                          }`}>
                            <div className="h-2 w-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">${(txn.amountUsd || 0).toFixed(2)}</h3>
                          <p className="text-muted-foreground text-sm">
                            {new Date(txn.time).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(txn.status)}>
                        {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 pt-4">
                    <div className="space-y-4">
                      {/* From Address */}
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-muted-foreground">From Address</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(txn.from)}
                            className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-foreground font-mono text-sm break-all">
                          {txn.from}
                        </p>
                      </div>

                      {/* To Address */}
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-muted-foreground">To Address</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(txn.to)}
                            className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-foreground font-mono text-sm break-all">
                          {txn.to}
                        </p>
                      </div>

                      {/* Transaction Hash (if available) */}
                      {txn.signature && (
                        <div className="bg-muted/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-muted-foreground">Transaction Hash</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(txn.signature!)}
                              className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-foreground font-mono text-sm break-all">
                            {txn.signature}
                          </p>
                        </div>
                      )}

                      {/* Button ID (if available) */}
                      {txn.buttonId && (
                        <div className="bg-muted/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-muted-foreground">Button ID</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(txn.buttonId!)}
                              className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-foreground font-mono text-sm break-all">
                            {typeof txn.buttonId === 'string' && txn.buttonId.length > 24 
                              ? `${txn.buttonId.substring(0, 8)}...${txn.buttonId.substring(txn.buttonId.length - 8)}`
                              : txn.buttonId}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistroyPage;