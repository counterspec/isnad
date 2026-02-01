import { ethers } from "hardhat";

async function main() {
  const registry = await ethers.getContractAt("ISNADRegistry", "0xb8264f3117b498ddF912EBF641B2301103D80f06");
  
  const filter = registry.filters.ResourceInscribed();
  const events = await registry.queryFilter(filter, 0, "latest");
  console.log("ResourceInscribed events:", events.length);
  
  for (const e of events) {
    console.log({
      contentHash: e.args?.contentHash,
      resourceType: e.args?.resourceType,
      author: e.args?.author,
      block: e.blockNumber
    });
  }
}

main().catch(console.error);
