# ISNAD Contracts Security Notes

## Known Issues in Deployed V1 Contracts

### ISNADRegistry V1 (`0xb8264f3117b498ddF912EBF641B2301103D80f06`)

| Issue | Severity | Status |
|-------|----------|--------|
| Chunk timeout griefing | CRITICAL | Fixed in V2 |

**Details:** Chunked inscriptions have no timeout. An attacker can permanently block any content hash by starting a chunked inscription and abandoning it.

**Mitigation:** Deploy Registry V2 (code ready in this repo).

---

### ISNADOracle V1 (`0xf02c3A5FED3c460628b5781E3c304Dd8206E85bd`)

| Issue | Severity | Status |
|-------|----------|--------|
| Weak PRNG | HIGH | Fixed in V2 code |
| transfer() gas limit | HIGH | Fixed in V2 code |
| executeSlash permissionless | HIGH | Intentional (documented) |

**Weak PRNG:** Jury selection uses predictable `blockhash(block.number - 1)`. Validators can manipulate jury composition.

**transfer():** Uses `transfer()` which forwards only 2300 gas. Smart contract flaggers may not receive refunds.

**Current Risk:** LOW — jury system not actively used yet, minimal value at stake.

**Mitigation:** Deploy Oracle V2 before enabling detection system at scale. Consider Chainlink VRF for production randomness.

---

## V2 Contracts (Ready to Deploy)

All fixes are implemented in the current codebase:

- `ISNADRegistry.sol` — Chunk timeout + cleanup function
- `ISNADOracle.sol` — Commit-reveal randomness + call() pattern

Run tests: `npx hardhat test`
Run Slither: `slither .`

---

## Audit Trail

- **2026-02-02:** Trail of Bits skills analysis (internal)
- **Formal audit:** Not yet conducted

## Contact

Security issues: Report via GitHub or contact maintainers directly.
