import { ethers } from "hardhat";

/**
 * ISNAD Mainnet Deployment Script
 * 
 * This script deploys the ISNAD protocol contracts using an existing token
 * (from Clawnch/Clanker). Since Clawnch tokens don't have BURNER/MINTER roles,
 * we use workarounds:
 * - Slashing: transfers tokens to BURN_ADDRESS instead of burning
 * - Rewards: pre-funded pool instead of minting
 * 
 * Usage:
 *   export PRIVATE_KEY=<deployer-private-key>
 *   export ISNAD_TOKEN=<clawnch-token-address>
 *   npx hardhat run scripts/deploy-mainnet.ts --network base
 */

// Note: ISNADStakingV2 has burn address hardcoded (0x...dEaD)
// This works with any ERC20, including Clawnch/Clanker tokens

async function main() {
  // Validate environment
  const tokenAddress = process.env.ISNAD_TOKEN;
  if (!tokenAddress) {
    throw new Error("ISNAD_TOKEN environment variable not set. Set it to the Clawnch token address.");
  }

  const [deployer] = await ethers.getSigners();
  
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║           ISNAD MAINNET DEPLOYMENT (Base L2)           ║");
  console.log("╚════════════════════════════════════════════════════════╝");
  console.log("");
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("Token:", tokenAddress);
  console.log("");

  // Verify token exists
  const tokenCode = await ethers.provider.getCode(tokenAddress);
  if (tokenCode === "0x") {
    throw new Error(`No contract found at token address: ${tokenAddress}`);
  }
  console.log("✓ Token contract verified");

  const deployedContracts: Record<string, string> = {
    token: tokenAddress,
  };

  // 1. Deploy ISNADRegistry
  console.log("\n[1/6] Deploying ISNADRegistry...");
  const ISNADRegistry = await ethers.getContractFactory("ISNADRegistry");
  const registry = await ISNADRegistry.deploy();
  await registry.waitForDeployment();
  deployedContracts.registry = await registry.getAddress();
  console.log("       ✓", deployedContracts.registry);

  await sleep(3000);

  // 2. Deploy ISNADStakingV2 (compatible with any ERC20)
  console.log("\n[2/6] Deploying ISNADStakingV2...");
  const ISNADStakingV2 = await ethers.getContractFactory("ISNADStakingV2");
  const staking = await ISNADStakingV2.deploy(tokenAddress, deployer.address);
  await staking.waitForDeployment();
  deployedContracts.staking = await staking.getAddress();
  console.log("       ✓", deployedContracts.staking);

  await sleep(3000);

  // 3. Deploy ISNADOracle
  console.log("\n[3/6] Deploying ISNADOracle...");
  const ISNADOracle = await ethers.getContractFactory("ISNADOracle");
  const oracle = await ISNADOracle.deploy(deployedContracts.staking);
  await oracle.waitForDeployment();
  deployedContracts.oracle = await oracle.getAddress();
  console.log("       ✓", deployedContracts.oracle);

  await sleep(3000);

  // 4. Deploy ISNADRewardPool
  console.log("\n[4/6] Deploying ISNADRewardPool...");
  const ISNADRewardPool = await ethers.getContractFactory("ISNADRewardPool");
  const rewardPool = await ISNADRewardPool.deploy(tokenAddress, deployedContracts.staking);
  await rewardPool.waitForDeployment();
  deployedContracts.rewardPool = await rewardPool.getAddress();
  console.log("       ✓", deployedContracts.rewardPool);

  await sleep(3000);

  // 5. Deploy TimelockController
  console.log("\n[5/6] Deploying TimelockController...");
  const minDelay = 2 * 24 * 60 * 60; // 2 days
  const TimelockController = await ethers.getContractFactory("TimelockController");
  const timelock = await TimelockController.deploy(
    minDelay,
    [], // proposers - will be set to governor
    [], // executors - will be set to governor
    deployer.address // admin
  );
  await timelock.waitForDeployment();
  deployedContracts.timelock = await timelock.getAddress();
  console.log("       ✓", deployedContracts.timelock);

  await sleep(3000);

  // 6. Deploy ISNADGovernor
  console.log("\n[6/6] Deploying ISNADGovernor...");
  const ISNADGovernor = await ethers.getContractFactory("ISNADGovernor");
  const governor = await ISNADGovernor.deploy(tokenAddress, deployedContracts.timelock);
  await governor.waitForDeployment();
  deployedContracts.governor = await governor.getAddress();
  console.log("       ✓", deployedContracts.governor);

  await sleep(3000);

  // Configure roles
  console.log("\n[Roles] Configuring governance roles...");
  
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
  const CANCELLER_ROLE = await timelock.CANCELLER_ROLE();
  
  await timelock.grantRole(PROPOSER_ROLE, deployedContracts.governor);
  console.log("       ✓ PROPOSER_ROLE → Governor");
  
  await timelock.grantRole(EXECUTOR_ROLE, deployedContracts.governor);
  console.log("       ✓ EXECUTOR_ROLE → Governor");
  
  await timelock.grantRole(CANCELLER_ROLE, deployedContracts.governor);
  console.log("       ✓ CANCELLER_ROLE → Governor");

  // Grant ORACLE_ROLE to oracle contract on staking
  const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));
  await staking.grantRole(ORACLE_ROLE, deployedContracts.oracle);
  console.log("       ✓ ORACLE_ROLE → Oracle");

  // Summary
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║              DEPLOYMENT COMPLETE ✓                     ║");
  console.log("╚════════════════════════════════════════════════════════╝");
  
  console.log("\n📋 Contract Addresses (copy to contracts.ts):\n");
  console.log("  8453: {");
  console.log(`    token: '${deployedContracts.token}',`);
  console.log(`    registry: '${deployedContracts.registry}',`);
  console.log(`    staking: '${deployedContracts.staking}',`);
  console.log(`    oracle: '${deployedContracts.oracle}',`);
  console.log(`    rewardPool: '${deployedContracts.rewardPool}',`);
  console.log(`    timelock: '${deployedContracts.timelock}',`);
  console.log(`    governor: '${deployedContracts.governor}',`);
  console.log("  },");

  console.log("\n🔗 BaseScan verification commands:\n");
  for (const [name, address] of Object.entries(deployedContracts)) {
    if (name !== 'token') {
      console.log(`npx hardhat verify --network base ${address}`);
    }
  }

  console.log("\n⚠️  NEXT STEPS:");
  console.log("1. Verify contracts on BaseScan (commands above)");
  console.log("2. Update web/src/lib/contracts.ts");
  console.log("3. Update api/.env with new addresses");
  console.log("4. Update @isnad/cli and npm publish");
  console.log("5. Fund RewardPool with tokens for auditor rewards");

  // Write deployment output to file
  const fs = await import('fs');
  const output = {
    network: "base",
    chainId: 8453,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: deployedContracts,
  };
  fs.writeFileSync(
    'deployments/base-mainnet.json',
    JSON.stringify(output, null, 2)
  );
  console.log("\n💾 Deployment saved to deployments/base-mainnet.json");
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
