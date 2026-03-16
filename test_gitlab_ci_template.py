"""
tests/test_gitlab_ci_template.py
=================================
Validates the isnad-scan GitLab CI/CD templates.

Tests verify:
  1. Valid YAML syntax for all template files
  2. Required keys and structure
  3. Variable defaults and allowed values
  4. Artifact configuration (SARIF for Security Dashboard)
  5. Rules logic
  6. Example pipeline schemas

Run with:
    pip install pytest pyyaml
    pytest tests/test_gitlab_ci_template.py -v
"""

import os
import pathlib
import pytest
import yaml

# ── Paths ─────────────────────────────────────────────────────
ROOT = pathlib.Path(__file__).parent.parent
TEMPLATES_DIR = ROOT / "templates"
EXAMPLES_DIR  = ROOT / "examples"

ROOT_CI       = ROOT / ".gitlab-ci.yml"
COMPONENT     = TEMPLATES_DIR / "isnad-scan.gitlab-ci.yml"
BASIC         = EXAMPLES_DIR / "basic"    / ".gitlab-ci.yml"
ADVANCED      = EXAMPLES_DIR / "advanced" / ".gitlab-ci.yml"
NPM_EXAMPLE   = EXAMPLES_DIR / "npm-package"    / ".gitlab-ci.yml"
PYPI_EXAMPLE  = EXAMPLES_DIR / "python-package" / ".gitlab-ci.yml"

ALL_FILES = [ROOT_CI, COMPONENT, BASIC, ADVANCED, NPM_EXAMPLE, PYPI_EXAMPLE]


# ── Helpers ───────────────────────────────────────────────────

def load_yaml(path: pathlib.Path) -> dict:
    """Load a YAML file; handle GitLab CI component spec front-matter."""
    content = path.read_text()

    # GitLab CI component templates use `spec:` followed by `---` separator.
    # Strip the spec block so standard YAML parsers can read the job definitions.
    if content.startswith("spec:"):
        # Split on the `---` document separator
        parts = content.split("\n---\n", maxsplit=1)
        if len(parts) == 2:
            content = parts[1]

    return yaml.safe_load(content)


# ── Fixture: all template + example paths ─────────────────────

@pytest.fixture(params=ALL_FILES, ids=lambda p: p.name)
def ci_file(request):
    return request.param


# ══════════════════════════════════════════════════════════════
# 1. File existence
# ══════════════════════════════════════════════════════════════

class TestFileExistence:
    def test_all_files_exist(self, ci_file):
        assert ci_file.exists(), f"Expected file not found: {ci_file}"

    def test_all_files_non_empty(self, ci_file):
        assert ci_file.stat().st_size > 0, f"File is empty: {ci_file}"


# ══════════════════════════════════════════════════════════════
# 2. YAML validity
# ══════════════════════════════════════════════════════════════

class TestYamlValidity:
    def test_valid_yaml(self, ci_file):
        """All CI files must parse as valid YAML."""
        try:
            data = load_yaml(ci_file)
            assert data is not None, f"YAML parsed to None: {ci_file}"
        except yaml.YAMLError as exc:
            pytest.fail(f"YAML parse error in {ci_file}: {exc}")

    def test_yaml_is_dict(self, ci_file):
        data = load_yaml(ci_file)
        assert isinstance(data, dict), (
            f"Top-level YAML must be a mapping, got {type(data)} in {ci_file}"
        )


# ══════════════════════════════════════════════════════════════
# 3. Root .gitlab-ci.yml — structure
# ══════════════════════════════════════════════════════════════

