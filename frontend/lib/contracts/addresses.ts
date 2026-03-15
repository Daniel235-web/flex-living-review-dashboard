// ═══════════════════════════════════════════════════════════
// Contract addresses — UPDATE these after deployment
// ═══════════════════════════════════════════════════════════

export const CONTRACT_ADDRESSES = {
  mockUSDC:
    (process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS as `0x${string}`) ||
    ("0x0000000000000000000000000000000000000000" as `0x${string}`),
  flexToken:
    (process.env.NEXT_PUBLIC_FLEX_TOKEN_ADDRESS as `0x${string}`) ||
    ("0x0000000000000000000000000000000000000000" as `0x${string}`),
  propertyNFT:
    (process.env.NEXT_PUBLIC_PROPERTY_NFT_ADDRESS as `0x${string}`) ||
    ("0x0000000000000000000000000000000000000000" as `0x${string}`),
  reputationSBT:
    (process.env.NEXT_PUBLIC_REPUTATION_SBT_ADDRESS as `0x${string}`) ||
    ("0x0000000000000000000000000000000000000000" as `0x${string}`),
  rentEscrow:
    (process.env.NEXT_PUBLIC_RENT_ESCROW_ADDRESS as `0x${string}`) ||
    ("0x0000000000000000000000000000000000000000" as `0x${string}`),
  reviewSystem:
    (process.env.NEXT_PUBLIC_REVIEW_SYSTEM_ADDRESS as `0x${string}`) ||
    ("0x0000000000000000000000000000000000000000" as `0x${string}`),
  timelock:
    (process.env.NEXT_PUBLIC_TIMELOCK_ADDRESS as `0x${string}`) ||
    ("0x0000000000000000000000000000000000000000" as `0x${string}`),
  governor:
    (process.env.NEXT_PUBLIC_GOVERNOR_ADDRESS as `0x${string}`) ||
    ("0x0000000000000000000000000000000000000000" as `0x${string}`),
} as const;
