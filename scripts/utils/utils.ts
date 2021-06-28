import {ethers} from "ethers";
import fs from "fs";
import {getGravityId, getLatestValset} from "../server/fxChainClient";

const lodash = require('lodash');

export async function getSignerAddresses(signers: ethers.Signer[]) {
    return await Promise.all(signers.map(signer => signer.getAddress()));
}

export function makeCheckpoint(validators: string[], powers: ethers.BigNumberish[], valsetNonce: ethers.BigNumberish, gravityId: string) {
    const methodName = ethers.utils.formatBytes32String("checkpoint");
    let abiEncoded = ethers.utils.defaultAbiCoder.encode(
        ["bytes32", "bytes32", "uint256", "address[]", "uint256[]"],
        [gravityId, methodName, valsetNonce, validators, powers]
    );
    return ethers.utils.keccak256(abiEncoded);
}

export function makeTxBatchHash(amounts: number[], destinations: string[], fees: number[], nonces: number[], gravityId: string) {
    const methodName = ethers.utils.formatBytes32String("transactionBatch");
    let abiEncoded = ethers.utils.defaultAbiCoder.encode(
        ["bytes32", "bytes32", "uint256[]", "address[]", "uint256[]", "uint256[]"],
        [gravityId, methodName, amounts, destinations, fees, nonces]
    );
    return ethers.utils.keccak256(abiEncoded);
}

export function makeTxBatchHash_new(
    gravityId: string, amounts: number[], destinations: string[], fees: any[],
    batchNonce: number | string, _contractAddr: string, batchTimeout: number | string, reciver: string) {
    let methodName = ethers.utils.formatBytes32String("transactionBatch");

    return ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
            ["bytes32", "bytes32", "uint256[]", "address[]", "uint256[]", "uint256", "address", "uint256", "address"],
            [gravityId, methodName, amounts, destinations, fees, batchNonce, _contractAddr, batchTimeout, reciver]
        )
    );
}

export async function signHashWithReachPower(validators: ethers.Signer[], hash: string, signers: ethers.Signer[]) {
    let v: number[] = [];
    let r: string[] = [];
    let s: string[] = [];

    for (let i = 0; i < signers.length; i = i + 1) {

        const address = await signers[i].getAddress();
        // @ts-ignore
        const filterRes = lodash.filter(validators, ({validator}) => validator === address)

        if (filterRes.length > 0) {
            const sig = await signers[i].signMessage(ethers.utils.arrayify(hash));

            const splitSig = ethers.utils.splitSignature(sig);
            v.push(splitSig.v!);
            r.push(splitSig.r);
            s.push(splitSig.s);
        } else {
            v.push(0);
            r.push('0x0000000000000000000000000000000000000000000000000000000000000000');
            s.push('0x0000000000000000000000000000000000000000000000000000000000000000');
        }

    }
    return {v, r, s};
}

export async function signHash(signers: ethers.Signer[], hash: string) {
    let v: number[] = [];
    let r: string[] = [];
    let s: string[] = [];

    for (let i = 0; i < signers.length; i = i + 1) {
        const sig = await signers[i].signMessage(ethers.utils.arrayify(hash));

        const splitSig = ethers.utils.splitSignature(sig);
        v.push(splitSig.v!);
        r.push(splitSig.r);
        s.push(splitSig.s);
    }
    return {v, r, s};
}

export function randPowerGenerator(n: number, sum: number) {
    let _randArr = []
    let _randTotal = 0
    let powers = [];
    let _powerTotal = 0
    for (let i = 0; i < n; i++) {
        const power = Math.ceil(Math.random() * (sum / 2 - 1) + 1)
        _randTotal += power;
        _randArr.push(power)
    }

    for (let i = 0; i < _randArr.length - 1; i++) {
        const result = Math.ceil((_randArr[i] / _randTotal * sum) + 0.5)
        _powerTotal += result
        powers.push(result)
    }

    let subNum = sum - _powerTotal;
    if (subNum === 0) {
        const index = powers.findIndex(v => v > 1)
        powers[index] = powers[index] - 1;
        powers.push(1)
    } else if (subNum < 0) {
        const index = powers.findIndex(v => v > subNum + 1)
        powers[index] = powers[index] - subNum;
        powers.push(1)
    } else if (subNum > 0) {
        powers.push(subNum)
    }

    return powers
}

export function calcPowerThreshold(powers: number[]): number {
    let total = 0;
    powers.forEach(v => {
        total += v
    })

    return Math.ceil(total * 0.66);
}

export function getContractArtifacts(path: string): { bytecode: string; abi: string } {
    const {bytecode, abi} = JSON.parse(fs.readFileSync(path, "utf8").toString());
    return {bytecode, abi};
}

export function generateAccount(accountNum: string | number): Array<any> {
    const etherMnemonic = 'forget dust clip cluster fitness rigid inflict double sand grain ahead orbit'; 
    const etherHdnode = ethers.utils.HDNode.fromMnemonic(etherMnemonic);

    console.log(`Start ${accountNum} generate new account... `)
    const hdnodes = []
    for (let i = 1; i <= accountNum; i++) {
        const _hdnode = etherHdnode.derivePath("m/44'/60'/0'/" + i);
        hdnodes.push(_hdnode);

        console.log(`account ${i} - ${_hdnode.address}: ${_hdnode.privateKey}`);
    }

    console.log(`Generating ${accountNum} new account successfully`)

    return hdnodes;
}

export async function getInitData(args: any) {
    const privatekey = args["eth-deploy"];
    const ethAccount = args["eth-admin"]

    const provider = await new ethers.providers.JsonRpcProvider(args["eth-node"]);
    let wallet = privatekey && new ethers.Wallet(privatekey, provider);
    let normalWallet = ethAccount && new ethers.Wallet(ethAccount, provider);

    const gravityIdStr = await getGravityId(args["fx-node"]);
    const gravityId = ethers.utils.formatBytes32String(gravityIdStr);

    console.log("About to get latest Fx Chain valset");
    const latestValset = await getLatestValset(args["fx-node"]);


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

    return {gravityId, vote_power,ethAddresses,powers, wallet, normalWallet}
}
