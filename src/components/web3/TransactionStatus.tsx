'use client';

import { useState, useEffect } from 'react';
import { useWaitForTransactionReceipt } from '@reown/appkit/react';
import { CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';

interface TransactionStatusProps {
  hash?: string;
  status?: 'pending' | 'success' | 'error';
  error?: string;
  onSuccess?: () => void;
  onError?: () => void;
}

/**
 * TransactionStatus Component
 * Displays transaction status with loading, success, and error states
 */
export function TransactionStatus({
  hash,
  status: externalStatus,
  error: externalError,
  onSuccess,
  onError,
}: TransactionStatusProps) {
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>(
    externalStatus || 'pending'
  );
  const [error, setError] = useState<string | undefined>(externalError);

  // Use Reown hook to wait for transaction receipt if hash provided
  const { data: receipt, isLoading, isError, error: txError } = useWaitForTransactionReceipt({
    hash: hash as `0x${string}`,
    enabled: !!hash && !externalStatus,
  });

  useEffect(() => {
    if (externalStatus) {
      setStatus(externalStatus);
      if (externalError) setError(externalError);
    } else if (receipt) {
      setStatus('success');
      if (onSuccess) onSuccess();
    } else if (isError || txError) {
      setStatus('error');
      const errorMessage = txError?.message || 'Transaction failed';
      setError(errorMessage);
      if (onError) onError();
    }
  }, [receipt, isError, txError, externalStatus, externalError, onSuccess, onError]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'success':
        return 'Transaction confirmed';
      case 'error':
        return error || 'Transaction failed';
      default:
        return 'Transaction pending...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
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

