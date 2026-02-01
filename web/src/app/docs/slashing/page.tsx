export default function SlashingPage() {
  return (
    <article>
      <h1 className="text-4xl font-bold mb-6 tracking-tight">Detection & Slashing</h1>
      <p className="text-lg text-[var(--text-secondary)] mb-8">
        How malicious resources are flagged, reviewed, and how slashing works.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Flagging a Resource
      </h2>
      <p className="text-[var(--text-secondary)] mb-4">
        Anyone can flag a resource they believe is malicious by depositing 100 $ISNAD:
      </p>
      <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)] mb-6">
        <li>Deposit prevents spam flags</li>
        <li>If guilty: deposit returned + reward from slashed stakes</li>
        <li>If innocent: deposit partially returned (90%)</li>
        <li>If no supermajority: deposit 50% returned</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Jury System
      </h2>
      <p className="text-[var(--text-secondary)] mb-4">
        When a resource is flagged, a jury of 5 auditors is randomly selected:
      </p>
      <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)] mb-6">
        <li>Jurors cannot have stake in the flagged resource (conflict of interest)</li>
        <li>Selection uses on-chain randomness (VRF in production)</li>
        <li>Jurors have 7 days to review evidence and vote</li>
        <li>Supermajority (≥67%) required for verdict</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Verdict Outcomes
      </h2>
      <div className="space-y-4 mb-8">
        <VerdictCard 
          verdict="GUILTY"
          description="Resource is malicious. All stakes are burned. Flagger gets deposit back."
        />
        <VerdictCard 
          verdict="INNOCENT"
          description="Resource is safe. Stakes remain. Flagger gets 90% of deposit back."
        />
        <VerdictCard 
          verdict="DISMISSED"
          description="No supermajority reached. Stakes remain. Flagger gets 50% back."
        />
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Appeals
      </h2>
      <p className="text-[var(--text-secondary)] mb-4">
        Verdicts can be appealed within 3 days:
      </p>
      <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)] mb-6">
        <li>Requires 2x the original flag deposit</li>
        <li>New jury selected for re-trial</li>
        <li>Appeal verdict is final</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        What Gets You Slashed
      </h2>
      <p className="text-[var(--text-secondary)] mb-4">
        Resources that may result in slashing:
      </p>
      <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)]">
        <li><strong>Data exfiltration:</strong> Sending credentials, PII, or sensitive data externally</li>
        <li><strong>Unauthorized execution:</strong> Running commands outside declared scope</li>
        <li><strong>Behavior manipulation:</strong> Altering agent behavior maliciously</li>
        <li><strong>Supply chain attacks:</strong> Compromised dependencies</li>
        <li><strong>Misrepresentation:</strong> Metadata claiming safe behavior that differs from code</li>
      </ul>

      <div className="card bg-[var(--bg-subtle)] mt-8">
        <h3 className="font-bold mb-2">Avoid Getting Slashed</h3>
        <p className="text-[var(--text-secondary)]">
          Only stake on resources you've thoroughly reviewed. When in doubt, don't stake.
          Your reputation and tokens depend on accurate attestations.
        </p>
      </div>
    </article>
  );
}

function VerdictCard({ verdict, description }: { verdict: string; description: string }) {
  const color = verdict === 'GUILTY' ? 'text-red-600' : verdict === 'INNOCENT' ? 'text-green-600' : 'text-[var(--text-tertiary)]';
  return (
    <div className="card">
      <span className={`font-mono font-bold ${color}`}>{verdict}</span>
      <p className="text-[var(--text-secondary)] mt-1">{description}</p>
    </div>
  );
}
