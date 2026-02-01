// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./AutoUnpausable.sol";

/**
 * @title ISNADStaking
 * @notice Manages attestations (stakes) on ISNAD resources
 * @dev 
 * Security considerations:
 * - ReentrancyGuard on stake/unstake
 * - Lock periods prevent flash loan exploits
 * - Only ORACLE_ROLE can slash
 * - Whale caps prevent concentration attacks
 * - BURNER_ROLE on ISNADToken required for slashing
 * - AutoUnpausable for emergency pause (max 7 days)
 */
contract ISNADStaking is ReentrancyGuard, AutoUnpausable {
    using SafeERC20 for IERC20;

    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    IERC20 public immutable token;

    // Attestation data
    struct Attestation {
        address auditor;
        bytes32 resourceHash;
        uint256 amount;
        uint256 lockUntil;
        uint256 lockDuration;  // in seconds
        bool slashed;
    }

    // Whale caps
    uint256 public constant MAX_STAKE_PER_AUDITOR = 10_000 * 1e18;
    uint256 public constant MAX_STAKE_PERCENT = 33; // 33% of total stake on resource (when multiple stakers)

    // Lock duration tiers (in seconds)
    uint256 public constant MIN_LOCK_DURATION = 7 days;
    uint256 public constant MEDIUM_LOCK_DURATION = 30 days;
    uint256 public constant MAX_LOCK_DURATION = 90 days;

    // Trust score thresholds (stake amount in wei)
    uint256 public constant TIER_1_THRESHOLD = 100 * 1e18;    // Community
    uint256 public constant TIER_2_THRESHOLD = 1_000 * 1e18;  // Verified
    uint256 public constant TIER_3_THRESHOLD = 10_000 * 1e18; // Trusted

    // Attestation storage
    mapping(bytes32 => Attestation) public attestations; // attestationId => Attestation
    mapping(bytes32 => uint256) public resourceTotalStake; // resourceHash => total
    mapping(address => uint256) public auditorTotalStake;  // auditor => total across all resources
    mapping(address => mapping(bytes32 => uint256)) public auditorResourceStake; // auditor => resourceHash => stake
    mapping(address => bytes32[]) public auditorAttestations; // auditor => attestationIds
    mapping(bytes32 => bytes32[]) public resourceAttestations; // resourceHash => attestationIds

    uint256 public totalStaked;

    // Events
    event Staked(
        bytes32 indexed attestationId,
        address indexed auditor,
        bytes32 indexed resourceHash,
        uint256 amount,
        uint256 lockUntil,
        uint256 lockDuration
    );

    event Unstaked(
        bytes32 indexed attestationId,
        address indexed auditor,
        uint256 amount
    );

    event Slashed(
        bytes32 indexed attestationId,
        address indexed auditor,
        bytes32 indexed resourceHash,
        uint256 amount
    );

    /**
     * @notice Deploy the staking contract
     * @param _token Address of the ISNAD token
     * @param admin Address that will receive admin role
     */
    constructor(address _token, address admin) {
        require(_token != address(0), "Invalid token address");
        require(admin != address(0), "Invalid admin address");
        
        token = IERC20(_token);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    /**
     * @notice Stake tokens on a resource (create attestation)
     * @param resourceHash The content hash of the resource being attested to
     * @param amount Amount of tokens to stake
     * @param lockDuration How long to lock tokens (in seconds)
     * @return attestationId Unique identifier for this attestation
     */
    function stake(
        bytes32 resourceHash,
        uint256 amount,
        uint256 lockDuration
    ) external nonReentrant whenNotPaused returns (bytes32 attestationId) {
        require(resourceHash != bytes32(0), "Invalid resource hash");
        require(amount > 0, "Amount must be positive");
        require(lockDuration >= MIN_LOCK_DURATION, "Lock too short");
        require(lockDuration <= MAX_LOCK_DURATION, "Lock too long");

        // Check whale caps
        require(
            auditorTotalStake[msg.sender] + amount <= MAX_STAKE_PER_AUDITOR,
            "Exceeds max stake per auditor"
        );

        // Check concentration cap: no single auditor can have >33% of a resource's stake
        // (only enforced when there's existing stake from others)
        uint256 currentResourceTotal = resourceTotalStake[resourceHash];
        uint256 otherStakersAmount = currentResourceTotal - auditorResourceStake[msg.sender][resourceHash];
        if (otherStakersAmount > 0) {
            uint256 newAuditorStake = auditorResourceStake[msg.sender][resourceHash] + amount;
            uint256 newResourceTotal = currentResourceTotal + amount;
            uint256 auditorPercent = (newAuditorStake * 100) / newResourceTotal;
            require(auditorPercent <= MAX_STAKE_PERCENT, "Exceeds max stake percent");
        }

        // Generate unique attestation ID
        attestationId = keccak256(
            abi.encodePacked(msg.sender, resourceHash, block.timestamp, amount)
        );
        require(attestations[attestationId].amount == 0, "Attestation exists");

        uint256 lockUntil = block.timestamp + lockDuration;

        // Store attestation
        attestations[attestationId] = Attestation({
            auditor: msg.sender,
            resourceHash: resourceHash,
            amount: amount,
            lockUntil: lockUntil,
            lockDuration: lockDuration,
            slashed: false
        });

        // Update totals
        resourceTotalStake[resourceHash] += amount;
        auditorTotalStake[msg.sender] += amount;
        auditorResourceStake[msg.sender][resourceHash] += amount;
        totalStaked += amount;

        // Track attestation IDs
        auditorAttestations[msg.sender].push(attestationId);
        resourceAttestations[resourceHash].push(attestationId);

        // Transfer tokens
        token.safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(attestationId, msg.sender, resourceHash, amount, lockUntil, lockDuration);
    }

    /**
     * @notice Unstake tokens after lock period expires
     * @param attestationId The attestation to unstake
     */
    function unstake(bytes32 attestationId) external nonReentrant {
        Attestation storage att = attestations[attestationId];
        
        require(att.auditor == msg.sender, "Not your attestation");
        require(!att.slashed, "Attestation slashed");
        require(att.amount > 0, "No stake found");
        require(block.timestamp >= att.lockUntil, "Still locked");

        uint256 amount = att.amount;
        bytes32 resourceHash = att.resourceHash;

        // Update totals
        resourceTotalStake[resourceHash] -= amount;
        auditorTotalStake[msg.sender] -= amount;
        auditorResourceStake[msg.sender][resourceHash] -= amount;
        totalStaked -= amount;

        // Clear attestation
        att.amount = 0;

        // Transfer tokens back
        token.safeTransfer(msg.sender, amount);

        emit Unstaked(attestationId, msg.sender, amount);
    }

    /**
     * @notice Slash an attestation (only ORACLE_ROLE)
     * @param attestationId The attestation to slash
     * @dev Burns tokens via ISNADToken.burnFrom (requires BURNER_ROLE)
     */
    function slash(bytes32 attestationId) external onlyRole(ORACLE_ROLE) nonReentrant {
        Attestation storage att = attestations[attestationId];
        
        require(!att.slashed, "Already slashed");
        require(att.amount > 0, "No stake found");

        uint256 amount = att.amount;
        address auditor = att.auditor;
        bytes32 resourceHash = att.resourceHash;

        // Mark as slashed
        att.slashed = true;
        att.amount = 0;

        // Update totals
        resourceTotalStake[resourceHash] -= amount;
        auditorTotalStake[auditor] -= amount;
        auditorResourceStake[auditor][resourceHash] -= amount;
        totalStaked -= amount;

        // Burn tokens (requires this contract to have BURNER_ROLE on token)
        // We call burnFrom on the token, but since tokens are already here,
        // we burn from this contract's balance
        // Note: ISNADToken.burnFrom expects tokens to be at the 'from' address
        // Since we hold the tokens, we need to burn from ourselves
        (bool success, ) = address(token).call(
            abi.encodeWithSignature("burnFrom(address,uint256)", address(this), amount)
        );
        require(success, "Burn failed");

        emit Slashed(attestationId, auditor, resourceHash, amount);
    }

    /**
     * @notice Get trust score for a resource
     * @param resourceHash The resource to check
     * @return score Total weighted stake (amount * lock multiplier)
     */
    function getTrustScore(bytes32 resourceHash) external view returns (uint256 score) {
        bytes32[] memory attIds = resourceAttestations[resourceHash];
        
        for (uint256 i = 0; i < attIds.length; i++) {
            Attestation storage att = attestations[attIds[i]];
            if (att.amount > 0 && !att.slashed) {
                // Weight by lock duration: 7d=1x, 30d=1.5x, 90d=2x
                uint256 multiplier = 100;
                if (att.lockDuration >= MAX_LOCK_DURATION) {
                    multiplier = 200;
                } else if (att.lockDuration >= MEDIUM_LOCK_DURATION) {
                    multiplier = 150;
                }
                score += (att.amount * multiplier) / 100;
            }
        }
    }

    /**
     * @notice Get trust tier for a resource
     * @param resourceHash The resource to check
     * @return tier 0=None, 1=Community, 2=Verified, 3=Trusted
     */
    function getTrustTier(bytes32 resourceHash) external view returns (uint8 tier) {
        uint256 score = this.getTrustScore(resourceHash);
        
        if (score >= TIER_3_THRESHOLD) return 3;
        if (score >= TIER_2_THRESHOLD) return 2;
        if (score >= TIER_1_THRESHOLD) return 1;
        return 0;
    }

    /**
     * @notice Get all attestations for a resource
     * @param resourceHash The resource to query
     * @return attestationIds Array of attestation IDs
     */
    function getResourceAttestations(bytes32 resourceHash) 
        external view returns (bytes32[] memory) 
    {
        return resourceAttestations[resourceHash];
    }

    /**
     * @notice Get all attestations by an auditor
     * @param auditor The auditor address
     * @return attestationIds Array of attestation IDs
     */
    function getAuditorAttestations(address auditor) 
        external view returns (bytes32[] memory) 
    {
        return auditorAttestations[auditor];
    }

    /**
     * @notice Get attestation details
     * @param attestationId The attestation ID
     */
    function getAttestation(bytes32 attestationId) 
        external view returns (
            address auditor,
            bytes32 resourceHash,
            uint256 amount,
            uint256 lockUntil,
            uint256 lockDuration,
            bool slashed
        ) 
    {
        Attestation storage att = attestations[attestationId];
        return (
            att.auditor,
            att.resourceHash,
            att.amount,
            att.lockUntil,
            att.lockDuration,
            att.slashed
        );
    }
}
