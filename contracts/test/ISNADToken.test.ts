import { expect } from "chai";
import { ethers } from "hardhat";
import { ISNADToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ISNADToken", function () {
  let token: ISNADToken;
  let owner: SignerWithAddress;
  let minter: SignerWithAddress;
  let burner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
  const BURNER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BURNER_ROLE"));
  const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;

  const INITIAL_SUPPLY = ethers.parseEther("100000000"); // 100M
  const MAX_SUPPLY = ethers.parseEther("1000000000"); // 1B

  beforeEach(async function () {
    [owner, minter, burner, user1, user2] = await ethers.getSigners();

    const ISNADToken = await ethers.getContractFactory("ISNADToken");
    token = await ISNADToken.deploy(owner.address);
    await token.waitForDeployment();

    // Grant roles
    await token.grantRole(MINTER_ROLE, minter.address);
    await token.grantRole(BURNER_ROLE, burner.address);
  });

  describe("Deployment", function () {
    it("should set correct name and symbol", async function () {
      expect(await token.name()).to.equal("ISNAD");
      expect(await token.symbol()).to.equal("ISNAD");
    });

    it("should mint initial supply to owner", async function () {
      expect(await token.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });

    it("should set owner as default admin", async function () {
      expect(await token.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });
  });

  describe("Minting", function () {
    it("should allow minter to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      await token.connect(minter).mint(user1.address, mintAmount);
      expect(await token.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("should revert when non-minter tries to mint", async function () {
      const mintAmount = ethers.parseEther("1000");
      await expect(
        token.connect(user1).mint(user1.address, mintAmount)
      ).to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
    });

    it("should revert when minting would exceed max supply", async function () {
      const excessAmount = MAX_SUPPLY; // Would exceed since initial already minted
      await expect(
        token.connect(minter).mint(user1.address, excessAmount)
      ).to.be.revertedWith("Exceeds max supply");
    });

    it("should emit Transfer event on mint", async function () {
      const mintAmount = ethers.parseEther("1000");
      await expect(token.connect(minter).mint(user1.address, mintAmount))
        .to.emit(token, "Transfer")
        .withArgs(ethers.ZeroAddress, user1.address, mintAmount);
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      // Transfer some tokens to user1 first
      await token.transfer(user1.address, ethers.parseEther("1000"));
    });

    it("should allow burner to burn tokens from any address", async function () {
      const burnAmount = ethers.parseEther("500");
      const initialBalance = await token.balanceOf(user1.address);
      
      await token.connect(burner).burnFrom(user1.address, burnAmount);
      
      expect(await token.balanceOf(user1.address)).to.equal(
        initialBalance - burnAmount
      );
    });

    it("should revert when non-burner tries to burn", async function () {
      const burnAmount = ethers.parseEther("500");
      await expect(
        token.connect(user2).burnFrom(user1.address, burnAmount)
      ).to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
    });

    it("should emit Transfer event on burn", async function () {
      const burnAmount = ethers.parseEther("500");
      await expect(token.connect(burner).burnFrom(user1.address, burnAmount))
        .to.emit(token, "Transfer")
        .withArgs(user1.address, ethers.ZeroAddress, burnAmount);
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      await token.transfer(user1.address, ethers.parseEther("1000"));
    });

    it("should allow basic transfers", async function () {
      const transferAmount = ethers.parseEther("100");
      await token.connect(user1).transfer(user2.address, transferAmount);
      expect(await token.balanceOf(user2.address)).to.equal(transferAmount);
    });

    it("should revert on insufficient balance", async function () {
      const excessAmount = ethers.parseEther("2000");
      await expect(
        token.connect(user1).transfer(user2.address, excessAmount)
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
    });
  });

  describe("Permit (EIP-2612)", function () {
    it("should allow gasless approvals via permit", async function () {
      const value = ethers.parseEther("100");
      const block = await ethers.provider.getBlock("latest");
      const deadline = block!.timestamp + 3600;
      const nonce = await token.nonces(owner.address);

      const domain = {
        name: "ISNAD",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await token.getAddress()
      };

      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" }
        ]
      };

      const message = {
        owner: owner.address,
        spender: user1.address,
        value: value,
        nonce: nonce,
        deadline: deadline
      };

      const signature = await owner.signTypedData(domain, types, message);
      const { v, r, s } = ethers.Signature.from(signature);

      await token.permit(owner.address, user1.address, value, deadline, v, r, s);
      expect(await token.allowance(owner.address, user1.address)).to.equal(value);
    });
  });

  describe("Voting Power (ERC20Votes)", function () {
    it("should track voting power after delegation", async function () {
      await token.transfer(user1.address, ethers.parseEther("1000"));
      
      // Self-delegate to activate voting power
      await token.connect(user1).delegate(user1.address);
      
      expect(await token.getVotes(user1.address)).to.equal(ethers.parseEther("1000"));
    });

    it("should allow delegation to another address", async function () {
      await token.transfer(user1.address, ethers.parseEther("1000"));
      
      // Delegate to user2
      await token.connect(user1).delegate(user2.address);
      
      expect(await token.getVotes(user1.address)).to.equal(0n);
      expect(await token.getVotes(user2.address)).to.equal(ethers.parseEther("1000"));
    });

    it("should track historical voting power", async function () {
      await token.transfer(user1.address, ethers.parseEther("1000"));
      await token.connect(user1).delegate(user1.address);
      
      const blockBefore = await ethers.provider.getBlockNumber();
      
      // Transfer more after recording block
      await token.transfer(user1.address, ethers.parseEther("500"));
      
      // Check historical voting power
      expect(await token.getPastVotes(user1.address, blockBefore))
        .to.equal(ethers.parseEther("1000"));
    });
  });

  describe("Access Control", function () {
    it("should allow admin to grant roles", async function () {
      await token.grantRole(MINTER_ROLE, user1.address);
      expect(await token.hasRole(MINTER_ROLE, user1.address)).to.be.true;
    });

    it("should allow admin to revoke roles", async function () {
      await token.revokeRole(MINTER_ROLE, minter.address);
      expect(await token.hasRole(MINTER_ROLE, minter.address)).to.be.false;
    });

    it("should not allow non-admin to grant roles", async function () {
      await expect(
        token.connect(user1).grantRole(MINTER_ROLE, user2.address)
      ).to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
    });
  });
});
