/**
 * Scanner Rule: Malicious WebSocket Handler Detection
 * 
 * Detects supply chain attack patterns that use WebSocket connections
 * for C2 (Command & Control) communication, data exfiltration,
 * and reverse shell establishment.
 * 
 * Rule ID: ISNAD-WS-001
 * Severity: CRITICAL
 * Track: Detection
 */

"use strict";

// ─── Pattern Definitions ──────────────────────────────────────────────────────

/**
 * Suspicious external WebSocket endpoints.
 * Legitimate libraries rarely hard-code external WS endpoints.
 */
const SUSPICIOUS_WS_ENDPOINTS = [
  // Raw IP addresses used as WS hosts (avoids DNS-based detection)
  /new\s+WebSocket\s*\(\s*[`'"](wss?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/i,
  // Dynamic endpoint construction that obfuscates the destination
  /new\s+WebSocket\s*\(\s*(?:atob|Buffer\.from|decodeURIComponent|unescape)\s*\(/i,
  // Environment variable used to hide the C2 endpoint
  /new\s+WebSocket\s*\(\s*process\.env\.[A-Z_]+/i,
  // Localhost tunneling (ngrok, serveo, localhost.run style)
  /new\s+WebSocket\s*\(\s*[`'"]wss?:\/\/[a-z0-9\-]+\.(?:ngrok(?:\.io|free\.app)|serveo\.net|localhost\.run|loca\.lt)/i,
  // Base64-encoded websocket URL
  /(?:atob|Buffer\.from)\s*\(\s*['"][A-Za-z0-9+/]{20,}={0,2}['"]\s*\).*WebSocket/i,
];

/**
 * Data exfiltration patterns over WebSocket channels.
 * Look for sends of sensitive data: env vars, files, credentials.
 */
const EXFILTRATION_PATTERNS = [
  // Sending process.env (all env vars — credentials, tokens, etc.)
  /\.send\s*\(\s*JSON\.stringify\s*\(\s*process\.env\b/i,
  // Sending file system data via WebSocket
  /\.send\s*\(\s*(?:fs|require\s*\(\s*['"]fs['"]\s*\))\.read(?:File|FileSync)\s*\(/i,
  // Sending SSH keys, .env files, or credential files
  /\.send\s*\(.*(?:\.ssh|id_rsa|\.env|credentials|\.aws|\.npmrc|\.netrc)/i,
  // Exfiltrating require('os').userInfo or homedir (recon)
  /\.send\s*\(.*(?:os\.userInfo|os\.homedir|process\.cwd|__dirname)/i,
  // Sending combined system info (classic recon exfil)
  /\.send\s*\(\s*JSON\.stringify\s*\(\s*\{[^}]*(?:hostname|platform|arch|username|env)[^}]*\}\s*\)/i,
  // Streaming stdin/stdout over WebSocket (reverse shell pattern)
  /(?:process\.stdin|child\.stdout|child\.stderr)\.(?:pipe|on\s*\(\s*['"]data['"])[^;]*\.send/i,
];

/**
 * Reverse shell patterns via WebSocket.
 * Spawning child processes whose I/O is bridged to a WebSocket.
 */
const REVERSE_SHELL_PATTERNS = [
  // exec/spawn piped directly into ws.send
  /(?:exec|execSync|spawn|spawnSync)\s*\([^)]*\)[^;]*\.send\s*\(/i,
  // Shell spawned and stdout fed into WebSocket message
  /spawn\s*\(\s*['"](?:\/bin\/(?:ba)?sh|cmd(?:\.exe)?|powershell(?:\.exe)?)['"]/i,
  // WebSocket message triggers exec (incoming command execution)
  /\.on\s*\(\s*['"]message['"]\s*,\s*(?:function|\(.*\)\s*=>)\s*\{[^}]*(?:exec|eval|spawn|Function)\s*\(/is,
  // PTY / pseudo-terminal allocated over WebSocket (advanced reverse shell)
  /require\s*\(\s*['"](?:node-pty|pty\.js|xterm)['"]\s*\)[^;]*\.on\s*\(\s*['"]data['"]/i,
  // WebSocket used as transport for interactive shell session
  /ws\.(?:send|on)\s*\([^)]*\)[^;]*(?:shell|pty|tty|terminal)/i,
];

/**
 * C2 beacon / heartbeat patterns.
 * Malware often sends periodic beacons to maintain persistence / signal readiness.
 */
const C2_BEACON_PATTERNS = [
  // setInterval used to repeatedly send data via WebSocket
  /setInterval\s*\(\s*(?:function|\(.*\)\s*=>)\s*\{[^}]*\.send\s*\(/is,
  // Reconnection loop — resilient C2 channel
  /(?:setTimeout|setInterval)\s*\([^)]*new\s+WebSocket\s*\(/i,
  // WebSocket 'close' handler that re-establishes connection (persistence)
  /\.on\s*\(\s*['"]close['"]\s*,\s*(?:function|\(.*\)\s*=>)\s*\{[^}]*new\s+WebSocket\s*\(/is,
  // Auto-reconnect with exponential backoff (sign of persistent C2)
  /on(?:close|error)[^}]*setTimeout[^}]*new\s+WebSocket/is,
];

/**
 * Obfuscation indicators combined with WebSocket usage.
 * Clean packages don't need to obfuscate their WebSocket logic.
 */
const OBFUSCATION_WITH_WS = [
  // Hex-encoded strings near WebSocket construction
  /(?:\\x[0-9a-f]{2}){4,}[^;]*WebSocket/i,
  // String.fromCharCode used to build WebSocket URL
  /String\.fromCharCode\s*\([^)]+\)[^;]*WebSocket/i,
  // eval() used to execute WebSocket code
  /eval\s*\([^)]*WebSocket/i,
  // WebSocket URL built character by character
  /WebSocket[^;]*\+[^;]*\+[^;]*\+[^;]*\+[^;]*\+[^;]*['"]/i,
];

// ─── Rule Configuration ───────────────────────────────────────────────────────

const RULE = {
  id: "ISNAD-WS-001",
  name: "Malicious WebSocket Handler",
  description:
    "Detects WebSocket-based C2 communication, data exfiltration, " +
    "and reverse shell patterns commonly used in supply chain attacks.",
  severity: "CRITICAL",
  confidence: "HIGH",
  references: [
    "https://attack.mitre.org/techniques/T1071/",   // Application Layer Protocol
    "https://attack.mitre.org/techniques/T1041/",   // Exfiltration Over C2 Channel
    "https://attack.mitre.org/techniques/T1059/",   // Command and Scripting Interpreter
  ],
  tags: ["websocket", "c2", "exfiltration", "reverse-shell", "supply-chain"],
};

// ─── Scoring Weights ──────────────────────────────────────────────────────────

const WEIGHTS = {
  suspiciousEndpoint: 40,
  exfiltration:       35,
  reverseShell:       45,
  c2Beacon:           30,
  obfuscationWithWs:  25,
};

// Minimum score to flag a file as malicious
const SCORE_THRESHOLD = 40;

// ─── Core Scanner ─────────────────────────────────────────────────────────────

/**
 * Represents a single match found in source code.
 * @typedef {Object} Match
 * @property {string} category   - Pattern category name
 * @property {string} pattern    - Human-readable pattern description
 * @property {number} line       - 1-based line number of the match
 * @property {string} snippet    - The matched source snippet (truncated)
 * @property {number} weight     - Risk score contribution
 */

/**
 * Represents the full scan result for one file.
 * @typedef {Object} ScanResult
 * @property {string}  file        - Path or identifier of scanned content
 * @property {boolean} flagged     - Whether the file exceeds the risk threshold
 * @property {number}  score       - Cumulative risk score
 * @property {Match[]} matches     - All pattern matches found
 * @property {Object}  rule        - Rule metadata
 * @property {string}  verdict     - Human-readable verdict string
 */

/**
 * Scan source code for malicious WebSocket handler patterns.
 *
 * @param {string} source   - The source code to scan
 * @param {string} [file]   - Optional file identifier for result labeling
 * @returns {ScanResult}
 */
function scan(source, file = "<unknown>") {
  if (typeof source !== "string") {
    throw new TypeError(`scan() expects a string, got ${typeof source}`);
  }

  const lines = source.split("\n");
  const matches = [];
  let score = 0;

  /**
   * Test all patterns in a category against the source and collect matches.
   */
  function testCategory(categoryName, patterns, weight) {
    for (const pattern of patterns) {
      // Reset lastIndex for global regexes (safety)
      pattern.lastIndex = 0;

      const match = pattern.exec(source);
      if (match) {
        // Find the line number of the match
        const matchIndex = match.index;
        let lineNumber = 1;
        let charCount = 0;
        for (let i = 0; i < lines.length; i++) {
          charCount += lines[i].length + 1; // +1 for newline
          if (charCount > matchIndex) {
            lineNumber = i + 1;
            break;
          }
        }

        const snippet = match[0].replace(/\s+/g, " ").slice(0, 120);

        matches.push({
          category: categoryName,
          pattern:  pattern.source.slice(0, 80) + (pattern.source.length > 80 ? "…" : ""),
          line:     lineNumber,
          snippet:  snippet,
          weight:   weight,
        });

        score += weight;
        // Only count each category once per file to avoid score inflation
        break;
      }
    }
  }

  testCategory("Suspicious WebSocket Endpoint", SUSPICIOUS_WS_ENDPOINTS,  WEIGHTS.suspiciousEndpoint);
  testCategory("Data Exfiltration via WebSocket", EXFILTRATION_PATTERNS,  WEIGHTS.exfiltration);
  testCategory("Reverse Shell via WebSocket",     REVERSE_SHELL_PATTERNS,  WEIGHTS.reverseShell);
  testCategory("C2 Beacon / Heartbeat",           C2_BEACON_PATTERNS,      WEIGHTS.c2Beacon);
  testCategory("Obfuscated WebSocket Usage",      OBFUSCATION_WITH_WS,     WEIGHTS.obfuscationWithWs);

  const flagged = score >= SCORE_THRESHOLD;

  return {
    file,
    flagged,
    score,
    matches,
    rule: { ...RULE },
    verdict: flagged
      ? `MALICIOUS — Risk score ${score} exceeds threshold ${SCORE_THRESHOLD}. ` +
        `${matches.length} suspicious pattern(s) detected.`
      : `CLEAN — Risk score ${score} below threshold ${SCORE_THRESHOLD}.`,
  };
}

/**
 * Scan multiple files at once.
 *
 * @param {Array<{file: string, source: string}>} files
 * @returns {ScanResult[]}
 */
function scanFiles(files) {
  return files.map(({ file, source }) => scan(source, file));
}

// ─── Pretty Printer ───────────────────────────────────────────────────────────

/**
 * Format a ScanResult as a human-readable report string.
 *
 * @param {ScanResult} result
 * @returns {string}
 */
function formatReport(result) {
  const lines = [
    "═".repeat(70),
    `Rule    : ${result.rule.id} — ${result.rule.name}`,
    `File    : ${result.file}`,
    `Verdict : ${result.verdict}`,
    `Score   : ${result.score}  (threshold: ${SCORE_THRESHOLD})`,
    `Flagged : ${result.flagged ? "YES ⚠️" : "NO ✅"}`,
  ];

  if (result.matches.length > 0) {
    lines.push("─".repeat(70));
    lines.push("Matches:");
    for (const m of result.matches) {
      lines.push(`  [${m.category}] line ${m.line} (+${m.weight} pts)`);
      lines.push(`    Snippet : ${m.snippet}`);
    }
  }

  lines.push("═".repeat(70));
  return lines.join("\n");
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  scan,
  scanFiles,
  formatReport,
  RULE,
  SCORE_THRESHOLD,
  WEIGHTS,
  // Expose pattern groups for external composition / testing
  SUSPICIOUS_WS_ENDPOINTS,
  EXFILTRATION_PATTERNS,
  REVERSE_SHELL_PATTERNS,
  C2_BEACON_PATTERNS,
  OBFUSCATION_WITH_WS,
};
