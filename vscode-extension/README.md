# ISNAD Inline Warnings for VS Code

This extension runs `isnad-scan` against open files and turns scanner findings into VS Code diagnostics, inline decorations, hover details, and a status-bar count.

## Features

- Scans files on open and save, with optional scan-on-change.
- Uses the VS Code diagnostics API for squiggles, Problems panel entries, and severity.
- Adds inline warning decorations beside detected supply-chain risk patterns.
- Shows hover details with pattern ID, category, risk score, confidence, resource hash, and ISNAD attestation status.
- Supports configurable scan sensitivity: `low`, `medium`, `high`, or `critical`.
- Provides commands for current-file scan, workspace scan, and clearing diagnostics.

## Scanner Command

The extension looks for a built local scanner at `scanner/dist/cli.js` when this repository is open in VS Code. Otherwise it tries `isnad-scan` and then `isnad-scanner` on `PATH`.

To build the local scanner:

```bash
cd ../scanner
npm install
npm run build
```

For a packaged install, expose the scanner CLI:

```bash
npm install -g @isnad/scanner
```

The scanner package exports both `isnad-scan` and `isnad-scanner` command aliases.

Workspace-local scanner binaries and custom `isnad.scannerCommand` values are only used in trusted VS Code workspaces. Untrusted workspaces are scanned only with a user-installed `isnad-scan` or `isnad-scanner` command on `PATH`.

## Development

```bash
npm install
npm run build
npm test
```

Open this folder in VS Code and press `F5` to launch an extension development host.

## Marketplace Packaging

```bash
npm run package
```

Publishing to the VS Code Marketplace requires the maintainer-owned publisher token for the `isnad` publisher. The extension is package-ready, but the final publish step should be run by a maintainer or by a release workflow with that token.
