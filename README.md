# FX-BRIDGE
The fx-bridge contract provides fx-chain top-ups and withdrawals on ethereum.

## Repo Guide

![license](https://img.shields.io/badge/license-MIT-brightgreen)
![version](https://img.shields.io/badge/version-v1.0.0-brightgreen)


### Get Start
```bash
# 1. Enter target file
  cd ./ethbridge/solidity/
  
# 2. Install packages
  npm i
  
# 3. Generate typechain
  npm run typechain
  
# 4. run test case
  npm run test
```
⚠️ Make sure to use `package-lock.json` from the repository, otherwise it may cause the test case to fail

Clean cache:
```bash
  npm run clear
```

This project uses [hardhat](https://hardhat.org/) for development and extends it with new task commands, type npx hardhat at the command line to see the supported commands as follow:
```bash
npx hardhat
```
```bash
Hardhat version 2.3.0

Usage: hardhat [GLOBAL OPTIONS] <TASK> [TASK OPTIONS]

GLOBAL OPTIONS:

  --config              A Hardhat config file. 
  --emoji               Use emoji in messages. 
  --help                Shows this message, or a task's help if its name is provided 
  --max-memory          The maximum amount of memory that Hardhat can use. 
  --network             The network to connect to. 
  --show-stack-traces   Show stack traces. 
  --tsconfig            Reserved hardhat argument -- Has no effect. 
  --verbose             Enables Hardhat verbose logging 
  --version             Shows hardhat's version. 

Deploy the fxbridge logic contract

AVAILABLE TASKS:

  add-bridge-token              addBridgeToken
  approve-fx                    fx contract approve
  burn-fx                       burn fx token
  change-proxy-admin            change proxy admin
  check                         Check whatever you need
  clean                         Clears the cache and deletes all artifacts
  compile                       Compiles the entire project, building all artifacts
  console                       Opens a hardhat console
  deploy-fx                     deploy fx token
  deploy-fx-bridge-logic        deploy fx bridge logic
  deploy-fx-faucet              deploy fx token faucet
  deploy-proxy                  deploy fxbridge proxy
  encode-abi                    encode abi
  flatten                       Flattens and prints contracts and their dependencies
  fx-bridge-tran-owner          change ${contract}'s owner from  fx bridge to another address
  fx-tran-owner                 change fx token owner
  get-init-data                 get fx node gravityId, vote_power, ethAddresses, powers
  help                          Prints this message
  mint-fx                       mint erc20 token
  node                          Starts a JSON-RPC server on top of Hardhat Network
  run                           Runs a user-defined script after compiling the project
  send-to-fx                    call sendToFx()
  set-fx-originated-token       call set-fx-originated-token() 
  test                          Runs mocha tests
  transfer                      transfer erc20
  typechain                     Generate Typechain typings for compiled contracts
  update-fx                     call fxfaucet updateFx()
  update-logic                  update logic contract
  upgrade-to-and-Call           call updateToAndCall()
  verify                        Verifies contract on Etherscan

To get help for a specific task run: npx hardhat help [task]

```bash
npx hardhat deploy-fx --network localhost
```
These are just some of the common commands.


### fx-bridge contract API
View the ethbridge/solidity/contracts/FxBridgeLogic.sol file

To run a node locally, you can deploy fx-bridge contracts, deploy fx token contracts, etc. with the following common commands:

Run the local node. If you haven't installed hardhat yet please check [Get Start]()
```bash
    npx hardhat run
```
Try the command as below, 

Deploy fx token test contracts

```bash
npx hardhat deploy-fx --network localhost
```

Deploy fx token faucet test contract

```bash
npx hardhat deploy-fx-faucet --network localhost
```

Faucet associated fxtoken contract address

```bash
npx hardhat update-fx \
    --fx-faucet-addr '...' \
    --fx-token-addr '...' \
    --network localhost
```

Mint 100000000 fxtoken to fx faucet address

```bash
npx hardhat mint-fx \
    --amount '...' \
    --contract-addr 'fx token address' \
    --keystorefilepath '...' \
    --receiver '...' \
    --network localhost
```

Deploy the fxbridge logic contract

```bash
npx hardhat deploy-fx-bridge-logic --network localhost
```

Deploying the fxbridge proxy contract

```bash
npx hardhat deploy-proxy \
    --logic-contract-addr '...' \
    --network localhost \
    --proxy-admin-addr '...'
```

call updatetoadncall() to init proxy contract
```bash
npx hardhat upgrade-to-and-Call --fx-node-url '...' \
    --function-name 'init' \
    --contract-addr 'proxy contract address' \
    --logic-contract-addr '...' \
    --network localhost
```

change proxy contract admin
```bash
npx hardhat change-proxy-admin --contract-addr '...' \
    --proxy-admin-addr '...' \
    --network localhost
```

setFxOriginatedToken
```bash
npx hardhat set-fx-originated-token \
    --contract-addr 'proxy contract address' \
    --fx-token-addr '...' \
    --network localhost
```

transfer fxtoken owner from fxtoken contract owner to proxy contract address
```bash
npx hardhat fx-tran-owner \
    --fx-token-addr '...' \
    --owner-addr '...' \
    --network kovan
```
These are just some of the common commands.



