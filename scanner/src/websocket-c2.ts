/**
 * WebSocket C2 Detection Module (Issue #3)
 *
 * Detects malicious WebSocket handler patterns in packages:
 * - WebSocket connections to suspicious endpoints
 * - Data exfiltration over WebSocket channels
 * - Reverse shell patterns via WebSocket
 * - Binary payload transfer channels
 */

import type { Finding } from './analyzer.js';

export interface WebSocketC2Result {
  hasWebSocketC2: boolean;
  findings: WebSocketC2Finding[];
  severity: 'critical' | 'high' | 'medium' | 'low' | 'clean';
  confidence: number;
  totalPatterns: number;
  connections: WebSocketConnection[];
}

export interface WebSocketC2Finding {
  type: 'c2_connection' | 'message_handler_exfil' | 'reverse_shell' | 'dynamic_url' | 'data_exfil_channel' | 'binary_payload';
  line: number;
  column: number;
  match: string;
  context: string;
  severity: 'critical' | 'high' | 'medium';
  description: string;
}

export interface WebSocketConnection {
  url: string;
  line: number;
  isDynamic: boolean;
  isSecure: boolean;
  suspiciousIndicators: string[];
}

function isSuspiciousUrl(url: string): { suspicious: boolean; indicators: string[] } {
  const indicators: string[] = [];
  
  const suspiciousPatterns = [
    { pattern: /ngrok\.io/i, indicator: 'ngrok tunnel' },
    { pattern: /serveo\.net/i, indicator: 'serveo tunnel' },
    { pattern: /localtunnel\.me/i, indicator: 'localtunnel' },
    { pattern: /mqtt/i, indicator: 'MQTT protocol' },
    { pattern: /\.onion/i, indicator: 'Tor onion service' },
    { pattern: /paste\./i, indicator: 'paste service' },
    { pattern: /discord\.com\/api\/webhooks/i, indicator: 'Discord webhook' },
    { pattern: /hooks\.slack\.com/i, indicator: 'Slack webhook' },
    { pattern: /pipedream/i, indicator: 'Pipedream endpoint' },
    { pattern: /requestbin/i, indicator: 'Requestbin endpoint' },
    { pattern: /webhook\.site/i, indicator: 'webhook.site' },
    { pattern: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i, indicator: 'raw IP address' },
    { pattern: /:(\d{4,5})\//i, indicator: 'high port number' },
  ];

  for (const { pattern, indicator } of suspiciousPatterns) {
    if (pattern.test(url)) {
      indicators.push(indicator);
    }
  }

  return { suspicious: indicators.length > 0, indicators };
}

const WS_PATTERNS: { id: string; regex: RegExp; type: WebSocketC2Finding['type']; severity: WebSocketC2Finding['severity']; description: string }[] = [
  {
    id: 'c2_connection',
    regex: /new\s+WebSocket\s*\(\s*['"`](wss?:\/\/[^'"`]+)['"`]/gi,
    type: 'c2_connection',
    severity: 'critical',
    description: 'WebSocket connection to hardcoded URL (potential C2)'
  },
  {
    id: 'message_handler_exfil',
    regex: /(?:ws|WebSocket|socket)\.(?:on\s*\(\s*['"`]message['"`]|onmessage)\s*[^}]{0,500}(?:fetch|axios|http\.request|process\.env|fs\.(?:readFile|readdir))/gi,
    type: 'message_handler_exfil',
    severity: 'high',
    description: 'WebSocket message handler accessing sensitive data or network functions'
  },
  {
    id: 'reverse_shell',
    regex: /(?:ws|WebSocket)[^;]{0,300}(?:onmessage|on\s*\(\s*['"`]message['"`])[^}]{0,300}(?:exec|execSync|spawn|child_process|require\s*\(\s*['"`]child_process)/gi,
    type: 'reverse_shell',
    severity: 'critical',
    description: 'WebSocket handler executing system commands (reverse shell pattern)'
  },
  {
    id: 'dynamic_url',
    regex: /new\s+WebSocket\s*\(\s*[^'"`\s\)]/gi,
    type: 'dynamic_url',
    severity: 'high',
    description: 'WebSocket connecting to dynamically constructed URL'
  },
  {
    id: 'data_exfil_channel',
    regex: /(?:ws|socket|connection)\.(send|emit)\s*\([^)]{0,300}(?:process\.env|fs\.read|credential|password|token|secret|\.env)/gi,
    type: 'data_exfil_channel',
    severity: 'high',
    description: 'Sensitive data sent over WebSocket connection'
  },
  {
    id: 'binary_payload',
    regex: /(?:ws|WebSocket)\.(?:on|addEventListener)\s*\(\s*['"`]message['"`][^}]{0,300}(?:ArrayBuffer|Blob|Uint8Array|Buffer\.from|binaryType)/gi,
    type: 'binary_payload',
    severity: 'medium',
    description: 'Binary data handling in WebSocket message handler'
  }
];

export function detectWebSocketC2(content: string): WebSocketC2Result {
  const findings: WebSocketC2Finding[] = [];
  const connections: WebSocketConnection[] = [];
  const lines = content.split('\n');

  for (const pattern of WS_PATTERNS) {
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    let match;
    while ((match = regex.exec(content)) !== null) {
      const beforeMatch = content.substring(0, match.index);
      const line = beforeMatch.split('\n').length;
      const lastNewline = beforeMatch.lastIndexOf('\n');
      const column = match.index - lastNewline;
      const contextLine = lines[line - 1] || '';

      findings.push({
        type: pattern.type,
        line,
        column,
        match: match[0].substring(0, 200),
        context: contextLine.trim().substring(0, 200),
        severity: pattern.severity,
        description: pattern.description
      });

      if (pattern.type === 'c2_connection' && match[1]) {
        const url = match[1];
        const { suspicious, indicators } = isSuspiciousUrl(url);
        connections.push({
          url,
          line,
          isDynamic: false,
          isSecure: url.startsWith('wss://'),
          suspiciousIndicators: suspicious ? indicators : []
        });
      }
    }
  }

  const dynamicWsPattern = /new\s+WebSocket\s*\(\s*([^'"`\s\)]+)/gi;
  let dynMatch;
  while ((dynMatch = dynamicWsPattern.exec(content)) !== null) {
    const beforeMatch = content.substring(0, dynMatch.index);
    const line = beforeMatch.split('\n').length;
    const alreadyFound = connections.some(c => c.line === line && c.isDynamic);
    if (!alreadyFound) {
      connections.push({
        url: dynMatch[1],
        line,
        isDynamic: true,
        isSecure: false,
        suspiciousIndicators: ['dynamically_constructed']
      });
    }
  }

  let severity: WebSocketC2Result['severity'] = 'clean';
  if (findings.some(f => f.severity === 'critical')) severity = 'critical';
  else if (findings.some(f => f.severity === 'high')) severity = 'high';
  else if (findings.some(f => f.severity === 'medium')) severity = 'medium';

  let confidence = 0.5;
  if (findings.some(f => f.type === 'reverse_shell')) confidence = 0.95;
  else if (findings.some(f => f.type === 'c2_connection') && connections.some(c => c.suspiciousIndicators.length > 0)) confidence = 0.9;
  else if (findings.some(f => f.type === 'data_exfil_channel')) confidence = 0.85;
  else if (findings.some(f => f.type === 'message_handler_exfil')) confidence = 0.75;
  else if (findings.length >= 3) confidence = 0.8;
  else if (findings.length >= 1) confidence = 0.7;

  const hasReverseShell = findings.some(f => f.type === 'reverse_shell');
  const hasExfil = findings.some(f => f.type === 'data_exfil_channel' || f.type === 'message_handler_exfil');
  if (connections.some(c => c.suspiciousIndicators.length > 0) && (hasReverseShell || hasExfil)) {
    confidence = 0.95;
  }

  return {
    hasWebSocketC2: findings.length > 0,
    findings,
    severity,
    confidence,
    totalPatterns: findings.length,
    connections
  };
}