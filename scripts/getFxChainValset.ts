import commandLineArgs from "command-line-args";
import {getValsets} from "./server/fxChainClient";

const args = commandLineArgs([
    
    {name: "block", type: Number},
    
    {name: "fx-node", type: String},
]);

async function main() {
    const valsets = await getValsets(args["fx-node"], args["block"]);
    console.log(JSON.stringify(valsets, undefined, 2));
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
