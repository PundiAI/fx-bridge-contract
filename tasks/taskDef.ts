import {task, types} from "hardhat/config";
import {
    ADD_BRIDGE_TOKEN,
    AMOUNT_FLAG,
    APPROVE_FX,
    BRIDGE_TOKEN_ADDR_FLAG,
    BURN_FX,
    CHANGE_PROXY_ADMIN,
    CNAME_FLAG,
    CONTRACT_ADDR_FLAG,
    CONTRACT_NAME,
    DEPLOY_FX,
    DEPLOY_FX_BRIDGE_LOGIC,
    DEPLOY_FX_FAUCET,
    DEPLOY_PRIVATE_KEY,
    DEPLOY_PROXY,
    DESTINATION_ADDR_FLAG,
    DRIVER_PATH,
    ENCODE_ABI,
    FUNC_NAME_FLAG,
    FX_BRIDGE_TRANSFER_OWNER,
    FX_FAUCET_ADDR_FLAG, FX_LOGIC_TRAN_OWNER_SHIP,
    FX_NODE_URL_FLAG,
    FX_TOKEN_ADDR_FLAG,
    FX_TRANSFER_OWNER,
    GET_INIT_DATA,
    IBC_FLAG,
    IS_GET_INIT_DATA_FLAG,
    IS_LEDGER,
    KEY_STORE_FILE_PATH,
    LOGIC_CONTRACT_ADDR_FLAG,
    MINT_FX,
    OWNER_ADDR_FLAG,
    PROXY_ADDR_FLAG,
    PROXY_ADMIN_ADDR_FLAG,
    PROXY_INIT_BYTE_FLAG,
    PROXY_PAUSE,
    PROXY_UNPAUSE,
    RECEIVER_FLAG, RPOMPT_CHECK_TRANSACTION_DATA, SEND_ETH,
    SEND_TO_FX,
    SET_FX_ORIGIN_TOKEN,
    SPENDER_ADDR_FLAG,
    SUB_CHECK_APPROVE,
    SUB_CHECK_ETH_BALANCE,
    SUB_CHECK_OWNER,
    SUB_CHECK_PRIVATEKEY,
    SUB_CREATE_TRASACTION,
    SUB_ENCODE_ABI,
    SUB_FX_ADDR_TO_HEX, SUB_GEN_CONTRACT_ADDR,
    SUB_GET_INIT_DATA,
    SUB_SEND_TRANSACTION,
    TRANSFER,
    UPDATE_FX,
    UPDATE_LOGIC,
    UPDATE_TO_ADN_CALL,
} from "./taskName";
import {ethers} from "ethers";
const inquirer = require('inquirer');

const prompt = inquirer.createPromptModule();


task(DEPLOY_FX, 'deploy fx token')
    .addParam(DEPLOY_PRIVATE_KEY, '[optional] depoloy private key', undefined, types.string, true)
    .addParam(KEY_STORE_FILE_PATH, 'key Store File Path', undefined, types.string, true)
    .addParam(DRIVER_PATH, 'driver path ', undefined, types.string, true)
    .addParam(IS_LEDGER, 'choose ledger to send transaction', undefined, types.string, true)
    .setAction(async (taskArgs, env) => {
        const {wallet} = await env.run(SUB_CHECK_PRIVATEKEY, taskArgs)
        const cname = CONTRACT_NAME.FunctionX;

        const contractAddr = await env.run(SUB_GEN_CONTRACT_ADDR, {account: wallet.address})
        const {bytecode: data} = await env.artifacts.readArtifact(cname)

        const transaction = await env.run(SUB_CREATE_TRASACTION, {data, from: wallet.address})

        const {answer} = await prompt({type: 'confirm', name: 'answer', message: RPOMPT_CHECK_TRANSACTION_DATA})
        if(!answer) return

        console.log(`Start delploy ${cname}...`)

        const {hash} = await env.run(SUB_SEND_TRANSACTION, { transaction, wallet })

        console.log(`Execuete succefully at - ${hash}`)
        console.log(`${cname} - ${contractAddr}`)

    })

task(DEPLOY_FX_FAUCET, 'deploy fx token faucet')
    .addParam(DEPLOY_PRIVATE_KEY, '[optional] depoloy private key', undefined, types.string, true)
    .addParam(KEY_STORE_FILE_PATH, 'key Store File Path', undefined, types.string, true)
    .addParam(DRIVER_PATH, 'driver path ', undefined, types.string, true)
    .addParam(IS_LEDGER, 'choose ledger to send transaction', undefined, types.string, true)
    .setAction(async (taskArgs, env) => {
        const {wallet} = await env.run(SUB_CHECK_PRIVATEKEY, taskArgs)
        const cname = CONTRACT_NAME.TestFxFaucet

        const contractAddr = await env.run(SUB_GEN_CONTRACT_ADDR, {account: wallet.address})
        const {bytecode: data} = await env.artifacts.readArtifact(cname)

        const transaction = await env.run(SUB_CREATE_TRASACTION, {data, from: wallet.address})

        const {answer} = await prompt({type: 'confirm', name: 'answer', message: RPOMPT_CHECK_TRANSACTION_DATA})
        if(!answer) return

        console.log(`Start delploy ${cname}...`)
        const {hash} = await env.run(SUB_SEND_TRANSACTION, { transaction, wallet })
        console.log(`Execuete succefully at - ${hash}`)
        console.log(`${cname} - ${contractAddr}`)

    })

