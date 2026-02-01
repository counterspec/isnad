import { expect } from "chai";
import { ethers } from "hardhat";
import { ISNADToken, ISNADStaking } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("AutoUnpausable", function () {
  let token: ISNADToken;
  let staking: ISNADStaking;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  const PAUSER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PAUSER_ROLE"));

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("ISNADToken");
    token = await Token.deploy(owner.address);

    const Staking = await ethers.getContractFactory("ISNADStaking");
    staking = await Staking.deploy(await token.getAddress(), owner.address);

    // Give user some tokens
    await token.transfer(user.address, ethers.parseEther("1000"));
    await token.connect(user).approve(await staking.getAddress(), ethers.parseEther("1000"));
  });

  describe("Pause functionality", function () {
    it("should not be paused initially", async function () {
      expect(await staking.paused()).to.equal(false);
    });

    it("should allow PAUSER_ROLE to pause", async function () {
      await staking.pause(3600); // 1 hour
      expect(await staking.paused()).to.equal(true);
    });

    it("should revert pause from non-pauser", async function () {
      await expect(staking.connect(user).pause(3600))
        .to.be.reverted;
    });

    it("should prevent staking while paused", async function () {
      await staking.pause(3600);
      const resourceHash = ethers.keccak256(ethers.toUtf8Bytes("test-resource"));
      
      await expect(
        staking.connect(user).stake(resourceHash, ethers.parseEther("100"), 7 * 24 * 3600)
      ).to.be.revertedWith("Contract is paused");
    });

    it("should allow staking after manual unpause", async function () {
      await staking.pause(3600);
      await staking.unpause();
      
      expect(await staking.paused()).to.equal(false);
      
      const resourceHash = ethers.keccak256(ethers.toUtf8Bytes("test-resource"));
      await expect(
        staking.connect(user).stake(resourceHash, ethers.parseEther("100"), 7 * 24 * 3600)
      ).to.not.be.reverted;
    });

    it("should auto-unpause after duration expires", async function () {
      await staking.pause(3600); // 1 hour
      expect(await staking.paused()).to.equal(true);
      
      // Fast forward 1 hour
      await time.increase(3601);
      
      expect(await staking.paused()).to.equal(false);
    });

    it("should enforce max pause duration of 7 days", async function () {
      const sevenDays = 7 * 24 * 3600;
      const eightDays = 8 * 24 * 3600;
      
      // 7 days should work
      await expect(staking.pause(sevenDays)).to.not.be.reverted;
      await staking.unpause();
      
      // 8 days should fail
      await expect(staking.pause(eightDays))
        .to.be.revertedWith("Invalid duration");
    });

    it("should emit Paused event with correct timestamp", async function () {
      const duration = 3600;
      const tx = await staking.pause(duration);
      const block = await ethers.provider.getBlock(tx.blockNumber!);
      const expectedUntil = block!.timestamp + duration;
      
      await expect(tx)
        .to.emit(staking, "Paused")
        .withArgs(owner.address, expectedUntil);
    });

    it("should emit Unpaused event", async function () {
      await staking.pause(3600);
      
      await expect(staking.unpause())
        .to.emit(staking, "Unpaused")
        .withArgs(owner.address);
    });
  });
});
