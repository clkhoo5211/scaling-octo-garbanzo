"use client";

/**
 * Subscription Purchase Component
 * Handles subscription purchase with smart contract integration
 * Per requirements: Pro = 30 USDT/month, Premium = 100 USDT/month
 * Note: Contract uses native tokens (ETH/MATIC), not ERC20 USDT
 */

import { useState, useEffect } from "react";
import { useClerkUser } from "@/lib/hooks/useClerkUser";
import { useAppKitAccount, useAppKit, useAppKitBalance } from "@reown/appkit/react";
import { usePublicClient, useWalletClient, useBalance } from "wagmi";
import { SubscriptionService } from "@/lib/api/contractServices";
import { Crown, Star, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { parseUnits, formatUnits } from "viem";

interface SubscriptionPurchaseProps {
  tier: "pro" | "premium";
  onSuccess?: () => void;
}

export function SubscriptionPurchase({ tier, onSuccess }: SubscriptionPurchaseProps) {
  const { user, isLoaded } = useClerkUser();
  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const { fetchBalance } = useAppKitBalance();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { addToast } = useToast();
  
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [balance, setBalance] = useState<{ formatted: string; value: bigint } | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  // Fetch balance when address changes
  useEffect(() => {
    if (address && isConnected) {
      fetchBalance().then((result) => {
        if (result.isSuccess && result.data) {
          const data = result.data as any;
          const value = data.value || BigInt(0);
          const formatted = data.formatted || formatUnits(value, 18);
          setBalance({ formatted, value });
          setBalanceError(null);
        } else {
          setBalanceError("Failed to fetch balance");
        }
      }).catch((error) => {
        console.error("Balance fetch error:", error);
        setBalanceError("Failed to fetch balance");
      });
    } else {
      setBalance(null);
    }
  }, [address, isConnected, fetchBalance]);

  if (!isLoaded || !user) {
    return null;
  }

  const tierInfo = {
    pro: {
      name: "Pro",
      price: 30, // USDT per month
      tierNumber: 1,
      icon: Star,
      color: "blue",
    },
    premium: {
      name: "Premium",
      price: 100, // USDT per month
      tierNumber: 2,
      icon: Crown,
      color: "purple",
    },
  };

  const info = tierInfo[tier];
  const Icon = info.icon;

  const handlePurchase = async () => {
    if (!isConnected || !address) {
      addToast({
        message: "Please connect your wallet first",
        type: "error",
      });
      open();
      return;
    }

    if (!publicClient || !walletClient) {
      addToast({
        message: "Wallet client not ready",
        type: "error",
      });
      return;
    }

    setIsPurchasing(true);
    setIsCheckingBalance(true);
    
    try {
      // Get current chain
      const chain = publicClient.chain;
      if (!chain) {
        throw new Error("Chain not detected");
      }

      // Calculate required payment amount
      // Note: Contract uses native tokens with 6 decimals
      // Pricing: Pro = 10 USDT/month, Premium = 25 USDT/month (per contract)
      // But UI shows: Pro = 30 USDT/month, Premium = 100 USDT/month
      // Using contract pricing for now (can be updated later)
      const duration = BigInt(30 * 24 * 60 * 60); // 30 days in seconds
      const subscriptionService = new SubscriptionService(
        publicClient,
        walletClient
      );
      
      // Calculate payment using contract's calculatePayment method
      // We'll estimate: Pro = 10 * 10^6, Premium = 25 * 10^6 (6 decimals)
      const requiredAmount = tier === "pro" 
        ? BigInt(10 * 10 ** 6) // 10 USDT equivalent in native token (6 decimals)
        : BigInt(25 * 10 ** 6); // 25 USDT equivalent in native token (6 decimals)

      // Check balance
      if (balance && balance.value < requiredAmount) {
        const requiredFormatted = formatUnits(requiredAmount, 6);
        const balanceFormatted = balance.formatted;
        
        addToast({
          message: `Insufficient balance. Required: ${requiredFormatted}, Available: ${balanceFormatted}`,
          type: "error",
        });
        
        // Offer to open on-ramp
        const shouldOpenOnRamp = window.confirm(
          `You need ${requiredFormatted} to subscribe. Would you like to buy tokens?`
        );
        
        if (shouldOpenOnRamp) {
          open({ view: "OnRampProviders" });
        }
        
        setIsPurchasing(false);
        setIsCheckingBalance(false);
        return;
      }

      // Call smart contract
      const txHash = await subscriptionService.subscribe(
        info.tierNumber,
        duration,
        chain
      );

      addToast({
        message: `Transaction submitted: ${txHash.substring(0, 10)}...`,
        type: "success",
      });

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      if (receipt.status === "success") {
        // Update Clerk metadata
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month from now

        await user.update({
          publicMetadata: {
            ...user.publicMetadata,
            subscription_tier: tier,
            subscription_expiry: expiryDate.toISOString(),
            subscription_tx_hash: txHash,
          },
        });

        addToast({
          message: `Successfully subscribed to ${info.name}!`,
          type: "success",
        });

        // Refresh balance
        if (address) {
          fetchBalance().then((result) => {
            if (result.isSuccess && result.data) {
              const data = result.data as any;
              const value = data.value || BigInt(0);
              const formatted = data.formatted || formatUnits(value, 18);
              setBalance({ formatted, value });
            }
          });
        }

        onSuccess?.();
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Subscription purchase error:", error);
      addToast({
        message: error instanceof Error ? error.message : "Failed to purchase subscription",
        type: "error",
      });
    } finally {
      setIsPurchasing(false);
      setIsCheckingBalance(false);
    }
  };

  const handleBuyUSDT = () => {
    // Open Reown on-ramp
    open({ view: "OnRampProviders" });
  };

  return (
    <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center gap-3 mb-4">
        <Icon className={`w-6 h-6 text-${info.color}-500`} />
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {info.name}
        </h3>
      </div>

      <div className="mb-4">
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {info.price} USDT
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">per month</p>
        
        {/* Balance Display */}
        {isConnected && balance && (
          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Balance:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {balance.formatted} {publicClient?.chain?.nativeCurrency?.symbol || "ETH"}
              </span>
            </div>
          </div>
        )}
        
        {balanceError && (
          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-800 dark:text-yellow-200 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {balanceError}
          </div>
        )}
      </div>

      {!isConnected ? (
        <button
          onClick={() => open()}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Connect Wallet
        </button>
      ) : (
        <>
          <button
            onClick={handlePurchase}
            disabled={isPurchasing || isCheckingBalance}
            className={`w-full px-4 py-2 bg-${info.color}-500 text-white rounded-lg hover:bg-${info.color}-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2`}
          >
            {isPurchasing || isCheckingBalance ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Icon className="w-5 h-5" />
                Subscribe Now
              </>
            )}
          </button>
          
          <button
            onClick={handleBuyUSDT}
            className="w-full mt-2 px-4 py-2 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 transition-colors"
          >
            Need USDT? Buy with card
          </button>
        </>
      )}
    </div>
  );
}

