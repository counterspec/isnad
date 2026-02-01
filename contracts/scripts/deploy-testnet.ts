import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying testnet contracts with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // 1. Deploy mock ISNAD token (simple ERC20)
  console.log("\n1. Deploying Mock ISNAD Token...");
  const MockToken = await ethers.getContractFactory("MockISNAD");
  const token = await MockToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("   MockISNAD:", tokenAddress);

  // Mint some tokens to deployer for testing
  const mintAmount = ethers.parseUnits("1000000000", 18); // 1B tokens
  await token.mint(deployer.address, mintAmount);
  console.log("   Minted 1B tokens to deployer");

  // 2. Deploy Registry
  console.log("\n2. Deploying ISNADRegistry...");
  const Registry = await ethers.getContractFactory("ISNADRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("   ISNADRegistry:", registryAddress);

  // 3. Deploy Staking
  console.log("\n3. Deploying ISNADStakingV2...");
  const Staking = await ethers.getContractFactory("ISNADStakingV2");
  const staking = await Staking.deploy(tokenAddress, deployer.address);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("   ISNADStakingV2:", stakingAddress);

  // 4. Deploy Oracle
  console.log("\n4. Deploying ISNADOracle...");
  const Oracle = await ethers.getContractFactory("ISNADOracle");
  const oracle = await Oracle.deploy(stakingAddress);
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log("   ISNADOracle:", oracleAddress);

  // 5. Deploy RewardPool
  console.log("\n5. Deploying ISNADRewardPool...");
  const RewardPool = await ethers.getContractFactory("ISNADRewardPool");
  const rewardPool = await RewardPool.deploy(tokenAddress, stakingAddress);
  await rewardPool.waitForDeployment();
  const rewardPoolAddress = await rewardPool.getAddress();
  console.log("   ISNADRewardPool:", rewardPoolAddress);

  // Fund reward pool with testnet tokens
  const rewardFunding = ethers.parseUnits("10000000", 18); // 10M tokens
  await token.transfer(rewardPoolAddress, rewardFunding);
  console.log("   Funded RewardPool with 10M tokens");

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("TESTNET DEPLOYMENT COMPLETE (Base Sepolia)");
  console.log("=".repeat(60));
  console.log(`Token (Mock):    ${tokenAddress}`);
  console.log(`Registry:        ${registryAddress}`);
  console.log(`Staking:         ${stakingAddress}`);
  console.log(`Oracle:          ${oracleAddress}`);
  console.log(`RewardPool:      ${rewardPoolAddress}`);
  console.log("=".repeat(60));
  
  // Output JSON for easy copy
  console.log("\nJSON:");
  console.log(JSON.stringify({
    network: "sepolia",
    chainId: 84532,
    token: tokenAddress,
    registry: registryAddress,
    staking: stakingAddress,
    oracle: oracleAddress,
    rewardPool: rewardPoolAddress
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
