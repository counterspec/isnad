# GitLab CI Integration

ISNAD Scanner can run in GitLab CI and publish a SAST report artifact for the GitLab Security Dashboard.

## Setup

1. Copy the root `.gitlab-ci.yml` template into a GitLab project.
2. Adjust `ISNAD_SCAN_TARGETS` to the files you want to scan.
3. Run a pipeline and open the Security tab to review findings from `scanner/gl-sast-report.json`.

## Template

```yaml
stages:
  - security

isnad-scan:
  image: node:20
  stage: security
  variables:
    ISNAD_SCAN_TARGETS: "**/*.{js,ts,mjs,cjs}"
  before_script:
    - cd scanner
    - npm ci
    - npm run build
  script:
    - npm run scan -- gitlab-sast "$ISNAD_SCAN_TARGETS" --output "gl-sast-report.json"
  artifacts:
    when: always
    reports:
      sast: scanner/gl-sast-report.json
    paths:
      - scanner/gl-sast-report.json
  allow_failure: true
```

## Configuration

`ISNAD_SCAN_TARGETS` is a glob passed to `isnad-scanner gitlab-sast`. Keep it narrow for faster pipelines, for example `src/**/*.{js,ts}`.

The template writes the report inside `scanner/` after `cd scanner`, then publishes `scanner/gl-sast-report.json` as a CI artifact.

Use `--fail-on-findings` in the script if a project wants high or critical scanner findings to fail the pipeline.
