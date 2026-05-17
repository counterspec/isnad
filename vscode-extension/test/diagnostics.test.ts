import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildDiagnosticModels,
  buildHoverMarkdown,
  findingToRange,
  parseScannerJson,
  shouldIncludeFinding
} from '../src/diagnostics';
import type { ScanFinding, ScanResult } from '../src/types';

const finding: ScanFinding = {
  patternId: 'EXFIL-001',
  name: 'Credential exfiltration',
  description: 'Sends secrets to an external endpoint.',
  severity: 'high',
  category: 'exfiltration',
  line: 4,
  column: 9,
  match: 'fetch(secretUrl)',
  context: 'return fetch(secretUrl);'
};

const result: ScanResult = {
  resourceHash: '0xabc',
  contentHash: '0xdef',
  findings: [finding],
  riskScore: 40,
  riskLevel: 'high',
  analyzedAt: '2026-05-17T00:00:00.000Z',
  confidence: 0.84
};

test('findingToRange maps scanner line and column to VS Code zero-based ranges', () => {
  assert.deepEqual(findingToRange(finding), {
    startLine: 3,
    startCharacter: 8,
    endLine: 3,
    endCharacter: 24
  });
});

test('shouldIncludeFinding respects scan sensitivity thresholds', () => {
  assert.equal(shouldIncludeFinding(finding, 'medium'), true);
  assert.equal(shouldIncludeFinding(finding, 'high'), true);
  assert.equal(shouldIncludeFinding(finding, 'critical'), false);
});

test('buildDiagnosticModels includes attestation status and risk evidence', () => {
  const models = buildDiagnosticModels(result, 'medium');

  assert.equal(models.length, 1);
  assert.equal(models[0].code, 'EXFIL-001');
  assert.equal(models[0].riskScore, 40);
  assert.match(models[0].message, /ISNAD attestation status/);
});

test('buildHoverMarkdown includes scanner evidence and attestation status', () => {
  const [model] = buildDiagnosticModels(result, 'medium');
  const markdown = buildHoverMarkdown(model);

  assert.match(markdown, /EXFIL-001/);
  assert.match(markdown, /84%/);
  assert.match(markdown, /attestation status/);
});

test('parseScannerJson tolerates scanner output with surrounding noise', () => {
  const parsed = parseScannerJson(`log line\n${JSON.stringify(result, null, 2)}\n`);

  assert.equal(parsed.riskLevel, 'high');
  assert.equal(parsed.findings[0].patternId, 'EXFIL-001');
});
