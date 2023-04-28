const { mod } = require("@nomicfoundation/ethereumjs-evm/dist/opcodes")

const networkConfig = {
  11155111: {
    name: "sepolia",
    coinUsdPriceFeed: "0x447Fd5eC2D383091C22B8549cb231a3bAD6d3fAf",
  },
  80001: {
    name: "mumbay",
    coinUsdPriceFeed: "0x7bAC85A8a13A4BcD8abb3eB7d6b4d632c5a57676",
  },
  97: {
    name: "BSC",
    coinUsdPriceFeed: "0x833D8Eb16D306ed1FbB5D7A2E019e106B960965A",
  },
}

const developmentChain = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_ANSWER = 200000000
module.exports = {
    networkConfig,
    developmentChain, 
    DECIMALS,
    INITIAL_ANSWER,
}