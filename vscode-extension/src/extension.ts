/**
 * ISNAD VS Code Extension
 * Real-time security scanning with inline warnings
 */

import * as vscode from 'vscode';
import { analyzeContent, type Finding, type AnalysisResult } from './analyzer';

let diagnosticCollection: vscode.DiagnosticCollection;
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  console.log('ISNAD Security Scanner activated');

  diagnosticCollection = vscode.languages.createDiagnosticCollection('isnad');
  context.subscriptions.push(diagnosticCollection);

  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'isnad.scanFile';
  context.subscriptions.push(statusBarItem);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('isnad.scanFile', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        scanDocument(editor.document);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('isnad.scanWorkspace', async () => {
      await scanWorkspace();
    })
  );

  // Scan on document open
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(doc => {
      if (shouldScanDocument(doc)) {
        scanDocument(doc);
      }
    })
  );

  // Scan on document save
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(doc => {
      const config = vscode.workspace.getConfiguration('isnad');
      if (config.get('scanOnSave') && shouldScanDocument(doc)) {
        scanDocument(doc);
      }
    })
  );

  // Scan on document change (if enabled)
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      const config = vscode.workspace.getConfiguration('isnad');
      if (config.get('scanOnType') && shouldScanDocument(event.document)) {
        scanDocument(event.document);
      }
    })
  );

  // Scan all open documents
  vscode.workspace.textDocuments.forEach(doc => {
    if (shouldScanDocument(doc)) {
      scanDocument(doc);
    }
  });

  statusBarItem.show();
}

function shouldScanDocument(document: vscode.TextDocument): boolean {
  const config = vscode.workspace.getConfiguration('isnad');
  if (!config.get('enabled')) {
    return false;
  }

  const supportedLanguages = ['javascript', 'typescript', 'python', 'javascriptreact', 'typescriptreact'];
  return supportedLanguages.includes(document.languageId);
}

function scanDocument(document: vscode.TextDocument) {
  const content = document.getText();
  const result = analyzeContent(content);

  updateDiagnostics(document, result);
  updateStatusBar(result);
}

function updateDiagnostics(document: vscode.TextDocument, result: AnalysisResult) {
  const diagnostics: vscode.Diagnostic[] = [];

  for (const finding of result.findings) {
    const line = document.lineAt(finding.line - 1);
    const range = new vscode.Range(
      finding.line - 1,
      finding.column - 1,
      finding.line - 1,
      line.text.length
    );

    const diagnostic = new vscode.Diagnostic(
      range,
      `[ISNAD] ${finding.name}: ${finding.description}`,
      severityToDiagnosticSeverity(finding.severity)
    );

    diagnostic.code = finding.patternId;
    diagnostic.source = 'ISNAD';
    diagnostic.relatedInformation = [
      new vscode.DiagnosticRelatedInformation(
        new vscode.Location(document.uri, range),
        `Category: ${finding.category}\nMatch: ${finding.match}`
      )
    ];

    diagnostics.push(diagnostic);
  }

  diagnosticCollection.set(document.uri, diagnostics);
}

function severityToDiagnosticSeverity(severity: string): vscode.DiagnosticSeverity {
  switch (severity) {
    case 'critical':
    case 'high':
      return vscode.DiagnosticSeverity.Error;
    case 'medium':
      return vscode.DiagnosticSeverity.Warning;
    case 'low':
      return vscode.DiagnosticSeverity.Information;
    default:
      return vscode.DiagnosticSeverity.Hint;
  }
}

function updateStatusBar(result: AnalysisResult) {
  const icon = getRiskIcon(result.riskLevel);
  const text = `${icon} ISNAD: ${result.summary.total} findings`;
  
  statusBarItem.text = text;
  statusBarItem.tooltip = `Risk Level: ${result.riskLevel}\n` +
    `Critical: ${result.summary.critical}\n` +
    `High: ${result.summary.high}\n` +
    `Medium: ${result.summary.medium}\n` +
    `Low: ${result.summary.low}`;

  statusBarItem.backgroundColor = result.riskLevel === 'critical' || result.riskLevel === 'high'
    ? new vscode.ThemeColor('statusBarItem.errorBackground')
    : undefined;
}

function getRiskIcon(riskLevel: string): string {
  switch (riskLevel) {
    case 'critical': return '🔴';
    case 'high': return '🟠';
    case 'medium': return '🟡';
    case 'low': return '🟢';
    default: return '✅';
  }
}

async function scanWorkspace() {
  const files = await vscode.workspace.findFiles('**/*.{js,ts,py}', '**/node_modules/**');
  
  let totalFindings = 0;
  let criticalCount = 0;
  let highCount = 0;

  for (const file of files) {
    const document = await vscode.workspace.openTextDocument(file);
    const content = document.getText();
    const result = analyzeContent(content);
    
    updateDiagnostics(document, result);
    
    totalFindings += result.summary.total;
    criticalCount += result.summary.critical;
    highCount += result.summary.high;
  }

  vscode.window.showInformationMessage(
    `ISNAD Workspace Scan Complete: ${totalFindings} findings in ${files.length} files ` +
    `(Critical: ${criticalCount}, High: ${highCount})`
  );
}

export function deactivate() {
  if (diagnosticCollection) {
    diagnosticCollection.dispose();
  }
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}
