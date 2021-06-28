import fs from "fs";
import commandLineArgs from "command-line-args";

const args = commandLineArgs([
    {name: "contract", type: String},
]);

async function main() {
    const contractPath = "artifacts/contracts/" + args["contract"] + ".json";
    const split = args["contract"].split("/")
    const {bytecode, abi} = JSON.parse(fs.readFileSync(contractPath, "utf8").toString());

    if (!fs.existsSync("artifacts/abi")) {
        fs.mkdirSync("artifacts/abi")
    }
    if (!fs.existsSync("artifacts/bin")) {
        fs.mkdirSync("artifacts/bin")
    }
    const contractABI = "artifacts/abi/" + split[split.length-1] + ".abi";
    const contractBIN = "artifacts/bin/" + split[split.length-1] + ".bin";
    fs.writeFileSync(contractABI, JSON.stringify(abi))
    fs.writeFileSync(contractBIN, bytecode)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.info("Use: npx ts-node scripts/abigen.ts --contract FxBridgeLogic.sol/FxBridgeLogic")
        console.error(error);
        process.exit(1);
    });
