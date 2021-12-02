# FX-BRIDGE
The fx-bridge contract provides fx-chain top-ups and withdrawals on ethereum.

## Repo Guide

![license](https://img.shields.io/badge/license-MIT-brightgreen)
![version](https://img.shields.io/badge/version-v1.0.0-brightgreen)


### Get Start

```bash
# 1. Fill in the corresponding mnemonic words in the `hardhat.config.ts`
# 2. Enter target file
  cd ./ethbridge/solidity/
  
# 3. Install packages
  npm i
  
# 4. Generate typechain
  npm run typechain
  
# 5. run test case
  npm run test
```

Clean cache:
```bash
npm run clear
```

This project uses [hardhat](https://hardhat.org/) for development and extends it with new task commands, type npx hardhat at the command line to see the supported commands 