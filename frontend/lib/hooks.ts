import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESSES } from "./contracts/addresses";
import { formatUnits, parseUnits, parseEther } from "viem";

import FlexTokenABI from "./contracts/FlexToken.json";
import PropertyNFTABI from "./contracts/PropertyNFT.json";
import RentEscrowABI from "./contracts/RentEscrow.json";
import ReviewSystemABI from "./contracts/ReviewSystem.json";
import ReputationSBTABI from "./contracts/ReputationSBT.json";
import MockUSDCABI from "./contracts/MockUSDC.json";

// ═══════════════════════════════════════════════════════
// FlexToken Hooks
// ═══════════════════════════════════════════════════════

export function useFlexBalance(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.flexToken,
    abi: FlexTokenABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useFlexTotalSupply() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.flexToken,
    abi: FlexTokenABI,
    functionName: "totalSupply",
  });
}

export function useFlexVotes(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.flexToken,
    abi: FlexTokenABI,
    functionName: "getVotes",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useDelegateFlex() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const delegate = (delegatee: `0x${string}`) => {
    writeContract({
      address: CONTRACT_ADDRESSES.flexToken,
      abi: FlexTokenABI,
      functionName: "delegate",
      args: [delegatee],
    });
  };

  return { delegate, isPending, isConfirming, isSuccess, hash };
}

// ═══════════════════════════════════════════════════════
// PropertyNFT Hooks
// ═══════════════════════════════════════════════════════

export function usePropertyCount() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.propertyNFT,
    abi: PropertyNFTABI,
    functionName: "totalSupply",
  });
}

export function useActivePropertyCount() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.propertyNFT,
    abi: PropertyNFTABI,
    functionName: "getActivePropertyCount",
  });
}

export function useProperty(tokenId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.propertyNFT,
    abi: PropertyNFTABI,
    functionName: "getProperty",
    args: [tokenId],
  });
}

export function useLandlordProperties(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.propertyNFT,
    abi: PropertyNFTABI,
    functionName: "getLandlordProperties",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useListProperty() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const listProperty = (
    location: string,
    capacity: number,
    monthlyRentUSDC: string,
    securityDepositUSDC: string,
    tokenURI: string,
  ) => {
    writeContract({
      address: CONTRACT_ADDRESSES.propertyNFT,
      abi: PropertyNFTABI,
      functionName: "listProperty",
      args: [
        location,
        capacity,
        parseUnits(monthlyRentUSDC, 6),
        parseUnits(securityDepositUSDC, 6),
        tokenURI,
      ],
    });
  };

  return { listProperty, isPending, isConfirming, isSuccess, hash };
}

// ═══════════════════════════════════════════════════════
// RentEscrow Hooks
// ═══════════════════════════════════════════════════════

export function useLease(leaseId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.rentEscrow,
    abi: RentEscrowABI,
    functionName: "getLease",
    args: [leaseId],
  });
}

export function useTenantLeases(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.rentEscrow,
    abi: RentEscrowABI,
    functionName: "getTenantLeases",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useTenantPaymentHistory(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.rentEscrow,
    abi: RentEscrowABI,
    functionName: "getTenantPaymentHistory",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useCreateLease() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createLease = (propertyId: bigint, durationMonths: number) => {
    writeContract({
      address: CONTRACT_ADDRESSES.rentEscrow,
      abi: RentEscrowABI,
      functionName: "createLease",
      args: [propertyId, durationMonths],
    });
  };

  return { createLease, isPending, isConfirming, isSuccess, hash };
}

export function usePayRent() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const payRent = (leaseId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.rentEscrow,
      abi: RentEscrowABI,
      functionName: "payRent",
      args: [leaseId],
    });
  };

  return { payRent, isPending, isConfirming, isSuccess, hash };
}

export function useApproveUSDC() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = (spender: `0x${string}`, amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.mockUSDC,
      abi: MockUSDCABI,
      functionName: "approve",
      args: [spender, amount],
    });
  };

  return { approve, isPending, isConfirming, isSuccess, hash };
}

