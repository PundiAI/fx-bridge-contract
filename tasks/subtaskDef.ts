import {subtask, types} from "hardhat/config";
import {
    CNAME_FLAG,
    GET_CONTRACT_ARTIFACTS,
    GET_CONTRACT_FACTORY,
    SUB_ADD_BRIDGE_TOKEN,
    SUB_APPROVE,
    SUB_CHECK_APPROVE,
    SUB_CHECK_ETH_BALANCE,
    SUB_CHECK_OWNER,
    SUB_CHECK_PRIVATEKEY,
    SUB_CREATE_LEDER_WALLET,
    SUB_CREATE_TRASACTION,
    SUB_DEPLOY_CONTRACT,
    SUB_DEPLOY_CONTRACT_WITHOUT_PARAM,
    SUB_ENCODE_ABI,
    SUB_FIX_SIGNATURE,
    SUB_FX_ADDR_TO_HEX,
    SUB_GEN_WALLET,
    SUB_GET_ETH_BALANCE,
    SUB_GET_ETH_NODE_URL,
    SUB_GET_INIT_DATA,
    SUB_GET_OWNER,
    SUB_GET_PRIVATE_FROM_KEY_STORE,
    SUB_GET_PROVIDER,
    SUB_GET_SINGNED_TX,
    SUB_GET_UNSIGNED_TX, SUB_SEND_TRANSACTION,
    SUB_SEND_TRAN_BY_LEDGER, SUB_SEND_TRAN_BY_NORMAL_APPROACH,
    SUB_SIGN_WITH_LEDGER,
    SUB_TRANSFER, SUB_GEN_CONTRACT_ADDR, SUB_DEPLOY_CONTRACT_NEW, DEFAULT_DRIVE_PATH, SUB_FORMAT_TRANSACTION,
} from "./taskName";
import {ethers} from "ethers";
import path from "path";
import {getGravityId, getLatestValset} from "../scripts/server/fxChainClient";
import {HardhatError} from "hardhat/internal/core/errors";
import {ERRORS} from "hardhat/internal/core/errors-list";
import {bech32} from "bech32";
import {LedgerSigner} from "@ethersproject/hardware-wallets";
const {decryptKeyStore} = require('../index')
const {getContractAddress} = require('@ethersproject/address')
const chalk = require('chalk');

subtask(GET_CONTRACT_ARTIFACTS, 'get contract json from artifacts file')
    .addParam(CNAME_FLAG, 'contract name', undefined, types.string, false)
    .setAction(async ({cname}, env) => {
        return await env.artifacts.readArtifact(cname)
    })

subtask(GET_CONTRACT_FACTORY, 'create contract factory')
    .setAction(async (taskArgs,hre) => {
        const {cname} = taskArgs;
        return await hre.ethers.getContractFactory(cname);
    })

subtask(SUB_DEPLOY_CONTRACT_WITHOUT_PARAM, 'deploy contract by contract\'s factory')
    .setAction(async (taskArgs, env) => {
        const {cname} = taskArgs
        const {wallet} = await env.run(SUB_CHECK_PRIVATEKEY, taskArgs)

        console.log(`Start deploy ${cname}`)
        const factory = await env.ethers.getContractFactory(cname, wallet);
        const instance = await factory.deploy()
        await instance.deployed();

        console.log(`${cname} - `, instance.address);
    })

subtask(SUB_DEPLOY_CONTRACT, 'deploy contract by contract\'s factory')
    .setAction(async (taskArgs) => {
        const {factory, cname} = taskArgs;

        console.log(`Start deploy ${cname}...`)
        const contractIns = await factory.deploy();
        await contractIns.deployed();
        console.log(`${cname} - `, contractIns.address);
        return contractIns
    })

subtask(SUB_GET_PRIVATE_FROM_KEY_STORE, 'get private key from key store')
    .setAction(async (taskArgs) => {
        console.log(`Sart get account from keystore...`)
        const {keystorefilepath} = taskArgs;
        const _keyStoreFilePath = path.join(__dirname,keystorefilepath);
        return await decryptKeyStore({
            file: _keyStoreFilePath
        })
    })

subtask(SUB_GET_ETH_NODE_URL, 'get eth node url form hardhat.network')
    .setAction(async (taskArgs, env) => {
        // @ts-ignore
        return env.network.config.url
    })

subtask(SUB_GEN_WALLET, 'generate wallet account')
    .setAction(async (taskArgs, env) => {
        const {_privateKey} = taskArgs
        const nodeUrl = await env.run(SUB_GET_ETH_NODE_URL)
        const provider = await new ethers.providers.JsonRpcProvider(nodeUrl);
        let wallet =  new ethers.Wallet(_privateKey, provider);
        return { provider, wallet}
    })

