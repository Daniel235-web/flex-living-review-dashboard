// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

import {PropertyNFT} from "./PropertyNFT.sol";
import {FlexToken} from "./FlexToken.sol";

/**
 * @title RentEscrow
 * @author FlexLiving DAO — Polkadot Solidity Hackathon 2026
 * @notice Stablecoin-powered rent escrow with automated release, dispute resolution,
 *         and security deposit management. This is the DeFi core of the platform.
 *
 *         Flow:
 *         1. Tenant pays rent in stablecoins → held in escrow
 *         2. After grace period, funds auto-release to landlord
 *         3. Disputes freeze funds until DAO resolution
 *         4. On-time payments earn FLEX governance token rewards
 *         5. Security deposits held and managed via escrow
 *
 * @dev Deep OpenZeppelin usage:
 *      - SafeERC20 for safe stablecoin transfers
 *      - AccessControl with ARBITER_ROLE for dispute resolution
 *      - ReentrancyGuard on all fund-moving functions
 *      - Pausable for emergency circuit-breaker
 */
contract RentEscrow is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant ARBITER_ROLE = keccak256("ARBITER_ROLE");

    IERC20 public immutable stablecoin;
    PropertyNFT public immutable propertyNFT;
    FlexToken public immutable flexToken;

    uint256 public constant GRACE_PERIOD = 3 days;
    uint256 public constant LATE_FEE_BPS = 500; // 5% late fee
    uint256 public constant PLATFORM_FEE_BPS = 200; // 2% platform fee
    uint256 public constant BPS_DENOMINATOR = 10000;

    enum LeaseStatus {
        Active,
        PendingPayment,
        Disputed,
        Terminated,
        Completed
    }

    enum PaymentStatus {
        Escrowed,
        Released,
        Disputed,
        Refunded
    }

    struct Lease {
        uint256 propertyId;
        address tenant;
        address landlord;
        uint256 monthlyRent;
        uint256 securityDeposit;
        uint256 startDate;
        uint256 endDate;
        uint256 nextPaymentDue;
        uint16 totalPayments;
        uint16 completedPayments;
        uint16 onTimePayments;
        LeaseStatus status;
    }

    struct Payment {
        uint256 leaseId;
        uint256 amount;
        uint256 platformFee;
        uint256 lateFee;
        uint256 paidAt;
        uint256 releaseAt;
        PaymentStatus status;
    }

    // State
    uint256 public nextLeaseId;
    uint256 public nextPaymentId;
    uint256 public totalPlatformFees;

    mapping(uint256 => Lease) public leases;
    mapping(uint256 => Payment) public payments;
    mapping(uint256 => uint256[]) public leasePayments; // leaseId => paymentIds
    mapping(address => uint256[]) public tenantLeases;
    mapping(address => uint256[]) public landlordLeases;
    mapping(uint256 => uint256) public securityDeposits; // leaseId => deposit amount

    // Events
    event LeaseCreated(
        uint256 indexed leaseId,
        uint256 indexed propertyId,
        address indexed tenant,
        address landlord,
        uint256 monthlyRent,
        uint256 duration
    );
    event RentPaid(
        uint256 indexed paymentId,
        uint256 indexed leaseId,
        uint256 amount,
        uint256 platformFee,
        uint256 lateFee,
        bool onTime
    );
    event PaymentReleased(uint256 indexed paymentId, address indexed landlord, uint256 amount);
    event DisputeOpened(uint256 indexed leaseId, uint256 indexed paymentId, address initiator, string reason);
    event DisputeResolved(uint256 indexed paymentId, address indexed recipient, uint256 amount);
    event SecurityDepositPaid(uint256 indexed leaseId, uint256 amount);
    event SecurityDepositReturned(uint256 indexed leaseId, address indexed tenant, uint256 amount);
    event SecurityDepositClaimed(uint256 indexed leaseId, address indexed landlord, uint256 amount, string reason);
    event LeaseTerminated(uint256 indexed leaseId, string reason);
    event PlatformFeesWithdrawn(address indexed to, uint256 amount);

    // Errors
    error LeaseNotFound(uint256 leaseId);
    error PaymentNotFound(uint256 paymentId);
    error NotTenant(uint256 leaseId);
    error NotLandlord(uint256 leaseId);
    error InvalidLeaseStatus(LeaseStatus current, LeaseStatus required);
    error InvalidPaymentStatus(PaymentStatus current);
    error PaymentNotDue();
    error GracePeriodNotOver();
    error PropertyNotActive(uint256 propertyId);
    error InsufficientDeposit();

    constructor(
        address _stablecoin,
        address _propertyNFT,
        address _flexToken,
        address defaultAdmin
    ) {
        stablecoin = IERC20(_stablecoin);
        propertyNFT = PropertyNFT(_propertyNFT);
        flexToken = FlexToken(_flexToken);

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(ARBITER_ROLE, defaultAdmin);
    }

    // ═══════════════════════════════════════════════════════════════
    //                      LEASE CREATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Create a new lease agreement + pay security deposit in one tx.
     * @param propertyId The PropertyNFT token ID
     * @param durationMonths Number of months for the lease
     */
    function createLease(
        uint256 propertyId,
        uint16 durationMonths
    ) external whenNotPaused nonReentrant returns (uint256) {
        PropertyNFT.PropertyData memory prop = propertyNFT.getProperty(propertyId);

        if (prop.status != PropertyNFT.PropertyStatus.Active) {
            revert PropertyNotActive(propertyId);
        }

        // Transfer security deposit
        uint256 deposit = prop.securityDeposit;
        stablecoin.safeTransferFrom(msg.sender, address(this), deposit);

        uint256 leaseId = nextLeaseId++;

        leases[leaseId] = Lease({
            propertyId: propertyId,
            tenant: msg.sender,
            landlord: prop.landlord,
            monthlyRent: prop.monthlyRentWei,
            securityDeposit: deposit,
            startDate: block.timestamp,
            endDate: block.timestamp + (uint256(durationMonths) * 30 days),
            nextPaymentDue: block.timestamp + 30 days,
            totalPayments: durationMonths,
            completedPayments: 0,
            onTimePayments: 0,
            status: LeaseStatus.Active
        });

        securityDeposits[leaseId] = deposit;
        tenantLeases[msg.sender].push(leaseId);
        landlordLeases[prop.landlord].push(leaseId);

        emit LeaseCreated(
            leaseId,
            propertyId,
            msg.sender,
            prop.landlord,
            prop.monthlyRentWei,
            durationMonths
        );
        emit SecurityDepositPaid(leaseId, deposit);

        return leaseId;
    }

    // ═══════════════════════════════════════════════════════════════
    //                       RENT PAYMENT
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Pay rent for the current period. Calculates late fees if applicable.
     *         Funds are held in escrow for GRACE_PERIOD before auto-release.
     */
    function payRent(
        uint256 leaseId
    ) external whenNotPaused nonReentrant returns (uint256) {
        Lease storage lease = leases[leaseId];
        if (lease.tenant == address(0)) revert LeaseNotFound(leaseId);
        if (lease.tenant != msg.sender) revert NotTenant(leaseId);
        if (lease.status != LeaseStatus.Active) {
            revert InvalidLeaseStatus(lease.status, LeaseStatus.Active);
        }

        uint256 rent = lease.monthlyRent;
        uint256 lateFee = 0;
        bool onTime = block.timestamp <= lease.nextPaymentDue;

        if (!onTime) {
            lateFee = (rent * LATE_FEE_BPS) / BPS_DENOMINATOR;
        }

        uint256 platformFee = (rent * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        uint256 totalAmount = rent + lateFee;

        // Transfer stablecoin from tenant to escrow
        stablecoin.safeTransferFrom(msg.sender, address(this), totalAmount);

        uint256 paymentId = nextPaymentId++;

        payments[paymentId] = Payment({
            leaseId: leaseId,
            amount: rent - platformFee,
            platformFee: platformFee,
            lateFee: lateFee,
            paidAt: block.timestamp,
            releaseAt: block.timestamp + GRACE_PERIOD,
            status: PaymentStatus.Escrowed
        });

        leasePayments[leaseId].push(paymentId);
        totalPlatformFees += platformFee;

        // Update lease tracking
        lease.completedPayments++;
        if (onTime) {
            lease.onTimePayments++;
            // Reward tenant with FLEX tokens for on-time payment
            flexToken.rewardRentPayment(msg.sender);
        }
        lease.nextPaymentDue += 30 days;

        // Check if lease is complete
        if (lease.completedPayments >= lease.totalPayments) {
            lease.status = LeaseStatus.Completed;
        }

        emit RentPaid(paymentId, leaseId, rent, platformFee, lateFee, onTime);
        return paymentId;
    }

    // ═══════════════════════════════════════════════════════════════
    //                    PAYMENT RELEASE
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Release escrowed rent to landlord after grace period.
     *         Can be called by anyone (landlord, tenant, keeper bot).
     */
    function releasePayment(
        uint256 paymentId
    ) external whenNotPaused nonReentrant {
        Payment storage payment = payments[paymentId];
        if (payment.amount == 0) revert PaymentNotFound(paymentId);
        if (payment.status != PaymentStatus.Escrowed) {
            revert InvalidPaymentStatus(payment.status);
        }
        if (block.timestamp < payment.releaseAt) {
            revert GracePeriodNotOver();
        }

        Lease storage lease = leases[payment.leaseId];

        payment.status = PaymentStatus.Released;
        stablecoin.safeTransfer(lease.landlord, payment.amount);

        emit PaymentReleased(paymentId, lease.landlord, payment.amount);
    }

    // ═══════════════════════════════════════════════════════════════
    //                    DISPUTE RESOLUTION
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Open a dispute on an escrowed payment. Freezes funds until resolution.
     */
    function openDispute(
        uint256 paymentId,
        string calldata reason
    ) external {
        Payment storage payment = payments[paymentId];
        if (payment.amount == 0) revert PaymentNotFound(paymentId);
        if (payment.status != PaymentStatus.Escrowed) {
            revert InvalidPaymentStatus(payment.status);
        }

        Lease storage lease = leases[payment.leaseId];
        require(
            msg.sender == lease.tenant || msg.sender == lease.landlord,
            "Only lease parties can dispute"
        );

        payment.status = PaymentStatus.Disputed;
        lease.status = LeaseStatus.Disputed;

        emit DisputeOpened(payment.leaseId, paymentId, msg.sender, reason);
    }

    /**
     * @notice Resolve a dispute. Arbiter decides fund allocation.
     * @param paymentId The disputed payment
     * @param tenantShare Percentage (0-100) of funds going to tenant
     */
    function resolveDispute(
        uint256 paymentId,
        uint8 tenantShare
    ) external onlyRole(ARBITER_ROLE) nonReentrant {
        require(tenantShare <= 100, "Invalid share");
        Payment storage payment = payments[paymentId];
        if (payment.status != PaymentStatus.Disputed) {
            revert InvalidPaymentStatus(payment.status);
        }

        Lease storage lease = leases[payment.leaseId];
        uint256 total = payment.amount + payment.lateFee;

        uint256 tenantAmount = (total * tenantShare) / 100;
        uint256 landlordAmount = total - tenantAmount;

        payment.status = PaymentStatus.Released;
        lease.status = LeaseStatus.Active;

        if (tenantAmount > 0) {
            stablecoin.safeTransfer(lease.tenant, tenantAmount);
        }
        if (landlordAmount > 0) {
            stablecoin.safeTransfer(lease.landlord, landlordAmount);
        }

        emit DisputeResolved(paymentId, tenantShare > 50 ? lease.tenant : lease.landlord, total);
    }

    // ═══════════════════════════════════════════════════════════════
    //                  SECURITY DEPOSIT MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Return security deposit to tenant (called when lease ends cleanly).
     */
    function returnSecurityDeposit(
        uint256 leaseId
    ) external nonReentrant {
        Lease storage lease = leases[leaseId];
        if (lease.landlord != msg.sender && !hasRole(ARBITER_ROLE, msg.sender)) {
            revert NotLandlord(leaseId);
        }
        uint256 deposit = securityDeposits[leaseId];
        if (deposit == 0) revert InsufficientDeposit();

        securityDeposits[leaseId] = 0;
        stablecoin.safeTransfer(lease.tenant, deposit);

        emit SecurityDepositReturned(leaseId, lease.tenant, deposit);
    }

    /**
     * @notice Landlord claims (part of) security deposit for damages.
     *         Must be approved by ARBITER.
     */
    function claimSecurityDeposit(
        uint256 leaseId,
        uint256 amount,
        string calldata reason
    ) external onlyRole(ARBITER_ROLE) nonReentrant {
        Lease storage lease = leases[leaseId];
        uint256 deposit = securityDeposits[leaseId];
        require(amount <= deposit, "Amount exceeds deposit");

        securityDeposits[leaseId] = deposit - amount;
        stablecoin.safeTransfer(lease.landlord, amount);

        // Return remainder to tenant
        if (deposit - amount > 0) {
            stablecoin.safeTransfer(lease.tenant, deposit - amount);
            securityDeposits[leaseId] = 0;
        }

        emit SecurityDepositClaimed(leaseId, lease.landlord, amount, reason);
    }

    // ═══════════════════════════════════════════════════════════════
    //                     LEASE TERMINATION
    // ═══════════════════════════════════════════════════════════════

    function terminateLease(
        uint256 leaseId,
        string calldata reason
    ) external onlyRole(ARBITER_ROLE) {
        Lease storage lease = leases[leaseId];
        if (lease.tenant == address(0)) revert LeaseNotFound(leaseId);
        lease.status = LeaseStatus.Terminated;
        emit LeaseTerminated(leaseId, reason);
    }

    // ═══════════════════════════════════════════════════════════════
    //                     PLATFORM FEES
    // ═══════════════════════════════════════════════════════════════

    function withdrawPlatformFees(
        address to
    ) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        uint256 amount = totalPlatformFees;
        totalPlatformFees = 0;
        stablecoin.safeTransfer(to, amount);
        emit PlatformFeesWithdrawn(to, amount);
    }

    // ═══════════════════════════════════════════════════════════════
    //                      VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    function getLease(uint256 leaseId) external view returns (Lease memory) {
        return leases[leaseId];
    }

    function getPayment(uint256 paymentId) external view returns (Payment memory) {
        return payments[paymentId];
    }

    function getLeasePayments(uint256 leaseId) external view returns (uint256[] memory) {
        return leasePayments[leaseId];
    }

    function getTenantLeases(address tenant) external view returns (uint256[] memory) {
        return tenantLeases[tenant];
    }

    function getLandlordLeases(address landlord) external view returns (uint256[] memory) {
        return landlordLeases[landlord];
    }

    function getTenantPaymentHistory(
        address tenant
    ) external view returns (uint16 totalOnTime, uint16 totalPaymentsMade, uint16 totalLeases) {
        uint256[] memory tLeases = tenantLeases[tenant];
        totalLeases = uint16(tLeases.length);
        for (uint256 i = 0; i < tLeases.length; i++) {
            Lease storage l = leases[tLeases[i]];
            totalOnTime += l.onTimePayments;
            totalPaymentsMade += l.completedPayments;
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
