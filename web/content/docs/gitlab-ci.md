# GitLab CI Integration

Run ISNAD scanner checks in GitLab merge request pipelines.

Copy `examples/gitlab/.gitlab-ci.yml` into your GitLab repository root and configure:

```yaml
variables:
  ISNAD_SCAN_TARGETS: "skills/**/*.js prompts/**/*.md configs/**/*.json"
  ISNAD_SCAN_OUTPUT: "isnad-scan-results.json"
  ISNAD_SCAN_FAIL_FAST: "false"
```

The job runs on merge requests and the default branch, writes scanner JSON to `ISNAD_SCAN_OUTPUT`, and keeps that file as an artifact for reviewer and auditor evidence.

