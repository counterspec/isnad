import { run } from "hardhat";

async function main() {
  // Verify TimelockController
  console.log("Verifying TimelockController...");
  try {
    await run("verify:verify", {
      address: "0x3Ef44fb908C86865A9315277f9AFc6b65A87e702",
      constructorArguments: [
        172800,  // minDelay (2 days)
        [],      // proposers
        [],      // executors
        "0x99B791A86379721Ae139047BefA83Ec7F2b3f46A"  // admin
      ],
    });
    console.log("✓ TimelockController verified");
  } catch (e: any) {
    console.log("TimelockController:", e.message?.slice(0, 100));
  }

  // Verify ISNADGovernor
  console.log("\nVerifying ISNADGovernor...");
  try {
    await run("verify:verify", {
      address: "0xB230Ffa9CA40F705756BC12698119f1B45687cd6",
      constructorArguments: [
        "0x73F6d2BBef125b3A5F91Fe23c722f3C321f007E5",  // token
        "0x3Ef44fb908C86865A9315277f9AFc6b65A87e702"   // timelock
      ],
    });
    console.log("✓ ISNADGovernor verified");
  } catch (e: any) {
    console.log("ISNADGovernor:", e.message?.slice(0, 100));
  }
}

main().catch(console.error);
