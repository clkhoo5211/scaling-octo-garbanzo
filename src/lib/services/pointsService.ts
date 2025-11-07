/**
 * Points Service
 * Handles points earning, conversion, and Clerk metadata updates
 * Per requirements: Points stored in Clerk metadata, transactions logged to Supabase
 */

import { createPointsTransaction } from "@/lib/api/supabaseApi";
import type { User } from "@clerk/clerk-react";

export interface AwardPointsParams {
  userId: string;
  user: User;
  amount: number;
  reason: string;
  source?: "submission" | "upvote" | "comment" | "login" | "share" | "referral" | "ad_slot_subscription" | "profile_completion";
}

export interface ConvertPointsParams {
  userId: string;
  user: User;
  points: number;
}

export interface ConversionResult {
  success: boolean;
  usdtAmount: number;
  pointsDeducted: number;
  fee: number;
  transactionHash?: string;
  error?: string;
}

/**
 * Award points to user and update Clerk metadata
 * Also logs transaction to Supabase for audit trail
 */
export async function awardPoints({
  userId,
  user,
  amount,
  reason,
  source,
}: AwardPointsParams): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    // Get current points from Clerk metadata
    const currentPoints = (user.publicMetadata?.points as number) || 0;
    const newBalance = currentPoints + amount;

    // Update Clerk metadata
    await user.update({
      publicMetadata: {
        ...user.publicMetadata,
        points: newBalance,
      },
    });

    // Log transaction to Supabase for audit trail
    await createPointsTransaction({
      userId,
      transactionType: "earn",
      pointsAmount: amount,
      source: source || null,
      usdtAmount: null,
      transactionHash: null,
    });

    return {
      success: true,
      newBalance,
    };
  } catch (error) {
    console.error("Failed to award points:", error);
    return {
      success: false,
      newBalance: (user.publicMetadata?.points as number) || 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Convert points to USDT
 * Per requirements:
 * - Conversion ratio: 1,000 points = 1 USDT
 * - Conversion fee: 1%
 * - Minimum: 100,000 points (100 USDT gross → 99 USDT net)
 * - Daily limit: 500,000 points max per user
 * - Cooldown: 7-day waiting period between conversions
 */
export async function convertPointsToUSDT({
  userId,
  user,
  points,
}: ConvertPointsParams): Promise<ConversionResult> {
  try {
    const currentPoints = (user.publicMetadata?.points as number) || 0;

    // Validation: Check minimum
    const MINIMUM_POINTS = 100_000;
    if (points < MINIMUM_POINTS) {
      return {
        success: false,
        usdtAmount: 0,
        pointsDeducted: 0,
        fee: 0,
        error: `Minimum conversion is ${MINIMUM_POINTS.toLocaleString()} points (100 USDT)`,
      };
    }

    // Validation: Check balance
    if (points > currentPoints) {
      return {
        success: false,
        usdtAmount: 0,
        pointsDeducted: 0,
        fee: 0,
        error: "Insufficient points balance",
      };
    }

    // Validation: Check daily limit
    const DAILY_LIMIT = 500_000;
    const lastConversionDate = user.publicMetadata?.last_conversion_date as string | undefined;
    const today = new Date().toISOString().split("T")[0];
    
    if (lastConversionDate === today) {
      const dailyConverted = (user.publicMetadata?.daily_converted_points as number) || 0;
      if (dailyConverted + points > DAILY_LIMIT) {
        return {
          success: false,
          usdtAmount: 0,
          pointsDeducted: 0,
          fee: 0,
          error: `Daily limit exceeded. Maximum ${DAILY_LIMIT.toLocaleString()} points per day`,
        };
      }
    }

    // Validation: Check cooldown (7 days)
    const COOLDOWN_DAYS = 7;
    if (lastConversionDate) {
      const lastConversion = new Date(lastConversionDate);
      const daysSince = Math.floor((Date.now() - lastConversion.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince < COOLDOWN_DAYS) {
        const remainingDays = COOLDOWN_DAYS - daysSince;
        return {
          success: false,
          usdtAmount: 0,
          pointsDeducted: 0,
          fee: 0,
          error: `Cooldown period active. Please wait ${remainingDays} more day(s)`,
        };
      }
    }

    // Calculate conversion
    const CONVERSION_RATE = 1000; // 1,000 points = 1 USDT
    const CONVERSION_FEE = 0.01; // 1%
    
    const grossUSDT = points / CONVERSION_RATE;
    const fee = grossUSDT * CONVERSION_FEE;
    const netUSDT = grossUSDT - fee;

    // Update Clerk metadata
    const newBalance = currentPoints - points;
    const newDailyConverted = lastConversionDate === today 
      ? ((user.publicMetadata?.daily_converted_points as number) || 0) + points
      : points;

    await user.update({
      publicMetadata: {
        ...user.publicMetadata,
        points: newBalance,
        last_conversion_date: today,
        daily_converted_points: newDailyConverted,
        usdt_balance_offchain: ((user.publicMetadata?.usdt_balance_offchain as number) || 0) + netUSDT,
      },
    });

    // Log transaction to Supabase
    await createPointsTransaction({
      userId,
      transactionType: "convert",
      pointsAmount: -points, // Negative for deduction
      usdtAmount: netUSDT,
      source: null,
      transactionHash: null, // Will be set when withdrawal happens
    });

    return {
      success: true,
      usdtAmount: netUSDT,
      pointsDeducted: points,
      fee,
    };
  } catch (error) {
    console.error("Failed to convert points:", error);
    return {
      success: false,
      usdtAmount: 0,
      pointsDeducted: 0,
      fee: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get points earning rules (for display purposes)
 */
export const POINTS_RULES = {
  SUBMISSION_QUALITY: 1000, // Submit quality content (10+ upvotes)
  RECEIVE_UPVOTE: 10, // Receive upvote
  QUALITY_COMMENT: 50, // Quality comment (5+ upvotes)
  DAILY_LOGIN: 20, // Daily login streak
  SHARE_ARTICLE: 5, // Share article (UTM tracked)
  PROFILE_COMPLETION: 500, // Complete profile (one-time)
  REFERRAL: 2000, // Refer new user (when referral transacts)
  AD_SLOT_SUBSCRIPTION: 10, // Subscribe to ad slot (one-time)
} as const;

/**
 * Check if user can convert points (validation helper)
 */
export function canConvertPoints(user: User, points: number): { canConvert: boolean; reason?: string } {
  const currentPoints = (user.publicMetadata?.points as number) || 0;
  
  if (points < 100_000) {
    return { canConvert: false, reason: "Minimum conversion is 100,000 points" };
  }
  
  if (points > currentPoints) {
    return { canConvert: false, reason: "Insufficient points balance" };
  }
  
  const lastConversionDate = user.publicMetadata?.last_conversion_date as string | undefined;
  if (lastConversionDate) {
    const lastConversion = new Date(lastConversionDate);
    const daysSince = Math.floor((Date.now() - lastConversion.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince < 7) {
      return { canConvert: false, reason: `Cooldown period active. Please wait ${7 - daysSince} more day(s)` };
    }
  }
  
  return { canConvert: true };
}

