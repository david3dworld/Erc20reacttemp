import './App.css';
import Token from './artifacts/contracts/Token.sol/XYZToken.json';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { StyledSpinnerNext as Spinner } from "baseui/spinner";
import {styled, useStyletron} from 'baseui';
import { Button } from "baseui/button";

import TokenTransfer from './components/TransferToken'

const Container = styled('div', {
  margin: "auto",
  padding: "4rem 2rem",
  display: "flex",
  flexDirection: "column",
  width: "50%"
})
const tokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

const formatEther = ethers.utils.formatEther;
const parseEther = ethers.utils.parseEther;

function App(props) {
  const [css, theme] = useStyletron();
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState();
  const [account, setAccount] = useState(null);
  const [supply, setSupply] = useState(0);

  const [accountBalance, setAccountBalance] = useState(0);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    connectMetamask();
  }, [])
  useEffect(()=>{
    // setSupply(formatEther((await contract.available())));
  },[balance])
  const getBalance = async () => {
    const balance = await contract.getBalance();
    const tokensInContract = formatEther(balance)
    setBalance(tokensInContract);
  }

  const fetchBalance = async (address) => {
    const bal = await contract.balanceOf(address);
    const tokensInAccount = formatEther(bal);
    setAccountBalance(tokensInAccount);
  } 

  const transfer = async (amount) => {
    console.log(amount)
    const amountInTokens = parseEther(amount)
    try{
      await contract.send(amountInTokens);

    }catch(err){
      console.log(err)
      window.alert("Sorry, you have not previlege to do this.")
    }

  }

  const connectMetamask = async()=>{
    if (typeof window.ethereum !== 'undefined') {
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      console.log(network)
      if(network.chainId !== 1337){
        return alert("Change to localhost test net to connect to the contract");
      }
      const signer = provider.getSigner();
      const contract = new ethers.Contract(tokenAddress, Token.abi, provider);

      const contractWithSigner = contract.connect(signer);
      setContract(contractWithSigner);
      const totalSupply = await contract.getBalance();
      console.log(contract)
      console.log(totalSupply)
      setSupply(formatEther((await contract.available())));
      setAccount(account);
      setShowLoader(false);
      window.alert("Metamask connected");
    }
  }

  return (
    <div className={["App", css({backgroundColor: "#f9e47d", zIndex:"-99"})].join(' ')}>
      <Container>  
        <div className={css({display:"flex", height:"50px", alignItems:"center", justifyContent:"space-between",cursor:"pointer"})}>
          <h1>XYZ Coin</h1>            
          <Button onClick={connectMetamask}>Connect Metamask</Button>
        </div>  
        {showLoader ? <Spinner /> : 
          <>                        
            <p> Total XYZ Supply: {supply}</p>
            <p> Contract Address: {contract.address}</p>
            <p> User Address: {account}</p>     
            <div className={css({display: "flex", flexDirection: "column"})}>
              <p> Your XYZ Balance: {balance}</p>
              <Button onClick={getBalance}>Get Balance</Button>
            </div> 
            <div>
              <TokenTransfer onRequestTransfer={transfer}/>
            </div>
          </>
        }
      </Container>
    </div>
  );
}

export default App;
