# ISNAD GitLab CI/CD Integration

Integrate ISNAD Scanner into your GitLab CI/CD pipeline for automated security scanning and GitLab Security Dashboard integration.

## Quick Start

1. Copy `isnad-gitlab-ci.yml` to your project root (or include it):
   ```yaml
   include:
     - local: '/isnad-gitlab-ci.yml'
   ```

2. Configure CI/CD variables in **Settings > CI/CD > Variables**:
   | Variable | Required | Description |
   |----------|----------|-------------|
   | `ISNAD_PRIVATE_KEY` | No | Private key for oracle flag submissions |
   | `ISNAD_ORACLE_ADDRESS` | No | Oracle contract address (default provided) |
   | `ISNAD_NETWORK` | No | `testnet` or `mainnet` (default: `testnet`) |

3. Pipeline will run automatically on:
   - Merge requests (quick scan of changed files)
   - Default branch pushes (full scan)

## Pipeline Jobs

### `isnad-quick-scan`
Runs on merge request events. Scans only changed `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, and `.json` files for fast feedback.

### `isnad-full-scan`
Runs on default branch pushes and merge requests. Scans the entire project.

### `isnad-flag-submission`
Manual job on default branch. Submits high-confidence findings to the ISNAD Oracle. Requires `ISNAD_PRIVATE_KEY` variable.

## Output Formats

- **JSON** (`isnad-report.json`): Full scan results with all findings
- **SARIF** (`isnad-report.sarif.json`): Compatible with GitLab Security Dashboard

## Configuration Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ISNAD_SCAN_TARGETS` | `.` | File paths or glob patterns to scan |
| `ISNAD_FAIL_ON_CRITICAL` | `true` | Fail pipeline on critical findings |
| `ISNAD_FAIL_ON_HIGH` | `true` | Fail pipeline on high findings |
| `ISNAD_FAIL_ON_MEDIUM` | `false` | Fail pipeline on medium findings |
| `ISNAD_OUTPUT_FORMAT` | `json` | Output format (`json` or `text`) |
| `ISNAD_NPM_VERSION` | `latest` | `@isnad/scanner` npm package version |

## Example Pipeline Configuration

```yaml
include:
  - local: '/.gitlab-ci/isnad-gitlab-ci.yml'

# Override scan targets for a monorepo
variables:
  ISNAD_SCAN_TARGETS: "packages/*/src"
  ISNAD_FAIL_ON_MEDIUM: "true"
```

## View Results in GitLab Security Dashboard

1. Go to your project > **Security > Vulnerability Report**
2. ISNAD findings appear as vulnerabilities with severity levels
3. Click any finding for details including the matching pattern, context, and remediation guidance

## Support

- Documentation: https://isnad.md/docs/gitlab-ci
- Issues: https://github.com/counterspec/isnad/issues