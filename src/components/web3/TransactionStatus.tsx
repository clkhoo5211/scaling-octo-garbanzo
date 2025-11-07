"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";

interface TransactionStatusProps {
  hash?: string;
  status?: "pending" | "success" | "error";
  error?: string;
  onSuccess?: () => void;
  onError?: () => void;
}

/**
 * TransactionStatus Component
 * Displays transaction status with loading, success, and error states
 * Note: For static export, we use polling instead of hooks
 */
export function TransactionStatus({
  hash,
  status: externalStatus,
  error: externalError,
  onSuccess,
  onError,
}: TransactionStatusProps) {
  const [status, setStatus] = useState<"pending" | "success" | "error">(
    externalStatus || "pending"
  );
  const [error, setError] = useState<string | undefined>(externalError);

  // Poll for transaction status if hash provided
  useEffect(() => {
    if (!hash || externalStatus) return;

    const checkTransaction = async () => {
      try {
        // Simple polling - in production, use a proper service
        const response = await fetch(
          `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionReceipt&txhash=${hash}&apikey=YourApiKeyToken`
        );
        const data = await response.json();

        if (data.result && data.result.status === "0x1") {
          setStatus("success");
          if (onSuccess) onSuccess();
        } else if (data.result && data.result.status === "0x0") {
          setStatus("error");
          setError("Transaction failed");
          if (onError) onError();
        }
      } catch (err) {
        // If polling fails, assume pending
        console.error("Failed to check transaction:", err);
      }
    };

    const interval = setInterval(checkTransaction, 5000);
    return () => clearInterval(interval);
  }, [hash, externalStatus, onSuccess, onError]);

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "success":
        return "Transaction confirmed";
      case "error":
        return error || "Transaction failed";
      default:
        return "Transaction pending...";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200";
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200";
      default:
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200";
    }
  };

  if (!hash && !externalStatus) return null;

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border ${getStatusColor()}`}
      role="status"
      aria-live="polite"
    >
      {getStatusIcon()}
      <div className="flex-1">
        <p className="font-medium text-sm">{getStatusText()}</p>
        {hash && (
          <a
            href={`https://etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline flex items-center gap-1 mt-1"
          >
            View on Etherscan
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
