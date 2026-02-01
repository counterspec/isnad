import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const tokenAddress = "0x07d921D275aD82e71aE42f2B603CF2926329c1Ce";
  
  console.log("Continuing deployment...");
  console.log("Using token:", tokenAddress);
  
  await new Promise(r => setTimeout(r, 5000));
  
  console.log("\nDeploying ISNADRegistry...");
  const Registry = await ethers.getContractFactory("ISNADRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  console.log("ISNADRegistry:", await registry.getAddress());
  
  await new Promise(r => setTimeout(r, 3000));
  
  console.log("\nDeploying ISNADStakingV2...");
  const Staking = await ethers.getContractFactory("ISNADStakingV2");
  const staking = await Staking.deploy(tokenAddress, deployer.address);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("ISNADStakingV2:", stakingAddress);
  
  await new Promise(r => setTimeout(r, 3000));
  
  console.log("\nDeploying ISNADOracle...");
  const Oracle = await ethers.getContractFactory("ISNADOracle");
  const oracle = await Oracle.deploy(stakingAddress);
  await oracle.waitForDeployment();
  console.log("ISNADOracle:", await oracle.getAddress());
  
  await new Promise(r => setTimeout(r, 3000));
  
  console.log("\nDeploying ISNADRewardPool...");
  const RewardPool = await ethers.getContractFactory("ISNADRewardPool");
  const rewardPool = await RewardPool.deploy(tokenAddress, stakingAddress);
  await rewardPool.waitForDeployment();
  console.log("ISNADRewardPool:", await rewardPool.getAddress());
  
  console.log("\nAll contracts deployed!");
}

main().catch(console.error);
