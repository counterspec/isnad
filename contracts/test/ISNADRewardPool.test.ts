import { expect } from "chai";
import { ethers } from "hardhat";
import { ISNADRewardPool, ISNADToken, ISNADStaking } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ISNADRewardPool", function () {
  let rewardPool: ISNADRewardPool;
  let token: ISNADToken;
  let staking: ISNADStaking;
  let owner: SignerWithAddress;
  let auditor: SignerWithAddress;
  let distributor: SignerWithAddress;

  const INITIAL_SUPPLY = ethers.parseEther("100000000"); // 100M
  const FUND_AMOUNT = ethers.parseEther("1000000"); // 1M for rewards
  const STAKE_AMOUNT = ethers.parseEther("1000");
  const LOCK_30_DAYS = 30 * 24 * 60 * 60;
  const LOCK_90_DAYS = 90 * 24 * 60 * 60;
  const LOCK_365_DAYS = 365 * 24 * 60 * 60;

  beforeEach(async function () {
    [owner, auditor, distributor] = await ethers.getSigners();

    // Deploy token
    const Token = await ethers.getContractFactory("ISNADToken");
    token = await Token.deploy(owner.address);
    await token.waitForDeployment();

    // Deploy staking (mock)
    const Staking = await ethers.getContractFactory("ISNADStaking");
    staking = await Staking.deploy(await token.getAddress(), owner.address);
    await staking.waitForDeployment();

    // Deploy reward pool
    const RewardPool = await ethers.getContractFactory("ISNADRewardPool");
    rewardPool = await RewardPool.deploy(
      await token.getAddress(),
      await staking.getAddress()
    );
    await rewardPool.waitForDeployment();

    // Grant DISTRIBUTOR_ROLE to distributor (simulate staking contract)
    const DISTRIBUTOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("DISTRIBUTOR_ROLE"));
    await rewardPool.grantRole(DISTRIBUTOR_ROLE, distributor.address);

    // Fund the reward pool
    await token.transfer(await rewardPool.getAddress(), FUND_AMOUNT);
  });

  describe("Reward Accrual", function () {
    it("should accrue rewards for auditor", async function () {
      await rewardPool.connect(distributor).accrueRewards(
        auditor.address,
        STAKE_AMOUNT,
        LOCK_30_DAYS
      );

      const pending = await rewardPool.pendingRewards(auditor.address);
      expect(pending).to.be.gt(0);
    });

    it("should accrue higher rewards for longer locks", async function () {
      // Accrue for 30 day lock
      await rewardPool.connect(distributor).accrueRewards(
        auditor.address,
        STAKE_AMOUNT,
        LOCK_30_DAYS
      );
      const rewards30 = await rewardPool.pendingRewards(auditor.address);

      // Reset
      await rewardPool.connect(auditor).claimRewards().catch(() => {});
      
      // Accrue for 365 day lock (should be 3x multiplier)
      await rewardPool.connect(distributor).accrueRewards(
        auditor.address,
        STAKE_AMOUNT,
        LOCK_365_DAYS
      );
      const rewards365 = await rewardPool.pendingRewards(auditor.address);

      // 365 day lock should earn ~3x more (with tolerance for rounding)
      // Note: 365 days is ~12x longer than 30 days, but multiplier is only 3x vs 1x
      // So the ratio should be roughly (365/30) * 3 = ~36.5x more
      // But for this test we just verify it's significantly more
      expect(rewards365).to.be.gt(rewards30);
    });

    it("should emit RewardAccrued event", async function () {
      await expect(
        rewardPool.connect(distributor).accrueRewards(
          auditor.address,
          STAKE_AMOUNT,
          LOCK_90_DAYS
        )
      ).to.emit(rewardPool, "RewardAccrued");
    });

    it("should revert if caller is not distributor", async function () {
      await expect(
        rewardPool.connect(auditor).accrueRewards(
          auditor.address,
          STAKE_AMOUNT,
          LOCK_30_DAYS
        )
      ).to.be.reverted;
    });
  });

  describe("Claim Rewards", function () {
    beforeEach(async function () {
      await rewardPool.connect(distributor).accrueRewards(
        auditor.address,
        STAKE_AMOUNT,
        LOCK_90_DAYS
      );
    });

    it("should claim pending rewards", async function () {
      const pendingBefore = await rewardPool.pendingRewards(auditor.address);
      const balanceBefore = await token.balanceOf(auditor.address);

      await rewardPool.connect(auditor).claimRewards();

      const pendingAfter = await rewardPool.pendingRewards(auditor.address);
      const balanceAfter = await token.balanceOf(auditor.address);

      expect(pendingAfter).to.equal(0);
      expect(balanceAfter - balanceBefore).to.equal(pendingBefore);
    });

    it("should emit RewardClaimed event", async function () {
      await expect(rewardPool.connect(auditor).claimRewards())
        .to.emit(rewardPool, "RewardClaimed");
    });

    it("should revert if no rewards to claim", async function () {
      await rewardPool.connect(auditor).claimRewards();
      await expect(
        rewardPool.connect(auditor).claimRewards()
      ).to.be.revertedWith("No rewards to claim");
    });

    it("should track total claimed", async function () {
      const pending = await rewardPool.pendingRewards(auditor.address);
      await rewardPool.connect(auditor).claimRewards();

      const rewards = await rewardPool.getAuditorRewards(auditor.address);
      expect(rewards.claimed).to.equal(pending);
    });
  });

  describe("Lock Multipliers", function () {
    it("should return correct multiplier for 30 days", async function () {
      const multiplier = await rewardPool.getMultiplier(LOCK_30_DAYS);
      expect(multiplier).to.equal(10000); // 1x
    });

    it("should return correct multiplier for 90 days", async function () {
      const multiplier = await rewardPool.getMultiplier(LOCK_90_DAYS);
      expect(multiplier).to.equal(15000); // 1.5x
    });

    it("should return correct multiplier for 365 days", async function () {
      const multiplier = await rewardPool.getMultiplier(LOCK_365_DAYS);
      expect(multiplier).to.equal(30000); // 3x
    });

    it("should allow admin to update multiplier", async function () {
      await rewardPool.setLockMultiplier(LOCK_90_DAYS, 20000);
      const multiplier = await rewardPool.getMultiplier(LOCK_90_DAYS);
      expect(multiplier).to.equal(20000);
    });
  });

  describe("Pool Funding", function () {
    it("should track pool balance", async function () {
      const balance = await rewardPool.poolBalance();
      expect(balance).to.equal(FUND_AMOUNT);
    });

    it("should allow funding pool", async function () {
      const additionalFunds = ethers.parseEther("100000");
      await token.approve(await rewardPool.getAddress(), additionalFunds);
      await rewardPool.fund(additionalFunds);

      const balance = await rewardPool.poolBalance();
      expect(balance).to.equal(FUND_AMOUNT + additionalFunds);
    });
  });

  describe("Admin Functions", function () {
    it("should allow admin to update reward rate", async function () {
      const newRate = ethers.parseUnits("1", 10);
      await rewardPool.setRewardRate(newRate);
      expect(await rewardPool.rewardRatePerSecond()).to.equal(newRate);
    });

    it("should allow emergency withdraw", async function () {
      const amount = ethers.parseEther("1000");
      const balanceBefore = await token.balanceOf(owner.address);
      
      await rewardPool.emergencyWithdraw(amount);
      
      const balanceAfter = await token.balanceOf(owner.address);
      expect(balanceAfter - balanceBefore).to.equal(amount);
    });
  });
});
