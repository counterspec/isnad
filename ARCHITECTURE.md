# ISNAD Architecture

## Design Principles

1. **On-chain first** — Attestations, stakes, and resources live on Base L2
2. **Test-driven** — Every component has tests before implementation
3. **Separation of concerns** — Clear boundaries between layers
4. **Security by default** — Assume adversarial environment

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ isnad.md │  │  Agents  │  │ CLI/SDK  │  │ Auditors │            │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘            │
└───────┼─────────────┼─────────────┼─────────────┼───────────────────┘
        │             │             │             │
        ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API LAYER (api.isnad.md)                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  REST API (read-only cache of chain state)                  │    │
│  │  • GET /resources/{hash}                                    │    │
│  │  • GET /resources/{hash}/attestations                       │    │
│  │  • GET /auditors/{address}                                  │    │
│  │  • GET /trust/{hash} → trust score + tier                   │    │
│  │  • WS  /subscribe → real-time updates                       │    │
│  └─────────────────────────────────────────────────────────────┘    │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ reads from
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      INDEXER LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Chain Indexer                                              │    │
│  │  • Watches ISNAD Registry contract events                   │    │
│  │  • Parses inscription calldata                              │    │
│  │  • Builds queryable database                                │    │
│  │  • Handles reorgs gracefully                                │    │
│  └─────────────────────────────────────────────────────────────┘    │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ indexes
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CHAIN LAYER (Base L2)                           │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ ISNAD Token  │  │   Registry   │  │   Staking    │              │
│  │   (ERC20)    │  │ (inscriptions│  │ (attestations│              │
│  │              │  │  + metadata) │  │  + slashing) │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐                                │
│  │   Oracle     │  │  Reward Pool │                                │
│  │  (detection  │  │   (yield     │                                │
│  │   verdicts)  │  │ distribution)│                                │
│  └──────────────┘  └──────────────┘                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Smart Contracts

### Security Considerations

**Threat Model:**
- Malicious auditors colluding to vouch for bad resources
- Flash loan attacks on staking
- Front-running inscription + attestation
- Reentrancy on stake/unstake
- Oracle manipulation
- Governance attacks

**Mitigations:**
- Multi-auditor requirements for higher tiers
- Lock periods prevent flash loan exploits
- Commit-reveal for attestations (optional)
- ReentrancyGuard on all state-changing functions
- Multi-layer detection with jury system
- Timelock on governance actions

### Contract 1: ISNADToken.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ISNADToken
 * @notice ERC20 token with permit, snapshot, and controlled minting
 * 
 * Security notes:
 * - MINTER_ROLE for reward pool only
 * - BURNER_ROLE for staking contract only (slashing)
 * - Snapshot for governance voting
 * - Permit for gasless approvals
 */
contract ISNADToken is ERC20Permit, ERC20Snapshot, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant SNAPSHOT_ROLE = keccak256("SNAPSHOT_ROLE");
    
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 1e18; // 1B
    uint256 public constant MAX_ANNUAL_INFLATION = 3; // 3%
    
    // Tests:
    // - test_mint_onlyMinter
    // - test_mint_respectsMaxSupply
    // - test_burn_onlyBurner
    // - test_snapshot_onlySnapshotRole
    // - test_permit_works
    // - test_transfer_basic
}
```

### Contract 2: ISNADRegistry.sol

```solidity
/**
 * @title ISNADRegistry
 * @notice Tracks inscriptions and their metadata
 * 
 * Inscriptions are stored in calldata, not contract storage.
 * This contract emits events for indexers and stores minimal on-chain state.
 * 
 * Security notes:
 * - No admin functions post-deployment
 * - Events are the source of truth for indexers
 * - contentHash verified against calldata
 */
contract ISNADRegistry {
    event ResourceInscribed(
        bytes32 indexed contentHash,
        uint8 resourceType,
        address indexed author,
        uint256 indexed blockNumber
    );
    
    event ResourceDeprecated(
        bytes32 indexed contentHash,
        bytes32 indexed supersededBy
    );
    
    // Minimal on-chain state (for verification only)
    mapping(bytes32 => bool) public exists;
    mapping(bytes32 => address) public author;
    
    // Tests:
    // - test_inscribe_emitsEvent
    // - test_inscribe_storesMinimalState
    // - test_inscribe_verifiesContentHash
    // - test_inscribe_rejectsInvalidFormat
    // - test_deprecate_onlyAuthor
    // - test_inscribe_chunkReassembly
}
```

### Contract 3: ISNADStaking.sol

```solidity
/**
 * @title ISNADStaking
 * @notice Manages attestations (stakes) on resources
 * 
 * Security notes:
 * - ReentrancyGuard on stake/unstake
 * - Lock periods enforced
 * - Slash only callable by Oracle
 * - Whale caps enforced
 */
