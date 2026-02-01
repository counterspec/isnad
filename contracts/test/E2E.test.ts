import { expect } from "chai";
import { ethers } from "hardhat";
import { 
  ISNADToken, 
  ISNADRegistry, 
  ISNADStaking,
  ISNADOracle,
  ISNADRewardPool
} from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { createHash } from "crypto";

// Helper to compute SHA-256 hash
function sha256Hash(data: Uint8Array): `0x${string}` {
  const hash = createHash('sha256').update(data).digest();
  return `0x${hash.toString('hex')}` as `0x${string}`;
}

describe("ISNAD E2E Integration", function () {
  let token: ISNADToken;
  let registry: ISNADRegistry;
  let staking: ISNADStaking;
  let oracle: ISNADOracle;
  let rewardPool: ISNADRewardPool;

  let owner: SignerWithAddress;
  let skillAuthor: SignerWithAddress;
  let auditor1: SignerWithAddress;
  let auditor2: SignerWithAddress;
  let auditor3: SignerWithAddress;
  let flagger: SignerWithAddress;
  let juror1: SignerWithAddress;
  let juror2: SignerWithAddress;
  let juror3: SignerWithAddress;
  let juror4: SignerWithAddress;
  let juror5: SignerWithAddress;

  const INITIAL_SUPPLY = ethers.parseEther("100000000"); // 100M
  const STAKE_AMOUNT = ethers.parseEther("100"); // Low enough to avoid 33% concentration cap with multiple stakers
  const LOCK_DURATION = 90 * 24 * 60 * 60; // 90 days
  const MIN_FLAG_DEPOSIT = ethers.parseEther("100");

  // Skill content - must compute SHA-256 hash
  const SKILL_METADATA = "{\"name\":\"weather\",\"version\":\"1.0.0\",\"author\":\"openclaw\"}";
  
  // Helper to create unique skill bytes for each test
  function createSkillBytes(suffix: string): Uint8Array {
    const content = `ISNAD|v1|SKILL|NONE|${SKILL_METADATA}|<skill content ${suffix}>`;
    return ethers.toUtf8Bytes(content);
  }

  beforeEach(async function () {
    [
      owner, skillAuthor, auditor1, auditor2, auditor3, 
      flagger, juror1, juror2, juror3, juror4, juror5
    ] = await ethers.getSigners();

    // 1. Deploy all contracts
    const Token = await ethers.getContractFactory("ISNADToken");
    token = await Token.deploy(owner.address);
    await token.waitForDeployment();

    const Registry = await ethers.getContractFactory("ISNADRegistry");
    registry = await Registry.deploy();
    await registry.waitForDeployment();

    const Staking = await ethers.getContractFactory("ISNADStaking");
    staking = await Staking.deploy(await token.getAddress(), owner.address);
    await staking.waitForDeployment();

    const Oracle = await ethers.getContractFactory("ISNADOracle");
    oracle = await Oracle.deploy(await staking.getAddress());
    await oracle.waitForDeployment();

    const RewardPool = await ethers.getContractFactory("ISNADRewardPool");
    rewardPool = await RewardPool.deploy(
      await token.getAddress(),
      await staking.getAddress()
    );
    await rewardPool.waitForDeployment();

    // 2. Configure roles
    const BURNER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BURNER_ROLE"));
    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    await token.grantRole(BURNER_ROLE, await staking.getAddress());
    await token.grantRole(MINTER_ROLE, await rewardPool.getAddress());

    // 3. Distribute tokens to auditors
    const auditorAmount = ethers.parseEther("10000");
    await token.transfer(auditor1.address, auditorAmount);
    await token.transfer(auditor2.address, auditorAmount);
    await token.transfer(auditor3.address, auditorAmount);

    // 4. Fund reward pool
    await token.transfer(await rewardPool.getAddress(), ethers.parseEther("1000000"));

    // 5. Add jurors to oracle pool
    await oracle.batchAddToJurorPool([
      juror1.address, juror2.address, juror3.address, 
      juror4.address, juror5.address
    ]);
  });

  describe("Full Attestation Flow", function () {
    it("should complete full attestation lifecycle", async function () {
      // Step 1: Skill author inscribes resource
      console.log("1. Inscribing resource...");
      const skillBytes = createSkillBytes("attestation-test");
      const contentHash = sha256Hash(skillBytes);
      
      await registry.connect(skillAuthor).inscribe(
        contentHash,
        0, // SKILL type
        SKILL_METADATA,
        skillBytes
      );

      // Verify inscription
      const [inscribed, resourceAuthor] = await registry.getResource(contentHash);
      expect(inscribed).to.be.true;
      expect(resourceAuthor).to.equal(skillAuthor.address);

      // Step 2: Single auditor stakes (simpler test)
      console.log("2. Auditor attesting...");
      
      await token.connect(auditor1).approve(await staking.getAddress(), STAKE_AMOUNT);
      await staking.connect(auditor1).stake(contentHash, STAKE_AMOUNT, LOCK_DURATION);

      // Step 3: Check trust score (90 day lock = 2x multiplier)
      console.log("3. Checking trust score...");
      const trustScore = await staking.getTrustScore(contentHash);
      expect(trustScore).to.equal(STAKE_AMOUNT * 2n); // 100 * 2x = 200

      const trustTier = await staking.getTrustTier(contentHash);
      // 100 tokens = COMMUNITY tier (>= 100 tokens)
      expect(trustTier).to.be.gte(1);

      // Step 4: Verify auditor attestations
      console.log("4. Verifying attestations...");
      const attestations = await staking.getResourceAttestations(contentHash);
      expect(attestations.length).to.equal(1);

      console.log("✅ Full attestation flow completed successfully!");
    });
  });

  describe("Full Detection Flow", function () {
    let contentHash: `0x${string}`;
    let skillBytes: Uint8Array;

    beforeEach(async function () {
      // Setup: inscribe and attest to a resource (unique per test)
      skillBytes = createSkillBytes(`detection-${Date.now()}`);
      contentHash = sha256Hash(skillBytes);
      await registry.connect(skillAuthor).inscribe(
        contentHash, 0, SKILL_METADATA, skillBytes
      );

      await token.connect(auditor1).approve(await staking.getAddress(), STAKE_AMOUNT);
      await staking.connect(auditor1).stake(contentHash, STAKE_AMOUNT, LOCK_DURATION);
    });

    it("should complete full detection lifecycle (guilty verdict)", async function () {
      // Step 1: Flag the resource
      console.log("1. Flagging resource...");
      const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("malicious-code-evidence"));
      
      await oracle.connect(flagger).flagResource(
        contentHash,
        evidenceHash,
        { value: MIN_FLAG_DEPOSIT }
      );

      const flagId = await oracle.activeFlag(contentHash);
      expect(flagId).to.not.equal(ethers.ZeroHash);

      // Step 2: Jury votes (simulate 4 guilty, 1 innocent)
      console.log("2. Jury voting...");
      const jury = await oracle.getJury(flagId);
      expect(jury.length).to.equal(5);

      const allJurors = [juror1, juror2, juror3, juror4, juror5];
      let guiltyCount = 0;

      for (const jurorAddr of jury) {
        const signer = allJurors.find(j => j.address === jurorAddr);
        if (signer) {
          const voteGuilty = guiltyCount < 4; // First 4 vote guilty
          await oracle.connect(signer).vote(flagId, voteGuilty);
          if (voteGuilty) guiltyCount++;
        }
      }

      // Step 3: Verify verdict
      console.log("3. Verifying verdict...");
      const flag = await oracle.getFlag(flagId);
      expect(flag.status).to.equal(2); // Guilty

      console.log("✅ Full detection flow completed successfully!");
    });

    it("should complete full detection lifecycle (innocent verdict)", async function () {
      // Step 1: Flag the resource
      const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("weak-evidence"));
      await oracle.connect(flagger).flagResource(
        contentHash,
        evidenceHash,
        { value: MIN_FLAG_DEPOSIT }
      );

      const flagId = await oracle.activeFlag(contentHash);

      // Step 2: Jury votes (simulate 4 innocent, 1 guilty)
      const jury = await oracle.getJury(flagId);
      const allJurors = [juror1, juror2, juror3, juror4, juror5];
      let innocentCount = 0;

      for (const jurorAddr of jury) {
        const signer = allJurors.find(j => j.address === jurorAddr);
        if (signer) {
          const voteInnocent = innocentCount < 4;
          await oracle.connect(signer).vote(flagId, !voteInnocent);
          if (voteInnocent) innocentCount++;
        }
      }

      // Step 3: Verify verdict
      const flag = await oracle.getFlag(flagId);
      expect(flag.status).to.equal(3); // Innocent

      console.log("✅ Innocent verdict flow completed!");
    });
  });

  describe("Reward Distribution Flow", function () {
    it("should track and claim rewards after attestation", async function () {
      // Setup: Give reward pool DISTRIBUTOR_ROLE for staking
      const DISTRIBUTOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("DISTRIBUTOR_ROLE"));
      await rewardPool.grantRole(DISTRIBUTOR_ROLE, owner.address);

      // Step 1: Inscribe resource
      const skillBytes = createSkillBytes("reward-test");
      const contentHash = sha256Hash(skillBytes);
      await registry.connect(skillAuthor).inscribe(
        contentHash, 0, SKILL_METADATA, skillBytes
      );

      // Step 2: Auditor stakes
      await token.connect(auditor1).approve(await staking.getAddress(), STAKE_AMOUNT);
      await staking.connect(auditor1).stake(contentHash, STAKE_AMOUNT, LOCK_DURATION);

      // Step 3: Accrue rewards (simulated - in production this would be called by staking contract)
      await rewardPool.accrueRewards(auditor1.address, STAKE_AMOUNT, LOCK_DURATION);

      // Step 4: Check pending rewards
      const pending = await rewardPool.pendingRewards(auditor1.address);
      expect(pending).to.be.gt(0);

      // Step 5: Claim rewards
      const balanceBefore = await token.balanceOf(auditor1.address);
      await rewardPool.connect(auditor1).claimRewards();
      const balanceAfter = await token.balanceOf(auditor1.address);

      expect(balanceAfter - balanceBefore).to.equal(pending);

      console.log("✅ Reward distribution flow completed!");
      console.log(`   Claimed: ${ethers.formatEther(pending)} $ISNAD`);
    });
  });

  describe("Multi-Auditor Scenario", function () {
    it("should handle multiple auditors with different lock periods", async function () {
      // Inscribe resource
      const skillBytes = createSkillBytes("multi-auditor-test");
      const contentHash = sha256Hash(skillBytes);
      await registry.connect(skillAuthor).inscribe(
        contentHash, 0, SKILL_METADATA, skillBytes
      );

      // Auditor 1 stakes large to give room for others (33% cap)
      const largeStake = STAKE_AMOUNT * 4n; // 400
      const smallStake = STAKE_AMOUNT; // 100
      
      // Auditor 1: 30 day lock (400)
      await token.connect(auditor1).approve(await staking.getAddress(), largeStake);
      await staking.connect(auditor1).stake(contentHash, largeStake, 30 * 24 * 60 * 60);

      // Auditor 2: 60 day lock (100 out of 500 = 20% < 33%)
      await token.connect(auditor2).approve(await staking.getAddress(), smallStake);
      await staking.connect(auditor2).stake(contentHash, smallStake, 60 * 24 * 60 * 60);

      // Auditor 3: 90 day lock (100 out of 600 = 16.7% < 33%) - MAX is 90 days
      await token.connect(auditor3).approve(await staking.getAddress(), smallStake);
      await staking.connect(auditor3).stake(contentHash, smallStake, 90 * 24 * 60 * 60);

      // Verify total stake with multipliers:
      // 400 * 1.5x (30d) + 100 * 1.5x (60d) + 100 * 2x (90d) = 600 + 150 + 200 = 950
      const trustScore = await staking.getTrustScore(contentHash);
      const expected = (largeStake * 150n / 100n) + (smallStake * 150n / 100n) + (smallStake * 200n / 100n);
      expect(trustScore).to.equal(expected);

      // Verify tier (600 tokens = COMMUNITY tier)
      const trustTier = await staking.getTrustTier(contentHash);
      expect(trustTier).to.be.gte(1); // At least COMMUNITY tier

      // Verify attestation count
      const attestations = await staking.getResourceAttestations(contentHash);
      expect(attestations.length).to.equal(3);

      console.log("✅ Multi-auditor scenario completed!");
    });
  });
});
