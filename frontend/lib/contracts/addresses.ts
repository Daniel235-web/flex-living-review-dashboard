// ═══════════════════════════════════════════════════════════
// Contract addresses — Polkadot Hub Testnet (Chain ID: 420420417)
// Deployed by: 0x297c548591E9b3da718fad0a5664fE0C4B42462c
// ═══════════════════════════════════════════════════════════

export const CONTRACT_ADDRESSES = {
  mockUSDC: "0x077Ec3472EcCCED381cf53EE0D97841aF5295244" as `0x${string}`,
  flexToken: "0xE508FeAFeAd876425Bb5C8ed7423860a5E0Dc116" as `0x${string}`,
  propertyNFT: "0x6d2Ee9974932fd77Fdf4B464A8B72593E241c79c" as `0x${string}`,
  reputationSBT: "0x9671d9e353D2a45239bc6c3cf42990bE1f0F5BF7" as `0x${string}`,
  rentEscrow: "0xF6007e3d9ff10CaD2F4CD86455EAEB7cd7D4bB0D" as `0x${string}`,
  reviewSystem: "0xA35F0f668e8eeb0e288edBDCa5571d8D90032A62" as `0x${string}`,
  timelock: "0x7A6d529779A97B23fbb1e0Fe82BAD0B25990d217" as `0x${string}`,
  governor: "0xC2d7F62B44bcF9FDc14f03ca81cC2Ce0E9d20dAB" as `0x${string}`,
} as const;

// Deployer / demo admin address (granted DEFAULT_ADMIN_ROLE, PROPERTY_MANAGER_ROLE, VERIFIER_ROLE)
export const DEPLOYER_ADDRESS = "0x297c548591E9b3da718fad0a5664fE0C4B42462c" as `0x${string}`;
