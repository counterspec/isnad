# ISNAD Protocol Roadmap

> Living document for tracking protocol development, security improvements, and planned upgrades.

---

## Current Deployment (Base Mainnet)

| Contract | Address | Version | Status |
|----------|---------|---------|--------|
| Token | `0x73F6d2BBef125b3A5F91Fe23c722f3C321f007E5` | V1 | ✅ Final |
| Registry | `0xb8264f3117b498ddF912EBF641B2301103D80f06` | V1 | ⚠️ Deprecated |
| Registry | `0x7EA99470e22E5149F97FbDeB5807AEF54Deafc01` | V2 | ✅ Active |
| Staking | `0x916FFb3eB82616220b81b99f70c3B7679B9D62ca` | V1 | ✅ Active |
| Oracle | `0xf02c3A5FED3c460628b5781E3c304Dd8206E85bd` | V1 | ⚠️ Needs V2 (see below) |
| RewardPool | `0x790b0766e9e2db7c59526b247851D16bB493a95B` | V1 | ✅ Active |
| Timelock | `0x3Ef44fb908C86865A9315277f9AFc6b65A87e702` | V1 | ✅ Active |
| Governor | `0xB230Ffa9CA40F705756BC12698119f1B45687cd6` | V1 | ✅ Active |

---

## Immediate: Registry V2 Deployment

**Priority:** CRITICAL  
**Status:** Code ready, awaiting deployment  
**Script:** `contracts/scripts/deploy-registry-v2.ts`

### Fix: Chunk Timeout Griefing Vector
- **Problem:** Chunked inscriptions have no timeout. Attacker can block arbitrary content hashes forever by starting chunk 0 and never completing.
- **Solution:** Added `CHUNK_TIMEOUT` (24h) and `cleanupAbandonedChunk()` function
- **Migration:** 
  - Deploy V2
  - Update indexer to watch both V1 + V2
  - Frontend uses V2 for new inscriptions
  - V1 data preserved in events (immutable)

### Deployment Checklist
- [x] Deploy Registry V2 to Base mainnet — `0x7EA99470e22E5149F97FbDeB5807AEF54Deafc01`
- [ ] Verify on BaseScan
- [ ] Update API config (`api/src/config.ts`)
- [ ] Update web config (`web/src/config.ts`)
- [ ] Update indexer to dual-watch
- [ ] Announce migration

---

## Short-term: Oracle V2

**Priority:** HIGH  
**Status:** Code ready, deployment blocked on VRF integration  
**Target:** Before significant TVL in detection system

### Fixes Included

#### 1. Weak PRNG → Commit-Reveal (DONE in code)
- **Problem:** Jury selection uses `blockhash(block.number - 1)` — predictable by validators
- **Solution:** Commit-reveal pattern with 5-block delay
- **Code:** `ISNADOracle.sol` updated with `commitBlock` field and `COMMIT_BLOCKS` constant

#### 2. transfer() → call() (DONE in code)  
- **Problem:** `transfer()` forwards only 2300 gas — fails for contract recipients
- **Solution:** Replace with `call()` + existing reentrancy guards
- **Locations fixed:** 3 (executeSlash, _finalizeVerdict x2)

#### 3. executeSlash Access (DOCUMENTED)
- **Decision:** Intentionally permissionless for protocol liveness
- **Added:** `nonReentrant` modifier, NatSpec documentation

### Blocked On: Chainlink VRF Integration
The commit-reveal pattern is a stopgap. For production-grade randomness:

```
TODO: Chainlink VRF Integration
- [ ] Add VRF consumer contract
- [ ] Fund LINK subscription
- [ ] Replace commit-reveal with VRF callback
- [ ] Test on Sepolia first
```

### Oracle V2 Deployment Checklist
- [ ] Integrate Chainlink VRF (or keep commit-reveal for MVP)
- [ ] Deploy Oracle V2
- [ ] Update Staking contract reference (if needed)
- [ ] Migrate active flags (if any) or wait for clean slate
- [ ] Update API/indexer

---

## Medium-term Improvements

### Staking Optimizations
**File:** `ISNADStakingV3.sol`

1. **Unbounded Array Iteration**
   - `getTrustScore()` loops all attestations — DoS risk at scale
   - Fix: Maintain running totals or pagination
   - Priority: MEDIUM (not urgent at current scale)

2. **Stale Attestation Cleanup**
   - Unstaked attestations remain in arrays (amount=0)
   - Fix: Swap-and-pop removal
   - Priority: LOW (gas optimization)

3. **Typed Interface for Burn**
   - Using raw `call()` instead of typed interface
   - Fix: `ISNADToken(token).burnFrom(...)`
   - Priority: LOW (works but fragile)

### Decentralization
1. **Reduce admin key power**
   - Move more functions behind Timelock
   - Consider multisig for emergency functions

2. **Juror pool expansion**
   - Currently admin-managed
   - Future: Permissionless juror registration with stake requirement

---

## Security Audit History

### 2026-02-02: Trail of Bits Skills Analysis
**Performed by:** Rapi (using ToB audit skills)

| Finding | Severity | Status |
|---------|----------|--------|
| Chunk timeout griefing | CRITICAL | ✅ Fixed (V2) |
| Weak PRNG jury selection | HIGH | ✅ Fixed (V2 code) |
| transfer() gas limit | HIGH | ✅ Fixed (V2 code) |
| executeSlash permissionless | HIGH | ✅ Documented |
| Unbounded array iteration | MEDIUM | 📋 Backlog |
| Stale attestation arrays | LOW | 📋 Backlog |
| Raw call for burn | LOW | 📋 Backlog |

### Strong Points (no changes needed)
- ✅ ReentrancyGuard on all state-changing functions
- ✅ SafeERC20 for token transfers
- ✅ Granular role-based access control
- ✅ AutoUnpausable emergency brake (max 7 days)
- ✅ Whale caps prevent stake concentration
- ✅ Lock periods prevent flash loan exploits
- ✅ Zero-address checks on constructors
- ✅ Solidity 0.8+ overflow protection

---

## Future Considerations

### Protocol Upgrades
- **Proxy pattern**: Consider for future contracts to enable upgrades
- **Diamond pattern**: For complex multi-facet upgrades

### Scaling
- **L2 deployment**: Already on Base, consider other L2s
- **Cross-chain**: Bridge trust scores to other chains

### Tokenomics
- **Fee distribution**: LP fees currently to deployer wallet
- **Staking rewards**: RewardPool funded but distribution TBD
- **Governance**: Governor active but needs proposal templates

---

## Quick Reference

```bash
# Deploy Registry V2
cd contracts && npx hardhat run scripts/deploy-registry-v2.ts --network base

# Run security checks
npx hardhat test
slither .

# Verify contract
npx hardhat verify --network base <ADDRESS>
```

---

*Last updated: 2026-02-02 by Rapi*
