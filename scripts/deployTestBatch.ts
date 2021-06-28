import {TestBatch} from "../typechain";
import {ethers} from "hardhat";



async function main() {
    const testBatchFactory = await ethers.getContractFactory('TestBatch');
    const Batch = await testBatchFactory.deploy() as TestBatch;
    await Batch.deployed();
    console.log("Deploy TestBatch contract address:", Batch.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

