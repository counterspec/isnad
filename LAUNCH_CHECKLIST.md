# ISNAD Launch Checklist

## Pre-Launch (Complete These First)

### Infrastructure
- [x] Contracts deployed to testnet (v2 with AutoUnpausable)
- [x] All 129 tests passing
- [x] Website live at isnad.md
- [x] skill.md available at /skill.md
- [x] npm packages published (@isnad/cli, @isnad/scanner)
- [ ] **Mainnet deployment** — Need ~0.02 ETH on Base
- [ ] Scanner service deployed (Railway/Fly)

### Brand & Social
- [x] Logo (gold Arabic إسناد)
- [x] Twitter avatar (centered for circle crop)
- [x] Twitter banner (abstract network, no text)
- [x] OG image (gold theme)
- [ ] **@isnadprotocol first tweet**
- [ ] Twitter profile bio set
- [ ] Twitter avatar/banner uploaded

### Documentation
- [x] Decisions documented in IMPLEMENTATION.md
- [x] Contract addresses updated everywhere
- [x] API docs on website
- [ ] README updated with mainnet addresses (after deploy)

---

## Launch Day

### Token Launch (Clawnch/Clanker)
- [ ] Decide launch timing
- [ ] Prepare launch announcement copy
- [ ] Launch token via Clawnch
- [ ] Verify LP created
- [ ] Update contract addresses if different from testnet token

### Announcements
- [ ] @isnadprotocol launch tweet
- [ ] Thread explaining what ISNAD is
- [ ] Post to m/clawnch on Moltbook
- [ ] Cross-post to relevant communities

### Verification
- [ ] Verify contracts on Basescan
- [ ] Test CLI against mainnet
- [ ] Test /check page against mainnet

---

## Post-Launch (Week 1)

### Auditor Onboarding
- [ ] Reach out to security researchers
- [ ] Contact AI safety community
- [ ] Invite ClawHub skill authors
- [ ] First auditor stakes recorded

### Scanner Operations
- [ ] Scanner monitoring live inscriptions
- [ ] First resource flagged (test or real)
- [ ] Jury system tested

### Community
- [ ] Discord/Telegram set up (if needed)
- [ ] First community questions answered
- [ ] Documentation gaps filled based on feedback

---

## Metrics to Track

- Total resources inscribed
- Total ISNAD staked
- Number of active auditors
- Number of attestations
- Trading volume (Clawnch)
- Twitter followers (@isnadprotocol)

---

## Emergency Procedures

### If exploit found:
1. Call `pause(7 days)` on affected contract (PAUSER_ROLE)
2. Assess damage
3. Communicate transparently
4. Deploy v2 if needed, migrate stakes

### Contract addresses (testnet v2):
- Token: `0xc41c1006A1AaC093C758A2f09de16fee2561651A`
- Registry: `0x5A06453257874Fd000738F28C462d17BFf8e1EA3`
- Staking: `0x58983D142A388A96B7d9F970005483AA044CCAD9`
- Oracle: `0x418EbF8F206fA6efF3318647d8c4Ac137dDf3aC7`
- RewardPool: `0x474cB2441C0Af053DAe052302a6829a218Aa656F`
- Timelock: `0x2c99dB618a6dBFf0F0e74f7949fcC9A23ffB4A69`
- Governor: `0xf08269e04029eB0eeAfcE10Ed3aa9Fb2bAbB61Cd`

---

*Last updated: 2026-02-01*
