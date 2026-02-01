import { ethers } from "hardhat";

// Phase 2 deployed contracts
const TOKEN_ADDRESS = "0x56d202C2E1C5a3D7538Ed6CAD674d4E07D83cbb4";
const ORACLE_ADDRESS = "0x4f1968413640bA2087Db65d4c37912d7CD598982";
const REWARD_POOL_ADDRESS = "0xfD75A1BD5d3C09d692B1fb7ECEA613BA08961911";
const TIMELOCK_ADDRESS = "0x13B3418c78c309D0d141f6eF0A26D783809Bc1bA";
const GOVERNOR_ADDRESS = "0x67F139c13628DBB9aFac8377fb2DD57958B9C586";

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