task(DEPLOY_FX_BRIDGE_LOGIC, 'deploy fx bridge logic')
    .addParam(DEPLOY_PRIVATE_KEY, '[optional] depoloy private key', undefined, types.string, true)
    .addParam(KEY_STORE_FILE_PATH, 'key Store File Path', undefined, types.string, true)
    .addParam(DRIVER_PATH, 'driver path ', undefined, types.string, true)
    .addParam(IS_LEDGER, 'choose ledger to send transaction', undefined, types.string, true)
    .setAction(async (taskArgs, env) => {
        const cname = CONTRACT_NAME.FxBridgeLogic;
        const {wallet} = await env.run(SUB_CHECK_PRIVATEKEY, taskArgs)

        const contractAddr = await env.run(SUB_GEN_CONTRACT_ADDR, {account: wallet.address} )
        const {bytecode: data} = await env.artifacts.readArtifact(cname)

        const transaction = await env.run(SUB_CREATE_TRASACTION, {data, from: wallet.address})

        const {answer} = await prompt({type: 'confirm', name: 'answer', message: RPOMPT_CHECK_TRANSACTION_DATA})
        if(!answer) return

        console.log(`Start delploy ${cname}...`)
        const {hash} = await env.run(SUB_SEND_TRANSACTION, { transaction, wallet })
        console.log(`Execuete succefully at - ${hash}`)
        console.log(`${cname} - ${contractAddr}`)
    })

task(DEPLOY_PROXY, 'deploy fxbridge proxy')
    .addParam(LOGIC_CONTRACT_ADDR_FLAG, 'logic contract address', undefined, types.string, false)
    .addParam(PROXY_ADMIN_ADDR_FLAG, 'Proxy contract admin address', undefined, types.string, false)
    .addParam(PROXY_INIT_BYTE_FLAG, '[optional] logic init function calldata  ', undefined, types.string, true)
    .addParam(DEPLOY_PRIVATE_KEY, '[optional] depoloy private key', undefined, types.string, true)
    .addParam(KEY_STORE_FILE_PATH, 'key Store File Path', undefined, types.string, true)
    .addParam(DRIVER_PATH, 'driver path ', undefined, types.string, true)
    .addParam(IS_LEDGER, 'choose ledger to send transaction', undefined, types.string, true)
    .setAction(async (taskArgs, env) => {
        const {logicContractAddr, proxyAdminAddr, proxyInitData} = taskArgs;
        const cname = 'TransparentUpgradeableProxy';

        const {wallet} = await env.run(SUB_CHECK_PRIVATEKEY, taskArgs)

        const contractAddr = await env.run(SUB_GEN_CONTRACT_ADDR, {account: wallet.address})

        const {abi, bytecode} = await env.artifacts.readArtifact(cname)
        const initData = proxyInitData ? proxyInitData : '0x';
        const data_param = new env.ethers.utils.Interface(abi)
            .encodeDeploy([logicContractAddr, proxyAdminAddr, initData])
        const data = bytecode + data_param.substring(2)

        const transaction = await env.run(SUB_CREATE_TRASACTION, {data, from: wallet.address})

        const {answer} = await prompt({type: 'confirm', name: 'answer', message: RPOMPT_CHECK_TRANSACTION_DATA})
        if(!answer) return

        console.log(`Start delploy ${cname}...`)
        const {hash} = await env.run(SUB_SEND_TRANSACTION, { transaction, wallet })
        console.log(`Execuete succefully at - ${hash}`)
        console.log(`${cname} - ${contractAddr}`)
    })


task(UPDATE_FX, 'call fxfaucet updateFx()')
    .addParam(DEPLOY_PRIVATE_KEY, '[optional] depoloy private key', undefined, types.string, true)
    .addParam(KEY_STORE_FILE_PATH, 'key Store File Path', undefined, types.string, true)
    .addParam(DRIVER_PATH, 'driver path ', undefined, types.string, true)
    .addParam(IS_LEDGER, 'choose ledger to send transaction', undefined, types.string, true)
    .addParam(FX_TOKEN_ADDR_FLAG, 'fx token contract address', undefined, types.string, false)
    .addParam(FX_FAUCET_ADDR_FLAG, 'fx faucet contract address', undefined, types.string, false)
    .setAction(async (taskArgs, env) => {

        const cname = CONTRACT_NAME.TestFxFaucet;
        const {fxTokenAddr, fxFaucetAddr} = taskArgs;

        const {wallet} = await env.run(SUB_CHECK_PRIVATEKEY, taskArgs)

        const {abi} = await env.artifacts.readArtifact(cname)
        const data = new env.ethers.utils.Interface(abi).encodeFunctionData('updateFx', [fxTokenAddr])

        const transaction = await env.run(SUB_CREATE_TRASACTION, {data, to: fxFaucetAddr, from: wallet.address})

        const {answer} = await prompt({type: 'confirm', name: 'answer', message: RPOMPT_CHECK_TRANSACTION_DATA})
        if(!answer) return

        console.log(`Start updateFx...`)
        const {hash} = await env.run(SUB_SEND_TRANSACTION, {transaction, wallet})
        console.log(`UpdateFx successfully at - ${hash}`)
    })

