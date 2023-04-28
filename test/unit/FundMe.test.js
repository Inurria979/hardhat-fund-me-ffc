const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChain } = require("../../helper-hardhat-config")

//Unit test only run in developmetn chain
!developmentChain.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe
      let deployer
      let mockV3Aggregator
      const sendValue = ethers.utils.parseEther("50.0") // 1ETH

      this.beforeEach(async function () {
        //deploy our FundMe contract
        //using hardhat-deploy
        // const accounts = await ethers.getSigner()
        // const accountZero = accounts[0]
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        )
      })
      describe("constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
          const response = await fundMe.getPriceFeed()
          assert.equal(response, mockV3Aggregator.address)
        })
      })
      describe("fund", async function () {
        it("fails if u dont send enough eth", async function () {
          await expect(fundMe.fund()).to.be.revertedWithCustomError(
            fundMe,
            "FundMe__NotEnoughEth"
          )
        })
        it("Make zero the amount", async function () {
          fundMe.fund_to_zero()
          const response = await fundMe.getAddressToAmountFunded(deployer)
          assert.equal(response, 0)
        })
        it("update the amount funded data structure", async function () {
          // Looks like the initial balance is not zero, is that: 5-000-000-000-000-000-000-000
          // We make it zero
          fundMe.fund_to_zero()
          await fundMe.fund({ value: sendValue })
          const response = await fundMe.getAddressToAmountFunded(deployer)
          assert.equal(response.toString(), sendValue.toString())
        })
        it("Add getFunder to array of getFunder", async function () {
          await fundMe.fund({ value: sendValue })
          const getFunder = await fundMe.getFunder(0)
          assert.equal(getFunder, deployer)
        })
      })
      describe("withdraw", async () => {
        this.beforeEach(async () => {
          await fundMe.fund({ value: sendValue })
        })
        it("Withdraw ETH from a single founder", async () => {
          //Arrange
          const startingFunMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          //Act
          const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = transactionReceipt //get 2 objets (bigNumber) out transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          //Assert
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            startingFunMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )
        })
        it("Cheaper Withdraw ETH from a single founder", async () => {
          //Arrange
          const startingFunMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          //Act
          const transactionResponse = await fundMe.cheaperWithdraw()
          const transactionReceipt = await transactionResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = transactionReceipt //get 2 objets (bigNumber) out transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          //Assert
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            startingFunMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )
        })
        it("allows us to withdraw with multiple funder", async () => {
          const accounts = await ethers.getSigners()
          for (let i = 0; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            await fundMeConnectedContract.fund({ value: sendValue })
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )

          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          //Act

          const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = transactionReceipt //get 2 objets (bigNumber) out transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )

          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          //Assert
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )

          //Make sure that the getFunder are reset properly
          await expect(fundMe.getFunder(0)).to.be.reverted

          //El error es en el for
          for (let i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            )
          }
        })
        it("only allows the owner to withdraw", async () => {
          const accounts = await ethers.getSigners()
          const fundMeConnectedContract = await fundMe.connect(accounts[1])

          await expect(
            fundMeConnectedContract.withdraw()
          ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
        })

        ///withdrawcheaper
        it("cheaperWithdraw...", async () => {
          const accounts = await ethers.getSigners()
          for (let i = 0; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            await fundMeConnectedContract.fund({ value: sendValue })
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )

          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          //Act

          const transactionResponse = await fundMe.cheaperWithdraw()
          const transactionReceipt = await transactionResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = transactionReceipt //get 2 objets (bigNumber) out transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )

          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          //Assert
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )

          //Make sure that the getFunder are reset properly
          await expect(fundMe.getFunder(0)).to.be.reverted

          for (let i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            )
          }
        })
      })
    })
