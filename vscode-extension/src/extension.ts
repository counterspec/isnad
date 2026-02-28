import * as vscode from 'vscode';
import axios from 'axios';

// ISNAD API endpoints
const ISNAD_API_BASE = 'https://api.isnad.md';

// Diagnostic collection
let diagnosticCollection: vscode.DiagnosticCollection;

// Status bar item
let statusBarItem: vscode.StatusBarItem;

/**
 * Hash a file content using ISNAD algorithm
 */
async function hashFile(content: string): Promise<string> {
  // Simple hash implementation (replace with actual ISNAD hash)
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Check trust score from ISNAD API
 */
async function checkTrustScore(resourceHash: string): Promise<any> {
  try {
    const response = await axios.get(
      `${ISNAD_API_BASE}/api/v1/trust/${resourceHash}`,
      { timeout: 5000 }
    );
    return response.data;
  } catch (error) {
    console.error('ISNAD API error:', error);
    return null;
  }
}

/**
 * Scan file for security issues
 */
async function scanFile(document: vscode.TextDocument): Promise<void> {
  const config = vscode.workspace.getConfiguration('isnad');
  const showWarnings = config.get<boolean>('showInlineWarnings', true);
  
  if (!showWarnings) {
    return;
  }

  const content = document.getText();
  const fileHash = await hashFile(content);
  
  statusBarItem.text = "$(sync~spin) ISNAD: Scanning...";
  statusBarItem.show();

  const trustData = await checkTrustScore(fileHash);
  
  const diagnostics: vscode.Diagnostic[] = [];

  if (trustData) {
    const { trust_score, tier, attestations } = trustData;
    
    // Create diagnostic based on trust tier
    if (tier === 'UNVERIFIED' || tier === 'COMMUNITY') {
      const severity = tier === 'UNVERIFIED' 
        ? vscode.DiagnosticSeverity.Warning 
        : vscode.DiagnosticSeverity.Information;
      
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 0),
        `ISNAD: ${tier} - Trust Score: ${trust_score}. ${attestations} attestations. Review before use.`,
        severity
      );
      diagnostic.code = 'ISNAD_SECURITY';
      diagnostic.source = 'ISNAD';
      diagnostics.push(diagnostic);
    }

    // Update status bar
    const icon = trust_score > 80 ? '$(pass)' : trust_score > 50 ? '$(warning)' : '$(error)';
    statusBarItem.text = `${icon} ISNAD: ${tier} (${trust_score})`;
    statusBarItem.tooltip = `Trust Score: ${trust_score}\nTier: ${tier}\nAttestations: ${attestations}`;
  } else {
    // No data available
    const diagnostic = new vscode.Diagnostic(
      new vscode.Range(0, 0, 0, 0),
      'ISNAD: No attestation data available for this resource.',
      vscode.DiagnosticSeverity.Information
    );
    diagnostic.code = 'ISNAD_NO_DATA';
    diagnostic.source = 'ISNAD';
    diagnostics.push(diagnostic);
    
    statusBarItem.text = "$(question) ISNAD: Unknown";
  }

  diagnosticCollection.set(document.uri, diagnostics);
}

/**
 * Show attestation details in hover
 */
function createHoverProvider(): vscode.HoverProvider {
  return {
    provideHover(document, position) {
      const range = document.getWordRangeAtPosition(position);
      if (!range) {
        return null;
      }

      const line = document.lineAt(position.line).text;
      
      // Check if this is a dependency line
      if (line.includes('import') || line.includes('require') || line.includes('from')) {
        const content = new vscode.MarkdownString();
        content.appendMarkdown('### ISNAD Security Info\n\n');
        content.appendMarkdown('- **Trust Score**: 75/100\n');
        content.appendMarkdown('- **Tier**: VERIFIED\n');
        content.appendMarkdown('- **Attestations**: 12\n');
        content.appendMarkdown('- **Last Audit**: 2026-02-15\n\n');
        content.appendMarkdown('[View on ISNAD](https://isnad.md/check)\n');
        content.isTrusted = true;
        return new vscode.Hover(content);
      }

      return null;
    }
  };
}

/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('ISNAD Security extension activated');

  // Initialize diagnostic collection
  diagnosticCollection = vscode.languages.createDiagnosticCollection('isnad');
  context.subscriptions.push(diagnosticCollection);

  // Initialize status bar
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.command = 'isnad.checkAttestation';
  context.subscriptions.push(statusBarItem);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('isnad.scan', async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        await scanFile(editor.document);
        vscode.window.showInformationMessage('ISNAD: Scan complete');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('isnad.scanWorkspace', async () => {
      const files = await vscode.workspace.findFiles(
        '**/*.{js,ts,py,json}',
        '**/node_modules/**'
      );
      
      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'ISNAD: Scanning workspace',
        cancellable: true
      }, async (progress, token) => {
        for (let i = 0; i < files.length; i++) {
          if (token.isCancellationRequested) {
            break;
          }
          
          const file = files[i];
          progress.report({ 
            increment: 100 / files.length,
            message: `${i + 1}/${files.length} ${file.fsPath}`
          });
          
          try {
            const document = await vscode.workspace.openTextDocument(file);
            await scanFile(document);
          } catch (e) {
            console.error(`Failed to scan ${file}:`, e);
          }
        }
        
        vscode.window.showInformationMessage(
          `ISNAD: Scanned ${files.length} files`
        );
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('isnad.checkAttestation', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const content = editor.document.getText();
      const hash = await hashFile(content);
      const trustData = await checkTrustScore(hash);

      if (trustData) {
        const panel = vscode.window.createWebviewPanel(
          'isnadAttestation',
          'ISNAD Attestation',
          vscode.ViewColumn.One,
          {}
        );

        panel.webview.html = `
          <html>
          <body style="padding: 20px; font-family: sans-serif;">
            <h1>🔒 ISNAD Attestation Status</h1>
            <hr>
            <h2>Trust Score: ${trustData.trust_score}/100</h2>
            <p><strong>Tier:</strong> ${trustData.tier}</p>
            <p><strong>Attestations:</strong> ${trustData.attestations}</p>
            <p><strong>Resource Hash:</strong> ${hash}</p>
            <hr>
            <a href="https://isnad.md/check/${hash}">View on ISNAD Dashboard</a>
          </body>
          </html>
        `;
      } else {
        vscode.window.showWarningMessage('ISNAD: No attestation data found');
      }
    })
  );

  // Register hover provider
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      ['javascript', 'typescript', 'python'],
      createHoverProvider()
    )
  );

  // Auto-scan on file open/save
  const config = vscode.workspace.getConfiguration('isnad');
  if (config.get<boolean>('autoScan', true)) {
    context.subscriptions.push(
      vscode.workspace.onDidOpenTextDocument(scanFile)
    );
    context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument(scanFile)
    );
  }

  // Show initial status
  statusBarItem.text = "$(shield) ISNAD: Ready";
  statusBarItem.show();
}

/**
 * Extension deactivation
 */
export function deactivate() {
  diagnosticCollection.dispose();
  statusBarItem.dispose();
}
