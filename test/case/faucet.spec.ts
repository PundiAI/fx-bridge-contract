import {solidity} from "ethereum-waffle";
import {deployFxBridgeContract, examplePowers} from "../utils/utils";

const {ethers} = require('hardhat');
const {expect, use} = require('chai');

use(solidity);

describe('fx faucet', () => {
  const gravityId = ethers.utils.formatBytes32String("eth-fxcore");

  it('mint fx token from  fxFaucet', async function () {
    const signers = await ethers.getSigners();
    const powers = examplePowers();
    const validators = signers.slice(0, powers.length);
    const powerThreshold = 6666;
    const {fxFaucet, fxToken} = await deployFxBridgeContract(gravityId, validators, powers, powerThreshold);

    
    await fxToken.mint(fxFaucet.address, '1000');

    
    expect(
        await fxToken.balanceOf(fxFaucet.address)
    ).to.equal('1000')

    
    await fxFaucet.updateFx(fxToken.address)

    expect(
        await fxFaucet.Fx()
    ).to.equal(fxToken.address)

    
    await fxFaucet.mint(signers[1].address, '500')

    expect(
        await fxToken.balanceOf(signers[1].address)
    ).to.equal('500')

    expect(
        await fxToken.balanceOf(fxFaucet.address)
    ).to.equal('500')

    expect(
        await fxFaucet.getBalance()
    ).to.equal('500')

    
    expect(
        fxFaucet.mint(signers[1].address, '2000')
    ).revertedWith('transaction: reverted with reason string \'FxFaucet insufficient balance\'')

  });
})
