import { ethers } from "hardhat";

const TOKEN_ADDRESS = "0x56d202C2E1C5a3D7538Ed6CAD674d4E07D83cbb4";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Continuing deployment with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));
  console.log("Using existing token at:", TOKEN_ADDRESS);

  // Deploy ISNADRegistry
  console.log("\n2. Deploying ISNADRegistry...");
  const ISNADRegistry = await ethers.getContractFactory("ISNADRegistry");
  const registry = await ISNADRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("   ISNADRegistry deployed to:", registryAddress);

  // Wait a moment for nonce to sync
  await new Promise(r => setTimeout(r, 3000));

  // Deploy ISNADStaking
  console.log("\n3. Deploying ISNADStaking...");
  const ISNADStaking = await ethers.getContractFactory("ISNADStaking");
  const staking = await ISNADStaking.deploy(TOKEN_ADDRESS, deployer.address);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("   ISNADStaking deployed to:", stakingAddress);

  // Wait a moment for nonce to sync
  await new Promise(r => setTimeout(r, 3000));

  // Grant BURNER_ROLE to staking contract
  console.log("\n4. Granting BURNER_ROLE to staking contract...");
  const token = await ethers.getContractAt("ISNADToken", TOKEN_ADDRESS);
  const BURNER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BURNER_ROLE"));
  await token.grantRole(BURNER_ROLE, stakingAddress);
  console.log("   BURNER_ROLE granted");

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("DEPLOYMENT COMPLETE");
  console.log("=".repeat(50));
  console.log("ISNADToken:", TOKEN_ADDRESS);
  console.log("ISNADRegistry:", registryAddress);
  console.log("ISNADStaking:", stakingAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
