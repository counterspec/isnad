import { ethers } from "hardhat";

// Existing deployed contracts
const TOKEN_ADDRESS = "0x56d202C2E1C5a3D7538Ed6CAD674d4E07D83cbb4";
const REGISTRY_ADDRESS = "0x8340783A495BB4E5f2DF28eD3D3ABcD254aA1C93";
const STAKING_ADDRESS = "0x2B5aF6cd0AF41B534aA117eECE7650dDE8B044bE";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Phase 2 Deployment - Oracle, RewardPool, Governance");
  console.log("=".repeat(50));
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("\nExisting contracts:");
  console.log("  Token:", TOKEN_ADDRESS);
  console.log("  Registry:", REGISTRY_ADDRESS);
  console.log("  Staking:", STAKING_ADDRESS);

  // 1. Deploy ISNADOracle
  console.log("\n1. Deploying ISNADOracle...");
  const ISNADOracle = await ethers.getContractFactory("ISNADOracle");
  const oracle = await ISNADOracle.deploy(STAKING_ADDRESS);
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log("   ISNADOracle deployed to:", oracleAddress);

  await new Promise(r => setTimeout(r, 3000));

  // 2. Deploy ISNADRewardPool
  console.log("\n2. Deploying ISNADRewardPool...");
  const ISNADRewardPool = await ethers.getContractFactory("ISNADRewardPool");
  const rewardPool = await ISNADRewardPool.deploy(TOKEN_ADDRESS, STAKING_ADDRESS);
  await rewardPool.waitForDeployment();
  const rewardPoolAddress = await rewardPool.getAddress();
  console.log("   ISNADRewardPool deployed to:", rewardPoolAddress);

  await new Promise(r => setTimeout(r, 3000));

  // 3. Deploy TimelockController
  console.log("\n3. Deploying TimelockController...");
  const minDelay = 2 * 24 * 60 * 60; // 2 days
  const TimelockController = await ethers.getContractFactory("TimelockController");
  const timelock = await TimelockController.deploy(
    minDelay,
    [], // proposers - will be set to governor
    [], // executors - will be set to governor
    deployer.address // admin - can be renounced later
  );
  await timelock.waitForDeployment();
  const timelockAddress = await timelock.getAddress();
  console.log("   TimelockController deployed to:", timelockAddress);

  await new Promise(r => setTimeout(r, 3000));

  // 4. Deploy ISNADGovernor
  console.log("\n4. Deploying ISNADGovernor...");
  const ISNADGovernor = await ethers.getContractFactory("ISNADGovernor");
  const governor = await ISNADGovernor.deploy(TOKEN_ADDRESS, timelockAddress);
  await governor.waitForDeployment();
  const governorAddress = await governor.getAddress();
  console.log("   ISNADGovernor deployed to:", governorAddress);

  await new Promise(r => setTimeout(r, 3000));

  // 5. Configure roles
  console.log("\n5. Configuring roles...");
  
  // Grant PROPOSER_ROLE and EXECUTOR_ROLE to governor
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
  const CANCELLER_ROLE = await timelock.CANCELLER_ROLE();
  
  await timelock.grantRole(PROPOSER_ROLE, governorAddress);
  console.log("   Granted PROPOSER_ROLE to Governor");
  
  await timelock.grantRole(EXECUTOR_ROLE, governorAddress);
  console.log("   Granted EXECUTOR_ROLE to Governor");
  
  await timelock.grantRole(CANCELLER_ROLE, governorAddress);
  console.log("   Granted CANCELLER_ROLE to Governor");

  // Grant MINTER_ROLE to RewardPool on token (for minting rewards)
  const token = await ethers.getContractAt("ISNADToken", TOKEN_ADDRESS);
  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
  await token.grantRole(MINTER_ROLE, rewardPoolAddress);
  console.log("   Granted MINTER_ROLE to RewardPool");

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("PHASE 2 DEPLOYMENT COMPLETE");
  console.log("=".repeat(50));
  console.log("\nAll contracts:");
  console.log("  ISNADToken:", TOKEN_ADDRESS);
  console.log("  ISNADRegistry:", REGISTRY_ADDRESS);
  console.log("  ISNADStaking:", STAKING_ADDRESS);
  console.log("  ISNADOracle:", oracleAddress);
  console.log("  ISNADRewardPool:", rewardPoolAddress);
  console.log("  TimelockController:", timelockAddress);
  console.log("  ISNADGovernor:", governorAddress);
  
  console.log("\nUpdate web/src/lib/contracts.ts with:");
  console.log(`  oracle: '${oracleAddress}',`);
  console.log(`  rewardPool: '${rewardPoolAddress}',`);
  console.log(`  timelock: '${timelockAddress}',`);
  console.log(`  governor: '${governorAddress}',`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
