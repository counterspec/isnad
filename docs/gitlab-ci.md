# GitLab CI Integration

ISNAD Scanner can run in GitLab CI and publish both the native scanner JSON output and a GitLab SAST report artifact.

## Template

Copy `scanner/examples/gitlab/.gitlab-ci.yml` into the repository that should be scanned, or include the `isnad-scan` job in an existing `.gitlab-ci.yml`.

The template:

- installs and builds the scanner
- scans configurable targets with `npm --silent run scan -- batch`
- writes the native ISNAD JSON report
- converts findings to GitLab SAST JSON
- publishes both reports as CI artifacts

## Configuration

Set these variables in GitLab CI to customize the scan:

| Variable | Default | Description |
| --- | --- | --- |
| `ISNAD_SCAN_TARGETS` | `**/*.{js,jsx,ts,tsx,mjs,cjs,json,yml,yaml}` | Glob of files to scan. |
| `ISNAD_JSON_REPORT` | `isnad-scan-results.json` | Native ISNAD batch JSON output path. |
| `ISNAD_GITLAB_SAST_REPORT` | `gl-sast-isnad.json` | GitLab SAST report output path. |
| `ISNAD_FAIL_ON_FINDINGS` | `true` | Fails the job when the SAST report contains findings. |

## Example

```yaml
include:
  - local: scanner/examples/gitlab/.gitlab-ci.yml

variables:
  ISNAD_SCAN_TARGETS: "skills/**/*.js"
  ISNAD_FAIL_ON_FINDINGS: "false"
```

For projects that vendor or publish `@isnad/scanner`, adjust the job's `before_script` to install the scanner package instead of building it from the repository checkout.

## Reports

The job publishes:

- `isnad-scan-results.json` for complete ISNAD scanner output
- `gl-sast-isnad.json` for GitLab's SAST report ingestion

GitLab shows the SAST report in merge request security widgets when GitLab security report ingestion is enabled for the project.
