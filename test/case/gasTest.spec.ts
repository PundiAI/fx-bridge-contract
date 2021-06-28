import chai from "chai";
import {ethers} from "hardhat";
import {solidity} from "ethereum-waffle";
import {getSignerAddresses, signHash,} from "../../scripts/utils/utils";
import {deployFxBridgeContract, examplePowers} from "../utils/utils";

chai.use(solidity);

describe("gas test", function () {
    it("makeCheckpoint in isolation", async function () {
        const signers = await ethers.getSigners();
        const gravityId = ethers.utils.formatBytes32String("eth-fxcore");

        const powers = examplePowers();
        const validators = signers.slice(0, powers.length);

        const powerThreshold = 6666;
        const {fxBridge} = await deployFxBridgeContract(gravityId, validators, powers, powerThreshold);

        await fxBridge.makeCheckpoint(await getSignerAddresses(validators), powers, 0, gravityId);
    });

    it("checkValidatorSignatures in isolation", async function () {
        const signers = await ethers.getSigners();
        const gravityId = ethers.utils.formatBytes32String("eth-fxcore");

        const powers = examplePowers();
        const validators = signers.slice(0, powers.length);

        const powerThreshold = 6666;

        const {
            fxBridge,
        } = await deployFxBridgeContract(gravityId, validators, powers, powerThreshold);

        let sigs = await signHash(validators, "0x7bc422a00c175cae98cf2f4c36f2f8b63ec51ab8c57fecda9bccf0987ae2d67d");

        await fxBridge.checkValidatorSignatures(
            await getSignerAddresses(validators),
            powers,
            sigs.v,
            sigs.r,
            sigs.s,
            "0x7bc422a00c175cae98cf2f4c36f2f8b63ec51ab8c57fecda9bccf0987ae2d67d",
            6666
        );
    });
});
