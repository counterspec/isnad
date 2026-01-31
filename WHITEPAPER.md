# $ISNAD: The Trust Layer for AI

**A Proof-of-Stake Attestation Protocol for the Agent Internet**

*Draft v0.6 — January 31, 2026*
*Author: Rapi (@0xRapi)*

---

## Abstract

As AI agents proliferate, they increasingly rely on shared resources—skills, configurations, prompts, and data—from untrusted sources. A single malicious resource can exfiltrate credentials, corrupt data, or compromise entire systems. Yet there is no standardized way to assess trust before consumption.

**$ISNAD** introduces a decentralized trust layer where auditors stake tokens to attest to resource safety. Malicious resources burn stakes; clean resources earn yield. The result: a market-priced trust signal that scales without central authority.

Resources and attestations are inscribed directly on Base L2, creating a permanent, censorship-resistant record with no external dependencies.

The name comes from the Islamic scholarly tradition of *isnad* (إسناد) — the chain of transmission used to authenticate hadith. A saying is only as trustworthy as its chain of narrators. $ISNAD applies this ancient wisdom to modern AI provenance.

---

## The Problem

### The AI Resource Ecosystem

AI agents extend their capabilities through shared resources:
- **Skills** — modular code packages (API integrations, tools, workflows)
- **Configurations** — agent settings, gateway configs, capability definitions
- **Prompts** — system prompts, personas, behavioral instructions
- **Memory** — knowledge bases, context files, training data
- **Models** — fine-tunes, LoRAs, adapters

These resources run with elevated permissions or shape agent behavior. A compromised resource can:
- Read API keys, tokens, and credentials
- Exfiltrate private data to external servers
- Execute arbitrary commands
- Impersonate the agent to external services
- Manipulate agent behavior through prompt injection

### Current Mitigations (All Insufficient)

| Approach | Limitation |
|----------|------------|
| Manual code review | Doesn't scale; most agents can't audit |
| Central approval process | Bottleneck; single point of failure |
| Reputation scores | Gameable; new authors can't bootstrap |
| "Trust the community" | Herding behavior; majority can be wrong |
| Sandboxing | Incomplete; many resources need real permissions |

### The Trust Gap

An agent considering any shared resource faces an impossible question: *"Is this safe?"*

Without tooling, the answer is always a guess.

---

## The Solution: Proof-of-Stake Attestation

### Core Mechanism

1. **Resources are inscribed** on Base L2 with content and metadata
2. **Auditors review resources** and stake $ISNAD tokens to attest to their safety
3. **Stakes are locked** for a time period (30-180 days)
4. **If issues are detected** → staked tokens are slashed
5. **If resource remains clean** → auditors earn yield from reward pool
6. **Consumers check trust scores** (total $ISNAD staked) before using

### Why This Works

**Skin in the game:** Auditors risk real value when attesting. False attestations have consequences.

**Self-selecting expertise:** Only confident auditors will stake. The market filters for competence.

**Scalable trust:** No central authority needed. Trust emerges from economic incentives.

**Attack resistant:** Sybil attacks require capital. Collusion burns all colluders.

**Permanently verifiable:** Both resources and attestations live on-chain. No IPFS pinning, no servers to maintain.

---

## Resource Types

ISNAD supports attestation for any content-addressable AI resource:

| Type | Code | Description | Example |
|------|------|-------------|---------|
| Skill | `SKILL` | Executable code packages | OpenClaw skills, MCP tools |
| Config | `CONFIG` | Agent/system configurations | Gateway configs, capability files |
| Prompt | `PROMPT` | System prompts, personas | SOUL.md, AGENTS.md |
| Memory | `MEMORY` | Knowledge bases, context | RAG documents, memory files |
| Model | `MODEL` | Fine-tunes, adapters | LoRAs, model weights |
| API | `API` | External service attestations | Endpoint integrity |
| Custom | `0x00-FF` | Future resource types | Extensible |

### Future-Proofing

The protocol reserves type codes `0x00`-`0xFF` for future resource types. New types can be added via governance without protocol upgrades. The inscription format is designed to be forward-compatible.

---

## The Isnad Chain

Inspired by hadith authentication, every resource carries a **provenance chain**:

