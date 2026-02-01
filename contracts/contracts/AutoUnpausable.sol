// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AutoUnpausable
 * @notice Pausable with automatic unpause after max duration
 * @dev Pause can last max 7 days. Governance can extend by re-pausing.
 */
abstract contract AutoUnpausable is AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    uint256 public constant MAX_PAUSE_DURATION = 7 days;
    
    uint256 public pausedUntil;
    
    event Paused(address indexed account, uint256 until);
    event Unpaused(address indexed account);
    
    /**
     * @notice Check if contract is currently paused
     */
    function paused() public view returns (bool) {
        return block.timestamp < pausedUntil;
    }
    
    /**
     * @notice Pause the contract for up to MAX_PAUSE_DURATION
     * @param duration Pause duration in seconds (max 7 days)
     */
    function pause(uint256 duration) external onlyRole(PAUSER_ROLE) {
        require(duration > 0 && duration <= MAX_PAUSE_DURATION, "Invalid duration");
        pausedUntil = block.timestamp + duration;
        emit Paused(msg.sender, pausedUntil);
    }
    
    /**
     * @notice Manually unpause before auto-unpause
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        require(paused(), "Not paused");
        pausedUntil = 0;
        emit Unpaused(msg.sender);
    }
    
    /**
     * @notice Modifier to check pause status
     */
    modifier whenNotPaused() {
        require(!paused(), "Contract is paused");
        _;
    }
    
    modifier whenPaused() {
        require(paused(), "Contract is not paused");
        _;
    }
}
