/**
 * ═══════════════════════════════════════════════════════════
 * FlexLiving DAO — Seed Data Script
 * ═══════════════════════════════════════════════════════════
 *
 * Creates sample data on testnet so judges can immediately
 * interact with the full platform:
 *
 *   1. Mints 10,000 USDC to deployer
 *   2. Lists 2 sample properties
 *   3. Verifies + activates them
 *   4. Sets AI quality scores
 *   5. Mints a ReputationSBT for deployer
 *   6. Delegates FLEX to deployer (activates governance)
 *
 * Usage:
 *   npx hardhat run scripts/seed.js --network polkadotTestnet
 * ═══════════════════════════════════════════════════════════
 */

const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("═══════════════════════════════════════════════════════");
  console.log("  FlexLiving DAO — Seeding Testnet Data");
  console.log("  Account:", deployer.address);
  console.log("═══════════════════════════════════════════════════════\n");

  // ─── Contract addresses from deployment ──────────────────
  const ADDRS = {
    mockUSDC: "0x077Ec3472EcCCED381cf53EE0D97841aF5295244",
    flexToken: "0xE508FeAFeAd876425Bb5C8ed7423860a5E0Dc116",
    propertyNFT: "0x6d2Ee9974932fd77Fdf4B464A8B72593E241c79c",
    reputationSBT: "0x9671d9e353D2a45239bc6c3cf42990bE1f0F5BF7",
    rentEscrow: "0xF6007e3d9ff10CaD2F4CD86455EAEB7cd7D4bB0D",
    reviewSystem: "0xA35F0f668e8eeb0e288edBDCa5571d8D90032A62",
  };

  // ─── Attach to deployed contracts ────────────────────────
  const mockUSDC = await hre.ethers.getContractAt("MockUSDC", ADDRS.mockUSDC);
  const flexToken = await hre.ethers.getContractAt("FlexToken", ADDRS.flexToken);
  const propertyNFT = await hre.ethers.getContractAt("PropertyNFT", ADDRS.propertyNFT);
  const reputationSBT = await hre.ethers.getContractAt("ReputationSBT", ADDRS.reputationSBT);
  const rentEscrow = await hre.ethers.getContractAt("RentEscrow", ADDRS.rentEscrow);

  // ─── 1. Mint USDC to deployer ───────────────────────────
  console.log("1️⃣  Minting 100,000 USDC to deployer...");
  let tx = await mockUSDC.mint(deployer.address, hre.ethers.parseUnits("100000", 6));
  await tx.wait();
  const usdcBal = await mockUSDC.balanceOf(deployer.address);
  console.log("   USDC Balance:", hre.ethers.formatUnits(usdcBal, 6));

  // ─── 2. Approve RentEscrow to spend USDC ────────────────
  console.log("\n2️⃣  Approving RentEscrow to spend USDC...");
  tx = await mockUSDC.approve(ADDRS.rentEscrow, hre.ethers.MaxUint256);
  await tx.wait();
  console.log("   ✅ Approved");

  // ─── 3. List 2 sample properties ────────────────────────
  console.log("\n3️⃣  Listing sample properties...");

  tx = await propertyNFT.listProperty(
    "Berlin, Germany",
    4,
    hre.ethers.parseUnits("1000", 6), // $1,000/mo
    hre.ethers.parseUnits("2000", 6), // $2,000 deposit
    "ipfs://QmBerlinFlexCoLiving",
  );
  await tx.wait();
  console.log("   🏠 Property #0: Berlin, Germany ($1,000/mo)");

  tx = await propertyNFT.listProperty(
    "Tokyo, Japan",
    6,
    hre.ethers.parseUnits("800", 6), // $800/mo
    hre.ethers.parseUnits("1600", 6), // $1,600 deposit
    "ipfs://QmTokyoFlexCoLiving",
  );
  await tx.wait();
  console.log("   🏠 Property #1: Tokyo, Japan ($800/mo)");

  // ─── 4. Verify + Activate properties ────────────────────
  console.log("\n4️⃣  Verifying & activating properties...");

  tx = await propertyNFT.verifyProperty(0);
  await tx.wait();
  tx = await propertyNFT.activateProperty(0);
  await tx.wait();
  console.log("   ✅ Property #0: Verified → Active");

  tx = await propertyNFT.verifyProperty(1);
  await tx.wait();
  tx = await propertyNFT.activateProperty(1);
  await tx.wait();
  console.log("   ✅ Property #1: Verified → Active");

  // ─── 5. Set AI quality scores ───────────────────────────
  console.log("\n5️⃣  Setting AI quality scores...");
  tx = await propertyNFT.updateAIScore(0, 85);
  await tx.wait();
  console.log("   🤖 Property #0: AI Score = 85/100");

  tx = await propertyNFT.updateAIScore(1, 92);
  await tx.wait();
  console.log("   🤖 Property #1: AI Score = 92/100");

  // ─── 6. Mint ReputationSBT for deployer ─────────────────
  console.log("\n6️⃣  Minting Reputation SBT for deployer...");
  const hasSBT = await reputationSBT.hasSBT(deployer.address);
  if (!hasSBT) {
    tx = await reputationSBT.mintSBT(deployer.address, "ipfs://QmDeployerReputation");
    await tx.wait();
    console.log("   🎖️ SBT minted (Bronze tier)");
  } else {
    console.log("   🎖️ Already has SBT, skipping");
  }

  // ─── 7. Delegate FLEX tokens to self (activate governance) ──
  console.log("\n7️⃣  Delegating FLEX tokens to self...");
  tx = await flexToken.delegate(deployer.address);
  await tx.wait();
  const votes = await flexToken.getVotes(deployer.address);
  console.log("   🗳️ Voting power:", hre.ethers.formatEther(votes), "FLEX");

  // ─── Summary ─────────────────────────────────────────────
  const flexBal = await flexToken.balanceOf(deployer.address);
  const propCount = await propertyNFT.totalSupply();

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  🎉 Testnet Seeding Complete!");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  💵 USDC Balance:     ${hre.ethers.formatUnits(usdcBal, 6)}`);
  console.log(`  🪙 FLEX Balance:     ${hre.ethers.formatEther(flexBal)}`);
  console.log(`  🏠 Total Properties: ${propCount}`);
  console.log(`  🗳️ Voting Power:     ${hre.ethers.formatEther(votes)}`);
  console.log("═══════════════════════════════════════════════════════\n");
  console.log("  Judges can now:");
  console.log("  • See 2 Active properties on the Properties page");
  console.log("  • Create a lease on the Escrow page");
  console.log("  • Pay rent and earn 50 FLEX");
  console.log("  • Write reviews and earn 10 FLEX");
  console.log("  • View reputation on the Reputation page");
  console.log("  • Delegate & vote on the Governance page");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
