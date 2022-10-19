import chai from "chai";
import {ethers} from "hardhat";
import {solidity} from "ethereum-waffle";
import {deployFxBridgeContract, examplePowers} from "../utils/utils";

chai.use(solidity);
const {expect} = chai;

describe("send to fx test", function () {
    it("ERC20 works right", async function () {
        
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

    it("ETH works right", async function () {
        
      const signers = await ethers.getSigners();
      const gravityId = ethers.utils.formatBytes32String("eth-fxcore");

      const powers = examplePowers();
      const validators = signers.slice(0, powers.length);

      const powerThreshold = 6666;
      const {fxBridge, fxUSDToken} = await deployFxBridgeContract(gravityId, validators, powers, powerThreshold);

      
      await fxUSDToken.functions.approve(fxBridge.address, 1000);
      const fxBridge_owner = await fxBridge.owner();
      await fxUSDToken.mint(fxBridge_owner, '1000')



      const [eth_trans_user] = await ethers.getSigners();
      const balance_user = await ethers.provider.getBalance(eth_trans_user.address);
      // 此时 Signer 有 9999.xxxx 个 ETH
      console.log(ethers.utils.formatEther(balance_user), "ETH"); 
      // 此时未转账所以 fxBridge 有 0 个 ETH
      const balance_before = await ethers.provider.getBalance(fxBridge.address);
      console.log(ethers.utils.formatEther(balance_before), "ETH"); 
      const eth_design_addr = await ethers.utils.getAddress("0x0a9AA9771E347D6169786EcBE19db71119C9b7b6");

      const sendETHToCosmosTx = await fxBridge.functions.sendToFx(
        eth_design_addr,
        ethers.utils.formatBytes32String("myFxAddress"),
        ethers.utils.formatBytes32String(""),
        10,
        { value: ethers.utils.parseEther("12")  }
      );
      // console.log(sendETHToCosmosTx);
      await expect(sendETHToCosmosTx).to.emit(fxBridge, 'SendToFxEvent').withArgs(
          eth_design_addr,
          eth_trans_user.address,
          ethers.utils.formatBytes32String("myFxAddress"),
          ethers.utils.formatBytes32String(""),
          10,
          3,
      );
      // 此时已转账所以 fxBridge 有 10 个 ETH
      const balance_after = await ethers.provider.getBalance(fxBridge.address);
      console.log(ethers.utils.formatEther(balance_after), "ETH"); 
      // 此处需要相等是要等于实际打进去的，毕竟都留下了
      // 主要还有数字长度的问题，需要使用字符串确保相等
      expect(ethers.utils.formatEther(balance_after)).to.equal("12.0");

  });

});
