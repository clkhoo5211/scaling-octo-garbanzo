/**
 * Smart Contract Interaction Services
 * Web3 contract interactions for Web3News platform
 */

import {
  type Address,
  type Chain,
  type PublicClient,
  type WalletClient,
} from "viem";
import { handleError, AppError } from "./errorHandler";

// ============================================================================
// CONTRACT ADDRESSES (Example - Replace with actual deployed addresses)
// ============================================================================

export const CONTRACT_ADDRESSES = {
  ethereum: {
    adPayment: "0x0000000000000000000000000000000000000000" as Address,
    subscription: "0x0000000000000000000000000000000000000000" as Address,
    governance: "0x0000000000000000000000000000000000000000" as Address,
    points: "0x0000000000000000000000000000000000000000" as Address,
  },
  polygon: {
    adPayment: "0x0000000000000000000000000000000000000000" as Address,
    subscription: "0x0000000000000000000000000000000000000000" as Address,
    governance: "0x0000000000000000000000000000000000000000" as Address,
    points: "0x0000000000000000000000000000000000000000" as Address,
  },
  bsc: {
    adPayment: "0x0000000000000000000000000000000000000000" as Address,
    subscription: "0x0000000000000000000000000000000000000000" as Address,
    governance: "0x0000000000000000000000000000000000000000" as Address,
    points: "0x0000000000000000000000000000000000000000" as Address,
  },
} as const;

// ============================================================================
// CONTRACT ABIs (Simplified - Full ABIs should be in separate files)
// ============================================================================

