import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import "hardhat-typechain";
import "@nomiclabs/hardhat-etherscan";
import '@openzeppelin/hardhat-upgrades';
import "solidity-coverage"

import './tasks/taskDef';
import './tasks/subtaskDef';

const HARDHAT_NETWORK_MNEMONIC = "forget dust clip cluster fitness rigid inflict double sand grain ahead orbit";
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
            }
        ],
    },
    networks: {
        hardhat: {
            timeout: 2000000,
            // forking:{
            //   url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_ID}`,
            //   blockNumber: 11780000, //Pin random block
            // },
            accounts: defaultHardhatNetworkHdAccountsConfigParams
        },
        kovan: {
            url: "https://kovan.infura.io/v3/{id}",
            accounts: defaultHardhatNetworkHdAccountsConfigParams
        },
        ropsten: {
            url: "https://ropsten.infura.io/v3/{id}",
            accounts: [],
        },
        mainnet: {
            url: "https://mainnet.infura.io/v3/{id}",
            accounts: []
        },
        bsc_testnet: {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545",
            chainId: 97,
            gasPrice: 20000000000
        },
        bsc_mainnet: {
            url: "https://bsc-dataseed.binance.org/",
            chainId: 56,
            gasPrice: 20000000000
        }
    },
    typechain: {
        outDir: "typechain",
        target: "ethers-v5",
        runOnCompile: true
    },
    gasReporter: {
        enabled: true,
        currency: 'CNY'
    },
    mocha: {
        timeout: 2000000,
    },
    paths: {
      tests: './test/case/'
    },
    etherscan: {
        // Your API key for Etherscan
        // Obtain one at https://etherscan.io/
    }
};
