import {getSignerAddresses, makeTxBatchHash_new, signHash} from "../../scripts/utils/utils";
import {solidity} from 'ethereum-waffle';
import {deployFxBridgeContract, examplePowers} from "../utils/utils";
import {Contract} from "ethers";

const {ethers} = require('hardhat');
const {expect, use} = require('chai');

use(solidity);


async function init() {
    const signers = await ethers.getSigners();
    const gravityId = ethers.utils.formatBytes32String("eth-fxcore");

    const powers = examplePowers();
    const validators = signers.slice(0, powers.length);

    const powerThreshold = 6666;
    const {fxBridge, fxToken, transparentUpgradeableProxy} = await deployFxBridgeContract(
        gravityId, validators, powers, powerThreshold);

    const tokenOriginOwner = await fxToken.owner();

    const mintAmount = '10'
    await fxToken.functions.approve(fxBridge.address, 1000);
    await fxToken.mint(signers[0].address, mintAmount)
    const balance = (await fxToken.balanceOf(signers[0].address)).toString()
    expect(balance).equal('100000000000000000000000010')

    // cross to fx chain
    await fxBridge.functions.sendToFx(
        fxToken.address,
        ethers.utils.formatBytes32String("myFxAddress"),
        ethers.utils.formatBytes32String(""),
        mintAmount
    )
    const burnedBalance = (await fxToken.balanceOf(signers[0].address)).toString()
    expect(burnedBalance).equal('100000000000000000000000000')

    return {fxBridge, validators, powers, gravityId, fxToken, signers}
}

async function runSubmitBatch(fxbridge: any, validators: any[], powers: number[], gravityId: string, batchSize: number, _contractAddr: string, signers: any[]) {

    const destinations = new Array(batchSize);
    const fees = new Array(batchSize);
    const amounts = new Array(batchSize);
    for (let i = 0; i < batchSize; i++) {
        fees[i] = 1;
        amounts[i] = 1;
        destinations[i] = await signers[signers.length - 1 - i].getAddress();
    }
    const txBatch = {destinations, fees, amounts};
    const batchNonce = 1;
    const batchTimeout = 10000;

    const digest = makeTxBatchHash_new(gravityId, txBatch.amounts, txBatch.destinations, txBatch.fees, batchNonce, _contractAddr, batchTimeout, signers[0].address)
    let sigs = await signHash(validators, digest);

    return await fxbridge.submitBatch(
        await getSignerAddresses(validators),
        powers,
        sigs.v,
        sigs.r,
        sigs.s,
        txBatch.amounts,
        txBatch.destinations,
        txBatch.fees,
        [0, 1],
        _contractAddr,
        batchTimeout,
        signers[0].address
    );

}

describe('bridge token test', async () => {
    const gravityId = ethers.utils.formatBytes32String("eth-fxcore");


    describe('Fx originated token', async () => {

        it('setFxOriginatedToken', async function () {
            const signers = await ethers.getSigners();
            const powers = examplePowers();
            const validators = signers.slice(0, powers.length);
            const powerThreshold = 6666;
            const {fxToken, fxBridge} = await deployFxBridgeContract(gravityId, validators, powers, powerThreshold);

            const isExist = await fxBridge.checkAssetStatus(fxToken.address);
            expect(isExist).equal(true);
        });
    })

    describe('Fx bridge token', async () => {
        it('addBridgeToken', async function () {
            const signers = await ethers.getSigners();
            const powers = examplePowers();
            const validators = signers.slice(0, powers.length);
            const powerThreshold = 6666;
            const {fxUSDToken, fxBridge} = await deployFxBridgeContract(gravityId, validators, powers, powerThreshold);

            const tokenList = await fxBridge.getBridgeTokenList();
            const isExist = await fxBridge.checkAssetStatus(fxUSDToken.address);
            expect(isExist).equal(true);
            expect(tokenList.length).equal(1);
        });

        it('delBridgeToken', async () => {
            const signers = await ethers.getSigners();
            const powers = examplePowers();
            const validators = signers.slice(0, powers.length);
            const powerThreshold = 6666;
            const {fxBridge, fxUSDToken} = await deployFxBridgeContract(gravityId, validators, powers, powerThreshold);

            const isExist = await fxBridge.checkAssetStatus(fxUSDToken.address);
            expect(isExist).equal(true);

            await fxBridge.delBridgeToken(fxUSDToken.address)

            const isNotExist = await fxBridge.checkAssetStatus(fxUSDToken.address);
            expect(isNotExist).equal(false);
        })

        it('transferOwner: should revert', async () => {

            const {fxBridge, validators, powers, gravityId, fxToken, signers} = await init()
            // try call token's mint function ,will get error.
            expect(
                runSubmitBatch(fxBridge, validators, powers, gravityId, 1, fxToken.address, signers)
            ).to.be.revertedWith('')

        })

        it('fxToken transferOwner to fxBridge address ', async () => {
            const {fxBridge, validators, powers, gravityId, fxToken, signers} = await init()

            // change fxToken owner :  fxToken.owner(signers[0]) -> fxBridge.address
            await fxToken.transferOwnership(fxBridge.address);
            const res = await runSubmitBatch(fxBridge, validators, powers, gravityId, 1, fxToken.address, signers)
            expect(
                // runSubmitBatch(fxBridge, validators, powers, gravityId, 1, fxToken.address, signers) // warning: don't do that ,will failed
                res
            ).to.emit(fxBridge, 'TransactionBatchExecutedEvent')
                .withArgs(1, fxToken.address, 4)

            expect(await fxToken.owner()).equal(fxBridge.address);

            // change fxToken owner :  transparentUpgradeableProxy.address -> fxToken.owner(signers[0])
            expect(
              await fxBridge.transferOwner(fxToken.address, signers[0].address)
            ).to.emit(fxBridge, 'TransferOwnerEvent')
            .withArgs(fxToken.address, signers[0].address)

            expect(await fxToken.owner()).equal(signers[0].address);

        })

    })

    describe("bridge token test", async () => {
        const tokenZero = "0x".padEnd(42, "0");
        const tokenA = "0x".padEnd(41, "0") + "1";
        const tokenB = "0x".padEnd(41, "0") + "2";
        const tokenC = "0x".padEnd(41, "0") + "3";
        let fxBridgeLogic: Contract;
        beforeEach("reset bridgeLogic contract", async () => {
            let [owner, admin] = await ethers.getSigners();
            const FxBridgeLogic = await ethers.getContractFactory('FxBridgeLogic');
            let {transparentUpgradeableProxy} = await deployFxBridgeContract(gravityId, [owner], [1000], 666);
            fxBridgeLogic = FxBridgeLogic.attach(transparentUpgradeableProxy.address)
        })

        it("test add bridge token", async () => {
            await fxBridgeLogic.addBridgeToken(tokenA);
            expect(await fxBridgeLogic.checkAssetStatus(tokenA)).equal(true);
            await fxBridgeLogic.addBridgeToken(tokenB);
            expect(await fxBridgeLogic.checkAssetStatus(tokenB)).equal(true);
            expect(await fxBridgeLogic.checkAssetStatus(tokenC)).equal(false);
            expect(fxBridgeLogic.addBridgeToken(tokenA)).revertedWith("transaction: reverted with reason string 'Token already exists'");
            expect(fxBridgeLogic.addBridgeToken(tokenZero)).revertedWith("transaction: reverted with reason string 'Invalid address'");
        })

        it("test del bridge token", async () => {
            await fxBridgeLogic.addBridgeToken(tokenA);
            expect(await fxBridgeLogic.checkAssetStatus(tokenA)).equal(true);
            await fxBridgeLogic.addBridgeToken(tokenB);
            expect(await fxBridgeLogic.checkAssetStatus(tokenB)).equal(true);
            await fxBridgeLogic.delBridgeToken(tokenB);
            expect(await fxBridgeLogic.checkAssetStatus(tokenB)).equal(false);
            expect(await fxBridgeLogic.checkAssetStatus(tokenA)).equal(true);
            await fxBridgeLogic.addBridgeToken(tokenB);
            expect(await fxBridgeLogic.checkAssetStatus(tokenB)).equal(true);
            expect(fxBridgeLogic.delBridgeToken(tokenC)).revertedWith("Token not exists");
        })
    })

})
