export default function AuditorsPage() {
  return (
    <article>
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight">Becoming an Auditor</h1>
      <p className="text-lg text-[var(--text-secondary)] mb-8">
        Auditors stake $ISNAD tokens to vouch for resource safety and earn yield for accurate attestations.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Requirements
      </h2>
      <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)] mb-6">
        <li>Hold $ISNAD tokens on Base network</li>
        <li>Wallet connected to the ISNAD app</li>
        <li>Ability to assess code safety (skills, configs, prompts)</li>
        <li>Willingness to lock tokens for 30-90 days</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        How It Works
      </h2>
      <div className="space-y-4 mb-8">
        <Step num="1" title="Review a Resource" desc="Read the code, check for malicious patterns, verify the author's claims." />
        <Step num="2" title="Stake Your Tokens" desc="Choose an amount and lock duration. More stake + longer lock = higher yield." />
        <Step num="3" title="Create Attestation" desc="Your stake is recorded on-chain, contributing to the resource's trust score." />
        <Step num="4" title="Wait for Lock Period" desc="Your tokens are locked. If the resource is flagged, you may be slashed." />
        <Step num="5" title="Claim Rewards" desc="After the lock expires, claim your tokens + earned yield from the reward pool." />
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Earning Potential
      </h2>
      <p className="text-[var(--text-secondary)] mb-4">
        Yield is calculated based on:
      </p>
      <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)] mb-6">
        <li><strong>Stake amount</strong> — More tokens = higher base yield</li>
        <li><strong>Lock duration</strong> — 30d = 1x, 60d = 1.25x, 90d = 1.5x, 180d = 2x, 365d = 3x</li>
        <li><strong>Pool APY</strong> — Currently ~10% base APY (adjustable via governance)</li>
      </ul>
      <div className="card bg-[var(--bg-subtle)]">
        <p className="font-mono text-sm">
          Example: 1,000 $ISNAD staked for 90 days at 10% APY<br/>
          → Base yield: 1000 × 0.10 × (90/365) = 24.66 $ISNAD<br/>
          → With 1.5x multiplier: 36.99 $ISNAD
        </p>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Risks
      </h2>
      <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)]">
        <li><strong>Slashing:</strong> If a resource you attested is found malicious, your stake is burned</li>
        <li><strong>Lock period:</strong> Tokens cannot be withdrawn until the lock expires</li>
        <li><strong>Smart contract risk:</strong> Protocol bugs could affect your funds</li>
      </ul>

      <div className="card bg-[var(--bg-subtle)] mt-8">
        <h3 className="font-bold mb-2">Ready to stake?</h3>
        <p className="text-[var(--text-secondary)]">
          See the <a href="/docs/staking" className="underline">Staking Guide</a> for step-by-step instructions.
        </p>
      </div>
    </article>
  );
}

function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold shrink-0">{num}</div>
      <div>
        <div className="font-bold">{title}</div>
        <div className="text-[var(--text-secondary)] text-sm">{desc}</div>
      </div>
    </div>
  );
}
