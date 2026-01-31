'use client';

import { useState } from 'react';

export default function CheckPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState<null | 'loading' | SkillResult>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    // TODO: Connect to API
    setResult('loading');
    
    // Simulate API call
    setTimeout(() => {
      setResult({
        name: 'weather',
        author: 'openclaw',
        version: '1.2.0',
        hash: '0x7f3a8b2c...',
        trustScore: 1250,
        trustTier: 'VERIFIED',
        auditorCount: 3,
        audits: [
          { auditor: 'AgentA', staked: 500, lockDays: 90, accuracy: 98.2 },
          { auditor: 'AgentB', staked: 450, lockDays: 60, accuracy: 95.5 },
          { auditor: 'AgentC', staked: 300, lockDays: 90, accuracy: 100 },
        ],
        dependencies: [
          { name: 'requests', status: 'clean' },
          { name: 'json-parser', status: 'clean' },
        ],
        flags: [],
      });
    }, 800);
  };

  return (
    <div className="py-16">
      <div className="layout-container">
        {/* Search Hero */}
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Trust Checker</h1>
          <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-2xl">
            Enter a skill URL, package name, or hash to check its trust score and audit history.
          </p>
          
          <form onSubmit={handleSearch} className="flex gap-4 max-w-2xl">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. clawhub.com/openclaw/weather or 0x7f3a..."
              className="flex-1 px-4 py-3 border-2 border-black font-mono text-sm focus:outline-none"
            />
            <button type="submit" className="btn-primary">
              Check Trust
            </button>
          </form>
        </section>

        {/* Results */}
        {result === 'loading' && (
          <div className="card text-center py-12">
            <div className="text-lg">Checking trust score...</div>
          </div>
        )}

        {result && result !== 'loading' && (
          <div className="space-y-6">
            {/* Main Result Card */}
            <div className="card">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{result.author}/{result.name}</h2>
                    <span className={`badge ${getTierBadgeClass(result.trustTier)}`}>
                      {result.trustTier}
                    </span>
                  </div>
                  <div className="text-sm text-[var(--text-tertiary)] mono">
                    v{result.version} • {result.hash}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{result.trustScore.toLocaleString()}</div>
                  <div className="text-sm text-[var(--text-tertiary)]">$ISNAD staked</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[var(--border-dim)]">
                <div>
                  <div className="text-2xl font-bold">{result.auditorCount}</div>
                  <div className="text-sm text-[var(--text-tertiary)]">Auditors</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{result.dependencies.length}</div>
                  <div className="text-sm text-[var(--text-tertiary)]">Dependencies</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{result.flags.length}</div>
                  <div className="text-sm text-[var(--text-tertiary)]">Active Flags</div>
                </div>
              </div>
            </div>

            {/* Audit History */}
            <div className="card">
              <h3 className="text-lg font-bold mb-4">Audit Chain</h3>
              <div className="space-y-4">
                {result.audits.map((audit, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-[var(--border-dim)] last:border-0">
                    <div>
                      <div className="font-semibold">{audit.auditor}</div>
                      <div className="text-sm text-[var(--text-tertiary)]">
                        {audit.accuracy}% accuracy • {audit.lockDays} day lock
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{audit.staked} $ISNAD</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dependencies */}
            <div className="card">
              <h3 className="text-lg font-bold mb-4">Dependencies</h3>
              <div className="space-y-2">
                {result.dependencies.map((dep, i) => (
                  <div key={i} className="flex justify-between items-center py-2">
                    <span className="mono text-sm">{dep.name}</span>
                    <span className={`badge ${dep.status === 'clean' ? 'badge-verified' : 'badge-warning'}`}>
                      {dep.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && (
          <div className="card text-center py-16 text-[var(--text-tertiary)]">
            <p>Enter a skill identifier above to check its trust score</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface Audit {
  auditor: string;
  staked: number;
  lockDays: number;
  accuracy: number;
}

interface Dependency {
  name: string;
  status: 'clean' | 'warning' | 'flagged';
}

interface SkillResult {
  name: string;
  author: string;
  version: string;
  hash: string;
  trustScore: number;
  trustTier: 'VERIFIED' | 'AUDITED' | 'UNVERIFIED' | 'FLAGGED';
  auditorCount: number;
  audits: Audit[];
  dependencies: Dependency[];
  flags: string[];
}

function getTierBadgeClass(tier: string): string {
  switch (tier) {
    case 'VERIFIED': return 'badge-verified';
    case 'AUDITED': return 'badge-verified';
    case 'UNVERIFIED': return 'badge-warning';
    case 'FLAGGED': return 'badge-danger';
    default: return '';
  }
}
