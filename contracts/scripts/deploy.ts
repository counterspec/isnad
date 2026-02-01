import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying ISNAD contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // Deploy ISNADToken
  console.log("\n1. Deploying ISNADToken...");
  const ISNADToken = await ethers.getContractFactory("ISNADToken");
  const token = await ISNADToken.deploy(deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("   ISNADToken deployed to:", tokenAddress);

  // Deploy ISNADRegistry
  console.log("\n2. Deploying ISNADRegistry...");
  const ISNADRegistry = await ethers.getContractFactory("ISNADRegistry");
  const registry = await ISNADRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("   ISNADRegistry deployed to:", registryAddress);

  // Deploy ISNADStaking
  console.log("\n3. Deploying ISNADStaking...");
  const ISNADStaking = await ethers.getContractFactory("ISNADStaking");
  const staking = await ISNADStaking.deploy(tokenAddress, deployer.address);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("   ISNADStaking deployed to:", stakingAddress);

  // Grant BURNER_ROLE to staking contract
  console.log("\n4. Granting BURNER_ROLE to staking contract...");
  const BURNER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BURNER_ROLE"));
  await token.grantRole(BURNER_ROLE, stakingAddress);
  console.log("   BURNER_ROLE granted");

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("DEPLOYMENT COMPLETE");
  console.log("=".repeat(50));
  console.log("ISNADToken:", tokenAddress);
  console.log("ISNADRegistry:", registryAddress);
  console.log("ISNADStaking:", stakingAddress);
  console.log("\nInitial supply: 100,000,000 ISNAD to", deployer.address);
  console.log("Max supply: 1,000,000,000 ISNAD");
  console.log("\nRoles configured:");
  console.log("- DEFAULT_ADMIN_ROLE:", deployer.address);
  console.log("- BURNER_ROLE:", stakingAddress);
  console.log("\nNext steps:");
  console.log("1. Grant ORACLE_ROLE to oracle contract: staking.grantRole(ORACLE_ROLE, oracleAddress)");
  console.log("2. Grant MINTER_ROLE to reward pool: token.grantRole(MINTER_ROLE, rewardPoolAddress)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