task(UPDATE_TO_ADN_CALL, 'call updateToAndCall()')
    .addParam(FX_NODE_URL_FLAG, 'fx node url', undefined, types.string, false)
    .addParam(FUNC_NAME_FLAG, 'contract\'s function name ' , undefined, types.string, false)
    .addParam(CONTRACT_ADDR_FLAG, 'contract address', undefined, types.string, false)
    .addParam(LOGIC_CONTRACT_ADDR_FLAG, 'logic contract address', undefined, types.string, false)
    .addParam(DEPLOY_PRIVATE_KEY, '[optional] depoloy private key', undefined, types.string, true)
    .addParam(KEY_STORE_FILE_PATH, 'key Store File Path', undefined, types.string, true)
    .addParam(DRIVER_PATH, 'driver path ', undefined, types.string, true)
    .addParam(IS_LEDGER, 'choose ledger to send transaction', undefined, types.string, true)
    .setAction(async (taskArgs, env) => {
        const {functionName, contractAddr, logicContractAddr} = taskArgs
        const TransparentUpgradeableProxyCname = CONTRACT_NAME.TransparentUpgradeableProxy;
        const FxBridgeLogicCname = CONTRACT_NAME.FxBridgeLogic;

        const {wallet} = await env.run(SUB_CHECK_PRIVATEKEY, taskArgs)

        const {abi: proxyAbi} = await env.artifacts.readArtifact(TransparentUpgradeableProxyCname)
        const {abi: logicAbi} = await env.artifacts.readArtifact(FxBridgeLogicCname)
        let calldata: any;

        if(functionName === 'init') {
            const {gravityId, vote_power,ethAddresses,powers} = await env.run(SUB_GET_INIT_DATA, taskArgs)
            calldata =  new env.ethers.utils.Interface(logicAbi)
                .encodeFunctionData(functionName, [
                    gravityId, vote_power, ethAddresses, powers
                ])
            console.log(calldata);
        }else {
            throw new Error('Unsupported function')
        }

        const data = new env.ethers.utils.Interface(proxyAbi)
            .encodeFunctionData('upgradeToAndCall', [logicContractAddr, calldata])

        const transaction = await env.run(SUB_CREATE_TRASACTION, {data, to: contractAddr, from: wallet.address})

        const {answer} = await prompt({type: 'confirm', name: 'answer', message: RPOMPT_CHECK_TRANSACTION_DATA})
        if(!answer) return

        console.log(`call upgradeToAndCall...`)
        const {hash} = await env.run(SUB_SEND_TRANSACTION, {transaction, wallet})
        console.log(`UpgradeToAndCall succefully at... ${hash}`)
    })


task(CHANGE_PROXY_ADMIN, 'change proxy admin')
    .addParam(DEPLOY_PRIVATE_KEY, '[optional] depoloy private key', undefined, types.string, true)
    .addParam(KEY_STORE_FILE_PATH, 'key Store File Path', undefined, types.string, true)
    .addParam(DRIVER_PATH, 'driver path ', undefined, types.string, true)
    .addParam(IS_LEDGER, 'choose ledger to sendtransaction', undefined, types.string, true)
    .addParam(CONTRACT_ADDR_FLAG, 'contract address', undefined, types.string, false)
    .addParam(PROXY_ADMIN_ADDR_FLAG, 'Proxy contract admin address', undefined, types.string, false)
    .setAction(async (taskArgs, env) => {

        const {contractAddr, proxyAdminAddr} = taskArgs

        const {wallet} = await env.run(SUB_CHECK_PRIVATEKEY, taskArgs)
        const TransparentUpgradeableProxyCname = CONTRACT_NAME.TransparentUpgradeableProxy;
        const {abi} = await env.artifacts.readArtifact(TransparentUpgradeableProxyCname)

        const data = new env.ethers.utils.Interface(abi).encodeFunctionData('changeAdmin', [proxyAdminAddr])

        const transaction = await env.run(SUB_CREATE_TRASACTION, {data, to: contractAddr, from: wallet.address})

        const {answer} = await prompt({type: 'confirm', name: 'answer', message: RPOMPT_CHECK_TRANSACTION_DATA})
        if(!answer) return

        console.log(`Change admin...`);
        const {hash} = await env.run(SUB_SEND_TRANSACTION, {transaction, wallet})
        console.log(`Change admin succefully at... ${hash}`);
        console.log(`FxBridge Logic Proxy's new admin is ${proxyAdminAddr}`);
    })

