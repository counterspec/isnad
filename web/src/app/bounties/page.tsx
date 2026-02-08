'use client';

import Link from 'next/link';

// Bounty tier data
const bountyTiers = [
  {
    emoji: '🔴',
    tier: 'Critical Pattern',
    reward: '1,000 $ISNAD',
    description: 'New detection pattern that catches real malware/exploits',
    color: '#ff3d00',
  },
  {
    emoji: '🟠',
    tier: 'Detection Improvement',
    reward: '500 $ISNAD',
    description: 'False positive fix or accuracy improvement',
    color: '#ff9100',
  },
  {
    emoji: '🟡',
    tier: 'New Scanner Rule',
    reward: '200 $ISNAD',
    description: 'Valid new detection rule with test cases',
    color: '#ffd600',
  },
  {
    emoji: '🟢',
    tier: 'Documentation',
    reward: '100 $ISNAD',
    description: 'Docs, tutorials, translations',
    color: '#00c853',
  },
  {
    emoji: '🔵',
    tier: 'Bug Report',
    reward: '50-200 $ISNAD',
    description: 'Valid bugs in isnad-scan itself',
    color: '#2979ff',
  },
];

// Sample active bounties (static for now)
const activeBounties = [
  {
    id: 1,
    title: 'Detect obfuscated credential exfiltration patterns',
    tier: '🔴 Critical Pattern',
    reward: '1,000 $ISNAD',
    submissions: 2,
    status: 'open',
  },
  {
    id: 2,
    title: 'Reduce false positives on legitimate HTTP clients',
    tier: '🟠 Detection Improvement',
    reward: '500 $ISNAD',
    submissions: 5,
    status: 'open',
  },
  {
    id: 3,
    title: 'Scanner rule for malicious WebSocket handlers',
    tier: '🟡 New Scanner Rule',
    reward: '200 $ISNAD',
    submissions: 0,
    status: 'open',
  },
  {
    id: 4,
    title: 'Chinese language documentation',
    tier: '🟢 Documentation',
    reward: '100 $ISNAD',
    submissions: 1,
    status: 'in-review',
  },
];

// Leaderboard placeholder data
const topContributors = [
  { rank: 1, address: '0x7a16...3f8b', bounties: 12, earned: '8,500 $ISNAD' },
  { rank: 2, address: '0x3d91...e2c4', bounties: 8, earned: '5,200 $ISNAD' },
  { rank: 3, address: '0x9f44...1a7d', bounties: 6, earned: '3,100 $ISNAD' },
  { rank: 4, address: '0x2b88...c5f1', bounties: 4, earned: '1,800 $ISNAD' },
  { rank: 5, address: '0x6e32...9d0a', bounties: 3, earned: '900 $ISNAD' },
];

