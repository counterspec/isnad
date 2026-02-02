import { ethers } from "hardhat";

/**
 * Deploy ISNADRegistry V2 with chunk timeout fix
 * 
 * Migration notes:
 * - V1 Registry: 0xb8264f3117b498ddF912EBF641B2301103D80f06
 * - Historical inscriptions remain valid (data in events)
 * - Indexer needs to watch both V1 + V2 addresses
 * - New inscriptions go to V2
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying ISNADRegistry V2 with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // Deploy new Registry
  const Registry = await ethers.getContractFactory("ISNADRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("\n✅ ISNADRegistry V2 deployed to:", address);
  
  // Verify chunk timeout is set
  const timeout = await registry.CHUNK_TIMEOUT();
  console.log("CHUNK_TIMEOUT:", timeout.toString(), "seconds (", Number(timeout) / 3600, "hours)");

  console.log("\n📋 Post-deployment checklist:");
  console.log("1. Verify on BaseScan: npx hardhat verify --network base", address);
  console.log("2. Update API indexer to watch V2 address");
  console.log("3. Update frontend to use V2 for new inscriptions");
  console.log("4. Update docs with V2 address");
  console.log("5. Announce migration to users");
  
  console.log("\n📝 Update these files:");
  console.log("- isnad/api/src/config.ts (REGISTRY_ADDRESS)");
  console.log("- isnad/web/src/config.ts (REGISTRY_ADDRESS)");
  console.log("- isnad/ROADMAP.md (mark V2 deployed)");

  return address;
}

main()
  .then((address) => {
    console.log("\nDone! Registry V2:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
