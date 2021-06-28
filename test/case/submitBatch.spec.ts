import chai from "chai";
const lodash = require('lodash');
import {ethers, network, artifacts, run} from "hardhat";
import {solidity} from "ethereum-waffle";
import {deployFxBridgeContract, examplePowers} from "../utils/utils";
import {
    calcPowerThreshold,
    getSignerAddresses,
    makeTxBatchHash_new,
    signHash,
    signHashWithReachPower
} from "../../scripts/utils/utils";

chai.use(solidity);
const {expect} = chai;

enum contractTypeMap {
    fxUSDToken = 'fxUSDToken',
    fxToken = 'fxToken'
}

const batchNum = 100
const validatorTestNum = 0
const UINIT32_MAX = parseInt('11111111111111111111111111111111', 2)


function getReachPowerThresholdValidators(_validatorsArr: object, powerThreshold: number): object {
    // sort
    const sortedArr = lodash.orderBy(_validatorsArr, ['power', 'asc'])
    let targetPower = 0;
    let targetList = []

    for (let i = 0; i < sortedArr.length; i++) {

        if (targetPower < powerThreshold) {

            const validator = sortedArr[i];
            targetPower += validator.power
            targetList.push(validator)
        } else {
            break;
        }

    }

    return targetList

}

async function runSubmitBatchTest(opts: { batchSize: number, contractType: string, isReachPowerThreshold?: boolean }) {
    // Deploy contracts
    // ================

    const signers = await ethers.getSigners();
    const gravityId = ethers.utils.formatBytes32String("eth-fxcore");
    const powers = examplePowers(validatorTestNum);
    const validators = signers.slice(0, powers.length);
    const powerThreshold = calcPowerThreshold(powers);

    const {fxBridge, fxUSDToken, fxToken} = await deployFxBridgeContract(gravityId, validators, powers, powerThreshold);
    // const fxbridge_addr = '0xe4D35CA31a76c7282Aa7696041d4022D11a9b518'
    // const fxusd_addr = '0xfC2F35270978cF575a60EdA232Dcac1138e47bf1'
    // const fxtoken_addr = '0x4F67434eCCae1A07Ffe712217C8705691C0f38d2'
    //
    // const privatekey = '0x4e5f03fbce381ebe3d596d6a7efc50c58ff721d05c3c3fabf69481d45cd0d01b'
    // const {wallet} = await run(SUB_CHECK_PRIVATEKEY, {deployPrivateKey: privatekey})
    // const fxBridge = await ethers.getContractAt('FxBridgeLogic', fxbridge_addr, wallet)
    // const fxUSDToken = await ethers.getContractAt('TestERC20FXUSD', fxusd_addr, wallet)
    // const fxToken = await ethers.getContractAt('FunctionX', fxtoken_addr, wallet)

    let _contractAddr = fxUSDToken.address;
    if (opts.contractType === contractTypeMap.fxUSDToken) {
        _contractAddr = fxUSDToken.address;
    } else if (opts.contractType === contractTypeMap.fxToken) {
        _contractAddr = fxToken.address;
    }

    // Lock tokens in gravity
    // ====================

    let tokenInst: any;
    if (opts.contractType === contractTypeMap.fxUSDToken) {
        await fxUSDToken.functions.approve(fxBridge.address, 1000);

        const fxBridge_owner = await fxBridge.owner();
        await fxUSDToken.mint(fxBridge_owner, '1000');
        const balance = await fxUSDToken.balanceOf(fxBridge_owner);

        expect(balance.toString()).equal('1000')
        tokenInst = fxUSDToken

    } else if (opts.contractType === contractTypeMap.fxToken) {
        await fxToken.functions.approve(fxBridge.address, 1000);

        await fxToken.mint(signers[0].address, '1000');
        const balance = await fxToken.balanceOf(signers[0].address);

        expect(balance.toString()).equal('100000000000000000000001000')
        tokenInst = fxToken
        // transfer owner to fxBridge, the following code will be executed successfully
        await fxToken.functions.transferOwnership(fxBridge.address);
        expect(await fxToken.owner()).equal(fxBridge.address);
    }

    await fxBridge.functions.sendToFx(
        _contractAddr,
        ethers.utils.formatBytes32String("myFxAddress"),
        ethers.utils.formatBytes32String(""),
        1000
    );

    if (opts.contractType === contractTypeMap.fxUSDToken) {
        expect(
            (await fxUSDToken.functions.balanceOf(fxBridge.address))[0].toNumber(),
            "gravity does not have correct balance after sendToFx"
        ).to.equal(1000);

        expect(
            (await fxUSDToken.functions.balanceOf(await signers[0].getAddress()))[0].toString(),
            "msg.sender does not have correct balance after sendToFx"
        ).to.equal("0");

    }

    // Prepare tx batch
    // ================
    const destinations = new Array(opts.batchSize);
    // const destinations2 = new Array(opts.batchSize);
    const fees = new Array(opts.batchSize);
    const amounts = new Array(opts.batchSize);
    for (let i = 0; i < opts.batchSize; i++) {
        fees[i] = 1;
        amounts[i] = 1;
        destinations[i] = await signers[signers.length - 1 - i].getAddress();
        // destinations[i] = await signers[30 + i].getAddress();
    }


    const txBatch = {destinations, fees, amounts};
    const batchNonce = 1;
    const batchTimeout = 10000;
    // const batchNonce = 5;
    // const batchTimeout = 25830809+10000;

    // Using submitBatch method
    // ========================

    const digest = makeTxBatchHash_new(gravityId, txBatch.amounts, txBatch.destinations, txBatch.fees, batchNonce, _contractAddr, batchTimeout, signers[0].address)

    let _currentValidatorSinger: any;
    let reachPowerThresholdRes: any;
    let sigs: any;

    if (opts.isReachPowerThreshold) {
        const _validators = await getSignerAddresses(validators);
        let _validatorsArr = [];
        for (let i = 0; i < powers.length - 1; i++) {
            const address = _validators[i];
            const power = powers[i];
            _validatorsArr.push({
                validator: address,
                power,
                index: i
            })
        }

        // get validator list which reach PowerThreshold
        reachPowerThresholdRes = getReachPowerThresholdValidators(_validatorsArr, powerThreshold)
        sigs = await signHashWithReachPower(reachPowerThresholdRes, digest, validators);

    } else {
        _currentValidatorSinger = validators;
        sigs = await signHash(_currentValidatorSinger, digest);
    }

    // console.log(`
    //     ${await getSignerAddresses(validators)},
    //     ${powers},
    //     ${sigs.v},
    //     ${sigs.r},
    //     ${sigs.s},
    //     ${txBatch.amounts},
    //     ${txBatch.destinations},
    //     ${txBatch.fees},
    //     ${[0, 1]},
    //     ${_contractAddr},
    //     ${batchTimeout},
    //     ${signers[0].address}
    // `)

    const {abi} = await artifacts.readArtifact('FxBridgeLogic')
    const data = new ethers.utils.Interface(abi).encodeFunctionData('submitBatch', [
        await getSignerAddresses(validators), powers, sigs.v, sigs.r, sigs.s, txBatch.amounts, txBatch.destinations, txBatch.fees, [0, batchNonce], _contractAddr ,batchTimeout, signers[0].address
    ])

    // console.log(data);

    // const tx = {
    //   to: fxBridge.address,
    //   from: wallet.address,
    //   nonce: wallet.getTransactionCount(),
    //   gasPrice: wallet.getGasPrice(),
    //   gasLimit: ethers.utils.hexlify(3000000),
    //   data: data,
    //   value: '0x0',
    // };
    // const {hash} = await wallet.sendTransaction(tx)

    // console.log(hash);

    // const temp_gas = await wallet.estimateGas({
    //     to: fxBridge.address,
    //     from: wallet.address,
    //     nonce: wallet.getTransactionCount(),
    //     gasPrice: wallet.getGasPrice(),
    //     gasLimit: ethers.utils.hexlify(3000000),
    //     data: data,
    //     value: '0x0',
    // })
    //
    // console.log(temp_gas.toString());

    const temp_gas = await ethers.provider.estimateGas({
        to: fxBridge.address,
        from: signers[0].address,
        nonce: signers[0].getTransactionCount(),
        gasPrice: signers[0].getGasPrice(),
        gasLimit: ethers.utils.hexlify(4000000),
        data: data,
        value: '0x0',
    })

    const submitBathTx = await fxBridge.submitBatch(
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

    await expect(submitBathTx).to.emit(fxBridge, 'TransactionBatchExecutedEvent').withArgs(
        1,
        _contractAddr,
        4,
    )

    expect(
        (await tokenInst.functions.balanceOf(await signers[signers.length - 1].getAddress()))[0].toNumber(),
        "first address in tx batch does not have correct balance after submitBatch"
    ).to.equal(1);

    // const digest2 = makeTxBatchHash_new(gravityId, txBatch.amounts, txBatch.destinations, txBatch.fees, batchNonce+1, _contractAddr, batchTimeout, signers[0].address)
    // const sigs2 = await signHash(_currentValidatorSinger, digest2);
    // const data2 = new ethers.utils.Interface(abi).encodeFunctionData('submitBatch', [
    //     await getSignerAddresses(validators), powers, sigs2.v, sigs2.r, sigs2.s, txBatch.amounts, txBatch.destinations, txBatch.fees, [0, batchNonce+1], _contractAddr ,batchTimeout, signers[0].address
    // ])
    //
    // const temp_gas2 = await ethers.provider.estimateGas({
    //     to: fxBridge.address,
    //     from: signers[0].address,
    //     nonce: signers[0].getTransactionCount(),
    //     gasPrice: signers[0].getGasPrice(),
    //     gasLimit: ethers.utils.hexlify(4000000),
    //     data: data2,
    //     value: '0x0',
    // })
    //
    // console.log(`
    //     ${validators.length} validator excuet ${txBatch.destinations.length} submitBatch
    //     1th: ${temp_gas.toString()}
    //     2th: ${temp_gas2.toString()}
    // `);

}

describe("submit batch test", function () {

    it("Batch use fxUSDToken", async function () {
        await runSubmitBatchTest({batchSize: batchNum, contractType: contractTypeMap.fxUSDToken});
    });

    it('Batch use fxToken', async function () {
        await runSubmitBatchTest({batchSize: batchNum, contractType: contractTypeMap.fxToken});
    });

    it('reach 0.66 powerThreshold  use fxUSDToken to batch submit ', async function () {
        await runSubmitBatchTest({
            batchSize: batchNum,
            contractType: contractTypeMap.fxUSDToken,
            isReachPowerThreshold: true
        });
    })

    it('reach 0.66 powerThreshold  use fxUSDToken to batch submit ', async function () {
        await runSubmitBatchTest({
            batchSize: batchNum,
            contractType: contractTypeMap.fxToken,
            isReachPowerThreshold: true
        });
    })
});
