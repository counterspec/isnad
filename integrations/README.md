# GitLab CI Integration for ISNAD

This document explains how to integrate ISNAD scanning into your GitLab CI/CD pipeline.

## Quick Start

Add the following to your `.gitlab-ci.yml`:

```yaml
include:
  - remote: 'https://raw.githubusercontent.com/counterspec/isnad/main/integrations/gitlab-ci.yml'
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ISNAD_TARGET` | Directory to scan | `.` |
| `ISNAD_OUTPUT_FORMAT` | Output format (json, sarif) | `sarif` |
| `ISNAD_FAIL_ON_FINDINGS` | Fail pipeline on findings | `true` |
| `ISNAD_API_KEY` | API key for dashboard upload | - |

### Example Pipeline

```yaml
stages:
  - build
  - test
  - security

include:
  - remote: 'https://raw.githubusercontent.com/counterspec/isnad/main/integrations/gitlab-ci.yml'

# Your existing jobs...
build:
  stage: build
  script:
    - npm run build

test:
  stage: test
  script:
    - npm test
```

## GitLab Security Dashboard

When using SARIF output, findings will appear in the GitLab Security Dashboard:

1. Go to **Security & Compliance > Security Dashboard**
2. View ISNAD scan results alongside other security tools

## Advanced Configuration

### Custom Scan Targets

```yaml
isnad-scan:
  variables:
    ISNAD_TARGET: "./src"
    ISNAD_OUTPUT_FORMAT: "json"
```

### Ignore Specific Rules

Create `.isnadignore`:

```
# Ignore test files
**/*.test.js

# Ignore specific patterns
**/node_modules/**
```

## Troubleshooting

### High False Positive Rate

Adjust the sensitivity level in your scan configuration.

### Pipeline Fails

Set `ISNAD_FAIL_ON_FINDINGS: "false"` to make the scan informational only.

## Support

- Documentation: https://isnad.md/docs
- Issues: https://github.com/counterspec/isnad/issues
