'use client';

import { useState } from 'react';
import { api, TrustInfo, formatTokenAmount, getTierName } from '@/lib/api';
import { keccak256, toBytes } from 'viem';

export default function CheckPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState<null | 'loading' | 'not-found' | TrustInfo>(null);
  const [searchedHash, setSearchedHash] = useState<string>('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setResult('loading');
    
    try {
      // Determine if input is a hash or needs to be hashed
      let hash = searchTerm.trim();
      
      if (!hash.startsWith('0x')) {
        // Hash the input (URL, package name, etc.)
        hash = keccak256(toBytes(searchTerm.trim()));
      }
      
      setSearchedHash(hash);
      
      const data = await api.getTrust(hash);
      
      if (!data.resource) {
        setResult('not-found');
      } else {
        setResult(data);
      }
    } catch (err) {
      console.error('Search error:', err);
      setResult('not-found');
    }
  };

  return (
    <div className="py-16">
      <div className="layout-container">
        {/* Search Hero */}
        <section className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Trust Checker</h1>
          <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-2xl">
            Enter a skill URL, package name, or content hash to check its trust score and audit history.
          </p>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-2xl">
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

        {result === 'not-found' && (
          <div className="card text-center py-12">
            <div className="text-lg font-bold mb-2">Resource Not Found</div>
            <div className="text-[var(--text-secondary)] mb-4">
              This resource has not been inscribed on ISNAD yet.
            </div>
            <div className="text-sm text-[var(--text-tertiary)] mono">
              Searched: {searchedHash.slice(0, 20)}...
            </div>
          </div>
        )}

        {result && result !== 'loading' && result !== 'not-found' && (
          <div className="space-y-6">
            {/* Main Result Card */}
            <div className="card">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h2 className="text-xl sm:text-2xl font-bold">
                      {result.resource?.name || 'Unknown Resource'}
                    </h2>
                    <span className={`badge ${getTierBadgeClass(result.trustTier)}`}>
                      {result.trustTier}
                    </span>
                  </div>
                  <div className="text-sm text-[var(--text-tertiary)] mono">
                    {result.resource?.type || 'UNKNOWN'} • {result.resource?.hash.slice(0, 16)}...
                  </div>
                </div>
                <div className="sm:text-right">
                  <div className="text-2xl sm:text-3xl font-bold">{formatTokenAmount(result.trustScore)}</div>
                  <div className="text-sm text-[var(--text-tertiary)]">$ISNAD staked</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 border-t border-[var(--border-dim)]">
                <div>
                  <div className="text-xl sm:text-2xl font-bold">{result.attestations.length}</div>
                  <div className="text-xs sm:text-sm text-[var(--text-tertiary)]">Auditors</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold">
                    {result.resource?.blockNumber.toLocaleString() || '—'}
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--text-tertiary)]">Block Inscribed</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold">
                    {result.attestations.filter(a => a.slashed).length}
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--text-tertiary)]">Slashed</div>
                </div>
              </div>
            </div>

            {/* Audit History */}
            {result.attestations.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-bold mb-4">Audit Chain</h3>
                <div className="space-y-4">
                  {result.attestations.map((attestation) => (
                    <div 
                      key={attestation.id} 
                      className={`flex justify-between items-center py-3 border-b border-[var(--border-dim)] last:border-0 ${
                        attestation.slashed ? 'opacity-50' : ''
                      }`}
                    >
                      <div>
                        <div className="font-mono text-sm">
                          {attestation.auditor.slice(0, 8)}...{attestation.auditor.slice(-6)}
                          {attestation.slashed && (
                            <span className="ml-2 text-[var(--status-red)] text-xs">SLASHED</span>
                          )}
                        </div>
                        <div className="text-sm text-[var(--text-tertiary)]">
                          {attestation.lockDuration / 86400} day lock • 
                          expires {new Date(attestation.lockUntil * 1000).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatTokenAmount(attestation.amount)} $ISNAD</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.attestations.length === 0 && (
              <div className="card text-center py-8 text-[var(--text-tertiary)]">
                <p>No attestations yet. Be the first to audit this resource!</p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!result && (
          <div className="card text-center py-16 text-[var(--text-tertiary)]">
            <p>Enter a resource identifier above to check its trust score</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getTierBadgeClass(tier: string): string {
  switch (tier) {
    case 'TRUSTED': return 'badge-verified';
    case 'VERIFIED': return 'badge-verified';
    case 'COMMUNITY': return 'badge-warning';
    case 'UNVERIFIED': return 'badge-warning';
    default: return '';
  }
}
