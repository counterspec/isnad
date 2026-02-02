export default function TiersPage() {
  return (
    <article>
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight">Trust Tiers</h1>
      <p className="text-lg text-[var(--text-secondary)] mb-8">
        Resources are classified into tiers based on the total weighted stake from auditors.
      </p>

      <div className="space-y-6">
        <TierCard 
          name="UNVERIFIED"
          threshold="0 $ISNAD"
          color="var(--text-tertiary)"
          description="No auditor attestations. Use with extreme caution or not at all."
          use="Testing, development, or when you've personally audited the code."
        />
        <TierCard 
          name="COMMUNITY"
          threshold="100+ $ISNAD"
          color="#666"
          description="Some community trust, but limited stake backing."
          use="Low-risk operations, sandboxed environments, or with additional review."
        />
        <TierCard 
          name="VERIFIED"
          threshold="1,000+ $ISNAD"
          color="#22c55e"
          description="Multiple auditors with significant stake. Reasonable confidence."
          use="Standard production use for most applications."
        />
        <TierCard 
          name="TRUSTED"
          threshold="10,000+ $ISNAD"
          color="#000"
          description="Heavily audited with substantial economic backing."
          use="High-security environments, critical infrastructure."
        />
      </div>

      <h2 className="text-2xl font-bold mt-12 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Lock Duration Multipliers
      </h2>
      <p className="text-[var(--text-secondary)] mb-4">
        Trust scores account for lock duration. Longer locks indicate stronger conviction:
      </p>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="border-b-2 border-black">
            <tr>
              <th className="text-left p-3 font-bold">Lock Period</th>
              <th className="text-left p-3 font-bold">Multiplier</th>
              <th className="text-left p-3 font-bold">Example</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[var(--border-dim)]">
              <td className="p-3">7 days</td>
              <td className="p-3 font-mono">1.0x</td>
              <td className="p-3 text-[var(--text-secondary)]">100 stake → 100 score</td>
            </tr>
            <tr className="border-b border-[var(--border-dim)]">
              <td className="p-3">30 days</td>
              <td className="p-3 font-mono">1.5x</td>
              <td className="p-3 text-[var(--text-secondary)]">100 stake → 150 score</td>
            </tr>
            <tr>
              <td className="p-3">90 days</td>
              <td className="p-3 font-mono">2.0x</td>
              <td className="p-3 text-[var(--text-secondary)]">100 stake → 200 score</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold mt-12 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Why Tiers Matter
      </h2>
      <p className="text-[var(--text-secondary)] mb-4">
        Tiers provide a quick signal for how much economic backing a resource has. Higher tiers mean:
      </p>
      <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)]">
        <li>More tokens at risk if the resource is malicious</li>
        <li>More auditors have reviewed and vouched for it</li>
        <li>Longer average lock periods (stronger conviction)</li>
        <li>Higher cost to game or manipulate</li>
      </ul>
    </article>
  );
}

function TierCard({ name, threshold, color, description, use }: {
  name: string;
  threshold: string;
  color: string;
  description: string;
  use: string;
}) {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-3">
        <span className="font-mono font-bold text-lg" style={{ color }}>{name}</span>
        <span className="text-sm text-[var(--text-tertiary)]">≥ {threshold}</span>
      </div>
      <p className="text-[var(--text-secondary)] mb-2">{description}</p>
      <p className="text-sm"><strong>When to use:</strong> {use}</p>
    </div>
  );
}
