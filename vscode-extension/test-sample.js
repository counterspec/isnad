// Test file for ISNAD scanner
// This file contains various security patterns to test detection

// CRITICAL: eval usage
const code = "console.log('test')";
eval(code);

// CRITICAL: child_process
const { exec } = require('child_process');
exec('ls -la');

// HIGH: Dynamic fetch
const url = process.env.API_URL;
fetch(url);

// HIGH: Webhook
fetch('https://discord.com/api/webhooks/123/abc');

// MEDIUM: Environment variable access
const apiKey = process.env.API_KEY;

// MEDIUM: Home directory access
const home = require('os').homedir();

// LOW: This should be clean
console.log('Hello world');
const data = JSON.stringify({ test: true });