task(SET_FX_ORIGIN_TOKEN, 'call set-fx-originated-token() ')
    .addParam(DEPLOY_PRIVATE_KEY, '[optional] depoloy private key', undefined, types.string, true)
    .addParam(KEY_STORE_FILE_PATH, 'key Store File Path', undefined, types.string, true)
    .addParam(DRIVER_PATH, 'driver path ', undefined, types.string, true)
    .addParam(IS_LEDGER, 'choose ledger to send transaction', undefined, types.string, true)
    .addParam(CONTRACT_ADDR_FLAG, 'contract address', undefined, types.string, false)
    .addParam(FX_TOKEN_ADDR_FLAG, 'fx token contract address', undefined, types.string, true)
    .setAction(async (taskArgs, env) => {
        const {contractAddr, fxTokenAddr} = taskArgs
        const cname = CONTRACT_NAME.FxBridgeLogic;

        const {wallet} = await env.run(SUB_CHECK_PRIVATEKEY, taskArgs)
        const {abi} = await env.artifacts.readArtifact(cname)

        const data = new env.ethers.utils.Interface(abi).encodeFunctionData('setFxOriginatedToken', [fxTokenAddr])
        const transaction = await env.run(SUB_CREATE_TRASACTION, {data, to: contractAddr, from: wallet.address})

        const {answer} = await prompt({type: 'confirm', name: 'answer', message: RPOMPT_CHECK_TRANSACTION_DATA})
        if(!answer) return

        console.log(`Start setFxOriginatedToken ...`)
        const {hash} = await env.run(SUB_SEND_TRANSACTION, {transaction, wallet})
        console.log(`SetFxOriginatedToken successfully - ${hash}`)
    })

task(FX_TRANSFER_OWNER, 'change fx token owner')
    .addParam(DEPLOY_PRIVATE_KEY, '[optional] depoloy private key', undefined, types.string, true)
    .addParam(KEY_STORE_FILE_PATH, 'key Store File Path', undefined, types.string, true)
    .addParam(DRIVER_PATH, 'driver path ', undefined, types.string, true)
    .addParam(IS_LEDGER, 'choose ledger to send transaction', undefined, types.string, true)
    .addParam(FX_TOKEN_ADDR_FLAG, 'fx token contract address', undefined, types.string, false)
    .addParam(OWNER_ADDR_FLAG, 'new owner address', undefined, types.string, false)
    .setAction(async (taskArgs, env) => {
        const {fxTokenAddr, ownerAddr} = taskArgs;
        const cname = CONTRACT_NAME.FunctionX
        const {wallet} = await env.run(SUB_CHECK_PRIVATEKEY, taskArgs)

        const {abi} = await env.artifacts.readArtifact(cname)
        const data = new env.ethers.utils.Interface(abi).encodeFunctionData('transferOwnership', [ownerAddr])
        const transaction = await env.run(SUB_CREATE_TRASACTION, {data, to: fxTokenAddr, from: wallet.address})

        const {answer} = await prompt({type: 'confirm', name: 'answer', message: RPOMPT_CHECK_TRANSACTION_DATA})
        if(!answer) return

        console.log(`Start transferOwnership...`)
        const {hash} = await env.run(SUB_SEND_TRANSACTION, {transaction, wallet})
        console.log(`Execute success: ${hash}`)
    })


task(FX_BRIDGE_TRANSFER_OWNER, 'change ${contract}\'s owner from  fx bridge to another address')
    .addParam(DEPLOY_PRIVATE_KEY, '[optional] depoloy private key', undefined, types.string, true)
    .addParam(KEY_STORE_FILE_PATH, 'key Store File Path', undefined, types.string, true)
    .addParam(DRIVER_PATH, 'driver path ', undefined, types.string, true)
    .addParam(IS_LEDGER, 'choose ledger to send transaction', undefined, types.string, true)
    .addParam(PROXY_ADDR_FLAG, 'proxy contract address', undefined, types.string, false)
    .addParam(FX_TOKEN_ADDR_FLAG, 'fx token contract address', undefined, types.string, false)
    .addParam(OWNER_ADDR_FLAG, 'new owner address', undefined, types.string, false)
    .setAction(async (taskArgs, env) => {
        const {proxyAddr, fxTokenAddr, ownerAddr} = taskArgs

        const FxBridgeLogicCname = CONTRACT_NAME.FxBridgeLogic
        const {abi}  = await env.artifacts.readArtifact(FxBridgeLogicCname)
        const {wallet} = await env.run(SUB_CHECK_PRIVATEKEY, taskArgs)

        const isOwner = await env.run(SUB_CHECK_OWNER, {
            abi, contractAddr: proxyAddr, checkedAddress: wallet.address})
        if(!isOwner) return

        const isBalance = await env.run(SUB_CHECK_ETH_BALANCE, { wallet})
        if(!isBalance) return

        const data = new env.ethers.utils.Interface(abi).encodeFunctionData('transferOwner', [fxTokenAddr, ownerAddr])
        const transaction = await env.run(SUB_CREATE_TRASACTION, {data, to: proxyAddr, from: wallet.address})

        const {answer} = await prompt({type: 'confirm', name: 'answer', message: RPOMPT_CHECK_TRANSACTION_DATA})
        if(!answer) return

        console.log(`Start transfer owner...`)
        const {hash} = await env.run(SUB_SEND_TRANSACTION, {transaction, wallet})
        console.log(`Execute success: ${hash}`)
    })

