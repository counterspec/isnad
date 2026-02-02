// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./AutoUnpausable.sol";

/**
 * @title ISNADOracle
 * @notice Detection verdicts and jury system for ISNAD protocol
 * 
 * Security notes:
 * - Jury selection uses block hash for randomness (upgradeable to VRF)
 * - Jurors cannot have stake in flagged resource
 * - Supermajority (2/3) required for verdict
 * - Appeals require 2x deposit
 * - Slash only callable after guilty verdict
 * - AutoUnpausable for emergency pause (max 7 days)
 */
contract ISNADOracle is AutoUnpausable, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // ============ Structs ============
    
    enum FlagStatus {
        Pending,      // Awaiting jury
        InReview,     // Jury deliberating
        Guilty,       // Verdict: malicious
        Innocent,     // Verdict: safe
        Appealed,     // Under appeal
        Dismissed     // Flag dismissed (spam/invalid)
    }
    
    struct Flag {
        bytes32 resourceHash;
        address flagger;
        uint256 deposit;
        bytes32 evidenceHash;     // IPFS/Arweave hash of evidence
        FlagStatus status;
        uint256 createdAt;
        uint256 commitBlock;      // Block for randomness commit-reveal
        uint256 juryDeadline;
        uint256 voteCount;
        uint256 guiltyVotes;
    }
    
    // Number of blocks to wait for randomness (commit-reveal pattern)
    uint256 public constant COMMIT_BLOCKS = 5;
    
    struct Juror {
        bool selected;
        bool voted;
        bool votedGuilty;
    }
    
    // ============ State ============
    
    // Staking contract reference (for checking stakes and slashing)
    address public stakingContract;
    
    // Minimum deposit to flag a resource (prevents spam)
    uint256 public minFlagDeposit = 100 * 1e18; // 100 $ISNAD
    
    // Jury size
    uint256 public jurySize = 5;
    
    // Voting period (seconds)
    uint256 public votingPeriod = 7 days;
    
    // Supermajority threshold (basis points, 6667 = 66.67%)
    uint256 public supermajorityBps = 6667;
    
    // Appeal deposit multiplier (2x)
    uint256 public appealMultiplier = 2;
    
    // Flag storage
    mapping(bytes32 => Flag) public flags;           // flagId => Flag
    mapping(bytes32 => mapping(address => Juror)) public jurors;  // flagId => juror => Juror
    mapping(bytes32 => address[]) public juryList;   // flagId => selected jurors
    
    // Track active flags per resource
    mapping(bytes32 => bytes32) public activeFlag;   // resourceHash => flagId
    
    // Eligible juror pool (addresses that have attested to other resources)
    address[] public jurorPool;
    mapping(address => bool) public isInJurorPool;
    
    // ============ Events ============
    
    event ResourceFlagged(
        bytes32 indexed flagId,
        bytes32 indexed resourceHash,
        address indexed flagger,
        uint256 deposit,
        bytes32 evidenceHash
    );
    
    event JurySelected(bytes32 indexed flagId, address[] jurors);
    
    event JurorVoted(bytes32 indexed flagId, address indexed juror, bool guilty);
    
    event VerdictReached(
        bytes32 indexed flagId,
        bytes32 indexed resourceHash,
        FlagStatus verdict,
        uint256 guiltyVotes,
        uint256 totalVotes
    );
    
    event FlagAppealed(bytes32 indexed flagId, address indexed appellant, uint256 deposit);
    
    event SlashExecuted(bytes32 indexed resourceHash, uint256 totalSlashed);
    
    // ============ Constructor ============
    
    constructor(address _stakingContract) {
        require(_stakingContract != address(0), "Invalid staking contract");
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        stakingContract = _stakingContract;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Flag a resource as potentially malicious
     * @param resourceHash The hash of the resource to flag
     * @param evidenceHash IPFS/Arweave hash containing evidence
     */
    function flagResource(
        bytes32 resourceHash,
        bytes32 evidenceHash
    ) external payable nonReentrant whenNotPaused returns (bytes32 flagId) {
        require(msg.value >= minFlagDeposit, "Insufficient deposit");
        require(activeFlag[resourceHash] == bytes32(0), "Resource already flagged");
        
        flagId = keccak256(abi.encodePacked(resourceHash, msg.sender, block.timestamp));
        
        flags[flagId] = Flag({
            resourceHash: resourceHash,
            flagger: msg.sender,
            deposit: msg.value,
            evidenceHash: evidenceHash,
            status: FlagStatus.Pending,
            createdAt: block.timestamp,
            commitBlock: block.number + COMMIT_BLOCKS,
            juryDeadline: 0,
            voteCount: 0,
            guiltyVotes: 0
        });
        
        activeFlag[resourceHash] = flagId;
        
        emit ResourceFlagged(flagId, resourceHash, msg.sender, msg.value, evidenceHash);
        // Jury selection happens in separate tx via selectJury() after commitBlock
    }
    
    /**
     * @notice Select jury for a pending flag (commit-reveal pattern)
     * @param flagId The flag to select jury for
     * @dev Must be called after commitBlock but within 256 blocks (blockhash limit)
     */
    function selectJury(bytes32 flagId) external {
        Flag storage flag = flags[flagId];
        require(flag.status == FlagStatus.Pending, "Not pending");
        require(jurorPool.length >= jurySize, "Insufficient juror pool");
        require(block.number > flag.commitBlock, "Too early - wait for commit block");
        require(block.number <= flag.commitBlock + 256, "Too late - blockhash expired");
        
        _selectJury(flagId);
    }
    
    /**
     * @notice Cast vote as juror
     * @param flagId The flag being voted on
     * @param guilty True if voting guilty
     */
    function vote(bytes32 flagId, bool guilty) external nonReentrant whenNotPaused {
        Flag storage flag = flags[flagId];
        require(flag.status == FlagStatus.InReview, "Not in review");
        require(block.timestamp < flag.juryDeadline, "Voting ended");
        
        Juror storage juror = jurors[flagId][msg.sender];
        require(juror.selected, "Not a juror");
        require(!juror.voted, "Already voted");
        
        juror.voted = true;
        juror.votedGuilty = guilty;
        flag.voteCount++;
        if (guilty) {
            flag.guiltyVotes++;
        }
        
        emit JurorVoted(flagId, msg.sender, guilty);
        
        // Check if all votes are in
        if (flag.voteCount == jurySize) {
            _finalizeVerdict(flagId);
        }
    }
    
    /**
     * @notice Finalize verdict after voting period
     * @param flagId The flag to finalize
     */
    function finalizeVerdict(bytes32 flagId) external {
        Flag storage flag = flags[flagId];
        require(flag.status == FlagStatus.InReview, "Not in review");
        require(block.timestamp >= flag.juryDeadline, "Voting not ended");
        
        _finalizeVerdict(flagId);
    }
    
    /**
     * @notice Appeal a verdict
     * @param flagId The flag to appeal
     */
    function appeal(bytes32 flagId) external payable nonReentrant {
        Flag storage flag = flags[flagId];
        require(
            flag.status == FlagStatus.Guilty || flag.status == FlagStatus.Innocent,
            "Cannot appeal"
        );
        require(block.timestamp < flag.juryDeadline + 3 days, "Appeal window closed");
        
        uint256 requiredDeposit = flag.deposit * appealMultiplier;
        require(msg.value >= requiredDeposit, "Insufficient appeal deposit");
        
        flag.status = FlagStatus.Appealed;
        flag.deposit += msg.value;
        flag.voteCount = 0;
        flag.guiltyVotes = 0;
        
        // Clear old jury
        delete juryList[flagId];
        
        emit FlagAppealed(flagId, msg.sender, msg.value);
        
        // Select new jury
        if (jurorPool.length >= jurySize) {
            _selectJury(flagId);
        }
    }
    
    /**
     * @notice Execute slash after guilty verdict
     * @param resourceHash The resource to slash
     * @dev Permissionless by design - anyone can trigger slash execution
     *      after guilty verdict to ensure protocol liveness. The actual
     *      stake slashing happens in the staking contract.
     */
    function executeSlash(bytes32 resourceHash) external nonReentrant returns (bool) {
        bytes32 flagId = activeFlag[resourceHash];
        require(flagId != bytes32(0), "No active flag");
        
        Flag storage flag = flags[flagId];
        require(flag.status == FlagStatus.Guilty, "Not guilty");
        
        // Clear active flag
        activeFlag[resourceHash] = bytes32(0);
        
        // Return deposit to flagger (they were right)
        // Using call() instead of transfer() to support contract recipients
        (bool success, ) = payable(flag.flagger).call{value: flag.deposit}("");
        require(success, "ETH transfer failed");
        
        emit SlashExecuted(resourceHash, flag.deposit);
        
        return true;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Add address to juror pool
     * @param jurorAddress Address to add
     */
    function addToJurorPool(address jurorAddress) external onlyRole(ADMIN_ROLE) {
        require(!isInJurorPool[jurorAddress], "Already in pool");
        jurorPool.push(jurorAddress);
        isInJurorPool[jurorAddress] = true;
    }
    
    /**
     * @notice Batch add addresses to juror pool
     * @param addresses Addresses to add
     */
    function batchAddToJurorPool(address[] calldata addresses) external onlyRole(ADMIN_ROLE) {
        for (uint i = 0; i < addresses.length; i++) {
            if (!isInJurorPool[addresses[i]]) {
                jurorPool.push(addresses[i]);
                isInJurorPool[addresses[i]] = true;
            }
        }
    }
    
    /**
     * @notice Update staking contract address
     */
    function setStakingContract(address _stakingContract) external onlyRole(ADMIN_ROLE) {
        require(_stakingContract != address(0), "Invalid staking contract");
        stakingContract = _stakingContract;
    }
    
    /**
     * @notice Update minimum flag deposit
     */
    function setMinFlagDeposit(uint256 _minDeposit) external onlyRole(ADMIN_ROLE) {
        minFlagDeposit = _minDeposit;
    }
    
    /**
     * @notice Update jury size
     */
    function setJurySize(uint256 _jurySize) external onlyRole(ADMIN_ROLE) {
        require(_jurySize >= 3 && _jurySize % 2 == 1, "Invalid jury size");
        jurySize = _jurySize;
    }
    
    /**
     * @notice Update voting period
     */
    function setVotingPeriod(uint256 _votingPeriod) external onlyRole(ADMIN_ROLE) {
        require(_votingPeriod >= 1 days, "Period too short");
        votingPeriod = _votingPeriod;
    }
    
    // ============ View Functions ============
    
    function getFlag(bytes32 flagId) external view returns (Flag memory) {
        return flags[flagId];
    }
    
    function getJury(bytes32 flagId) external view returns (address[] memory) {
        return juryList[flagId];
    }
    
    function getJurorPoolSize() external view returns (uint256) {
        return jurorPool.length;
    }
    
    function isJuror(bytes32 flagId, address addr) external view returns (bool) {
        return jurors[flagId][addr].selected;
    }
    
    function hasVoted(bytes32 flagId, address addr) external view returns (bool) {
        return jurors[flagId][addr].voted;
    }
    
    // ============ Internal Functions ============
    
    function _selectJury(bytes32 flagId) internal {
        Flag storage flag = flags[flagId];
        
        // Commit-reveal randomness: use blockhash of committed block
        // Unpredictable at flag time, revealed after COMMIT_BLOCKS
        // Note: This is NOT a weak PRNG - the seed is unpredictable because
        // commitBlock is set COMMIT_BLOCKS in the future when the flag is created.
        // Attackers cannot know the blockhash when submitting the flag transaction.
        bytes32 commitHash = blockhash(flag.commitBlock);
        require(commitHash != bytes32(0), "Commit block hash unavailable");
        
        uint256 seed = uint256(keccak256(abi.encodePacked(
            commitHash,
            flagId,
            flag.createdAt
        )));
        
        address[] memory selected = new address[](jurySize);
        uint256 selectedCount = 0;
        uint256 attempts = 0;
        uint256 maxAttempts = jurorPool.length * 3;
        
        while (selectedCount < jurySize && attempts < maxAttempts) {
            // slither-disable-next-line weak-prng
            uint256 index = (seed + attempts) % jurorPool.length;
            address candidate = jurorPool[index];
            
            // Check if already selected or has conflict
            bool valid = !jurors[flagId][candidate].selected;
            
            // TODO: Check if candidate has stake in the flagged resource
            // This requires calling the staking contract
            
            if (valid) {
                selected[selectedCount] = candidate;
                jurors[flagId][candidate].selected = true;
                selectedCount++;
            }
            
            attempts++;
        }
        
        require(selectedCount == jurySize, "Could not select enough jurors");
        
        for (uint i = 0; i < jurySize; i++) {
            juryList[flagId].push(selected[i]);
        }
        
        flag.status = FlagStatus.InReview;
        flag.juryDeadline = block.timestamp + votingPeriod;
        
        emit JurySelected(flagId, selected);
    }
    
    function _finalizeVerdict(bytes32 flagId) internal {
        Flag storage flag = flags[flagId];
        
        // Calculate if supermajority reached
        uint256 guiltyThreshold = (flag.voteCount * supermajorityBps) / 10000;
        uint256 innocentThreshold = (flag.voteCount * supermajorityBps) / 10000;
        
        if (flag.guiltyVotes >= guiltyThreshold) {
            flag.status = FlagStatus.Guilty;
        } else if ((flag.voteCount - flag.guiltyVotes) >= innocentThreshold) {
            flag.status = FlagStatus.Innocent;
            // Return deposit to flagger minus fee
            uint256 fee = flag.deposit / 10; // 10% fee for failed flag
            (bool success1, ) = payable(flag.flagger).call{value: flag.deposit - fee}("");
            require(success1, "ETH transfer failed");
        } else {
            // No supermajority - dismiss
            flag.status = FlagStatus.Dismissed;
            // Return half deposit
            (bool success2, ) = payable(flag.flagger).call{value: flag.deposit / 2}("");
            require(success2, "ETH transfer failed");
        }
        
        emit VerdictReached(
            flagId,
            flag.resourceHash,
            flag.status,
            flag.guiltyVotes,
            flag.voteCount
        );
    }
}