class TestRootCi:
    @pytest.fixture(autouse=True)
    def _load(self):
        self.data = load_yaml(ROOT_CI)

    def test_has_stages(self):
        assert "stages" in self.data, "Root CI must define `stages`"

    def test_stages_is_list(self):
        assert isinstance(self.data["stages"], list)

    def test_required_stages_present(self):
        stages = self.data["stages"]
        for required in ("scan", "report"):
            assert required in stages, f"Stage `{required}` missing from root CI"

    def test_has_variables(self):
        assert "variables" in self.data, "Root CI should define top-level `variables`"

    def test_required_variables_defined(self):
        variables = self.data["variables"]
        required_vars = [
            "ISNAD_SCAN_VERSION",
            "ISNAD_SCAN_TARGET",
            "ISNAD_SCAN_OUTPUT_FORMAT",
            "ISNAD_SCAN_REPORT_PATH",
            "ISNAD_SCAN_MIN_TRUST_SCORE",
            "ISNAD_SCAN_FAIL_ON_SEVERITY",
        ]
        for var in required_vars:
            assert var in variables, f"Variable `{var}` missing from root CI"

    def test_default_output_format(self):
        fmt = self.data["variables"]["ISNAD_SCAN_OUTPUT_FORMAT"]
        assert fmt in ("sarif", "json", "table"), (
            f"Unexpected default output format: {fmt}"
        )

    def test_default_min_trust_score_is_numeric(self):
        score = self.data["variables"]["ISNAD_SCAN_MIN_TRUST_SCORE"]
        assert str(score).isdigit(), "ISNAD_SCAN_MIN_TRUST_SCORE must be numeric"
        assert 0 <= int(score) <= 100, "Trust score must be in range 0–100"

    def test_sarif_scan_job_exists(self):
        assert "isnad:scan:sarif" in self.data, (
            "Root CI must define `isnad:scan:sarif` job"
        )

    def test_sarif_job_has_artifacts(self):
        job = self.data["isnad:scan:sarif"]
        assert "artifacts" in job, "`isnad:scan:sarif` must define artifacts"

    def test_sarif_job_reports_sast(self):
        job = self.data["isnad:scan:sarif"]
        reports = job.get("artifacts", {}).get("reports", {})
        assert "sast" in reports, (
            "`isnad:scan:sarif` must declare `artifacts.reports.sast` "
            "for GitLab Security Dashboard"
        )

    def test_sarif_artifact_when_always(self):
        """Artifacts should upload even on failure so the dashboard sees issues."""
        job = self.data["isnad:scan:sarif"]
        when = job.get("artifacts", {}).get("when", "on_success")
        assert when == "always", (
            "`isnad:scan:sarif` artifacts.when should be `always`"
        )

    def test_json_scan_job_exists(self):
        assert "isnad:scan:json" in self.data

    def test_summary_scan_job_exists(self):
        assert "isnad:scan:summary" in self.data

    def test_report_upload_job_exists(self):
        assert "isnad:report:upload" in self.data

    def test_gate_job_exists(self):
        assert "isnad:gate" in self.data


# ══════════════════════════════════════════════════════════════
# 4. Component template — spec and job structure
# ══════════════════════════════════════════════════════════════

class TestComponentTemplate:
    @pytest.fixture(autouse=True)
    def _load(self):
        # Load full raw text for spec block checks
        self.raw = COMPONENT.read_text()
        # Load parsed job portion
        self.data = load_yaml(COMPONENT)

    def test_has_spec_block(self):
        assert self.raw.startswith("spec:"), (
            "Component template must begin with a `spec:` block"
        )

    def test_has_document_separator(self):
        assert "\n---\n" in self.raw, (
            "Component template must use `---` to separate spec from jobs"
        )

    def test_isnad_scan_job_defined(self):
        assert "isnad:scan" in self.data, (
            "Component must define an `isnad:scan` job"
        )

    def test_job_has_image(self):
        job = self.data["isnad:scan"]
        assert "image" in job, "`isnad:scan` must specify an `image`"

    def test_job_has_script(self):
        job = self.data["isnad:scan"]
        assert "script" in job, "`isnad:scan` must have a `script` section"

    def test_job_has_artifacts(self):
        job = self.data["isnad:scan"]
        assert "artifacts" in job

    def test_job_has_rules(self):
        job = self.data["isnad:scan"]
        assert "rules" in job, "`isnad:scan` must define `rules`"

    def test_spec_defines_target_input(self):
        assert "inputs.target" in self.raw or '"target"' in self.raw or "target:" in self.raw, (
            "Component spec must expose a `target` input"
        )

    def test_spec_defines_min_trust_input(self):
        assert "min_trust_score" in self.raw, (
            "Component spec must expose a `min_trust_score` input"
        )

    def test_spec_defines_output_format_input(self):
        assert "output_format" in self.raw

    def test_spec_defines_fail_on_input(self):
        assert "fail_on_severity" in self.raw


# ══════════════════════════════════════════════════════════════
# 5. Example pipelines
# ══════════════════════════════════════════════════════════════

class TestBasicExample:
    @pytest.fixture(autouse=True)
    def _load(self):
        self.data = load_yaml(BASIC)

    def test_has_include(self):
        assert "include" in self.data, "Basic example must use `include`"

    def test_has_stages(self):
        assert "stages" in self.data


class TestAdvancedExample:
    @pytest.fixture(autouse=True)
    def _load(self):
        self.data = load_yaml(ADVANCED)

    def test_has_include(self):
        assert "include" in self.data

    def test_has_gate_job(self):
        assert "isnad:gate" in self.data, (
            "Advanced example must define a quality gate job"
        )

    def test_gate_job_allow_failure_false(self):
        gate = self.data["isnad:gate"]
        allow_failure = gate.get("allow_failure", True)
        assert allow_failure is False, (
            "Quality gate must set `allow_failure: false`"
        )

    def test_has_nightly_job(self):
        assert "isnad:nightly" in self.data, (
            "Advanced example should define a nightly scheduled scan"
        )

    def test_nightly_triggered_by_schedule(self):
        nightly = self.data["isnad:nightly"]
        rules = nightly.get("rules", [])
        schedule_rule_found = any(
            "schedule" in str(r) for r in rules
        )
        assert schedule_rule_found, (
            "Nightly job must be triggered by `CI_PIPELINE_SOURCE == 'schedule'`"
        )

    def test_has_deploy_job(self):
        assert "deploy:production" in self.data