```
resource: weather-skill v1.2.0
type: SKILL
hash: 0x7f3a8b2c...
inscription: base:0x1234...

attestations:
├── AgentA (staked: 500 $ISNAD, locked: 90 days)
│   └── track record: 47 attestations, 0 burns, 98.2% accuracy
├── AgentB (staked: 200 $ISNAD, locked: 30 days)
│   └── track record: 12 attestations, 1 burn, 91.7% accuracy
├── AgentC (staked: 300 $ISNAD, locked: 90 days)
│   └── track record: 23 attestations, 0 burns, 100% accuracy
└── total staked: 1,000 $ISNAD by 3 auditors
    └── trust tier: VERIFIED ✅
```

Consumers can inspect:
- Who attested to the resource
- How much they staked
- Lock duration (longer = more confidence)
- Historical accuracy
- **Specific version attested** (hash-pinned)
- **Full content** (retrievable from inscription)

**A resource is only as trustworthy as its weakest auditor** — but unlike traditional isnad, we can see exactly how much each auditor has at risk.

---

## On-Chain Inscriptions

### Why Inscriptions?

Traditional approaches store content off-chain (IPFS, servers) with only hashes on-chain. This creates dependencies:
- IPFS requires pinning services
- Servers can go offline
- Content can become unavailable

ISNAD inscribes content directly on Base L2 calldata:
- **Permanent** — content lives on-chain forever
- **Censorship-resistant** — no external dependencies
- **Verifiable** — transaction hash proves content
- **Cheap** — Base L2 calldata costs ~$0.001-0.01/KB

### Inscription Format (v1)

```
┌─────────────────────────────────────────────────────────────┐
│  ISNAD Inscription v1                                       │
├─────────────────────────────────────────────────────────────┤
│  magic:       "ISNAD"           (5 bytes)                   │
│  version:     0x01              (1 byte)                    │
│  type:        uint8             (1 byte) - resource type    │
│  flags:       uint16            (2 bytes) - feature flags   │
│  metadata:    length-prefixed   (variable) - JSON metadata  │
│  content:     remaining bytes   (variable) - raw content    │
└─────────────────────────────────────────────────────────────┘
```

### Type Codes

```
0x01 = SKILL      (executable code)
0x02 = CONFIG     (configuration files)
0x03 = PROMPT     (system prompts, personas)
0x04 = MEMORY     (knowledge, context)
0x05 = MODEL      (model weights, adapters)
0x06 = API        (endpoint attestations)
0x10-0xFF = reserved for future types
```

### Flags (Bitmask)

```
0x0001 = COMPRESSED     (content is gzip compressed)
0x0002 = ENCRYPTED      (content is encrypted, key in metadata)
0x0004 = CHUNKED        (content split across multiple txs)
0x0008 = IMMUTABLE      (cannot be superseded)
0x0010 = DEPRECATED     (superseded by newer version)
```

### Metadata Schema

```json
{
  "name": "weather-skill",
  "version": "1.2.0",
  "author": "0x1234...5678",
  "description": "Get weather forecasts",
  "license": "MIT",
  "dependencies": ["0xabcd...", "0xef01..."],
  "tags": ["weather", "api", "utility"],
  "homepage": "https://github.com/...",
  "contentHash": "0x7f3a8b2c...",
  "contentType": "application/javascript",
  "encoding": "utf-8",
  "size": 4096,
  "chunks": 1,
  "chunkIndex": 0,
  "supersedes": null,
  "ext": {}
}
```

### Extension Points

The `ext` field in metadata allows protocol extensions without format changes:
```json
{
  "ext": {
    "isnad.security": { "sandboxRequired": true },
    "isnad.compat": { "minVersion": "0.5.0" },
    "custom.field": { "anything": "here" }
  }
}
```

### Example Inscription

```javascript
// Inscribing a skill on Base
const inscription = encodeInscription({
  type: 0x01, // SKILL
  flags: 0x0000,
  metadata: {
    name: "weather-skill",
    version: "1.2.0",
    author: auditorAddress,
    contentHash: keccak256(content),
    contentType: "text/markdown",
    size: content.length
  },
  content: skillContent
});

// Send as calldata
await wallet.sendTransaction({
  to: ISNAD_REGISTRY,
  data: inscription
});
```

### Chunked Inscriptions

For content >24KB (Base block limit considerations):

```
Chunk 0: ISNAD | v1 | SKILL | CHUNKED | {metadata, chunks: 3, chunkIndex: 0} | content[0:24000]
Chunk 1: ISNAD | v1 | SKILL | CHUNKED | {metadata, chunks: 3, chunkIndex: 1} | content[24000:48000]
Chunk 2: ISNAD | v1 | SKILL | CHUNKED | {metadata, chunks: 3, chunkIndex: 2} | content[48000:]
```

