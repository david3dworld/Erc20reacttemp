const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );

  const Token = await hre.ethers.getContractFactory("XYZToken");
  const XYZToken = await Token.deploy();
  await XYZToken.deployed();
  console.log("Token deployed to:", XYZToken.address);

  // const MainContract = await hre.ethers.getContractFactory("MainContract");
  // const Main = await MainContract.deploy(XYZToken.address);
  // await Main.deployed();
  // console.log("MainContract deployed to:", Main.address);
  
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });