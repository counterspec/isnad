import { CodeBlock } from '@/components/CodeBlock';

export default function QuickstartPage() {
  return (
    <article>
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight">Quick Start</h1>
      <p className="text-lg text-[var(--text-secondary)] mb-8">
        Check your first resource's trust score in under 2 minutes.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        1. Via Web Interface
      </h2>
      <p className="text-[var(--text-secondary)] mb-4">
        The fastest way to check trust is through the web app:
      </p>
      <ol className="list-decimal list-inside space-y-2 text-[var(--text-secondary)] mb-6">
        <li>Go to <a href="/check" className="underline">Trust Checker</a></li>
        <li>Paste a skill URL, package name, or content hash</li>
        <li>View the trust score, tier, and auditor chain</li>
      </ol>

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        2. Via API
      </h2>
      <p className="text-[var(--text-secondary)] mb-4">
        Query trust scores programmatically:
      </p>
      <CodeBlock 
        lines={[
          '<span class="text-[var(--text-tertiary)]"># Get trust info for a resource</span>',
          'curl https://api.isnad.md/api/v1/trust/0x1234...abcd',
          '',
          '<span class="text-[var(--text-tertiary)]"># Response</span>',
          '{',
          '  "trustScore": "2500000000000000000000",',
          '  "trustTier": "VERIFIED",',
          '  "attestations": [...]',
          '}',
        ]}
      />

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        3. Via Smart Contract
      </h2>
      <p className="text-[var(--text-secondary)] mb-4">
        Read trust scores directly from the chain:
      </p>
      <CodeBlock 
        lines={[
          '<span class="font-bold">import</span> { ISNADStaking } <span class="font-bold">from</span> <span class="italic">"@isnad/contracts"</span>;',
          '',
          '<span class="font-bold">const</span> staking = ISNADStaking.attach(STAKING_ADDRESS);',
          '<span class="font-bold">const</span> score = <span class="font-bold">await</span> staking.getTrustScore(resourceHash);',
          '<span class="font-bold">const</span> tier = <span class="font-bold">await</span> staking.getTrustTier(resourceHash);',
        ]}
      />

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Computing Content Hashes
      </h2>
      <p className="text-[var(--text-secondary)] mb-4">
        ISNAD uses SHA-256 for content hashing. To compute a hash locally:
      </p>
      <CodeBlock 
        lines={[
          '<span class="text-[var(--text-tertiary)]"># Using OpenSSL</span>',
          'cat skill.md | sha256sum',
          '',
          '<span class="text-[var(--text-tertiary)]"># Using Node.js</span>',
          '<span class="font-bold">const</span> crypto = require(<span class="italic">"crypto"</span>);',
          '<span class="font-bold">const</span> hash = crypto.createHash(<span class="italic">"sha256"</span>)',
          '  .update(content)',
          '  .digest(<span class="italic">"hex"</span>);',
        ]}
      />

      <div className="card bg-[var(--bg-subtle)] mt-8">
        <h3 className="font-bold mb-2">Next: Become an Auditor</h3>
        <p className="text-[var(--text-secondary)]">
          Ready to stake and earn yield? See the <a href="/docs/auditors" className="underline">Auditor Guide</a>.
        </p>
      </div>
    </article>
  );
}
