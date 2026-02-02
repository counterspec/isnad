// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ISNADRegistry
 * @notice Tracks ISNAD inscriptions with minimal on-chain storage
 * @dev
 * Inscriptions are embedded in calldata, not contract storage.
 * This contract:
 * 1. Emits events for indexers to parse inscription content
 * 2. Stores minimal state for on-chain verification
 * 3. Tracks authorship and deprecation
 * 
 * Security considerations:
 * - No admin functions after deployment
 * - Events are immutable and the source of truth
 * - Content hash verified against calldata
 * - Authors can deprecate their own resources only
 */
contract ISNADRegistry {
    // Resource types
    uint8 public constant TYPE_RAW = 0;           // Raw content
    uint8 public constant TYPE_AGENT_CARD = 1;    // Agent persona/config
    uint8 public constant TYPE_PROMPT = 2;        // System prompt
    uint8 public constant TYPE_TOOL_SPEC = 3;     // Tool specification
    uint8 public constant TYPE_WORKFLOW = 4;      // Workflow definition
    uint8 public constant TYPE_TRAINING = 5;      // Training data
    uint8 public constant TYPE_MODEL_CARD = 6;    // Model documentation

    // Chunk tracking for large inscriptions
    struct ChunkInfo {
        bytes32 contentHash;     // Hash of complete content
        uint16 totalChunks;      // Total chunks expected
        uint16 receivedChunks;   // Chunks received so far
        address author;          // Who started the chunked inscription
        uint256 createdAt;       // Timestamp for timeout enforcement
    }
    
    // Timeout for abandoned chunk sequences (24 hours)
    uint256 public constant CHUNK_TIMEOUT = 24 hours;

    // Minimal on-chain state
    mapping(bytes32 => bool) public exists;
    mapping(bytes32 => address) public author;
    mapping(bytes32 => uint256) public blockNumber;
    mapping(bytes32 => bytes32) public supersededBy;
    mapping(bytes32 => ChunkInfo) public pendingChunks;

    // Events for indexers
    event ResourceInscribed(
        bytes32 indexed contentHash,
        uint8 indexed resourceType,
        address indexed author,
        uint256 blockNumber,
        string metadata
    );

    event ChunkInscribed(
        bytes32 indexed contentHash,
        uint16 chunkIndex,
        uint16 totalChunks,
        address indexed author
    );

    event ResourceDeprecated(
        bytes32 indexed contentHash,
        bytes32 indexed supersededBy,
        address indexed author
    );

    /**
     * @notice Inscribe a resource in a single transaction
     * @param contentHash SHA-256 hash of the content
     * @param resourceType Type of resource (0-6)
     * @param metadata JSON metadata string (indexed by off-chain services)
     * @param content The actual content (stored in calldata, emitted in logs)
     * @dev Content is NOT stored in contract storage — only calldata + events
     */
    function inscribe(
        bytes32 contentHash,
        uint8 resourceType,
        string calldata metadata,
        bytes calldata content
    ) external {
        require(!exists[contentHash], "Already inscribed");
        require(resourceType <= TYPE_MODEL_CARD, "Invalid resource type");
        require(bytes(metadata).length <= 2048, "Metadata too long");
        require(content.length > 0, "Empty content");
        
        // Verify content hash
        bytes32 computed = sha256(content);
        require(computed == contentHash, "Hash mismatch");

        // Store minimal state
        exists[contentHash] = true;
        author[contentHash] = msg.sender;
        blockNumber[contentHash] = block.number;

        emit ResourceInscribed(
            contentHash,
            resourceType,
            msg.sender,
            block.number,
            metadata
        );
    }

    /**
     * @notice Start or continue a chunked inscription for large content
     * @param contentHash SHA-256 hash of the COMPLETE content
     * @param chunkIndex Which chunk this is (0-indexed)
     * @param totalChunks Total number of chunks
     * @param resourceType Type of resource (only checked on first chunk)
     * @param metadata JSON metadata (only used on first chunk)
     * @param chunkData This chunk's data
     */
    function inscribeChunk(
        bytes32 contentHash,
        uint16 chunkIndex,
        uint16 totalChunks,
        uint8 resourceType,
        string calldata metadata,
        bytes calldata chunkData
    ) external {
        require(!exists[contentHash], "Already inscribed");
        require(chunkIndex < totalChunks, "Invalid chunk index");
        require(totalChunks > 1, "Use inscribe() for single chunk");
        require(totalChunks <= 100, "Too many chunks");
        require(chunkData.length > 0, "Empty chunk");

        ChunkInfo storage info = pendingChunks[contentHash];

        if (chunkIndex == 0) {
            // First chunk initializes
            require(info.author == address(0), "Chunk sequence exists");
            require(resourceType <= TYPE_MODEL_CARD, "Invalid resource type");
            
            info.contentHash = contentHash;
            info.totalChunks = totalChunks;
            info.receivedChunks = 1;
            info.author = msg.sender;
            info.createdAt = block.timestamp;
        } else {
            // Subsequent chunks must be from same author
            require(info.author == msg.sender, "Not chunk author");
            require(info.totalChunks == totalChunks, "Chunk count mismatch");
            info.receivedChunks++;
        }

        emit ChunkInscribed(contentHash, chunkIndex, totalChunks, msg.sender);

        // If all chunks received, finalize
        if (info.receivedChunks == totalChunks) {
            exists[contentHash] = true;
            author[contentHash] = msg.sender;
            blockNumber[contentHash] = block.number;

            emit ResourceInscribed(
                contentHash,
                resourceType,
                msg.sender,
                block.number,
                metadata
            );

            // Clean up pending state
            delete pendingChunks[contentHash];
        }
    }

    /**
     * @notice Mark a resource as deprecated, optionally pointing to successor
     * @param contentHash Hash of the resource to deprecate
     * @param newContentHash Hash of the superseding resource (or 0x0)
     */
    function deprecate(bytes32 contentHash, bytes32 newContentHash) external {
        require(exists[contentHash], "Resource not found");
        require(author[contentHash] == msg.sender, "Not author");
        require(supersededBy[contentHash] == bytes32(0), "Already deprecated");

        supersededBy[contentHash] = newContentHash == bytes32(0) 
            ? bytes32(uint256(1)) // Mark deprecated without successor
            : newContentHash;

        emit ResourceDeprecated(contentHash, newContentHash, msg.sender);
    }

    /**
     * @notice Check if a resource is deprecated
     * @param contentHash Hash of the resource
     * @return True if deprecated
     */
    function isDeprecated(bytes32 contentHash) external view returns (bool) {
        return supersededBy[contentHash] != bytes32(0);
    }

    /**
     * @notice Get inscription info
     * @param contentHash Hash of the resource
     */
    function getResource(bytes32 contentHash) external view returns (
        bool inscribed,
        address resourceAuthor,
        uint256 inscribedBlock,
        bytes32 successor
    ) {
        return (
            exists[contentHash],
            author[contentHash],
            blockNumber[contentHash],
            supersededBy[contentHash]
        );
    }

    /**
     * @notice Get pending chunk status
     * @param contentHash Hash of the resource being chunked
     */
    function getChunkStatus(bytes32 contentHash) external view returns (
        bool pending,
        uint16 received,
        uint16 total,
        address chunkAuthor,
        uint256 createdAt
    ) {
        ChunkInfo storage info = pendingChunks[contentHash];
        return (
            info.author != address(0),
            info.receivedChunks,
            info.totalChunks,
            info.author,
            info.createdAt
        );
    }
    
    /**
     * @notice Clean up abandoned chunk sequence after timeout
     * @param contentHash Hash of the abandoned chunked inscription
     * @dev Anyone can call this to free up blocked content hashes
     */
    function cleanupAbandonedChunk(bytes32 contentHash) external {
        ChunkInfo storage info = pendingChunks[contentHash];
        require(info.author != address(0), "No pending chunk");
        require(block.timestamp >= info.createdAt + CHUNK_TIMEOUT, "Timeout not reached");
        
        // Save author before deleting
        address originalAuthor = info.author;
        
        // Clean up - allows contentHash to be reused
        delete pendingChunks[contentHash];
        
        emit ChunkCleanedUp(contentHash, originalAuthor);
    }
    
    event ChunkCleanedUp(bytes32 indexed contentHash, address indexed originalAuthor);
}
