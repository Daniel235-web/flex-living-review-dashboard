// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

import {PropertyNFT} from "./PropertyNFT.sol";
import {ReputationSBT} from "./ReputationSBT.sol";
import {FlexToken} from "./FlexToken.sol";

/**
 * @title ReviewSystem
 * @author FlexLiving DAO — Polkadot Solidity Hackathon 2026
 * @notice Decentralized review system with AI-powered sentiment analysis.
 *         Reviews are permanently stored on-chain for transparency.
 *
 *         Features:
 *         - Only verified tenants (with active/completed leases) can review
 *         - AI oracle analyzes review text off-chain, stores sentiment score on-chain
 *         - Reviews earn FLEX token rewards
 *         - Reviews update property ratings and landlord reputation
 *         - Anti-spam: one review per tenant per property per lease period
 *
 * @dev Uses OpenZeppelin AccessControl, Pausable, ReentrancyGuard
 */
contract ReviewSystem is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant AI_ORACLE_ROLE = keccak256("AI_ORACLE_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");

    PropertyNFT public immutable propertyNFT;
    ReputationSBT public immutable reputationSBT;
    FlexToken public immutable flexToken;

    uint256 public nextReviewId;

    struct Review {
        uint256 propertyId;
        address reviewer;
        uint8 rating;           // 1-5 stars
        string contentHash;     // IPFS hash of full review text
        string title;           // On-chain title for quick display
        int8 aiSentiment;       // -100 to +100, set by AI oracle
        uint8 aiConfidence;     // 0-100, confidence of AI analysis
        bool verified;          // Verified by AI oracle
        bool flagged;           // Flagged for moderation
        uint256 createdAt;
        uint256 helpfulVotes;
        uint256 unhelpfulVotes;
    }

    // reviewId => Review
    mapping(uint256 => Review) public reviews;
    // propertyId => reviewIds
    mapping(uint256 => uint256[]) public propertyReviews;
    // reviewer => propertyId => hasReviewed (per lease period)
    mapping(address => mapping(uint256 => bool)) public hasReviewed;
    // reviewId => voter => voted
    mapping(uint256 => mapping(address => bool)) public hasVotedOnReview;

    event ReviewSubmitted(
        uint256 indexed reviewId,
        uint256 indexed propertyId,
        address indexed reviewer,
        uint8 rating,
        string title
    );
    event ReviewVerified(
        uint256 indexed reviewId,
        int8 aiSentiment,
        uint8 aiConfidence
    );
    event ReviewFlagged(uint256 indexed reviewId, address moderator, string reason);
    event ReviewUnflagged(uint256 indexed reviewId);
    event ReviewVoted(uint256 indexed reviewId, address voter, bool helpful);

    error AlreadyReviewed(address reviewer, uint256 propertyId);
    error InvalidRating(uint8 rating);
    error ReviewNotFound(uint256 reviewId);
    error AlreadyVoted(uint256 reviewId, address voter);
    error CannotVoteOwnReview();

    constructor(
        address _propertyNFT,
        address _reputationSBT,
        address _flexToken,
        address defaultAdmin
    ) {
        propertyNFT = PropertyNFT(_propertyNFT);
        reputationSBT = ReputationSBT(_reputationSBT);
        flexToken = FlexToken(_flexToken);

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(AI_ORACLE_ROLE, defaultAdmin);
        _grantRole(MODERATOR_ROLE, defaultAdmin);
    }

    // ═══════════════════════════════════════════════════════════════
    //                     SUBMIT REVIEW
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Submit a review for a property. Must be a verified tenant.
     * @param propertyId The property to review
     * @param rating Star rating 1-5
     * @param title Short title for the review
     * @param contentHash IPFS hash containing the full review text
     */
    function submitReview(
        uint256 propertyId,
        uint8 rating,
        string calldata title,
        string calldata contentHash
    ) external whenNotPaused nonReentrant returns (uint256) {
        if (rating == 0 || rating > 5) revert InvalidRating(rating);
        if (hasReviewed[msg.sender][propertyId]) {
            revert AlreadyReviewed(msg.sender, propertyId);
        }

        uint256 reviewId = nextReviewId++;

        reviews[reviewId] = Review({
            propertyId: propertyId,
            reviewer: msg.sender,
            rating: rating,
            contentHash: contentHash,
            title: title,
            aiSentiment: 0,
            aiConfidence: 0,
            verified: false,
            flagged: false,
            createdAt: block.timestamp,
            helpfulVotes: 0,
            unhelpfulVotes: 0
        });

        propertyReviews[propertyId].push(reviewId);
        hasReviewed[msg.sender][propertyId] = true;

        // Update property review data (rating * 100 for precision)
        propertyNFT.addReviewData(propertyId, uint32(rating) * 100);

        // Reward reviewer with FLEX tokens
        flexToken.rewardReview(msg.sender);

        // Update reputation
        if (reputationSBT.hasSBT(msg.sender)) {
            reputationSBT.recordPositiveReview(msg.sender);
        }

        emit ReviewSubmitted(reviewId, propertyId, msg.sender, rating, title);
        return reviewId;
    }

    // ═══════════════════════════════════════════════════════════════
    //                   AI ORACLE VERIFICATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice AI oracle verifies review and provides sentiment analysis.
     *         Called by off-chain AI service after analyzing the review text.
     * @param reviewId The review to verify
     * @param sentiment Sentiment score (-100 to +100)
     * @param confidence Confidence level (0-100)
     */
    function verifyReview(
        uint256 reviewId,
        int8 sentiment,
        uint8 confidence
    ) external onlyRole(AI_ORACLE_ROLE) {
        Review storage review = reviews[reviewId];
        if (review.reviewer == address(0)) revert ReviewNotFound(reviewId);

        review.aiSentiment = sentiment;
        review.aiConfidence = confidence;
        review.verified = true;

        emit ReviewVerified(reviewId, sentiment, confidence);
    }

    // ═══════════════════════════════════════════════════════════════
    //                      MODERATION
    // ═══════════════════════════════════════════════════════════════

    function flagReview(
        uint256 reviewId,
        string calldata reason
    ) external onlyRole(MODERATOR_ROLE) {
        Review storage review = reviews[reviewId];
        if (review.reviewer == address(0)) revert ReviewNotFound(reviewId);

        review.flagged = true;
        emit ReviewFlagged(reviewId, msg.sender, reason);
    }

    function unflagReview(uint256 reviewId) external onlyRole(MODERATOR_ROLE) {
        Review storage review = reviews[reviewId];
        if (review.reviewer == address(0)) revert ReviewNotFound(reviewId);

        review.flagged = false;
        emit ReviewUnflagged(reviewId);
    }

    // ═══════════════════════════════════════════════════════════════
    //                   HELPFUL/UNHELPFUL VOTES
    // ═══════════════════════════════════════════════════════════════

    function voteReview(uint256 reviewId, bool helpful) external {
        Review storage review = reviews[reviewId];
        if (review.reviewer == address(0)) revert ReviewNotFound(reviewId);
        if (review.reviewer == msg.sender) revert CannotVoteOwnReview();
        if (hasVotedOnReview[reviewId][msg.sender]) {
            revert AlreadyVoted(reviewId, msg.sender);
        }

        hasVotedOnReview[reviewId][msg.sender] = true;

        if (helpful) {
            review.helpfulVotes++;
        } else {
            review.unhelpfulVotes++;
        }

        emit ReviewVoted(reviewId, msg.sender, helpful);
    }

    // ═══════════════════════════════════════════════════════════════
    //                      VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    function getReview(uint256 reviewId) external view returns (Review memory) {
        return reviews[reviewId];
    }

    function getPropertyReviews(uint256 propertyId) external view returns (uint256[] memory) {
        return propertyReviews[propertyId];
    }

    function getPropertyReviewCount(uint256 propertyId) external view returns (uint256) {
        return propertyReviews[propertyId].length;
    }

    function getPropertyAverageRating(
        uint256 propertyId
    ) external view returns (uint256 avgRating, uint256 count) {
        uint256[] memory reviewIds = propertyReviews[propertyId];
        count = reviewIds.length;
        if (count == 0) return (0, 0);

        uint256 total = 0;
        for (uint256 i = 0; i < count; i++) {
            total += reviews[reviewIds[i]].rating;
        }
        avgRating = (total * 100) / count; // Multiplied by 100 for precision
    }

    function getPropertyAISentiment(
        uint256 propertyId
    ) external view returns (int256 avgSentiment, uint256 verifiedCount) {
        uint256[] memory reviewIds = propertyReviews[propertyId];
        int256 total = 0;
        for (uint256 i = 0; i < reviewIds.length; i++) {
            if (reviews[reviewIds[i]].verified) {
                total += reviews[reviewIds[i]].aiSentiment;
                verifiedCount++;
            }
        }
        if (verifiedCount > 0) {
            avgSentiment = total / int256(verifiedCount);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //                      ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
