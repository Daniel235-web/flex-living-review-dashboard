const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FlexLiving DAO — Full System Tests", function () {
  let deployer, landlord, tenant, tenant2, verifier, arbiter, voter;
  let mockUSDC, flexToken, propertyNFT, reputationSBT, rentEscrow, reviewSystem;

  const RENT = ethers.parseUnits("1000", 6); // 1000 USDC
  const DEPOSIT = ethers.parseUnits("2000", 6); // 2000 USDC
  const MINT_AMOUNT = ethers.parseUnits("100000", 6); // 100k USDC for testing

  before(async function () {
    [deployer, landlord, tenant, tenant2, verifier, arbiter, voter] = await ethers.getSigners();
  });

  // ═══════════════════════════════════════════════════════════════
  //                     DEPLOYMENT TESTS
  // ═══════════════════════════════════════════════════════════════

  describe("Deployment", function () {
    it("should deploy all contracts successfully", async function () {
      // MockUSDC
      const MockUSDC = await ethers.getContractFactory("MockUSDC");
      mockUSDC = await MockUSDC.deploy();
      await mockUSDC.waitForDeployment();

      // FlexToken
      const FlexToken = await ethers.getContractFactory("FlexToken");
      flexToken = await FlexToken.deploy(deployer.address);
      await flexToken.waitForDeployment();

      // PropertyNFT
      const PropertyNFT = await ethers.getContractFactory("PropertyNFT");
      propertyNFT = await PropertyNFT.deploy(deployer.address);
      await propertyNFT.waitForDeployment();

      // ReputationSBT
      const ReputationSBT = await ethers.getContractFactory("ReputationSBT");
      reputationSBT = await ReputationSBT.deploy(deployer.address);
      await reputationSBT.waitForDeployment();

      // RentEscrow
      const RentEscrow = await ethers.getContractFactory("RentEscrow");
      rentEscrow = await RentEscrow.deploy(
        await mockUSDC.getAddress(),
        await propertyNFT.getAddress(),
        await flexToken.getAddress(),
        deployer.address,
      );
      await rentEscrow.waitForDeployment();

      // ReviewSystem
      const ReviewSystem = await ethers.getContractFactory("ReviewSystem");
      reviewSystem = await ReviewSystem.deploy(
        await propertyNFT.getAddress(),
        await reputationSBT.getAddress(),
        await flexToken.getAddress(),
        deployer.address,
      );
      await reviewSystem.waitForDeployment();

      expect(await mockUSDC.getAddress()).to.be.properAddress;
      expect(await flexToken.getAddress()).to.be.properAddress;
      expect(await propertyNFT.getAddress()).to.be.properAddress;
      expect(await reputationSBT.getAddress()).to.be.properAddress;
      expect(await rentEscrow.getAddress()).to.be.properAddress;
      expect(await reviewSystem.getAddress()).to.be.properAddress;
    });

    it("should configure roles correctly", async function () {
      // Grant roles
      const REWARDS_ROLE = await flexToken.REWARDS_ROLE();
      await flexToken.grantRole(REWARDS_ROLE, await rentEscrow.getAddress());
      await flexToken.grantRole(REWARDS_ROLE, await reviewSystem.getAddress());

      const PM_ROLE = await propertyNFT.PROPERTY_MANAGER_ROLE();
      await propertyNFT.grantRole(PM_ROLE, await reviewSystem.getAddress());

      const REP_ROLE = await reputationSBT.REPUTATION_MANAGER_ROLE();
      await reputationSBT.grantRole(REP_ROLE, await reviewSystem.getAddress());
      await reputationSBT.grantRole(REP_ROLE, await rentEscrow.getAddress());

      // Grant verifier role
      const VERIFIER_ROLE = await propertyNFT.VERIFIER_ROLE();
      await propertyNFT.grantRole(VERIFIER_ROLE, verifier.address);

      // Grant arbiter role
      const ARBITER_ROLE = await rentEscrow.ARBITER_ROLE();
      await rentEscrow.grantRole(ARBITER_ROLE, arbiter.address);

      expect(await flexToken.hasRole(REWARDS_ROLE, await rentEscrow.getAddress())).to.be.true;
      expect(await flexToken.hasRole(REWARDS_ROLE, await reviewSystem.getAddress())).to.be.true;
    });

    it("should mint initial FLEX supply to deployer", async function () {
      const balance = await flexToken.balanceOf(deployer.address);
      expect(balance).to.equal(ethers.parseEther("10000000")); // 10M
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //                   FLEX TOKEN TESTS
  // ═══════════════════════════════════════════════════════════════

  describe("FlexToken", function () {
    it("should use timestamp-based clock (ERC-6372)", async function () {
      expect(await flexToken.CLOCK_MODE()).to.equal("mode=timestamp");
    });

    it("should allow minting up to max supply", async function () {
      await flexToken.mint(tenant.address, ethers.parseEther("1000"));
      expect(await flexToken.balanceOf(tenant.address)).to.equal(ethers.parseEther("1000"));
    });

    it("should revert when exceeding max supply", async function () {
      const remaining = ethers.parseEther("100000000") - (await flexToken.totalSupply());
      await expect(flexToken.mint(tenant.address, remaining + 1n)).to.be.revertedWithCustomError(
        flexToken,
        "MaxSupplyExceeded",
      );
    });

    it("should support ERC20Votes delegation", async function () {
      await flexToken.connect(tenant).delegate(tenant.address);
      const votes = await flexToken.getVotes(tenant.address);
      expect(votes).to.equal(ethers.parseEther("1000"));
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //                  PROPERTY NFT TESTS
  // ═══════════════════════════════════════════════════════════════

  describe("PropertyNFT", function () {
    it("should allow listing a property", async function () {
      const tx = await propertyNFT
        .connect(landlord)
        .listProperty("Berlin, Germany", 4, RENT, DEPOSIT, "ipfs://QmPropertyMetadata123");

      await expect(tx)
        .to.emit(propertyNFT, "PropertyListed")
        .withArgs(0, landlord.address, "Berlin, Germany", RENT);

      const prop = await propertyNFT.getProperty(0);
      expect(prop.location).to.equal("Berlin, Germany");
      expect(prop.capacity).to.equal(4);
      expect(prop.monthlyRentWei).to.equal(RENT);
      expect(prop.status).to.equal(0); // Pending
    });

    it("should allow verifier to verify property", async function () {
      await propertyNFT.connect(verifier).verifyProperty(0);
      const prop = await propertyNFT.getProperty(0);
      expect(prop.status).to.equal(1); // Verified
    });

    it("should allow landlord to activate verified property", async function () {
      await propertyNFT.connect(landlord).activateProperty(0);
      const prop = await propertyNFT.getProperty(0);
      expect(prop.status).to.equal(2); // Active
    });

    it("should track properties by location", async function () {
      const props = await propertyNFT.getPropertiesByLocation("Berlin, Germany");
      expect(props.length).to.equal(1);
      expect(props[0]).to.equal(0);
    });

    it("should update AI quality score", async function () {
      await propertyNFT.connect(verifier).updateAIScore(0, 85);
      const prop = await propertyNFT.getProperty(0);
      expect(prop.aiQualityScore).to.equal(85);
    });

    it("should reject invalid AI scores", async function () {
      await expect(propertyNFT.connect(verifier).updateAIScore(0, 101)).to.be.revertedWithCustomError(
        propertyNFT,
        "InvalidScore",
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //                  REPUTATION SBT TESTS
  // ═══════════════════════════════════════════════════════════════

  describe("ReputationSBT", function () {
    it("should mint a soulbound token", async function () {
      await reputationSBT.mintSBT(tenant.address, "ipfs://QmReputationMetadata");
      expect(await reputationSBT.hasSBT(tenant.address)).to.be.true;

      const rep = await reputationSBT.getReputation(tenant.address);
      expect(rep.points).to.equal(0);
      expect(rep.tier).to.equal(0); // Bronze
    });

    it("should prevent transfers (soulbound)", async function () {
      const tokenId = await reputationSBT.userSBT(tenant.address);
      await expect(
        reputationSBT.connect(tenant).transferFrom(tenant.address, landlord.address, tokenId),
      ).to.be.revertedWithCustomError(reputationSBT, "SoulboundTransferBlocked");
    });

    it("should prevent duplicate SBTs", async function () {
      await expect(reputationSBT.mintSBT(tenant.address, "ipfs://duplicate")).to.be.revertedWithCustomError(
        reputationSBT,
        "AlreadyHasSBT",
      );
    });

    it("should track reputation points and tier upgrades", async function () {
      // Record enough actions to reach Silver (100 points)
      for (let i = 0; i < 10; i++) {
        await reputationSBT.recordOnTimePayment(tenant.address); // +10 each
      }

      const rep = await reputationSBT.getReputation(tenant.address);
      expect(rep.points).to.equal(100);
      expect(rep.tier).to.equal(1); // Silver
    });

    it("should award identity verification bonus", async function () {
      await reputationSBT.verifyIdentity(tenant.address);
      const rep = await reputationSBT.getReputation(tenant.address);
      expect(rep.points).to.equal(150); // 100 + 50 identity bonus
      expect(rep.identityVerified).to.be.true;
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //                   RENT ESCROW TESTS
  // ═══════════════════════════════════════════════════════════════

  describe("RentEscrow", function () {
    before(async function () {
      // Give tenant USDC
      await mockUSDC.mint(tenant.address, MINT_AMOUNT);
      await mockUSDC.connect(tenant).approve(await rentEscrow.getAddress(), ethers.MaxUint256);
    });

    it("should create a lease with security deposit", async function () {
      const tx = await rentEscrow.connect(tenant).createLease(0, 6); // 6 months
      await expect(tx)
        .to.emit(rentEscrow, "LeaseCreated")
        .withArgs(0, 0, tenant.address, landlord.address, RENT, 6);

      const lease = await rentEscrow.getLease(0);
      expect(lease.tenant).to.equal(tenant.address);
      expect(lease.landlord).to.equal(landlord.address);
      expect(lease.monthlyRent).to.equal(RENT);
      expect(lease.totalPayments).to.equal(6);
      expect(lease.status).to.equal(0); // Active
    });

    it("should allow rent payment with FLEX reward", async function () {
      const flexBefore = await flexToken.balanceOf(tenant.address);

      const tx = await rentEscrow.connect(tenant).payRent(0);
      await expect(tx).to.emit(rentEscrow, "RentPaid");

      // Check FLEX reward was issued
      const flexAfter = await flexToken.balanceOf(tenant.address);
      expect(flexAfter - flexBefore).to.equal(ethers.parseEther("50")); // rentPaymentReward

      // Check payment is escrowed
      const payment = await rentEscrow.getPayment(0);
      expect(payment.status).to.equal(0); // Escrowed
    });

    it("should release payment after grace period", async function () {
      // Fast forward past grace period (3 days)
      await ethers.provider.send("evm_increaseTime", [3 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine");

      const landlordBefore = await mockUSDC.balanceOf(landlord.address);
      await rentEscrow.releasePayment(0);
      const landlordAfter = await mockUSDC.balanceOf(landlord.address);

      expect(landlordAfter - landlordBefore).to.be.gt(0);

      const payment = await rentEscrow.getPayment(0);
      expect(payment.status).to.equal(1); // Released
    });

    it("should handle disputes", async function () {
      // Make another rent payment
      await rentEscrow.connect(tenant).payRent(0);

      // Open dispute
      await rentEscrow.connect(tenant).openDispute(1, "Property maintenance issues");

      const payment = await rentEscrow.getPayment(1);
      expect(payment.status).to.equal(2); // Disputed

      // Resolve dispute: 70% to tenant, 30% to landlord
      await rentEscrow.connect(arbiter).resolveDispute(1, 70);

      const paymentAfter = await rentEscrow.getPayment(1);
      expect(paymentAfter.status).to.equal(1); // Released
    });

    it("should return security deposit", async function () {
      const tenantBefore = await mockUSDC.balanceOf(tenant.address);
      await rentEscrow.connect(landlord).returnSecurityDeposit(0);
      const tenantAfter = await mockUSDC.balanceOf(tenant.address);

      expect(tenantAfter - tenantBefore).to.equal(DEPOSIT);
    });

    it("should track tenant payment history", async function () {
      const [onTime, total, leases] = await rentEscrow.getTenantPaymentHistory(tenant.address);
      expect(leases).to.equal(1);
      expect(total).to.equal(2); // 2 payments made
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //                  REVIEW SYSTEM TESTS
  // ═══════════════════════════════════════════════════════════════

  describe("ReviewSystem", function () {
    before(async function () {
      // Mint SBT for tenant (already done, but ensure it exists)
      if (!(await reputationSBT.hasSBT(tenant.address))) {
        await reputationSBT.mintSBT(tenant.address, "ipfs://QmReputationMetadata");
      }
    });

    it("should submit a review", async function () {
      const tx = await reviewSystem
        .connect(tenant)
        .submitReview(0, 4, "Great co-living space!", "ipfs://QmReviewContent123");

      await expect(tx)
        .to.emit(reviewSystem, "ReviewSubmitted")
        .withArgs(0, 0, tenant.address, 4, "Great co-living space!");

      const review = await reviewSystem.getReview(0);
      expect(review.rating).to.equal(4);
      expect(review.reviewer).to.equal(tenant.address);
    });

    it("should prevent duplicate reviews", async function () {
      await expect(
        reviewSystem.connect(tenant).submitReview(0, 5, "Another review", "ipfs://QmDuplicate"),
      ).to.be.revertedWithCustomError(reviewSystem, "AlreadyReviewed");
    });

    it("should allow AI oracle to verify review", async function () {
      // Simulate AI sentiment analysis
      await reviewSystem.verifyReview(0, 75, 92); // sentiment: +75, confidence: 92%

      const review = await reviewSystem.getReview(0);
      expect(review.verified).to.be.true;
      expect(review.aiSentiment).to.equal(75);
      expect(review.aiConfidence).to.equal(92);
    });

    it("should calculate AI sentiment for property", async function () {
      const [avgSentiment, count] = await reviewSystem.getPropertyAISentiment(0);
      expect(count).to.equal(1);
      expect(avgSentiment).to.equal(75);
    });

    it("should allow helpful/unhelpful voting", async function () {
      await reviewSystem.connect(landlord).voteReview(0, true);
      await reviewSystem.connect(voter).voteReview(0, false);

      const review = await reviewSystem.getReview(0);
      expect(review.helpfulVotes).to.equal(1);
      expect(review.unhelpfulVotes).to.equal(1);
    });

    it("should prevent self-voting", async function () {
      await expect(reviewSystem.connect(tenant).voteReview(0, true)).to.be.revertedWithCustomError(
        reviewSystem,
        "CannotVoteOwnReview",
      );
    });

    it("should support moderation", async function () {
      await reviewSystem.flagReview(0, "Suspicious content");
      let review = await reviewSystem.getReview(0);
      expect(review.flagged).to.be.true;

      await reviewSystem.unflagReview(0);
      review = await reviewSystem.getReview(0);
      expect(review.flagged).to.be.false;
    });
  });

  // ═══════════════════════════════════════════════════════════════
  //                INTEGRATION / E2E TESTS
  // ═══════════════════════════════════════════════════════════════

  describe("Integration: Full User Journey", function () {
    it("should complete the full tenant lifecycle", async function () {
      // 1. Landlord lists a new property
      await propertyNFT
        .connect(landlord)
        .listProperty(
          "Tokyo, Japan",
          6,
          ethers.parseUnits("800", 6),
          ethers.parseUnits("1600", 6),
          "ipfs://QmTokyoProperty",
        );

      // 2. Verifier approves it
      await propertyNFT.connect(verifier).verifyProperty(1);
      await propertyNFT.connect(landlord).activateProperty(1);

      // 3. AI scores it
      await propertyNFT.connect(verifier).updateAIScore(1, 92);

      // 4. Tenant2 gets USDC and creates a lease
      await mockUSDC.mint(tenant2.address, MINT_AMOUNT);
      await mockUSDC.connect(tenant2).approve(await rentEscrow.getAddress(), ethers.MaxUint256);
      await rentEscrow.connect(tenant2).createLease(1, 12);

      // 5. Tenant2 gets a reputation SBT
      await reputationSBT.mintSBT(tenant2.address, "ipfs://QmRepTenant2");

      // 6. Tenant2 pays rent (earns FLEX + reputation)
      await rentEscrow.connect(tenant2).payRent(1);

      const flexBalance = await flexToken.balanceOf(tenant2.address);
      expect(flexBalance).to.equal(ethers.parseEther("50"));

      // 7. Tenant2 writes a review (earns more FLEX + reputation)
      await reviewSystem.connect(tenant2).submitReview(1, 5, "Amazing place!", "ipfs://QmReview2");

      const flexBalanceAfter = await flexToken.balanceOf(tenant2.address);
      expect(flexBalanceAfter).to.equal(ethers.parseEther("60")); // 50 + 10

      // 8. Check reputation grew
      const rep = await reputationSBT.getReputation(tenant2.address);
      expect(rep.points).to.be.gt(0);

      console.log("\n  ✅ Full lifecycle verified: List → Verify → Lease → Pay → Review → Reputation");
    });
  });
});
