const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip /*run on dev chain */
    : describe("FundUs", async function () {
          let fundUs
          let deployer
          let mockV3Aggregator
          const sendValue = ethers.parseEther("0.1")
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              console.log(`Deployer is: ${deployer}`)

              const fundUsAtAddress = (await deployments.get("FundUs")).address
              fundUs = await ethers.getContractAt("FundUs", fundUsAtAddress)

              const mockV3AggregatorAddress = (
                  await deployments.get("MockV3Aggregator")
              ).address
              mockV3Aggregator = await ethers.getContractAt(
                  "MockV3Aggregator",
                  mockV3AggregatorAddress
              )
          })

          describe("constructor", function () {
              it("sets the aggregator addresses correctly", async () => {
                  const response = await fundUs.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.target)
              })
          })

          describe("fund", function () {
              it("Fails if you don't send enough ETH", async () => {
                  await expect(fundUs.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })

              it("Updates the amount funded data structure", async () => {
                  await fundUs.fund({ value: sendValue })
                  const response = await fundUs.getAddressToAmountFunded(
                      deployer
                  )
                  console.log(`Amount funded: ${response}`)
                  console.log("Updating the fund")
                  assert.equal(response.toString(), sendValue.toString())
              })

              it("Adds funder to array of funders", async () => {
                  await fundUs.fund({ value: sendValue })
                  const response = await fundUs.getFunder(0)
                  assert.equal(response, deployer)
              })
          })

          describe("withdraw", function () {
              beforeEach(async () => {
                  await fundUs.fund({ value: sendValue })
              })
              it("withdraws ETH from a single funder", async () => {
                  // Arrange
                  const startingFundUsBalance =
                      await ethers.provider.getBalance(fundUs.target)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundUs.withdraw()
                  const transactionReceipt = await transactionResponse.wait()
                  const { gasUsed, gasPrice } = transactionReceipt
                  console.log(`Gas used: ${gasUsed}`)
                  console.log(`Gas price: ${gasPrice}`)
                  const gasCost = gasUsed * gasPrice
                  console.log(`Gas cost: ${gasCost}`)

                  const endingFundUsBalance = await ethers.provider.getBalance(
                      fundUs.target
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  assert.equal(endingFundUsBalance, 0)
                  assert.equal(
                      startingFundUsBalance + startingDeployerBalance,
                      endingDeployerBalance + gasCost
                  )
              })

              it("is allows us to withdraw with multiple funders", async () => {
                  // Arrange
                  const accounts = await ethers.getSigners()
                  for (i = 1 /*index 0 is deployer */; i < 6; i++) {
                      const fundUsConnectedContract = await fundUs.connect(
                          accounts[i]
                      )
                      await fundUsConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundUsBalance =
                      await ethers.provider.getBalance(fundUs.target)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundUs.withdraw()
                  const transactionReceipt = await transactionResponse.wait()
                  const { gasUsed, gasPrice } = transactionReceipt
                  const gasCost = gasUsed * gasPrice
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  // Assert
                  assert.equal(
                      startingFundUsBalance + startingDeployerBalance,
                      endingDeployerBalance + gasCost
                  )
                  // Make a getter for storage variables
                  await expect(fundUs.getFunder(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundUs.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
              it("Only allows the owner to withdraw", async () => {
                  const accounts = await ethers.getSigners()
                  const attackerConnectedContract = await fundUs.connect(
                      accounts[1]
                  )
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWithCustomError(fundUs, "FundUs__NotOwner")
              })
          })
          describe("receive", function () {
              it("should receive ethers", async () => {
                  await fundUs.fund({ value: sendValue })
                  const response = await fundUs.getAddressToAmountFunded(
                      deployer
                  )
                  console.log(`Amount funded: ${response}`)
                  console.log("Updating the fund")
                  assert.equal(response.toString(), sendValue.toString())
              })
          })
          describe("fallback", function () {
              it("also should receive ethers", async () => {
                  await fundUs.fund({ value: sendValue })
                  const response = await fundUs.getAddressToAmountFunded(
                      deployer
                  )
                  console.log(`Amount funded: ${response}`)
                  console.log("Updating the fund")
                  assert.equal(response.toString(), sendValue.toString())
              })
          })
      })