export default function BountiesPage() {
  return (
    <>
      <HeroSection />
      <div className="layout-container py-16">
        <EditorialSection label="Active Bounties">
          <p className="text-lg text-[var(--text-secondary)] mb-6">
            Current open bounties awaiting submissions. Claim your reward by submitting a solution 
            via GitHub issues with the <code className="mono text-sm bg-[var(--bg-subtle)] px-2 py-1">bounty</code> label.
          </p>
          <div className="space-y-4">
            {activeBounties.map((bounty) => (
              <BountyCard key={bounty.id} bounty={bounty} />
            ))}
          </div>
          <div className="mt-6">
            <Link 
              href="https://github.com/counterspec/isnad/issues?q=is%3Aissue+is%3Aopen+label%3Abounty"
              className="btn-secondary inline-block text-center"
              target="_blank"
            >
              View All on GitHub →
            </Link>
          </div>
        </EditorialSection>

        <EditorialSection label="Bounty Tiers">
          <p className="text-lg text-[var(--text-secondary)] mb-6">
            Bounty rewards are aligned with ISNAD staking tiers. Higher-impact contributions 
            earn proportionally higher rewards.
          </p>
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="border-b-2 border-black bg-[var(--bg-subtle)]">
                <tr>
                  <th className="py-3 px-4 text-left font-bold">Tier</th>
                  <th className="py-3 px-4 text-left font-bold">Reward</th>
                  <th className="py-3 px-4 text-left font-bold hidden sm:table-cell">Description</th>
                </tr>
              </thead>
              <tbody>
                {bountyTiers.map((tier, idx) => (
                  <tr key={tier.tier} className={idx < bountyTiers.length - 1 ? 'border-b border-[var(--border-dim)]' : ''}>
                    <td className="py-3 px-4 font-semibold">
                      <span className="mr-2">{tier.emoji}</span>
                      {tier.tier}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">{tier.reward}</td>
                    <td className="py-3 px-4 text-[var(--text-secondary)] hidden sm:table-cell">{tier.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </EditorialSection>

        <EditorialSection label="Special Bounties">
          <p className="text-lg text-[var(--text-secondary)] mb-6">
            High-value bounties for exceptional contributions to ecosystem security.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SpecialBountyCard
              title="Skill Audit Bounty"
              reward="2,500 $ISNAD"
              description="Find a DANGER-level security issue in a popular ClawHub skill. The skill must have >100 installs and the issue must be verifiable."
              icon="🔍"
            />
            <SpecialBountyCard
              title="Bypass Bounty"
              reward="5,000 $ISNAD"
              description="Demonstrate a detection evasion technique that bypasses isnad-scan. Requires responsible disclosure and working proof-of-concept."
              icon="🛡️"
            />
          </div>
        </EditorialSection>

        <EditorialSection label="How to Submit">
          <div className="space-y-6">
            <StepCard 
              number="1" 
              title="Find a bounty" 
              description="Browse active bounties above or check GitHub issues with the bounty label" 
            />
            <StepCard 
              number="2" 
              title="Do the work" 
              description="Write the detection pattern, fix the bug, or create the documentation" 
            />
            <StepCard 
              number="3" 
              title="Submit via GitHub" 
              description="Open an issue or PR with your submission, including tests and documentation" 
            />
            <StepCard 
              number="4" 
              title="Review period" 
              description="Core team reviews submissions (typically 3-7 days)" 
            />
            <StepCard 
              number="5" 
              title="Get paid" 
              description="Approved submissions receive $ISNAD tokens to your connected wallet" 
            />
          </div>
          <div className="mt-8">
            <Link 
              href="https://github.com/counterspec/isnad/issues/new?labels=bounty&template=bounty_submission.md"
              className="btn-primary inline-block text-center"
              target="_blank"
            >
              Submit a Bounty Claim
            </Link>
          </div>
        </EditorialSection>

        <EditorialSection label="Leaderboard">
          <p className="text-lg text-[var(--text-secondary)] mb-6">
            Top contributors who've earned $ISNAD through bounties.
          </p>
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="border-b-2 border-black bg-[var(--bg-subtle)]">
                <tr>
                  <th className="py-3 px-4 text-left font-bold w-16">Rank</th>
                  <th className="py-3 px-4 text-left font-bold">Address</th>
                  <th className="py-3 px-4 text-right font-bold hidden sm:table-cell">Bounties</th>
                  <th className="py-3 px-4 text-right font-bold">Earned</th>
                </tr>
              </thead>
              <tbody>
                {topContributors.map((contributor, idx) => (
                  <tr key={contributor.address} className={idx < topContributors.length - 1 ? 'border-b border-[var(--border-dim)]' : ''}>
                    <td className="py-3 px-4">
                      {contributor.rank === 1 && '🥇'}
                      {contributor.rank === 2 && '🥈'}
                      {contributor.rank === 3 && '🥉'}
                      {contributor.rank > 3 && `#${contributor.rank}`}
                    </td>
                    <td className="py-3 px-4 font-mono">{contributor.address}</td>
                    <td className="py-3 px-4 text-right text-[var(--text-secondary)] hidden sm:table-cell">{contributor.bounties}</td>
                    <td className="py-3 px-4 text-right font-bold">{contributor.earned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-[var(--text-tertiary)] mt-4">
            Leaderboard updates weekly. Connect your wallet to see your position.
          </p>
        </EditorialSection>

        <EditorialSection label="Rules & Eligibility">
          <div className="space-y-4">
            <RuleItem title="Original work only" description="Submissions must be your own work. Plagiarism results in permanent ban." />
            <RuleItem title="One submission per bounty" description="Submit your best work once. Multiple low-effort submissions are discouraged." />
            <RuleItem title="Working code required" description="All code submissions must include tests and pass CI." />
            <RuleItem title="Responsible disclosure" description="Security vulnerabilities must be reported privately first via security@isnad.md." />
            <RuleItem title="English documentation" description="Code comments and docs must be in English. Translations count as Documentation bounties." />
            <RuleItem title="Core team decision is final" description="Bounty approval is at the discretion of the ISNAD core team." />
          </div>
          <div className="mt-8 p-4 bg-[var(--bg-subtle)] border-l-4 border-black">
            <p className="text-sm text-[var(--text-secondary)]">
              <strong className="text-[var(--text-primary)]">Note:</strong> Bounties are paid in $ISNAD tokens on Base L2. 
              You'll need a connected wallet to receive payment. Tokens are subject to the same vesting 
              schedule as staking rewards.
            </p>
          </div>
        </EditorialSection>
      </div>
    </>
  );
}

function HeroSection() {
  return (
    <section className="relative bg-black text-white py-16 sm:py-20 md:py-24 border-b-2 border-black overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.1) 2px,
            rgba(255,255,255,0.1) 4px
          )`
        }} />
      </div>
      <div className="layout-container relative z-10">
        <div className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-4">
          Bug Bounty Program
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
          Earn $ISNAD by securing<br />the agent ecosystem
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mb-8">
          Find vulnerabilities, improve detection patterns, and contribute to the protocol. 
          Get rewarded in $ISNAD tokens for every valid submission.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="#active-bounties" className="btn-primary bg-white text-black border-white hover:bg-transparent hover:text-white">
            View Bounties
          </Link>
          <Link 
            href="https://github.com/counterspec/isnad" 
            className="btn-secondary border-white text-white hover:bg-white hover:text-black"
            target="_blank"
          >
            GitHub →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-800">
          <StatBlock value="19,500+" label="$ISNAD paid" />
          <StatBlock value="47" label="bounties claimed" />
          <StatBlock value="23" label="contributors" />
        </div>
      </div>
    </section>
  );
}

function EditorialSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section id={label.toLowerCase().replace(/\s+/g, '-')} className="py-8 md:py-12 border-b border-[var(--border-dim)]">
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] xl:grid-cols-[280px_1fr] gap-6 lg:gap-12">
        <div className="text-sm font-bold uppercase tracking-widest text-[var(--text-primary)] lg:sticky lg:top-24 h-fit">
          {label}
          <div className="w-10 h-0.5 bg-[#C5A059] mt-2" />
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

function BountyCard({ bounty }: { bounty: typeof activeBounties[0] }) {
  return (
    <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex-1">
        <div className="text-xs font-mono text-[var(--text-tertiary)] mb-1">{bounty.tier}</div>
        <div className="font-semibold text-lg">{bounty.title}</div>
        <div className="text-sm text-[var(--text-secondary)] mt-1">
          {bounty.submissions} submission{bounty.submissions !== 1 ? 's' : ''} · 
          <span className={bounty.status === 'open' ? ' text-[var(--status-green)]' : ' text-[var(--status-warn)]'}>
            {' '}{bounty.status === 'open' ? 'Open' : 'In Review'}
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono font-bold text-xl">{bounty.reward}</div>
      </div>
    </div>
  );
}

function SpecialBountyCard({ title, reward, description, icon }: { title: string; reward: string; description: string; icon: string }) {
  return (
    <div className="card border-2 border-[#C5A059]">
      <div className="text-3xl mb-3">{icon}</div>
      <div className="font-bold text-lg mb-1">{title}</div>
      <div className="font-mono font-bold text-[#C5A059] mb-3">{reward}</div>
      <div className="text-sm text-[var(--text-secondary)]">{description}</div>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-6 items-start">
      <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-lg shrink-0">
        {number}
      </div>
      <div>
        <div className="font-bold text-lg">{title}</div>
        <div className="text-[var(--text-secondary)]">{description}</div>
      </div>
    </div>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center sm:text-left">
      <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">{value}</div>
      <div className="text-xs sm:text-sm text-gray-400">{label}</div>
    </div>
  );
}

function RuleItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-l-2 border-black pl-4">
      <div className="font-bold mb-1">{title}</div>
      <div className="text-[var(--text-secondary)]">{description}</div>
    </div>
  );
}
