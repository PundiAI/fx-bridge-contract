import chai from "chai";
import {ethers} from "hardhat";
import {solidity} from "ethereum-waffle";
import {deployFxBridgeContract, examplePowers} from "../utils/utils";

chai.use(solidity);
const {expect} = chai;

describe("send to fx test", function () {
    it("works right", async function () {

        
        
        const signers = await ethers.getSigners();
        const gravityId = ethers.utils.formatBytes32String("eth-fxcore");

        const powers = examplePowers();
        const validators = signers.slice(0, powers.length);

        const powerThreshold = 6666;
        const {fxBridge, fxUSDToken} = await deployFxBridgeContract(gravityId, validators, powers, powerThreshold);

        
        
        await fxUSDToken.functions.approve(fxBridge.address, 1000);
        const fxBridge_owner = await fxBridge.owner();
        await fxUSDToken.mint(fxBridge_owner, '1000')

        await expect(fxBridge.functions.sendToFx(
            fxUSDToken.address,
            ethers.utils.formatBytes32String("myFxAddress"),
            ethers.utils.formatBytes32String(""),
            1000
        )).to.emit(fxBridge, 'SendToFxEvent').withArgs(
            fxUSDToken.address,
            await signers[0].getAddress(),
            ethers.utils.formatBytes32String("myFxAddress"),
            ethers.utils.formatBytes32String(""),
            1000,
            3,
        );

        expect((await fxUSDToken.functions.balanceOf(fxBridge.address))[0]).to.equal(1000);
        expect((await fxBridge.functions.state_lastEventNonce())[0]).to.equal(3);


        
        
        await fxUSDToken.functions.approve(fxBridge.address, 1000);
        await fxUSDToken.mint(fxBridge_owner, '1000')

        const sendToFxTx = await fxBridge.functions.sendToFx(
            fxUSDToken.address,
            ethers.utils.formatBytes32String("myFxAddress"),
            ethers.utils.formatBytes32String("pay/transfer/channel-0"),
            1000
        )

        await expect(sendToFxTx).to.emit(fxBridge, 'SendToFxEvent').withArgs(
            fxUSDToken.address,
            await signers[0].getAddress(),
            ethers.utils.formatBytes32String("myFxAddress"),
            ethers.utils.formatBytes32String("pay/transfer/channel-0"),
            1000,
            4,
        );
        

        expect((await fxUSDToken.functions.balanceOf(fxBridge.address))[0]).to.equal(2000);
        expect((await fxBridge.functions.state_lastEventNonce())[0]).to.equal(4);

        
        await fxBridge.pause()

        
        await expect(
          fxBridge.functions.sendToFx(
            fxUSDToken.address,
            ethers.utils.formatBytes32String("myFxAddress"),
            ethers.utils.formatBytes32String("pay/transfer/channel-0"),
            1000
          )
        ).revertedWith('transaction: reverted with reason string \'Pausable: paused\'')

        
        await fxBridge.unpause()

        await fxUSDToken.functions.approve(fxBridge.address, 1000);
        await fxUSDToken.mint(fxBridge_owner, '1000')

        const sendToFxTxAgain = await fxBridge.functions.sendToFx(
          fxUSDToken.address,
          ethers.utils.formatBytes32String("myFxAddress"),
          ethers.utils.formatBytes32String("pay/transfer/channel-0"),
          1000
        )
        
        await expect(sendToFxTxAgain).to.emit(fxBridge, 'SendToFxEvent').withArgs(
          fxUSDToken.address,
          await signers[0].getAddress(),
          ethers.utils.formatBytes32String("myFxAddress"),
          ethers.utils.formatBytes32String("pay/transfer/channel-0"),
          1000,
          5,
        );

    });

});