task(APPROVE_FX, 'fx contract approve')
    .addParam(DEPLOY_PRIVATE_KEY, '[optional] depoloy private key', undefined, types.string, true)
    .addParam(KEY_STORE_FILE_PATH, 'key Store File Path', undefined, types.string, true)
    .addParam(DRIVER_PATH, 'driver path ', undefined, types.string, true)
    .addParam(IS_LEDGER, 'choose ledger to send transaction', undefined, types.string, true)
    .addParam(FX_TOKEN_ADDR_FLAG, 'fx token contract address', undefined, types.string, true)
    .addParam(SPENDER_ADDR_FLAG, 'spender', undefined, types.string, false)
    .setAction(async (taskArgs, env) => {
        const {fxTokenAddr, spenderAddr, amount} = taskArgs
        const cname = CONTRACT_NAME.FunctionX;
        const {wallet} = await env.run(SUB_CHECK_PRIVATEKEY, taskArgs)

        const _amount = amount ? amount : env.ethers.BigNumber.from('0x' + 'f'.repeat(64));

        const {abi} = await env.artifacts.readArtifact(cname)
        const data = new env.ethers.utils.Interface(abi).encodeFunctionData('approve', [spenderAddr, _amount.toString()])
        const transaction = await env.run(SUB_CREATE_TRASACTION, {data, to: fxTokenAddr, from: wallet.address})

        const {answer} = await prompt({type: 'confirm', name: 'answer', message: RPOMPT_CHECK_TRANSACTION_DATA})
        if(!answer) return

        console.log(`Start approve...`)
        const {hash} = await env.run(SUB_SEND_TRANSACTION, {transaction, wallet})
        console.log(`Approve successfully at - ${hash}`)
    })

task(SEND_TO_FX, 'call sendToFx()')
    .addParam(DEPLOY_PRIVATE_KEY, '[optional] depoloy private key', undefined, types.string, true)
    .addParam(KEY_STORE_FILE_PATH, 'key Store File Path', undefined, types.string, true)
    .addParam(DRIVER_PATH, 'driver path ', undefined, types.string, true)
    .addParam(IS_LEDGER, 'choose ledger to send transaction', undefined, types.string, true)
    .addParam(IBC_FLAG, 'ibc', undefined, types.string, true)
    .addParam(FX_TOKEN_ADDR_FLAG, 'fx token contract address', undefined, types.string, false)
    .addParam(PROXY_ADDR_FLAG, 'proxy contract address', undefined, types.string, false)
    .addParam(DESTINATION_ADDR_FLAG, 'fx address', undefined, types.string, false)
    .addParam(AMOUNT_FLAG, 'amount ', undefined, types.string, false)
    .setAction(async (taskArgs, env) => {
        const {fxTokenAddr, proxyAddr, destinationAddr, ibc, amount} = taskArgs
        const cname = CONTRACT_NAME.FunctionX;
        const {wallet} = await env.run(SUB_CHECK_PRIVATEKEY, taskArgs)

        const Fxtokeninstance = await env.ethers.getContractAt(cname, fxTokenAddr, wallet)


        const isAllowance = await env.run(SUB_CHECK_APPROVE, {
            instance: Fxtokeninstance, owner: wallet.address, spender: proxyAddr
        })
        if(!isAllowance) return;

        const _ibc = ibc ? ibc : env.ethers.utils.formatBytes32String("")
        const scaleAmount = ethers.utils.parseEther(amount)
        const _destination = await env.run(SUB_FX_ADDR_TO_HEX, {fxAddr: destinationAddr})

        const {abi} = await env.artifacts.readArtifact(CONTRACT_NAME.FxBridgeLogic);
        const data = new env.ethers.utils.Interface(abi).encodeFunctionData('sendToFx', [fxTokenAddr, _destination, _ibc, scaleAmount])

        const transaction = await env.run(SUB_CREATE_TRASACTION, {data, to: proxyAddr, from: wallet.address})

        const {answer} = await prompt({type: 'confirm', name: 'answer', message: RPOMPT_CHECK_TRANSACTION_DATA})
        if(!answer) return

        console.log(`Start sendToFx...`)
        const {hash} = await env.run(SUB_SEND_TRANSACTION, {transaction, wallet})
        console.log(`sendToFx successfully - ${hash}`)
    })

