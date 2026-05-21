/**
 * Obfuscated Credential Exfiltration Detector (Issue #1)
 *
 * Detects patterns where malicious packages use encoding tricks
 * to hide credential theft from static analysis:
 * - Base64-encoded exfiltration URLs
 * - Hex/charcode-constructed API endpoints
 * - String reversal and concatenation obfuscation
 * - Environment variable harvesting with obfuscated transmission
 */

import { DANGEROUS_PATTERNS } from './patterns.js';
import type { Finding } from './analyzer.js';

export interface ObfuscatedExfilResult {
  hasObfuscatedExfil: boolean;
  findings: ObfuscatedExfilFinding[];
  severity: 'critical' | 'high' | 'medium' | 'low' | 'clean';
  confidence: number;
  totalPatterns: number;
  decodedSamples: DecodedSample[];
}

export interface ObfuscatedExfilFinding {
  type: 'base64_url' | 'hex_endpoint' | 'charcode_url' | 'string_reversal' | 'concat_url' | 'env_harvest' | 'template_literal' | 'decode_then_send';
  line: number;
  column: number;
  match: string;
  context: string;
  severity: 'critical' | 'high' | 'medium';
  decodedValue?: string;
  description: string;
}

export interface DecodedSample {
  original: string;
  decoded: string;
  method: 'base64' | 'hex' | 'charcode' | 'reverse' | 'concat';
  line: number;
}

