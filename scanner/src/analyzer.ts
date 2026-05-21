/**
 * ISNAD Scanner - Static Analysis Engine
 */

import { DANGEROUS_PATTERNS, ALLOWLIST_PATTERNS, SAFE_DOMAINS, HTTP_CLIENT_PATTERNS, LEGITIMATE_HTTP_CONTEXT, KNOWN_SAFE_ENDPOINTS, type Pattern } from './patterns.js';
import { detectObfuscatedExfiltration, type ObfuscatedExfilResult } from './obfuscated-exfil.js';
import { detectWebSocketC2, type WebSocketC2Result } from './websocket-c2.js';
import { createHash } from 'crypto';

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
  resourceHash: string;
  contentHash: string;
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
  analyzedAt: string;
  confidence: number;
  obfuscatedExfil?: ObfuscatedExfilResult;
  websocketC2?: WebSocketC2Result;
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

/**
 * Analyze content for security issues
 */
export function analyzeContent(content: string, resourceHash?: string): AnalysisResult {
  const contentHash = createHash('sha256').update(content).digest('hex');
  const lines = content.split('\n');
  const findings: Finding[] = [];

  // Check each pattern
  for (const pattern of DANGEROUS_PATTERNS) {
    const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
    let match;

    while ((match = regex.exec(content)) !== null) {
      // Find line number and column
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = beforeMatch.split('\n').length;
      const lastNewline = beforeMatch.lastIndexOf('\n');
      const column = match.index - lastNewline;

      // Get context (the line containing the match)
      const contextLine = lines[lineNumber - 1] || '';

      // Check if this is in an allowlisted context
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

  // Calculate risk score
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

  // Determine risk level
  let riskLevel: AnalysisResult['riskLevel'] = 'clean';
  if (riskScore >= RISK_THRESHOLDS.critical) riskLevel = 'critical';
  else if (riskScore >= RISK_THRESHOLDS.high) riskLevel = 'high';
  else if (riskScore >= RISK_THRESHOLDS.medium) riskLevel = 'medium';
  else if (riskScore >= RISK_THRESHOLDS.low) riskLevel = 'low';

  // Calculate confidence based on findings consistency
  const confidence = calculateConfidence(findings, content);

  // Run advanced detectors
  const obfuscatedExfil = detectObfuscatedExfiltration(content);
  const websocketC2 = detectWebSocketC2(content);

  // Add obfuscated exfil findings
  if (obfuscatedExfil.hasObfuscatedExfil) {
    for (const f of obfuscatedExfil.findings) {
      findings.push({
        patternId: `OBFUSC_EXFIL_${f.type.toUpperCase()}`,
        name: `Obfuscated Exfiltration: ${f.type.replace(/_/g, ' ')}`,
        description: f.description,
        severity: f.severity,
        category: 'obfuscated_exfiltration',
        line: f.line,
        column: f.column,
        match: f.match.substring(0, 100),
        context: f.context.substring(0, 200)
      });
    }
  }

  // Add WebSocket C2 findings
  if (websocketC2.hasWebSocketC2) {
    for (const f of websocketC2.findings) {
      findings.push({
        patternId: `WS_C2_${f.type.toUpperCase()}`,
        name: `WebSocket C2: ${f.type.replace(/_/g, ' ')}`,
        description: f.description,
        severity: f.severity,
        category: 'websocket_c2',
        line: f.line,
        column: f.column,
        match: f.match.substring(0, 100),
        context: f.context.substring(0, 200)
      });
    }
  }

  // Recalculate summary with all findings
  const updatedSummary = {
    total: findings.length,
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length
  };

  const updatedRiskScore = 
    updatedSummary.critical * SEVERITY_WEIGHTS.critical +
    updatedSummary.high * SEVERITY_WEIGHTS.high +
    updatedSummary.medium * SEVERITY_WEIGHTS.medium +
    updatedSummary.low * SEVERITY_WEIGHTS.low;

  let updatedRiskLevel: AnalysisResult['riskLevel'] = 'clean';
  if (updatedRiskScore >= RISK_THRESHOLDS.critical) updatedRiskLevel = 'critical';
  else if (updatedRiskScore >= RISK_THRESHOLDS.high) updatedRiskLevel = 'high';
  else if (updatedRiskScore >= RISK_THRESHOLDS.medium) updatedRiskLevel = 'medium';
  else if (updatedRiskScore >= RISK_THRESHOLDS.low) updatedRiskLevel = 'low';

  return {
    resourceHash: resourceHash || `0x${contentHash.substring(0, 64)}`,
    contentHash: `0x${contentHash}`,
    findings,
    riskScore: updatedRiskScore,
    riskLevel: updatedRiskLevel,
    summary: updatedSummary,
    analyzedAt: new Date().toISOString(),
    confidence,
    obfuscatedExfil,
    websocketC2
  };
}

/**
 * Calculate confidence score (0-1)
 */
function calculateConfidence(findings: Finding[], content: string): number {
  if (findings.length === 0) return 0.5; // Neutral if no findings

  let confidence = 0.7; // Base confidence

  // Higher confidence if multiple patterns match
  const uniquePatterns = new Set(findings.map(f => f.patternId));
  if (uniquePatterns.size >= 3) confidence += 0.15;
  if (uniquePatterns.size >= 5) confidence += 0.1;

  // Higher confidence for critical findings
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  if (criticalCount >= 2) confidence += 0.1;

  // Lower confidence for very short content (might be false positive)
  if (content.length < 100) confidence -= 0.2;

  // Lower confidence if findings are clustered (might be legitimate use)
  const lineNumbers = findings.map(f => f.line);
  const uniqueLines = new Set(lineNumbers);
  if (uniqueLines.size < findings.length * 0.3) confidence -= 0.1;

  return Math.max(0, Math.min(1, confidence));
}

/**
 * Check if URL is in safe domain list
 */
export function isSafeDomain(url: string): boolean {
  try {
    const parsed = new URL(url);
    return SAFE_DOMAINS.some(domain => 
      parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Format analysis result for display
 */
export function formatResult(result: AnalysisResult): string {
  const lines: string[] = [];
  
  lines.push(`\n${'='.repeat(60)}`);
  lines.push(`ISNAD Scanner Report`);
  lines.push(`${'='.repeat(60)}`);
  lines.push(`Resource Hash: ${result.resourceHash}`);
  lines.push(`Content Hash:  ${result.contentHash}`);
  lines.push(`Analyzed:      ${result.analyzedAt}`);
  lines.push(`${'─'.repeat(60)}`);
  
  const riskEmoji = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢',
    clean: '✅'
  };

  lines.push(`Risk Level:    ${riskEmoji[result.riskLevel]} ${result.riskLevel.toUpperCase()}`);
  lines.push(`Risk Score:    ${result.riskScore}`);
  lines.push(`Confidence:    ${(result.confidence * 100).toFixed(0)}%`);
  lines.push(`${'─'.repeat(60)}`);
  lines.push(`Findings:      ${result.summary.total} total`);
  if (result.summary.critical) lines.push(`  🔴 Critical:  ${result.summary.critical}`);
  if (result.summary.high) lines.push(`  🟠 High:      ${result.summary.high}`);
  if (result.summary.medium) lines.push(`  🟡 Medium:    ${result.summary.medium}`);
  if (result.summary.low) lines.push(`  🟢 Low:       ${result.summary.low}`);

  if (result.findings.length > 0) {
    lines.push(`\n${'─'.repeat(60)}`);
    lines.push(`Details:`);
    lines.push(`${'─'.repeat(60)}`);
    
    for (const finding of result.findings.slice(0, 10)) {
      const emoji = riskEmoji[finding.severity];
      lines.push(`\n${emoji} [${finding.patternId}] ${finding.name}`);
      lines.push(`   Line ${finding.line}: ${finding.context.substring(0, 80)}${finding.context.length > 80 ? '...' : ''}`);
      lines.push(`   ${finding.description}`);
    }

    if (result.findings.length > 10) {
      lines.push(`\n   ... and ${result.findings.length - 10} more findings`);
    }
  }

  lines.push(`\n${'='.repeat(60)}\n`);
  
  return lines.join('\n');
}
