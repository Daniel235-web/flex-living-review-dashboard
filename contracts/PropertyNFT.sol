// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PropertyNFT
 * @author FlexLiving DAO — Polkadot Solidity Hackathon 2026
 * @notice Tokenizes real-world co-living properties as NFTs on Polkadot Hub.
 *         Each NFT represents a verified property listing with metadata including:
 *         location, capacity, amenities, monthly rent, and AI-generated quality score.
 *
 * @dev Deep OpenZeppelin usage:
 *      - ERC721Enumerable for on-chain property discovery
 *      - ERC721URIStorage for decentralized metadata (IPFS)
 *      - AccessControl with PROPERTY_MANAGER and VERIFIER roles
 *      - Pausable for emergency circuit-breaker
 *      - ReentrancyGuard for safe state transitions
 */
contract PropertyNFT is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    AccessControl,
    ReentrancyGuard,
    Pausable
{
    bytes32 public constant PROPERTY_MANAGER_ROLE =
        keccak256("PROPERTY_MANAGER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    uint256 private _nextTokenId;

    enum PropertyStatus {
        Pending,
        Verified,
        Active,
        Suspended,
        Delisted
    }

    struct PropertyData {
        string location; // City, Country
        uint16 capacity; // Max tenants
        uint256 monthlyRentWei; // Rent in stablecoin wei
        uint256 securityDeposit; // Security deposit in stablecoin wei
        uint8 aiQualityScore; // 0-100, set by AI oracle
        uint16 reviewCount; // Number of verified reviews
        uint32 avgRating; // Average rating * 100 (e.g., 450 = 4.50)
        PropertyStatus status;
        address landlord;
        uint256 listedAt;
        uint256 verifiedAt;
    }

    // tokenId => PropertyData
    mapping(uint256 => PropertyData) public properties;

    // landlord => tokenIds
    mapping(address => uint256[]) public landlordProperties;

    // Location index for search
    mapping(string => uint256[]) public propertiesByLocation;

    event PropertyListed(
        uint256 indexed tokenId,
        address indexed landlord,
        string location,
        uint256 monthlyRentWei
    );
    event PropertyVerified(uint256 indexed tokenId, address indexed verifier);
    event PropertyActivated(uint256 indexed tokenId);
    event PropertySuspended(uint256 indexed tokenId, string reason);
    event PropertyDelisted(uint256 indexed tokenId);
    event AIScoreUpdated(uint256 indexed tokenId, uint8 newScore);
    event ReviewAdded(
        uint256 indexed tokenId,
        uint16 newCount,
        uint32 newAvgRating
    );
    event RentUpdated(uint256 indexed tokenId, uint256 newRent);

    error PropertyNotFound(uint256 tokenId);
    error InvalidStatus(
        uint256 tokenId,
        PropertyStatus current,
        PropertyStatus required
    );
    error NotLandlord(uint256 tokenId, address caller);
    error InvalidRating();
    error InvalidScore();

    constructor(address defaultAdmin) ERC721("FlexLiving Property", "FLPROP") {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(PROPERTY_MANAGER_ROLE, defaultAdmin);
        _grantRole(VERIFIER_ROLE, defaultAdmin);
    }

    // ═══════════════════════════════════════════════════════════════
    //                      LIST A PROPERTY
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice List a new property. Anyone can list, but it starts as Pending.
     * @param _location Human-readable location string
     * @param _capacity Max number of tenants
     * @param _monthlyRentWei Monthly rent in stablecoin wei
     * @param _securityDeposit Security deposit in stablecoin wei
     * @param _tokenURI IPFS URI for full property metadata + images
     */
    function listProperty(
        string calldata _location,
        uint16 _capacity,
        uint256 _monthlyRentWei,
        uint256 _securityDeposit,
        string calldata _tokenURI
    ) external whenNotPaused nonReentrant returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        properties[tokenId] = PropertyData({
            location: _location,
            capacity: _capacity,
            monthlyRentWei: _monthlyRentWei,
            securityDeposit: _securityDeposit,
            aiQualityScore: 0,
            reviewCount: 0,
            avgRating: 0,
            status: PropertyStatus.Pending,
            landlord: msg.sender,
            listedAt: block.timestamp,
            verifiedAt: 0
        });

        landlordProperties[msg.sender].push(tokenId);
        propertiesByLocation[_location].push(tokenId);

        emit PropertyListed(tokenId, msg.sender, _location, _monthlyRentWei);
        return tokenId;
    }

    // ═══════════════════════════════════════════════════════════════
    //                   VERIFICATION WORKFLOW
    // ═══════════════════════════════════════════════════════════════

    function verifyProperty(uint256 tokenId) external onlyRole(VERIFIER_ROLE) {
        PropertyData storage prop = properties[tokenId];
        if (prop.landlord == address(0)) revert PropertyNotFound(tokenId);
        if (prop.status != PropertyStatus.Pending) {
            revert InvalidStatus(tokenId, prop.status, PropertyStatus.Pending);
        }

        prop.status = PropertyStatus.Verified;
        prop.verifiedAt = block.timestamp;
        emit PropertyVerified(tokenId, msg.sender);
    }

    function activateProperty(uint256 tokenId) external {
        PropertyData storage prop = properties[tokenId];
        if (prop.landlord != msg.sender)
            revert NotLandlord(tokenId, msg.sender);
        if (prop.status != PropertyStatus.Verified) {
            revert InvalidStatus(tokenId, prop.status, PropertyStatus.Verified);
        }

        prop.status = PropertyStatus.Active;
        emit PropertyActivated(tokenId);
    }

    function suspendProperty(
        uint256 tokenId,
        string calldata reason
    ) external onlyRole(PROPERTY_MANAGER_ROLE) {
        PropertyData storage prop = properties[tokenId];
        if (prop.landlord == address(0)) revert PropertyNotFound(tokenId);

        prop.status = PropertyStatus.Suspended;
        emit PropertySuspended(tokenId, reason);
    }

    function delistProperty(uint256 tokenId) external {
        PropertyData storage prop = properties[tokenId];
        if (
            prop.landlord != msg.sender &&
            !hasRole(PROPERTY_MANAGER_ROLE, msg.sender)
        ) {
            revert NotLandlord(tokenId, msg.sender);
        }

        prop.status = PropertyStatus.Delisted;
        emit PropertyDelisted(tokenId);
    }

    // ═══════════════════════════════════════════════════════════════
    //                   AI QUALITY SCORE ORACLE
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Update AI-generated quality score for a property.
     *         Called by an off-chain AI oracle that analyzes reviews,
     *         photos, location data, and amenity quality.
     */
    function updateAIScore(
        uint256 tokenId,
        uint8 score
    ) external onlyRole(VERIFIER_ROLE) {
        if (score > 100) revert InvalidScore();
        PropertyData storage prop = properties[tokenId];
        if (prop.landlord == address(0)) revert PropertyNotFound(tokenId);

        prop.aiQualityScore = score;
        emit AIScoreUpdated(tokenId, score);
    }

    // ═══════════════════════════════════════════════════════════════
    //                    REVIEW AGGREGATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Record a new review's impact on the property's aggregate rating.
     * @param tokenId The property being reviewed
     * @param rating Rating 1-500 (representing 0.01 to 5.00)
     */
    function addReviewData(
        uint256 tokenId,
        uint32 rating
    ) external onlyRole(PROPERTY_MANAGER_ROLE) {
        if (rating == 0 || rating > 500) revert InvalidRating();
        PropertyData storage prop = properties[tokenId];
        if (prop.landlord == address(0)) revert PropertyNotFound(tokenId);

        // Weighted average calculation
        uint32 totalRating = prop.avgRating * prop.reviewCount + rating;
        prop.reviewCount++;
        prop.avgRating = totalRating / prop.reviewCount;

        emit ReviewAdded(tokenId, prop.reviewCount, prop.avgRating);
    }

    // ═══════════════════════════════════════════════════════════════
    //                    LANDLORD FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    function updateRent(uint256 tokenId, uint256 newRent) external {
        PropertyData storage prop = properties[tokenId];
        if (prop.landlord != msg.sender)
            revert NotLandlord(tokenId, msg.sender);

        prop.monthlyRentWei = newRent;
        emit RentUpdated(tokenId, newRent);
    }

    // ═══════════════════════════════════════════════════════════════
    //                      VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    function getProperty(
        uint256 tokenId
    ) external view returns (PropertyData memory) {
        return properties[tokenId];
    }

    function getLandlordProperties(
        address landlord
    ) external view returns (uint256[] memory) {
        return landlordProperties[landlord];
    }

    function getPropertiesByLocation(
        string calldata location
    ) external view returns (uint256[] memory) {
        return propertiesByLocation[location];
    }

    function getActivePropertyCount() external view returns (uint256 count) {
        uint256 total = totalSupply();
        for (uint256 i = 0; i < total; i++) {
            if (properties[tokenByIndex(i)].status == PropertyStatus.Active) {
                count++;
            }
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

    // ═══════════════════════════════════════════════════════════════
    //                    REQUIRED OVERRIDES
    // ═══════════════════════════════════════════════════════════════

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
