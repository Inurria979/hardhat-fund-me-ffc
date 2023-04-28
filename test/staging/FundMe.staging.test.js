const { getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChain } = require("../../helper-hardhat-config")
const { assert } = require("chai")

//If we are in a developmentChain, skip the describe,
//stagging test only run in testnet
developmentChain.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe
      let deployer
      const sendValue = ethers.utils.parseEther("1.0")
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract("FundMe", deployer)
      })
      it("allows people to fund and withdraw",  async () => {
        await fundMe.fund({ value: sendValue })
        await fundMe.withdraw()
        const endingFundMeBalance = fundMe.provider.getBalance(fundMe.address)
        assert.equal(endingFundMeBalance.toString(), "0")
      })
    })
