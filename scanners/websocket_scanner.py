#!/usr/bin/env python3
"""
ISNAD WebSocket Scanner
Detects malicious WebSocket handlers in npm/PyPI packages
Bounty: 750 ISNAD
"""

import ast
import json
import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum

class ThreatLevel(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

@dataclass
class WebSocketFinding:
    file_path: str
    line_number: int
    threat_level: ThreatLevel
    pattern_name: str
    description: str
    code_snippet: str
    confidence: float

class WebSocketScanner:
    """Scanner for malicious WebSocket patterns"""
    
    def __init__(self):
        self.findings: List[WebSocketFinding] = []
        self.patterns = self._load_patterns()
    
    def _load_patterns(self) -> Dict[str, Any]:
        """Load detection patterns"""
        return {
            "malicious_handlers": {
                "unauthenticated_connections": {
                    "pattern": r"ws\.on\(['\"]open['\"].*?(?!auth|token|check)",
                    "description": "WebSocket connection without authentication",
                    "threat": ThreatLevel.HIGH,
                    "confidence": 0.75
                },
                "data_exfiltration": {
                    "pattern": r"ws\.send\(.*?(password|token|key|secret|credential)",
                    "description": "Sending sensitive data over WebSocket",
                    "threat": ThreatLevel.CRITICAL,
                    "confidence": 0.90
                },
                "external_data_forwarding": {
                    "pattern": r"fetch\(.*\).*\.then.*ws\.send|ws\.on.*message.*fetch",
                    "description": "Forwarding WebSocket data to external endpoints",
                    "threat": ThreatLevel.HIGH,
                    "confidence": 0.85
                },
                "stealth_connection": {
                    "pattern": r"WebSocket\(['\"]wss?://['\"]\)|new WebSocket\(['\"]wss?://['\"]\)",
                    "description": "Hardcoded WebSocket connection without user consent",
                    "threat": ThreatLevel.MEDIUM,
                    "confidence": 0.60
                },
                "keylogger_pattern": {
                    "pattern": r"document\.onkeypress|document\.onkeydown.*ws\.send|addEventListener\(['\"]key",
                    "description": "Potential keylogger sending keystrokes via WebSocket",
                    "threat": ThreatLevel.CRITICAL,
                    "confidence": 0.95
                },
                "clipboard_stealing": {
                    "pattern": r"navigator\.clipboard\.readText\(\).*ws\.send|clipboardData.*ws",
                    "description": "Stealing clipboard data via WebSocket",
                    "threat": ThreatLevel.CRITICAL,
                    "confidence": 0.90
                },
                "session_hijacking": {
                    "pattern": r"document\.cookie.*ws\.send|localStorage\.[sg]etItem.*ws\.send",
                    "description": "Exfiltrating session data via WebSocket",
                    "threat": ThreatLevel.CRITICAL,
                    "confidence": 0.88
                }
            },
            "suspicious_imports": [
                "ws",
                "websocket-client",
                "socket.io-client",
                "uWebSockets"
            ]
        }
    
    def scan_javascript(self, file_path: str, content: str) -> List[WebSocketFinding]:
        """Scan JavaScript/TypeScript files"""
        findings = []
        lines = content.split('\n')
        
        for pattern_name, pattern_data in self.patterns["malicious_handlers"].items():
            regex = re.compile(pattern_data["pattern"], re.IGNORECASE)
            
            for line_num, line in enumerate(lines, 1):
                matches = regex.finditer(line)
                for match in matches:
                    # Get surrounding context
                    start = max(0, line_num - 2)
                    end = min(len(lines), line_num + 2)
                    context = '\n'.join(lines[start:end])
                    
                    finding = WebSocketFinding(
                        file_path=file_path,
                        line_number=line_num,
                        threat_level=pattern_data["threat"],
                        pattern_name=pattern_name,
                        description=pattern_data["description"],
                        code_snippet=context.strip(),
                        confidence=pattern_data["confidence"]
                    )
                    findings.append(finding)
        
        return findings
    
    def scan_python(self, file_path: str, content: str) -> List[WebSocketFinding]:
        """Scan Python files for WebSocket patterns"""
        findings = []
        
        try:
            tree = ast.parse(content)
        except SyntaxError:
            return findings
        
        for node in ast.walk(tree):
            # Check for websocket imports
            if isinstance(node, ast.Import):
                for alias in node.names:
                    if 'websocket' in alias.name.lower():
                        findings.append(WebSocketFinding(
                            file_path=file_path,
                            line_number=getattr(node, 'lineno', 0),
                            threat_level=ThreatLevel.LOW,
                            pattern_name="websocket_import",
                            description=f"WebSocket library imported: {alias.name}",
                            code_snippet=ast.get_source_segment(content, node) or "",
                            confidence=0.50
                        ))
            
            # Check for WebSocket connections
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name) and 'websocket' in node.func.id.lower():
                    # Check if in __init__ or main function (more suspicious)
                    parent = self._get_parent_function(tree, node)
                    if parent in ['__init__', 'main', 'connect']:
                        findings.append(WebSocketFinding(
                            file_path=file_path,
                            line_number=getattr(node, 'lineno', 0),
                            threat_level=ThreatLevel.MEDIUM,
                            pattern_name="websocket_connection",
                            description=f"WebSocket connection in {parent}()",
                            code_snippet=ast.get_source_segment(content, node) or "",
                            confidence=0.65
                        ))
        
        # Also use regex for additional patterns
        lines = content.split('\n')
        python_patterns = {
            "send_sensitive_data": {
                "pattern": r"\.send\(.*?(password|token|secret|key)",
                "description": "Sending sensitive data via WebSocket",
                "threat": ThreatLevel.CRITICAL,
                "confidence": 0.90
            },
            "hardcoded_url": {
                "pattern": r"WebSocketApp\(['\"](wss?://[^'\"]+)['\"]",
                "description": "Hardcoded WebSocket URL",
                "threat": ThreatLevel.MEDIUM,
                "confidence": 0.70
            }
        }
        
        for pattern_name, pattern_data in python_patterns.items():
            regex = re.compile(pattern_data["pattern"], re.IGNORECASE)
            for line_num, line in enumerate(lines, 1):
                if regex.search(line):
                    findings.append(WebSocketFinding(
                        file_path=file_path,
                        line_number=line_num,
                        threat_level=pattern_data["threat"],
                        pattern_name=pattern_name,
                        description=pattern_data["description"],
                        code_snippet=line.strip(),
                        confidence=pattern_data["confidence"]
                    ))
        
        return findings
    
    def _get_parent_function(self, tree: ast.AST, node: ast.AST) -> Optional[str]:
        """Get the parent function name of a node"""
        for parent in ast.walk(tree):
            if isinstance(parent, ast.FunctionDef):
                for child in ast.walk(parent):
                    if child is node:
                        return parent.name
        return None
    
    def scan_file(self, file_path: str, content: str) -> List[WebSocketFinding]:
        """Scan a single file"""
        if file_path.endswith(('.js', '.ts', '.jsx', '.tsx')):
            return self.scan_javascript(file_path, content)
        elif file_path.endswith('.py'):
            return self.scan_python(file_path, content)
        return []
    
    def generate_report(self) -> Dict[str, Any]:
        """Generate scan report"""
        critical = sum(1 for f in self.findings if f.threat_level == ThreatLevel.CRITICAL)
        high = sum(1 for f in self.findings if f.threat_level == ThreatLevel.HIGH)
        medium = sum(1 for f in self.findings if f.threat_level == ThreatLevel.MEDIUM)
        low = sum(1 for f in self.findings if f.threat_level == ThreatLevel.LOW)
        
        return {
            "summary": {
                "total_findings": len(self.findings),
                "critical": critical,
                "high": high,
                "medium": medium,
                "low": low
            },
            "findings": [
                {
                    "file": f.file_path,
                    "line": f.line_number,
                    "threat": f.threat_level.value,
                    "pattern": f.pattern_name,
                    "description": f.description,
                    "confidence": f.confidence,
                    "code": f.code_snippet[:200]  # Truncate for readability
                }
                for f in self.findings
            ]
        }


