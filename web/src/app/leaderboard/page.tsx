'use client';

import { useAuditors } from '@/hooks/useAuditors';

export default function LeaderboardPage() {
  const { auditors, isLoading, error } = useAuditors(20);

  return (
    <div className="py-16">
      <div className="layout-container">
        <section className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Auditor Leaderboard</h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl">
            Top auditors ranked by total $ISNAD staked. Track record includes audit count, 
            accuracy rate, and burn history.
          </p>
        </section>

        {error && (
          <div className="card text-center py-12 text-[var(--text-tertiary)]">
            <p>Unable to load leaderboard</p>
          </div>
        )}

        {isLoading && (
          <div className="card text-center py-12">
            <p>Loading auditors...</p>
          </div>
        )}

        {!isLoading && !error && auditors.length === 0 && (
          <div className="card text-center py-12 text-[var(--text-tertiary)]">
            <p>No auditors yet. Be the first to stake and attest!</p>
          </div>
        )}

        {!isLoading && !error && auditors.length > 0 && (
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left p-4 font-bold text-sm uppercase tracking-wider">Rank</th>
                  <th className="text-left p-4 font-bold text-sm uppercase tracking-wider">Auditor</th>
                  <th className="text-right p-4 font-bold text-sm uppercase tracking-wider">Total Staked</th>
                  <th className="text-right p-4 font-bold text-sm uppercase tracking-wider">Audits</th>
                  <th className="text-right p-4 font-bold text-sm uppercase tracking-wider">Accuracy</th>
                  <th className="text-right p-4 font-bold text-sm uppercase tracking-wider">Burns</th>
                </tr>
              </thead>
              <tbody>
                {auditors.map((auditor) => (
                  <tr key={auditor.address} className="border-b border-[var(--border-dim)] hover:bg-[var(--bg-subtle)]">
                    <td className="p-4 font-bold">{auditor.rank}</td>
                    <td className="p-4 font-mono text-sm" title={auditor.address}>
                      {auditor.shortAddress}
                    </td>
                    <td className="p-4 text-right mono">{auditor.totalStaked} $ISNAD</td>
                    <td className="p-4 text-right">{auditor.attestationCount}</td>
                    <td className="p-4 text-right">
                      <span className={auditor.accuracy >= 98 ? 'text-[var(--status-green)]' : ''}>
                        {auditor.accuracy.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className={auditor.burnCount > 0 ? 'text-[var(--status-red)]' : ''}>
                        {auditor.burnCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-[var(--text-tertiary)]">
          <p>Showing top {auditors.length} auditors by stake.</p>
        </div>
      </div>
    </div>
  );
}
