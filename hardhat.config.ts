import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-etherscan";
import '@openzeppelin/hardhat-upgrades';
import "solidity-coverage";
import "hardhat-spdx-license-identifier";
import "hardhat-tracer";
import "hardhat-docgen";
require("hardhat-log-remover");
import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'


import './tasks/taskDef';
import './tasks/subtaskDef';

const HARDHAT_NETWORK_MNEMONIC = "<YOUR MNEMONIC>";
const DEFAULT_HARDHAT_NETWORK_BALANCE = "10000000000000000000000";
const defaultHdAccountsConfigParams = {
    initialIndex: 0,
    count: 100,
    path: "m/44'/60'/0'/0",
};

const defaultHardhatNetworkHdAccountsConfigParams = {
    ...defaultHdAccountsConfigParams,
    mnemonic: HARDHAT_NETWORK_MNEMONIC,
    accountsBalance: DEFAULT_HARDHAT_NETWORK_BALANCE,
};


// You have to export an object to set up your config
// This object can have the following optional entries:
// defaultNetwork, networks, solc, and paths.
// Go to https://buidler.dev/config/ to learn more
module.exports = {
    // This is a sample solc configuration that specifies which version of solc to use
    solidity: {
        compilers:[
            {
                version: "0.6.6",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                        details: {
                            yul: true,
                            yulDetails: {
                                stackAllocation: true,
                            }
                        }
                    }
                }
            },
            {
                version: "0.7.6",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            },
            {
                version: "0.8.2",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            },
            {
                version: "0.8.0",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            },
            {
                version: "0.4.13",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            },
            {
                version: "0.5.16",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            }
        ],
    },
    networks: {
        hardhat: {
            accounts: defaultHardhatNetworkHdAccountsConfigParams
        },
        matic_testnet: {
            url: "<YOUR JSON-RPC URL>",
            chainId: 80001,
        },
    },
    typechain: {
        outDir: "typechain",
        target: "ethers-v5",
        runOnCompile: true
    },
    gasReporter: {
        enabled: false
    },
    mocha: {
        timeout: 2000000,
    },
    paths: {
      tests: './test/case/'
    },
    etherscan: {
        apiKey: "Your API key" // polygon

    },
    spdxLicenseIdentifier: {
        overwrite: true,
        runOnCompile: true,
    },
    docgen: {
        path: './docs/contracts',
        clear: true,
        runOnCompile: false,
        except: ['^contracts/interfaces', '^contracts/Proxy', '^contracts/test']
    }
};
