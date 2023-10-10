# GroupFunding
<h3 align="center">GroupFunding</h3>
<p align="center">
A smart contract for crowd funding with multiple owners
</p>
<hr>

## About the projects
- Welcome to GroupFunding, this is a variation of crowd funding contract designed to support multiple owners.
- With GroupFunding, contributors can fund the contract without revealing their identity which ensure the funders' privacy. At the same time, encourage individuals to participate the funding.
- Withdrawing in GroupFunding is only available to the owners of the contract. When call, the funded will equally distribute among the funders

### Built with
<div align="center">
    <img src="https://skillicons.dev/icons?i=nodejs,js,solidity"/> <br>
</div>
Note that this project built with ethers 6.7.1 so it might not working for future versions

GroupFunding is open-source licensed under the MIT License

## Getting Started

To get started with GroupFunding, follow these steps:

1. Deploy the Smart Contract: Deploy the GroupFunding smart contract on your chosen Ethereum network.

2. Fund the Contract: Contributors can send Ether to the contract address using the `fund` function. The contract ensures that the minimum funding requirement is met before accepting contributions.

3. Become an Owner: Specify the contract owners during deployment or add them later using the contract's functions.

4. Withdraw Funds: Owners can initiate fund withdrawals, and the contract will automatically distribute the funds equally among all owners.

## Security Considerations
- Ensure that you deploy the contract on a secure Ethereum network.
- Implement proper access control to add and manage owners.
- Review and test the contract thoroughly to identify and mitigate potential security risks.
<hr>

Latest updated from developer: Oct-10th/2023

Unexpected error on gas-estimation has fixed <br>
The contract has been tested!
Unfortunately, unidentified error causing the withdraw test to fail <br>
Please consider and retest if you are using the contract <br>
Thank you!