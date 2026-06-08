import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeContent } from './analyzer.js';

function findingIds(content: string): string[] {
  return analyzeContent(content).findings.map(finding => finding.patternId);
}

test('detects plaintext WebSocket endpoints', () => {
  assert.ok(findingIds("const socket = new WebSocket('ws://example.com/control')").includes('NET_WEBSOCKET_INSECURE'));
});

test('detects commonly abused WebSocket tunnel endpoints', () => {
  assert.ok(findingIds("const socket = new WebSocket('wss://agent.ngrok-free.app/ws')").includes('NET_WEBSOCKET_INSECURE'));
});

test('allows ordinary secure WebSocket endpoints', () => {
  assert.ok(!findingIds("const socket = new WebSocket('wss://example.com/events')").includes('NET_WEBSOCKET_INSECURE'));
});

test('detects environment variable exfiltration over WebSocket', () => {
  assert.ok(findingIds('socket.send(process.env.API_TOKEN)').includes('EXFIL_WEBSOCKET_SEND'));
});

test('detects file content exfiltration over WebSocket', () => {
  assert.ok(findingIds("socket.send(readFileSync('/tmp/data'))").includes('EXFIL_WEBSOCKET_SEND'));
});

test('detects command execution in a WebSocket message handler', () => {
  const content = "socket.on('message', command => { exec(command) })";
  assert.ok(findingIds(content).includes('EXEC_WEBSOCKET_MESSAGE'));
});

test('allows WebSocket message handlers without command execution', () => {
  const content = "socket.on('message', message => { console.log(message) })";
  assert.ok(!findingIds(content).includes('EXEC_WEBSOCKET_MESSAGE'));
});
