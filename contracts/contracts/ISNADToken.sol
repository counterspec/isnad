// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Nonces.sol";

/**
 * @title ISNADToken
 * @notice ERC20 token for the ISNAD protocol with permit, votes, and controlled minting
 * @dev 
 * Security considerations:
 * - MINTER_ROLE should only be granted to the RewardPool contract
 * - BURNER_ROLE should only be granted to the Staking contract (for slashing)
 * - Max supply enforced at 1B tokens
 * - Uses ERC20Votes for governance (replaces deprecated ERC20Snapshot)
 * - No selfdestruct, no arbitrary delegatecall
 */
contract ISNADToken is ERC20, ERC20Permit, ERC20Votes, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 1e18; // 1 billion
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 1e18; // 100 million

    /**
     * @notice Deploy the ISNAD token
     * @param admin Address that will receive initial supply and admin role
     */
    constructor(address admin) ERC20("ISNAD", "ISNAD") ERC20Permit("ISNAD") {
        require(admin != address(0), "Invalid admin address");
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _mint(admin, INITIAL_SUPPLY);
    }

    /**
     * @notice Mint new tokens (only MINTER_ROLE)
     * @param to Recipient address
     * @param amount Amount to mint
     * @dev Used by RewardPool for yield distribution and inflation
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    /**
     * @notice Burn tokens from an address (only BURNER_ROLE)
     * @param from Address to burn from
     * @param amount Amount to burn
     * @dev Used by Staking contract for slashing. No approval needed.
     */
    function burnFrom(address from, uint256 amount) external onlyRole(BURNER_ROLE) {
        _burn(from, amount);
    }

    /**
     * @notice Get voting power at a past block
     * @param account The address to check
     * @param blockNumber The block number to query
     * @return The voting power at that block
     */
    function getPastVotes(address account, uint256 blockNumber) 
        public view override returns (uint256) 
    {
        return super.getPastVotes(account, blockNumber);
    }

    // Required overrides for multiple inheritance

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