function decodeBase64Strings(content: string): DecodedSample[] {
  const samples: DecodedSample[] = [];
  const b64Pattern = /(?:atob|Buffer\.from)\s*\(\s*['"`]([A-Za-z0-9+/=]{8,})['"`]/g;
  let match;
  while ((match = b64Pattern.exec(content)) !== null) {
    try {
      const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
      if (decoded.startsWith('http') || /password|secret|token|key|credential/i.test(decoded)) {
        const beforeMatch = content.substring(0, match.index);
        const line = beforeMatch.split('\n').length;
        samples.push({ original: match[0], decoded, method: 'base64', line });
      }
    } catch {}
  }
  return samples;
}

function decodeHexStrings(content: string): DecodedSample[] {
  const samples: DecodedSample[] = [];
  const hexPattern = /['"`]((?:\\x[0-9a-fA-F]{2})+)['"`]/g;
  let match;
  while ((match = hexPattern.exec(content)) !== null) {
    try {
      const hexStr = match[1];
      const decoded = hexStr.replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
      if (decoded.startsWith('http') || /password|secret|token|key|credential/i.test(decoded)) {
        const beforeMatch = content.substring(0, match.index);
        const line = beforeMatch.split('\n').length;
        samples.push({ original: match[0], decoded, method: 'hex', line });
      }
    } catch {}
  }
  return samples;
}

function decodeCharcodeStrings(content: string): DecodedSample[] {
  const samples: DecodedSample[] = [];
  const charcodePattern = /String\.fromCharCode\s*\(([^)]+)\)/g;
  let match;
  while ((match = charcodePattern.exec(content)) !== null) {
    try {
      const args = match[1].split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      if (args.length >= 8) {
        const decoded = String.fromCharCode(...args);
        if (decoded.startsWith('http') || /password|secret|token|key|credential/i.test(decoded)) {
          const beforeMatch = content.substring(0, match.index);
          const line = beforeMatch.split('\n').length;
          samples.push({ original: match[0], decoded, method: 'charcode', line });
        }
      }
    } catch {}
  }
  return samples;
}

function detectReversedStrings(content: string): DecodedSample[] {
  const samples: DecodedSample[] = [];
  const reversePattern = /['"`]([a-zA-Z0-9/.:_\-]{10,})['"`]\s*\.\s*split\s*\(\s*['"]['"]\s*\)\s*\.\s*reverse\s*\(\s*\)\s*\.\s*join\s*\(\s*['"]['"]\s*\)/g;
  let match;
  while ((match = reversePattern.exec(content)) !== null) {
    try {
      const decoded = match[1].split('').reverse().join('');
      if (decoded.startsWith('http') || /password|secret|token|key|credential/i.test(decoded)) {
        const beforeMatch = content.substring(0, match.index);
        const line = beforeMatch.split('\n').length;
        samples.push({ original: match[0], decoded, method: 'reverse', line });
      }
    } catch {}
  }
  return samples;
}

const EXFIL_PATTERNS: { id: string; regex: RegExp; type: ObfuscatedExfilFinding['type']; severity: ObfuscatedExfilFinding['severity']; description: string }[] = [
  {
    id: 'base64_url',
    regex: /atob\([^)]*\)|Buffer\.from\([^)]*base64[^)]*\)/gi,
    type: 'base64_url',
    severity: 'critical',
    description: 'Base64 decoding detected (potential exfiltration obfuscation)'
  },
  {
    id: 'hex_endpoint',
    regex: /(?:\\x[0-9a-fA-F]{2}){8,}/gi,
    type: 'hex_endpoint',
    severity: 'critical',
    description: 'Hex-encoded string detected (potential obfuscated endpoint)'
  },
  {
    id: 'charcode_url',
    regex: /String\.fromCharCode\s*\([^)]+\)/gi,
    type: 'charcode_url',
    severity: 'critical',
    description: 'CharCode string construction detected (potential obfuscation)'
  },
  {
    id: 'string_reversal',
    regex: /\.reverse\s*\(\s*\)\s*\.\s*join\s*\(/gi,
    type: 'string_reversal',
    severity: 'high',
    description: 'String reversal obfuscation detected'
  },
  {
    id: 'env_harvest',
    regex: /process\.env[\s\S]{0,300}?(?:atob|btoa|base64|encodeURI|fromCharCode|0x[0-9a-fA-F]{2}|\.reverse\s*\(\))/gi,
    type: 'env_harvest',
    severity: 'critical',
    description: 'Environment variable data with obfuscation (potential exfiltration)'
  },
  {
    id: 'concat_url',
    regex: /['"`]https?(:|\\x3a)['"`]\s*\+\s*['"`][^'"`]{3,}['"`]/gi,
    type: 'concat_url',
    severity: 'high',
    description: 'URL assembled from string concatenation to evade detection'
  },
  {
    id: 'template_literal',
    regex: /`https?:\/\/\$\{[^}]+\}[^`]*`/gi,
    type: 'template_literal',
    severity: 'high',
    description: 'Template literal used to dynamically construct URL'
  },
  {
    id: 'decode_then_send',
    regex: /(?:atob|btoa|Buffer\.from[^)]*\)|decodeURIComponent|unescape)\s*\([^)]*\)/gi,
    type: 'decode_then_send',
    severity: 'critical',
    description: 'Decoding function call detected (potential exfiltration preparation)'
  }
];

export function detectObfuscatedExfiltration(content: string): ObfuscatedExfilResult {
  const findings: ObfuscatedExfilFinding[] = [];
  const decodedSamples: DecodedSample[] = [];

  for (const pattern of EXFIL_PATTERNS) {
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    let match;
    while ((match = regex.exec(content)) !== null) {
      const beforeMatch = content.substring(0, match.index);
      const line = beforeMatch.split('\n').length;
      const lines = content.split('\n');
      const contextLine = lines[line - 1] || '';
      const lastNewline = beforeMatch.lastIndexOf('\n');
      const column = match.index - lastNewline;

      findings.push({
        type: pattern.type,
        line,
        column,
        match: match[0].substring(0, 150),
        context: contextLine.trim().substring(0, 200),
        severity: pattern.severity,
        description: pattern.description
      });
    }
  }

  decodedSamples.push(...decodeBase64Strings(content));
  decodedSamples.push(...decodeHexStrings(content));
  decodedSamples.push(...decodeCharcodeStrings(content));
  decodedSamples.push(...detectReversedStrings(content));

  let severity: ObfuscatedExfilResult['severity'] = 'clean';
  if (findings.some(f => f.severity === 'critical')) severity = 'critical';
  else if (findings.some(f => f.severity === 'high')) severity = 'high';
  else if (findings.some(f => f.severity === 'medium')) severity = 'medium';

  let confidence = 0.5;
  if (findings.length >= 3) confidence = 0.9;
  else if (findings.length >= 2) confidence = 0.8;
  else if (findings.length >= 1) confidence = 0.7;
  if (decodedSamples.length > 0) confidence = Math.min(1, confidence + 0.1);

  return {
    hasObfuscatedExfil: findings.length > 0,
    findings,
    severity,
    confidence,
    totalPatterns: findings.length,
    decodedSamples
  };
}