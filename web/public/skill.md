# ISNAD Skill — Trust Layer for AI Agents

Check and stake on resources using the ISNAD protocol on Base L2.

## Quick Start

```bash
# Check trust score for a resource
isnad check <hash>

# Stake tokens on a resource (requires wallet)
isnad stake <hash> <amount> --lock 30

# Check your ISNAD balance
isnad balance

# Compute hash for content
isnad hash "content string"
isnad hash -f /path/to/file
```

## Environment Setup

Set your wallet private key:
```bash
export ISNAD_PRIVATE_KEY=0x...
```

Or pass it per-command with `--key`.

## Commands

### Check Trust Score
```bash
isnad check <resourceHash>
```
Returns:
- Trust score (weighted ISNAD staked)
- Trust tier (UNVERIFIED → COMMUNITY → VERIFIED → TRUSTED)
- Auditor count
- Inscription status

Output includes JSON for programmatic parsing.

### Stake on a Resource
```bash
isnad stake <resourceHash> <amount> [options]

Options:
  -l, --lock <days>   Lock duration: 7, 30, or 90 days (default: 30)
  -k, --key <key>     Private key (or use ISNAD_PRIVATE_KEY env)
```

Lock multipliers:
- 7 days: 1.0x weight
- 30 days: 1.5x weight  
- 90 days: 2.0x weight

Example:
```bash
# Stake 100 ISNAD for 90 days (2x multiplier)
isnad stake 0x7f3a8b2c... 100 --lock 90
```

### Inscribe a Resource
```bash
isnad inscribe <file> [options]

Options:
  -t, --type <type>   Resource type (default: raw)
  -m, --metadata <json>   JSON metadata string
  -k, --key <key>     Private key
```

Resource types:
- `raw` (0) — Raw content
- `agent` (1) — Agent persona/config
- `prompt` (2) — System prompt
- `tool` (3) — Tool specification
- `workflow` (4) — Workflow definition
- `training` (5) — Training data
- `model` (6) — Model documentation

Example:
```bash
isnad inscribe ./weather-skill/SKILL.md --type tool \
  --metadata '{"name":"weather","version":"1.0.0"}'
```

### Compute Content Hash
```bash
# Hash a string
isnad hash "Hello, ISNAD!"

# Hash a file
isnad hash -f ./file.txt
```

### Check Balance
```bash
# By address
isnad balance 0x123...

# By private key (derives address)
isnad balance --key 0x...
```

## Trust Tiers

| Tier | Threshold | Meaning |
|------|-----------|---------|
| UNVERIFIED | 0 | No stake |
| COMMUNITY | 100 ISNAD | Some community backing |
| VERIFIED | 1,000 ISNAD | Significant stake |
| TRUSTED | 10,000 ISNAD | High confidence |

## Network Selection

Default is Base Sepolia testnet. Use `--network` for mainnet:
```bash
isnad check 0x... --network mainnet
```

## Slashing Risk

⚠️ **Stakes can be slashed** if the resource is found to be malicious. Only stake on resources you've reviewed and trust.

## For Agents

When using ISNAD programmatically, the `check` command outputs JSON:
```json
{
  "hash": "0x7f3a8b2c...",
  "inscribed": true,
  "author": "0x123...",
  "trustScore": "1250.0",
  "trustTier": "VERIFIED",
  "auditorCount": 3
}
```

Parse this to make trust decisions before using third-party skills/prompts.

## Installation

```bash
# From npm (when published)
npm install -g isnad-cli

# Or from source
cd isnad/cli && npm install && npm run build
npm link
```

## Contract Addresses

### Base Sepolia (Testnet)
- Token: `0x...` (TBD after deployment)
- Registry: `0x...`
- Staking: `0x...`

### Base Mainnet
- Token: `0x...` (TBD)
- Registry: `0x...`
- Staking: `0x...`
