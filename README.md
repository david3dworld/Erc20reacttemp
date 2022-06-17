![alt text](https://www.ranadeepb.com/assets/erc20/yogacoin.png "ERC-20 YogaCoin")

We will learn how to create your own ERC-20 token and deploy it to a live testnet and deploy the react frontend to vercel. 

> Code is available at [Github](https://github.com/ranadeep47/erc20-hardhat-waffle-react), demo at [https://erc20-hardhat-waffle-react.vercel.app/](https://erc20-hardhat-waffle-react.vercel.app/)

This project uses open-zeppelin for smart contracts, hardhat, ethers for interacting with blockchain and waffle for writing tests and typescript, react for frontend, for UI we will use a UI library called baseweb to get us started quickly.

The whole process is broken down into
1. Setup
2. Writing code
3. Testing with hardhat local blockchain
4. Deploying contract to Rinkeby testnet
5. Deploying the frotend to vercel

## 1. Setup
Run `npm init` and initialise your your package.json

hardhat & waffle: `npm install --save-dev @nomiclabs/hardhat-ethers @nomiclabs/hardhat-waffle hardhat ethers ethereum-waffle chai`

TypeScript: `npm install --save-dev typescript ts-node @types/react @types/node @types/mocha`
Typechain: `npm install --save-dev ts-generator typechain @typechain/ethers-v5 @typechain/hardhat`

`npm install --force --save-dev hardhat-typechain`, we use force because theres an issue with version conflicts with typechain

Baseweb:
`npm install --save baseui styletron-react styletron-engine-atomic`

Others: `npm install --save-dev dotenv` 

React: `npm install --save react react-dom react-scripts`

SmartContracts: `npm install --save @openzeppelin/contracts`

After installing all the above dependencies setup your `hardhat.config.ts` by running `npx hardhat`. I'd suggest you copy hardhat and typescript from the code's [github repo](https://github.com/ranadeep47/erc20-hardhat-waffle-react) to get started quickly

---

## 2. Code

Token.sol in /contracts/ folder
```solidity
//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 100000 * (10 ** uint256(decimals())));
    }
}

```
This is our contract which creates 100,000 Tokens with the name and symbol that we will provide while deploying the contract. We are inheriting from the open-zeppelin ERC20 contract which has alot of inbuilt methods which you can check [here](https://docs.openzeppelin.com/contracts/4.x/api/token/erc20)

Now run `npx hardhat compile`, this step will generate our typechain types for our contracts and compile the solidity smart contract and create solidity ABI's in a folder `src/artifacts` which we will import in our react code to interact with our contract 

You should find them here `/artifacts/contracts/Token.sol/Token.json`

Fronend code to interact with our contract 
``` javascript
import Token from './artifacts/contracts/Token.sol/Token.json';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
...

const tokenAddress = "0xCB1B15E3d881E7F9Bc05a7eFc61efE9661C112cb"
const DECIMALS = 18;
const NETWORK = 'rinkeby';

function App(props) {
  const [css, theme] = useStyletron();
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState();
  const [account, setAccount] = useState(null);
  const [supply, setSupply] = useState(0);

  const [accountBalance, setAccountBalance] = useState(0);
  const [allowance, setAllowance] = useState(0);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(async () => {
    if (typeof window.ethereum !== 'undefined') {
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      if(network.name !== NETWORK) {
        return alert("Connect to rinkeby test net to connect to the contract");
      }

      const signer = provider.getSigner();
      const contract = new ethers.Contract(tokenAddress, Token.abi, provider);
      const contractWithSigner = contract.connect(signer);

    ...
    }
  }, [])

  const getBalance = async () => {
    const balance = await contract.balanceOf(account);
    const tokensInContract = formatEther(balance)
    setBalance(tokensInContract);
  }

    ...

  return (
    <div className={["App", css({backgroundColor: "#f9e47d"})].join(' ')}>
      <Container>    
        <h1>Yoga Coin</h1>            
        {showLoader ? <Spinner /> : 
          <>                        
            <p>💰 Total Token Supply: {supply}</p>
            <p>📨 Contract Address: {contract.address}</p>
            <p>📨 User Address: {account}</p>     
            <div className={css({display: "flex", flexDirection: "column"})}>
              <p>💰 User Balance: {balance}</p>
              <Button onClick={getBalance}>Get Balance</Button>
            </div> 
          </>
        }
      </Container>
    </div>
  );
}
```
In our react code, we are importing the contract ABI, connecting to the metamask's network which is injected into the browser as `window.ethereum`. We use ethers.js library to connect to metamask. The `provider` contains network info and `signer` contains the user's account info like address. 

We connect to the contract using `const contract = new ethers.Contract(tokenAddress, Token.abi, provider);` and run methods on the contract to perform various actions like transferring, approving tokens and checking balance. Check the code in [App.js](https://github.com/ranadeep47/erc20-hardhat-waffle-react/blob/main/src/App.js) to see how all the functions like `balance, approve, transfer, allowance` are implemented.

---

## 3. Deploy and Test in local hardhat node
Open a new terminal window and run `npx hardhat node` to run hardhat's local network, this command also generates 20 usable public-private key pairs of which the first pair is used to deploy our contract.

![alt text](https://www.ranadeepb.com/assets/erc20/local-hardhat-node.png "Starting local hardhat node")

To deploy our contract to hardhat's local network, we first create a folder called `scripts` and write a `deploy.js` script in it.

### Deploy script
``` javascript
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );

  const Token = await hre.ethers.getContractFactory("Token");
  const YogaCoin = await Token.deploy("YogaCoin", "YOGA");

  await YogaCoin.deployed();

  console.log("Token deployed to:", YogaCoin.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
```
This is a typical hardhat deploy script which we can use to deploy our `Token` contract. Notice we are initialising our contract with a `name` and `symbol`, which are `YogaCoin` and `YOGA`. Lets assume that user with these coins can get access to special yoga classes which teachers can accept. 

In the above code, `hre.ethers.getSigners()` returns the `signer` object of the account connected to hardhat config's default blockchain network. In this case its the first account generated by hardhat when the blockchain node is created.

Once the contract is deployed you can see the address of the deployed contract.

![alt text](https://www.ranadeepb.com/assets/erc20/deploy-localhost.png "Deploying contract to local node")

Now place this contract address in the `tokenAddress` variable in `App.js` to connect our frontend to the contract in our local hardhat node.

Now to test the contract, add the network details in your metamask
![alt text](https://www.ranadeepb.com/assets/erc20/local-node-metamask.png "Adding local node to metamask")

Now in an other terminal window while the node is running, run `npm run start` and make sure you have `react-scripts start` in your `scripts` field in package.json. Now head to `http://localhost:3000` to interact with the contract, make sure you are connected to the Localhost Hardhat node network in your metamask wallet


---

## 4. Deploying contract to Rinkeby testnet
Deploying contracts costs eth gas, so we acquire test ether from Rinkeby's faucet [here](https://www.rinkeby.io/#faucet). Make sure your metamask account is connected to `Rinkeby Test network` and check if it has some ether in it. 

Also we create a project in [Infura](https://infura.io/) get an infura api key to interact and create contracts in rinkeby network

Then create a `.env` file in your repo and add the following keys to it, make sure .env is file added in your `.gitignore` so that you wont accidentally upload your private key details to github.

```
INFURA_API_KEY=** INFURA PROJECT API KEY**
RINKEBY_PRIVATE_KEY=** YOUR PRIVATE KEY OF YOUR METAMASK ACCOUNT ** 
```
Make sure you use a test eth account's private key.

Then we modify our `hardhat.config.js` to make `rinkeby` as our default network 

```javascript
const RINKEBY_PRIVATE_KEY =
  process.env.RINKEBY_PRIVATE_KEY ||
  "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3"; // well known private key


const config: HardhatUserConfig = {
  defaultNetwork: "rinkeby",
  solidity: "0.8.0",
...
  networks: {
    hardhat: {
      chainId: 1337 // TO WORK WITH METAMASK
    },
    localhost: {},
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [RINKEBY_PRIVATE_KEY],
    },

  }
};
```

Done, now we deploy our contract to the rinkeby network using the same deploy command we used before:
`npx hardhat run scripts/deploy.js --network rinkeby`

![alt text](https://www.ranadeepb.com/assets/erc20/deploy-rinkeby.png "Deploying contract to rinkeby test net") 
You can see the address where our contract is deployed. To confirm it, lets head to etherscan and paste our contract address in the search bar. 

You should find the contract deployed on etherscan, with the tokens name, owner, balance etc..
![alt text](https://www.ranadeepb.com/assets/erc20/etherscan.png "Verifying contract on etherscan") 

Now there's an important step here which is to place this contract address in our frontend `App.js` so that we are connecting to the right contract. So in App.js, make sure you have the new contract address assigned to `tokenAddress` variable `const tokenAddress = "0xCB1B15E3d881E7F9Bc05a7eFc61efE9661C112cb"`

---

## 5. Deploying front-end to vercel.

Before we deploy our frontend to vercel, create an account in vercel.com and connect your github account to it. It allows you to import your repos from github and deploy automagically to a subdomain on vercel.com

Add the following to your `package.json` for the vercel build step to succeed
```
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "compile": "npx hardhat compile",
    "test": "npx hardhat test"
  },
```

![alt text](https://www.ranadeepb.com/assets/erc20/deploy-vercel.png "Deploying the frontend in vercel") 

Now in your vercel dashboard, click import project, select your repo and click deploy. Vercel will install all the dependencies, build and deploy your project and gives you the final public deploy url. Visit the url to finally interact with your contract.

This demo is hosted [here](https://erc20-hardhat-waffle-react.vercel.app/) at `https://erc20-hardhat-waffle-react.vercel.app/`