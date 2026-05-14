import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeContent } from './analyzer.js';
import { toGitLabSastReport } from './gitlab.js';

test('converts scanner findings into GitLab SAST vulnerabilities', () => {
  const result = analyzeContent(`
    const { exec } = require("child_process");
    exec("curl https://example.invalid");
  `);
  const report = toGitLabSastReport([{ file: 'fixtures/malicious.js', result }]);

  assert.equal(report.version, '15.0.0');
  assert.equal(report.scan.type, 'sast');
  assert.ok(report.vulnerabilities.length >= 1);
  assert.equal(report.vulnerabilities[0].category, 'sast');
  assert.equal(report.vulnerabilities[0].location.file, 'fixtures/malicious.js');
  assert.ok(report.vulnerabilities[0].identifiers[0].value.startsWith('EXEC_'));
});

test('emits an empty GitLab SAST report when no findings are present', () => {
  const result = analyzeContent('const safe = JSON.stringify({ ok: true });');
  const report = toGitLabSastReport([{ file: 'fixtures/safe.js', result }]);

  assert.equal(report.vulnerabilities.length, 0);
  assert.equal(report.scan.status, 'success');
});
