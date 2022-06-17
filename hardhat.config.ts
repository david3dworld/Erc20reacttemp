// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/types";
import { task } from "hardhat/config";
import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import "@nomiclabs/hardhat-etherscan";


const config: HardhatUserConfig = {
  defaultNetwork: "localhost",
  solidity: "0.8.4",
  paths: {
    tests: "./test",
    sources: "./contracts",
    cache: "./cache",
    artifacts: "./src/artifacts"
  },
  networks: {
    hardhat: {
      chainId: 1337 // TO WORK WITH METAMASK
    },
    localhost: {
      url:"http://127.0.0.1:8545",
      chainId:1337
    },
  },
};

export default config;

task(
  "blockNumber",
  "Prints the current block number",
  async (_, { ethers }) => {
    await ethers.provider.getBlockNumber().then((blockNumber) => {
      console.log("Current block number: " + blockNumber);
    });
  }
);