task(UPDATE_LOGIC, 'update logic contract')
    .addParam(DEPLOY_PRIVATE_KEY, '[optional] depoloy private key', undefined, types.string, true)
    .addParam(KEY_STORE_FILE_PATH, 'key Store File Path', undefined, types.string, true)
    .addParam(DRIVER_PATH, 'driver path ', undefined, types.string, true)
    .addParam(IS_LEDGER, 'choose ledger to sendtransaction', undefined, types.string, true)
    .addParam(PROXY_ADDR_FLAG, 'proxy contract address', undefined, types.string, false)
    .addParam(LOGIC_CONTRACT_ADDR_FLAG, 'logic contract address', undefined, types.string, false)
    .setAction(async (taskArgs, env) => {
        const {proxyAddr, logicContractAddr} = taskArgs
        const cname = CONTRACT_NAME.TransparentUpgradeableProxy

        const {wallet} = await env.run(SUB_CHECK_PRIVATEKEY, taskArgs)

        const {abi} = await env.artifacts.readArtifact(cname)
        const data = new env.ethers.utils.Interface(abi).encodeFunctionData('upgradeTo', [logicContractAddr])

        const transaction = await env.run(SUB_CREATE_TRASACTION, {data, to: proxyAddr, from: wallet.address})

        const {answer} = await prompt({type: 'confirm', name: 'answer', message: RPOMPT_CHECK_TRANSACTION_DATA})
        if(!answer) return

        console.log("Update FxBridgeLogic through proxy contract...");
        const {hash} = await env.run(SUB_SEND_TRANSACTION, {transaction, wallet})
        console.log(`Update successfully - ${hash}`)
    })

task(BURN_FX, 'burn fx token')
    .addParam(DEPLOY_PRIVATE_KEY, '[optional] depoloy private key', undefined, types.string, true)
    .addParam(KEY_STORE_FILE_PATH, 'key Store File Path', undefined, types.string, true)
    .addParam(DRIVER_PATH, 'driver path ', undefined, types.string, true)
    .addParam(IS_LEDGER, 'choose ledger to sendtransaction', undefined, types.string, true)
    .addParam(FX_TOKEN_ADDR_FLAG, 'fx token contract address', undefined, types.string, false)
    .addParam(AMOUNT_FLAG, 'amount ', undefined, types.string, true)
    .setAction(async (taskArgs, env) => {
        const {fxTokenAddr, amount} = taskArgs
        const cname = CONTRACT_NAME.FunctionX
        const {wallet} = await env.run(SUB_CHECK_PRIVATEKEY, taskArgs)

        const ethBalance = await env.run(SUB_CHECK_ETH_BALANCE, {wallet})
        if (!ethBalance) return

        const _amount = amount ? amount : ethBalance;
        const _scaleAmount = env.ethers.utils.parseEther(_amount)

        const {abi} = await env.artifacts.readArtifact(cname)
        const data = new env.ethers.utils.Interface(abi).encodeFunctionData('burn', [_scaleAmount])
        const transaction = await env.run(SUB_CREATE_TRASACTION, {data, to: fxTokenAddr, from: wallet.address})

        const {answer} = await prompt({type: 'confirm', name: 'answer', message: RPOMPT_CHECK_TRANSACTION_DATA})
        if(!answer) return

        // sign transaction and send transaction
        console.log(`Sart burn...`)
        const {hash} = await env.run(SUB_SEND_TRANSACTION, {transaction, wallet})
        console.log(`Burn execute succefully - ${hash}`)
    })

task(PROXY_PAUSE, 'pause fx bridge to call sendToFx')
    .addParam(DEPLOY_PRIVATE_KEY, '[optional] depoloy private key', undefined, types.string, true)
    .addParam(KEY_STORE_FILE_PATH, 'key Store File Path', undefined, types.string, true)
    .addParam(DRIVER_PATH, 'driver path ', undefined, types.string, true)
    .addParam(IS_LEDGER, 'choose ledger to sendtransaction', undefined, types.string, true)
    .addParam(PROXY_ADDR_FLAG, 'proxy contract address', undefined, types.string, false)
    .setAction(async (taskArgs, env) => {
        const {proxyAddr} = taskArgs
        const cname = CONTRACT_NAME.FxBridgeLogic;

        const {wallet} = await env.run(SUB_CHECK_PRIVATEKEY, taskArgs)
        const {abi} = await env.artifacts.readArtifact(cname)
        const data = new env.ethers.utils.Interface(abi).encodeFunctionData('pause')
        const transaction = await env.run(SUB_CREATE_TRASACTION, {data, to: proxyAddr, from: wallet.address})

        const {answer} = await prompt({type: 'confirm', name: 'answer', message: RPOMPT_CHECK_TRANSACTION_DATA})
        if(!answer) return

        console.log(`Star pause...`)
        const {hash} = await env.run(SUB_SEND_TRANSACTION, {transaction, wallet})
        console.log(`Pause execute succefully - ${hash}`)
    })

