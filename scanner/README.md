# ISNAD Scanner

Detection oracle for the ISNAD trust protocol. Scans AI resources (skills, prompts, configs) for malicious patterns and submits flags to the on-chain oracle.

## Installation

```bash
cd scanner
npm install
npm run build
```

## Usage

### Scan a file

```bash
# Basic scan
npm run scan -- scan ./path/to/skill.js

# Output as JSON
npm run scan -- scan ./path/to/skill.js --json

# With custom resource hash
npm run scan -- scan ./path/to/skill.js --hash 0x123...
```

### Scan multiple files

```bash
# Scan all JS files in a directory
npm run scan -- batch "./skills/**/*.js"

# Fail fast on first high-risk finding
npm run scan -- batch "./skills/**/*.js" --fail-fast
```

### Generate evidence

```bash
npm run scan -- evidence ./malicious-skill.js
```

### Submit flag to oracle

```bash
# Dry run (analyze but don't submit)
npm run scan -- flag ./malicious-skill.js --dry-run

# Submit to testnet
npm run scan -- flag ./malicious-skill.js --network testnet

# Submit to mainnet
npm run scan -- flag ./malicious-skill.js --network mainnet
```

### Run as service

```bash
# Set environment variables
export ISNAD_PRIVATE_KEY=0x...
export ISNAD_AUTO_FLAG=false  # Set true for automatic flagging

# Start service
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ISNAD_PRIVATE_KEY` | Private key for flag submissions | Required |
| `ISNAD_REGISTRY_ADDRESS` | Registry contract address | Sepolia default |
| `ISNAD_ORACLE_ADDRESS` | Oracle contract address | Sepolia default |
| `ISNAD_NETWORK` | `testnet` or `mainnet` | `testnet` |
| `ISNAD_AUTO_FLAG` | Auto-submit flags | `false` |
| `ISNAD_MIN_CONFIDENCE` | Min confidence for auto-flag | `0.7` |

## Detection Patterns

The scanner detects:

### Critical
- Dynamic code execution (`eval`, `Function`)
- Shell command execution (`exec`, `spawn`)
- Child process imports
- VM module usage
- Keychain/credential store access
- System directory writes

### High
- Data exfiltration (webhooks, base64 sends)
- Sensitive file reads (`.env`, `.ssh`, credentials)
- Raw socket access
- DNS-based exfiltration
- Security bypass attempts
- Cryptocurrency mining

### Medium
- Environment variable access
- Recursive directory reads
- Home directory access
- Obfuscation patterns

### Low
- Unicode escape sequences
- Minor suspicious patterns

## API

```typescript
import { analyzeContent, formatResult } from '@isnad/scanner';

const result = analyzeContent(code, resourceHash);
console.log(formatResult(result));

// Result includes:
// - riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'clean'
// - riskScore: number
// - confidence: 0-1
// - findings: detailed pattern matches
```

## Contract Addresses

### Base Sepolia (Testnet)
- Registry: `0x8340783A495BB4E5f2DF28eD3D3ABcD254aA1C93`
- Oracle: `0x4f1968413640bA2087Db65d4c37912d7CD598982`

### Base Mainnet
- Coming soon

## License

MIT
