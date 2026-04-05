# GitLab CI/CD Integration

The [ISNAD Scanner](../README.md) integrates with GitLab CI/CD to automatically
security-scan your codebase on every push and merge request, producing SARIF
reports that appear in the GitLab Security Dashboard.

## Quick Start

1. Copy the `.gitlab-ci.yml` from this repo into your project root
2. Adjust `SCAN_TARGETS` to match your source directories
3. Push a commit or create a merge request — the pipeline runs automatically

Example `.gitlab-ci.yml` snippet:

```yaml
variables:
  SCAN_TARGETS: "src/ lib/"
  SCAN_FAIL_LEVEL: "high"

stages:
  - scan

isnad-security-scan:
  stage: scan
  image: node:20-alpine
  before_script:
    - apk add --no-cache git bash
    - git clone --depth 1 --branch "main" https://github.com/counterspec/isnad.git /tmp/isnad
    - cd /tmp/isnad/scanner && npm ci && npm run build
    - cd "$CI_PROJECT_DIR"
  script:
    - node /tmp/isnad/scanner/dist/cli.js batch "src/**/*.{ts,js}" --sarif-output is-report.json || EXIT_CODE=1
```

## SARIF Output

The SARIF (`--sarif-output`) flag produces reports compatible with:
- **GitLab SAST Reports**: Automatically displayed in the Merge Request widget
- **GitHub Code Scanning**: Upload via `github/codeql-action/upload-sarif`
- **Any SARIF-aware tool**: VS Code, IDE integrations

## Configurable Targets

| Variable | Default | Description |
|----------|---------|-------------|
| `SCAN_TARGETS` | `src/ lib/ scripts/ packages/` | Space-separated list of dirs/files to scan |
| `SCAN_FAIL_LEVEL` | `high` | Pipeline fails if findings reach this severity (critical/high/medium/low) |
| `ISNAD_SCANNER_VERSION` | `main` | Which version/branch of isnad to use |

## Scheduled Scans

To run weekly scans of your entire codebase, add a pipeline schedule in
GitLab: **CI/CD > Schedules > New schedule**

```yaml
.isnad-weekly-scan:
  variables:
    SCAN_TARGETS: "src/ packages/ lib/ scripts/ tests/ contracts/"
  rules:
    - if: $CI_PIPELINE_SOURCE == "schedule"
```

See `.gitlab-ci-templates.yml` for full advanced templates with auto-issue creation.

## Pipeline Example Output

```
=== ISNAD Security Scanner ===
Targets: src/ lib/
Fail Level: high

--- Scanning directory: src/ ---
🔴 src/handler.ts: critical (2 findings)
🟡 src/utils.ts: medium (1 findings)
✅ src/index.ts: clean (0 findings)

SARIF report written to: isnad-reports/isnad-sarif.json

=== ISNAD scan completed ===
```

## Advanced: Auto-Issue on Critical Findings

The `.gitlab-ci-templates.yml` includes a template that automatically creates
a GitLab issue when critical or high-severity findings are detected, including
the full scan results as description.