subtask(SUB_GET_PROVIDER, 'get provider')
    .setAction(async (taskArgs, env) => {
        const nodeUrl = await env.run(SUB_GET_ETH_NODE_URL)
        const provider = await new ethers.providers.JsonRpcProvider(nodeUrl);
        return {provider}
    })

subtask(SUB_GET_SINGNED_TX, 'get signed tx')
    .setAction(async (taskArgs, env) => {
        const {tx, sig} = taskArgs
        return ethers.utils.serializeTransaction(tx, sig)
    })

subtask(SUB_FIX_SIGNATURE,  'fix signature')
    .setAction(async (taskArgs) => {
        const {signature} = taskArgs
        return {
            v: parseInt(signature.v, 16),
            r: '0x' + signature.r,
            s: '0x' + signature.s
        }
    })

subtask(SUB_GET_UNSIGNED_TX, 'get unsigned_tx')
    .setAction(async (taskArgs, env) => {
        const {transaction} = taskArgs

        const tx: any = await env.ethers.utils.resolveProperties(transaction)
        const unsigned_tx = env.ethers.utils.serializeTransaction(tx).substring(2)
        return {unsigned_tx, tx}
    })

subtask(SUB_SIGN_WITH_LEDGER, 'sign transcation using ledger')
    .setAction(async (taskArgs, env) => {
        const {driverPath, unsigned_tx, wallet} = taskArgs
        return await wallet.signTransaction(driverPath, unsigned_tx)
    })

subtask(SUB_CREATE_TRASACTION, 'create transaction')
    .setAction(async (taskArgs, env) => {
        const  {to, from, data, gasLimit, value, gasPrice, nonce} = taskArgs
        const {provider} = await env.run(SUB_GET_PROVIDER)

        let transaction = {
            to: to,
            nonce: nonce ? nonce : await provider.getTransactionCount(from),
            // gasLimit: gasLimit ? gasLimit : env.ethers.BigNumber.from('300000'),
            gasPrice: gasPrice ? env.ethers.BigNumber.from(gasPrice) : await provider.getGasPrice(),
            data: data ? data : '0x',
            value: value ? value : '0x0',
            from: from
        }

        if(!to) delete transaction.to
        // @ts-ignore
        transaction['gasLimit'] = gasLimit ? gasLimit : await provider.estimateGas(transaction)
        // if(!gasLimit) {
        //     // @ts-ignore
        //     transaction['gasLimit'] = await provider.estimateGas(transaction)
        // }

        await env.run(SUB_FORMAT_TRANSACTION, {transaction: {...transaction, to}})

        delete transaction.from

        return transaction
    })

subtask(SUB_SEND_TRAN_BY_LEDGER, 'send transaction by ledger')
    .setAction(async (taskArgs, env) => {
        const {transaction, wallet} = taskArgs

        const nodeUrl = await env.run(SUB_GET_ETH_NODE_URL)
        const provider = await new ethers.providers.JsonRpcProvider(nodeUrl);

        console.log(`Please sign through the ledger...`)
        const signedTx = await wallet.signTransaction(transaction);
        console.log(`Start sendTransaction...`)
        return await provider.sendTransaction(signedTx);
    })

subtask(SUB_SEND_TRAN_BY_NORMAL_APPROACH, 'send transaction by normal approach')
    .setAction(async (taskArgs, env) => {
        const {wallet, transaction} = taskArgs
        await wallet.signTransaction(transaction)
        return wallet.sendTransaction(transaction)
    })

subtask(SUB_CREATE_LEDER_WALLET, 'create ledger wallet')
    .setAction(async (taskArgs, env) => {
        const {driverPath} = taskArgs;
        const nodeUrl = await env.run(SUB_GET_ETH_NODE_URL)
        const provider = await new ethers.providers.JsonRpcProvider(nodeUrl);

        const _path = driverPath ? driverPath : DEFAULT_DRIVE_PATH

        // @ts-ignore
        const wallet = new LedgerSigner(provider, 'hid', _path);
        return {wallet}
    })

