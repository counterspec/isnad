# GitLab CI Integration

This document explains how to integrate ISNAD scanner into your GitLab CI/CD pipeline.

## Quick Start

Add the following to your `.gitlab-ci.yml`:

```yaml
include:
  - remote: https://raw.githubusercontent.com/counterspec/isnad/main/.gitlab-ci-isnad.yml
```

## Configuration

You can customize the scan behavior by setting variables in your CI/CD settings or in your `.gitlab-ci.yml`:

| Variable | Description | Default |
|----------|-------------|---------|
| `ISNAD_SCAN_TARGET` | File or glob pattern to scan | `"./**/*.js"` |
| `ISNAD_FAIL_THRESHOLD` | Fail pipeline if risk level >= this value: `critical` / `high` / `medium` / `low` / `none` | `"high"` |
| `ISNAD_INCREMENTAL_SCAN` | Only scan changed files in merge requests | `"true"` |
| `ISNAD_OUTPUT_SARIF` | Output SARIF report for GitLab Security Dashboard | `"true"` |
| `ISNAD_SCAN_DISABLED` | Set to `true` to disable ISNAD scan | `false` |

## Example Configuration

```yaml
include:
  - remote: https://raw.githubusercontent.com/counterspec/isnad/main/.gitlab-ci-isnad.yml

variables:
  ISNAD_SCAN_TARGET: "./src/**/*.{js,ts,py}"
  ISNAD_FAIL_THRESHOLD: "medium"
```

## How It Works

1. **Full scan on default branch**: Every commit to your main branch will trigger a full scan of all target files
2. **Incremental scan on MRs**: Merge requests only scan changed files to speed up pipelines
3. **SARIF integration**: Scan results are automatically sent to the GitLab Security Dashboard
4. **Pipeline failure**: If any finding meets or exceeds the fail threshold, the pipeline will fail

## Security Dashboard

To view scan results in the GitLab Security Dashboard:
1. Go to your project page
2. Click "Security & Compliance" → "Security Dashboard"
3. Filter by "Tool: ISNAD Scanner" to see all findings

## Troubleshooting

### Scan is running but no findings are showing up
- Ensure your `ISNAD_SCAN_TARGET` pattern matches the files you want to scan
- Check that the files have supported extensions (js, ts, py, sh, bash, php)

### Pipeline is failing on legitimate code
- Adjust `ISNAD_FAIL_THRESHOLD` to a higher severity level
- You can also add false positive exceptions by adding `// isnad-ignore` comment above the line
