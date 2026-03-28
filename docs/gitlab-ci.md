# GitLab CI Integration for ISNAD Scanner

This document describes how to integrate ISNAD Scanner into your GitLab CI/CD pipeline.

## Overview

The ISNAD Scanner GitLab CI template provides automated security scanning for AI resources (skills, prompts, configs) in your repository. Results are uploaded to the GitLab Security Dashboard in SARIF format.

## Quick Start

### Option 1: Copy the Template

Copy `.gitlab-ci.yml` from this repository to your project's root:

```bash
curl -O https://raw.githubusercontent.com/counterspec/isnad/main/.gitlab-ci.yml
```

### Option 2: Include from Remote

Add this to your existing `.gitlab-ci.yml`:

```yaml
include:
  - remote: 'https://raw.githubusercontent.com/counterspec/isnad/main/.gitlab-ci.yml'
```

## Configuration

### Environment Variables

Configure scanning behavior using GitLab CI/CD variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `ISNAD_SCAN_PATTERN` | `./**/*.{js,ts,json,md,yaml,yml}` | Glob pattern for files to scan |
| `ISNAD_MIN_SEVERITY` | `low` | Minimum severity to report |
| `SARIF_OUTPUT` | `gl-sarif.json` | Output SARIF filename |
| `JSON_OUTPUT` | `isnad-results.json` | Output JSON filename |
| `FAIL_ON_SEVERITY` | `critical` | Severity level to fail pipeline |

### GitLab Settings

To enable SARIF upload to Security Dashboard:

1. Go to **Settings → CI/CD → General pipelines**
2. Expand **Security config**
3. Enable **Secret detection** framework

Alternatively, set `SECRET_DETECTION_FRAMEWORK` variable to `custom` and the template will upload SARIF automatically.

## Pipeline Jobs

The template includes 4 jobs:

### 1. `isnad-scan-json` (default)

Runs a full scan on all matching files. Outputs JSON and SARIF artifacts.

```yaml
isnad-scan-json:
  extends: .isnad_default
  # ... or include from remote
```

### 2. `isnad-convert-sarif`

Converts JSON results to SARIF format for GitLab Security Dashboard upload.

### 3. `isnad-scan-fast` (PR only)

Lightweight scan for merge requests - only reports high/critical issues. Won't block merges.

```yaml
# Already included in template, runs automatically on MRs
```

### 4. `isnad-scan-and-flag` (manual)

Full scan with optional oracle flag submission. Requires `ISNAD_PRIVATE_KEY`.

```yaml
isnad-scan-and-flag:
  extends: .isnad_default
  variables:
    ISNAD_PRIVATE_KEY: ${ISNAD_PRIVATE_KEY}  # Configure in GitLab CI/CD variables
    ISNAD_NETWORK: "testnet"
  when: manual
```

## Example Configurations

### Basic Setup

```yaml
# .gitlab-ci.yml
include:
  - remote: 'https://raw.githubusercontent.com/counterspec/isnad/main/.gitlab-ci.yml'
```

### TypeScript Only

```yaml
# .gitlab-ci.yml
variables:
  ISNAD_SCAN_PATTERN: "./src/**/*.ts"

include:
  - remote: 'https://raw.githubusercontent.com/counterspec/isnad/main/.gitlab-ci.yml'
```

### Python AI Skills

```yaml
# .gitlab-ci.yml
variables:
  ISNAD_SCAN_PATTERN: "./skills/**/*.py"

include:
  - remote: 'https://raw.githubusercontent.com/counterspec/isnad/main/.gitlab-ci.yml'
```

### Disable Fast Scan for PRs

```yaml
# .gitlab-ci.yml
isnad-scan-fast:
  rules:
    - if: $FALSE_VARIABLE  # Never run
```

## Viewing Results

### GitLab Security Dashboard

After a pipeline runs, view results at:

**Security → Vulnerability Report** (GitLab Ultimate)
or
**Security → Secret Detection** (GitLab Free)

### JSON Artifacts

Download raw results from CI/CD job artifacts:

1. Go to **CI/CD → Jobs**
2. Click on `isnad-scan-json` job
3. Download `isnad-results.json`

## Troubleshooting

### Scanner Not Found

If you see "command not found", ensure Node.js is available:

```yaml
isnad-scan-json:
  image: node:20-alpine
  before_script:
    - npm install -g isnad-scan
```

### SARIF Upload Fails

Make sure Secret Detection is enabled in GitLab settings:

1. **Settings → CI/CD → General pipelines**
2. Find **Security config**
3. Enable **Secret detection**

### Pipeline Hangs

Set a timeout:

```yaml
isnad-scan-json:
  timeout: 10m
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Scan complete, no high/critical issues |
| 1 | High or critical issues found |
| 2 | Scan error |

## Support

- Documentation: https://isnad.md/docs
- Issues: https://github.com/counterspec/isnad/issues
- Bounty Program: https://isnad.md/bounties

## Bounty

This integration was created as part of the ISNAD Bounty Program.

**Reward:** 750 $ISNAD

See https://isnad.md/bounties for full program details.
