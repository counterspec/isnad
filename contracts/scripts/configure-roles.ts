import { ethers } from "hardhat";

// Phase 2 deployed contracts (v2 with AutoUnpausable)
const TOKEN_ADDRESS = "0xc41c1006A1AaC093C758A2f09de16fee2561651A";
const ORACLE_ADDRESS = "0x418EbF8F206fA6efF3318647d8c4Ac137dDf3aC7";
const REWARD_POOL_ADDRESS = "0x474cB2441C0Af053DAe052302a6829a218Aa656F";
const TIMELOCK_ADDRESS = "0x2c99dB618a6dBFf0F0e74f7949fcC9A23ffB4A69";
const GOVERNOR_ADDRESS = "0xf08269e04029eB0eeAfcE10Ed3aa9Fb2bAbB61Cd";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Configuring roles for Phase 2 contracts");
  console.log("=".repeat(50));
  console.log("Deployer:", deployer.address);

  // Get contracts
  const timelock = await ethers.getContractAt("TimelockController", TIMELOCK_ADDRESS);
  const token = await ethers.getContractAt("ISNADToken", TOKEN_ADDRESS);

  // Check which roles are already granted
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
  const CANCELLER_ROLE = await timelock.CANCELLER_ROLE();
  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

  // Grant EXECUTOR_ROLE to governor if not already
  const hasExecutor = await timelock.hasRole(EXECUTOR_ROLE, GOVERNOR_ADDRESS);
  if (!hasExecutor) {
    console.log("Granting EXECUTOR_ROLE to Governor...");
    const tx1 = await timelock.grantRole(EXECUTOR_ROLE, GOVERNOR_ADDRESS);
    await tx1.wait();
    console.log("  Done");
  } else {
    console.log("Governor already has EXECUTOR_ROLE");
  }

  await new Promise(r => setTimeout(r, 3000));

  // Grant CANCELLER_ROLE to governor if not already
  const hasCanceller = await timelock.hasRole(CANCELLER_ROLE, GOVERNOR_ADDRESS);
  if (!hasCanceller) {
    console.log("Granting CANCELLER_ROLE to Governor...");
    const tx2 = await timelock.grantRole(CANCELLER_ROLE, GOVERNOR_ADDRESS);
    await tx2.wait();
    console.log("  Done");
  } else {
    console.log("Governor already has CANCELLER_ROLE");
  }

  await new Promise(r => setTimeout(r, 3000));

  // Grant MINTER_ROLE to RewardPool if not already
  const hasMinter = await token.hasRole(MINTER_ROLE, REWARD_POOL_ADDRESS);
  if (!hasMinter) {
    console.log("Granting MINTER_ROLE to RewardPool...");
    const tx3 = await token.grantRole(MINTER_ROLE, REWARD_POOL_ADDRESS);
    await tx3.wait();
    console.log("  Done");
  } else {
    console.log("RewardPool already has MINTER_ROLE");
  }

  console.log("\n" + "=".repeat(50));
  console.log("ROLE CONFIGURATION COMPLETE");
  console.log("=".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
