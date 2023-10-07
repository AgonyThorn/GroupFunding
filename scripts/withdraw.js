const { ethers } = require("hardhat")

async function main() {
    const fundUsAtAddress = (await deployments.get("FundUs")).address
    const fundUs = await ethers.getContractAt("FundUs", fundUsAtAddress)
    console.log("Funding...")
    const transactionResponse = await fundUs.withdraw()
    await transactionResponse.wait(1)
    console.log("Got it back!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
