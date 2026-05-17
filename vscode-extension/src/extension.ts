import * as vscode from 'vscode';
import { buildDiagnosticModels, buildHoverMarkdown, normalizeSensitivity } from './diagnostics';
import { scanDocumentText } from './scanner';
import type { DiagnosticModel, Severity } from './types';

const SUPPORTED_SCHEMES = new Set(['file', 'untitled']);

export function activate(context: vscode.ExtensionContext): void {
  const controller = new IsnadDiagnosticsController(context);
  context.subscriptions.push(controller);
}

export function deactivate(): void {
  // Extension resources are disposed through subscriptions.
}

class IsnadDiagnosticsController implements vscode.Disposable {
  private readonly collection = vscode.languages.createDiagnosticCollection('ISNAD');
  private readonly findingsByUri = new Map<string, DiagnosticModel[]>();
  private readonly timers = new Map<string, NodeJS.Timeout>();
  private readonly status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 90);
  private readonly decorationTypes: Record<Severity, vscode.TextEditorDecorationType>;

  constructor(context: vscode.ExtensionContext) {
    this.decorationTypes = {
      critical: createDecoration('rgba(176, 0, 32, 0.22)', 'isnad: critical risk'),
      high: createDecoration('rgba(214, 77, 0, 0.20)', 'isnad: high risk'),
      medium: createDecoration('rgba(191, 135, 0, 0.18)', 'isnad: medium risk'),
      low: createDecoration('rgba(0, 105, 92, 0.16)', 'isnad: low risk')
    };

    context.subscriptions.push(
      this.collection,
      this.status,
      ...Object.values(this.decorationTypes),
      vscode.workspace.onDidOpenTextDocument((document) => this.scanOnOpen(document)),
      vscode.workspace.onDidSaveTextDocument((document) => this.scanOnSave(document)),
      vscode.workspace.onDidChangeTextDocument((event) => this.scanOnChange(event.document)),
      vscode.window.onDidChangeActiveTextEditor(() => this.refreshEditorDecorations()),
      vscode.workspace.onDidChangeConfiguration((event) => this.onConfigurationChanged(event)),
      vscode.languages.registerHoverProvider({ scheme: 'file' }, {
        provideHover: (document, position) => this.provideHover(document, position)
      }),
      vscode.languages.registerHoverProvider({ scheme: 'untitled' }, {
        provideHover: (document, position) => this.provideHover(document, position)
      }),
      vscode.commands.registerCommand('isnad.scanCurrentFile', () => this.scanCurrentFile()),
      vscode.commands.registerCommand('isnad.scanWorkspace', () => this.scanWorkspace()),
      vscode.commands.registerCommand('isnad.clearDiagnostics', () => this.clear())
    );

    this.status.command = 'isnad.scanCurrentFile';
    this.status.text = 'ISNAD';
    this.status.tooltip = 'Scan current file with ISNAD';
    this.status.show();

    for (const document of vscode.workspace.textDocuments) {
      this.scanOnOpen(document);
    }
  }

  dispose(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.findingsByUri.clear();
  }

  private async scanCurrentFile(): Promise<void> {
    const document = vscode.window.activeTextEditor?.document;
    if (!document) {
      return;
    }

    await this.scanDocument(document, true);
  }

  private async scanWorkspace(): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    const include = this.getConfig<string[]>('includeGlobs', ['**/*.{js,jsx,ts,tsx,json,py,sol,rs,go}']).join(',');
    const exclude = this.getConfig<string[]>('excludeGlobs', ['**/{node_modules,dist,build,.git}/**']).join(',');
    const uris = await vscode.workspace.findFiles(`{${include}}`, `{${exclude}}`);

    for (const uri of uris) {
      const document = await vscode.workspace.openTextDocument(uri);
      await this.scanDocument(document, false);
    }
  }

  private scanOnOpen(document: vscode.TextDocument): void {
    if (this.getConfig<boolean>('scanOnOpen', true)) {
      void this.scanDocument(document, false);
    }
  }

  private scanOnSave(document: vscode.TextDocument): void {
    if (this.getConfig<boolean>('scanOnSave', true)) {
      void this.scanDocument(document, false);
    }
  }

  private scanOnChange(document: vscode.TextDocument): void {
    if (!this.getConfig<boolean>('scanOnChange', false)) {
      return;
    }

    const key = document.uri.toString();
    const currentTimer = this.timers.get(key);
    if (currentTimer) {
      clearTimeout(currentTimer);
    }

    const delay = this.getConfig<number>('debounceMs', 750);
    const timer = setTimeout(() => {
      this.timers.delete(key);
      void this.scanDocument(document, false);
    }, delay);
    this.timers.set(key, timer);
  }

  private async scanDocument(document: vscode.TextDocument, showErrors: boolean): Promise<void> {
    if (!this.shouldScan(document)) {
      return;
    }

    try {
      const result = await scanDocumentText(document.getText(), {
        scannerCommand: this.getConfig<string>('scannerCommand', ''),
        timeoutMs: this.getConfig<number>('scanTimeoutMs', 10000),
        workspaceTrusted: vscode.workspace.isTrusted,
        workspaceFolders: vscode.workspace.workspaceFolders
      });

      const sensitivity = normalizeSensitivity(this.getConfig<string>('scanSensitivity', 'medium'));
      const models = buildDiagnosticModels(result, sensitivity);
      const diagnostics = models.map((model) => this.toDiagnostic(model));

      this.findingsByUri.set(document.uri.toString(), models);
      this.collection.set(document.uri, diagnostics);
      this.updateStatus();
      this.refreshEditorDecorations();
    } catch (error) {
      if (showErrors) {
        const message = error instanceof Error ? error.message : String(error);
        void vscode.window.showWarningMessage(`ISNAD scan failed: ${message}`);
      }
    }
  }

  private shouldScan(document: vscode.TextDocument): boolean {
    return this.isEnabled() && SUPPORTED_SCHEMES.has(document.uri.scheme) && !document.isClosed;
  }

  private isEnabled(): boolean {
    return this.getConfig<boolean>('enabled', true);
  }

  private toDiagnostic(model: DiagnosticModel): vscode.Diagnostic {
    const range = new vscode.Range(
      model.range.startLine,
      model.range.startCharacter,
      model.range.endLine,
      model.range.endCharacter
    );
    const diagnostic = new vscode.Diagnostic(range, model.message, severityToDiagnostic(model.finding.severity));
    diagnostic.source = model.source;
    diagnostic.code = model.code;
    return diagnostic;
  }

  private provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | undefined {
    const models = this.findingsByUri.get(document.uri.toString()) || [];
    const model = models.find((item) => {
      const range = new vscode.Range(
        item.range.startLine,
        item.range.startCharacter,
        item.range.endLine,
        item.range.endCharacter
      );
      return range.contains(position);
    });

    if (!model) {
      return undefined;
    }

    const markdown = new vscode.MarkdownString(buildHoverMarkdown(model));
    markdown.isTrusted = false;
    return new vscode.Hover(markdown);
  }

  private refreshEditorDecorations(): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const models = this.findingsByUri.get(editor.document.uri.toString()) || [];
    for (const severity of Object.keys(this.decorationTypes) as Severity[]) {
      const ranges = models
        .filter((model) => model.finding.severity === severity)
        .map((model) => new vscode.Range(
          model.range.startLine,
          model.range.startCharacter,
          model.range.endLine,
          model.range.endCharacter
        ));
      editor.setDecorations(this.decorationTypes[severity], ranges);
    }
  }

  private updateStatus(): void {
    const total = [...this.findingsByUri.values()].reduce((sum, models) => sum + models.length, 0);
    this.status.text = total > 0 ? `ISNAD $(warning) ${total}` : 'ISNAD $(check)';
    this.status.tooltip = total > 0 ? `${total} ISNAD findings in open workspace documents` : 'No ISNAD findings in scanned documents';
  }

  private clear(): void {
    this.collection.clear();
    this.findingsByUri.clear();
    this.updateStatus();
    this.refreshEditorDecorations();
  }

  private onConfigurationChanged(event: vscode.ConfigurationChangeEvent): void {
    if (event.affectsConfiguration('isnad')) {
      for (const document of vscode.workspace.textDocuments) {
        void this.scanDocument(document, false);
      }
    }
  }

  private getConfig<T>(key: string, fallback: T): T {
    return vscode.workspace.getConfiguration('isnad').get<T>(key, fallback);
  }
}

function createDecoration(backgroundColor: string, contentText: string): vscode.TextEditorDecorationType {
  return vscode.window.createTextEditorDecorationType({
    backgroundColor,
    overviewRulerColor: backgroundColor,
    overviewRulerLane: vscode.OverviewRulerLane.Right,
    after: {
      contentText: ` ${contentText}`,
      margin: '0 0 0 0.75rem',
      color: 'rgba(160, 64, 0, 0.95)',
      fontStyle: 'italic'
    }
  });
}

function severityToDiagnostic(severity: Severity): vscode.DiagnosticSeverity {
  if (severity === 'critical' || severity === 'high') {
    return vscode.DiagnosticSeverity.Error;
  }
  if (severity === 'medium') {
    return vscode.DiagnosticSeverity.Warning;
  }
  return vscode.DiagnosticSeverity.Information;
}
