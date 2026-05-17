import { execFile } from 'child_process';
import { existsSync } from 'fs';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import type * as vscode from 'vscode';
import { parseScannerJson } from './diagnostics';
import type { ScanResult } from './types';

interface ScannerCandidate {
  command: string;
  argsPrefix: string[];
  cwd?: string;
}

interface ScannerOptions {
  scannerCommand: string;
  timeoutMs: number;
  workspaceTrusted: boolean;
  workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined;
}

export async function scanDocumentText(text: string, options: ScannerOptions): Promise<ScanResult> {
  const tempRoot = await mkdtemp(join(tmpdir(), 'isnad-vscode-'));
  const target = join(tempRoot, 'document.txt');

  try {
    await writeFile(target, text, 'utf8');
    const candidates = getScannerCandidates(options);
    let lastError: Error | undefined;

    for (const candidate of candidates) {
      try {
        const output = await runScanner(candidate, target, options.timeoutMs);
        return parseScannerJson(output);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    throw lastError || new Error('No ISNAD scanner command could be executed');
  } finally {
    await rm(tempRoot, { force: true, recursive: true });
  }
}

function getScannerCandidates(options: ScannerOptions): ScannerCandidate[] {
  const candidates: ScannerCandidate[] = [];
  const configured = options.scannerCommand.trim();

  if (configured.length > 0 && options.workspaceTrusted) {
    candidates.push({ command: configured, argsPrefix: [] });
  }

  if (options.workspaceTrusted) {
    for (const folder of options.workspaceFolders || []) {
      const localCli = join(folder.uri.fsPath, 'scanner', 'dist', 'cli.js');
      if (existsSync(localCli)) {
        candidates.push({
          command: process.execPath,
          argsPrefix: [localCli],
          cwd: folder.uri.fsPath
        });
      }
    }
  }

  candidates.push({ command: commandForPlatform('isnad-scan'), argsPrefix: [] });
  candidates.push({ command: commandForPlatform('isnad-scanner'), argsPrefix: [] });

  return candidates;
}

function commandForPlatform(command: string): string {
  return process.platform === 'win32' ? `${command}.cmd` : command;
}

function runScanner(candidate: ScannerCandidate, target: string, timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [...candidate.argsPrefix, 'scan', target, '--file', '--json'];
    const invocation = getInvocation(candidate.command, args);
    const child = execFile(
      invocation.command,
      invocation.args,
      {
        cwd: candidate.cwd,
        timeout: timeoutMs,
        windowsHide: true,
        maxBuffer: 1024 * 1024
      },
      (error, stdout, stderr) => {
        if (stdout.trim().length > 0) {
          try {
            parseScannerJson(stdout);
            resolve(stdout);
            return;
          } catch {
            // Continue and include stderr or process failure in the error message below.
          }
        }

        if (error) {
          reject(new Error(`${candidate.command} failed: ${stderr || error.message}`));
          return;
        }

        reject(new Error(`${candidate.command} returned no parseable JSON`));
      }
    );

    child.stdin?.end();
  });
}

function getInvocation(command: string, args: string[]): { command: string; args: string[] } {
  if (process.platform !== 'win32' || command === process.execPath) {
    return { command, args };
  }

  const comspec = process.env.ComSpec || 'cmd.exe';
  const commandLine = [command, ...args].map(quoteForCmd).join(' ');
  return { command: comspec, args: ['/d', '/s', '/c', commandLine] };
}

function quoteForCmd(value: string): string {
  if (/^[A-Za-z0-9_/:=.,\\-]+$/.test(value)) {
    return value;
  }
  return `"${value.replace(/"/g, '\\"')}"`;
}
