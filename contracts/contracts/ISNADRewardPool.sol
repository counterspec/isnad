// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title ISNADRewardPool
 * @notice Yield distribution for auditors who stake on clean resources
 * 
 * Reward mechanics:
 * - Rewards accrue based on stake amount and lock duration
 * - Longer locks earn higher multiplier (1x-3x)
 * - Rewards come from protocol fees and inflation
 * - Claimed rewards are minted from ISNADToken
 */
contract ISNADRewardPool is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    
    // ============ State ============
    
    IERC20 public immutable isnadToken;
    address public stakingContract;
    
    // Reward rate per second per token staked (in wei)
    // Default: ~10% APY = 0.1 / (365 * 24 * 3600) ≈ 3.17e-9 tokens/sec/token
    uint256 public rewardRatePerSecond = 3170979198; // ~10% APY in wei terms
    
    // Lock duration multipliers (in basis points, 10000 = 1x)
    // 30 days = 1x, 90 days = 1.5x, 180 days = 2x, 365 days = 3x
    mapping(uint256 => uint256) public lockMultipliers;
    
    // Auditor rewards tracking
    struct AuditorReward {
        uint256 totalEarned;
        uint256 totalClaimed;
        uint256 lastUpdateTime;
        uint256 pendingRewards;
    }
    
    mapping(address => AuditorReward) public auditorRewards;
    
    // Total distributed (for stats)
    uint256 public totalDistributed;
    uint256 public totalClaimed;
    
    // ============ Events ============
    
    event RewardAccrued(address indexed auditor, uint256 amount);
    event RewardClaimed(address indexed auditor, uint256 amount);
    event RewardRateUpdated(uint256 newRate);
    event LockMultiplierUpdated(uint256 duration, uint256 multiplier);
    
    // ============ Constructor ============
    
    constructor(address _isnadToken, address _stakingContract) {
        require(_isnadToken != address(0), "Invalid token");
        require(_stakingContract != address(0), "Invalid staking contract");
        isnadToken = IERC20(_isnadToken);
        stakingContract = _stakingContract;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(DISTRIBUTOR_ROLE, _stakingContract);
        
        // Initialize lock multipliers
        lockMultipliers[30 days] = 10000;   // 1x
        lockMultipliers[60 days] = 12500;   // 1.25x
        lockMultipliers[90 days] = 15000;   // 1.5x
        lockMultipliers[180 days] = 20000;  // 2x
        lockMultipliers[365 days] = 30000;  // 3x
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Accrue rewards for an auditor's attestation
     * @dev Called by staking contract when attestation is created or modified
     * @param auditor The auditor address
     * @param stakeAmount Amount staked
     * @param lockDuration Lock duration in seconds
     */
    function accrueRewards(
        address auditor,
        uint256 stakeAmount,
        uint256 lockDuration
    ) external onlyRole(DISTRIBUTOR_ROLE) {
        _updateRewards(auditor);
        
        // Calculate reward for this stake
        uint256 multiplier = _getMultiplier(lockDuration);
        uint256 reward = (stakeAmount * rewardRatePerSecond * lockDuration * multiplier) / (10000 * 1e18);
        
        auditorRewards[auditor].pendingRewards += reward;
        auditorRewards[auditor].totalEarned += reward;
        totalDistributed += reward;
        
        emit RewardAccrued(auditor, reward);
    }
    
    /**
     * @notice Claim accumulated rewards
     */
    function claimRewards() external nonReentrant returns (uint256) {
        _updateRewards(msg.sender);
        
        AuditorReward storage reward = auditorRewards[msg.sender];
        uint256 claimable = reward.pendingRewards;
        require(claimable > 0, "No rewards to claim");
        
        reward.pendingRewards = 0;
        reward.totalClaimed += claimable;
        totalClaimed += claimable;
        
        // Transfer rewards (pool must have sufficient balance)
        isnadToken.safeTransfer(msg.sender, claimable);
        
        emit RewardClaimed(msg.sender, claimable);
        
        return claimable;
    }
    
    /**
     * @notice Calculate pending rewards for an auditor
     * @param auditor The auditor address
     */
    function pendingRewards(address auditor) external view returns (uint256) {
        return auditorRewards[auditor].pendingRewards;
    }
    
    /**
     * @notice Get auditor's reward info
     * @param auditor The auditor address
     */
    function getAuditorRewards(address auditor) external view returns (
        uint256 earned,
        uint256 claimed,
        uint256 pending
    ) {
        AuditorReward storage reward = auditorRewards[auditor];
        return (reward.totalEarned, reward.totalClaimed, reward.pendingRewards);
    }
    
    /**
     * @notice Get lock duration multiplier
     * @param lockDuration Duration in seconds
     */
    function getMultiplier(uint256 lockDuration) external view returns (uint256) {
        return _getMultiplier(lockDuration);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Update reward rate
     * @param newRate New rate per second per token (in wei)
     */
    function setRewardRate(uint256 newRate) external onlyRole(ADMIN_ROLE) {
        rewardRatePerSecond = newRate;
        emit RewardRateUpdated(newRate);
    }
    
    /**
     * @notice Update lock multiplier
     * @param duration Lock duration in seconds
     * @param multiplier Multiplier in basis points (10000 = 1x)
     */
    function setLockMultiplier(
        uint256 duration,
        uint256 multiplier
    ) external onlyRole(ADMIN_ROLE) {
        require(multiplier >= 10000, "Multiplier must be >= 1x");
        lockMultipliers[duration] = multiplier;
        emit LockMultiplierUpdated(duration, multiplier);
    }
    
    /**
     * @notice Update staking contract
     */
    function setStakingContract(address _stakingContract) external onlyRole(ADMIN_ROLE) {
        require(_stakingContract != address(0), "Invalid staking contract");
        // Revoke old, grant new
        _revokeRole(DISTRIBUTOR_ROLE, stakingContract);
        stakingContract = _stakingContract;
        _grantRole(DISTRIBUTOR_ROLE, _stakingContract);
    }
    
    /**
     * @notice Emergency withdraw (admin only)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyRole(ADMIN_ROLE) {
        isnadToken.safeTransfer(msg.sender, amount);
    }
    
    /**
     * @notice Fund the reward pool
     * @param amount Amount to fund
     */
    function fund(uint256 amount) external {
        isnadToken.safeTransferFrom(msg.sender, address(this), amount);
    }
    
    // ============ Internal Functions ============
    
    function _updateRewards(address auditor) internal {
        auditorRewards[auditor].lastUpdateTime = block.timestamp;
    }
    
    function _getMultiplier(uint256 lockDuration) internal view returns (uint256) {
        // Find the highest applicable multiplier
        if (lockDuration >= 365 days && lockMultipliers[365 days] > 0) {
            return lockMultipliers[365 days];
        } else if (lockDuration >= 180 days && lockMultipliers[180 days] > 0) {
            return lockMultipliers[180 days];
        } else if (lockDuration >= 90 days && lockMultipliers[90 days] > 0) {
            return lockMultipliers[90 days];
        } else if (lockDuration >= 60 days && lockMultipliers[60 days] > 0) {
            return lockMultipliers[60 days];
        } else if (lockDuration >= 30 days && lockMultipliers[30 days] > 0) {
            return lockMultipliers[30 days];
        }
        
        // Default 1x for shorter durations
        return 10000;
    }
    
    // ============ View Functions ============
    
    function poolBalance() external view returns (uint256) {
        return isnadToken.balanceOf(address(this));
    }
}
