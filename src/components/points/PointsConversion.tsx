"use client";

/**
 * Points Conversion Component
 * Allows users to convert points to USDT
 * Per requirements: 1,000 points = 1 USDT, 1% fee, minimum 100,000 points
 */

import { useState } from "react";
import { useClerkUser } from "@/lib/hooks/useClerkUser";
import { useUser } from "@clerk/clerk-react"; // Import actual Clerk user hook
import { convertPointsToUSDT, canConvertPoints, POINTS_RULES } from "@/lib/services/pointsService";
import { Coins, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export function PointsConversion() {
  const { user: clerkUserWrapper, isLoaded } = useClerkUser();
  const { user: clerkUser } = useUser(); // Get actual Clerk user
  const { addToast } = useToast();
  const [pointsToConvert, setPointsToConvert] = useState<string>("");
  const [isConverting, setIsConverting] = useState(false);

  if (!isLoaded || !clerkUserWrapper || !clerkUser || typeof clerkUser.update !== 'function') {
    return null;
  }

  const currentPoints = (clerkUser.publicMetadata?.points as number) || 0;
  const pointsNum = parseInt(pointsToConvert) || 0;
  const conversionRate = 1000; // 1,000 points = 1 USDT
  const conversionFee = 0.01; // 1%
  
  const grossUSDT = pointsNum / conversionRate;
  const fee = grossUSDT * conversionFee;
  const netUSDT = grossUSDT - fee;

  const validation = canConvertPoints(clerkUser, pointsNum);
  const canConvert = validation.canConvert && pointsNum > 0;

  const handleConvert = async () => {
    if (!canConvert || !clerkUser) return;

    setIsConverting(true);
    try {
      const result = await convertPointsToUSDT({
        userId: clerkUser.id,
        user: clerkUser, // Use actual Clerk user
        points: pointsNum,
      });

      if (result.success) {
        addToast({
          message: `Successfully converted ${pointsNum.toLocaleString()} points to ${result.usdtAmount.toFixed(2)} USDT`,
          type: "success",
        });
        setPointsToConvert("");
        // Refresh user data
        await clerkUser.reload();
      } else {
        addToast({
          message: result.error || "Failed to convert points",
          type: "error",
        });
      }
    } catch (error) {
      addToast({
        message: error instanceof Error ? error.message : "Failed to convert points",
        type: "error",
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Coins className="w-6 h-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Convert Points to USDT
        </h2>
      </div>

      {/* Current Balance */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          Current Points Balance
        </p>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {currentPoints.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          ≈ {(currentPoints / conversionRate).toFixed(2)} USDT
        </p>
      </div>

      {/* Conversion Rules */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Conversion Rules
        </h3>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Rate: 1,000 points = 1 USDT</li>
          <li>• Fee: 1% (deducted from conversion)</li>
          <li>• Minimum: 100,000 points (100 USDT)</li>
          <li>• Daily limit: 500,000 points</li>
          <li>• Cooldown: 7 days between conversions</li>
        </ul>
      </div>

      {/* Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Points to Convert
        </label>
        <input
          type="number"
          value={pointsToConvert}
          onChange={(e) => setPointsToConvert(e.target.value)}
          placeholder="Enter points (minimum 100,000)"
          min={100000}
          max={currentPoints}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Available: {currentPoints.toLocaleString()} points</span>
          <button
            onClick={() => setPointsToConvert(currentPoints.toString())}
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400"
          >
            Use all
          </button>
        </div>
      </div>

      {/* Conversion Preview */}
      {pointsNum > 0 && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Gross USDT:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {grossUSDT.toFixed(2)} USDT
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Fee (1%):</span>
              <span className="text-red-600 dark:text-red-400">-{fee.toFixed(2)} USDT</span>
            </div>
            <div className="border-t border-gray-300 dark:border-gray-600 pt-2 flex justify-between">
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                You'll Receive:
              </span>
              <span className="font-bold text-lg text-green-600 dark:text-green-400">
                {netUSDT.toFixed(2)} USDT
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Validation Message */}
      {pointsToConvert && !validation.canConvert && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            {validation.reason}
          </p>
        </div>
      )}

      {/* Convert Button */}
      <button
        onClick={handleConvert}
        disabled={!canConvert || isConverting}
        className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isConverting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Converting...
          </>
        ) : (
          <>
            <Coins className="w-5 h-5" />
            Convert to USDT
          </>
        )}
      </button>

      {/* Info Note */}
      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        USDT will be added to your off-chain balance. You can withdraw it later.
      </p>
    </div>
  );
}

