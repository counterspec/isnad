import { CodeBlock } from '@/components/CodeBlock';

export default function IntegrationPage() {
  return (
    <article>
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight">Integration Guide</h1>
      <p className="text-lg text-[var(--text-secondary)] mb-8">
        Add ISNAD trust checks to your AI agent or application.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Quick Integration
      </h2>
      <p className="text-[var(--text-secondary)] mb-4">
        The simplest integration: check trust before loading any external resource.
      </p>
      <CodeBlock 
        lines={[
          '<span class="font-bold">async function</span> loadSkillWithTrustCheck(skillUrl) {',
          '  <span class="text-[var(--text-tertiary)]">// 1. Fetch the skill content</span>',
          '  <span class="font-bold">const</span> content = <span class="font-bold">await</span> fetch(skillUrl).then(r => r.text());',
          '  ',
          '  <span class="text-[var(--text-tertiary)]">// 2. Compute content hash</span>',
          '  <span class="font-bold">const</span> hash = await crypto.subtle.digest(',
          '    <span class="italic">"SHA-256"</span>,',
          '    <span class="font-bold">new</span> TextEncoder().encode(content)',
          '  );',
          '  <span class="font-bold">const</span> hashHex = <span class="italic">"0x"</span> + [...<span class="font-bold">new</span> Uint8Array(hash)]',
          '    .map(b => b.toString(16).padStart(2, <span class="italic">"0"</span>)).join(<span class="italic">""</span>);',
          '  ',
          '  <span class="text-[var(--text-tertiary)]">// 3. Check trust score</span>',
          '  <span class="font-bold">const</span> trust = <span class="font-bold">await</span> fetch(',
          '    `https://api.isnad.md/api/v1/trust/${hashHex}`',
          '  ).then(r => r.json());',
          '  ',
          '  <span class="text-[var(--text-tertiary)]">// 4. Enforce minimum tier</span>',
          '  <span class="font-bold">if</span> (trust.trustTier === <span class="italic">"UNVERIFIED"</span>) {',
          '    <span class="font-bold">throw new</span> Error(<span class="italic">"Skill not verified - refusing to load"</span>);',
          '  }',
          '  ',
          '  <span class="font-bold">return</span> { content, trust };',
          '}',
        ]}
      />

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        OpenClaw Integration
      </h2>
      <p className="text-[var(--text-secondary)] mb-4">
        For OpenClaw agents, add trust checks to your skill loader:
      </p>
      <CodeBlock 
        lines={[
          '<span class="text-[var(--text-tertiary)]"># In your AGENTS.md or skill loading logic</span>',
          '',
          '<span class="font-bold">Before loading any skill:</span>',
          '1. Compute SHA-256 hash of SKILL.md content',
          '2. Query api.isnad.md/api/v1/trust/{hash}',
          '3. Require tier >= COMMUNITY for execution',
          '4. Log trust score for audit trail',
        ]}
      />

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        On-Chain Integration
      </h2>
      <p className="text-[var(--text-secondary)] mb-4">
        For trustless verification, read directly from the smart contract:
      </p>
      <CodeBlock 
        lines={[
          '<span class="font-bold">import</span> { createPublicClient, http } <span class="font-bold">from</span> <span class="italic">"viem"</span>;',
          '<span class="font-bold">import</span> { baseSepolia } <span class="font-bold">from</span> <span class="italic">"viem/chains"</span>;',
          '<span class="font-bold">import</span> { ISNADStakingABI } <span class="font-bold">from</span> <span class="italic">"@isnad/contracts"</span>;',
          '',
          '<span class="font-bold">const</span> client = createPublicClient({',
          '  chain: baseSepolia,',
          '  transport: http(),',
          '});',
          '',
          '<span class="font-bold">const</span> trustScore = <span class="font-bold">await</span> client.readContract({',
          '  address: STAKING_ADDRESS,',
          '  abi: ISNADStakingABI,',
          '  functionName: <span class="italic">"getTrustScore"</span>,',
          '  args: [resourceHash],',
          '});',
          '',
          '<span class="font-bold">const</span> tier = <span class="font-bold">await</span> client.readContract({',
          '  address: STAKING_ADDRESS,',
          '  abi: ISNADStakingABI,',
          '  functionName: <span class="italic">"getTrustTier"</span>,',
          '  args: [resourceHash],',
          '});',
        ]}
      />

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Trust Policy Examples
      </h2>
      <p className="text-[var(--text-secondary)] mb-4">
        Configure trust requirements based on your risk tolerance:
      </p>
      
      <h3 className="text-lg font-bold mt-6 mb-2">Conservative (High Security)</h3>
      <CodeBlock 
        lines={[
          '<span class="font-bold">const</span> POLICY = {',
          '  minTier: <span class="italic">"TRUSTED"</span>,',
          '  minScore: 10000,',
          '  minAuditors: 3,',
          '  allowUnverified: <span class="font-bold">false</span>,',
          '};',
        ]}
      />

      <h3 className="text-lg font-bold mt-6 mb-2">Standard (Balanced)</h3>
      <CodeBlock 
        lines={[
          '<span class="font-bold">const</span> POLICY = {',
          '  minTier: <span class="italic">"VERIFIED"</span>,',
          '  minScore: 1000,',
          '  minAuditors: 2,',
          '  allowUnverified: <span class="font-bold">false</span>,',
          '};',
        ]}
      />

      <h3 className="text-lg font-bold mt-6 mb-2">Permissive (Development)</h3>
      <CodeBlock 
        lines={[
          '<span class="font-bold">const</span> POLICY = {',
          '  minTier: <span class="italic">"COMMUNITY"</span>,',
          '  minScore: 100,',
          '  minAuditors: 1,',
          '  allowUnverified: <span class="font-bold">true</span>, <span class="text-[var(--text-tertiary)]">// with warning</span>',
          '};',
        ]}
      />

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Best Practices
      </h2>
      <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)]">
        <li><strong>Cache trust scores</strong> — Refresh every few minutes, not every request</li>
        <li><strong>Log decisions</strong> — Record what was loaded and its trust level for auditing</li>
        <li><strong>Fail closed</strong> — If the API is unavailable, don't load unverified resources</li>
        <li><strong>Pin content hashes</strong> — Store the hash you verified, not just the URL</li>
        <li><strong>Monitor for slashing</strong> — Subscribe to contract events for resources you use</li>
      </ul>

      <div className="card bg-[var(--bg-subtle)] mt-8">
        <h3 className="font-bold mb-2">Need Help?</h3>
        <p className="text-[var(--text-secondary)]">
          Reach out on <a href="https://x.com/isnadprotocol" className="underline">Twitter</a> or open an issue on{' '}
          <a href="https://github.com/counterspec/isnad" className="underline">GitHub</a>.
        </p>
      </div>
    </article>
  );
}
