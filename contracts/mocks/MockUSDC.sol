// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title MockUSDC
 * @notice Mock stablecoin for testing the FlexLiving rent escrow system.
 *         Deploys with 6 decimals to match USDC.
 */
contract MockUSDC is ERC20, ERC20Permit {
    constructor() ERC20("USD Coin (Mock)", "USDC") ERC20Permit("USD Coin (Mock)") {
        // Mint 10M USDC to deployer for testing
        _mint(msg.sender, 10_000_000 * 10 ** decimals());
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @notice Public mint for testnet usage
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
