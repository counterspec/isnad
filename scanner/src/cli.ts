#!/usr/bin/env node
/**
 * ISNAD Scanner CLI
 */

import { Command } from 'commander';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import { analyzeContent, formatResult, type AnalysisResult } from './analyzer.js';
import { submitFlag, checkBalance, createEvidencePackage, hashEvidence, type OracleConfig } from './oracle.js';
import { createHash } from 'crypto';
import { writeFileSync } from 'fs';
import { analysisResultToSarif, sarifToJson, type SarifReport } from './sarif.js';
import 'dotenv/config';

const program = new Command();

program
  .name('isnad-scanner')
  .description('ISNAD Scanner - Detect malicious patterns in AI resources')
  .version('0.1.0');

// Scan command
program
  .command('scan')
  .description('Scan a file or content for malicious patterns')
  .argument('<target>', 'File path or content to scan')
  .option('-f, --file', 'Treat target as file path')
  .option('-j, --json', 'Output as JSON')
  .option('--hash <hash>', 'Resource hash (auto-generated if not provided)')
  .action(async (target: string, options) => {
    let content: string;
    let resourceHash: string | undefined = options.hash;

    if (options.file || existsSync(target)) {
      const filePath = resolve(target);
      if (!existsSync(filePath)) {
        console.error(chalk.red(`File not found: ${filePath}`));
        process.exit(1);
      }
      content = readFileSync(filePath, 'utf-8');
      if (!resourceHash) {
        resourceHash = `0x${createHash('sha256').update(content).digest('hex')}`;
      }
    } else {
      content = target;
    }

    const result = analyzeContent(content, resourceHash);

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatResult(result));
      
      // Exit with appropriate code
      if (result.riskLevel === 'critical' || result.riskLevel === 'high') {
        process.exit(1);
      }
    }
  });

// Flag command (submit to oracle)
program
  .command('flag')
  .description('Scan and submit flag to oracle contract')
  .argument('<file>', 'File path to scan and flag')
  .option('--hash <hash>', 'Resource hash')
  .option('--network <network>', 'Network: testnet or mainnet', 'testnet')
  .option('--dry-run', 'Analyze but do not submit')
  .action(async (file: string, options) => {
    const privateKey = process.env.ISNAD_PRIVATE_KEY;
    if (!privateKey && !options.dryRun) {
      console.error(chalk.red('ISNAD_PRIVATE_KEY environment variable required'));
      process.exit(1);
    }

    const oracleAddress = process.env.ISNAD_ORACLE_ADDRESS || '0x4f1968413640bA2087Db65d4c37912d7CD598982';

    const filePath = resolve(file);
    if (!existsSync(filePath)) {
      console.error(chalk.red(`File not found: ${filePath}`));
      process.exit(1);
    }

    const content = readFileSync(filePath, 'utf-8');
    const resourceHash = options.hash || `0x${createHash('sha256').update(content).digest('hex')}`;

    console.log(chalk.blue('Analyzing...'));
    const result = analyzeContent(content, resourceHash);
    console.log(formatResult(result));

    // Only flag if risk is high enough
    if (result.riskLevel === 'clean' || result.riskLevel === 'low') {
      console.log(chalk.green('Resource appears safe. No flag needed.'));
      return;
    }

    if (result.confidence < 0.6) {
      console.log(chalk.yellow(`Confidence too low (${(result.confidence * 100).toFixed(0)}%). Manual review recommended.`));
      if (!options.dryRun) {
        console.log(chalk.yellow('Use --dry-run to see evidence without submitting.'));
        return;
      }
    }

    // Show evidence
    const evidence = createEvidencePackage(result);
    const evidenceHash = hashEvidence(evidence);
    console.log(chalk.blue('\nEvidence Hash:'), evidenceHash);

    if (options.dryRun) {
      console.log(chalk.yellow('\n[DRY RUN] Would submit flag:'));
      console.log(`  Resource: ${resourceHash}`);
      console.log(`  Evidence: ${evidenceHash}`);
      console.log(`  Network:  ${options.network}`);
      return;
    }

    // Check balance
    const config: OracleConfig = {
      privateKey: privateKey!,
      oracleAddress: oracleAddress as `0x${string}`,
      network: options.network
    };

    console.log(chalk.blue('\nChecking balance...'));
    const balanceInfo = await checkBalance(config);
    console.log(`  Address:     ${balanceInfo.address}`);
    console.log(`  Balance:     ${balanceInfo.balance} wei`);
    console.log(`  Min Deposit: ${balanceInfo.minDeposit} wei`);

    if (!balanceInfo.canFlag) {
      console.error(chalk.red('Insufficient balance for flag deposit'));
      process.exit(1);
    }

    // Submit flag
    console.log(chalk.blue('\nSubmitting flag...'));
    try {
      const submission = await submitFlag(config, result);
      console.log(chalk.green('\n✓ Flag submitted successfully!'));
      console.log(`  TX Hash:  ${submission.txHash}`);
      console.log(`  Flag ID:  ${submission.flagId}`);
    } catch (error) {
      console.error(chalk.red('Failed to submit flag:'), error);
      process.exit(1);
    }
  });

