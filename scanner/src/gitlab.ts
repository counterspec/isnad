import { createHash } from 'crypto';
import type { AnalysisResult, Finding } from './analyzer.js';

interface GitLabIdentifier {
  type: string;
  name: string;
  value: string;
}

interface GitLabVulnerability {
  id: string;
  category: 'sast';
  name: string;
  message: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  confidence: 'High' | 'Medium' | 'Low';
  scanner: {
    id: string;
    name: string;
  };
  location: {
    file: string;
    start_line: number;
  };
  identifiers: GitLabIdentifier[];
}

interface GitLabSastReport {
  version: '15.0.0';
  scan: {
    analyzer: {
      id: string;
      name: string;
      version: string;
      vendor: {
        name: string;
      };
    };
    scanner: {
      id: string;
      name: string;
      version: string;
      vendor: {
        name: string;
      };
    };
    type: 'sast';
    start_time: string;
    end_time: string;
    status: 'success';
  };
  vulnerabilities: GitLabVulnerability[];
}

const SCANNER = {
  id: 'isnad-scanner',
  name: 'ISNAD Scanner',
  version: '0.1.0',
  vendor: {
    name: 'ISNAD'
  }
};

function mapSeverity(severity: Finding['severity']): GitLabVulnerability['severity'] {
  if (severity === 'critical') return 'Critical';
  if (severity === 'high') return 'High';
  if (severity === 'medium') return 'Medium';
  return 'Low';
}

function mapConfidence(confidence: number): GitLabVulnerability['confidence'] {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.5) return 'Medium';
  return 'Low';
}

function vulnerabilityId(file: string, finding: Finding): string {
  return createHash('sha256')
    .update(`${file}:${finding.patternId}:${finding.line}:${finding.match}`)
    .digest('hex');
}

function toVulnerability(file: string, result: AnalysisResult, finding: Finding): GitLabVulnerability {
  return {
    id: vulnerabilityId(file, finding),
    category: 'sast',
    name: finding.name,
    message: `${finding.patternId}: ${finding.description}`,
    description: finding.description,
    severity: mapSeverity(finding.severity),
    confidence: mapConfidence(result.confidence),
    scanner: {
      id: SCANNER.id,
      name: SCANNER.name
    },
    location: {
      file,
      start_line: finding.line
    },
    identifiers: [
      {
        type: 'isnad_pattern',
        name: finding.patternId,
        value: finding.patternId
      }
    ]
  };
}

export function toGitLabSastReport(results: { file: string; result: AnalysisResult }[]): GitLabSastReport {
  const timestamp = new Date().toISOString();
  return {
    version: '15.0.0',
    scan: {
      analyzer: SCANNER,
      scanner: SCANNER,
      type: 'sast',
      start_time: timestamp,
      end_time: timestamp,
      status: 'success'
    },
    vulnerabilities: results.flatMap(({ file, result }) =>
      result.findings.map((finding) => toVulnerability(file, result, finding))
    )
  };
}
