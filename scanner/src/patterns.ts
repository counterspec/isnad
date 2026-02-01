/**
 * Security patterns for detecting malicious code in AI resources
 */

export interface Pattern {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  pattern: RegExp;
  category: string;
}

export const DANGEROUS_PATTERNS: Pattern[] = [
  // === CRITICAL: Direct code execution ===
  {
    id: 'EXEC_EVAL',
    name: 'Dynamic Code Execution',
    description: 'eval() or Function() constructor can execute arbitrary code',
    severity: 'critical',
    pattern: /\b(eval|Function)\s*\(/gi,
    category: 'code_execution'
  },
  {
    id: 'EXEC_SHELL',
    name: 'Shell Command Execution',
    description: 'Direct shell command execution',
    severity: 'critical',
    pattern: /\b(exec|execSync|spawn|spawnSync|execFile|execFileSync)\s*\(/gi,
    category: 'code_execution'
  },
  {
    id: 'EXEC_CHILD_PROCESS',
    name: 'Child Process Import',
    description: 'Imports child_process module for shell access',
    severity: 'critical',
    pattern: /require\s*\(\s*['"`]child_process['"`]\s*\)|from\s+['"`]child_process['"`]/gi,
    category: 'code_execution'
  },
  {
    id: 'EXEC_VM',
    name: 'VM Module Usage',
    description: 'Node.js VM module can execute arbitrary code',
    severity: 'critical',
    pattern: /require\s*\(\s*['"`]vm['"`]\s*\)|from\s+['"`]vm['"`]/gi,
    category: 'code_execution'
  },

  // === HIGH: Data exfiltration ===
  {
    id: 'EXFIL_FETCH_DYNAMIC',
    name: 'Dynamic URL Fetch',
    description: 'Fetching from dynamically constructed URLs',
    severity: 'high',
    pattern: /fetch\s*\(\s*[^'"`\s]/gi,
    category: 'exfiltration'
  },
  {
    id: 'EXFIL_WEBHOOK',
    name: 'Webhook/External POST',
    description: 'Sending data to external webhooks',
    severity: 'high',
    pattern: /(discord\.com\/api\/webhooks|hooks\.slack\.com|webhook\.|ngrok\.io|requestbin|pipedream)/gi,
    category: 'exfiltration'
  },
  {
    id: 'EXFIL_BASE64_SEND',
    name: 'Base64 Encoded Data Send',
    description: 'Encoding and sending data (potential exfil)',
    severity: 'high',
    pattern: /btoa\s*\(|Buffer\.from\(.*\)\.toString\s*\(\s*['"`]base64['"`]\s*\)/gi,
    category: 'exfiltration'
  },

  // === HIGH: Credential access ===
  {
    id: 'CRED_ENV_ACCESS',
    name: 'Environment Variable Access',
    description: 'Accessing environment variables (may contain secrets)',
    severity: 'medium',
    pattern: /process\.env\[|process\.env\./gi,
    category: 'credential_access'
  },
  {
    id: 'CRED_FILE_READ',
    name: 'Sensitive File Read',
    description: 'Reading potentially sensitive files',
    severity: 'high',
    pattern: /(\.env|\.ssh|\.aws|credentials|\.netrc|\.npmrc|\.pypirc|id_rsa|id_ed25519)/gi,
    category: 'credential_access'
  },
  {
    id: 'CRED_KEYCHAIN',
    name: 'Keychain/Credential Store Access',
    description: 'Accessing system credential stores',
    severity: 'critical',
    pattern: /(keychain|keytar|credential-store|secret-service|libsecret)/gi,
    category: 'credential_access'
  },

  // === HIGH: File system abuse ===
  {
    id: 'FS_WRITE_SYSTEM',
    name: 'System Directory Write',
    description: 'Writing to system directories',
    severity: 'critical',
    pattern: /writeFile.*(['"`]\/etc\/|['"`]\/usr\/|['"`]\/bin\/|['"`]\/System\/|['"`]C:\\Windows)/gi,
    category: 'filesystem'
  },
  {
    id: 'FS_READ_RECURSIVE',
    name: 'Recursive Directory Read',
    description: 'Reading directories recursively (data harvesting)',
    severity: 'medium',
    pattern: /(readdirSync|readdir).*recursive|glob\s*\(|fast-glob|globby/gi,
    category: 'filesystem'
  },
  {
    id: 'FS_HOME_ACCESS',
    name: 'Home Directory Access',
    description: 'Accessing user home directory',
    severity: 'medium',
    pattern: /process\.env\.HOME|os\.homedir\(\)|~\//gi,
    category: 'filesystem'
  },

  // === MEDIUM: Network ===
  {
    id: 'NET_RAW_SOCKET',
    name: 'Raw Socket Access',
    description: 'Low-level network socket access',
    severity: 'high',
    pattern: /require\s*\(\s*['"`]net['"`]\s*\)|require\s*\(\s*['"`]dgram['"`]\s*\)/gi,
    category: 'network'
  },
  {
    id: 'NET_DNS_EXFIL',
    name: 'DNS-based Exfiltration',
    description: 'Using DNS for data exfiltration',
    severity: 'high',
    pattern: /dns\.resolve|dns\.lookup.*[+`$]/gi,
    category: 'network'
  },

  // === MEDIUM: Obfuscation ===
  {
    id: 'OBFUSC_HEX_STRING',
    name: 'Hex-encoded Strings',
    description: 'Suspicious hex-encoded content',
    severity: 'medium',
    pattern: /\\x[0-9a-fA-F]{2}(\\x[0-9a-fA-F]{2}){10,}/g,
    category: 'obfuscation'
  },
  {
    id: 'OBFUSC_CHAR_CODE',
    name: 'CharCode Obfuscation',
    description: 'Building strings from character codes',
    severity: 'medium',
    pattern: /String\.fromCharCode\s*\([^)]{20,}\)/gi,
    category: 'obfuscation'
  },
  {
    id: 'OBFUSC_UNICODE',
    name: 'Unicode Escape Obfuscation',
    description: 'Heavy use of unicode escapes',
    severity: 'low',
    pattern: /\\u[0-9a-fA-F]{4}(\\u[0-9a-fA-F]{4}){5,}/g,
    category: 'obfuscation'
  },

  // === LOW: Suspicious but context-dependent ===
  {
    id: 'SUSP_CRYPTO_MINING',
    name: 'Cryptocurrency Mining',
    description: 'Potential crypto mining code',
    severity: 'high',
    pattern: /(coinhive|cryptonight|stratum\+tcp|xmrig|minero)/gi,
    category: 'abuse'
  },
  {
    id: 'SUSP_DISABLE_SECURITY',
    name: 'Security Bypass',
    description: 'Attempting to disable security features',
    severity: 'high',
    pattern: /(NODE_TLS_REJECT_UNAUTHORIZED|rejectUnauthorized\s*:\s*false)/gi,
    category: 'security_bypass'
  }
];

/**
 * Allowlisted patterns that reduce severity
 */
export const ALLOWLIST_PATTERNS = [
  // Common legitimate uses
  /console\.(log|error|warn|info)/gi,
  /JSON\.(parse|stringify)/gi,
  /Math\.(random|floor|ceil)/gi,
];

/**
 * Known safe domains for network calls
 */
export const SAFE_DOMAINS = [
  'api.openai.com',
  'api.anthropic.com',
  'api.cohere.ai',
  'generativelanguage.googleapis.com',
  'api.github.com',
  'registry.npmjs.org',
  'pypi.org',
];
