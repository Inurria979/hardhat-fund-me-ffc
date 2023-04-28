const { version } = require("os")

require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia"
const MUMBAY_RPC_URL = process.env.MUMBAY_RPC_URL
const BSC_RPC_URL = process.env.BSC_RPC_URL

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey"
const ETHERSCAM_API_KEY = process.env.ETHERSCAM_API_KEY || "API_KEY"
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "API_KEY"
/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.6.6",
      },
      {
        version: "0.8.8",
        settings: {},
      },
    ],
  },

  defaultNetwork: "hardhat", //don't need to be specify
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 6, // Esperar bloques en esta red
    },
    mumbay: {
      url: MUMBAY_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 80001,
      blockConfirmations: 6,
    },
    bsc: {
      url: BSC_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 97,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      //acounts are give by hardhat
      chainId: 31337,
    },
  },
  //That is for validate (publish) the source code
  etherscan: {
    apiKey: ETHERSCAM_API_KEY,
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "ETH"
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    },
  },
}
