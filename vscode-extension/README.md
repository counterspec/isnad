# ISNAD VS Code Extension

🔒 ISNAD Security Scanner - inline supply chain risk warnings directly in VS Code.

## Features

- ✅ Automatically scans open files for malicious supply chain patterns
- ✅ Shows inline warnings via VS Code diagnostics API
- ✅ Hover tooltips with full risk details
- ✅ Configurable sensitivity (minimum severity level)
- ✅ Option to enable/disable automatic scan on open
- ✅ Manual scan command available

## Requirements

- VS Code 1.80.0 or newer
- Node.js and npm

## Installation

You can install this extension from the VS Code Marketplace (once published) or build it locally:

```bash
git clone https://github.com/counterspec/isnad.git
cd isnad/vscode-extension
npm install
npm run compile
```

## Configuration

- `isnad.sensitivity`: Minimum severity level to show warnings (default: `medium`)
  - `low`: Show all findings
  - `medium`: Show medium and above
  - `high`: Show high and critical only
  - `critical`: Only critical findings

- `isnad.scanOnOpen`: Automatically scan files when opened (default: `true`)

## Commands

- **ISNAD: Scan Workspace** - Scan all open documents
- **ISNAD: Clear Warnings** - Remove all ISNAD diagnostics

## What it detects

- **Code execution**: eval, Function constructor, child_process, vm module
- **Data exfiltration**: dynamic fetch, webhooks, base64 data sending, WebSocket exfiltration
- **Credential access**: environment variables, sensitive file reads, keychain access
- **File system abuse**: writing to system directories, recursive directory reads
- **Network**: raw sockets, DNS exfiltration, WebSocket C2 connections, reverse shells over WebSocket
- **Obfuscation**: hex encoded strings, charcode obfuscation, unicode escapes
- **Abuse**: cryptocurrency mining, security bypass

## Building

```bash
npm install
npm run compile
```

## License

MIT
