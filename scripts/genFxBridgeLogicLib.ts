import fs from "fs";

async function main() {
    const targetDir = "contracts/interfaces";
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir)
    }

    const sourcePath = "node_modules/@openzeppelin/contracts-upgradeable";

    const fileNameList = [
        "/token/ERC20/IERC20Upgradeable.sol",
        "/token/ERC20/SafeERC20Upgradeable.sol",
        "/utils/AddressUpgradeable.sol",
        "/utils/ContextUpgradeable.sol",
        "/math/SafeMathUpgradeable.sol",
        "/access/OwnableUpgradeable.sol",
        "/utils/ReentrancyGuardUpgradeable.sol",
        "/proxy/Initializable.sol",
        "/utils/PausableUpgradeable.sol"
    ]

    for (const fileName of fileNameList) {
        let code = await fs.readFileSync(sourcePath + fileName, "utf8").toString();

        code = code.replace(findSafeERC20, replaceSafeERC20)
        code = code.replace(findOwnable, replaceOwnable)
        code = code.replace(findInitializable, replaceInitializable)
        code = code.replace(findInit, replaceInit)

        const name = fileName.split("/")
        await fs.writeFileSync(targetDir + "/" + name[name.length - 1], code);
    }

    const Metadata = "/IERC20MetadataUpgradeable.sol"

    await fs.writeFileSync(targetDir + Metadata, IERC20Metadata)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.info("Use: npx ts-node scripts/genFxBridgeLogicLib.ts")
        console.error(error);
        process.exit(1);
    });


const findSafeERC20 = `
import "../../math/SafeMathUpgradeable.sol";
import "../../utils/AddressUpgradeable.sol";
`
const replaceSafeERC20 = `
import "./SafeMathUpgradeable.sol";
import "./AddressUpgradeable.sol";
`
const findOwnable = `
import "../utils/ContextUpgradeable.sol";
import "../proxy/Initializable.sol";
`
const replaceOwnable = `
import "./ContextUpgradeable.sol";
import "./Initializable.sol";
`
const findInitializable = `
import "../proxy/Initializable.sol";
`
const replaceInitializable = `
import "./Initializable.sol";
`
const findInit = `
import "../utils/AddressUpgradeable.sol";
`
const replaceInit = `
import "./AddressUpgradeable.sol";
`


const IERC20Metadata = `// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./IERC20Upgradeable.sol";


interface IERC20MetadataUpgradeable is IERC20Upgradeable {
    
    function name() external view returns (string memory);

    
    function symbol() external view returns (string memory);

    
    function decimals() external view returns (uint8);

    function mint(address account, uint256 amount) external;

    function burn(uint256 amount) external;

    function transferOwnership(address newOwner) external;
}
`
