// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";
import "./Constant.sol";

contract XYZToken is ERC20,Constant {

    mapping(address=>uint256) balances;
    
    event Send(address receiver, uint256 amount);

    constructor() ERC20("XYZToken", "XYZ"){
        _mint(address(this), initTokenAmount);
        console.log(initTokenAmount);
    }

    function send(uint256 amount) public onlyVIP{
        require(amount>0, "Send amount must be greater than zero");
        require(balanceOf(address(this))>=amount, "Insufficient token amount.");

        this.transfer(msg.sender, amount);
        balances[msg.sender] += amount;
        
        emit Send(msg.sender, amount);
    }

    function getBalance() public view returns(uint256){
        return balances[msg.sender];
    }

    function available() public view returns(uint256){
        return balanceOf(address(this));
    }
}