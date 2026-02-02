import { CodeBlock } from '@/components/CodeBlock';

export default function StakingPage() {
  return (
    <article>
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight">Staking Guide</h1>
      <p className="text-lg text-[var(--text-secondary)] mb-8">
        Step-by-step guide to staking $ISNAD and creating attestations.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Prerequisites
      </h2>
      <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)] mb-6">
        <li>$ISNAD tokens in your wallet</li>
        <li>ETH for gas fees on Base</li>
        <li>Wallet connected (MetaMask, WalletConnect, etc.)</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Step 1: Find a Resource
      </h2>
      <p className="text-[var(--text-secondary)] mb-4">
        Use the <a href="/check" className="underline">Trust Checker</a> to find resources that need attestations.
        Look for resources with low or no stake that you're confident are safe.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Step 2: Review the Code
      </h2>
      <p className="text-[var(--text-secondary)] mb-4">
        <strong>This is critical.</strong> Before staking, thoroughly review:
      </p>
      <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)] mb-6">
        <li>Source code for malicious patterns</li>
        <li>External API calls and data exfiltration</li>
        <li>Permission requests and capability requirements</li>
        <li>Dependencies and their safety</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Step 3: Approve Token Spend
      </h2>
      <p className="text-[var(--text-secondary)] mb-4">
        Before staking, approve the staking contract to spend your tokens:
      </p>
      <CodeBlock 
        lines={[
          '<span class="text-[var(--text-tertiary)]">// Approve staking contract</span>',
          '<span class="font-bold">await</span> isnadToken.approve(STAKING_ADDRESS, amount);',
        ]}
      />

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Step 4: Create Attestation
      </h2>
      <p className="text-[var(--text-secondary)] mb-4">
        Call the stake function with resource hash, amount, and lock duration:
      </p>
      <CodeBlock 
        lines={[
          '<span class="font-bold">await</span> staking.stake(',
          '  resourceHash,  <span class="text-[var(--text-tertiary)]">// bytes32</span>',
          '  amount,        <span class="text-[var(--text-tertiary)]">// uint256 (in wei)</span>',
          '  lockDuration   <span class="text-[var(--text-tertiary)]">// uint256 (seconds, 30-90 days)</span>',
          ');',
        ]}
      />

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Step 5: Monitor & Unstake
      </h2>
      <p className="text-[var(--text-secondary)] mb-4">
        After your lock period expires, you can withdraw your stake plus earned yield:
      </p>
      <CodeBlock 
        lines={[
          '<span class="text-[var(--text-tertiary)]">// Unstake after lock expires</span>',
          '<span class="font-bold">await</span> staking.unstake(attestationId);',
          '',
          '<span class="text-[var(--text-tertiary)]">// Claim rewards from pool</span>',
          '<span class="font-bold">await</span> rewardPool.claimRewards();',
        ]}
      />

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Staking Limits
      </h2>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm min-w-[500px]">
          <tbody>
            <tr className="border-b border-[var(--border-dim)]">
              <td className="p-3 font-bold">Max per auditor</td>
              <td className="p-3">10,000 $ISNAD total across all attestations</td>
            </tr>
            <tr className="border-b border-[var(--border-dim)]">
              <td className="p-3 font-bold">Concentration cap</td>
              <td className="p-3">No single auditor can have &gt;33% of a resource's stake</td>
            </tr>
            <tr>
              <td className="p-3 font-bold">Lock range</td>
              <td className="p-3">Minimum 7 days, maximum 90 days</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  );
}
