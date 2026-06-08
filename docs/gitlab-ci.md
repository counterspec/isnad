# GitLab CI Integration

Use the ISNAD scanner in GitLab CI to check AI skills, prompts, and agent configs before they are merged or deployed.

## Template

Copy `examples/gitlab/.gitlab-ci.yml` into your GitLab project root, then adjust the scan targets for your repository:

```yaml
variables:
  ISNAD_SCAN_TARGETS: "skills/**/*.js prompts/**/*.md configs/**/*.json"
  ISNAD_SCAN_OUTPUT: "isnad-scan-results.json"
  ISNAD_SCAN_FAIL_FAST: "false"
```

The job runs on merge requests and on the default branch. It stores the JSON scan result as a pipeline artifact for review.

## Scan Targets

Set `ISNAD_SCAN_TARGETS` to one or more shell globs. Keep them focused on files that contain executable agent behavior or instructions:

- `skills/**/*.js`
- `skills/**/*.ts`
- `prompts/**/*.md`
- `agents/**/*.json`
- `configs/**/*.yaml`

## JSON And Security Dashboard Output

The template runs the scanner with `--json` and writes the output to `ISNAD_SCAN_OUTPUT`. GitLab keeps that file as an artifact and also receives it through `artifacts:reports:sast`.

If your GitLab instance requires strict GitLab SAST schema output, keep the JSON artifact enabled and add a conversion step after the scanner command. The raw scanner output remains available for auditors and merge reviewers.

## Fail-Fast Mode

Set `ISNAD_SCAN_FAIL_FAST=true` when you want the scanner to stop on the first high-risk finding:

```yaml
variables:
  ISNAD_SCAN_FAIL_FAST: "true"
```

## Example Pipeline

```yaml
include:
  - local: examples/gitlab/.gitlab-ci.yml

variables:
  ISNAD_SCAN_TARGETS: "agent-skills/**/*.js system-prompts/**/*.md"
  ISNAD_SCAN_OUTPUT: "gl-isnad-scan.json"
```

For a standalone project, copy the template instead of using `include: local`.

