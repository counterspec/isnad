import { CodeBlock } from '@/components/CodeBlock';

export default function DocsIntroPage() {
  return (
    <article>
      <span className="inline-block bg-black text-white px-2 py-0.5 text-xs font-mono mb-3">
        v1.0.0-BETA
      </span>
      <h1 className="text-4xl font-bold mb-6 tracking-tight">Introduction to ISNAD</h1>
      
      <p className="text-lg text-[var(--text-secondary)] mb-8">
        ISNAD is the decentralized trust layer for AI resources. The protocol provides a 
        cryptographic framework to ensure that AI code behaves exactly as intended, backed 
        by economic incentives and on-chain audits.
      </p>

      <h2 id="how-it-works" className="text-2xl font-bold mt-12 mb-4 pb-2 border-b border-[var(--border-dim)]">
        How it Works
      </h2>
      <p className="text-[var(--text-secondary)] mb-4">
        The core of the protocol relies on <strong>Proof-of-Stake Attestation</strong>. When a resource 
        is inscribed on-chain, auditors can stake $ISNAD tokens to vouch for its safety. The more stake 
        behind a resource, the higher its trust score.
      </p>

      <CodeBlock 
        lines={[
          '<span class="text-[var(--text-tertiary)]">// Check trust score before loading a skill</span>',
          '<span class="font-bold">const</span> trust = <span class="font-bold">await</span> isnad.getTrust(skillHash);',
          '',
          '<span class="font-bold">if</span> (trust.tier === <span class="italic">"VERIFIED"</span>) {',
          '  <span class="text-[var(--text-tertiary)]">// Safe to execute</span>',
          '  <span class="font-bold">await</span> skill.execute(params);',
          '} <span class="font-bold">else</span> {',
          '  console.warn(<span class="italic">"Unverified skill - proceed with caution"</span>);',
          '}',
        ]}
      />

      <h2 id="trust-tiers" className="text-2xl font-bold mt-12 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Trust Tiers
      </h2>
      <p className="text-[var(--text-secondary)] mb-4">
        Resources are classified into tiers based on total weighted stake:
      </p>
      <div className="card overflow-hidden p-0 mb-6">
        <table className="w-full text-sm">
          <thead className="border-b-2 border-black">
            <tr>
              <th className="text-left p-3 font-bold">Tier</th>
              <th className="text-left p-3 font-bold">Min Stake</th>
              <th className="text-left p-3 font-bold">Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[var(--border-dim)]">
              <td className="p-3 font-mono">UNVERIFIED</td>
              <td className="p-3">0</td>
              <td className="p-3 text-[var(--text-secondary)]">No auditor attestations</td>
            </tr>
            <tr className="border-b border-[var(--border-dim)]">
              <td className="p-3 font-mono">COMMUNITY</td>
              <td className="p-3">100 $ISNAD</td>
              <td className="p-3 text-[var(--text-secondary)]">Some community trust</td>
            </tr>
            <tr className="border-b border-[var(--border-dim)]">
              <td className="p-3 font-mono">VERIFIED</td>
              <td className="p-3">1,000 $ISNAD</td>
              <td className="p-3 text-[var(--text-secondary)]">Multiple auditors with significant stake</td>
            </tr>
            <tr>
              <td className="p-3 font-mono">TRUSTED</td>
              <td className="p-3">10,000 $ISNAD</td>
              <td className="p-3 text-[var(--text-secondary)]">High-confidence, heavily audited</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="key-concepts" className="text-2xl font-bold mt-12 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Key Concepts
      </h2>
      
      <h3 className="text-lg font-bold mt-6 mb-2">Resources</h3>
      <p className="text-[var(--text-secondary)] mb-4">
        Any content-addressable AI artifact: skills, configs, prompts, memory, models, APIs. 
        Resources are inscribed on Base L2 with a SHA-256 content hash for permanent verification.
      </p>

      <h3 className="text-lg font-bold mt-6 mb-2">Attestations</h3>
      <p className="text-[var(--text-secondary)] mb-4">
        When an auditor stakes tokens on a resource, they create an attestation. Each attestation 
        includes the stake amount and lock duration (30-90 days). Longer locks earn higher multipliers.
      </p>

      <h3 className="text-lg font-bold mt-6 mb-2">Slashing</h3>
      <p className="text-[var(--text-secondary)] mb-4">
        If a resource is found to be malicious, any user can flag it. A jury of randomly selected 
        auditors reviews the evidence. If found guilty, all stakes on that resource are burned.
      </p>

      <h3 className="text-lg font-bold mt-6 mb-2">Yield</h3>
      <p className="text-[var(--text-secondary)] mb-4">
        Auditors who stake on clean resources earn yield from the reward pool. Yield scales with 
        stake amount and lock duration—incentivizing longer commitments.
      </p>

      <h2 id="next-steps" className="text-2xl font-bold mt-12 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Next Steps
      </h2>
      <ul className="space-y-2 text-[var(--text-secondary)]">
        <li>→ <a href="/docs/quickstart" className="underline">Quick Start</a> — Check your first resource in 2 minutes</li>
        <li>→ <a href="/docs/auditors" className="underline">Become an Auditor</a> — Start staking and earning yield</li>
        <li>→ <a href="/docs/contracts" className="underline">Smart Contracts</a> — Explore the on-chain architecture</li>
      </ul>
    </article>
  );
}
