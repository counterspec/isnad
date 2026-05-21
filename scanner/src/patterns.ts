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

  // === OBFUSCATED EXFILTRATION: Credential theft with obfuscation (Issue #1) ===
  {
    id: 'OBFUSC_EXFIL_B64_URL',
    name: 'Base64-Encoded Exfiltration URL',
    description: 'URLs encoded in base64 to hide exfiltration endpoints from static analysis',
    severity: 'critical',
    pattern: /(?:atob|Buffer\.from|base64.*decode|decode.*base64)\s*\([^)]*(?:https?:|ftp:|wss?:)/gi,
    category: 'obfuscated_exfiltration'
  },
  {
    id: 'OBFUSC_EXFIL_HEX_ENDPOINT',
    name: 'Hex-Constructed API Endpoint',
    description: 'API endpoints built from hex strings to evade detection',
    severity: 'critical',
    pattern: /(?:0x[0-9a-fA-F]{2}[^,;\n]*){4,}(?:String\.fromCharCode|fromCharCode|parseInt|Number\.parseInt)/gi,
    category: 'obfuscated_exfiltration'
  },
  {
    id: 'OBFUSC_EXFIL_CHARCODE_URL',
    name: 'CharCode-Constructed URL',
    description: 'URLs constructed from character codes to hide exfiltration targets',
    severity: 'critical',
    pattern: /String\.fromCharCode\s*\([^)]*(?:\.toString\s*\(\s*16\s*\)|0x[0-9a-fA-F])/gi,
    category: 'obfuscated_exfiltration'
  },
  {
    id: 'OBFUSC_EXFIL_REVERSED',
    name: 'String Reversal Obfuscation',
    description: 'Strings reversed at runtime to hide exfiltration URLs or credentials',
    severity: 'high',
    pattern: /\.(split|reverse|join)\s*\(\s*(?:['"]|''|"")\s*\)\s*\.{0,2}(?:split|reverse|join)/gi,
    category: 'obfuscated_exfiltration'
  },
  {
    id: 'OBFUSC_EXFIL_CONCAT_URL',
    name: 'Concatenated URL Construction',
    description: 'URLs built from concatenated fragments to evade static string matching',
    severity: 'high',
    pattern: /['"]https?(:|\\x3a)['"]\s*\+\s*['"]/gi,
    category: 'obfuscated_exfiltration'
  },
  {
    id: 'OBFUSC_EXFIL_ENV_SEND',
    name: 'Environment Variable Harvesting with Obfuscated Transmission',
    description: 'Collecting env vars and transmitting via encoded/obfuscated channels',
    severity: 'critical',
    pattern: /process\.env\s*\[[^\]]*\][^;]{0,200}(?:atob|btoa|base64|encodeURI|fromCharCode|0x[0-9a-fA-F])/gi,
    category: 'obfuscated_exfiltration'
  },
  {
    id: 'OBFUSC_EXFIL_TEMPLATE_LITERAL',
    name: 'Template Literal URL Assembly',
    description: 'Template literals used to dynamically assemble exfiltration URLs',
    severity: 'high',
    pattern: /`https?:\/\/\$\{[^}]+\}[^`]*(?:fetch|axios|request|http\.get|http\.post|XMLHttpRequest)/gi,
    category: 'obfuscated_exfiltration'
  },
  {
    id: 'OBFUSC_EXFIL_DECODE_FETCH',
    name: 'Decoded Payload in Network Request',
    description: 'Decoding obfuscated data immediately before sending over network',
    severity: 'critical',
    pattern: /(?:atob|Buffer\.from[^)]+base64|decodeURIComponent|decodeURI|unescape)\([^)]*\)[^;]{0,100}(?:fetch|axios|request|http\.get|http\.post|\.send\s*\()/gi,
    category: 'obfuscated_exfiltration'
  },

  // === WEBSOCKET: Malicious WebSocket handler patterns (Issue #3) ===
  {
    id: 'WS_C2_CONNECTION',
    name: 'WebSocket C2 Connection',
    description: 'WebSocket connections used for command-and-control communication',
    severity: 'critical',
    pattern: /new\s+WebSocket\s*\(\s*['"`]wss?:\/\/[^'"`]+['"`]/gi,
    category: 'websocket_c2'
  },
  {
    id: 'WS_MESSAGE_HANDLER_EXFIL',
    name: 'WebSocket Message Handler Data Exfiltration',
    description: 'WebSocket onmessage handlers that process and forward received data',
    severity: 'high',
    pattern: /\.onmessage\s*=\s*(?:function|\([^)]*\)\s*=>|[^=])[^;]{0,200}(?:fetch|axios|http\.request|process\.env|fs\.(?:readFile|readdir))/gi,
    category: 'websocket_c2'
  },
  {
    id: 'WS_REVERSE_SHELL',
    name: 'WebSocket Reverse Shell',
    description: 'WebSocket handler executing system commands received from remote server',
    severity: 'critical',
    pattern: /(?:ws|WebSocket)\.on\s*\(\s*['"`]message['"`]\s*,[^;]{0,300}(?:exec|execSync|spawn|child_process|require\s*\(\s*['"`]child_process)/gi,
    category: 'websocket_c2'
  },
  {
    id: 'WS_DYNAMIC_URL',
    name: 'WebSocket Dynamic URL Connection',
    description: 'WebSocket connecting to dynamically constructed URLs (potential C2)',
    severity: 'high',
    pattern: /new\s+WebSocket\s*\(\s*[^'"`\s]/gi,
    category: 'websocket_c2'
  },
  {
    id: 'WS_DATA_EXFIL_CHANNEL',
    name: 'WebSocket Data Exfiltration Channel',
    description: 'Data collected and exfiltrated through an active WebSocket connection',
    severity: 'high',
    pattern: /\.(send|emit)\s*\([^)]{0,200}(?:process\.env|fs\.read|credential|password|token|secret)/gi,
    category: 'websocket_c2'
  },
  {
    id: 'WS_BINARY_PAYLOAD',
    name: 'WebSocket Binary Payload Transfer',
    description: 'Binary data sent or received via WebSocket (potential data tunnel)',
    severity: 'medium',
    pattern: /(?:ws|WebSocket)\.(?:on|addEventListener)\s*\(\s*['"`]message['"`]\s*,[^;]{0,200}(?:ArrayBuffer|Blob|Uint8Array|Buffer\.from)/gi,
    category: 'websocket_c2'
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

export const HTTP_CLIENT_PATTERNS = [
  /\baxios\b/gi,
  /\bfetch\s*\(/gi,
  /\bnode-fetch\b/gi,
  /\brequest\s*\(/gi,
  /\burllib3\b/gi,
  /\bgot\s*\(/gi,
  /\bsuperagent\b/gi,
  /\bneedle\b/gi,
];

export const LEGITIMATE_HTTP_CONTEXT = [
  /\b(?:jest|mocha|vitest|cypress)\b/gi,
  /(?:test|spec|mock|fixture)\.(?:js|ts|jsx|tsx)$/gi,
  /\b(?:should|expect|assert)\b/gi,
  /(?:\/test\/|\/tests\/|\/__tests__\/|\.test\.|\.spec\.)/gi,
  /(?:example|demo|sample|fixture)/gi,
];

export const KNOWN_SAFE_ENDPOINTS = [
  /api\.github\.com/gi,
  /registry\.npmjs\.org/gi,
  /pypi\.org/gi,
  /api\.openai\.com/gi,
  /api\.anthropic\.com/gi,
  /googleapis\.com/gi,
  /schemas\.microsoft\.com/gi,
  /schema\.org/gi,
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
