import {ethers} from "ethers";
import fs from "fs";
import commandLineArgs from "command-line-args";
import path from "path";
const inquirer = require('inquirer');

import {getContractArtifacts, getInitData} from "./utils/utils";
const {decryptKeyStore} = require('../index')


const args = commandLineArgs([
    
    {name: "eth-node", type: String},
    
    {name: "fx-node", type: String},
    
    {name: "eth-deploy", type: String},
    
    {name: "eth-admin-addr", type: String},
    
    {name: "network", type: String},
    
    {name: "fx-token-addr", type: String},
    
    {name: "key-store-file-path", type: String},
    
    {name: "fx-logic-addr", type: String},

]);

function writePublishDataToFile(publishCxt: any) {
    const filePath = `../publish/${args['network']}`;
    const publishPath = path.join(__dirname, filePath);
    fs.mkdirSync(publishPath, {recursive: true});
    const deployedFilePath = `${publishPath}/publish.json`;
    fs.writeFileSync(deployedFilePath, JSON.stringify(publishCxt, null, 2) + '\n');
    console.log(`write publish data to: ${deployedFilePath}`)
}


async function main() {

    if(!args['eth-deploy']) {
        if(!args['key-store-file-path']) throw new Error('require key-store file param')
        const keyStoreFilePath = path.join(__dirname, args['key-store-file-path']);
        args['eth-deploy'] = await decryptKeyStore({
            file: keyStoreFilePath
        })
    }

    const provider = await new ethers.providers.JsonRpcProvider(args["eth-node"]);
    const wallet = new ethers.Wallet(args['eth-deploy'], provider);


    const {result: fxBridgeProxyRes} = await inquirer.prompt({
        type: 'confirm',
        name: 'result',
        message: 'Start deploy FxBridge contract ?'
    })

    let FxBridgeLogic: any;
    let fxBridgeLogicAbi: any;
    if(fxBridgeProxyRes) {
        console.log("Starting FxBridge contract deploy");
        const {abi, bytecode: fxBridgeLogicBytecode} = getContractArtifacts('artifacts/contracts/FxBridgeLogic.sol/FxBridgeLogic.json');

        fxBridgeLogicAbi = abi
        const fxBridgeProxyFactory = new ethers.ContractFactory(fxBridgeLogicAbi, fxBridgeLogicBytecode, wallet);
        FxBridgeLogic = (await fxBridgeProxyFactory.deploy());
        await FxBridgeLogic.deployed();
        console.log("FxBridge Logic deployed at Address - ", FxBridgeLogic.address);
    }



    const {result: transparentUpgradeableProxyRes} = await inquirer.prompt({
        type: 'confirm',
        name: 'result',
        message: 'Start deploy TransparentUpgradeableProxy contract?'
    })

    let transparentUpgradeableProxy: any;
    if(transparentUpgradeableProxyRes) {
        console.log("Starting TransparentUpgradeableProxy contract deploy");

        const fxbridgeAddr = FxBridgeLogic ? FxBridgeLogic.address : args['fx-logic-addr']

        const {
            abi: fxBridgeProxyAbi,
            bytecode: fxBridgeProxyBytecode
        } = getContractArtifacts('artifacts/contracts/Proxy/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json');
        const transparentUpgradeableProxyFactory = new ethers.ContractFactory(fxBridgeProxyAbi, fxBridgeProxyBytecode, wallet);
        transparentUpgradeableProxy = await transparentUpgradeableProxyFactory
          .deploy(fxbridgeAddr, wallet.address, '0x');

        await transparentUpgradeableProxy.deployed();
        console.log("FxBridge Logic Proxy deployed at Address - ", transparentUpgradeableProxy.address);
        console.log("FxBridge Logic Proxy adminer  - ", wallet.address);
    }



    const {result: upgradeToAndCalRes} = await inquirer.prompt({
        type: 'confirm',
        name: 'result',
        message: 'Start call upgradeToAndCal ?'
    })

    if(upgradeToAndCalRes) {
        console.log(`call upgradeToAndCall...`)
        const {gravityId, vote_power, ethAddresses, powers} = await getInitData(args);
        const initBtc = new ethers.utils.Interface(fxBridgeLogicAbi).encodeFunctionData('init', [
            gravityId, vote_power, ethAddresses, powers
        ])

        console.log(`
            ${FxBridgeLogic.address}
            ${args['eth-admin-addr']}
            ${initBtc}
        `)

        const {hash:callHash} = await transparentUpgradeableProxy.connect(wallet).upgradeToAndCall(FxBridgeLogic.address, initBtc)
        console.log(`UpgradeToAndCall succefully at... ${callHash}`)
    }


    const {result: changeAdminRes} = await inquirer.prompt({
        type: 'confirm',
        name: 'result',
        message: 'Start call changeAdmin ?'
    })

    if(changeAdminRes) {
        console.log(`Change admin...`);
        const {hash:ChangeAdminHash} = await transparentUpgradeableProxy.connect(wallet).changeAdmin(args['eth-admin-addr'])
        console.log(`Change admin succefully at... ${ChangeAdminHash}`);
        console.log(`FxBridge Logic Proxy's new admin is ${args['eth-admin-addr']}`);
    }

    const {result: setFxOriginatedTokenRes} = await inquirer.prompt({
        type: 'confirm',
        name: 'result',
        message: 'Start call setFxOriginatedToken ?'
    })

    if(setFxOriginatedTokenRes) {
        const fxBridge = new ethers.Contract(transparentUpgradeableProxy.address, fxBridgeLogicAbi, wallet)

        console.log(`Start setFxOriginatedToken ...`)
        const testERC20FXAddr = args['fx-token-addr']
        const {hash} = await fxBridge.setFxOriginatedToken(testERC20FXAddr)
        console.log(`SetFxOriginatedToken successfully - ${hash}`)
    }

    let publishCxt = {
        network: args['network'],
        contract: {
            FxBridgeLogic: FxBridgeLogic?.address,
            TransparentUpgradeableProxy: transparentUpgradeableProxy?.address
        }
    };

    writePublishDataToFile(publishCxt);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

