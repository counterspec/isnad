#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const [inputPath, outputPath = 'gl-sast-isnad.json'] = process.argv.slice(2);

if (!inputPath) {
  console.error('Usage: node scripts/isnad-to-gitlab-sast.mjs <isnad-results.json> [gl-sast-isnad.json]');
  process.exit(1);
}

const severityMap = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

const confidenceMap = {
  critical: 'High',
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

const raw = JSON.parse(readFileSync(inputPath, 'utf8'));
const scanResults = Array.isArray(raw) ? raw : [{ file: 'unknown', result: raw }];

const vulnerabilities = scanResults.flatMap(({ file = 'unknown', result = {} }) => {
  const findings = Array.isArray(result.findings) ? result.findings : [];

  return findings.map((finding) => {
    const idSource = [
      file,
      finding.patternId,
      finding.line,
      finding.column,
      finding.match
    ].join(':');
    const id = createHash('sha256').update(idSource).digest('hex');
    const severity = severityMap[finding.severity] || 'Info';

    return {
      id,
      category: 'sast',
      name: finding.name || 'ISNAD scanner finding',
      message: finding.description || finding.name || 'ISNAD scanner finding',
      description: finding.description || '',
      severity,
      confidence: confidenceMap[finding.severity] || 'Unknown',
      scanner: {
        id: 'isnad-scanner',
        name: 'ISNAD Scanner'
      },
      location: {
        file,
        start_line: finding.line || 1
      },
      identifiers: [
        {
          type: 'isnad_pattern',
          name: finding.patternId || 'isnad-pattern',
          value: finding.patternId || 'isnad-pattern',
          url: 'https://github.com/counterspec/isnad/tree/main/scanner'
        }
      ]
    };
  });
});

const report = {
  version: '15.0.0',
  vulnerabilities,
  scan: {
    analyzer: {
      id: 'isnad-scanner',
      name: 'ISNAD Scanner',
      version: '0.1.0',
      vendor: {
        name: 'ISNAD'
      }
    },
    scanner: {
      id: 'isnad-scanner',
      name: 'ISNAD Scanner',
      version: '0.1.0',
      vendor: {
        name: 'ISNAD'
      }
    },
    type: 'sast',
    start_time: new Date().toISOString(),
    end_time: new Date().toISOString(),
    status: 'success'
  }
};

writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
