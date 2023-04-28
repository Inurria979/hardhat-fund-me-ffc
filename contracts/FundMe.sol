// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();
error FundMe__NotEnoughEth();
//Interfaces or libraries goes here

/**
 * @title A contract for crownd funding
 * @author freecodecamp and Jesus Inurria
 * @notice this contract is to demo a sample funding contract
 * @dev this impliments price feeds as our library
 */
contract FundMe {
    using PriceConverter for uint256;

    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;

    // Could we make this constant?  /* hint: no! We should make it immutable! */
    address private  immutable  i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18; 
    
    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }
    modifier notEnoughEth {
        if (!(msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD)) revert FundMe__NotEnoughEth();
        _;
    }
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    fallback() external payable {
        fund();
    }

    receive() external payable {
        fund();
    }

    function fund() public payable notEnoughEth{
        //If use error instead of requiere we can earn the gas from the str
        //require(msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }
    function fund_to_zero() public{
        s_addressToAmountFunded[msg.sender] = 0;
    }
   
    

    /**
     *  @notice This function  funds this contract
     * @dev implements price feed as library
     * 
     */
    function withdraw() public onlyOwner {
        for (uint256 funderIndex=0; funderIndex < s_funders.length; funderIndex++){
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }


    function cheaperWithdraw() public payable onlyOwner{
        // mappins cant be in memory
        // we are gona copy the variable s_funders
        //work with the copy 
        //when we finish we update the s_funders with the data of (local) funders
        address[] memory funders = s_funders;
        for ( uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++){
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address [](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }
    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \ 
    //         yes  no
    //         /     \
    //    receive()?  fallback() 
    //     /   \ 
    //   yes   no
    //  /        \
    //receive()  fallback()

    function getOwner() public view  returns(address){
        return i_owner;
    }
    function getFunder(uint index) public view returns(address){
        return s_funders[index];
    }
    function getAddressToAmountFunded(address funder) public view returns(uint256){
        return s_addressToAmountFunded[funder];
    }
    function getPriceFeed() public view returns(AggregatorV3Interface){
        return s_priceFeed;
    }

}


// test