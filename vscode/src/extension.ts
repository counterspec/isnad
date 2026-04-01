import * as vscode from 'vscode';
import { analyzeContent, Finding } from '@isnad/scanner';

let diagnosticCollection: vscode.DiagnosticCollection;
let statusBarItem: vscode.StatusBarItem;

const severityMap = new Map([
  ['critical', vscode.DiagnosticSeverity.Error],
  ['high', vscode.DiagnosticSeverity.Error],
  ['medium', vscode.DiagnosticSeverity.Warning],
  ['low', vscode.DiagnosticSeverity.Information],
]);

const statusMap = new Map([
  ['critical', '$(alert) Critical Risk'],
  ['high', '$(warning) High Risk'],
  ['medium', '$(info) Medium Risk'],
  ['low', '$(info) Low Risk'],
  ['clean', '$(check) Clean'],
]);

export function activate(context: vscode.ExtensionContext) {
  diagnosticCollection = vscode.languages.createDiagnosticCollection('isnad');
  context.subscriptions.push(diagnosticCollection);

  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'isnad-vscode.scanCurrentFile';
  context.subscriptions.push(statusBarItem);

  if (vscode.window.activeTextEditor) {
    scanDocument(vscode.window.activeTextEditor.document);
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor) {
        scanDocument(editor.document);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(document => {
      const config = vscode.workspace.getConfiguration('isnad-scanner');
      if (config.get<boolean>('scanOnSave')) {
        scanDocument(document);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(document => {
      const config = vscode.workspace.getConfiguration('isnad-scanner');
      if (config.get<boolean>('scanOnOpen')) {
        scanDocument(document);
      }
    })
  );

  const disposable = vscode.commands.registerCommand('isnad-vscode.scanCurrentFile', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      scanDocument(editor.document);
      vscode.window.showInformationMessage('ISNAD scan completed');
    }
  });

  context.subscriptions.push(disposable);
}

function scanDocument(document: vscode.TextDocument) {
  if (document.uri.scheme !== 'file') {
    return;
  }

  const content = document.getText();
  const result = analyzeContent(content, document.uri.fsPath);

  const config = vscode.workspace.getConfiguration('isnad-scanner');
  const minSeverity = config.get<string>('sensitivity', 'medium');
  const severityOrder = ['low', 'medium', 'high', 'critical'];
  const minSeverityIndex = severityOrder.indexOf(minSeverity);

  const diagnostics: vscode.Diagnostic[] = [];
  let maxSeverity: string = 'clean';

  result.findings.forEach((finding: Finding) => {
    const findingSeverityIndex = severityOrder.indexOf(finding.severity);
    if (findingSeverityIndex < minSeverityIndex) {
      return;
    }

    if (findingSeverityIndex > severityOrder.indexOf(maxSeverity)) {
      maxSeverity = finding.severity;
    }

    const line = finding.line || 0;
    const range = new vscode.Range(line, 0, line, document.lineAt(line).text.length);

    const diagnostic = new vscode.Diagnostic(
      range,
      `ISNAD: ${finding.description}\nSeverity: ${finding.severity}\nConfidence: ${(finding.confidence * 100).toFixed(0)}%`,
      severityMap.get(finding.severity) || vscode.DiagnosticSeverity.Information
    );

    diagnostic.code = finding.patternId;
    diagnostic.source = 'ISNAD';
    diagnostics.push(diagnostic);
  });

  diagnosticCollection.set(document.uri, diagnostics);
  updateStatusBar(maxSeverity);
}

function updateStatusBar(severity: string) {
  statusBarItem.text = statusMap.get(severity) || '$(check) Clean';
  
  switch (severity) {
    case 'critical':
      statusBarItem.color = new vscode.ThemeColor('statusBarItem.errorBackground');
      break;
    case 'high':
      statusBarItem.color = new vscode.ThemeColor('statusBarItem.warningBackground');
      break;
    default:
      statusBarItem.color = new vscode.ThemeColor('statusBarItem.foreground');
  }

  statusBarItem.show();
}

export function deactivate() {
  diagnosticCollection.dispose();
  statusBarItem.dispose();
}