// Evidence command (generate evidence without submitting)
program
  .command('evidence')
  .description('Generate evidence package for a scan')
  .argument('<file>', 'File path to scan')
  .option('--hash <hash>', 'Resource hash')
  .action(async (file: string, options) => {
    const filePath = resolve(file);
    if (!existsSync(filePath)) {
      console.error(chalk.red(`File not found: ${filePath}`));
      process.exit(1);
    }

    const content = readFileSync(filePath, 'utf-8');
    const resourceHash = options.hash || `0x${createHash('sha256').update(content).digest('hex')}`;

    const result = analyzeContent(content, resourceHash);
    const evidence = createEvidencePackage(result);
    
    console.log(evidence);
  });

// Batch command
program
  .command('batch')
  .description('Scan multiple files')
  .argument('<pattern>', 'Glob pattern for files to scan')
  .option('-j, --json', 'Output as JSON')
  .option('--fail-fast', 'Exit on first critical/high finding')
  .option('--sarif-output <path>', 'Export batch results as SARIF to file (GitLab Security Dashboard compatible)')
  .action(async (pattern: string, options) => {
    const { glob } = await import('glob');
    const files = await glob(pattern);

    if (files.length === 0) {
      console.log(chalk.yellow('No files matched pattern'));
      return;
    }

    console.log(chalk.blue(`Scanning ${files.length} files...\n`));

    const results: { file: string; result: AnalysisResult }[] = [];
    let hasHighRisk = false;

    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      const resourceHash = `0x${createHash('sha256').update(content).digest('hex')}`;
      const result = analyzeContent(content, resourceHash);
      results.push({ file, result });

      if (!options.json) {
        const emoji = {
          critical: '🔴',
          high: '🟠',
          medium: '🟡',
          low: '🟢',
          clean: '✅'
        }[result.riskLevel];
        console.log(`${emoji} ${file}: ${result.riskLevel} (${result.summary.total} findings)`);
      }

      if (result.riskLevel === 'critical' || result.riskLevel === 'high') {
        hasHighRisk = true;
        if (options.failFast) {
          console.log(chalk.red('\nFailed fast due to high risk finding'));
          break;
        }
      }
    }

    if (options.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      console.log(chalk.blue(`\nScanned ${results.length} files`));
      const summary = {
        critical: results.filter(r => r.result.riskLevel === 'critical').length,
        high: results.filter(r => r.result.riskLevel === 'high').length,
        medium: results.filter(r => r.result.riskLevel === 'medium').length,
        low: results.filter(r => r.result.riskLevel === 'low').length,
        clean: results.filter(r => r.result.riskLevel === 'clean').length
      };
      console.log(`  🔴 Critical: ${summary.critical}`);
      console.log(`  🟠 High:     ${summary.high}`);
      console.log(`  🟡 Medium:   ${summary.medium}`);
      console.log(`  🟢 Low:      ${summary.low}`);
      console.log(`  ✅ Clean:    ${summary.clean}`);
    }

    // Export SARIF report if requested
    if (options.sarifOutput && results.length > 0) {
      const combinedRuns = results.flatMap(r => {
        const sarif = analysisResultToSarif(r.result, r.file);
        return sarif.runs;
      });

      const combinedSarif: SarifReport = {
        $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
        version: '2.1.0',
        runs: combinedRuns,
      };

      writeFileSync(options.sarifOutput, sarifToJson(combinedSarif));
      console.log(chalk.green('\\nSARIF report written to: ' + options.sarifOutput));
    }

    if (hasHighRisk) {
      process.exit(1);
    }
  });

program.parse();
