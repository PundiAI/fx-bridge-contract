import {ethers} from "hardhat";
import {Signer} from "ethers";
import {TestERC20FXUSD} from "../../typechain";
import {getContractArtifacts, getSignerAddresses, makeCheckpoint, randPowerGenerator} from "../../scripts/utils/utils";

export async function deployFxBridgeContract(gravityId: string, validators: Signer[], powers: number[], powerThreshold: number) {
    const singers = await ethers.getSigners();
    const updateAdmin = singers[singers.length - 1];
    const valAddresses = await getSignerAddresses(validators);

    const checkpoint = makeCheckpoint(valAddresses, powers, 0, gravityId);

    const fxBridgeProxyFactory = await ethers.getContractFactory('FxBridgeLogic');
    const {abi: fxBridgeProxyAbi} = getContractArtifacts('artifacts/contracts/FxBridgeLogic.sol/FxBridgeLogic.json')
    const FxBridgeLogic = await fxBridgeProxyFactory.deploy();
    await FxBridgeLogic.deployed();

    const initBtc = new ethers.utils.Interface(fxBridgeProxyAbi).encodeFunctionData('init', [
        gravityId, powerThreshold, valAddresses, powers
    ])

    // console.log(`
    // ${valAddresses.length} : ${powers.length}
    //     ${gravityId}
    //     ${powerThreshold}
    //     ${valAddresses}
    //     ${powers}
    // `);

    const transparentUpgradeableProxyFactory = await ethers.getContractFactory('TransparentUpgradeableProxy');
    const transparentUpgradeableProxy = await transparentUpgradeableProxyFactory
        .deploy(FxBridgeLogic.address, updateAdmin.address, initBtc);
    await transparentUpgradeableProxy.deployed();

    const TestERC20FXUSDFactory = await ethers.getContractFactory("TestERC20FXUSD");
    const fxUSDToken = await TestERC20FXUSDFactory.deploy() as TestERC20FXUSD;
    await fxUSDToken.deployed()

    const TestERC20FXFactory = await ethers.getContractFactory("FunctionX");
    const fxToken = await TestERC20FXFactory.deploy();
    await fxToken.deployed()

    const fxBridge = fxBridgeProxyFactory.attach(transparentUpgradeableProxy.address)

    await fxBridge.setFxOriginatedToken(fxToken.address)
    await fxBridge.addBridgeToken(fxUSDToken.address)


    const TestFxFaucetFactory =await ethers.getContractFactory("TestFxFaucet");
    const fxFaucet = await TestFxFaucetFactory.deploy();
    await fxFaucet.deployed();

    // console.log(`
    //     fxBridge.address : ${fxBridge.address}
    //     fxUSDToken.address: ${fxUSDToken.address}
    //     fxToken.address: ${fxToken.address}
    //     gravityId: ${gravityId}
    //     powerThreshold: ${powerThreshold}
    //     valAddresses: ${valAddresses}
    //     powers: ${powers},
    //     initBtc: ${initBtc}
    // `);

    return {fxBridge, fxToken, fxUSDToken, checkpoint, updateAdmin, transparentUpgradeableProxy, fxFaucet};
}


export function examplePowers(validatorNum?: number): number[] {
    let powers: number[] = [];
    if (!validatorNum) {
        powers = [
            3000,
            2000,
            900,
            800,
            700,
            600,
            500,
            400,
            300,
            200,
            200,
            200,
            200,
            200,
            200,
            100,
            100,
            100,
            100,
            100,
        ];
    } else {
        const UINIT32_MAX = parseInt('11111111111111111111111111111111', 2)
        powers = randPowerGenerator(validatorNum, UINIT32_MAX)
    }
    return powers;
}

