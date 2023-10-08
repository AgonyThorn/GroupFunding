const { ethers } = require("hardhat")

async function main() {
    const fundUsAtAddress = (await deployments.get("FundUs")).address
    const fundUs = await ethers.getContractAt("FundUs", fundUsAtAddress)
    console.log("Funding Contract...")
    const transactionResponse = await fundUs.fund({
        value: ethers.parseEther("0.1"),
    })
    await transactionResponse.wait(1)
    console.log("Funded!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