Indexers reassemble chunks using `contentHash` + `chunkIndex`.

### Indexer Protocol

Indexers watch for transactions to ISNAD_REGISTRY with `ISNAD` magic:

1. Parse inscription format
2. Validate contentHash matches content
3. Store in queryable database
4. Expose via API: `GET /resource/{hash}` → full content

Anyone can run an indexer. Multiple indexers provide redundancy.

---

## Trust Tiers

| Tier | Stake Required | Auditor Diversity | Time Clean | Badge |
|------|----------------|-------------------|------------|-------|
| UNVERIFIED | 0 | 0 | — | ⚠️ |
| REVIEWED | ≥100 $ISNAD | 1+ auditor | — | 🔍 |
| VERIFIED | ≥1,000 $ISNAD | 2+ auditors | 14 days | ✅ |
| TRUSTED | ≥10,000 $ISNAD | 3+ auditors | 60 days | 🛡️ |
| CERTIFIED | ≥50,000 $ISNAD | 5+ auditors | 180 days | 💎 |

**Key requirement:** Higher tiers require MULTIPLE INDEPENDENT AUDITORS, not just more stake from one whale. This prevents single-party manipulation.

**Independence check:** Auditors must have different funding sources (no common wallet in transaction history).

Higher tiers unlock:
- Priority placement in resource registries
- Integration with agent frameworks (auto-allow trusted resources)
- Reduced friction for end users

---

## Version Locking & Update Protection

**Problem:** Attacker publishes clean v1.0, gets attested, then pushes malicious v1.1.

**Solution:** Attestations are pinned to specific inscription hashes.

### How Version Locking Works

```
1. Auditor stakes on resource v1.0.0 (inscription: base:0x1234...)
2. Their stake is LOCKED TO THAT INSCRIPTION
3. Author inscribes v1.1.0 (inscription: base:0x5678...)

Result:
├── v1.0.0: Still has 1,000 $ISNAD staked ✅
├── v1.1.0: UNVERIFIED (0 stake) ⚠️
└── Consumers see: "New version available but unattested"
```

### Update Quarantine

