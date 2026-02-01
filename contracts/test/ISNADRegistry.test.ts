import { expect } from "chai";
import { ethers } from "hardhat";
import { ISNADRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ISNADRegistry", function () {
  let registry: ISNADRegistry;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  // Test content
  const testContent = ethers.toUtf8Bytes("Hello, ISNAD! This is a test resource.");
  const testContentHash = ethers.sha256(testContent);
  const testMetadata = JSON.stringify({
    name: "Test Resource",
    version: "1.0.0",
    description: "A test inscription"
  });

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const ISNADRegistry = await ethers.getContractFactory("ISNADRegistry");
    registry = await ISNADRegistry.deploy();
    await registry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should have correct resource type constants", async function () {
      expect(await registry.TYPE_RAW()).to.equal(0);
      expect(await registry.TYPE_AGENT_CARD()).to.equal(1);
      expect(await registry.TYPE_PROMPT()).to.equal(2);
      expect(await registry.TYPE_TOOL_SPEC()).to.equal(3);
      expect(await registry.TYPE_WORKFLOW()).to.equal(4);
      expect(await registry.TYPE_TRAINING()).to.equal(5);
      expect(await registry.TYPE_MODEL_CARD()).to.equal(6);
    });
  });

  describe("Single Inscription", function () {
    it("should inscribe a resource", async function () {
      await registry.connect(user1).inscribe(
        testContentHash,
        0, // TYPE_RAW
        testMetadata,
        testContent
      );

      expect(await registry.exists(testContentHash)).to.be.true;
      expect(await registry.author(testContentHash)).to.equal(user1.address);
    });

    it("should emit ResourceInscribed event", async function () {
      await expect(
        registry.connect(user1).inscribe(testContentHash, 1, testMetadata, testContent)
      )
        .to.emit(registry, "ResourceInscribed")
        .withArgs(
          testContentHash,
          1, // TYPE_AGENT_CARD
          user1.address,
          (v: any) => v > 0, // blockNumber
          testMetadata
        );
    });

    it("should store correct block number", async function () {
      const tx = await registry.connect(user1).inscribe(
        testContentHash,
        0,
        testMetadata,
        testContent
      );
      const receipt = await tx.wait();

      expect(await registry.blockNumber(testContentHash)).to.equal(receipt!.blockNumber);
    });

    it("should revert on duplicate inscription", async function () {
      await registry.connect(user1).inscribe(testContentHash, 0, testMetadata, testContent);

      await expect(
        registry.connect(user2).inscribe(testContentHash, 0, testMetadata, testContent)
      ).to.be.revertedWith("Already inscribed");
    });

    it("should revert on hash mismatch", async function () {
      const wrongHash = ethers.sha256(ethers.toUtf8Bytes("different content"));

      await expect(
        registry.connect(user1).inscribe(wrongHash, 0, testMetadata, testContent)
      ).to.be.revertedWith("Hash mismatch");
    });

    it("should revert on invalid resource type", async function () {
      await expect(
        registry.connect(user1).inscribe(testContentHash, 7, testMetadata, testContent)
      ).to.be.revertedWith("Invalid resource type");
    });

    it("should revert on empty content", async function () {
      const emptyContent = ethers.toUtf8Bytes("");
      const emptyHash = ethers.sha256(emptyContent);

      await expect(
        registry.connect(user1).inscribe(emptyHash, 0, testMetadata, emptyContent)
      ).to.be.revertedWith("Empty content");
    });

    it("should revert on metadata too long", async function () {
      const longMetadata = "x".repeat(2049);

      await expect(
        registry.connect(user1).inscribe(testContentHash, 0, longMetadata, testContent)
      ).to.be.revertedWith("Metadata too long");
    });

    it("should accept all valid resource types", async function () {
      for (let i = 0; i <= 6; i++) {
        const content = ethers.toUtf8Bytes(`Content type ${i}`);
        const hash = ethers.sha256(content);

        await registry.connect(user1).inscribe(hash, i, testMetadata, content);
        expect(await registry.exists(hash)).to.be.true;
      }
    });
  });

  describe("Chunked Inscription", function () {
    const largeContent = ethers.toUtf8Bytes("A".repeat(1000) + "B".repeat(1000));
    const largeContentHash = ethers.sha256(largeContent);
    const chunk1 = ethers.toUtf8Bytes("A".repeat(1000));
    const chunk2 = ethers.toUtf8Bytes("B".repeat(1000));

    it("should accept first chunk", async function () {
      await registry.connect(user1).inscribeChunk(
        largeContentHash,
        0, // chunkIndex
        2, // totalChunks
        0, // resourceType
        testMetadata,
        chunk1
      );

      const status = await registry.getChunkStatus(largeContentHash);
      expect(status.pending).to.be.true;
      expect(status.received).to.equal(1);
      expect(status.total).to.equal(2);
      expect(status.chunkAuthor).to.equal(user1.address);
    });

    it("should emit ChunkInscribed event", async function () {
      await expect(
        registry.connect(user1).inscribeChunk(
          largeContentHash, 0, 2, 0, testMetadata, chunk1
        )
      )
        .to.emit(registry, "ChunkInscribed")
        .withArgs(largeContentHash, 0, 2, user1.address);
    });

    it("should finalize after all chunks", async function () {
      await registry.connect(user1).inscribeChunk(
        largeContentHash, 0, 2, 0, testMetadata, chunk1
      );
      
      await expect(
        registry.connect(user1).inscribeChunk(
          largeContentHash, 1, 2, 0, testMetadata, chunk2
        )
      )
        .to.emit(registry, "ResourceInscribed")
        .withArgs(largeContentHash, 0, user1.address, (v: any) => v > 0, testMetadata);

      expect(await registry.exists(largeContentHash)).to.be.true;
      expect(await registry.author(largeContentHash)).to.equal(user1.address);

      // Pending state should be cleaned up
      const status = await registry.getChunkStatus(largeContentHash);
      expect(status.pending).to.be.false;
    });

    it("should revert if different author tries to continue", async function () {
      await registry.connect(user1).inscribeChunk(
        largeContentHash, 0, 2, 0, testMetadata, chunk1
      );

      await expect(
        registry.connect(user2).inscribeChunk(
          largeContentHash, 1, 2, 0, testMetadata, chunk2
        )
      ).to.be.revertedWith("Not chunk author");
    });

    it("should revert on chunk count mismatch", async function () {
      await registry.connect(user1).inscribeChunk(
        largeContentHash, 0, 2, 0, testMetadata, chunk1
      );

      await expect(
        registry.connect(user1).inscribeChunk(
          largeContentHash, 1, 3, 0, testMetadata, chunk2
        )
      ).to.be.revertedWith("Chunk count mismatch");
    });

    it("should revert on single chunk", async function () {
      await expect(
        registry.connect(user1).inscribeChunk(
          testContentHash, 0, 1, 0, testMetadata, testContent
        )
      ).to.be.revertedWith("Use inscribe() for single chunk");
    });

    it("should revert on too many chunks", async function () {
      await expect(
        registry.connect(user1).inscribeChunk(
          testContentHash, 0, 101, 0, testMetadata, testContent
        )
      ).to.be.revertedWith("Too many chunks");
    });

    it("should revert on invalid chunk index", async function () {
      await expect(
        registry.connect(user1).inscribeChunk(
          largeContentHash, 2, 2, 0, testMetadata, chunk1
        )
      ).to.be.revertedWith("Invalid chunk index");
    });

    it("should revert if already inscribed", async function () {
      // First inscribe normally
      await registry.connect(user1).inscribe(testContentHash, 0, testMetadata, testContent);

      // Try to start chunked inscription
      await expect(
        registry.connect(user2).inscribeChunk(
          testContentHash, 0, 2, 0, testMetadata, chunk1
        )
      ).to.be.revertedWith("Already inscribed");
    });
  });

  describe("Deprecation", function () {
    beforeEach(async function () {
      await registry.connect(user1).inscribe(testContentHash, 0, testMetadata, testContent);
    });

    it("should allow author to deprecate", async function () {
      await registry.connect(user1).deprecate(testContentHash, ethers.ZeroHash);

      expect(await registry.isDeprecated(testContentHash)).to.be.true;
    });

    it("should emit ResourceDeprecated event", async function () {
      await expect(registry.connect(user1).deprecate(testContentHash, ethers.ZeroHash))
        .to.emit(registry, "ResourceDeprecated")
        .withArgs(testContentHash, ethers.ZeroHash, user1.address);
    });

    it("should allow deprecating with successor", async function () {
      const newContent = ethers.toUtf8Bytes("New version content");
      const newHash = ethers.sha256(newContent);
      await registry.connect(user1).inscribe(newHash, 0, testMetadata, newContent);

      await registry.connect(user1).deprecate(testContentHash, newHash);

      expect(await registry.supersededBy(testContentHash)).to.equal(newHash);
    });

    it("should revert if not author", async function () {
      await expect(
        registry.connect(user2).deprecate(testContentHash, ethers.ZeroHash)
      ).to.be.revertedWith("Not author");
    });

    it("should revert if already deprecated", async function () {
      await registry.connect(user1).deprecate(testContentHash, ethers.ZeroHash);

      await expect(
        registry.connect(user1).deprecate(testContentHash, ethers.ZeroHash)
      ).to.be.revertedWith("Already deprecated");
    });

    it("should revert on non-existent resource", async function () {
      const fakeHash = ethers.sha256(ethers.toUtf8Bytes("fake"));

      await expect(
        registry.connect(user1).deprecate(fakeHash, ethers.ZeroHash)
      ).to.be.revertedWith("Resource not found");
    });
  });

  describe("Queries", function () {
    beforeEach(async function () {
      await registry.connect(user1).inscribe(testContentHash, 0, testMetadata, testContent);
    });

    it("should return correct resource info", async function () {
      const info = await registry.getResource(testContentHash);

      expect(info.inscribed).to.be.true;
      expect(info.resourceAuthor).to.equal(user1.address);
      expect(info.inscribedBlock).to.be.gt(0);
      expect(info.successor).to.equal(ethers.ZeroHash);
    });

    it("should return empty info for unknown resource", async function () {
      const fakeHash = ethers.sha256(ethers.toUtf8Bytes("fake"));
      const info = await registry.getResource(fakeHash);

      expect(info.inscribed).to.be.false;
      expect(info.resourceAuthor).to.equal(ethers.ZeroAddress);
      expect(info.inscribedBlock).to.equal(0);
    });

    it("should return chunk status for pending inscription", async function () {
      const largeContent = ethers.toUtf8Bytes("X".repeat(1000));
      const largeHash = ethers.sha256(largeContent);
      const chunk = ethers.toUtf8Bytes("X".repeat(500));

      await registry.connect(user2).inscribeChunk(
        largeHash, 0, 2, 0, testMetadata, chunk
      );

      const status = await registry.getChunkStatus(largeHash);
      expect(status.pending).to.be.true;
      expect(status.received).to.equal(1);
      expect(status.total).to.equal(2);
      expect(status.chunkAuthor).to.equal(user2.address);
    });

    it("should return empty chunk status for non-pending", async function () {
      const status = await registry.getChunkStatus(testContentHash);
      expect(status.pending).to.be.false;
      expect(status.received).to.equal(0);
      expect(status.total).to.equal(0);
    });
  });
});
