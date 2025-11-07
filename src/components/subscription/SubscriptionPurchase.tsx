"use client";

/**
 * Subscription Purchase Component
 * Handles subscription purchase with smart contract integration
 * Per requirements: Pro = 30 USDT/month, Premium = 100 USDT/month
 */

import { useState } from "react";
import { useClerkUser } from "@/lib/hooks/useClerkUser";
import { useAppKitAccount, useAppKit } from "@reown/appkit/react";
import { usePublicClient, useWalletClient } from "wagmi";
import { SubscriptionService } from "@/lib/api/contractServices";
import { Crown, Star, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { parseUnits } from "viem";

interface SubscriptionPurchaseProps {
  tier: "pro" | "premium";
  onSuccess?: () => void;
}

export function SubscriptionPurchase({ tier, onSuccess }: SubscriptionPurchaseProps) {
  const { user, isLoaded } = useClerkUser();
  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { addToast } = useToast();
  
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);

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
    try {
      // Check USDT balance first
      setIsCheckingBalance(true);
      // TODO: Check USDT balance on current chain
      // If insufficient, open on-ramp
      
      const subscriptionService = new SubscriptionService(
        publicClient,
        walletClient
      );

      // Get current chain
      const chain = publicClient.chain;
      if (!chain) {
        throw new Error("Chain not detected");
      }

      // Duration: 30 days in seconds
      const duration = BigInt(30 * 24 * 60 * 60);

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

