import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const stakingAddress = "0x916FFb3eB82616220b81b99f70c3B7679B9D62ca";
  const tokenAddress = "0x73F6d2BBef125b3A5F91Fe23c722f3C321f007E5";
  const contentHash = "0xd15c58f4a5f9b5804ef72cee8744731633bdccc4e43968a21f068498e207301a";
  
  const staking = await ethers.getContractAt("ISNADStakingV2", stakingAddress);
  const token = await ethers.getContractAt("IERC20", tokenAddress);
  
  console.log("Deployer:", deployer.address);
  console.log("Token balance:", ethers.formatEther(await token.balanceOf(deployer.address)));
  console.log("Token allowance to staking:", ethers.formatEther(await token.allowance(deployer.address, stakingAddress)));
  
  // Check if paused
  try {
    const paused = await staking.paused();
    console.log("Paused:", paused);
  } catch (e) {
    console.log("No paused() function or error");
  }
  
  // Check whale caps
  console.log("\nWhale caps:");
  console.log("MAX_STAKE_PER_AUDITOR:", ethers.formatEther(await staking.MAX_STAKE_PER_AUDITOR()));
  console.log("Auditor total stake:", ethers.formatEther(await staking.auditorTotalStake(deployer.address)));
  
  // Check lock durations
  console.log("\nLock durations:");
  console.log("MIN_LOCK_DURATION:", (await staking.MIN_LOCK_DURATION()).toString(), "seconds");
  console.log("MAX_LOCK_DURATION:", (await staking.MAX_LOCK_DURATION()).toString(), "seconds");
}

main().catch(console.error);