def main():
    """CLI entry point"""
    import argparse
    import sys
    
    parser = argparse.ArgumentParser(description="ISNAD WebSocket Scanner")
    parser.add_argument("path", help="File or directory to scan")
    parser.add_argument("--output", "-o", help="Output file for report", default="isnad-ws-report.json")
    parser.add_argument("--format", "-f", choices=["json", "sarif"], default="json", help="Output format")
    
    args = parser.parse_args()
    
    scanner = WebSocketScanner()
    
    import os
    if os.path.isfile(args.path):
        with open(args.path) as f:
            content = f.read()
        findings = scanner.scan_file(args.path, content)
        scanner.findings.extend(findings)
    elif os.path.isdir(args.path):
        for root, dirs, files in os.walk(args.path):
            # Skip node_modules and similar
            dirs[:] = [d for d in dirs if d not in ['node_modules', '__pycache__', '.git']]
            
            for file in files:
                if file.endswith(('.js', '.ts', '.py')):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path) as f:
                            content = f.read()
                        findings = scanner.scan_file(file_path, content)
                        scanner.findings.extend(findings)
                    except Exception as e:
                        print(f"Error scanning {file_path}: {e}")
    
    # Generate report
    report = scanner.generate_report()
    
    with open(args.output, 'w') as f:
        json.dump(report, f, indent=2)
    
    # Print summary
    print(f"\n{'='*50}")
    print(f"ISNAD WebSocket Scanner Report")
    print(f"{'='*50}")
    print(f"Total findings: {report['summary']['total_findings']}")
    print(f"  🔴 Critical: {report['summary']['critical']}")
    print(f"  🟠 High: {report['summary']['high']}")
    print(f"  🟡 Medium: {report['summary']['medium']}")
    print(f"  🟢 Low: {report['summary']['low']}")
    print(f"\nReport saved to: {args.output}")
    
    # Return exit code based on findings
    if report['summary']['critical'] > 0:
        sys.exit(2)
    elif report['summary']['high'] > 0:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
