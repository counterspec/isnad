import * as vscode from 'vscode';
import { analyzeContent, type Finding, type AnalysisResult } from '@isnad/scanner/src/analyzer';

const SEVERITY_WEIGHTS = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1
};

const SEVERITY_VSCODE_DIAGNOSTIC = {
  critical: vscode.DiagnosticSeverity.Error,
  high: vscode.DiagnosticSeverity.Warning,
  medium: vscode.DiagnosticSeverity.Warning,
  low: vscode.DiagnosticSeverity.Information
};

type SensitivityLevel = 'low' | 'medium' | 'high' | 'critical';

export function activate(context: vscode.ExtensionContext) {
  console.log('ISNAD Security Scanner activated');

  // Create diagnostic collection
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('isnad');
  context.subscriptions.push(diagnosticCollection);

  // Get configuration
  function getMinSeverity(): SensitivityLevel {
    const config = vscode.workspace.getConfiguration('isnad');
    return config.get<SensitivityLevel>('sensitivity', 'medium');
  }

  function shouldScanOnOpen(): boolean {
    const config = vscode.workspace.getConfiguration('isnad');
    return config.get<boolean>('scanOnOpen', true);
  }

  // Scan the active document
  async function scanDocument(document: vscode.TextDocument) {
    if (document.uri.scheme !== 'file') {
      return;
    }

    const content = document.getText();
    const result = analyzeContent(content);
    updateDiagnostics(document, result, diagnosticCollection, getMinSeverity());
  }

  // Update diagnostics in VS Code
  function updateDiagnostics(
    document: vscode.TextDocument,
    result: AnalysisResult,
    collection: vscode.DiagnosticCollection,
    minSeverity: SensitivityLevel
  ) {
    const diagnostics: vscode.Diagnostic[] = [];

    const minWeight = SEVERITY_WEIGHTS[minSeverity];

    for (const finding of result.findings) {
      const weight = SEVERITY_WEIGHTS[finding.severity];
      if (weight < minWeight) {
        continue;
      }

      // Get range for the match
      const line = finding.line - 1; // VS Code is 0-based
      const lineText = document.lineAt(line);
      const start = new vscode.Position(line, Math.max(0, finding.column - 1));
      const end = new vscode.Position(line, lineText.range.end.character);
      const range = new vscode.Range(start, end);

      const diagnostic = new vscode.Diagnostic(
        range,
        `${finding.name}: ${finding.description}`,
        SEVERITY_VSCODE_DIAGNOSTIC[finding.severity]
      );

      diagnostic.code = finding.patternId;
      diagnostic.source = 'ISNAD';
      diagnostics.push(diagnostic);
    }

    collection.set(document.uri, diagnostics);
  }

  // Register event handlers
  if (shouldScanOnOpen()) {
    vscode.workspace.onDidOpenTextDocument((event: vscode.TextDocument) => {
      scanDocument(event);
    }, null, context.subscriptions);
  }

  vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
    if (shouldScanOnOpen()) {
      scanDocument(event.document);
    }
  }, null, context.subscriptions);

  // Register manual scan command
  const scanCommand = vscode.commands.registerCommand('isnad-vscode.scanWorkspace', () => {
    vscode.window.showInformationMessage('Starting ISNAD security scan...');
    
    // Scan all open text documents
    vscode.workspace.textDocuments.forEach(doc => {
      scanDocument(doc);
    });
    
    vscode.window.showInformationMessage('ISNAD scan complete');
  });

  const clearCommand = vscode.commands.registerCommand('isnad-vscode.clearWarnings', () => {
    diagnosticCollection.clear();
  });

  context.subscriptions.push(scanCommand, clearCommand);

  // Scan already open documents on activation
  vscode.workspace.textDocuments.forEach(doc => {
    if (shouldScanOnOpen()) {
      scanDocument(doc);
    }
  });
}

export function deactivate() {}
