import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Staking from:", deployer.address);

  const tokenAddress = "0x73F6d2BBef125b3A5F91Fe23c722f3C321f007E5";
  const stakingAddress = "0x916FFb3eB82616220b81b99f70c3B7679B9D62ca";
  const contentHash = "0xd15c58f4a5f9b5804ef72cee8744731633bdccc4e43968a21f068498e207301a";

  // Get token contract
  const token = await ethers.getContractAt("IERC20", tokenAddress);
  const balance = await token.balanceOf(deployer.address);
  console.log("ISNAD balance:", ethers.formatEther(balance));

  // Stake amount: 10,000 ISNAD
  const stakeAmount = ethers.parseEther("10000");
  console.log("Staking:", ethers.formatEther(stakeAmount), "ISNAD");

  // Approve staking contract
  console.log("Approving...");
  const approveTx = await token.approve(stakingAddress, stakeAmount);
  await approveTx.wait();
  console.log("Approved");

  // Get staking contract
  const staking = await ethers.getContractAt("ISNADStakingV2", stakingAddress);

  // Lock duration in seconds: 30 days = 30 * 24 * 60 * 60 = 2592000
  const lockDuration = 30 * 24 * 60 * 60; // 30 days in seconds
  console.log("Lock duration:", lockDuration, "seconds (30 days)");

  // Stake
  console.log("Staking...");
  const stakeTx = await staking.stake(contentHash, stakeAmount, lockDuration, { gasLimit: 300000 });
  console.log("TX:", stakeTx.hash);
  const receipt = await stakeTx.wait();
  console.log("✅ Staked in block:", receipt?.blockNumber);
}

main().catch(console.error);
