/**
 * ISNAD Scanner - Main exports
 */

export { analyzeContent, formatResult, type AnalysisResult, type Finding } from './analyzer.js';
export { DANGEROUS_PATTERNS, SAFE_DOMAINS, ALLOWLIST_PATTERNS, HTTP_CLIENT_PATTERNS, LEGITIMATE_HTTP_CONTEXT, KNOWN_SAFE_ENDPOINTS, type Pattern } from './patterns.js';
export { detectObfuscatedExfiltration, type ObfuscatedExfilResult } from './obfuscated-exfil.js';
export { detectWebSocketC2, type WebSocketC2Result } from './websocket-c2.js';
export { 
  submitFlag, 
  checkBalance, 
  createEvidencePackage, 
  hashEvidence,
  type OracleConfig,
  type FlagSubmission 
} from './oracle.js';
