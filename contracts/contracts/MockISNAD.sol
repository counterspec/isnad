// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockISNAD
 * @notice Testnet-only mock token with public mint for testing
 */
contract MockISNAD is ERC20 {
    constructor() ERC20("ISNAD (Testnet)", "tISNAD") {}

    /**
     * @notice Public mint for testnet - anyone can mint tokens for testing
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @notice Faucet function - mint 10,000 tokens to caller
     */
    function faucet() external {
        _mint(msg.sender, 10_000 * 10**18);
    }
}
