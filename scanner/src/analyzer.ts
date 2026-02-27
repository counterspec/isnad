/**
 * ISNAD Scanner - Static Analysis Engine
 */

import { DANGEROUS_PATTERNS, ALLOWLIST_PATTERNS, SAFE_DOMAINS } from './patterns.js';
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

const OBFUSCATED_ENV_SIGNAL_IDS = new Set([
  'EXFIL_BASE64_SEND',
  'EXFIL_BASE64_URL_DECODE',
  'EXFIL_HEX_URL_LITERAL',
  'EXFIL_CHARCODE_URL',
  'OBFUSC_HEX_STRING',
  'OBFUSC_CHAR_CODE',
  'OBFUSC_REVERSED_STRING',
  'OBFUSC_URL_CONCAT'
]);

const ENV_HARVEST_PATTERNS = [
  /process\.env\b/i,
  /os\.environ\b/i,
  /os\.getenv\s*\(/i,
  /System\.getenv\s*\(/i
];

const NETWORK_TRANSMIT_PATTERN =
  /\b(fetch\s*\(|axios\.(get|post|put|patch|delete)|requests\.(get|post|put|patch|delete)|urllib3\.[A-Za-z_]+\.request|https?\.request\s*\()/i;

const OBFUSCATION_HINT_PATTERN =
  /(base64\.b64encode|Buffer\.from\(.*base64|atob\s*\(|\\x[0-9a-fA-F]{2}|String\.fromCharCode|\.split\(\s*['"`]['"`]\s*\)\.reverse\(\)\.join\(\s*['"`]['"`]\s*\)|\[\s*::\s*-1\s*\])/i;

function isAllowlistedLine(contextLine: string): boolean {
  return ALLOWLIST_PATTERNS.some(allowPattern => {
    const flags = allowPattern.flags.replaceAll('g', '');
    return new RegExp(allowPattern.source, flags).test(contextLine);
  });
}

function addObfuscatedEnvTransmissionFinding(content: string, lines: string[], findings: Finding[]): void {
  const hasEnvHarvest = ENV_HARVEST_PATTERNS.some(pattern => pattern.test(content));
  if (!hasEnvHarvest) {
    return;
  }

  const hasNetworkTransmit = NETWORK_TRANSMIT_PATTERN.test(content);
  if (!hasNetworkTransmit) {
    return;
  }

  const hasObfuscatedSignal =
    findings.some(finding => OBFUSCATED_ENV_SIGNAL_IDS.has(finding.patternId)) ||
    OBFUSCATION_HINT_PATTERN.test(content);

  if (!hasObfuscatedSignal) {
    return;
  }

  if (findings.some(finding => finding.patternId === 'EXFIL_ENV_OBFUSCATED_TRANSMISSION')) {
    return;
  }

  const line = findFirstLine(lines, ENV_HARVEST_PATTERNS);
  const context = lines[line - 1] || '';

  findings.push({
    patternId: 'EXFIL_ENV_OBFUSCATED_TRANSMISSION',
    name: 'Environment Harvest + Obfuscated Transmission',
    description: 'Environment variable harvesting combined with obfuscated network transmission',
    severity: 'critical',
    category: 'exfiltration',
    line,
    column: 1,
    match: 'env_harvest_obfuscated_transmission',
    context: context.trim().substring(0, 200)
  });
}

function findFirstLine(lines: string[], patterns: RegExp[]): number {
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (patterns.some(pattern => pattern.test(line))) {
      return index + 1;
    }
  }
  return 1;
}

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
      const isAllowlisted = isAllowlistedLine(contextLine);

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

  addObfuscatedEnvTransmissionFinding(content, lines, findings);

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

  return {
    resourceHash: resourceHash || `0x${contentHash.substring(0, 64)}`,
    contentHash: `0x${contentHash}`,
    findings,
    riskScore,
    riskLevel,
    summary,
    analyzedAt: new Date().toISOString(),
    confidence
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
