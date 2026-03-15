// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";

/**
 * @title FlexToken
 * @author FlexLiving DAO — Polkadot Solidity Hackathon 2026
 * @notice ERC-20 governance token for the FlexLiving co-living DAO ecosystem.
 *         Holders can vote on property proposals, maintenance budgets, and platform upgrades.
 *         Tokens are earned by: paying rent on time, leaving reviews, participating in governance,
 *         and referring new tenants.
 *
 * @dev Deep OpenZeppelin usage:
 *      - ERC20Votes for on-chain governance power snapshots
 *      - ERC20Permit for gasless approvals (EIP-2612)
 *      - ERC20Burnable for deflationary mechanics
 *      - AccessControl for granular minting/admin roles
 *      - Timestamp-based clock (ERC-6372) for Polkadot Hub compatibility
 */
contract FlexToken is
    ERC20,
    ERC20Burnable,
    ERC20Permit,
    ERC20Votes,
    AccessControl
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant REWARDS_ROLE = keccak256("REWARDS_ROLE");

    uint256 public constant MAX_SUPPLY = 100_000_000 * 1e18; // 100M tokens

    // Reward rates (in token wei)
    uint256 public rentPaymentReward = 50 * 1e18;    // 50 FLEX per on-time rent payment
    uint256 public reviewReward = 10 * 1e18;          // 10 FLEX per verified review
    uint256 public governanceReward = 5 * 1e18;       // 5 FLEX per governance vote cast
    uint256 public referralReward = 100 * 1e18;       // 100 FLEX per successful referral

    event RewardIssued(address indexed recipient, uint256 amount, string reason);
    event RewardRatesUpdated(
        uint256 rentPaymentReward,
        uint256 reviewReward,
        uint256 governanceReward,
        uint256 referralReward
    );

    error MaxSupplyExceeded(uint256 requested, uint256 available);

    constructor(
        address defaultAdmin
    ) ERC20("FlexLiving Token", "FLEX") ERC20Permit("FlexLiving Token") {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, defaultAdmin);
        _grantRole(REWARDS_ROLE, defaultAdmin);

        // Initial distribution: 10% to treasury for liquidity bootstrapping
        _mint(defaultAdmin, 10_000_000 * 1e18);
    }

    // ═══════════════════════════════════════════════════════════════
    //                    TIMESTAMP-BASED CLOCK (ERC-6372)
    //     Required for Polkadot Hub where block times vary
    // ═══════════════════════════════════════════════════════════════

    function clock() public view override returns (uint48) {
        return uint48(block.timestamp);
    }

    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() public pure override returns (string memory) {
        return "mode=timestamp";
    }

    // ═══════════════════════════════════════════════════════════════
    //                         MINTING
    // ═══════════════════════════════════════════════════════════════

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        if (totalSupply() + amount > MAX_SUPPLY) {
            revert MaxSupplyExceeded(amount, MAX_SUPPLY - totalSupply());
        }
        _mint(to, amount);
    }

    // ═══════════════════════════════════════════════════════════════
    //                     REWARD DISTRIBUTION
    // ═══════════════════════════════════════════════════════════════

    function rewardRentPayment(
        address tenant
    ) external onlyRole(REWARDS_ROLE) {
        _issueReward(tenant, rentPaymentReward, "rent_payment");
    }

    function rewardReview(address reviewer) external onlyRole(REWARDS_ROLE) {
        _issueReward(reviewer, reviewReward, "review");
    }

    function rewardGovernanceVote(
        address voter
    ) external onlyRole(REWARDS_ROLE) {
        _issueReward(voter, governanceReward, "governance_vote");
    }

    function rewardReferral(address referrer) external onlyRole(REWARDS_ROLE) {
        _issueReward(referrer, referralReward, "referral");
    }

    function _issueReward(
        address recipient,
        uint256 amount,
        string memory reason
    ) internal {
        if (totalSupply() + amount > MAX_SUPPLY) {
            revert MaxSupplyExceeded(amount, MAX_SUPPLY - totalSupply());
        }
        _mint(recipient, amount);
        emit RewardIssued(recipient, amount, reason);
    }

    // ═══════════════════════════════════════════════════════════════
    //                  ADMIN: UPDATE REWARD RATES
    // ═══════════════════════════════════════════════════════════════

    function updateRewardRates(
        uint256 _rentPaymentReward,
        uint256 _reviewReward,
        uint256 _governanceReward,
        uint256 _referralReward
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        rentPaymentReward = _rentPaymentReward;
        reviewReward = _reviewReward;
        governanceReward = _governanceReward;
        referralReward = _referralReward;

        emit RewardRatesUpdated(
            _rentPaymentReward,
            _reviewReward,
            _governanceReward,
            _referralReward
        );
    }

    // ═══════════════════════════════════════════════════════════════
    //                 REQUIRED OVERRIDES (Solidity)
    // ═══════════════════════════════════════════════════════════════

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    function nonces(
        address owner
    ) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
