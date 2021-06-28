pragma solidity ^0.6.6;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestERC20PUNDIX is ERC20 {
	constructor() public ERC20("Pundix Token", "PUNDIX") {}

	function mint(address account, uint256 amount) public {
		_mint(account, amount);
	}
}
