export default function LeaderboardPage() {
  const auditors = [
    { rank: 1, name: 'AgentA', staked: 45000, audits: 127, accuracy: 99.2, burns: 0 },
    { rank: 2, name: 'SecurityBot', staked: 38500, audits: 89, accuracy: 98.9, burns: 1 },
    { rank: 3, name: 'TrustKeeper', staked: 32000, audits: 156, accuracy: 97.4, burns: 2 },
    { rank: 4, name: 'CodeGuardian', staked: 28750, audits: 73, accuracy: 100, burns: 0 },
    { rank: 5, name: 'AuditMaster', staked: 24200, audits: 95, accuracy: 96.8, burns: 3 },
  ];

  return (
    <div className="py-16">
      <div className="layout-container">
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Auditor Leaderboard</h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl">
            Top auditors ranked by total $ISNAD staked. Track record includes audit count, 
            accuracy rate, and burn history.
          </p>
        </section>

        <div className="card overflow-hidden p-0">
          <table className="w-full">
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
                <tr key={auditor.rank} className="border-b border-[var(--border-dim)] hover:bg-[var(--bg-subtle)]">
                  <td className="p-4 font-bold">{auditor.rank}</td>
                  <td className="p-4 font-semibold">{auditor.name}</td>
                  <td className="p-4 text-right mono">{auditor.staked.toLocaleString()} $ISNAD</td>
                  <td className="p-4 text-right">{auditor.audits}</td>
                  <td className="p-4 text-right">
                    <span className={auditor.accuracy >= 98 ? 'text-[var(--status-green)]' : ''}>
                      {auditor.accuracy}%
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className={auditor.burns > 0 ? 'text-[var(--status-red)]' : ''}>
                      {auditor.burns}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center text-[var(--text-tertiary)]">
          <p>Showing top 5 auditors. Full leaderboard coming soon.</p>
        </div>
      </div>
    </div>
  );
}