task(PROXY_UNPAUSE, 'unpause fx bridge to call sendToFx')
    .addParam(DEPLOY_PRIVATE_KEY, '[optional] depoloy private key', undefined, types.string, true)
    .addParam(KEY_STORE_FILE_PATH, 'key Store File Path', undefined, types.string, true)
    .addParam(DRIVER_PATH, 'driver path ', undefined, types.string, true)
    .addParam(IS_LEDGER, 'choose ledger to sendtransaction', undefined, types.string, true)
    .addParam(PROXY_ADDR_FLAG, 'proxy contract address', undefined, types.string, false)
    .setAction(async (taskArgs, env) => {
        const {proxyAddr} = taskArgs
        const cname = CONTRACT_NAME.FxBridgeLogic;

        const {wallet} = await env.run(SUB_CHECK_PRIVATEKEY, taskArgs)
        const {abi} = await env.artifacts.readArtifact(cname)
        const data = new env.ethers.utils.Interface(abi).encodeFunctionData('unpause')

        const transaction = await env.run(SUB_CREATE_TRASACTION, {data, to: proxyAddr, from: wallet.address})

        const {answer} = await prompt({type: 'confirm', name: 'answer', message: RPOMPT_CHECK_TRANSACTION_DATA})
        if(!answer) return

        console.log(`Star unpause...`)
        const {hash} = await env.run(SUB_SEND_TRANSACTION, {transaction, wallet})
        console.log(`Unpause execute succefully - ${hash}`)
    })

task(MINT_FX, 'mint erc20 token')
    .addParam(CONTRACT_ADDR_FLAG, 'contract address', undefined, types.string, false)
    .addParam(RECEIVER_FLAG, 'receiver', undefined, types.string, false)
    .addParam(AMOUNT_FLAG, 'sender contract', undefined, types.string, false)
    .addParam(DEPLOY_PRIVATE_KEY, '[optional] depoloy private key', undefined, types.string, true)
    .addParam(KEY_STORE_FILE_PATH, 'key Store File Path', undefined, types.string, true)
    .addParam(DRIVER_PATH, 'driver path ', undefined, types.string, true)
    .addParam(IS_LEDGER, 'choose ledger to send transaction', undefined, types.string, true)
    .setAction(async (taskArgs,hre) => {
        const cname = CONTRACT_NAME.FunctionX
        const {receiver, contractAddr, amount} = taskArgs;
        const scaleAmount = hre.ethers.utils.parseEther(amount)

        const {wallet} = await hre.run(SUB_CHECK_PRIVATEKEY, taskArgs)

        const {abi} = await hre.artifacts.readArtifact(cname)
        const data = new hre.ethers.utils.Interface(abi)
            .encodeFunctionData('mint', [receiver, scaleAmount])

        const transaction = await hre.run(SUB_CREATE_TRASACTION,
            {data, from: wallet.address, to: contractAddr })

        const {answer} = await prompt({type: 'confirm', name: 'answer', message: RPOMPT_CHECK_TRANSACTION_DATA})
        if(!answer) return

        const contractInst = await hre.ethers.getContractAt(abi, contractAddr, wallet)
        const symbol = await contractInst.symbol()
        console.log(`Start mint ${amount} ${symbol} to ${receiver} from ${contractAddr}`)
        const {hash} = await hre.run(SUB_SEND_TRANSACTION, {transaction, wallet})
        console.log(`MINT successfully at - ${hash}`)

    })

task(SEND_ETH, 'send eth')
    .addParam(DEPLOY_PRIVATE_KEY, '[optional] depoloy private key', undefined, types.string, true)
    .addParam(KEY_STORE_FILE_PATH, 'key Store File Path', undefined, types.string, true)
    .addParam(DRIVER_PATH, 'driver path ', undefined, types.string, true)
    .addParam(IS_LEDGER, 'choose ledger to sendtransaction', undefined, types.string, true)
    .addParam(RECEIVER_FLAG, 'receiver', undefined, types.string, false)
    .addParam(AMOUNT_FLAG, 'amount ', undefined, types.string, false)
    .setAction(async (taskArgs, env) => {
        const {receiver, amount} = taskArgs
        const {wallet} = await env.run(SUB_CHECK_PRIVATEKEY, taskArgs)

        const transaction = await env.run(SUB_CREATE_TRASACTION, {
            to: receiver,
            value: env.ethers.utils.parseEther(amount),
            from: wallet.address
        })

        const {answer} = await prompt({type: 'confirm', name: 'answer', message: RPOMPT_CHECK_TRANSACTION_DATA})
        if(!answer) return

        console.log(`Start send ${amount} eth to ${receiver}`)
        const {hash} = await env.run(SUB_SEND_TRANSACTION, {transaction, wallet})
        console.log(`Execute successfully:  ${hash}`)
    })

