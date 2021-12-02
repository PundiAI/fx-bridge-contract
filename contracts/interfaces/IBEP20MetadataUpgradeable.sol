// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./IBEP20Upgradeable.sol";

/**
 * @dev Interface for the optional metadata functions from the ERC20 standard.
 *
 * _Available since v4.1._
 */
interface IBEP20MetadataUpgradeable is IBEP20Upgradeable {

    function mint(address account, uint256 amount) external;

    function burn(uint256 amount) external;

    function transferOwnership(address newOwner) external;
}
