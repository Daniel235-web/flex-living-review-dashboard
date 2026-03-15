const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  FlexLiving DAO — Deploying to", hre.network.name);
  console.log("  Deployer:", deployer.address);
  console.log("═══════════════════════════════════════════════════════════════\n");

  // ─── 1. Deploy Mock USDC (testnet only) ──────────────────────────
  let stablecoinAddress;
  if (
    hre.network.name === "hardhat" ||
    hre.network.name === "localhost" ||
    hre.network.name === "polkadotTestnet"
  ) {
    console.log("📦 Deploying MockUSDC...");
    const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();
    stablecoinAddress = await mockUSDC.getAddress();
    console.log("   MockUSDC deployed at:", stablecoinAddress);
  } else {
    // Use real USDC address on mainnet
    stablecoinAddress = process.env.USDC_ADDRESS;
    console.log("   Using existing USDC at:", stablecoinAddress);
  }

  // ─── 2. Deploy FlexToken (Governance Token) ─────────────────────
  console.log("\n📦 Deploying FlexToken...");
  const FlexToken = await hre.ethers.getContractFactory("FlexToken");
  const flexToken = await FlexToken.deploy(deployer.address);
  await flexToken.waitForDeployment();
  const flexTokenAddress = await flexToken.getAddress();
  console.log("   FlexToken deployed at:", flexTokenAddress);

  // ─── 3. Deploy PropertyNFT ──────────────────────────────────────
  console.log("\n📦 Deploying PropertyNFT...");
  const PropertyNFT = await hre.ethers.getContractFactory("PropertyNFT");
  const propertyNFT = await PropertyNFT.deploy(deployer.address);
  await propertyNFT.waitForDeployment();
  const propertyNFTAddress = await propertyNFT.getAddress();
  console.log("   PropertyNFT deployed at:", propertyNFTAddress);

  // ─── 4. Deploy ReputationSBT ────────────────────────────────────
  console.log("\n📦 Deploying ReputationSBT...");
  const ReputationSBT = await hre.ethers.getContractFactory("ReputationSBT");
  const reputationSBT = await ReputationSBT.deploy(deployer.address);
  await reputationSBT.waitForDeployment();
  const reputationSBTAddress = await reputationSBT.getAddress();
  console.log("   ReputationSBT deployed at:", reputationSBTAddress);

  // ─── 5. Deploy RentEscrow ───────────────────────────────────────
  console.log("\n📦 Deploying RentEscrow...");
  const RentEscrow = await hre.ethers.getContractFactory("RentEscrow");
  const rentEscrow = await RentEscrow.deploy(
    stablecoinAddress,
    propertyNFTAddress,
    flexTokenAddress,
    deployer.address,
  );
  await rentEscrow.waitForDeployment();
  const rentEscrowAddress = await rentEscrow.getAddress();
  console.log("   RentEscrow deployed at:", rentEscrowAddress);

  // ─── 6. Deploy ReviewSystem ─────────────────────────────────────
  console.log("\n📦 Deploying ReviewSystem...");
  const ReviewSystem = await hre.ethers.getContractFactory("ReviewSystem");
  const reviewSystem = await ReviewSystem.deploy(
    propertyNFTAddress,
    reputationSBTAddress,
    flexTokenAddress,
    deployer.address,
  );
  await reviewSystem.waitForDeployment();
  const reviewSystemAddress = await reviewSystem.getAddress();
  console.log("   ReviewSystem deployed at:", reviewSystemAddress);

  // ─── 7. Deploy TimelockController ───────────────────────────────
  console.log("\n📦 Deploying TimelockController...");
  const minDelay = 86400; // 1 day
  const TimelockController = await hre.ethers.getContractFactory("TimelockController", {
    libraries: {},
  });
  // proposers = [governor (set later)], executors = [address(0) = anyone]
  const timelock = await TimelockController.deploy(
    minDelay,
    [], // proposers set after governor deploy
    [hre.ethers.ZeroAddress], // anyone can execute
    deployer.address,
  );
  await timelock.waitForDeployment();
  const timelockAddress = await timelock.getAddress();
  console.log("   TimelockController deployed at:", timelockAddress);

  // ─── 8. Deploy FlexGovernor ─────────────────────────────────────
  console.log("\n📦 Deploying FlexGovernor...");
  const FlexGovernor = await hre.ethers.getContractFactory("FlexGovernor");
  const governor = await FlexGovernor.deploy(flexTokenAddress, timelockAddress);
  await governor.waitForDeployment();
  const governorAddress = await governor.getAddress();
  console.log("   FlexGovernor deployed at:", governorAddress);

  // ─── 9. Configure Roles ─────────────────────────────────────────
  console.log("\n🔧 Configuring roles...");

  // Grant governor the PROPOSER_ROLE on timelock
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  await timelock.grantRole(PROPOSER_ROLE, governorAddress);
  console.log("   ✅ Governor granted PROPOSER_ROLE on Timelock");

  // Grant RentEscrow the REWARDS_ROLE on FlexToken (so it can mint rewards)
  const REWARDS_ROLE = await flexToken.REWARDS_ROLE();
  await flexToken.grantRole(REWARDS_ROLE, rentEscrowAddress);
  console.log("   ✅ RentEscrow granted REWARDS_ROLE on FlexToken");

  // Grant ReviewSystem the REWARDS_ROLE on FlexToken
  await flexToken.grantRole(REWARDS_ROLE, reviewSystemAddress);
  console.log("   ✅ ReviewSystem granted REWARDS_ROLE on FlexToken");

  // Grant ReviewSystem the PROPERTY_MANAGER_ROLE on PropertyNFT
  const PROPERTY_MANAGER_ROLE = await propertyNFT.PROPERTY_MANAGER_ROLE();
  await propertyNFT.grantRole(PROPERTY_MANAGER_ROLE, reviewSystemAddress);
  console.log("   ✅ ReviewSystem granted PROPERTY_MANAGER_ROLE on PropertyNFT");

  // Grant ReviewSystem the REPUTATION_MANAGER_ROLE on ReputationSBT
  const REPUTATION_MANAGER_ROLE = await reputationSBT.REPUTATION_MANAGER_ROLE();
  await reputationSBT.grantRole(REPUTATION_MANAGER_ROLE, reviewSystemAddress);
  console.log("   ✅ ReviewSystem granted REPUTATION_MANAGER_ROLE on ReputationSBT");

  // Grant RentEscrow the REPUTATION_MANAGER_ROLE on ReputationSBT
  await reputationSBT.grantRole(REPUTATION_MANAGER_ROLE, rentEscrowAddress);
  console.log("   ✅ RentEscrow granted REPUTATION_MANAGER_ROLE on ReputationSBT");

  // ─── 10. Summary ────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("  🎉 FlexLiving DAO Deployment Complete!");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("\n📋 Contract Addresses:");
  console.log("  ├── MockUSDC:         ", stablecoinAddress);
  console.log("  ├── FlexToken:        ", flexTokenAddress);
  console.log("  ├── PropertyNFT:      ", propertyNFTAddress);
  console.log("  ├── ReputationSBT:    ", reputationSBTAddress);
  console.log("  ├── RentEscrow:       ", rentEscrowAddress);
  console.log("  ├── ReviewSystem:     ", reviewSystemAddress);
  console.log("  ├── TimelockController:", timelockAddress);
  console.log("  └── FlexGovernor:     ", governorAddress);
  console.log("\n🌐 Network:", hre.network.name);
  console.log("═══════════════════════════════════════════════════════════════\n");

  // ─── 11. Write frontend .env.local ──────────────────────────────
  const fs = require("fs");
  const envContent = `# Auto-generated by deploy.js — ${new Date().toISOString()}
NEXT_PUBLIC_MOCK_USDC_ADDRESS=${stablecoinAddress}
NEXT_PUBLIC_FLEX_TOKEN_ADDRESS=${flexTokenAddress}
NEXT_PUBLIC_PROPERTY_NFT_ADDRESS=${propertyNFTAddress}
NEXT_PUBLIC_REPUTATION_SBT_ADDRESS=${reputationSBTAddress}
NEXT_PUBLIC_RENT_ESCROW_ADDRESS=${rentEscrowAddress}
NEXT_PUBLIC_REVIEW_SYSTEM_ADDRESS=${reviewSystemAddress}
NEXT_PUBLIC_TIMELOCK_ADDRESS=${timelockAddress}
NEXT_PUBLIC_GOVERNOR_ADDRESS=${governorAddress}
NEXT_PUBLIC_WC_PROJECT_ID=demo
`;
  fs.writeFileSync("frontend/.env.local", envContent);
  console.log("📝 Frontend .env.local written to frontend/.env.local\n");

  // Return addresses for testing/verification
  return {
    stablecoin: stablecoinAddress,
    flexToken: flexTokenAddress,
    propertyNFT: propertyNFTAddress,
    reputationSBT: reputationSBTAddress,
    rentEscrow: rentEscrowAddress,
    reviewSystem: reviewSystemAddress,
    timelock: timelockAddress,
    governor: governorAddress,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
