import { expect } from "chai";
import { ethers } from "hardhat";
import { ISNADToken, ISNADStaking } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("ISNADStaking", function () {
  let token: ISNADToken;
  let staking: ISNADStaking;
  let owner: SignerWithAddress;
  let oracle: SignerWithAddress;
  let auditor1: SignerWithAddress;
  let auditor2: SignerWithAddress;
  let user: SignerWithAddress;

  const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));
  const BURNER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BURNER_ROLE"));

  const ONE_DAY = 24 * 60 * 60;
  const SEVEN_DAYS = 7 * ONE_DAY;
  const THIRTY_DAYS = 30 * ONE_DAY;
  const NINETY_DAYS = 90 * ONE_DAY;

  const STAKE_AMOUNT = ethers.parseEther("1000");
  const RESOURCE_HASH = ethers.keccak256(ethers.toUtf8Bytes("test-resource-v1"));

  beforeEach(async function () {
    [owner, oracle, auditor1, auditor2, user] = await ethers.getSigners();

    // Deploy token
    const ISNADToken = await ethers.getContractFactory("ISNADToken");
    token = await ISNADToken.deploy(owner.address);
    await token.waitForDeployment();

    // Deploy staking
    const ISNADStaking = await ethers.getContractFactory("ISNADStaking");
    staking = await ISNADStaking.deploy(await token.getAddress(), owner.address);
    await staking.waitForDeployment();

    // Setup roles
    await staking.grantRole(ORACLE_ROLE, oracle.address);
    await token.grantRole(BURNER_ROLE, await staking.getAddress());

    // Fund auditors
    await token.transfer(auditor1.address, ethers.parseEther("5000"));
    await token.transfer(auditor2.address, ethers.parseEther("5000"));

    // Approve staking contract
    await token.connect(auditor1).approve(await staking.getAddress(), ethers.MaxUint256);
    await token.connect(auditor2).approve(await staking.getAddress(), ethers.MaxUint256);
  });

  describe("Deployment", function () {
    it("should set correct token address", async function () {
      expect(await staking.token()).to.equal(await token.getAddress());
    });

    it("should set owner as default admin", async function () {
      expect(await staking.hasRole(ethers.ZeroHash, owner.address)).to.be.true;
    });

    it("should have zero initial total staked", async function () {
      expect(await staking.totalStaked()).to.equal(0n);
    });
  });

  describe("Staking", function () {
    it("should lock tokens when staking", async function () {
      const balanceBefore = await token.balanceOf(auditor1.address);
      
      await staking.connect(auditor1).stake(RESOURCE_HASH, STAKE_AMOUNT, SEVEN_DAYS);
      
      expect(await token.balanceOf(auditor1.address)).to.equal(balanceBefore - STAKE_AMOUNT);
      expect(await token.balanceOf(await staking.getAddress())).to.equal(STAKE_AMOUNT);
    });

    it("should emit Staked event", async function () {
      const tx = staking.connect(auditor1).stake(RESOURCE_HASH, STAKE_AMOUNT, SEVEN_DAYS);
      
      await expect(tx)
        .to.emit(staking, "Staked")
        .withArgs(
          (v: any) => typeof v === "string", // attestationId (any)
          auditor1.address,
          RESOURCE_HASH,
          STAKE_AMOUNT,
          (v: any) => v > 0, // lockUntil
          SEVEN_DAYS
        );
    });

    it("should update resource total stake", async function () {
      await staking.connect(auditor1).stake(RESOURCE_HASH, STAKE_AMOUNT, SEVEN_DAYS);
      expect(await staking.resourceTotalStake(RESOURCE_HASH)).to.equal(STAKE_AMOUNT);
    });

    it("should update auditor total stake", async function () {
      await staking.connect(auditor1).stake(RESOURCE_HASH, STAKE_AMOUNT, SEVEN_DAYS);
      expect(await staking.auditorTotalStake(auditor1.address)).to.equal(STAKE_AMOUNT);
    });

    it("should revert on zero amount", async function () {
      await expect(
        staking.connect(auditor1).stake(RESOURCE_HASH, 0, SEVEN_DAYS)
      ).to.be.revertedWith("Amount must be positive");
    });

    it("should revert on invalid resource hash", async function () {
      await expect(
        staking.connect(auditor1).stake(ethers.ZeroHash, STAKE_AMOUNT, SEVEN_DAYS)
      ).to.be.revertedWith("Invalid resource hash");
    });

    it("should revert on lock too short", async function () {
      await expect(
        staking.connect(auditor1).stake(RESOURCE_HASH, STAKE_AMOUNT, ONE_DAY)
      ).to.be.revertedWith("Lock too short");
    });

    it("should revert on lock too long", async function () {
      await expect(
        staking.connect(auditor1).stake(RESOURCE_HASH, STAKE_AMOUNT, NINETY_DAYS + ONE_DAY)
      ).to.be.revertedWith("Lock too long");
    });

    it("should enforce max stake per auditor", async function () {
      const maxStake = ethers.parseEther("10000");
      await token.transfer(auditor1.address, maxStake);
      
      await expect(
        staking.connect(auditor1).stake(RESOURCE_HASH, maxStake + 1n, SEVEN_DAYS)
      ).to.be.revertedWith("Exceeds max stake per auditor");
    });
  });

  describe("Unstaking", function () {
    let attestationId: string;

    beforeEach(async function () {
      const tx = await staking.connect(auditor1).stake(RESOURCE_HASH, STAKE_AMOUNT, SEVEN_DAYS);
      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log) => staking.interface.parseLog(log as any)?.name === "Staked"
      );
      attestationId = staking.interface.parseLog(event as any)?.args[0];
    });

    it("should revert if still locked", async function () {
      await expect(
        staking.connect(auditor1).unstake(attestationId)
      ).to.be.revertedWith("Still locked");
    });

    it("should return tokens after lock expires", async function () {
      await time.increase(SEVEN_DAYS);
      
      const balanceBefore = await token.balanceOf(auditor1.address);
      await staking.connect(auditor1).unstake(attestationId);
      
      expect(await token.balanceOf(auditor1.address)).to.equal(balanceBefore + STAKE_AMOUNT);
    });

    it("should emit Unstaked event", async function () {
      await time.increase(SEVEN_DAYS);
      
      await expect(staking.connect(auditor1).unstake(attestationId))
        .to.emit(staking, "Unstaked")
        .withArgs(attestationId, auditor1.address, STAKE_AMOUNT);
    });

    it("should update totals on unstake", async function () {
      await time.increase(SEVEN_DAYS);
      await staking.connect(auditor1).unstake(attestationId);
      
      expect(await staking.totalStaked()).to.equal(0n);
      expect(await staking.resourceTotalStake(RESOURCE_HASH)).to.equal(0n);
      expect(await staking.auditorTotalStake(auditor1.address)).to.equal(0n);
    });

    it("should revert if not owner of attestation", async function () {
      await time.increase(SEVEN_DAYS);
      
      await expect(
        staking.connect(auditor2).unstake(attestationId)
      ).to.be.revertedWith("Not your attestation");
    });

    it("should revert on double unstake", async function () {
      await time.increase(SEVEN_DAYS);
      await staking.connect(auditor1).unstake(attestationId);
      
      await expect(
        staking.connect(auditor1).unstake(attestationId)
      ).to.be.revertedWith("No stake found");
    });
  });

  describe("Slashing", function () {
    let attestationId: string;

    beforeEach(async function () {
      const tx = await staking.connect(auditor1).stake(RESOURCE_HASH, STAKE_AMOUNT, SEVEN_DAYS);
      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log) => staking.interface.parseLog(log as any)?.name === "Staked"
      );
      attestationId = staking.interface.parseLog(event as any)?.args[0];
    });

    it("should only allow ORACLE_ROLE to slash", async function () {
      await expect(
        staking.connect(auditor2).slash(attestationId)
      ).to.be.revertedWithCustomError(staking, "AccessControlUnauthorizedAccount");
    });

    it("should burn tokens on slash", async function () {
      const totalSupplyBefore = await token.totalSupply();
      
      await staking.connect(oracle).slash(attestationId);
      
      expect(await token.totalSupply()).to.equal(totalSupplyBefore - STAKE_AMOUNT);
    });

    it("should emit Slashed event", async function () {
      await expect(staking.connect(oracle).slash(attestationId))
        .to.emit(staking, "Slashed")
        .withArgs(attestationId, auditor1.address, RESOURCE_HASH, STAKE_AMOUNT);
    });

    it("should mark attestation as slashed", async function () {
      await staking.connect(oracle).slash(attestationId);
      
      const att = await staking.getAttestation(attestationId);
      expect(att.slashed).to.be.true;
      expect(att.amount).to.equal(0n);
    });

    it("should update totals on slash", async function () {
      await staking.connect(oracle).slash(attestationId);
      
      expect(await staking.totalStaked()).to.equal(0n);
      expect(await staking.resourceTotalStake(RESOURCE_HASH)).to.equal(0n);
      expect(await staking.auditorTotalStake(auditor1.address)).to.equal(0n);
    });

    it("should revert on double slash", async function () {
      await staking.connect(oracle).slash(attestationId);
      
      await expect(
        staking.connect(oracle).slash(attestationId)
      ).to.be.revertedWith("Already slashed");
    });

    it("should prevent unstaking slashed attestation", async function () {
      await staking.connect(oracle).slash(attestationId);
      await time.increase(SEVEN_DAYS);
      
      await expect(
        staking.connect(auditor1).unstake(attestationId)
      ).to.be.revertedWith("Attestation slashed");
    });
  });

  describe("Trust Score", function () {
    it("should calculate basic trust score", async function () {
      await staking.connect(auditor1).stake(RESOURCE_HASH, STAKE_AMOUNT, SEVEN_DAYS);
      
      // 7 day lock = 1x multiplier
      expect(await staking.getTrustScore(RESOURCE_HASH)).to.equal(STAKE_AMOUNT);
    });

    it("should apply 1.5x multiplier for 30 day lock", async function () {
      await staking.connect(auditor1).stake(RESOURCE_HASH, STAKE_AMOUNT, THIRTY_DAYS);
      
      // 30 day lock = 1.5x
      const expected = (STAKE_AMOUNT * 150n) / 100n;
      expect(await staking.getTrustScore(RESOURCE_HASH)).to.equal(expected);
    });

    it("should apply 2x multiplier for 90 day lock", async function () {
      await staking.connect(auditor1).stake(RESOURCE_HASH, STAKE_AMOUNT, NINETY_DAYS);
      
      // 90 day lock = 2x
      const expected = STAKE_AMOUNT * 2n;
      expect(await staking.getTrustScore(RESOURCE_HASH)).to.equal(expected);
    });

    it("should aggregate multiple attestations", async function () {
      // Use amounts that respect whale cap (33% max per auditor when others have staked)
      // auditor1 stakes 2000 (first staker, gets 100%)
      // auditor2 stakes 1000 → auditor2 has 1000/3000 = 33%
      const amount1 = ethers.parseEther("2000");
      const amount2 = ethers.parseEther("1000");
      
      await staking.connect(auditor1).stake(RESOURCE_HASH, amount1, SEVEN_DAYS);
      await staking.connect(auditor2).stake(RESOURCE_HASH, amount2, THIRTY_DAYS);
      
      // 2000 * 1.0 + 1000 * 1.5 = 3500
      const expected = amount1 + (amount2 * 150n) / 100n;
      expect(await staking.getTrustScore(RESOURCE_HASH)).to.equal(expected);
    });

    it("should return 0 for unknown resource", async function () {
      const unknownHash = ethers.keccak256(ethers.toUtf8Bytes("unknown"));
      expect(await staking.getTrustScore(unknownHash)).to.equal(0n);
    });

    it("should not count slashed attestations", async function () {
      const tx = await staking.connect(auditor1).stake(RESOURCE_HASH, STAKE_AMOUNT, SEVEN_DAYS);
      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log) => staking.interface.parseLog(log as any)?.name === "Staked"
      );
      const attestationId = staking.interface.parseLog(event as any)?.args[0];

      await staking.connect(oracle).slash(attestationId);
      
      expect(await staking.getTrustScore(RESOURCE_HASH)).to.equal(0n);
    });
  });

  describe("Trust Tier", function () {
    it("should return tier 0 for no stake", async function () {
      expect(await staking.getTrustTier(RESOURCE_HASH)).to.equal(0);
    });

    it("should return tier 1 for >= 100 ISNAD", async function () {
      await staking.connect(auditor1).stake(RESOURCE_HASH, ethers.parseEther("100"), SEVEN_DAYS);
      expect(await staking.getTrustTier(RESOURCE_HASH)).to.equal(1);
    });

    it("should return tier 2 for >= 1000 ISNAD", async function () {
      await staking.connect(auditor1).stake(RESOURCE_HASH, ethers.parseEther("1000"), SEVEN_DAYS);
      expect(await staking.getTrustTier(RESOURCE_HASH)).to.equal(2);
    });

    it("should return tier 3 for >= 10000 ISNAD", async function () {
      await token.transfer(auditor1.address, ethers.parseEther("10000"));
      await staking.connect(auditor1).stake(RESOURCE_HASH, ethers.parseEther("10000"), SEVEN_DAYS);
      expect(await staking.getTrustTier(RESOURCE_HASH)).to.equal(3);
    });

    it("should consider lock multipliers in tier calculation", async function () {
      // 5000 * 2x = 10000 weighted score = tier 3
      await staking.connect(auditor1).stake(RESOURCE_HASH, ethers.parseEther("5000"), NINETY_DAYS);
      expect(await staking.getTrustTier(RESOURCE_HASH)).to.equal(3);
    });
  });

  describe("Queries", function () {
    beforeEach(async function () {
      await staking.connect(auditor1).stake(RESOURCE_HASH, STAKE_AMOUNT, SEVEN_DAYS);
      await staking.connect(auditor1).stake(RESOURCE_HASH, STAKE_AMOUNT, THIRTY_DAYS);
      await staking.connect(auditor2).stake(RESOURCE_HASH, STAKE_AMOUNT, NINETY_DAYS);
    });

    it("should return resource attestations", async function () {
      const attIds = await staking.getResourceAttestations(RESOURCE_HASH);
      expect(attIds.length).to.equal(3);
    });

    it("should return auditor attestations", async function () {
      const attIds = await staking.getAuditorAttestations(auditor1.address);
      expect(attIds.length).to.equal(2);
    });

    it("should return attestation details", async function () {
      const attIds = await staking.getAuditorAttestations(auditor1.address);
      const att = await staking.getAttestation(attIds[0]);
      
      expect(att.auditor).to.equal(auditor1.address);
      expect(att.resourceHash).to.equal(RESOURCE_HASH);
      expect(att.amount).to.equal(STAKE_AMOUNT);
      expect(att.slashed).to.be.false;
    });
  });
});
