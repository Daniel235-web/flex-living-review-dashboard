# 🏠 FlexLiving DAO — Decentralized Co-Living Platform

> **A trustless, AI-enhanced co-living ecosystem built on Polkadot Hub with DeFi rent escrow, soulbound reputation, and on-chain governance.**

[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-363636?logo=solidity)](https://soliditylang.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-5.x-4E5EE4?logo=openzeppelin)](https://www.openzeppelin.com/contracts)
[![Polkadot](https://img.shields.io/badge/Polkadot_Hub-Testnet-E6007A?logo=polkadot)](https://polkadot.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🏆 Polkadot Solidity Hackathon 2026

**Tracks:** EVM Smart Contract Track (DeFi) + OpenZeppelin Track

FlexLiving DAO reimagines the $1.2 trillion global rental market by creating a fully on-chain co-living platform where property listings, rent payments, reviews, reputation, and governance are all trustless, transparent, and composable.

---

## 🌟 Key Features

### 💰 DeFi Rent Escrow (`RentEscrow.sol`)
- **Stablecoin payments** — USDC-denominated rent with time-locked escrow
- **Automatic FLEX rewards** — Tenants earn 50 FLEX tokens per on-time payment
- **Dispute resolution** — Arbiter role splits escrowed funds by percentage
- **Late fee enforcement** — 5% late fee after grace period
- **Security deposit management** — Trustless deposit → return lifecycle
- **Platform fee** — 2% protocol revenue sustains the DAO treasury

### 🏘️ Tokenized Properties (`PropertyNFT.sol`)
- **ERC-721 property tokens** — Each listing is an enumerable, URI-rich NFT
- **Multi-step verification** — `Pending → Verified → Active` workflow
- **AI quality scoring** — Oracle-fed quality score (0–100) per property
- **Review aggregation** — On-chain average ratings and review counts
- **Location indexing** — Query properties by geographic location

### 🤖 AI-Enhanced Reviews (`ReviewSystem.sol`)
- **Decentralized reviews** — On-chain ratings (1–5) with IPFS content hashes
- **AI sentiment oracle** — Off-chain AI writes sentiment (−100 to +100) and confidence (0–100%) on-chain
- **Anti-spam** — One review per tenant per property, SBT-gated
- **Community voting** — Helpful/unhelpful votes with self-vote prevention
- **Moderation** — Flagging system for inappropriate content
- **FLEX rewards** — 10 FLEX tokens per verified review

### 🎖️ Soulbound Reputation (`ReputationSBT.sol`)
- **Non-transferable identity** — ERC-721 with transfer blocking (true SBT)
- **5-tier progression** — Bronze → Silver → Gold → Platinum → Diamond
- **Multi-signal scoring** — Points from payments (+10), reviews (+5), governance (+2), dispute wins (+15), identity verification (+50)
- **Identity verification** — Admin-verified real-world identity bonus
- **Composable reputation** — Other protocols can read on-chain reputation

### 🗳️ DAO Governance (`FlexGovernor.sol`)
- **OpenZeppelin Governor** — Full proposal/vote/execute cycle
- **Timelock-controlled** — 1-day execution delay for security
- **Token-weighted voting** — FLEX holders vote proportionally
- **Timestamp-based clock** — ERC-6372 compliant for Polkadot compatibility
- **Configurable parameters** — 1-day voting delay, 1-week voting period, 4% quorum

### 🪙 FLEX Governance Token (`FlexToken.sol`)
- **ERC-20 with governance** — ERC20Votes + ERC20Permit for gasless approvals
- **Capped supply** — 100M max, deflationary via burn
- **Reward hooks** — Rent payment (50), review (10), governance vote (5), referral (100) FLEX
- **Timestamp clock** — ERC-6372 for Polkadot Hub's timestamp-based blocks

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FlexLiving DAO                            │
├──────────┬──────────┬──────────┬──────────┬────────────────┤
│FlexToken │PropertyNFT│RentEscrow│ReviewSys │ReputationSBT  │
│ERC20Votes│ ERC721   │SafeERC20 │AI Oracle │ Soulbound     │
│ERC20Permit│Enumerable│Escrow+   │Sentiment │ 5-Tier        │
│Burnable  │URIStorage│Disputes  │Voting    │ Non-Transfer   │
├──────────┴──────────┴──────────┴──────────┴────────────────┤
│                    FlexGovernor                              │
│            Governor + Timelock Controller                    │
├─────────────────────────────────────────────────────────────┤
│              Polkadot Hub (EVM)                              │
│        Chain ID: 420420417 (Testnet)                         │
└─────────────────────────────────────────────────────────────┘
```

### Cross-Contract Role Architecture

```
FlexToken
  ├── MINTER_ROLE      → Admin (deployer)
  └── REWARDS_ROLE     → RentEscrow, ReviewSystem

PropertyNFT
  ├── PROPERTY_MANAGER_ROLE → ReviewSystem (update scores)
  └── VERIFIER_ROLE         → Verification agents

ReputationSBT
  └── REPUTATION_MANAGER_ROLE → ReviewSystem, RentEscrow

RentEscrow
  └── ARBITER_ROLE → Dispute resolvers

ReviewSystem
  ├── AI_ORACLE_ROLE  → AI verification service
  └── MODERATOR_ROLE  → Content moderators

TimelockController
  └── PROPOSER_ROLE → FlexGovernor
```

---

## 🔧 OpenZeppelin Contracts Usage

FlexLiving DAO makes **deep, non-trivial use** of 15+ OpenZeppelin contracts:

| Contract | OpenZeppelin Modules Used |
|----------|-------------------------|
| `FlexToken` | `ERC20`, `ERC20Burnable`, `ERC20Permit`, `ERC20Votes`, `AccessControl`, `Nonces` |
| `PropertyNFT` | `ERC721`, `ERC721Enumerable`, `ERC721URIStorage`, `AccessControl`, `ReentrancyGuard`, `Pausable` |
| `RentEscrow` | `SafeERC20`, `IERC20`, `AccessControl`, `ReentrancyGuard`, `Pausable` |
| `ReputationSBT` | `ERC721`, `ERC721URIStorage`, `AccessControl` |
| `ReviewSystem` | `AccessControl`, `ReentrancyGuard`, `Pausable` |
| `FlexGovernor` | `Governor`, `GovernorSettings`, `GovernorCountingSimple`, `GovernorVotes`, `GovernorVotesQuorumFraction`, `GovernorTimelockControl` |
| `MockUSDC` | `ERC20` |

**Advanced patterns used:**
- ✅ Custom ERC-6372 clock override (timestamp-based for Polkadot)
- ✅ Soulbound token via `_update()` override blocking transfers
- ✅ Governor with Timelock execution delay
- ✅ Cross-contract role-based access control (5 roles across 6 contracts)
- ✅ SafeERC20 for stablecoin handling
- ✅ ReentrancyGuard on all fund-handling functions
- ✅ Pausable emergency stops on critical contracts
- ✅ Custom errors (gas-efficient) throughout

---

## 📦 Installation

```bash
git clone https://github.com/YOUR_USERNAME/flex-living-review-dashboard.git
cd flex-living-review-dashboard
npm install
```

## 🔨 Build

```bash
npx hardhat compile
```

## 🧪 Test

```bash
npx hardhat test
```

Expected output: **32 passing tests** covering all contracts, roles, and a full E2E lifecycle.

```
  FlexLiving DAO — Full System Tests
    Deployment (3 tests)
    FlexToken (4 tests)
    PropertyNFT (6 tests)
    ReputationSBT (5 tests)
    RentEscrow (6 tests)
    ReviewSystem (7 tests)
    Integration: Full User Journey (1 test)

  32 passing
```

## ⛽ Gas Report

```bash
REPORT_GAS=true npx hardhat test
```

---

## 🚀 Deploy to Polkadot Hub Testnet

### 1. Get testnet tokens
Visit the [Polkadot Faucet](https://faucet.polkadot.io/) to get PAS tokens for gas.

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and add your PRIVATE_KEY
```

### 3. Deploy
```bash
npx hardhat run scripts/deploy.js --network polkadotTestnet
```

### 4. Verify on Blockscout
```bash
npx hardhat verify --network polkadotTestnet DEPLOYED_ADDRESS constructor_args...
```

---

## 🌐 Network Configuration

| Network | Chain ID | RPC | Explorer |
|---------|----------|-----|----------|
| Polkadot Hub Testnet | `420420417` | `https://services.polkadothub-rpc.com/testnet` | [Blockscout](https://blockscout-testnet.polkadot.io/) |
| Polkadot Hub Mainnet | `420420420` | `https://services.polkadothub-rpc.com` | [Blockscout](https://blockscout.polkadot.io/) |

---

## 🗂️ Project Structure

```
flex-living-review-dashboard/
├── contracts/
│   ├── FlexToken.sol          # ERC20 governance token with rewards
│   ├── PropertyNFT.sol        # ERC721 tokenized property listings
│   ├── RentEscrow.sol         # DeFi stablecoin rent escrow + disputes
│   ├── ReputationSBT.sol      # Soulbound reputation tokens (5 tiers)
│   ├── ReviewSystem.sol       # AI-enhanced decentralized reviews
│   ├── FlexGovernor.sol       # DAO governance with timelock
│   └── mocks/
│       └── MockUSDC.sol       # Test stablecoin (6 decimals)
├── scripts/
│   └── deploy.js              # Full deployment + role configuration
├── test/
│   └── FlexLiving.test.js     # 32 comprehensive tests
├── hardhat.config.js          # Polkadot Hub network config
├── package.json
└── README.md
```

---

## 🧠 Why FlexLiving DAO Wins

### 1. **Real-World Problem** 
The global rental market is plagued by fake reviews, lost deposits, and opaque landlord behavior. FlexLiving brings trustless transparency to every step.

### 2. **Deep OpenZeppelin Integration**
Not a simple token deployment — we use 15+ OZ modules with advanced patterns like custom clock overrides, soulbound transfers, cross-contract RBAC, and Governor+Timelock governance.

### 3. **DeFi Mechanics**
Time-locked escrow, stablecoin payments, automated rewards, platform fees, and dispute resolution — all composable and permissionless.

### 4. **AI + Blockchain Synergy**
Off-chain AI sentiment analysis is anchored on-chain with confidence scores. Reviews gain both human wisdom and machine intelligence.

### 5. **Soulbound Reputation**
Non-transferable, multi-signal reputation tokens that can't be bought or gamed — only earned through genuine participation.

### 6. **Polkadot-Native**
Timestamp-based ERC-6372 clock for Polkadot Hub compatibility, deployed on the Polkadot Hub EVM testnet with full Blockscout verification.

### 7. **Comprehensive Testing**
32 tests covering deployment, unit tests for every contract, role verification, edge cases, and a full end-to-end user journey.

---

## 📜 License

MIT License — see [LICENSE](./LICENSE) for details.

---

## 🙋 Team

Built with ❤️ for the Polkadot Solidity Hackathon 2026.

---

*FlexLiving DAO — Where trust is computed, not assumed.*
