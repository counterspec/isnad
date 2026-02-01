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
# Install via npm
npm install -g @isnad/cli

# Verify installation
isnad --version
```

Requires Node.js 18+.

## Getting $ISNAD Tokens

You need $ISNAD tokens to stake on resources.

**Testnet (Base Sepolia):**
- Get testnet ETH from [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)
- Request testnet $ISNAD from the [ISNAD Discord](https://discord.gg/isnad)

**Mainnet (Base):**
- Bridge ETH to Base via [bridge.base.org](https://bridge.base.org)
- Swap for $ISNAD on Uniswap: [app.uniswap.org](https://app.uniswap.org)
- Contract: `0x56d202C2E1C5a3D7538Ed6CAD674d4E07D83cbb4`

## Contract Addresses

### Base Sepolia (Testnet)
- Token: `0x56d202C2E1C5a3D7538Ed6CAD674d4E07D83cbb4`
- Registry: `0x8340783A495BB4E5f2DF28eD3D3ABcD254aA1C93`
- Staking: `0x2B5aF6cd0AF41B534aA117eECE7650dDE8B044bE`
- Oracle: `0x4f1968413640bA2087Db65d4c37912d7CD598982`
- RewardPool: `0xfD75A1BD5d3C09d692B1fb7ECEA613BA08961911`

### Base Mainnet
- Coming soon

## Links

- Website: [isnad.md](https://isnad.md)
- Docs: [isnad.md/docs](https://isnad.md/docs)
- GitHub: [github.com/isnadprotocol](https://github.com/isnadprotocol)
- Twitter: [@isnadprotocol](https://x.com/isnadprotocol)
- Discord: [discord.gg/isnad](https://discord.gg/isnad)