task(TRANSFER, 'transfer erc20')
    .addParam(FX_TOKEN_ADDR_FLAG, 'fx token contract address', undefined, types.string, false)
    .addParam(AMOUNT_FLAG, 'amount ', undefined, types.string, false)
    .addParam(RECEIVER_FLAG, 'receiver', undefined, types.string)
    .addParam(DEPLOY_PRIVATE_KEY, '[optional] depoloy private key', undefined, types.string, true)
    .addParam(KEY_STORE_FILE_PATH, 'key Store File Path', undefined, types.string, true)
    .addParam(DRIVER_PATH, 'driver path ', undefined, types.string, true)
    .addParam(IS_LEDGER, 'choose ledger to send transaction', undefined, types.string, true)
    .setAction(async (taskArgs, env) => {
        const {amount, fxTokenAddr, receiver} = taskArgs;

        const cname = CONTRACT_NAME.FunctionX
        const {wallet} = await env.run(SUB_CHECK_PRIVATEKEY, taskArgs);

        const scaleAmout = env.ethers.utils.parseEther(amount);
        const {abi} = await env.artifacts.readArtifact(cname);
        const data = new env.ethers.utils.Interface(abi).encodeFunctionData('transfer', [receiver, scaleAmout])
        const transaction = await env.run(SUB_CREATE_TRASACTION, {data, to: fxTokenAddr, from: wallet.address})

        const {answer} = await prompt({type: 'confirm', name: 'answer', message: RPOMPT_CHECK_TRANSACTION_DATA})
        if(!answer) return

        console.log(`Sart transfer...`)
        const {hash} = await env.run(SUB_SEND_TRANSACTION, {transaction, wallet})
        console.log(`Transfer succefully - ${hash}`);
    })


task(FX_LOGIC_TRAN_OWNER_SHIP, 'fx logic call transferOwnerShip ')
    .addParam(DEPLOY_PRIVATE_KEY, '[optional] depoloy private key', undefined, types.string, true)
    .addParam(KEY_STORE_FILE_PATH, 'key Store File Path', undefined, types.string, true)
    .addParam(DRIVER_PATH, 'driver path ', undefined, types.string, true)
    .addParam(IS_LEDGER, 'choose ledger to send transaction', undefined, types.string, true)
    .addParam(PROXY_ADDR_FLAG, 'proxy contract address', undefined, types.string, false)
    .addParam(OWNER_ADDR_FLAG, 'new owner address', undefined, types.string, false)
    .setAction(async (taskArgs,env) => {
        const {proxyAddr, ownerAddr} = taskArgs

        const cname = CONTRACT_NAME.FxBridgeLogic
        const {wallet} = await env.run(SUB_CHECK_PRIVATEKEY, taskArgs)

        const {abi} = await env.artifacts.readArtifact(cname)
        const data = new env.ethers.utils.Interface(abi)
            .encodeFunctionData('transferOwnership', [ownerAddr])

        const transaction = await env.run(SUB_CREATE_TRASACTION, {data, to: proxyAddr, from: wallet.address})

        const instance = await env.ethers.getContractAt(cname, proxyAddr, wallet)

        const ownerOld = await instance.owner()
        console.log(`Start transferOwnership of fx logic from ${ownerOld} to ${ownerAddr}...`)
        const {hash} = await env.run(SUB_SEND_TRANSACTION, {transaction, wallet})
        console.log(`UpdateFx successfully at - ${hash}`)
    })




task(ADD_BRIDGE_TOKEN, 'addBridgeToken')
    .addParam(DEPLOY_PRIVATE_KEY, '[optional] depoloy private key', undefined, types.string, true)
    .addParam(KEY_STORE_FILE_PATH, 'key Store File Path', undefined, types.string, true)
    .addParam(DRIVER_PATH, 'driver path ', undefined, types.string, true)
    .addParam(IS_LEDGER, 'choose ledger to send transaction', undefined, types.string, true)
    .addParam(CONTRACT_ADDR_FLAG, 'contract address ', undefined, types.string, false)
    .addParam(BRIDGE_TOKEN_ADDR_FLAG, 'bridgeTokenAddr')
    .setAction(async (taskArgs, env) => {

        const {contractAddr, bridgeTokenAddr } = taskArgs

        const cname = CONTRACT_NAME.FxBridgeLogic
        const {wallet} = await env.run(SUB_CHECK_PRIVATEKEY, taskArgs)

        const {abi} = await env.artifacts.readArtifact(cname)
        const data = new env.ethers.utils.Interface(abi).encodeFunctionData('addBridgeToken', [bridgeTokenAddr])
        const transaction = await env.run(SUB_CREATE_TRASACTION, {data, to: contractAddr, from: wallet.address})

        console.log(`Start addBridgeToken...`)
        const {hash} = await env.run(SUB_SEND_TRANSACTION, {transaction, wallet})
        console.log(`AddBridgeToken successfully at- ${hash}`)

    })

task(GET_INIT_DATA, 'get fx node gravityId, vote_power, ethAddresses, powers')
    .addParam(FX_NODE_URL_FLAG, 'fx node url', undefined, types.string, false)
    .setAction(async (taskArgs, env) => {
        await env.run(SUB_GET_INIT_DATA, taskArgs)
    })

task(ENCODE_ABI, 'encode abi')
    .addParam(CNAME_FLAG, 'contract name', undefined, types.string, false)
    .addParam(FUNC_NAME_FLAG, 'contract\'s function name ' , undefined, types.string, false)
    .addParam(IS_GET_INIT_DATA_FLAG, 'if ture will  get init data automatically by subtask' , undefined, types.string, false)
    .setAction(async (taskArgs, env) => {
        const bytes =await env.run(SUB_ENCODE_ABI, taskArgs)
        console.log(bytes);
    })
