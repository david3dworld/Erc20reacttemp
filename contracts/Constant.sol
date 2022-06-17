// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

contract Constant{

    address[] public ADRLIST =[
        0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266,
        0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,
        0x90F79bf6EB2c4f870365E785982E1f101E93b906,
        0x5B38Da6a701c568545dCfcB03FcB875f56beddC4,
        0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2,
        0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db
    ];
    uint256 public initTokenAmount = 50000 ether;
    
    modifier onlyVIP(){
        bool flag = false;
        for (uint256 i =0 ; i < ADRLIST.length; i++)    {
            if (msg.sender == ADRLIST[i]){
                flag = true;
            }
        }
        require(flag,"You have not previlege to send tokens");
        _;
    }
    
}