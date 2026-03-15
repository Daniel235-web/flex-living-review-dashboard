// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ReputationSBT
 * @author FlexLiving DAO — Polkadot Solidity Hackathon 2026
 * @notice Soulbound Token (SBT) that represents a tenant or landlord's on-chain reputation.
 *         These tokens are NON-TRANSFERABLE — they are permanently bound to the account.
 *
 *         Reputation Tiers:
 *         - Bronze:   0-99 reputation points
 *         - Silver:   100-249 reputation points
 *         - Gold:     250-499 reputation points
 *         - Platinum: 500-999 reputation points
 *         - Diamond:  1000+ reputation points
 *
 *         Points earned by:
 *         - On-time rent payments (+10)
 *         - Positive reviews received (+5)
 *         - Governance participation (+2)
 *         - Dispute wins (+15)
 *         - Verified identity (+50 one-time)
 *
 * @dev Non-transferable via override of _update. Uses OpenZeppelin AccessControl + ERC721URIStorage.
 */
contract ReputationSBT is ERC721, ERC721URIStorage, AccessControl {
    bytes32 public constant REPUTATION_MANAGER_ROLE = keccak256("REPUTATION_MANAGER_ROLE");

    uint256 private _nextTokenId;

    enum ReputationTier {
        Bronze,
        Silver,
        Gold,
        Platinum,
        Diamond
    }

    struct ReputationData {
        uint256 points;
        uint16 onTimePayments;
        uint16 positiveReviews;
        uint16 governanceVotes;
        uint16 disputeWins;
        bool identityVerified;
        ReputationTier tier;
        uint256 lastUpdated;
    }

    // address => tokenId (one SBT per address)
    mapping(address => uint256) public userSBT;
    // tokenId => ReputationData
    mapping(uint256 => ReputationData) public reputations;
    // address => has SBT
    mapping(address => bool) public hasSBT;

    event SBTMinted(address indexed user, uint256 indexed tokenId);
    event ReputationUpdated(
        address indexed user,
        uint256 newPoints,
        ReputationTier newTier,
        string reason
    );
    event TierUpgraded(address indexed user, ReputationTier oldTier, ReputationTier newTier);
    event IdentityVerified(address indexed user);

    error AlreadyHasSBT(address user);
    error NoSBT(address user);
    error SoulboundTransferBlocked();

    constructor(address defaultAdmin) ERC721("FlexLiving Reputation", "FLREP") {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(REPUTATION_MANAGER_ROLE, defaultAdmin);
    }

    // ═══════════════════════════════════════════════════════════════
    //                       MINT SBT
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Mint a soulbound reputation token to a new user.
     */
    function mintSBT(
        address user,
        string calldata _tokenURI
    ) external onlyRole(REPUTATION_MANAGER_ROLE) returns (uint256) {
        if (hasSBT[user]) revert AlreadyHasSBT(user);

        uint256 tokenId = _nextTokenId++;
        _safeMint(user, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        userSBT[user] = tokenId;
        hasSBT[user] = true;

        reputations[tokenId] = ReputationData({
            points: 0,
            onTimePayments: 0,
            positiveReviews: 0,
            governanceVotes: 0,
            disputeWins: 0,
            identityVerified: false,
            tier: ReputationTier.Bronze,
            lastUpdated: block.timestamp
        });

        emit SBTMinted(user, tokenId);
        return tokenId;
    }

    // ═══════════════════════════════════════════════════════════════
    //                  REPUTATION UPDATES
    // ═══════════════════════════════════════════════════════════════

    function recordOnTimePayment(
        address user
    ) external onlyRole(REPUTATION_MANAGER_ROLE) {
        _addPoints(user, 10, "on_time_payment");
        uint256 tokenId = userSBT[user];
        reputations[tokenId].onTimePayments++;
    }

    function recordPositiveReview(
        address user
    ) external onlyRole(REPUTATION_MANAGER_ROLE) {
        _addPoints(user, 5, "positive_review");
        uint256 tokenId = userSBT[user];
        reputations[tokenId].positiveReviews++;
    }

    function recordGovernanceVote(
        address user
    ) external onlyRole(REPUTATION_MANAGER_ROLE) {
        _addPoints(user, 2, "governance_vote");
        uint256 tokenId = userSBT[user];
        reputations[tokenId].governanceVotes++;
    }

    function recordDisputeWin(
        address user
    ) external onlyRole(REPUTATION_MANAGER_ROLE) {
        _addPoints(user, 15, "dispute_win");
        uint256 tokenId = userSBT[user];
        reputations[tokenId].disputeWins++;
    }

    function verifyIdentity(
        address user
    ) external onlyRole(REPUTATION_MANAGER_ROLE) {
        if (!hasSBT[user]) revert NoSBT(user);
        uint256 tokenId = userSBT[user];
        ReputationData storage rep = reputations[tokenId];

        if (!rep.identityVerified) {
            rep.identityVerified = true;
            _addPoints(user, 50, "identity_verified");
            emit IdentityVerified(user);
        }
    }

    function _addPoints(address user, uint256 points, string memory reason) internal {
        if (!hasSBT[user]) revert NoSBT(user);

        uint256 tokenId = userSBT[user];
        ReputationData storage rep = reputations[tokenId];

        rep.points += points;
        rep.lastUpdated = block.timestamp;

        ReputationTier newTier = _calculateTier(rep.points);
        if (newTier != rep.tier) {
            ReputationTier oldTier = rep.tier;
            rep.tier = newTier;
            emit TierUpgraded(user, oldTier, newTier);
        }

        emit ReputationUpdated(user, rep.points, rep.tier, reason);
    }

    function _calculateTier(uint256 points) internal pure returns (ReputationTier) {
        if (points >= 1000) return ReputationTier.Diamond;
        if (points >= 500) return ReputationTier.Platinum;
        if (points >= 250) return ReputationTier.Gold;
        if (points >= 100) return ReputationTier.Silver;
        return ReputationTier.Bronze;
    }

    // ═══════════════════════════════════════════════════════════════
    //              SOULBOUND: BLOCK ALL TRANSFERS
    // ═══════════════════════════════════════════════════════════════

    /**
     * @dev Override _update to prevent all transfers except minting (from == address(0)).
     *      This makes the token soulbound/non-transferable.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721) returns (address) {
        address from = _ownerOf(tokenId);

        // Allow minting (from == 0) and burning (to == 0), block transfers
        if (from != address(0) && to != address(0)) {
            revert SoulboundTransferBlocked();
        }

        return super._update(to, tokenId, auth);
    }

    // ═══════════════════════════════════════════════════════════════
    //                      VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    function getReputation(address user) external view returns (ReputationData memory) {
        if (!hasSBT[user]) revert NoSBT(user);
        return reputations[userSBT[user]];
    }

    function getTier(address user) external view returns (ReputationTier) {
        if (!hasSBT[user]) return ReputationTier.Bronze;
        return reputations[userSBT[user]].tier;
    }

    function getPoints(address user) external view returns (uint256) {
        if (!hasSBT[user]) return 0;
        return reputations[userSBT[user]].points;
    }

    // ═══════════════════════════════════════════════════════════════
    //                    REQUIRED OVERRIDES
    // ═══════════════════════════════════════════════════════════════

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
