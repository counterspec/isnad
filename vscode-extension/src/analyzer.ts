/**
 * ISNAD Scanner - Analysis Engine
 */

import { DANGEROUS_PATTERNS, ALLOWLIST_PATTERNS, type Pattern } from './patterns';

export interface Finding {
  patternId: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  line: number;
  column: number;
  match: string;
  context: string;
}

export interface AnalysisResult {
  findings: Finding[];
  riskScore: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'clean';
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

const SEVERITY_WEIGHTS = {
  critical: 100,
  high: 40,
  medium: 15,
  low: 5
};

const RISK_THRESHOLDS = {
  critical: 100,
  high: 60,
  medium: 30,
  low: 10
};

export function analyzeContent(content: string): AnalysisResult {
  const lines = content.split('\n');
  const findings: Finding[] = [];

  for (const pattern of DANGEROUS_PATTERNS) {
    const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
    let match;

    while ((match = regex.exec(content)) !== null) {
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = beforeMatch.split('\n').length;
      const lastNewline = beforeMatch.lastIndexOf('\n');
      const column = match.index - lastNewline;

      const contextLine = lines[lineNumber - 1] || '';

      const isAllowlisted = ALLOWLIST_PATTERNS.some(allowPattern => 
        allowPattern.test(contextLine)
      );

      if (!isAllowlisted) {
        findings.push({
          patternId: pattern.id,
          name: pattern.name,
          description: pattern.description,
          severity: pattern.severity,
          category: pattern.category,
          line: lineNumber,
          column,
          match: match[0],
          context: contextLine.trim().substring(0, 200)
        });
      }
    }
  }

  const summary = {
    total: findings.length,
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length
  };

  const riskScore = 
    summary.critical * SEVERITY_WEIGHTS.critical +
    summary.high * SEVERITY_WEIGHTS.high +
    summary.medium * SEVERITY_WEIGHTS.medium +
    summary.low * SEVERITY_WEIGHTS.low;

  let riskLevel: AnalysisResult['riskLevel'] = 'clean';
  if (riskScore >= RISK_THRESHOLDS.critical) riskLevel = 'critical';
  else if (riskScore >= RISK_THRESHOLDS.high) riskLevel = 'high';
  else if (riskScore >= RISK_THRESHOLDS.medium) riskLevel = 'medium';
  else if (riskScore >= RISK_THRESHOLDS.low) riskLevel = 'low';

  return {
    findings,
    riskScore,
    riskLevel,
    summary
  };
}
