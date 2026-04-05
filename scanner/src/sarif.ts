/**
 * SARIF (Static Analysis Results Interchange Format) export for ISNAD Scanner.
 * Compatible with GitLab Security Dashboard and GitHub Code Scanning.
 */

export interface SarifResult {
  ruleId: string;
  level: 'none' | 'note' | 'warning' | 'error';
  message: { text: string };
  locations: Array<{
    physicalLocation: {
      artifactLocation: { uri: string };
      region: {
        startLine: number;
        startColumn: number;
        snippet: { text: string };
      };
    };
  }>;
}

// Simplified Finding interface (matches AnalysisResult.findings)
interface Finding {
  patternId: string;
  name: string;
  description: string;
  severity: string;
  category: string;
  line: number;
  column: number;
  match: string;
  context: string;
}

interface AnalysisResult {
  findings: Finding[];
  riskLevel: string;
  riskScore: number;
  confidence: number;
  analyzedAt: string;
  resourceHash: string;
  contentHash: string;
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface SarifReport {
  $schema: string;
  version: '2.1.0';
  runs: Array<{
    tool: {
      driver: {
        name: string;
        fullName: string;
        version: string;
        informationUri: string;
        rules: Array<{
          id: string;
          name: string;
          shortDescription: { text: string };
          helpUri: string;
          properties: { category: string };
        }>;
      };
    };
    results: SarifResult[];
  }>;
}

function mapSeverityToSarifLevel(severity: string): SarifResult['level'] {
  const map: Record<string, SarifResult['level']> = {
    critical: 'error',
    high: 'error',
    medium: 'warning',
    low: 'note',
  };
  return map[severity] || 'note';
}

export function toSarifResult(finding: Finding, targetPath: string): SarifResult {
  return {
    ruleId: finding.patternId,
    level: mapSeverityToSarifLevel(finding.severity),
    message: {
      text: `${finding.name}: ${finding.description}`,
    },
    locations: [{
      physicalLocation: {
        artifactLocation: { uri: targetPath },
        region: {
          startLine: finding.line,
          startColumn: finding.column,
          snippet: { text: finding.context },
        },
      },
    }],
  };
}

export function analysisResultToSarif(result: AnalysisResult, targetPath: string = '.'): SarifReport {
  const findingRules = new Map<string, {
    id: string;
    name: string;
    description: string;
    category: string;
  }>();

  for (const f of result.findings) {
    if (!findingRules.has(f.patternId)) {
      findingRules.set(f.patternId, {
        id: f.patternId,
        name: f.name,
        description: f.description,
        category: f.category,
      });
    }
  }

  const rules = Array.from(findingRules.values()).map(r => ({
    id: r.id,
    name: r.name,
    shortDescription: { text: r.description },
    helpUri: 'https://github.com/counterspec/isnad',
    properties: { category: r.category },
  }));

  const sarifResults = result.findings.map(f => toSarifResult(f, targetPath));

  return {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [{
      tool: {
        driver: {
          name: '@isnad/scanner',
          fullName: 'ISNAD Scanner - AI Security Scanner',
          version: '0.1.0',
          informationUri: 'https://github.com/counterspec/isnad',
          rules,
        },
      },
      results: sarifResults,
    }],
  };
}

export function sarifToJson(sarif: SarifReport): string {
  return JSON.stringify(sarif, null, 2);
}
