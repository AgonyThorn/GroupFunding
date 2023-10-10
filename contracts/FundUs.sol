// SPDX-License-Identifier: MIT
//pragma
pragma solidity ^0.8.8;
//import
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

//Error codes

error FundUs__NotOwners();

//Interfaces, libraries, contracts

/**
 *@title A contract for crowd funding
 * @author Agony Thorn
 * @notice This contract is a variation of crowd funding where the fund goes to a group of ppl
 * @dev This implements priceFeed as our library
 */

contract FundUs {
    // Type Declarations
    using PriceConverter for uint256;

    // State Variables!
    address[] private s_owners;

    uint256 public s_totalFunds;

    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;

    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwners() {
        bool isOwner = false;
        for (
            uint256 OwnersIndex = 0;
            OwnersIndex < s_owners.length;
            OwnersIndex++
        ) {
            if (msg.sender == s_owners[OwnersIndex]) {
                isOwner = true;
                break;
            }
        }
        if (isOwner = false) revert FundUs__NotOwners();
        _;
    }

    constructor(address priceFeedAddress) {
        s_owners.push(msg.sender); //created storage slot for s_owners[0] since s_owners is dynamic array
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
        s_totalFunds = 0;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
     * @notice this function fund the contract
     * @dev this implements price feed as out libary
     */

    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        s_totalFunds += msg.value;
        //view how much has been funded
    }

    /**
     * @notice this function add a new owner
     */

    function addOwner() public onlyOwners {
        s_owners.push(msg.sender);
    }

    /**
     * @notice this function allow withdrawing
     */

    function withdraw() public onlyOwners {
        require(s_owners.length > 0, "No owner!!!"); // avoid x/0
        uint256 amountToSend = address(this).balance / s_owners.length;

        for (
            uint256 OwnersIndex = 0;
            OwnersIndex < s_owners.length;
            OwnersIndex++
        ) {
            (bool success, ) = s_owners[OwnersIndex].call{value: amountToSend}(
                ""
            );
            require(success);
        }
        s_totalFunds = 0;
    }

    //getter - encapsulation
    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function getOwners(uint256 index) public view returns (address) {
        return s_owners[index];
    }
}
