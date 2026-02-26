# ISNAD VS Code Extension

Real-time security scanning for AI agent code with inline warnings.

## Features

- **Real-time scanning**: Detects security issues as you type or save
- **Inline warnings**: Shows diagnostics directly in the editor
- **Hover tooltips**: Detailed information on hover
- **Risk levels**: Critical, High, Medium, Low severity indicators
- **Workspace scanning**: Scan entire workspace with one command
- **Configurable sensitivity**: Adjust scan sensitivity to your needs

## Installation

1. Install from VS Code Marketplace (coming soon)
2. Or install from VSIX:
   ```bash
   code --install-extension isnad-vscode-0.1.0.vsix
   ```

## Usage

### Automatic Scanning

The extension automatically scans:
- JavaScript/TypeScript files
- Python files
- On file open, save, or change (configurable)

### Manual Commands

- `ISNAD: Scan Current File` - Scan the active file
- `ISNAD: Scan Workspace` - Scan all files in workspace

### Configuration

```json
{
  "isnad.enabled": true,
  "isnad.sensitivity": "medium",
  "isnad.scanOnSave": true,
  "isnad.scanOnType": false
}
```

## Security Patterns Detected

- **Code Execution**: eval(), exec(), spawn()
- **Data Exfiltration**: Dynamic fetches, webhooks
- **Credential Access**: Environment variables, sensitive files
- **File System Abuse**: System directory writes
- **Network**: Raw sockets, DNS exfiltration
- **Obfuscation**: Hex strings, char codes
- **Security Bypass**: TLS rejection disabled

## Status Bar

Shows current file's security status:
- 🔴 Critical risk
- 🟠 High risk
- 🟡 Medium risk
- 🟢 Low risk
- ✅ Clean

## Contributing

See [ISNAD repository](https://github.com/counterspec/isnad) for contribution guidelines.

## License

MIT
