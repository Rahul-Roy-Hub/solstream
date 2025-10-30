export default function getButtonComponentById(buttonId: string): string {
    return buttonComponentCode
      .replace("replace_with_your_button_id", buttonId)
      .replace(/api_url/g, process.env.API_URL || "http://localhost:3000");
  }
  
  const buttonComponentCode = `// PaymentButton.tsx
  "use client";
  
  import React, { useState } from "react";
  
  import { Loader2, Check, X } from "lucide-react";
  
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
        alert("Please enter your crypto ID");
        return;
      }
  
      setIsProcessing(true);
      setTransactionStatus("pending");
  
      try {
        const response = await fetch(\`api_url/api/create-transaction\`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ buttonId, cryptoId, amountUsd, currency }),
        });
  
        const { transactionId } = await response.json();
        setTransactionStatus("pending");
        pollTransactionStatus(transactionId);
      } catch (error) {
        setTransactionStatus("failed");
        setTimeout(() => closeDialog(), 2000);
      }
    };
  
    const pollTransactionStatus = async (transactionId: string) => {
      const maxPolls = 60;
      let pollCount = 0;
  
      const poll = async () => {
        try {
          const response = await fetch(\`api_url/api/transaction-status/\${transactionId}\`);
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
        } catch (error) {
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
      const messages: Record<string, string> = {
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
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-150"
        >
          Pay {formatAmount(amountUsd)} {currency}
        </button>
  
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={closeDialog} />
            <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl border dark:border-gray-800 w-full max-w-sm">
              <div className="flex items-center justify-between p-6 pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Complete payment
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Pay {merchantName}
                  </p>
                </div>
                <button
                  onClick={closeDialog}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
  
              <div className="px-6 pb-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Total
                    </span>
                    <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {formatAmount(amountUsd)} {currency}
                    </span>
                  </div>
                </div>
  
                {!transactionStatus ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Crypto ID
                      </label>
                      <input
                        type="text"
                        value={cryptoId}
                        onChange={(e) => setCryptoId(e.target.value)}
                        placeholder="Enter your crypto ID"
                        className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md 
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                                 placeholder-gray-400 dark:placeholder-gray-500 
                                 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400"
                      />
                    </div>
  
                    <button
                      onClick={handlePayment}
                      disabled={isProcessing || !cryptoId.trim()}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 
                               text-white font-medium py-2.5 px-4 rounded-md 
                               disabled:cursor-not-allowed transition-colors duration-150"
                    >
                      {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing
                        </span>
                      ) : (
                        \`Pay \${formatAmount(amountUsd)} \${currency}\`
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    {transactionStatus === "pending" && (
                      <div className="space-y-4">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                            {getStatusMessage()}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                            Please wait while we confirm your transaction
                          </p>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className="bg-indigo-600 dark:bg-indigo-400 h-1.5 rounded-full transition-all duration-300"
                              style={{
                                width: \`\${Math.min((pollingCount / 60) * 100, 100)}%\`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
  
                    {transactionStatus === "success" && (
                      <div className="space-y-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                          <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {getStatusMessage()}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatAmount(amountUsd)} {currency} has been transferred
                          </p>
                        </div>
                      </div>
                    )}
  
                    {(transactionStatus === "failed" ||
                      transactionStatus === "creating") && (
                      <div className="space-y-4">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                          <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {getStatusMessage()}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Something went wrong. Please try again.
                          </p>
                          <button
                            onClick={closeDialog}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-sm"
                          >
                            Try again
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
             {/* Example usage:
   <PaymentButton 
    buttonId="replace_with_your_button_id" 
    amountUsd={25.5} 
   currency="USDC"
   merchantName="My Shop"
     onTransactionStateChange={(state, txId) => console.log(state, txId)}/>
  */}
          </div>
        )}
      </>
    );
  };
  
  export default PaymentButton;
  
  `;
  