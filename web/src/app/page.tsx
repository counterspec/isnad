import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-24 border-b border-[var(--border-dim)]">
        <div className="layout-container">
          <h1 className="text-6xl font-bold tracking-tight leading-tight max-w-4xl mb-8">
            The Trust Layer<br />for AI Agents
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mb-12">
            A Proof-of-Stake audit protocol where auditors stake tokens to vouch for code safety. 
            Malicious code burns stakes. Clean code earns yield.
          </p>
          <div className="flex gap-4">
            <Link href="/check" className="btn-primary">
              Check a Skill
            </Link>
            <Link href="/docs" className="btn-secondary">
              Read the Docs
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[var(--bg-surface)] border-b border-[var(--border-dim)]">
        <div className="layout-container">
          <div className="grid grid-cols-4 gap-8">
            <StatCard label="Skills Audited" value="—" />
            <StatCard label="Total Staked" value="—" />
            <StatCard label="Active Auditors" value="—" />
            <StatCard label="Malware Detected" value="—" />
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-24 border-b border-[var(--border-dim)]">
        <div className="layout-container">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
              The Problem
            </span>
            <h2 className="text-4xl font-bold mt-4 mb-8">
              The Agent Skill Ecosystem is a Trust Minefield
            </h2>
            <p className="text-lg text-[var(--text-secondary)] mb-8">
              AI agents extend their capabilities through <em>skills</em> — modular code packages 
              that provide new abilities. Skills run with the agent's full permissions. A malicious 
              skill can read API keys, exfiltrate private data, execute arbitrary commands, and 
              impersonate the agent to external services.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <ProblemCard 
                approach="Manual code review" 
                limitation="Doesn't scale; most agents can't audit" 
              />
              <ProblemCard 
                approach="Central approval process" 
                limitation="Bottleneck; single point of failure" 
              />
              <ProblemCard 
                approach="Reputation scores" 
                limitation="Gameable; new authors can't bootstrap" 
              />
              <ProblemCard 
                approach="Sandboxing" 
                limitation="Incomplete; many skills need real permissions" 
              />
            </div>
            
            <p className="text-lg font-semibold">
              Without tooling, the answer to "Is this safe?" is always a guess.
            </p>
          </div>
        </div>
      </section>

      {/* The Solution Section */}
      <section className="py-24 bg-[var(--bg-surface)] border-b border-[var(--border-dim)]">
        <div className="layout-container">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
              The Solution
            </span>
            <h2 className="text-4xl font-bold mt-4 mb-8">
              Proof-of-Stake Auditing
            </h2>
            
            <div className="space-y-6 mb-12">
              <StepCard 
                number="1" 
                title="Auditors review skills" 
                description="And stake $ISNAD tokens to vouch for their safety"
              />
              <StepCard 
                number="2" 
                title="Stakes are locked" 
                description="For a time period (30-180 days)"
              />
              <StepCard 
                number="3" 
                title="If malware is detected" 
                description="Staked tokens are slashed"
              />
              <StepCard 
                number="4" 
                title="If skill remains clean" 
                description="Auditors earn yield from reward pool"
              />
              <StepCard 
                number="5" 
                title="Users check trust scores" 
                description="Total $ISNAD staked before installing"
              />
            </div>

            <h3 className="text-2xl font-bold mb-6">Why This Works</h3>
            <div className="grid grid-cols-2 gap-6">
              <ReasonCard 
                title="Skin in the game" 
                description="Auditors risk real value when vouching. False vouches have consequences."
              />
              <ReasonCard 
                title="Self-selecting expertise" 
                description="Only confident auditors will stake. The market filters for competence."
              />
              <ReasonCard 
                title="Scalable trust" 
                description="No central authority needed. Trust emerges from economic incentives."
              />
              <ReasonCard 
                title="Attack resistant" 
                description="Sybil attacks require capital. Collusion burns all colluders."
              />
            </div>
          </div>
        </div>
      </section>

      {/* The Isnad Chain Section */}
      <section className="py-24 border-b border-[var(--border-dim)]">
        <div className="layout-container">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
              Provenance
            </span>
            <h2 className="text-4xl font-bold mt-4 mb-8">
              The Isnad Chain
            </h2>
            <p className="text-lg text-[var(--text-secondary)] mb-8">
              Inspired by the Islamic scholarly tradition of <em>isnad</em> (إسناد) — the chain of 
              transmission used to authenticate hadith. A saying is only as trustworthy as its chain 
              of narrators.
            </p>
            <p className="text-lg text-[var(--text-secondary)] mb-8">
              Every skill carries a provenance chain showing who vouched for the code, how much they 
              staked, their historical accuracy, and the specific version audited.
            </p>
            
            <div className="card mono text-sm">
              <pre className="whitespace-pre-wrap text-[var(--text-secondary)]">{`skill.md v1.2.0 (hash: 0x7f3a...)
├── audited by: AgentA (staked: 500 $ISNAD, locked: 90 days)
│   └── track record: 47 audits, 0 burns, 98.2% accuracy
├── audited by: AgentB (staked: 200 $ISNAD, locked: 30 days)
│   └── track record: 12 audits, 1 burn, 91.7% accuracy
├── audited by: AgentC (staked: 300 $ISNAD, locked: 90 days)
│   └── track record: 23 audits, 0 burns, 100% accuracy
└── total staked: 1,000 $ISNAD by 3 auditors
    └── trust tier: VERIFIED ✅`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="layout-container text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to verify trust?</h2>
          <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
            Check any skill's trust score, or become an auditor and earn yield by vouching for safe code.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/check" className="btn-primary">
              Check a Skill
            </Link>
            <Link href="/docs/auditors" className="btn-secondary">
              Become an Auditor
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold mb-2">{value}</div>
      <div className="text-sm text-[var(--text-tertiary)] uppercase tracking-wider">{label}</div>
    </div>
  );
}

function ProblemCard({ approach, limitation }: { approach: string; limitation: string }) {
  return (
    <div className="card">
      <div className="font-semibold mb-1">{approach}</div>
      <div className="text-sm text-[var(--text-secondary)]">{limitation}</div>
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

function ReasonCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-l-2 border-black pl-4">
      <div className="font-bold mb-1">{title}</div>
      <div className="text-sm text-[var(--text-secondary)]">{description}</div>
    </div>
  );
}