contract ISNADStaking is ReentrancyGuard {
    struct Attestation {
        address auditor;
        bytes32 resourceHash;
        uint256 amount;
        uint256 lockUntil;
        uint256 lockDuration;
        bool slashed;
    }
    
    uint256 public constant MAX_STAKE_PER_RESOURCE = 10_000 * 1e18;
    uint256 public constant MAX_STAKE_PERCENT = 33; // 33% of total
    
    // Tests:
    // - test_stake_locksTokens
    // - test_stake_emitsEvent
    // - test_stake_respectsMaxStake
    // - test_stake_respectsMaxPercent
    // - test_unstake_revertsIfLocked
    // - test_unstake_returnsTokens
    // - test_slash_onlyOracle
    // - test_slash_burnsTokens
    // - test_slash_marksSlashed
    // - test_getTrustScore_calculatesCorrectly
    // - test_getTrustTier_thresholds
    // - test_reentrancy_protection
}
```

### Contract 4: ISNADOracle.sol

```solidity
/**
 * @title ISNADOracle
 * @notice Detection verdicts and jury system
 * 
 * Security notes:
 * - Jury selection uses VRF for randomness
 * - Jurors cannot have stake in flagged resource
 * - Supermajority required for verdict
 * - Appeals have higher barrier
 */
contract ISNADOracle {
    struct Flag {
        bytes32 resourceHash;
        address flagger;
        uint256 deposit;
        bytes32 evidenceHash;
        FlagStatus status;
        uint256 timestamp;
    }
    
    // Tests:
    // - test_flag_requiresDeposit
    // - test_flag_emitsEvent
    // - test_jurySelection_isRandom
    // - test_jurySelection_excludesConflicted
    // - test_vote_requiresJuror
    // - test_verdict_requiresSupermajority
    // - test_slash_executedOnGuilty
    // - test_appeal_requiresHigherDeposit
}
```

---

## Backend Services

### Service 1: Indexer

**Responsibility:** Watch chain, parse events, build queryable state

```
indexer/
├── src/
│   ├── chain/
│   │   ├── provider.ts      # Base RPC connection
│   │   ├── contracts.ts     # Contract ABIs + addresses
│   │   └── events.ts        # Event parsing
│   ├── parser/
│   │   ├── inscription.ts   # Parse ISNAD inscription format
│   │   └── validate.ts      # Validate content hash
│   ├── db/
│   │   ├── schema.ts        # Database schema
│   │   ├── resources.ts     # Resource queries
│   │   └── attestations.ts  # Attestation queries
│   ├── sync/
│   │   ├── backfill.ts      # Historical sync
│   │   ├── realtime.ts      # Live event watching
│   │   └── reorg.ts         # Handle chain reorgs
│   └── index.ts
├── tests/
│   ├── parser.test.ts
│   ├── sync.test.ts
│   └── db.test.ts
└── package.json
```

**Tests:**
- `test_parseInscription_validFormat`
- `test_parseInscription_invalidMagic`
- `test_parseInscription_chunkedReassembly`
- `test_sync_backfillFromGenesis`
- `test_sync_handleReorg`
- `test_db_resourceQueries`
- `test_db_attestationAggregation`

### Service 2: API

**Responsibility:** Serve indexed data to clients

```
api/
├── src/
│   ├── routes/
│   │   ├── resources.ts     # /resources endpoints
│   │   ├── auditors.ts      # /auditors endpoints
│   │   ├── trust.ts         # /trust endpoints
│   │   └── health.ts        # /health endpoint
│   ├── middleware/
│   │   ├── cache.ts         # Response caching
│   │   ├── rateLimit.ts     # Rate limiting
│   │   └── markdown.ts      # Content negotiation
│   ├── ws/
│   │   └── subscribe.ts     # WebSocket subscriptions
│   └── index.ts
├── tests/
│   ├── routes.test.ts
│   ├── cache.test.ts
│   └── ws.test.ts
└── package.json
```

**Tests:**
- `test_getResource_returnsData`
- `test_getResource_404OnMissing`
- `test_getTrust_calculatesScore`
- `test_rateLimit_enforced`
- `test_contentNegotiation_markdown`
- `test_ws_subscribesUpdates`

### Service 3: Scanner (Phase 2)

**Responsibility:** Automated detection, flag submission

---

## Database Schema (PostgreSQL)

```sql
-- Resources (inscriptions)
CREATE TABLE resources (
    content_hash BYTEA PRIMARY KEY,
    resource_type SMALLINT NOT NULL,
    author ADDRESS NOT NULL,
    inscription_tx BYTEA NOT NULL,
    block_number BIGINT NOT NULL,
    metadata JSONB NOT NULL,
    content BYTEA,  -- NULL if chunked, reassembled separately
    created_at TIMESTAMP DEFAULT NOW()
);

