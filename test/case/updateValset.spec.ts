import chai from "chai";
import {ethers} from "hardhat";
import {solidity} from "ethereum-waffle";
import {deployFxBridgeContract, examplePowers} from "../utils/utils";
import {getSignerAddresses, makeCheckpoint, signHash} from "../../scripts/utils/utils";

chai.use(solidity);
const {expect} = chai;

async function runTest(opts: {
    malformedNewValset?: boolean;
    malformedCurrentValset?: boolean;
    nonMatchingCurrentValset?: boolean;
    nonceNotIncremented?: boolean;
    badValidatorSig?: boolean;
    zeroedValidatorSig?: boolean;
    notEnoughPower?: boolean;
}) {
    const signers = await ethers.getSigners();
    const gravityId = ethers.utils.formatBytes32String("eth-fxcore");

    
    const powers = examplePowers();
    const validators = signers.slice(0, powers.length);

    const powerThreshold = 6666;

    const {
        fxBridge
    } = await deployFxBridgeContract(gravityId, validators, powers, powerThreshold);

    let newPowers = examplePowers();
    newPowers[0] -= 3;
    newPowers[1] += 3;

    let newValidators = signers.slice(0, newPowers.length);
    if (opts.malformedNewValset) {
        
        newValidators = signers.slice(0, newPowers.length - 1);
    }

    let currentValsetNonce = 0;
    if (opts.nonMatchingCurrentValset) {
        powers[0] = 78;
    }
    let newValsetNonce = 1;
    if (opts.nonceNotIncremented) {
        newValsetNonce = 0;
    }

    const checkpoint = makeCheckpoint(
        await getSignerAddresses(newValidators),
        newPowers,
        newValsetNonce,
        gravityId
    );

    let sigs = await signHash(validators, checkpoint);
    if (opts.badValidatorSig) {
        
        sigs.v[1] = sigs.v[0];
        sigs.r[1] = sigs.r[0];
        sigs.s[1] = sigs.s[0];
    }

    if (opts.zeroedValidatorSig) {
        
        sigs.v[1] = sigs.v[0];
        sigs.r[1] = sigs.r[0];
        sigs.s[1] = sigs.s[0];
        
        sigs.v[1] = 0;
    }

    if (opts.notEnoughPower) {
        
        sigs.v[1] = 0;
        sigs.v[2] = 0;
        sigs.v[3] = 0;
        sigs.v[5] = 0;
        sigs.v[6] = 0;
        sigs.v[7] = 0;
        sigs.v[9] = 0;
        sigs.v[11] = 0;
        sigs.v[13] = 0;
    }

    if (opts.malformedCurrentValset) {
        
        powers.pop();
    }

    const updateValsetTx = await fxBridge.updateValset(
        await getSignerAddresses(newValidators),
        newPowers,
        newValsetNonce,
        await getSignerAddresses(validators),
        powers,
        currentValsetNonce,
        sigs.v,
        sigs.r,
        sigs.s
    );

    await expect(updateValsetTx).to.emit(fxBridge, 'ValsetUpdatedEvent').withArgs(
        newValsetNonce,
        3,
        await getSignerAddresses(newValidators),
        newPowers,
    );
    

    return {fxBridge, checkpoint};
}

describe("update valset test", function () {
    it("throws on malformed new valset", async function () {
        await expect(runTest({malformedNewValset: true})).to.be.revertedWith(
            "Malformed new validator set"
        );
    });

    it("throws on malformed current valset", async function () {
        await expect(runTest({malformedCurrentValset: true})).to.be.revertedWith(
            "Malformed current validator set"
        );
    });

    it("throws on non matching checkpoint for current valset", async function () {
        await expect(
            runTest({nonMatchingCurrentValset: true})
        ).to.be.revertedWith(
            "Supplied current validators and powers do not match checkpoint"
        );
    });

    it("throws on new valset nonce not incremented", async function () {
        await expect(runTest({nonceNotIncremented: true})).to.be.revertedWith(
            "New valset nonce must be greater than the current nonce"
        );
    });

    it("throws on bad validator sig", async function () {
        await expect(runTest({badValidatorSig: true})).to.be.revertedWith(
            "Validator signature does not match"
        );
    });

    it("allows zeroed sig", async function () {
        await runTest({zeroedValidatorSig: true});
    });

    it("throws on not enough signatures", async function () {
        await expect(runTest({notEnoughPower: true})).to.be.revertedWith(
            "Submitted validator set signatures do not have enough power"
        );
    });

    it("happy path", async function () {
        let {fxBridge, checkpoint} = await runTest({});
        expect((await fxBridge.functions.state_lastValsetCheckpoint())[0]).to.equal(checkpoint);
    });
});