class TestNpmExample:
    @pytest.fixture(autouse=True)
    def _load(self):
        self.data = load_yaml(NPM_EXAMPLE)

    def test_has_include(self):
        assert "include" in self.data

    def test_has_audit_job(self):
        assert "isnad:audit:npm" in self.data

    def test_has_install_job(self):
        assert "install:dependencies" in self.data

    def test_install_needs_audit(self):
        install = self.data["install:dependencies"]
        needs = install.get("needs", [])
        needs_names = [
            (n["job"] if isinstance(n, dict) else n) for n in needs
        ]
        assert "isnad:audit:npm" in needs_names, (
            "install job must `needs` the audit job to enforce ordering"
        )


class TestPypiExample:
    @pytest.fixture(autouse=True)
    def _load(self):
        self.data = load_yaml(PYPI_EXAMPLE)

    def test_has_include(self):
        assert "include" in self.data

    def test_has_audit_job(self):
        assert "isnad:audit:pypi" in self.data

    def test_has_test_job(self):
        assert "run:tests" in self.data

    def test_tests_need_audit(self):
        tests = self.data["run:tests"]
        needs = tests.get("needs", [])
        needs_names = [
            (n["job"] if isinstance(n, dict) else n) for n in needs
        ]
        assert "isnad:audit:pypi" in needs_names


# ══════════════════════════════════════════════════════════════
# 6. Security / best-practice checks
# ══════════════════════════════════════════════════════════════

class TestSecurityBestPractices:
    def test_no_hardcoded_tokens(self, ci_file):
        """CI files must never hardcode secret values."""
        content = ci_file.read_text().lower()
        suspicious_patterns = [
            "glpat-",          # GitLab personal access token prefix
            "isnad_secret=",
            "api_key=",
            "password=",
        ]
        for pattern in suspicious_patterns:
            assert pattern not in content, (
                f"Possible hardcoded secret `{pattern}` found in {ci_file}"
            )

    def test_sarif_report_not_excluded_from_artifacts(self):
        """The SARIF report must be included in artifacts for dashboard ingestion."""
        data = load_yaml(ROOT_CI)
        sarif_job = data.get("isnad:scan:sarif", {})
        paths = sarif_job.get("artifacts", {}).get("paths", [])
        # At least one path should reference the report directory or sarif file
        has_report_path = any(
            "isnad" in str(p).lower() or "report" in str(p).lower()
            for p in paths
        )
        assert has_report_path, (
            "SARIF artifact path not configured in `isnad:scan:sarif`"
        )

    def test_artifacts_expire_in_set(self):
        """Artifacts should have an expiry to avoid storage bloat."""
        data = load_yaml(ROOT_CI)
        for job_name, job in data.items():
            if not isinstance(job, dict):
                continue
            if "artifacts" not in job:
                continue
            assert "expire_in" in job["artifacts"], (
                f"Job `{job_name}` has artifacts but no `expire_in`"
            )


# ══════════════════════════════════════════════════════════════
# 7. Smoke test — isnad-scan CLI (if installed)
# ══════════════════════════════════════════════════════════════

class TestIsnadScanCli:
    """
    Optional smoke tests that run only when isnad-scan is installed.
    These are skipped in environments without the package.
    """

    @pytest.fixture(autouse=True)
    def _skip_if_not_installed(self):
        pytest.importorskip(
            "isnad_scan",
            reason="isnad-scan not installed — skipping CLI smoke tests"
        )

    def test_cli_version(self):
        import subprocess
        result = subprocess.run(
            ["isnad-scan", "--version"],
            capture_output=True, text=True
        )
        assert result.returncode == 0, (
            f"isnad-scan --version failed: {result.stderr}"
        )

    def test_cli_help(self):
        import subprocess
        result = subprocess.run(
            ["isnad-scan", "--help"],
            capture_output=True, text=True
        )
        assert result.returncode == 0

    def test_cli_scan_current_directory(self, tmp_path):
        """Scan a safe empty directory — should exit 0."""
        import subprocess
        result = subprocess.run(
            ["isnad-scan", "--format", "json",
             "--output", str(tmp_path / "report.json"),
             str(tmp_path)],
            capture_output=True, text=True
        )
        # Exit code 0 = clean; exit code 2 = findings above threshold
        assert result.returncode in (0, 2), (
            f"Unexpected exit code {result.returncode}: {result.stderr}"
        )
