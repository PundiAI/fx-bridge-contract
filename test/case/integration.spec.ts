import chai from "chai";
import {ethers} from "hardhat";
import {solidity} from "ethereum-waffle";
import {getSignerAddresses, makeCheckpoint, signHash} from "../../scripts/utils/utils";
import {deployFxBridgeContract, examplePowers} from "../utils/utils";

chai.use(solidity);
const {expect} = chai;

describe("integration test", function () {
    it("valset update + batch submit", async function () {

        
        

        const signers = await ethers.getSigners();
        const gravityId = ethers.utils.formatBytes32String("eth-fxcore");

        const valset0 = {
            powers: examplePowers(),
            validators: signers.slice(0, examplePowers().length),
            nonce: 0
        }

        const powerThreshold = 6666;
        const {
            fxBridge,
            fxUSDToken,
            checkpoint
        } = await deployFxBridgeContract(gravityId, valset0.validators, valset0.powers, powerThreshold);
        expect((await fxBridge.functions.state_lastValsetCheckpoint())[0]).to.equal(checkpoint);

        
        

        const valset1 = (() => {
            
            let powers = examplePowers();
            powers[0] -= 3;
            powers[1] += 3;
            let validators = signers.slice(0, powers.length);

            return {
                powers: powers,
                validators: validators,
                nonce: 1
            }
        })()

        const checkpoint1 = makeCheckpoint(
            await getSignerAddresses(valset1.validators),
            valset1.powers,
            valset1.nonce,
            gravityId
        );

        let sigs1 = await signHash(valset0.validators, checkpoint1);

        const updateValsetTx = await fxBridge.updateValset(
            await getSignerAddresses(valset1.validators),
            valset1.powers,
            valset1.nonce,

            await getSignerAddresses(valset0.validators),
            valset0.powers,
            valset0.nonce,

            sigs1.v,
            sigs1.r,
            sigs1.s
        );
        await expect(updateValsetTx).to.emit(fxBridge, 'ValsetUpdatedEvent').withArgs(
            valset1.nonce,
            3,
            await getSignerAddresses(valset1.validators),
            valset1.powers,
        );
        

        expect((await fxBridge.functions.state_lastValsetCheckpoint())[0]).to.equal(checkpoint1);


        
        

        await fxUSDToken.approve(fxBridge.address, 1000);
        const fxBridge_owner = await fxBridge.owner();
        await fxUSDToken.mint(fxBridge_owner, '1000')

        await fxBridge.sendToFx(
            fxUSDToken.address,
            ethers.utils.formatBytes32String("myFxAddress"),
            ethers.utils.formatBytes32String(""),
            1000
        );

        
        const txDestinationsInt = new Array(signers.length);
        const txFees = new Array(signers.length);
        const txAmounts = new Array(signers.length);
        for (let i = 0; i < signers.length; i++) {
            txFees[i] = 1;
            txAmounts[i] = 1;
            txDestinationsInt[i] = signers[i];
        }

        const txDestinations = await getSignerAddresses(txDestinationsInt);

        const batchNonce = 1
        const batchTimeout = 10000000

        const methodName = ethers.utils.formatBytes32String("transactionBatch");

        let abiEncoded = ethers.utils.defaultAbiCoder.encode(
            [
                "bytes32",
                "bytes32",
                "uint256[]",
                "address[]",
                "uint256[]",
                "uint256",
                "address",
                "uint256",
                "address"
            ],
            [
                gravityId,
                methodName,
                txAmounts,
                txDestinations,
                txFees,
                batchNonce,
                fxUSDToken.address,
                batchTimeout,
                signers[0].address
            ]
        );

        let digest = ethers.utils.keccak256(abiEncoded);

        let sigs = await signHash(valset1.validators, digest);

        await fxBridge.submitBatch(
            await getSignerAddresses(valset1.validators),
            valset1.powers,
            sigs.v,
            sigs.r,
            sigs.s,
            txAmounts,
            txDestinations,
            txFees,
            [valset1.nonce, batchNonce],
            fxUSDToken.address,
            batchTimeout,
            signers[0].address
        );

        expect(
            await (
                await fxUSDToken.functions.balanceOf(await signers[10].getAddress())
            )[0].toNumber()
        ).to.equal(1);
    });
});
