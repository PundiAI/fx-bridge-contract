import {ethers} from 'hardhat';
import chai from 'chai';
import {solidity} from "ethereum-waffle";
import {examplePowers} from "../utils/utils";
import {calcPowerThreshold, getContractArtifacts, getInitData, getSignerAddresses} from "../../scripts/utils/utils";

chai.use(solidity);
const {expect} = chai;


const validatorTestNum = 20
describe('update proxy', function () {

    it('deploy proxy', async function () {

        const [updateAdmin, normalAccount1] = await ethers.getSigners();

        
        const fxBridgeProxyFactory = await ethers.getContractFactory('FxBridgeLogic');
        const {abi: fxBridgeProxyAbi} = getContractArtifacts('artifacts/contracts/FxBridgeLogic.sol/FxBridgeLogic.json')
        const FxBridgeLogic = await fxBridgeProxyFactory.deploy();
        await FxBridgeLogic.deployed();

        

        
        const gravityId = ethers.utils.formatBytes32String("eth-fxcore");
        const powers = examplePowers(validatorTestNum);
        const powerThreshold = calcPowerThreshold(powers);

        const signers = await ethers.getSigners();
        const validators = signers.slice(0, powers.length);
        const valAddresses = await getSignerAddresses(validators);

        const initBtc = new ethers.utils.Interface(fxBridgeProxyAbi).encodeFunctionData('init', [
            gravityId, powerThreshold, valAddresses, powers
        ])

        const transparentUpgradeableProxyFactory = await ethers.getContractFactory('TransparentUpgradeableProxy');
        const transparentUpgradeableProxy = await transparentUpgradeableProxyFactory
            .deploy(FxBridgeLogic.address, updateAdmin.address, initBtc);
        await transparentUpgradeableProxy.deployed();

        

        
        expect(
            await fxBridgeProxyFactory.attach(transparentUpgradeableProxy.address)
                .connect(normalAccount1.address).state_fxBridgeId())
            .to.equal(gravityId);

        
        expect(await FxBridgeLogic.state_fxBridgeId()).equal('0x0000000000000000000000000000000000000000000000000000000000000000')

        expect(
          (await fxBridgeProxyFactory.attach(transparentUpgradeableProxy.address)
            .connect(normalAccount1.address).state_lastEventNonce()).toString()
        ).equal('1')

        
        
        

        
        expect(
            fxBridgeProxyFactory.attach(transparentUpgradeableProxy.address)
                .connect(updateAdmin.address).state_fxBridgeId()
        ).to.be.revertedWith('admin cannot fallback to proxy target')

        
        const testFxBridgeProxyV2Factory = await ethers.getContractFactory('TestFxBridgeLogicV2')
        const TestFxBridgeLogicV2 = await testFxBridgeProxyV2Factory.deploy();
        await TestFxBridgeLogicV2.deployed();

        
        await transparentUpgradeableProxy.upgradeTo(TestFxBridgeLogicV2.address)
        

        expect(
            (await testFxBridgeProxyV2Factory.attach(transparentUpgradeableProxy.address)
                .connect(normalAccount1.address).testUpdate()).toString()
        ).to.equal('666666666');

        expect(
          (await testFxBridgeProxyV2Factory.attach(transparentUpgradeableProxy.address)
            .connect(normalAccount1.address).state_lastEventNonce()).toString()
        ).equal('1')


        const {abi: fxBridgeUpdated_ABI} = getContractArtifacts('artifacts/contracts/TestFxBridgeLogicV2.sol/TestFxBridgeLogicV2.json')
        const _newInitBTC = new ethers.utils.Interface(fxBridgeUpdated_ABI).encodeFunctionData('init', [
            gravityId, powerThreshold, valAddresses, powers, gravityId
        ])

        
        expect(
          transparentUpgradeableProxy.upgradeToAndCall(TestFxBridgeLogicV2.address, _newInitBTC)
        ).to.revertedWith('transaction: reverted with reason string \'Initializable: contract is already initialized\'')
    })

    it('deploy proxy without call init function', async function () {
        const singers = await ethers.getSigners();

      const TestERC20FXFactory = await ethers.getContractFactory("FunctionX");
      const fxToken = await TestERC20FXFactory.deploy();
      await fxToken.deployed()

        const fxBridgeProxyFactory = await ethers.getContractFactory('FxBridgeLogic');
        const {abi: fxBridgeProxyAbi} = getContractArtifacts('artifacts/contracts/FxBridgeLogic.sol/FxBridgeLogic.json')
        const FxBridgeLogic = await fxBridgeProxyFactory.connect(singers[0]).deploy();
        await FxBridgeLogic.deployed();

        const transparentUpgradeableProxyFactory = await ethers.getContractFactory('TransparentUpgradeableProxy');
        const transparentUpgradeableProxy = await transparentUpgradeableProxyFactory.connect(singers[0]).deploy(
          FxBridgeLogic.address, singers[0].address, '0x'
        )
        await transparentUpgradeableProxy.deployed();

        const gravityId = '0x6574682d6678636f726500000000000000000000000000000000000000000000'
        const powerThreshold = '6666';
        const valAddresses = [
          '0x861007B1DFd72744A579970a5F7F93E3ecbfBaeD',
            '0x030A08153CA029f0FD333E48a8803AD260414b70',
            '0xc47D7824DA0392Cf6D94EB2f91ad229Df7825476',
            '0xB8cF4389d88c72930D80A3cdEab298F3b75665c7',
            '0xaE54Bd2bF536f5E22F759035d7Ae5FdacF4AbD2b',
            '0xBe486a18eFb3350dd33F36b82d56a33547Fd61cD',
            '0xABfD2C3F1a1EF788e0ff7A5144d58600be4819bE',
            '0xFe0641E049931b8EC89ee2ef808E32849f65f658',
            '0xBAc519e5218F0108f05785C0e9439579c121AD40',
            '0x242efc8DFc9a3EA61AE65850bD682023aF86adDa',
            '0x9bF9ff58E1607c71c9116D6005Bc6b17DfBE5553',
            '0x985dB719128e299F33dBe56c837FC46a449af301',
            '0x48E7265Ec4b39958108BDC93FAe40706d2907e14',
            '0x95Ee9dAF26Bd46830aac20D231E56240182d3Dc0',
            '0x2fbF826610261Abc4eE234839f775fDD955B96bc',
            '0xd23d6D5A73D0AB80b99394AE25F856F91756eC98',
            '0x15Bf5f9419cac945bB8fB8F6bED7A790D8B8B264',
            '0x36c84c5AEc85205b33Dbe149703F064afe360330',
            '0x198A2bb148958eA077DdeDBec70b27733A624a57',
            '0xb07073B10ff904066DDBf528983C9C5931a894Be'
          ]
        const powers = [
            3000, 2000, 900, 800, 700,
            600,  500, 400, 300, 200,
            200,  200, 200, 200, 200,
            100,  100, 100, 100, 100
        ]

        const initBtc = new ethers.utils.Interface(fxBridgeProxyAbi).encodeFunctionData('init', [
            gravityId, powerThreshold, valAddresses, powers
        ])

        

        

        await transparentUpgradeableProxy.connect(singers[0]).upgradeToAndCall(FxBridgeLogic.address, initBtc);
        await transparentUpgradeableProxy.changeAdmin(singers[1].address)

        const fxBridge = fxBridgeProxyFactory.attach(transparentUpgradeableProxy.address)

        expect(
          await fxBridge.state_fxBridgeId()
        ).equal(gravityId)

        await fxBridge.connect(singers[0]).setFxOriginatedToken(fxToken.address)

        // console.log(await fxBridge.owner(), singers[0].address);

        await fxBridge.transferOwnership(singers[3].address);

        // console.log(await fxBridge.owner(), singers[3].address);

        const fxToken_new = await TestERC20FXFactory.deploy();
        await fxToken_new.deployed()

        await fxBridge.connect(singers[3]).setFxOriginatedToken(fxToken_new.address)

    });
})
