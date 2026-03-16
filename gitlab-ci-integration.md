# isnad-scan — GitLab CI/CD Integration Guide

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [How It Works](#how-it-works)
4. [Configuration Reference](#configuration-reference)
5. [GitLab Security Dashboard](#gitlab-security-dashboard)
6. [Quality Gate](#quality-gate)
7. [Scanning External Packages](#scanning-external-packages)
8. [Scheduled / Nightly Scans](#scheduled--nightly-scans)
9. [Advanced Configuration](#advanced-configuration)
10. [Troubleshooting](#troubleshooting)
11. [CI/CD Variable Reference](#cicd-variable-reference)

---

## Overview

`isnad-scan` is a proof-of-stake auditing tool for AI agent skills and
software packages. This guide explains how to integrate it into a GitLab
CI/CD pipeline so that:

- Every merge request is scanned before merge.
- Security findings surface in the **GitLab Security Dashboard**.
- A configurable **quality gate** can block merges with low trust scores.
- Scheduled nightly scans catch newly-discovered issues.

---

## Quick Start

### 1. Include the component template

Add the following to your project's `.gitlab-ci.yml`:

