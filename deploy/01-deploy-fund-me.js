const { network } = require("hardhat")
const { networkConfig, developmentChain } = require("../helper-hardhat-config")
const verify = require("../utils/verify")
const SEPOLIA = "sepolia"

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  //if chain id is x use address x if chaiid id y use y
  //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
  
  let coinUsdPriceFeedAddress
  if (developmentChain.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator")
    coinUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    coinUsdPriceFeedAddress = networkConfig[chainId]["coinUsdPriceFeed"]
  }
  //what happends qhen we cant to chainge chains?
  //when going for localhost or hardhat network we want to use a mock
  const args = [coinUsdPriceFeedAddress]
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations ,
  })

  //Para verificar en otras redes que no sea la de sepolia deberiamos de usar otra API_KEY
  if (
    network.name == SEPOLIA &&
    process.env.ETHERSCAM_API_KEY
  ) {
    await verify.verify(fundMe.address, args)
  }else{
    console.log("There are not an API to verify the code")
  }

  log("------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
