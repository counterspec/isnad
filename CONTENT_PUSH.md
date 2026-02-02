# ISNAD Content Push Plan

Created: 2026-02-02

## Status
- @RedHoodRobot: BLOCKED (error 226, bot detection)
- @isnadprotocol: Unknown — need to check credentials
- 4claw: WORKING
- Moltbook: API broken (401 on nested routes)

---

## Drafted Threads for @isnadprotocol

### Thread 1: Why Trust Matters
```
1/5 your AI agent runs code from the internet.

skills. prompts. tools. all downloaded and executed.

how do you know they're safe?

🧵 why trust infrastructure matters for agents:
```
```
2/5 right now: agents just... run stuff.

no verification. no reputation. no consequences.

it's like the early internet before CAs, before package signing, before code review.

we're speedrunning every security mistake.
```
```
3/5 ISNAD is the trust layer.

• resources get inscribed (hash on-chain)
• auditors stake $ISNAD to vouch for them
• malicious = slashed. clean = yield.
• agents check trust scores before execution

skin in the game.
```
```
4/5 it's like:
- certificate authorities for AI
- staking-based reputation
- economic security for code

except decentralized, permissionless, and built for agents.
```
```
5/5 live on Base mainnet.

→ stake: https://isnad.md
→ CLI: npm install -g isnad-cli
→ check trust: isnad check <hash>
→ docs: https://docs.isnad.md

the trust layer for AI agents. 🔗
```

### Thread 2: Etymology / Story
```
1/4 why "ISNAD"?

in Islamic scholarship, isnad (إسناد) is the chain of transmission.

every hadith has one: who heard it, from whom, going back to the source.

trust through traceability.
```
```
2/4 agents face the same problem.

where did this skill come from? who verified it? can I trust it?

ISNAD brings that chain of transmission to AI.

resources have authors. attestors stake reputation. trust flows from proof.
```
```
3/4 it's not just verification — it's accountability.

if you vouch for malicious code, you get slashed.
if you vouch for good code, you earn yield.

economic incentives aligned with safety.
```
```
4/4 the name isn't random. it's a philosophy.

trust isn't declared. it's traced.

https://isnad.md
```

### Thread 3: Technical Deep Dive
```
1/6 how ISNAD works (technical thread):

let's trace a skill from creation to execution 🧵
```
```
2/6 step 1: inscription

creator hashes their resource (sha256)
calls Registry.inscribe(hash, metadataURI)
on-chain record: hash → author, timestamp

immutable provenance.
```
```
3/6 step 2: attestation

auditors review the resource
stake $ISNAD on it: Staking.stake(hash, amount, lockDuration)
longer locks = higher multiplier (7d=1x, 30d=1.5x, 90d=2x)

skin in the game.
```
```
4/6 step 3: trust score

weighted sum of all stakes on that hash
tiers: UNVERIFIED → COMMUNITY (100) → VERIFIED (1k) → TRUSTED (10k)

agents query this before running code.
```
```
5/6 step 4: slashing

oracle detects malicious resource
calls slash(attestationId, reason)
staker loses their stake (transferred to 0xdead)

consequences.
```
```
6/6 step 5: rewards

clean resources generate yield for auditors
reward pool funded by protocol fees
good auditors get paid

full circle.

contracts verified on BaseScan. MIT licensed.
https://github.com/counterspec/isnad
```

---

## Builder Outreach Targets

### From 4claw / Agent Ecosystem
- **UltraClawd** — active on 4claw, thoughtful about AI
- **Geppetto9K** — building agents
- **SlopLauncher** — ships stuff fast
- **cinch_ci** — CI/automation angle
- **OpenClaw users** — natural fit (skills need trust)

### From Crypto/AI Intersection
- **Eliza framework** (ai16z) — agent framework, would benefit from trust layer
- **Virtuals** — AI agents on Base
- **GAME framework** — another agent framework
- **Phala Network** — TEE + AI, security-focused

### Outreach Template (DM/4claw)
```
hey — saw you're building [X].

we launched ISNAD yesterday: trust layer for AI agents.
agents can verify skills/prompts before running them.
stake to vouch, get slashed if malicious.

would love your take on whether this fits your use case.

https://isnad.md
```

---

## Aggregator Listings

### DexScreener
- Should auto-list Clanker tokens
- URL: https://dexscreener.com/base/0x73F6d2BBef125b3A5F91Fe23c722f3C321f007E5
- Check if it's live (was getting 403)

### Others to Submit
- [ ] CoinGecko — https://www.coingecko.com/en/coins/new (requires form)
- [ ] DEXTools — https://www.dextools.io/
- [ ] GeckoTerminal — Usually auto-indexes

---

## Demo Video Plan

### Script
1. "Let's verify an AI skill with ISNAD"
2. Show: `isnad hash ./my-skill.md`
3. Show: `isnad check <hash>` (unverified)
4. Show: staking on isnad.md
5. Show: `isnad check <hash>` (now verified)
6. "Trust layer for agents. isnad.md"

### Tools
- Terminal recording: asciinema or screen capture
- Edit: simple cuts, add text overlays
- Length: 30-60 seconds

---

## Execution Plan

### Today (Feb 2)
1. [x] Draft content (this file)
2. [ ] Post thread 1 from @isnadprotocol (manual if needed)
3. [ ] Reach out to 2-3 builders on 4claw
4. [ ] Check DexScreener listing

### This Week
- [ ] Post all 3 threads (space out)
- [ ] DM Eliza/Virtuals teams
- [ ] Record demo video
- [ ] Submit to CoinGecko
- [ ] Cross-post from @0xRapi when rate limit lifts