subtask(SUB_CHECK_PRIVATEKEY,'check the method of getting private key ')
    .setAction(async (taskArgs, env) => {
        const {keystorefilepath, deployPrivateKey, isLedger, driverPath} = taskArgs;
        let _privateKey: string;

        if(!keystorefilepath && deployPrivateKey && !isLedger) {
            _privateKey = deployPrivateKey
            const {wallet} = await env.run(SUB_GEN_WALLET, {...taskArgs, _privateKey})
            return {wallet}

        }else if(keystorefilepath && !deployPrivateKey && !isLedger){
            _privateKey = await env.run(SUB_GET_PRIVATE_FROM_KEY_STORE, taskArgs)
            const {wallet} = await env.run(SUB_GEN_WALLET, {...taskArgs, _privateKey})
            return {wallet}

        }else if(!keystorefilepath && !deployPrivateKey && isLedger) {
            const {wallet} = await env.run(SUB_CREATE_LEDER_WALLET, {driverPath})
            const address = await wallet.getAddress()
            wallet['address'] = address
            return {wallet}

        } else if(keystorefilepath && deployPrivateKey
            || keystorefilepath && isLedger
            || deployPrivateKey && isLedger
            || keystorefilepath && deployPrivateKey && isLedger) {

            throw new Error(`Too many operation, choose one of wallet approach !`)
        }else {
            const wallet = (await env.ethers.getSigners())[0]
            return {wallet}
        }
    })

subtask(SUB_TRANSFER, 'transfer erc20')
    .setAction(async (taskArgs, hre) => {
    const {amount, deployPrivateKey, ethnodeurl, fxTokenAddr, receiver} = taskArgs;

    const {abi: abi1} = await hre.run(GET_CONTRACT_ARTIFACTS, taskArgs)
    const provider = await new ethers.providers.JsonRpcProvider(ethnodeurl);
    let wallet =  new ethers.Wallet(deployPrivateKey, provider);

    const scaleAmout = hre.ethers.utils.parseEther(amount);

    const instance = new ethers.Contract(fxTokenAddr, abi1, wallet)

    const {hash} = await instance.transfer(receiver, scaleAmout)
    console.log(`Transfer succefully - ${hash}`);
})

subtask(SUB_APPROVE, 'approve spender amount')
    .setAction(async (taskArgs, env) => {
    const {spenderAddr, amount, cname, contractAddr, wallet} = taskArgs;
    const _amount = amount ? amount : env.ethers.BigNumber.from('0x' + 'f'.repeat(64));

    const contractInst = await env.ethers.getContractAt(cname, contractAddr, wallet)
    const {hash} = await contractInst.approve(spenderAddr, _amount.toString())
    console.log(`Approve successfully at - ${hash}`)
  })

subtask(SUB_CHECK_APPROVE, 'check allowance balance')
    .setAction(async (taskArgs) => {
        const {instance, owner, spender} = taskArgs
        const allowance = await instance.allowance(owner, spender)
        if(allowance.toString() === '0') {
            console.log(`from ${owner} to ${spender}:`)
            console.log(`Authorized amount is insufficient : ${allowance.toString()}`)
            return false
        }else {
            return true
        }
    })

subtask(SUB_ADD_BRIDGE_TOKEN, 'call addBridgeToken')
  .setAction(async (taskArgs, env) => {
    const {cname, contractAddr, privateKey, bridgeTokenAddr} = taskArgs;
    // @ts-ignore
    const provider = new env.ethers.providers.JsonRpcProvider(env.network.config['url'])
    const {abi} = await env.artifacts.readArtifact(cname);
    const wallet = new env.ethers.Wallet(privateKey, provider)
    const contractInst = await env.ethers.getContractAt(abi, contractAddr, wallet)

    console.log(`Start addBridgeToken...`)
    const {hash} = await contractInst.addBridgeToken(bridgeTokenAddr)
    console.log(`AddBridgeToken successfully at- ${hash}`)
  })

subtask(SUB_GET_INIT_DATA, 'get fx node gravityId, vote_power, ethAddresses, powers')
    .setAction(async (taskArgs) => {

        const {fxNodeUrl} = taskArgs;

        const gravityIdStr = await getGravityId(fxNodeUrl);
        const gravityId = ethers.utils.formatBytes32String(gravityIdStr);

        console.log("About to get latest Fx Chain valset");
        const latestValset = await getLatestValset(fxNodeUrl);

        let ethAddresses = [];
        let powers = [];
        let powersSum = 0;
        for (let i = 0; i < latestValset.members.length; i++) {
            if (latestValset.members[i].eth_address == null) {
                continue;
            }
            ethAddresses.push(latestValset.members[i].eth_address);
            powers.push(latestValset.members[i].power);
            powersSum += latestValset.members[i].power;
        }


        const vote_power = 2834678415;
        if (powersSum < vote_power) {
            console.log("Refusing to deploy! Incorrect power! Please inspect the validator set below")
            console.log("If less than 66% of the current voting power has unset Ethereum Addresses we refuse to deploy")
            console.log(latestValset)
            process.exit(1);
        }

        console.log(`
            gravityId: ${gravityId}
            vote_power: ${vote_power}
            ethAddresses: ${ethAddresses}
            powers: ${powers}
        `)

        return {gravityId, vote_power,ethAddresses,powers}
    })

