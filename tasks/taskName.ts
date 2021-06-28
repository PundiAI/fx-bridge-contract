/** task name **/
export const DEPLOY_PROXY: string = 'deploy-proxy'
export const DEPLOY_FX: string = 'deploy-fx'
export const DEPLOY_FX_FAUCET: string = 'deploy-fx-faucet'
export const DEPLOY_FX_BRIDGE_LOGIC: string = 'deploy-fx-bridge-logic'
export const UPDATE_FX: string  = 'update-fx' // warning:  don't use camelcase
export const MINT_FX: string  = 'mint-fx'
export const APPROVE_FX: string  = 'approve-fx'
export const Allowance: string  = 'allowance'
export const TRANSFER: string  = 'transfer'
export const ADD_BRIDGE_TOKEN: string  = 'add-bridge-token'
export const GET_INIT_DATA: string  = 'get-init-data'
export const ENCODE_ABI: string  = 'encode-abi'
export const UPDATE_TO_ADN_CALL: string  = 'upgrade-to-and-Call'
export const CHANGE_PROXY_ADMIN: string  = 'change-proxy-admin'
export const SET_FX_ORIGIN_TOKEN: string  = 'set-fx-originated-token'
export const FX_TRANSFER_OWNER: string  = 'fx-tran-owner'
export const FX_BRIDGE_TRANSFER_OWNER: string  = 'fx-bridge-tran-owner'
export const SEND_TO_FX: string  = 'send-to-fx'
export const UPDATE_LOGIC: string  = 'update-logic'
export const BURN_FX: string  = 'burn-fx'
export const PROXY_PAUSE: string  = 'proxy-pause'
export const PROXY_UNPAUSE: string  = 'proxy-unpause'
export const LEDGER: string  = 'ledger'
export const TEST_SIGN: string  = 'test-sign'
export const SEND_ETH: string  = 'send-eth'
export const FX_LOGIC_TRAN_OWNER_SHIP: string  = 'fx-logic-transfer-owner-ship'

/**
 * sub task name
 **/
export const GET_CONTRACT_FACTORY: string  = 'get_contract_factory'
export const GET_CONTRACT_ARTIFACTS: string  = 'get_contract_artifacts'
export const SUB_DEPLOY_CONTRACT_WITHOUT_PARAM: string  = 'deploy_contract'
export const SUB_APPROVE: string  = 'sub:approve'
export const SUB_CHECK_APPROVE: string  = 'sub:check_approve'
export const SUB_TRANSFER: string  = 'sub:transfer'
export const SUB_ADD_BRIDGE_TOKEN: string  = 'sub:add-bridge-token'
export const SUB_GET_PRIVATE_FROM_KEY_STORE: string  = 'sub:get-private-key-from-key-store'
export const SUB_GET_INIT_DATA: string  = 'sub:get-init-data'
export const SUB_ENCODE_ABI: string  = 'sub:encode-abi'
export const SUB_GEN_WALLET: string  = 'sub:generate-wallet'
export const SUB_DEPLOY_CONTRACT: string  = 'sub:deploy-contract'
export const SUB_GET_ETH_NODE_URL: string  = 'sub:get-eth-node-url'
export const SUB_CHECK_PRIVATEKEY: string  = 'sub:check-privatekey'
export const SUB_GET_OWNER: string  = 'sub:get-owner'
export const SUB_CHECK_OWNER: string  = 'sub:check-owner'
export const SUB_GET_ETH_BALANCE: string  = 'sub:get-eth-balance'
export const SUB_CHECK_ETH_BALANCE: string  = 'sub:check-eth-balance'
export const SUB_FX_ADDR_TO_HEX: string  = 'sub:fx-addr-to-hex'
export const SUB_GET_PROVIDER: string  = 'sub:get-provider'
export const SUB_GET_SINGNED_TX: string  = 'sub:get-signed-tx'
export const SUB_FIX_SIGNATURE: string  = 'sub:fx-signature'
export const SUB_GET_UNSIGNED_TX: string  = 'sub:get-unsigned-tx'
export const SUB_SIGN_WITH_LEDGER: string  = 'sub:sign-with-ledger'
export const SUB_CREATE_TRASACTION: string  = 'sub:create-transaction'
export const SUB_CREATE_LEDER_WALLET: string  = 'sub:create-ledger-wallet'
export const SUB_SEND_TRAN_BY_LEDGER: string  = 'sub:send-transaction-by-ledger'
export const SUB_SEND_TRAN_BY_NORMAL_APPROACH: string  = 'sub:send-transaction-by-normal-approach'
export const SUB_SEND_TRANSACTION: string  = 'sub:send-transaction'
export const SUB_GEN_CONTRACT_ADDR: string  = 'sub:generate-contract-address'
export const SUB_DEPLOY_CONTRACT_NEW: string  = 'sub:deploy-contract-new'
export const SUB_FORMAT_TRANSACTION: string  = 'sub:format-transaction'


/**
 * flag name
 * warning: Param names must be camelCase
 **/
export const CNAME_FLAG: string  = 'cname' // contract name
export const FX_TOKEN_ADDR_FLAG: string  = 'fxTokenAddr'
export const FX_FAUCET_ADDR_FLAG: string  = 'fxFaucetAddr'
export const RECEIVER_FLAG: string = 'receiver'
export const AMOUNT_FLAG: string = 'amount'
export const CONTRACT_ADDR_FLAG: string = 'contractAddr'
export const SPENDER_ADDR_FLAG: string = 'spenderAddr'
export const KEY_STORE_FILE_PATH: string = 'keystorefilepath'
export const ETH_NODE_URL: string = 'ethnodeurl'
export const BRIDGE_TOKEN_ADDR_FLAG: string = 'bridgeTokenAddr'
export const LOGIC_CONTRACT_ADDR_FLAG: string = 'logicContractAddr'
export const PROXY_ADMIN_ADDR_FLAG: string = 'proxyAdminAddr'
export const PROXY_INIT_BYTE_FLAG: string = 'proxyInitData'
export const PROXY_ADDR_FLAG: string = 'proxyAddr'
export const FX_NODE_URL_FLAG: string = 'fxNodeUrl'
export const FUNC_NAME_FLAG: string = 'functionName'
export const IS_GET_INIT_DATA_FLAG: string = 'isGetInitData'
export const DEPLOY_PRIVATE_KEY: string = 'deployPrivateKey'
export const OWNER_ADDR_FLAG: string = 'ownerAddr'
export const DESTINATION_ADDR_FLAG: string = 'destinationAddr'
export const IBC_FLAG: string = 'ibc'
export const IS_LEDGER: string = 'isLedger'
export const DRIVER_PATH: string = 'driverPath'


/**
 * constant variable
 */

export const CONTRACT_NAME =  {
    'FxBridgeLogic': 'FxBridgeLogic',
    'TransparentUpgradeableProxy': 'TransparentUpgradeableProxy',
    'FunctionX': 'FunctionX',
    'TestFxFaucet': 'TestFxFaucet'
}

export const DEFAULT_DRIVE_PATH = "44'/60'/0'/0/0"
export const RPOMPT_CHECK_TRANSACTION_DATA = 'Do you want continue?'