/**
 * Detection patterns for obfuscated credential exfiltration
 * Issue: #1 - Detect obfuscated credential exfiltration patterns
 * Reward: 1000 ISNAD
 */

export interface ObfuscationPattern {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium';
  pattern: RegExp;
  category: string;
}

// Patterns for detecting obfuscated credential exfiltration
export const OBFUSCATED_EXFIL_PATTERNS: ObfuscationPattern[] = [
  // Base64 encoded exfiltration URLs
  {
    id: 'OBF_EXFIL_BASE64_URL',
    name: 'Base64 Encoded URL in Fetch',
    description: 'Detects base64-encoded URLs being fetched, potential data exfiltration',
    severity: 'high',
    pattern: /fetch\s*\(\s*atob\s*\(/gi,
    category: 'base64_exfil'
  },
  {
    id: 'OBF_EXFIL_BASE64_BUFFER',
    name: 'Base64 Buffer to String to URL',
    description: 'Buffer.from(data).toString(base64) used in network calls',
    severity: 'high',
    pattern: /\.toString\s*\(\s*['"`]base64['"`]\s*\)[^;]*\.\s*test\s*\(/gi,
    category: 'base64_exfil'
  },
  
  // Hex encoded exfiltration
  {
    id: 'OBF_EXFIL_HEX_ENCODE',
    name: 'Hex Encoded Data Exfiltration',
    description: 'Data converted to hex and sent via network',
    severity: 'high',
    pattern: /(toString\s*\(\s*['"`]hex['"`]\s*\)|parseInt\s*\([^)]*\)\s*\.toString\s*\(\s*['"`]16['"`])/gi,
    category: 'hex_exfil'
  },
  
  // Character code construction (String.fromCharCode)
  {
    id: 'OBF_EXFIL_CHARCODES',
    name: 'String.fromCharCode URL Construction',
    description: 'URL built using String.fromCharCode to hide endpoints',
    severity: 'critical',
    pattern: /String\.fromCharCode\s*\(/gi,
    category: 'charcodes_exfil'
  },
  
  // Environment variable harvesting with obfuscation
  {
    id: 'OBF_EXFIL_ENV_MERGE',
    name: 'Obfuscated ENV Access + Network',
    description: 'Environment variables accessed and sent via network',
    severity: 'critical',
    pattern: /(process\.env|global|ENV)\s*\[.*?\]\s*[^;]*fetch|fetch\s*\([^;]*process\.env/gi,
    category: 'env_exfil'
  },
  
  // String concatenation obfuscation
  {
    id: 'OBF_EXFIL_CONCAT',
    name: 'String Concatenation for URLs',
    description: 'URLs built via string concatenation to hide endpoints',
    severity: 'high',
    pattern: /['"`][^'"`]*['"`]\s*\+\s*[^;]*(fetch|axios|http|request)/gi,
    category: 'concat_exfil'
  },
  
  // Template literals with ENV
  {
    id: 'OBF_EXFIL_TEMPLATE_ENV',
    name: 'Template Literal with ENV',
    description: 'Template literals containing environment variables used in network calls',
    severity: 'high',
    pattern: /`[^$]*\$\{[^}]*(process\.env|global\.env|ENV)[^}]*\}[^`]*`/gi,
    category: 'template_exfil'
  },
  
  // Array join for URL construction  
  {
    id: 'OBF_EXFIL_ARRAY_JOIN',
    name: 'Array Join URL Construction',
    description: 'URL built from array join, potential obfuscation',
    severity: 'medium',
    pattern: /\[[^\]]*\]\s*\.\s*join\s*\(\s*['"`][^'"`]*['"`]\s*\)[^;]*(fetch|axios|http)/gi,
    category: 'array_exfil'
  }
];

// Composite patterns for multi-signal detection
export const COMPOSITE_PATTERNS = [
  {
    id: 'OBF_EXFIL_COMPLEX',
    name: 'Complex Obfuscation Chain',
    description: 'Multiple obfuscation techniques chained together',
    severity: 'critical',
    // Matches: process.env[key] -> atob/Buffer -> fetch/send
    pattern: /process\.env\s*\[.*?\]\s*(\|\||\?|&&|\+|,)\s*.*?(atob|Buffer\.from|String\.fromCharCode).*?(fetch|axios|request|send|post)/gi
  }
];

export function detectObfuscatedExfiltration(code: string): {
  findings: Array<{pattern: string, severity: string, description: string}>;
  score: number;
} {
  const findings: Array<{pattern: string, severity: string, description: string}> = [];
  let score = 0;
  
  const severityWeights: Record<string, number> = {
    'critical': 10,
    'high': 5,
    'medium': 2
  };
  
  for (const pattern of OBFUSCATED_EXFIL_PATTERNS) {
    if (pattern.pattern.test(code)) {
      findings.push({
        pattern: pattern.id,
        severity: pattern.severity,
        description: pattern.description
      });
      score += severityWeights[pattern.severity] || 0;
    }
  }
  
  // Reset regex lastIndex
  OBFUSCATED_EXFIL_PATTERNS.forEach(p => p.pattern.lastIndex = 0);
  
  return { findings, score };
}
