import chai from "chai";
import {ethers} from "hardhat";
import {solidity} from "ethereum-waffle";
import {deployFxBridgeContract, examplePowers} from "../utils/utils";

chai.use(solidity);
const {expect} = chai;

describe("constructor test", function () {
    it("throws on malformed valset", async function () {
        const signers = await ethers.getSigners();
        const gravityId = ethers.utils.formatBytes32String("eth-fxcore");

        const powers = examplePowers();
        const validators = signers.slice(0, powers.length - 1);

        const powerThreshold = 6666;
        await expect(
            deployFxBridgeContract(gravityId, validators, powers, powerThreshold)
        ).to.be.revertedWith("Malformed current validator set");
    });

    it("throws on insufficient power", async function () {
        const signers = await ethers.getSigners();
        const gravityId = ethers.utils.formatBytes32String("eth-fxcore");

        const powers = examplePowers();
        const validators = signers.slice(0, powers.length);

        const powerThreshold = 666666666;
        await expect(
            deployFxBridgeContract(gravityId, validators, powers, powerThreshold)
        ).to.be.revertedWith(
            "Submitted validator set signatures do not have enough power"
        );
    });
});