-- Attestations
CREATE TABLE attestations (
    id SERIAL PRIMARY KEY,
    resource_hash BYTEA REFERENCES resources(content_hash),
    auditor ADDRESS NOT NULL,
    amount NUMERIC(78, 0) NOT NULL,  -- uint256
    lock_until TIMESTAMP NOT NULL,
    lock_duration_days INT NOT NULL,
    slashed BOOLEAN DEFAULT FALSE,
    tx_hash BYTEA NOT NULL,
    block_number BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(resource_hash, auditor)
);

-- Auditors (aggregated stats)
CREATE TABLE auditors (
    address ADDRESS PRIMARY KEY,
    total_staked NUMERIC(78, 0) DEFAULT 0,
    attestation_count INT DEFAULT 0,
    burn_count INT DEFAULT 0,
    accuracy DECIMAL(5, 2) DEFAULT 100.0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Flags
CREATE TABLE flags (
    id SERIAL PRIMARY KEY,
    resource_hash BYTEA REFERENCES resources(content_hash),
    flagger ADDRESS NOT NULL,
    evidence_hash BYTEA NOT NULL,
    status SMALLINT NOT NULL,  -- PENDING, CONFIRMED, REJECTED
    tx_hash BYTEA NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sync state
CREATE TABLE sync_state (
    id INT PRIMARY KEY DEFAULT 1,
    last_block BIGINT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_resources_type ON resources(resource_type);
CREATE INDEX idx_resources_author ON resources(author);
CREATE INDEX idx_attestations_auditor ON attestations(auditor);
CREATE INDEX idx_attestations_resource ON attestations(resource_hash);
```

---

## Development Order (Test-Driven)

### Phase 1: Contracts (Week 1-2)
1. [ ] ISNADToken — tests → implementation → audit
2. [ ] ISNADRegistry — tests → implementation → audit
3. [ ] ISNADStaking — tests → implementation → audit
4. [ ] Deploy to Base Sepolia testnet

### Phase 2: Indexer (Week 2-3)
1. [ ] Inscription parser — tests → implementation
2. [ ] Database schema + migrations
3. [ ] Event sync — tests → implementation
4. [ ] Deploy to Railway

### Phase 3: API (Week 3)
1. [ ] Routes — tests → implementation
2. [ ] WebSocket — tests → implementation
3. [ ] Deploy to Railway (api.isnad.md)

### Phase 4: Integration (Week 4)
1. [ ] Connect frontend to API
2. [ ] End-to-end tests
3. [ ] Mainnet deployment

---

## Security Checklist

### Smart Contracts
- [ ] Reentrancy protection on all state changes
- [ ] Integer overflow checks (Solidity 0.8+)
- [ ] Access control on privileged functions
- [ ] No selfdestruct
- [ ] Timelock on admin functions
- [ ] Events for all state changes
- [ ] Slither static analysis
- [ ] Formal verification of critical paths
- [ ] External audit before mainnet

### Backend
- [ ] Input validation on all endpoints
- [ ] Rate limiting
- [ ] SQL injection prevention (parameterized queries)
- [ ] No secrets in logs
- [ ] HTTPS only
- [ ] CORS configured
- [ ] Health checks + monitoring
