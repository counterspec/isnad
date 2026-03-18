"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const analyzer_1 = require("@isnad/scanner/src/analyzer");
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
function activate(context) {
    console.log('ISNAD Security Scanner activated');
    // Create diagnostic collection
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('isnad');
    context.subscriptions.push(diagnosticCollection);
    // Get configuration
    function getMinSeverity() {
        const config = vscode.workspace.getConfiguration('isnad');
        return config.get('sensitivity', 'medium');
    }
    function shouldScanOnOpen() {
        const config = vscode.workspace.getConfiguration('isnad');
        return config.get('scanOnOpen', true);
    }
    // Scan the active document
    async function scanDocument(document) {
        if (document.uri.scheme !== 'file') {
            return;
        }
        const content = document.getText();
        const result = (0, analyzer_1.analyzeContent)(content);
        updateDiagnostics(document, result, diagnosticCollection, getMinSeverity());
    }
    // Update diagnostics in VS Code
    function updateDiagnostics(document, result, collection, minSeverity) {
        const diagnostics = [];
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
            const diagnostic = new vscode.Diagnostic(range, `${finding.name}: ${finding.description}`, SEVERITY_VSCODE_DIAGNOSTIC[finding.severity]);
            diagnostic.code = finding.patternId;
            diagnostic.source = 'ISNAD';
            diagnostics.push(diagnostic);
        }
        collection.set(document.uri, diagnostics);
    }
    // Register event handlers
    if (shouldScanOnOpen()) {
        vscode.workspace.onDidOpenTextDocument((event) => {
            scanDocument(event);
        }, null, context.subscriptions);
    }
    vscode.workspace.onDidChangeTextDocument((event) => {
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
function deactivate() { }
//# sourceMappingURL=extension.js.map