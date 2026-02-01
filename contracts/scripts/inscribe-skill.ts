import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Inscribing with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Load skill file
  const skillPath = path.join(__dirname, "../../skill/SKILL.md");
  const skillContent = fs.readFileSync(skillPath);
  console.log("Skill file size:", skillContent.length, "bytes");

  // Compute sha256 hash
  const hash = crypto.createHash("sha256").update(skillContent).digest();
  const contentHash = "0x" + hash.toString("hex");
  console.log("Content hash:", contentHash);

  // Connect to Registry
  const registryAddress = "0xb8264f3117b498ddF912EBF641B2301103D80f06";
  const registry = await ethers.getContractAt("ISNADRegistry", registryAddress);

  // Check if already inscribed
  const exists = await registry.exists(contentHash);
  if (exists) {
    console.log("Already inscribed!");
    return;
  }

  // Resource type 0 = SKILL
  const resourceType = 0;
  const metadata = JSON.stringify({
    name: "ISNAD CLI Skill",
    version: "0.1.1",
    description: "Trust Layer for AI Agents - CLI and usage instructions",
    author: "counterspec",
    url: "https://isnad.md"
  });

  console.log("\nInscribing...");
  const tx = await registry.inscribe(
    contentHash,
    resourceType,
    metadata,
    skillContent,
    { gasLimit: 500000 }
  );

  console.log("TX:", tx.hash);
  const receipt = await tx.wait();
  console.log("✅ Inscribed in block:", receipt?.blockNumber);
  console.log("Gas used:", receipt?.gasUsed.toString());
}

main().catch(console.error);
