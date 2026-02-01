import { expect } from "chai";
import { ethers } from "hardhat";
import { ISNADOracle, ISNADToken, ISNADStaking } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ISNADOracle", function () {
  let oracle: ISNADOracle;
  let token: ISNADToken;
  let staking: ISNADStaking;
  let owner: SignerWithAddress;
  let flagger: SignerWithAddress;
  let juror1: SignerWithAddress;
  let juror2: SignerWithAddress;
  let juror3: SignerWithAddress;
  let juror4: SignerWithAddress;
  let juror5: SignerWithAddress;

  const RESOURCE_HASH = ethers.keccak256(ethers.toUtf8Bytes("test-resource"));
  const EVIDENCE_HASH = ethers.keccak256(ethers.toUtf8Bytes("evidence-ipfs-hash"));
  const MIN_DEPOSIT = ethers.parseEther("100");

  beforeEach(async function () {
    [owner, flagger, juror1, juror2, juror3, juror4, juror5] = await ethers.getSigners();

    // Deploy token
    const Token = await ethers.getContractFactory("ISNADToken");
    token = await Token.deploy(owner.address);
    await token.waitForDeployment();

    // Deploy staking
    const Staking = await ethers.getContractFactory("ISNADStaking");
    staking = await Staking.deploy(await token.getAddress(), owner.address);
    await staking.waitForDeployment();

    // Deploy oracle
    const Oracle = await ethers.getContractFactory("ISNADOracle");
    oracle = await Oracle.deploy(await staking.getAddress());
    await oracle.waitForDeployment();

    // Add jurors to pool
    await oracle.batchAddToJurorPool([
      juror1.address,
      juror2.address,
      juror3.address,
      juror4.address,
      juror5.address,
    ]);
  });

  describe("Flagging", function () {
    it("should flag a resource with sufficient deposit", async function () {
      const tx = await oracle.connect(flagger).flagResource(
        RESOURCE_HASH,
        EVIDENCE_HASH,
        { value: MIN_DEPOSIT }
      );

      const receipt = await tx.wait();
      expect(receipt?.status).to.equal(1);

      // Check flag was created
      const flagId = await oracle.activeFlag(RESOURCE_HASH);
      const flag = await oracle.getFlag(flagId);
      expect(flag.flagger).to.equal(flagger.address);
      expect(flag.resourceHash).to.equal(RESOURCE_HASH);
      expect(flag.deposit).to.equal(MIN_DEPOSIT);
    });

    it("should revert with insufficient deposit", async function () {
      await expect(
        oracle.connect(flagger).flagResource(
          RESOURCE_HASH,
          EVIDENCE_HASH,
          { value: ethers.parseEther("50") }
        )
      ).to.be.revertedWith("Insufficient deposit");
    });

    it("should revert if resource already flagged", async function () {
      await oracle.connect(flagger).flagResource(
        RESOURCE_HASH,
        EVIDENCE_HASH,
        { value: MIN_DEPOSIT }
      );

      await expect(
        oracle.connect(flagger).flagResource(
          RESOURCE_HASH,
          EVIDENCE_HASH,
          { value: MIN_DEPOSIT }
        )
      ).to.be.revertedWith("Resource already flagged");
    });

    it("should auto-select jury when pool is sufficient", async function () {
      const tx = await oracle.connect(flagger).flagResource(
        RESOURCE_HASH,
        EVIDENCE_HASH,
        { value: MIN_DEPOSIT }
      );

      const receipt = await tx.wait();
      const flagId = await oracle.activeFlag(RESOURCE_HASH);
      const flag = await oracle.getFlag(flagId);
      
      // Should be in review (jury selected)
      expect(flag.status).to.equal(1); // InReview

      // Check jury was selected
      const jury = await oracle.getJury(flagId);
      expect(jury.length).to.equal(5);
    });
  });

  describe("Voting", function () {
    let flagId: string;

    beforeEach(async function () {
      await oracle.connect(flagger).flagResource(
        RESOURCE_HASH,
        EVIDENCE_HASH,
        { value: MIN_DEPOSIT }
      );
      flagId = await oracle.activeFlag(RESOURCE_HASH);
    });

    it("should allow juror to vote", async function () {
      const jury = await oracle.getJury(flagId);
      const jurorAddress = jury[0];
      
      // Find the signer for this juror
      const allSigners = [juror1, juror2, juror3, juror4, juror5];
      const jurorSigner = allSigners.find(s => s.address === jurorAddress);
      
      if (jurorSigner) {
        await expect(oracle.connect(jurorSigner).vote(flagId, true))
          .to.emit(oracle, "JurorVoted")
          .withArgs(flagId, jurorAddress, true);
      }
    });

    it("should revert if non-juror tries to vote", async function () {
      await expect(
        oracle.connect(flagger).vote(flagId, true)
      ).to.be.revertedWith("Not a juror");
    });

    it("should revert if juror votes twice", async function () {
      const jury = await oracle.getJury(flagId);
      const jurorAddress = jury[0];
      const allSigners = [juror1, juror2, juror3, juror4, juror5];
      const jurorSigner = allSigners.find(s => s.address === jurorAddress);
      
      if (jurorSigner) {
        await oracle.connect(jurorSigner).vote(flagId, true);
        await expect(
          oracle.connect(jurorSigner).vote(flagId, false)
        ).to.be.revertedWith("Already voted");
      }
    });
  });

  describe("Verdict", function () {
    let flagId: string;

    beforeEach(async function () {
      await oracle.connect(flagger).flagResource(
        RESOURCE_HASH,
        EVIDENCE_HASH,
        { value: MIN_DEPOSIT }
      );
      flagId = await oracle.activeFlag(RESOURCE_HASH);
    });

    it("should reach guilty verdict with supermajority", async function () {
      const jury = await oracle.getJury(flagId);
      const allSigners = [juror1, juror2, juror3, juror4, juror5];
      
      // Have 4 out of 5 vote guilty (80% > 66.67%)
      let votesCount = 0;
      for (const jurorAddr of jury) {
        const signer = allSigners.find(s => s.address === jurorAddr);
        if (signer && votesCount < 4) {
          await oracle.connect(signer).vote(flagId, true);
          votesCount++;
        } else if (signer) {
          await oracle.connect(signer).vote(flagId, false);
        }
      }

      const flag = await oracle.getFlag(flagId);
      expect(flag.status).to.equal(2); // Guilty
    });

    it("should reach innocent verdict when not enough guilty votes", async function () {
      const jury = await oracle.getJury(flagId);
      const allSigners = [juror1, juror2, juror3, juror4, juror5];
      
      // Have 4 out of 5 vote innocent
      let votesCount = 0;
      for (const jurorAddr of jury) {
        const signer = allSigners.find(s => s.address === jurorAddr);
        if (signer && votesCount < 4) {
          await oracle.connect(signer).vote(flagId, false);
          votesCount++;
        } else if (signer) {
          await oracle.connect(signer).vote(flagId, true);
        }
      }

      const flag = await oracle.getFlag(flagId);
      expect(flag.status).to.equal(3); // Innocent
    });
  });

  describe("Juror Pool", function () {
    it("should add juror to pool", async function () {
      const newJuror = ethers.Wallet.createRandom().address;
      await oracle.addToJurorPool(newJuror);
      expect(await oracle.isInJurorPool(newJuror)).to.be.true;
    });

    it("should track pool size", async function () {
      expect(await oracle.getJurorPoolSize()).to.equal(5);
    });

    it("should revert adding duplicate juror", async function () {
      await expect(
        oracle.addToJurorPool(juror1.address)
      ).to.be.revertedWith("Already in pool");
    });
  });
});
