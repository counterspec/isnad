
# ISNAD Skill JSON Schema Reference

## Overview
This document describes the "Skill" resource type schema used in the ISNAD protocol for AI agents. Skills are modular code packages, tools, or workflows that can be attested to for trustworthiness.

### Core Fields
The schema includes metadata for resource identification, versioning, and attestation requirements.

---

## Fields

| Field                | Type     | Description                                                                                     | Required | Example Value                     |
|----------------------|----------|-------------------------------------------------------------------------------------------------|----------|-----------------------------------|
| **name**             | string   | Unique identifier for the skill.                                                               | Yes      | `"weather-skill"`                 |
| **version**          | string   | Version of the skill using semantic versioning (MAJOR.MINOR.PATCH).                          | Yes      | `"1.2.0"`                          |
| **author**           | string   | Ethereum address of the resource author.                                                      | Yes      | `"0x1234567890abcdef1234567890abcdef12345678"` |
| **description**      | string   | Description of the skill's purpose and functionality.                                         | Yes      | `"Get weather forecasts from OpenWeatherMap API"` |
| **license**          | string   | License under which the skill is distributed.                                                 | Yes      | `"MIT"`                            |
| **contentHash**      | string   | Keccak-256 hash of the skill content.                                                         | Yes      | `"0x7f3a8b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a"` |
| **contentType**      | string   | MIME type of the skill content.                                                               | Yes      | `"application/javascript"`         |
| **encoding**         | string   | Character encoding of the skill content.                                                      | Yes      | `"utf-8"`                          |
| **size**             | integer  | Size of the skill content in bytes.                                                           | Yes      | `4096`                             |
| **tags**             | array    | List of tags describing the skill's functionality.                                             | No       | `["weather", "api", "utility"]`    |
| **homepage**         | string   | URL to the skill's documentation or repository.                                               | No       | `"https://github.com/example/weather-skill"` |
| **dependencies**     | array    | List of dependency hashes or addresses.                                                       | No       | `["0xabcd1234...", "0xef012345..."]` |
| **ext**              | object   | Extension fields for protocol-specific metadata.                                             | No       | `{ "isnad.security": { "sandboxRequired": true } }` |

---

## ISNAD-Specific Fields

| Field                | Type     | Description                                                                                     | Required | Example Value                     |
|----------------------|----------|-------------------------------------------------------------------------------------------------|----------|-----------------------------------|
| **type**             | integer  | Resource type code (0x01 for SKILL).                                                           | Yes      | `1`                               |
| **flags**            | integer  | Bitmask of resource flags (e.g., COMPRESSED, ENCRYPTED).                                      | Yes      | `0x0000`                           |
| **chunks**           | integer  | Number of chunks if content is split across multiple transactions.                           | No       | `1`                               |
| **chunkIndex**       | integer  | Index of the current chunk (for chunked inscriptions).                                         | No       | `0`                               |
| **supersedes**       | string   | Hash of the resource this version supersedes.                                                 | No       | `"base:0x1234..."`                |
| **supersededBy**     | string   | Hash of the resource that supersedes this version.                                            | No       | `"base:0x5678..."`                |

---

## Trust Attestation Fields

| Field                | Type     | Description                                                                                     | Required | Example Value                     |
|----------------------|----------|-------------------------------------------------------------------------------------------------|----------|-----------------------------------|
| **trustTier**        | string   | Trust tier of the resource (UNVERIFIED, COMMUNITY, VERIFIED, TRUSTED).                         | No       | `"VERIFIED"`                       |
| **auditorCount**     | integer  | Number of auditors who have staked on this resource.                                          | No       | `3`                               |
| **totalStaked**      | integer  | Total amount of $ISNAD staked on this resource.                                               | No       | `1000`                             |
| **inscriptionHash**  | string   | Hash of the inscription transaction.                                                          | No       | `"base:0x1234..."`                |

---

## Example JSON Schema

```json
{
  "name": "weather-skill",
  "version": "1.2.0",
  "author": "0x1234567890abcdef1234567890abcdef12345678",
  "description": "Get weather forecasts from OpenWeatherMap API",
  "license": "MIT",
  "contentHash": "0x7f3a8b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a",
  "contentType": "application/javascript",
  "encoding": "utf-8",
  "size": 4096,
  "tags": ["weather", "api", "utility"],
  "homepage": "https://github.com/example/weather-skill",
  "type": 1,
  "flags": 0x0000,
  "ext": {
    "isnad.security": {
      "sandboxRequired": true
    }
  }
}
```

---

## Trust Tiers

| Tier         | Threshold          | Description                                                                                     |
|--------------|--------------------|-------------------------------------------------------------------------------------------------|
| UNVERIFIED   | 0 $ISNAD           | No attestation.                                                                               |
| COMMUNITY    | ≥100 $ISNAD        | Some community backing.                                                                         |
| VERIFIED     | ≥1,000 $ISNAD       | Significant stake, multiple auditors.                                                          |
| TRUSTED      | ≥10,000 $ISNAD      | High confidence, long lock periods.                                                             |

---

## Usage Notes
- **Resource Inscriptions:** Skills are inscribed on Base L2 with content and metadata.
- **Attestation:** Auditors stake $ISNAD tokens to attest to the resource's safety.
- **Trust Verification:** Consumers can check trust scores before using third-party skills.
- **Version Locking:** Attestations are pinned to specific versions to prevent malicious updates.
