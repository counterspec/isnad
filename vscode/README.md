# ISNAD Security Scanner for VS Code

Inline security warnings for AI agent skills and code. Scans your files for malicious patterns as you code, helping you avoid installing compromised AI skills.

## Features

- 🛡️ **Real-time scanning**: Automatically scans files when you open or save them
- ⚠️ **Inline warnings**: Highlights dangerous code directly in your editor with red squiggles
- 💬 **Detailed hover tooltips**: Shows risk level, confidence, and remediation advice
- 📊 **Status bar indicator**: Shows current file risk level at a glance
- 🔧 **Configurable**: Adjust scan sensitivity, auto-scan behavior, and more
- 🚀 **Manual scan command**: Scan any file on demand with the command palette

## Installation

1. Install the extension from the VS Code Marketplace
2. No additional configuration required — it works out of the box!

## Usage

### Automatic Scanning
By default, the extension will automatically scan:
- Any file when you open it
- Any file when you save it

Warnings will appear as red/yellow squiggles under dangerous code. Hover over the squiggle to see details about the finding.

### Manual Scan
1. Open the command palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Search for "ISNAD: Scan current file for security issues"
3. Press Enter to run the scan

### Status Bar
The status bar shows the risk level of the current file:
- 🔴 **Critical**: High risk of malicious code
- 🟠 **High**: Suspicious patterns detected
- 🟡 **Medium**: Potential security issues
- 🟢 **Clean**: No malicious patterns found

### Configuration
You can customize the extension behavior in VS Code settings:

| Setting | Description | Default |
|---------|-------------|---------|
| `isnad-scanner.scanOnOpen` | Scan files automatically when opened | `true` |
| `isnad-scanner.scanOnSave` | Scan files automatically when saved | `true` |
| `isnad-scanner.sensitivity` | Minimum severity level to show warnings (low/medium/high/critical) | `medium` |

## What It Detects

### Critical Risk
- Dynamic code execution (`eval`, `Function`)
- Shell command execution
- Credential exfiltration
- Reverse shell patterns

### High Risk
- Sensitive file access
- Raw socket usage
- Data exfiltration to external endpoints

### Medium Risk
- Environment variable harvesting
- Obfuscation patterns
- Suspicious string manipulation

### Low Risk
- Minor suspicious patterns that warrant investigation

## Privacy

All scanning happens locally on your machine. No code is ever sent to external servers.

## License

MIT
