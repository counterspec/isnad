import type { DiagnosticModel, ScanFinding, ScanResult, ScanSensitivity, Severity, SimpleRange } from './types';

const SEVERITY_RANK: Record<Severity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
};

const DEFAULT_ATTESTATION_STATUS = 'unknown - no ISNAD attestation record was returned by the scanner';

export function normalizeSensitivity(value: string | undefined): ScanSensitivity {
  if (value === 'low' || value === 'medium' || value === 'high' || value === 'critical') {
    return value;
  }
  return 'medium';
}

export function shouldIncludeFinding(finding: ScanFinding, sensitivity: ScanSensitivity): boolean {
  return SEVERITY_RANK[finding.severity] >= SEVERITY_RANK[sensitivity];
}

export function findingToRange(finding: ScanFinding): SimpleRange {
  const startLine = Math.max(0, (finding.line || 1) - 1);
  const startCharacter = Math.max(0, (finding.column || 1) - 1);
  const width = Math.max(1, finding.match?.length || finding.context?.length || 1);

  return {
    startLine,
    startCharacter,
    endLine: startLine,
    endCharacter: startCharacter + width
  };
}

export function buildDiagnosticModels(result: ScanResult, sensitivity: ScanSensitivity): DiagnosticModel[] {
  return result.findings
    .filter((finding) => shouldIncludeFinding(finding, sensitivity))
    .map((finding) => ({
      range: findingToRange(finding),
      finding,
      message: `${finding.name}: ${finding.description} (ISNAD attestation status: ${DEFAULT_ATTESTATION_STATUS})`,
      source: 'ISNAD',
      code: finding.patternId,
      attestationStatus: DEFAULT_ATTESTATION_STATUS,
      riskScore: result.riskScore,
      confidence: result.confidence,
      resourceHash: result.resourceHash
    }));
}

export function buildHoverMarkdown(model: DiagnosticModel): string {
  const confidence = `${Math.round(model.confidence * 100)}%`;

  return [
    `**ISNAD ${model.finding.severity.toUpperCase()} risk**`,
    '',
    model.finding.description,
    '',
    `Pattern: \`${model.finding.patternId}\``,
    `Category: \`${model.finding.category}\``,
    `Risk score: \`${model.riskScore}\``,
    `Confidence: \`${confidence}\``,
    `Resource hash: \`${model.resourceHash}\``,
    `ISNAD attestation status: \`${model.attestationStatus}\``
  ].join('\n');
}

export function parseScannerJson(output: string): ScanResult {
  const trimmed = output.trim();
  const jsonStart = trimmed.indexOf('{');
  const jsonEnd = trimmed.lastIndexOf('}');

  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
    throw new Error('isnad-scan did not return JSON output');
  }

  return JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1)) as ScanResult;
}
