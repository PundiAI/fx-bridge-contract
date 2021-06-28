import axios from "axios";

type Validator = {
    power: number;
    eth_address: string;
};
type ValsetTypeWrapper = {
    type: string;
    value: Valset;
}
type Valset = {
    members: Validator[];
    nonce: number;
};
type ABCIWrapper = {
    jsonrpc: string;
    id: string;
    result: ABCIResponse;
};
type ABCIResponse = {
    response: ABCIResult
}
type ABCIResult = {
    code: number
    log: string,
    info: string,
    index: string,
    value: string,
    height: string,
    codespace: string,
};
type StatusWrapper = {
    jsonrpc: string,
    id: string,
    result: NodeStatus
};
type NodeInfo = {
    protocol_version: JSON,
    id: string,
    listen_addr: string,
    network: string,
    version: string,
    channels: string,
    moniker: string,
    other: JSON,
};
type SyncInfo = {
    latest_block_hash: string,
    latest_app_hash: string,
    latest_block_height: Number
    latest_block_time: string,
    earliest_block_hash: string,
    earliest_app_hash: string,
    earliest_block_height: Number,
    earliest_block_time: string,
    catching_up: boolean,
}
type NodeStatus = {
    node_info: NodeInfo,
    sync_info: SyncInfo,
    validator_info: JSON,
};

const decode = (str: string): string => Buffer.from(str, 'base64').toString('binary');

export async function getLatestValset(nodeRPC: String): Promise<Valset> {
    let block_height_request_string = nodeRPC + '/status';
    let block_height_response = await axios.get(block_height_request_string);
    let info: StatusWrapper = await block_height_response.data;
    let block_height = info.result.sync_info.latest_block_height;
    if (info.result.sync_info.catching_up) {
        console.log("This node is still syncing! You can not deploy using this validator set!");
        process.exit(1);
    }
    let request_string = nodeRPC + "/abci_query"
    let response = await axios.get(request_string, {
        params: {
            path: "\"/custom/gravity/currentValset/\"",
            height: block_height,
            prove: "false",
        }
    });
    let valsets: ABCIWrapper = await response.data;
    
    let valset: ValsetTypeWrapper = JSON.parse(decode(valsets.result.response.value))
    return valset.value;
}

export async function getGravityId(nodeRPC: String): Promise<string> {
    let block_height_request_string = nodeRPC + '/status';
    let block_height_response = await axios.get(block_height_request_string);
    let info: StatusWrapper = await block_height_response.data;
    let block_height = info.result.sync_info.latest_block_height;
    if (info.result.sync_info.catching_up) {
        console.log("This node is still syncing! You can not deploy using this gravityID!");
        process.exit(1);
    }
    let request_string = nodeRPC + "/abci_query"
    let response = await axios.get(request_string, {
        params: {
            path: "\"/custom/gravity/gravityID/\"",
            height: block_height,
            prove: "false",
        }
    });
    let gravityIDABCIResponse: ABCIWrapper = await response.data;
    return JSON.parse(decode(gravityIDABCIResponse.result.response.value));
}

export async function getValsets(nodeRPC: String, blockHeight: Number): Promise<Valset> {
    let request_string = nodeRPC + "/abci_query"
    let response = await axios.get(request_string, {
        params: {
            path: "\"/custom/gravity/currentValset/\"",
            height: blockHeight,
            prove: "false",
        }
    });
    let valsets: ABCIWrapper = await response.data;
    
    let valset: ValsetTypeWrapper = JSON.parse(decode(valsets.result.response.value))
    return valset.value;
}
