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
                  const currentFund = await fundUs.s_totalFunds()
                  await fundUs.fund({ value: sendValue })
                  const updatedFund = await fundUs.s_totalFunds()

                  console.log(`Amount funded: ${updatedFund}`)
                  console.log("Updating the fund")
                  const expectedFund = currentFund + sendValue

                  assert.equal(updatedFund.toString(), expectedFund.toString())
              })
          })

          describe("withdraw", function () {
              beforeEach(async () => {
                  await fundUs.fund({ value: sendValue })
              })
              it("withdraws ETH", async () => {
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
              it("Only allows the owners to withdraw", async () => {
                  const accounts = await ethers.getSigners()
                  const owner1 = await fundUs.connect(accounts[0])
                  //   const owner2 = await fundUs.connect(accounts[1])
                  const attacker = await fundUs.connect(accounts[2])

                  await fundUs.addOwner(owner1)
                  //   await fundUs.addOwner(owner2.address)

                  await expect(
                      attacker.withdraw()
                  ).to.be.revertedWithCustomError(fundUs, "FundUs__NotOwners")
              })
          })
          describe("receive", function () {
              it("should receive ethers", async () => {
                  const currentFund = await fundUs.s_totalFunds()
                  await fundUs.fund({ value: sendValue })
                  const updatedFund = await fundUs.s_totalFunds()

                  console.log(`Amount funded: ${updatedFund}`)
                  console.log("Updating the fund")
                  const expectedFund = currentFund + sendValue

                  assert.equal(updatedFund.toString(), expectedFund.toString())
              })
          })
          describe("fallback", function () {
              it("also should receive ethers", async () => {
                  const currentFund = await fundUs.s_totalFunds()
                  await fundUs.fund({ value: sendValue })
                  const updatedFund = await fundUs.s_totalFunds()

                  console.log(`Amount funded: ${updatedFund}`)
                  console.log("Updating the fund")
                  const expectedFund = currentFund + sendValue

                  assert.equal(updatedFund.toString(), expectedFund.toString())
              })
          })
      })
