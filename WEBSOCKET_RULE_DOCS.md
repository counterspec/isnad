# ISNAD-WS-001: Malicious WebSocket Handler

| Field       | Value                                      |
|-------------|---------------------------------------------|
| Rule ID     | ISNAD-WS-001                               |
| Name        | Malicious WebSocket Handler                |
| Severity    | 🔴 CRITICAL                                |
| Confidence  | HIGH                                        |
| Version     | 1.0.0                                       |
| Track       | Detection                                   |

---

## Overview

Some supply chain attacks use WebSocket connections instead of plain HTTP
for their Command-and-Control (C2) channel. WebSocket offers attackers
several advantages:

- **Bidirectional, persistent connection** — attacker can push commands
  at any time without polling.
- **Blends with legitimate traffic** — HTTPS/WSS uses the same port (443).
- **Harder to block** — firewalls that allow outbound HTTPS implicitly
  allow WSS.
- **No repeated DNS queries** — once established, the connection persists.

This rule detects five distinct malicious pattern categories, each
scored independently.

---

## Pattern Categories

### 1. Suspicious WebSocket Endpoint (`+40 pts`)

Flags WebSocket connections to destinations that legitimate libraries
would never hard-code:

| Sub-pattern | Example |
|-------------|---------|
| Raw IP address | `new WebSocket('ws://10.0.0.1:4444')` |
| Base64-encoded URL | `new WebSocket(atob('d3M6Ly8...'))` |
| Environment variable endpoint | `new WebSocket(process.env.C2_HOST)` |
| Tunnel services (ngrok, serveo…) | `new WebSocket('wss://x.ngrok.io/shell')` |

### 2. Data Exfiltration via WebSocket (`+35 pts`)

Flags `.send()` calls that transmit sensitive data:

| Sub-pattern | Example |
|-------------|---------|
| All env vars | `ws.send(JSON.stringify(process.env))` |
| File contents | `ws.send(fs.readFileSync('/etc/passwd'))` |
| Credential files | `ws.send(fs.readFileSync('~/.ssh/id_rsa'))` |
| System recon | `ws.send(os.userInfo())` |

### 3. Reverse Shell via WebSocket (`+45 pts`)

Flags patterns where a shell process is spawned and its I/O is bridged
to a WebSocket (interactive reverse shell):

| Sub-pattern | Example |
|-------------|---------|
| Shell spawn | `spawn('/bin/bash', ['-i'])` |
| exec output forwarded | `exec(cmd, (e,out) => ws.send(out))` |
| Message triggers exec | `ws.on('message', cmd => exec(cmd))` |
| PTY via node-pty | `require('node-pty').spawn(...)` |

### 4. C2 Beacon / Heartbeat (`+30 pts`)

Flags periodic heartbeats and aggressive reconnection logic:

| Sub-pattern | Example |
|-------------|---------|
| Interval beacon | `setInterval(() => ws.send({alive}), 30000)` |
| Auto-reconnect on close | `ws.on('close', () => new WebSocket(...))` |

### 5. Obfuscated WebSocket Usage (`+25 pts`)

Flags obfuscation techniques applied to WebSocket code:

| Sub-pattern | Example |
|-------------|---------|
| Hex-encoded strings | `\x77\x73\x3a//...` near WebSocket |
| `String.fromCharCode` URL | `new WebSocket(String.fromCharCode(...))` |
| `eval()` with WebSocket | `eval('new WebSocket(...)')` |

---

## Scoring

