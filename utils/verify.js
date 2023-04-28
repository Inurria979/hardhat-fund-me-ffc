const { run } = require("hardhat")

// Deploy the source code of the contract in etherscam
// If we are working with hardhat local network is useless and impossible use it
async function verify(contractAddress, args) {
  console.log("Verifiying our contract")
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (e) {
    if (e.message.toLowerCase().includes("already verify")) {
      console.log("Alredy verify")
    } else {
      console.log(e)
    }
  }
}

module.exports = { verify }
