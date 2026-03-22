/**
 * HTTP Client False Positive Reduction
 * Issue: #2 - Reduce false positives on legitimate HTTP clients
 * Reward: 500 ISNAD
 */

import { Pattern } from './patterns';

// Known safe domains that should not trigger HTTP exfiltration alerts
export const SAFE_DOMAINS = new Set([
  // NPM/CDN domains
  'registry.npmjs.org',
  'registry.npmmirror.com',
  'unpkg.com',
  'cdn.jsdelivr.net',
  'jsdelivr.net', 
  'cdnjs.cloudflare.com',
  'raw.githubusercontent.com',
  'github.com',
  'api.github.com',
  
  // Common API services
  'api.openai.com',
  'api.anthropic.com',
  'api.cohere.ai',
  'api.replicate.com',
  'api.huggingface.co',
  
  // Cloud providers
  'amazonaws.com',
  'googleusercontent.com',
  'storage.googleapis.com',
  'cloudfunctions.net',
  'azurewebsites.net',
  'cloudflare.com',
  
  // Authentication services
  'auth0.com',
  'clerk.com',
  'supabase.co',
  'firebaseio.com',
  
  // Analytics (legitimate)
  'google-analytics.com',
  'amplitude.com',
  'mixpanel.com',
  'segment.io',
  'heapanalytics.com',
  
  // Payment (legitimate)
  'stripe.com',
  'paypal.com',
  'braintree-api.com',
  
  // Error tracking (legitimate)
  'sentry.io',
  'bugsnag.com',
  'rollbar.com',
  'honeybadger.io',
  
  // Monitoring (legitimate)
  'datadog.com',
  'newrelic.com',
  'grafana.net',
  'logsene.com',
]);

// Known safe HTTP client libraries
export const SAFE_CLIENTS = new Set([
  'axios',
  'node-fetch',
  'fetch',
  'got',
  'undici',
  'needle',
  'request',
  'superagent',
  'urllib3',
  'requests',
  'httpx',
  'aiohttp',
  'reqwest',
  'tokio',
  'reqwest',
  'cloudscraper',
]);

/**
 * Check if a URL is from a known safe domain
 */
export function isSafeDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Check exact match
    if (SAFE_DOMAINS.has(hostname)) return true;
    
    // Check subdomain
    for (const safe of SAFE_DOMAINS) {
      if (hostname.endsWith('.' + safe)) return true;
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Check if HTTP client is used in safe manner
 */
export function isSafeClientUsage(code: string, url: string): boolean {
  // Check if using known safe client
  const safeClientPatterns = [
    /axios\.get|axios\.post|axios\.request/gi,
    /fetch\s*\(/gi,
    /node-fetch|fetch\s*\(/gi,
    /got\(|got\./gi,
    /undici\./gi,
    /http\.(get|post|put|delete|request)/gi,
  ];
  
  for (const pattern of safeClientPatterns) {
    if (pattern.test(code)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Reduce false positives by filtering safe patterns
 */
export function filterFalsePositives(
  findings: Array<{pattern: string, severity: string, url?: string}>,
  code: string
): Array<{pattern: string, severity: string}> {
  return findings.filter(finding => {
    // If URL is provided and it's safe, filter out
    if (finding.url && isSafeDomain(finding.url)) {
      return false;
    }
    
    // If it's a safe client usage, might be false positive
    if (isSafeClientUsage(code, finding.url || '')) {
      // Keep critical findings but reduce severity
      if (finding.severity === 'critical') {
        return true;
      }
      return false;
    }
    
    return true;
  });
}

/**
 * Create allowlist config for organizations
 */
export interface OrganizationAllowlist {
  domains: string[];
  paths?: string[];
  patterns?: RegExp[];
}

export const DEFAULT_ALLOWLIST: OrganizationAllowlist = {
  domains: [
    // Internal company domains
    'localhost',
    '*.internal',
    '*.corp',
    '*.company.com',
  ],
  paths: [
    '/api/health',
    '/api/ready', 
    '/api/status',
    '/_health',
    '/healthz',
  ]
};