export const AD_PAYMENT_ABI = [
  {
    inputs: [
      { name: "slotId", type: "string" },
      { name: "bidAmount", type: "uint256" },
      { name: "tenure", type: "uint256" },
    ],
    name: "placeBid",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "slotId", type: "string" }],
    name: "getCurrentBid",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "slotId", type: "string" }],
    name: "getAuctionEndTime",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const SUBSCRIPTION_ABI = [
  {
    inputs: [
      { name: "tier", type: "uint8" }, // 0=Free, 1=Pro, 2=Premium
      { name: "duration", type: "uint256" }, // Duration in seconds
    ],
    name: "subscribe",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getSubscription",
    outputs: [
      { name: "tier", type: "uint8" },
      { name: "expiresAt", type: "uint256" },
      { name: "isActive", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const GOVERNANCE_ABI = [
  {
    inputs: [
      { name: "proposalId", type: "string" },
      { name: "voteOption", type: "uint8" }, // 0=Yes, 1=No, 2=Abstain
    ],
    name: "castVote",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "proposalId", type: "string" }],
    name: "getVoteCounts",
    outputs: [
      { name: "yesVotes", type: "uint256" },
      { name: "noVotes", type: "uint256" },
      { name: "abstainVotes", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const POINTS_ABI = [
  {
    inputs: [
      { name: "points", type: "uint256" },
      { name: "recipient", type: "address" },
    ],
    name: "convertPointsToUSDT",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getPointsBalance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// ============================================================================
// CONTRACT SERVICE CLASSES
// ============================================================================

export class AdPaymentService {
  constructor(
    private publicClient: PublicClient,
    private walletClient?: WalletClient
  ) {}

  async getCurrentBid(slotId: string, chain: Chain): Promise<bigint> {
    try {
      const address =
        CONTRACT_ADDRESSES[chain.id as keyof typeof CONTRACT_ADDRESSES]
          ?.adPayment;
      if (!address) {
        throw new AppError(
          `Contract not deployed on ${chain.name}`,
          "CONTRACT_NOT_FOUND"
        );
      }

      const result = await this.publicClient.readContract({
        address,
        abi: AD_PAYMENT_ABI,
        functionName: "getCurrentBid",
        args: [slotId],
      });

      return result as bigint;
    } catch (error) {
      throw handleError(error);
    }
  }

  async getAuctionEndTime(slotId: string, chain: Chain): Promise<bigint> {
    try {
      const address =
        CONTRACT_ADDRESSES[chain.id as keyof typeof CONTRACT_ADDRESSES]
          ?.adPayment;
      if (!address) {
        throw new AppError(
          `Contract not deployed on ${chain.name}`,
          "CONTRACT_NOT_FOUND"
        );
      }

      const result = await this.publicClient.readContract({
        address,
        abi: AD_PAYMENT_ABI,
        functionName: "getAuctionEndTime",
        args: [slotId],
      });

      return result as bigint;
    } catch (error) {
      throw handleError(error);
    }
  }

  async placeBid(
    slotId: string,
    bidAmount: bigint,
    tenure: bigint,
    chain: Chain
  ): Promise<`0x${string}`> {
    if (!this.walletClient) {
      throw new AppError("Wallet not connected", "WALLET_NOT_CONNECTED");
    }

    try {
      const address =
        CONTRACT_ADDRESSES[chain.id as keyof typeof CONTRACT_ADDRESSES]
          ?.adPayment;
      if (!address) {
        throw new AppError(
          `Contract not deployed on ${chain.name}`,
          "CONTRACT_NOT_FOUND"
        );
      }

      const hash = await this.walletClient.writeContract({
        address,
        abi: AD_PAYMENT_ABI,
        functionName: "placeBid",
        args: [slotId, bidAmount, tenure],
        value: bidAmount,
      });

      return hash;
    } catch (error) {
      throw handleError(error);
    }
  }
}

export class SubscriptionService {
  constructor(
    private publicClient: PublicClient,
    private walletClient?: WalletClient
  ) {}

  async getSubscription(userAddress: Address, chain: Chain) {
    try {
      const address =
        CONTRACT_ADDRESSES[chain.id as keyof typeof CONTRACT_ADDRESSES]
          ?.subscription;
      if (!address) {
        throw new AppError(
          `Contract not deployed on ${chain.name}`,
          "CONTRACT_NOT_FOUND"
        );
      }

      const result = await this.publicClient.readContract({
        address,
        abi: SUBSCRIPTION_ABI,
        functionName: "getSubscription",
        args: [userAddress],
      });

      return result as { tier: number; expiresAt: bigint; isActive: boolean };
    } catch (error) {
      throw handleError(error);
    }
  }

  async subscribe(
    tier: number,
    duration: bigint,
    chain: Chain
  ): Promise<`0x${string}`> {
    if (!this.walletClient) {
      throw new AppError("Wallet not connected", "WALLET_NOT_CONNECTED");
    }

    try {
      const address =
        CONTRACT_ADDRESSES[chain.id as keyof typeof CONTRACT_ADDRESSES]
          ?.subscription;
      if (!address) {
        throw new AppError(
          `Contract not deployed on ${chain.name}`,
          "CONTRACT_NOT_FOUND"
        );
      }

      // Calculate payment amount based on tier and duration
      const paymentAmount = this.calculatePayment(tier, duration);

      const hash = await this.walletClient.writeContract({
        address,
        abi: SUBSCRIPTION_ABI,
        functionName: "subscribe",
        args: [tier, duration],
        value: paymentAmount,
      });

      return hash;
    } catch (error) {
      throw handleError(error);
    }
  }

  private calculatePayment(tier: number, duration: bigint): bigint {
    // Example pricing: Pro = 10 USDT/month, Premium = 25 USDT/month
    const monthlyRates = {
      1: BigInt(10 * 10 ** 6), // 10 USDT (6 decimals)
      2: BigInt(25 * 10 ** 6), // 25 USDT (6 decimals)
    };

    const monthlyRate =
      monthlyRates[tier as keyof typeof monthlyRates] || BigInt(0);
    const months = Number(duration) / (30 * 24 * 60 * 60); // Convert seconds to months
    return BigInt(Math.floor(Number(monthlyRate) * months));
  }
}

export class GovernanceService {
  constructor(
    private publicClient: PublicClient,
    private walletClient?: WalletClient
  ) {}

  async getVoteCounts(proposalId: string, chain: Chain) {
    try {
      const address =
        CONTRACT_ADDRESSES[chain.id as keyof typeof CONTRACT_ADDRESSES]
          ?.governance;
      if (!address) {
        throw new AppError(
          `Contract not deployed on ${chain.name}`,
          "CONTRACT_NOT_FOUND"
        );
      }

      const result = await this.publicClient.readContract({
        address,
        abi: GOVERNANCE_ABI,
        functionName: "getVoteCounts",
        args: [proposalId],
      });

      return result as {
        yesVotes: bigint;
        noVotes: bigint;
        abstainVotes: bigint;
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  async castVote(
    proposalId: string,
    voteOption: "yes" | "no" | "abstain",
    chain: Chain
  ): Promise<`0x${string}`> {
    if (!this.walletClient) {
      throw new AppError("Wallet not connected", "WALLET_NOT_CONNECTED");
    }

    try {
      const address =
        CONTRACT_ADDRESSES[chain.id as keyof typeof CONTRACT_ADDRESSES]
          ?.governance;
      if (!address) {
        throw new AppError(
          `Contract not deployed on ${chain.name}`,
          "CONTRACT_NOT_FOUND"
        );
      }

      const voteOptionMap = { yes: 0, no: 1, abstain: 2 };
      const voteValue = voteOptionMap[voteOption];

      const hash = await this.walletClient.writeContract({
        address,
        abi: GOVERNANCE_ABI,
        functionName: "castVote",
        args: [proposalId, voteValue],
      });

      return hash;
    } catch (error) {
      throw handleError(error);
    }
  }
}

export class PointsService {
  constructor(
    private publicClient: PublicClient,
    private walletClient?: WalletClient
  ) {}

  async getPointsBalance(userAddress: Address, chain: Chain): Promise<bigint> {
    try {
      const address =
        CONTRACT_ADDRESSES[chain.id as keyof typeof CONTRACT_ADDRESSES]?.points;
      if (!address) {
        throw new AppError(
          `Contract not deployed on ${chain.name}`,
          "CONTRACT_NOT_FOUND"
        );
      }

      const result = await this.publicClient.readContract({
        address,
        abi: POINTS_ABI,
        functionName: "getPointsBalance",
        args: [userAddress],
      });

      return result as bigint;
    } catch (error) {
      throw handleError(error);
    }
  }

  async convertPointsToUSDT(
    points: bigint,
    recipient: Address,
    chain: Chain
  ): Promise<`0x${string}`> {
    if (!this.walletClient) {
      throw new AppError("Wallet not connected", "WALLET_NOT_CONNECTED");
    }

    try {
      const address =
        CONTRACT_ADDRESSES[chain.id as keyof typeof CONTRACT_ADDRESSES]?.points;
      if (!address) {
        throw new AppError(
          `Contract not deployed on ${chain.name}`,
          "CONTRACT_NOT_FOUND"
        );
      }

      const hash = await this.walletClient.writeContract({
        address,
        abi: POINTS_ABI,
        functionName: "convertPointsToUSDT",
        args: [points, recipient],
      });

      return hash;
    } catch (error) {
      throw handleError(error);
    }
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createContractServices(
  publicClient: PublicClient,
  walletClient?: WalletClient
) {
  return {
    adPayment: new AdPaymentService(publicClient, walletClient),
    subscription: new SubscriptionService(publicClient, walletClient),
    governance: new GovernanceService(publicClient, walletClient),
    points: new PointsService(publicClient, walletClient),
  };
}