When a new version is inscribed:
1. **New version enters quarantine** (can't inherit old trust score)
2. **Existing auditors notified** ("Resource you staked on has new version")
3. **Auditors can choose to:**
   - Extend stake to new version (after reviewing changes)
   - Keep stake on old version only
   - Unstake entirely (if lock period complete)

### Supersession

Authors can mark old versions deprecated:
```json
{
  "flags": 0x0010,
  "metadata": {
    "supersedes": "base:0x1234...",
    "supersededBy": "base:0x5678..."
  }
}
```

Consumers see warnings when using deprecated versions.

---

## Detection Architecture

**The Oracle Problem:** Who decides what's malicious?

**Solution:** Multi-layer detection with no single point of failure.

### Layer 1: Automated Scanning

```
┌─────────────────────────────────────────────────┐
│           AUTOMATED DETECTION                    │
│                                                 │
│  ├── YARA rules (pattern matching)              │
│  ├── Static analysis (AST inspection)           │
│  ├── Dependency audit (known vulnerabilities)   │
│  ├── Behavioral sandbox (honeypot credentials)  │
│  ├── LLM analysis (semantic review)             │
│  └── Diff analysis (what changed in update?)    │
│                                                 │
│  Output: PASS / FLAG / QUARANTINE               │
└─────────────────────────────────────────────────┘
```

**Operated by:** Decentralized scanner network (anyone can run a scanner node, earn rewards for catches)

### Layer 2: Community Flagging

Any agent can flag a resource with evidence:
- Must stake 50 $ISNAD (anti-griefing)
- Submit evidence inscription on-chain
- Evidence permanently verifiable

### Layer 3: Auditor Jury

When a flag is raised:

```
1. Random selection of 7 auditors (weighted by reputation)
2. Jury reviews evidence + resource content
3. Each juror votes: MALICIOUS / CLEAN / ABSTAIN
4. Supermajority (5/7) required for verdict
5. Jurors earn fee for participation, bonus for majority side
```

**Jury selection criteria:**
- Must have >90% historical accuracy
- Must not have staked on the flagged resource
- Must not share funding source with flagger or resource author
- Randomness from block hash + VRF

### Layer 4: Appeals Court

Losing party can appeal within 24 hours:
- Must stake 500 $ISNAD (higher barrier)
- New jury of 11 auditors selected
- Final verdict binding

---

## Staking Economics

### Lock Periods & Yield

Auditors choose their lock period when staking. Longer locks signal higher confidence and earn higher yield.

| Lock Period | Base APY | Slash Risk Window |
|-------------|----------|-------------------|
| 30 days | 5% | 30 days |
| 90 days | 8% | 90 days |
| 180 days | 12% | 180 days |

**Yield source:** Reward pool funded by slashed stakes + protocol inflation.

### Stake Caps (Anti-Whale)

To prevent single-party manipulation:

| Constraint | Limit |
|------------|-------|
| Max stake per auditor per resource | 10,000 $ISNAD |
| Max % of resource's total stake | 33% |
| Min auditors for VERIFIED+ | See tier table |

### Slash Mechanics

| Severity | Slash Amount | Criteria | Appeal? |
|----------|--------------|----------|---------|
| Critical | 100% | Credential theft, data exfiltration, RCE | Yes |
| High | 50% | Exploitable security flaw | Yes |
| Medium | 10% | Non-exploitable bug with security implications | Yes |
| Low | 0% (warning) | Best practice violation | No |

---

## Smart Contract Architecture

### Core Contracts (Base Mainnet)

1. **$ISNAD Token** — ERC20 with permit, snapshot, controlled mint/burn
2. **Registry** — Inscription index, resource → attestations mapping
3. **Staking** — Lock management, yield distribution, slash execution
4. **Detection Oracle** — Flag processing, jury selection, verdict execution
5. **Reward Pool** — Yield source, inflation management

### Key Functions

```solidity
// Attest to a resource
function attest(
    bytes32 inscriptionHash,
    uint256 amount,
    uint256 lockDays
) external;

// Extend attestation to new version
function extendAttestation(
    bytes32 oldInscription,
    bytes32 newInscription
) external;

// Flag a resource
function flag(
    bytes32 inscriptionHash,
    bytes32 evidenceHash
) external;

// Query trust score
function getTrustScore(bytes32 inscriptionHash) 
    external view returns (
        uint256 totalStaked,
        uint256 auditorCount,
        TrustTier tier
    );
```

---

## Agent Integration

### Checking Trust Before Installation

```python
from isnad import TrustChecker

checker = TrustChecker()

# Before installing any resource
resource_hash = "0x7f3a8b2c..."
trust = checker.get_trust(resource_hash)

if trust.tier >= TrustTier.VERIFIED:
    install(resource_hash)
elif trust.tier == TrustTier.REVIEWED:
    if user_confirms("Resource is REVIEWED but not VERIFIED. Proceed?"):
        install(resource_hash)
else:
    reject("Resource is UNVERIFIED")
```

### Automatic Trust Policies

```yaml
# agent-config.yaml
trust_policy:
  skills:
    min_tier: VERIFIED
    require_auditors: 2
  configs:
    min_tier: REVIEWED
  prompts:
    min_tier: REVIEWED
  auto_update:
    enabled: true
    require_attestation: true
```

### Becoming an Auditor

Agents can participate as auditors:

```python
from isnad import Auditor

auditor = Auditor(wallet)

# Review a resource
resource = fetch_inscription("base:0x1234...")
analysis = security_scan(resource.content)

if analysis.is_safe:
    # Stake to attest
    auditor.attest(
        inscription=resource.hash,
        amount=500,
        lock_days=90
    )
```

---

## Deployment

### Phase 1: Foundation
- Token deployment on Base
- Core staking contracts
- Basic inscription indexer
- Trust checker UI

### Phase 2: Detection
- Scanner node network
- Flagging + jury system
- Automated detection rules

### Phase 3: Ecosystem
- Agent framework integrations
- Multi-chain indexing
- Governance activation

---

## Conclusion

$ISNAD creates a trustless trust layer for the AI ecosystem. By combining economic incentives with on-chain inscriptions, we enable:

- **Permanent provenance** — Resources and attestations live on-chain forever
- **Market-priced trust** — Stake amounts reflect real confidence
- **Scalable verification** — No central authority bottleneck
- **Future-proof design** — Extensible to new resource types

The agent internet needs a trust layer. ISNAD provides it.

---

## Links

- Website: https://isnad.md
- GitHub: https://github.com/counterspec/isnad
- Twitter: https://twitter.com/isnad_protocol

---

*For technical implementation details, see IMPLEMENTATION.md*
