# ISNAD Skill — Trust Layer for AI Agents

Check and stake on resources using the ISNAD protocol on Base L2.

## Quick Start

```bash
# Check trust score (mainnet by default)
isnad check <hash>

# Check on testnet
isnad --testnet check <hash>

# Get testnet tokens (Base Sepolia only)
isnad faucet

# Stake tokens on a resource
isnad stake <hash> <amount> --lock 30

# List available networks
isnad networks
```

## Network Selection

ISNAD supports both mainnet and testnet:

```bash
# Mainnet (default)
isnad check <hash>

# Testnet - any of these work:
isnad --testnet check <hash>
isnad -t check <hash>
isnad -n sepolia check <hash>
ISNAD_TESTNET=true isnad check <hash>
```

## Environment Setup

Set your wallet private key:
```bash
export ISNAD_PRIVATE_KEY=0x...
```

For testnet mode via env:
```bash
export ISNAD_TESTNET=true
```

## Commands

### List Networks
```bash
isnad networks
```
Shows all available networks with contract addresses.

### Check Trust Score
```bash
isnad check <resourceHash>
```
Returns:
- Trust score (weighted ISNAD staked)
- Trust tier (UNVERIFIED → COMMUNITY → VERIFIED → TRUSTED)
- Auditor count
- Inscription status
- Network info

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

# Stake on testnet
isnad --testnet stake 0x7f3a8b2c... 100 --lock 30
```

### Get Testnet Tokens
```bash
isnad faucet
```
Mints 10,000 tISNAD to your wallet. Base Sepolia only.

### Compute Content Hash
```bash
# Hash a string
isnad hash -s "Hello, ISNAD!"

# Hash a file
isnad hash -f ./file.txt
```

### Check Balance
```bash
# By address
isnad balance 0x123...

# By private key (derives address)
isnad balance --key 0x...

# Testnet balance
isnad --testnet balance 0x123...
```

## Trust Tiers

| Tier | Threshold | Meaning |
|------|-----------|---------|
| UNVERIFIED | 0 | No stake |
| COMMUNITY | 100 ISNAD | Some community backing |
| VERIFIED | 1,000 ISNAD | Significant stake |
| TRUSTED | 10,000 ISNAD | High confidence |

## Slashing Risk

⚠️ **Stakes can be slashed** if the resource is found to be malicious. Only stake on resources you've reviewed and trust.

## For Agents

When using ISNAD programmatically, the `check` command outputs JSON:
```json
{
  "network": "mainnet",
  "chainId": 8453,
  "hash": "0x7f3a8b2c...",
  "inscribed": true,
  "author": "0x123...",
  "trustScore": "1250.0",
  "trustTier": "VERIFIED",
  "auditorCount": 3
}
```

Parse this to make trust decisions before using third-party skills/prompts.

## API

REST API available at `https://api.isnad.md`:

```bash
# Get trust score (mainnet)
curl "https://api.isnad.md/api/v1/trust/0x7f3a8b2c..."

# Get trust score (testnet)
curl "https://api.isnad.md/api/v1/trust/0x7f3a8b2c...?network=sepolia"

# List networks
curl "https://api.isnad.md/api/v1/networks"

# Protocol stats
curl "https://api.isnad.md/api/v1/stats?network=sepolia"
```

All responses include `network` and `chainId` fields.

## Installation

```bash
# Install via npm
npm install -g isnad-cli

# Verify installation
isnad --version
```

Requires Node.js 18+.

## Getting $ISNAD Tokens

### Testnet (Base Sepolia)
1. Get testnet ETH from [Base Sepolia Faucet](https://faucet.coinbase.com)
2. Use the CLI faucet: `isnad faucet`

### Mainnet (Base)
- Bridge ETH to Base via [bridge.base.org](https://bridge.base.org)
- Swap for $ISNAD on [Uniswap](https://app.uniswap.org/swap?chain=base&outputCurrency=0x73F6d2BBef125b3A5F91Fe23c722f3C321f007E5)

## Contract Addresses

### Base Mainnet (Production)
| Contract | Address |
|----------|---------|
| Token | `0x73F6d2BBef125b3A5F91Fe23c722f3C321f007E5` |
| Registry | `0xb8264f3117b498ddF912EBF641B2301103D80f06` |
| Staking | `0x916FFb3eB82616220b81b99f70c3B7679B9D62ca` |
| Oracle | `0xf02c3A5FED3c460628b5781E3c304Dd8206E85bd` |
| RewardPool | `0x790b0766e9e2db7c59526b247851D16bB493a95B` |
| Timelock | `0x3Ef44fb908C86865A9315277f9AFc6b65A87e702` |
| Governor | `0xB230Ffa9CA40F705756BC12698119f1B45687cd6` |

### Base Sepolia (Testnet)
| Contract | Address |
|----------|---------|
| Token (Mock) | `0x07d921D275aD82e71aE42f2B603CF2926329c1Ce` |
| Registry | `0x916FFb3eB82616220b81b99f70c3B7679B9D62ca` |
| Staking | `0xf02c3A5FED3c460628b5781E3c304Dd8206E85bd` |
| Oracle | `0x790b0766e9e2db7c59526b247851D16bB493a95B` |
| RewardPool | `0x3Ef44fb908C86865A9315277f9AFc6b65A87e702` |

**Note:** Testnet token has a public `faucet()` function — anyone can mint test tokens.

## Links

- Website: [isnad.md](https://isnad.md)
- API: [api.isnad.md](https://api.isnad.md/api/v1/networks)
- GitHub: [github.com/counterspec/isnad](https://github.com/counterspec/isnad)
- Twitter: [@isnadprotocol](https://x.com/isnadprotocol)
- Clanker: [clanker.world](https://clanker.world/clanker/0x73F6d2BBef125b3A5F91Fe23c722f3C321f007E5)