export function useUSDCBalance(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.mockUSDC,
    abi: MockUSDCABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

// ═══════════════════════════════════════════════════════
// ReviewSystem Hooks
// ═══════════════════════════════════════════════════════

export function usePropertyReviews(propertyId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.reviewSystem,
    abi: ReviewSystemABI,
    functionName: "getPropertyReviews",
    args: [propertyId],
  });
}

export function useReview(reviewId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.reviewSystem,
    abi: ReviewSystemABI,
    functionName: "getReview",
    args: [reviewId],
  });
}

export function usePropertyAverageRating(propertyId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.reviewSystem,
    abi: ReviewSystemABI,
    functionName: "getPropertyAverageRating",
    args: [propertyId],
  });
}

export function usePropertyAISentiment(propertyId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.reviewSystem,
    abi: ReviewSystemABI,
    functionName: "getPropertyAISentiment",
    args: [propertyId],
  });
}

export function useSubmitReview() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const submitReview = (propertyId: bigint, rating: number, title: string, contentHash: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.reviewSystem,
      abi: ReviewSystemABI,
      functionName: "submitReview",
      args: [propertyId, rating, title, contentHash],
    });
  };

  return { submitReview, isPending, isConfirming, isSuccess, hash };
}

export function useVoteReview() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const voteReview = (reviewId: bigint, helpful: boolean) => {
    writeContract({
      address: CONTRACT_ADDRESSES.reviewSystem,
      abi: ReviewSystemABI,
      functionName: "voteReview",
      args: [reviewId, helpful],
    });
  };

  return { voteReview, isPending, isConfirming, isSuccess, hash };
}

// ═══════════════════════════════════════════════════════
// ReputationSBT Hooks
// ═══════════════════════════════════════════════════════

export function useHasSBT(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.reputationSBT,
    abi: ReputationSBTABI,
    functionName: "hasSBT",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useReputation(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.reputationSBT,
    abi: ReputationSBTABI,
    functionName: "getReputation",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useReputationTier(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.reputationSBT,
    abi: ReputationSBTABI,
    functionName: "getTier",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useReputationPoints(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.reputationSBT,
    abi: ReputationSBTABI,
    functionName: "getPoints",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

// ═══════════════════════════════════════════════════════
// Test Token Minting (For Hackathon Demo)
// ═══════════════════════════════════════════════════════

export function useMintTestUSDC() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const mintUSDC = (to: `0x${string}`, amount: string = "10000") => {
    writeContract({
      address: CONTRACT_ADDRESSES.mockUSDC,
      abi: MockUSDCABI,
      functionName: "mint",
      args: [to, parseUnits(amount, 6)],
    });
  };

  return { mintUSDC, isPending, isConfirming, isSuccess, hash };
}

export function useMintTestSBT() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const mintSBT = (to: `0x${string}`) => {
    writeContract({
      address: CONTRACT_ADDRESSES.reputationSBT,
      abi: ReputationSBTABI,
      functionName: "mintSBT",
      args: [to, "ipfs://QmTestURI"],
    });
  };

  return { mintSBT, isPending, isConfirming, isSuccess, hash };
}

// ═══════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════

export function formatFLEX(value?: bigint) {
  if (!value) return "0";
  return parseFloat(formatUnits(value, 18)).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

export function formatUSDC(value?: bigint) {
  if (!value) return "0";
  return parseFloat(formatUnits(value, 6)).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

export const TIER_NAMES = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"] as const;
export const TIER_COLORS = ["gray", "blue", "yellow", "purple", "pink"] as const;
export const TIER_EMOJIS = ["🥉", "🥈", "🥇", "💎", "👑"] as const;

export const STATUS_MAP = ["Pending", "Verified", "Active", "Suspended", "Delisted"] as const;
export const STATUS_COLORS: Array<"yellow" | "blue" | "green" | "red" | "gray"> = [
  "yellow",
  "blue",
  "green",
  "red",
  "gray",
] as const;

export { parseUnits, parseEther, formatUnits };