subtask(SUB_ENCODE_ABI, 'encode abi')
    .setAction(async (taskArgs, env) => {
        const {cname, functionName} = taskArgs;

        const {gravityId, vote_power, ethAddresses, powers} = await env.run(SUB_GET_INIT_DATA, taskArgs)

        const {abi} = await env.artifacts.readArtifact(cname)
        return new env.ethers.utils.Interface(abi)
            .encodeFunctionData(functionName, [
                gravityId, vote_power, ethAddresses, powers
            ])

    })

subtask(SUB_GET_OWNER, 'get contract owner')
    .setAction(async (taskArgs, env) => {
        const {cname, contractAddr, abi} = taskArgs;

        let instance: any;
        if(cname && !abi) {
            instance = await env.ethers.getContractAt(cname, contractAddr)
        }else if(!cname && abi) {
            instance = await env.ethers.getContractAt(abi, contractAddr)
        }else {
            throw new HardhatError(ERRORS.ARGUMENTS.UNRECOGNIZED_COMMAND_LINE_ARG)
        }

        return await instance.owner()
    })

subtask(SUB_CHECK_OWNER, 'check contract owner is the same as the param owner')
    .setAction(async (taskArgs, env) =>{
        const {cname, contractAddr, checkedAddress, abi} = taskArgs

        const token_owner = await env.run(SUB_GET_OWNER, {cname, abi, contractAddr});

        if(checkedAddress !== token_owner) {
            console.log(`
                ${checkedAddress} is not the contract owner!
                ${contractAddr} owner is ${token_owner} now!
            `);
            return false
        }else {
            return true
        }
    })

subtask(SUB_GET_ETH_BALANCE, 'get eth balance')
    .setAction(async (taskArgs) => {
        const {wallet} = taskArgs;
        return await wallet.getBalance();
    })

subtask(SUB_CHECK_ETH_BALANCE, 'check eth balance')
    .setAction(async (taskArgs, env) => {
        const {wallet} = taskArgs
        const eth_balance = env.run(SUB_GET_ETH_BALANCE, {wallet})
        if(eth_balance.toString() === '0') {
            console.log(`${wallet.address} eth balance is insufficient`);
            return false
        }else {
            return eth_balance.toString()
        }
    })

subtask(SUB_FX_ADDR_TO_HEX,'fx address to hex')
    .setAction(async (taskArgs) => {
        const {fxAddr} = taskArgs

        const fxAddrBtc = bech32.fromWords(bech32.decode(fxAddr).words);
        const fxAddrBtcHex = Buffer.from(fxAddrBtc).toString('hex');
        return ( '0x'+'0'.repeat(24) + fxAddrBtcHex).toString();
    })

subtask(SUB_SEND_TRANSACTION, 'verify should send transaction through which type')
    .setAction(async (taskArgs, env) => {
        const {wallet, transaction} = taskArgs

        // ledger
        if(wallet?.path && wallet?.type) {
            return await env.run(SUB_SEND_TRAN_BY_LEDGER, { transaction, wallet})

        // keystore | privateKey | default account from hardhat.config.ts
        }else {
            return await env.run(SUB_SEND_TRAN_BY_NORMAL_APPROACH, {transaction, wallet})
        }
    })

subtask(SUB_GEN_CONTRACT_ADDR, 'generate contract address')
    .setAction(async (taskArgs, env) => {
        const {account} = taskArgs

        const {provider} = await env.run(SUB_GET_PROVIDER)
        const nonce = await provider.getTransactionCount(account)
        return getContractAddress({
            from: account,
            nonce: nonce
        })
    })

subtask(SUB_DEPLOY_CONTRACT_NEW, 'deploy contract new ')
    .setAction(async (taskArgs, env) => {
        const {cname, contractAddr, wallet, data, gasLimit} = taskArgs

        const transaction = await env.run(SUB_CREATE_TRASACTION, { data, from: wallet.address, gasLimit})

        console.log(`Start delploy ${cname}...`)
        const {hash} = await env.run(SUB_SEND_TRANSACTION, { transaction, wallet })
        console.log(`Execuete succefully at - ${hash}`)
        console.log(`${cname} - ${contractAddr}`)
    })

subtask(SUB_FORMAT_TRANSACTION, 'formate transaction')
    .setAction(async (taskArgs, env) => {
        const {transaction} = taskArgs
        console.log(chalk.green(`
    {
        nonce: ${transaction?.nonce}
        gasLimit:: ${transaction?.gasLimit?.toString()}
        gasPrice: ${transaction?.gasPrice?.toString()}
        data: ${transaction?.data}
        value: ${transaction.value}
        from: ${transaction.from}
        to: ${transaction.to}
    }`))
})
