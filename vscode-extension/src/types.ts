export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type RiskLevel = Severity | 'clean';
export type ScanSensitivity = Severity;

export interface ScanFinding {
  patternId: string;
  name: string;
  description: string;
  severity: Severity;
  category: string;
  line: number;
  column: number;
  match: string;
  context: string;
}

export interface ScanResult {
  resourceHash: string;
  contentHash: string;
  findings: ScanFinding[];
  riskScore: number;
  riskLevel: RiskLevel;
  analyzedAt: string;
  confidence: number;
}

export interface SimpleRange {
  startLine: number;
  startCharacter: number;
  endLine: number;
  endCharacter: number;
}

export interface DiagnosticModel {
  range: SimpleRange;
  finding: ScanFinding;
  message: string;
  source: string;
  code: string;
  attestationStatus: string;
  riskScore: number;
  confidence: number;
  resourceHash: string;
}
