# VS Code Extension

The VS Code extension lives in `vscode-extension/` and satisfies the inline-warning integration track:

- Runs `isnad-scan` on opened or saved documents.
- Maps scanner findings into the VS Code diagnostics API.
- Adds inline decorations for flagged dependencies and suspicious code paths.
- Shows hover tooltips with risk details, confidence, resource hash, and ISNAD attestation status.
- Supports scan sensitivity configuration.
- Includes TypeScript unit tests for range mapping, severity filtering, hover text, and scanner JSON parsing.

## Quick Start

```bash
cd scanner
npm install
npm run build

cd ../vscode-extension
npm install
npm run build
npm test
```

Then open `vscode-extension/` in VS Code and press `F5` to launch an Extension Development Host.

## Packaging

```bash
cd vscode-extension
npm run package
```

Publishing to the VS Code Marketplace requires maintainer access to the `isnad` publisher account. The code is prepared for packaging; the marketplace publish action should be run by maintainers or CI with publisher credentials.
