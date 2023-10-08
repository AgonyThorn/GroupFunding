const { network, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")

developmentChains.includes(network.name)
    ? describe.skip /*run on testnet */
    : describe("FundUs", async function () {
          const sendValue = ethers.parseEther("0.1")
          let fundUs
          beforeEach(async () => {
              const fundUsAtAddress = (await deployments.get("FundUs")).address
              fundUs = await ethers.getContractAt("FundUs", fundUsAtAddress)
          })
          it("allows people to fund and withdraw", async () => {
              const fundTxResponse = await fundUs.fund({ value: sendValue })
              await fundTxResponse.wait(1)
              const withdrawTxResponse = await fundUs.withdraw()
              await withdrawTxResponse.wait(1)

              const endingBalance = await ethers.provider.getBalance(
                  fundUs.target
              )
              console.log("contract balance should be 0, running assert...")
              assert.equal(endingBalance.toString(), "0")
          })
      })
