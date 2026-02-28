import * as vscode from 'vscode';
import * as path from 'path';

/**
 * ISNAD False Positive Reducer
 * Reduces false positives on legitimate HTTP clients
 * Bounty: 500 ISNAD
 */

interface LegitimateClientPattern {
  name: string;
  patterns: RegExp[];
  description: string;
}

// Whitelist of known legitimate HTTP clients
const LEGITIMATE_CLIENTS: LegitimateClientPattern[] = [
  {
    name: 'Axios',
    patterns: [
      /axios\s*\(\s*\{/,
      /axios\.(get|post|put|delete|patch)\s*\(/,
      /from\s+['"]axios['"]/
    ],
    description: 'Popular HTTP client library'
  },
  {
    name: 'Fetch API',
    patterns: [
      /fetch\s*\(\s*['"`]/,
      /fetch\s*\(\s*url\s*\)/
    ],
    description: 'Native browser fetch API'
  },
  {
    name: 'Node.js HTTP/HTTPS',
    patterns: [
      /require\s*\(\s*['"]https?['"]\s*\)/,
      /https?\.(get|request)\s*\(/,
      /createServer\s*\(/
    ],
    description: 'Node.js built-in HTTP module'
  },
  {
    name: 'Request',
    patterns: [
      /require\s*\(\s*['"]request['"]\s*\)/,
      /request\s*\(\s*\{/
    ],
    description: 'Legacy request library'
  },
  {
    name: 'Got',
    patterns: [
      /require\s*\(\s*['"]got['"]\s*\)/,
      /got\s*\(\s*['"`]/
    ],
    description: 'Modern HTTP request library'
  },
  {
    name: 'SuperAgent',
    patterns: [
      /require\s*\(\s*['"]superagent['"]\s*\)/,
      /superagent\.(get|post|put|delete)/
    ],
    description: 'Progressive HTTP client'
  },
  {
    name: 'Python Requests',
    patterns: [
      /import\s+requests/,
      /requests\.(get|post|put|delete|patch)\s*\(/,
      /Session\s*\(\s*\)/
    ],
    description: 'Python HTTP library'
  },
  {
    name: 'Python urllib',
    patterns: [
      /import\s+urllib/,
      /urllib\.(request|urlopen)/,
      /http\.client/
    ],
    description: 'Python built-in HTTP'
  },
  {
    name: 'cURL',
    patterns: [
      /curl\s+/,
      /exec\s*\(\s*['"`]curl/
    ],
    description: 'Command line HTTP tool'
  },
  {
    name: 'HTTPX',
    patterns: [
      /import\s+httpx/,
      /httpx\.(get|post|put|delete|patch|AsyncClient)/
    ],
    description: 'Modern Python HTTP client'
  }
];

// Patterns that indicate legitimate API usage
const LEGITIMATE_USAGE_PATTERNS = [
  // Environment variable usage for URLs
  /process\.env\.[A-Z_]+/,
  /os\.getenv\s*\(\s*['"]/,
  
  // Configuration files
  /config\.(json|ya?ml)/,
  /\.env/,
  
  // API endpoint definitions
  /api\/(v\d+\/)?\w+/,
  /\/api\//,
  
  // Error handling
  /catch\s*\(/,
  /try\s*\{/,
  /\.catch\s*\(/,
  
  // Timeout settings (legitimate)
  /timeout\s*:\s*\d+/,
  /setTimeout\s*\(/,
  
  // Authentication headers (legitimate patterns)
  /Authorization\s*:\s*['"]Bearer/,
  /Authorization\s*:\s*['"]Basic/,
  /api[_-]?key/i,
  /auth[_-]?token/i
];

// Suspicious patterns that override legitimate detection
const SUSPICIOUS_PATTERNS = [
  // Dynamic URL construction with user input
  /url\s*=\s*.*\+\s*req\.(body|query|params)/,
  /url\s*=\s*.*\+\s*process\.argv/,
  
  // No error handling
  /fetch\s*\([^)]+\)(?!\s*\.catch)/,
  
  // Suspicious headers
  /headers\s*:\s*\{[^}]*['"]X-Forwarded-/,
  
  // Data exfiltration patterns
  /post\s*\([^)]*\{[^}]*password/i,
  /send\s*\([^)]*process\.env/
];

/**
 * Check if code contains legitimate HTTP client usage
 */
export function checkLegitimateClient(code: string): {
  isLegitimate: boolean;
  confidence: number;
  matchedClients: string[];
  reasons: string[];
} {
  const matchedClients: string[] = [];
  const reasons: string[] = [];
  let confidence = 0;

  // Check for known legitimate clients
  for (const client of LEGITIMATE_CLIENTS) {
    for (const pattern of client.patterns) {
      if (pattern.test(code)) {
        matchedClients.push(client.name);
        reasons.push(`Found ${client.name}: ${client.description}`);
        confidence += 15;
        break;
      }
    }
  }

  // Check for legitimate usage patterns
  for (const pattern of LEGITIMATE_USAGE_PATTERNS) {
    if (pattern.test(code)) {
      confidence += 5;
    }
  }

  // Check for suspicious patterns that reduce confidence
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(code)) {
      confidence -= 20;
      reasons.push('Suspicious pattern detected: possible data exfiltration');
    }
  }

  // Cap confidence at 100
  confidence = Math.min(100, Math.max(0, confidence));

  // Determine if legitimate based on confidence threshold
  const isLegitimate = confidence >= 60 && matchedClients.length > 0;

  return {
    isLegitimate,
    confidence,
    matchedClients: [...new Set(matchedClients)],
    reasons
  };
}

/**
 * Analyze file for false positives
 */
export function analyzeFile(
  filePath: string,
  content: string
): {
  file: string;
  isLegitimate: boolean;
  confidence: number;
  matchedClients: string[];
  recommendations: string[];
} {
  const result = checkLegitimateClient(content);
  const recommendations: string[] = [];

  if (result.isLegitimate) {
    recommendations.push(
      `✅ This file appears to use legitimate HTTP clients: ${result.matchedClients.join(', ')}`,
      `Confidence: ${result.confidence}%`
    );

    // Add specific recommendations based on matched clients
    if (result.matchedClients.includes('Axios')) {
      recommendations.push('Tip: Consider adding axios interceptors for better error handling');
    }
    if (result.matchedClients.includes('Python Requests')) {
      recommendations.push('Tip: Use requests.Session() for connection pooling');
    }
  } else {
    recommendations.push(
      `⚠️ Low confidence (${result.confidence}%) that this is a legitimate HTTP client`,
      'Review manually for potential security issues'
    );
  }

  return {
    file: filePath,
    isLegitimate: result.isLegitimate,
    confidence: result.confidence,
    matchedClients: result.matchedClients,
    recommendations
  };
}

/**
 * Batch analyze workspace
 */
export async function analyzeWorkspace(): Promise<{
  total: number;
  legitimate: number;
  suspicious: number;
  results: ReturnType<typeof analyzeFile>[];
}> {
  const files = await vscode.workspace.findFiles(
    '**/*.{js,ts,py}',
    '**/node_modules/**'
  );

  const results: ReturnType<typeof analyzeFile>[] = [];
  let legitimate = 0;
  let suspicious = 0;

  for (const file of files) {
    try {
      const document = await vscode.workspace.openTextDocument(file);
      const content = document.getText();
      const result = analyzeFile(file.fsPath, content);
      results.push(result);

      if (result.isLegitimate) {
        legitimate++;
      } else {
        suspicious++;
      }
    } catch (e) {
      console.error(`Failed to analyze ${file}:`, e);
    }
  }

  return {
    total: files.length,
    legitimate,
    suspicious,
    results
  };
}

/**
 * Register false positive reducer
 */
export function registerFalsePositiveReducer(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('isnad.reduceFalsePositives', async () => {
      const output = vscode.window.createOutputChannel('ISNAD False Positive Reducer');
      output.show();

      output.appendLine('🔍 Analyzing workspace for false positives...\n');

      const analysis = await analyzeWorkspace();

      output.appendLine(`📊 Analysis Complete:`);
      output.appendLine(`   Total files: ${analysis.total}`);
      output.appendLine(`   ✅ Legitimate: ${analysis.legitimate}`);
      output.appendLine(`   ⚠️  Suspicious: ${analysis.suspicious}`);
      output.appendLine(`   False positive rate: ${((analysis.legitimate / analysis.total) * 100).toFixed(1)}%\n`);

      output.appendLine('📋 Detailed Results:');
      for (const result of analysis.results) {
        const icon = result.isLegitimate ? '✅' : '⚠️';
        output.appendLine(`\n${icon} ${path.basename(result.file)}`);
        output.appendLine(`   Confidence: ${result.confidence}%`);
        if (result.matchedClients.length > 0) {
          output.appendLine(`   Clients: ${result.matchedClients.join(', ')}`);
        }
        for (const rec of result.recommendations) {
          output.appendLine(`   ${rec}`);
        }
      }

      vscode.window.showInformationMessage(
        `ISNAD: Analyzed ${analysis.total} files, ${analysis.legitimate} legitimate, ${analysis.suspicious} suspicious`
      );
    })
  );
}
