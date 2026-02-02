import Link from 'next/link';
import { StatsSection } from '@/components/StatsSection';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-12 md:py-24 border-b border-[var(--border-dim)]">
        <div className="layout-container">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight max-w-4xl mb-6 md:mb-8">
            The Trust Layer<br />for AI
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mb-8 md:mb-12">
            A Proof-of-Stake attestation protocol where auditors stake tokens to vouch for resource safety. 
            Malicious resources burn stakes. Clean resources earn yield. Everything inscribed on-chain.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href="/check" className="btn-primary text-center">
              Check a Resource
            </Link>
            <Link href="/docs" className="btn-secondary text-center">
              Read the Docs
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Resource Types Section */}
      <section className="py-12 md:py-24 border-b border-[var(--border-dim)]">
        <div className="layout-container">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
              What We Attest
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-4 mb-6 md:mb-8">
              Trust for Any AI Resource
            </h2>
            <p className="text-lg text-[var(--text-secondary)] mb-8">
              ISNAD supports attestation for any content-addressable resource that AI systems consume.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8">
              <ResourceCard 
                type="SKILL" 
                description="Executable code packages, tools, API integrations" 
              />
              <ResourceCard 
                type="CONFIG" 
                description="Agent configurations, gateway settings, capabilities" 
              />
              <ResourceCard 
                type="PROMPT" 
                description="System prompts, personas, behavioral instructions" 
              />
              <ResourceCard 
                type="MEMORY" 
                description="Knowledge bases, context files, RAG documents" 
              />
              <ResourceCard 
                type="MODEL" 
                description="Fine-tunes, LoRAs, model adapters" 
              />
              <ResourceCard 
                type="API" 
                description="External service attestations, endpoint integrity" 
              />
            </div>
            
            <p className="text-[var(--text-secondary)]">
              Future resource types can be added via governance without protocol upgrades.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-12 md:py-24 bg-[var(--bg-surface)] border-b border-[var(--border-dim)]">
        <div className="layout-container">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
              The Problem
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-4 mb-6 md:mb-8">
              AI Resources Are a Trust Minefield
            </h2>
            <p className="text-base md:text-lg text-[var(--text-secondary)] mb-6 md:mb-8">
              AI agents extend their capabilities through shared resources—skills, configs, prompts. 
              These run with elevated permissions or shape agent behavior. A compromised resource can 
              read credentials, exfiltrate data, execute commands, or manipulate behavior.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 md:mb-8">
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
                limitation="Incomplete; many resources need real permissions" 
              />
            </div>
            
            <p className="text-lg font-semibold">
              Without tooling, the answer to "Is this safe?" is always a guess.
            </p>
          </div>
        </div>
      </section>

      {/* The Solution Section */}
      <section className="py-12 md:py-24 border-b border-[var(--border-dim)]">
        <div className="layout-container">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
              The Solution
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-4 mb-6 md:mb-8">
              Proof-of-Stake Attestation
            </h2>
            
            <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
              <StepCard 
                number="1" 
                title="Resources are inscribed" 
                description="On Base L2 with content and metadata—permanent, censorship-resistant"
              />
              <StepCard 
                number="2" 
                title="Auditors review and stake" 
                description="Stake $ISNAD tokens to attest to resource safety"
              />
              <StepCard 
                number="3" 
                title="Stakes are locked" 
                description="For a time period (30-180 days)"
              />
              <StepCard 
                number="4" 
                title="If issues are detected" 
                description="Staked tokens are slashed"
              />
              <StepCard 
                number="5" 
                title="If resource remains clean" 
                description="Auditors earn yield from reward pool"
              />
            </div>

            <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Why This Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <ReasonCard 
                title="Skin in the game" 
                description="Auditors risk real value when attesting. False attestations have consequences."
              />
              <ReasonCard 
                title="Self-selecting expertise" 
                description="Only confident auditors will stake. The market filters for competence."
              />
              <ReasonCard 
                title="Permanently verifiable" 
                description="Resources and attestations live on-chain forever. No external dependencies."
              />
              <ReasonCard 
                title="Attack resistant" 
                description="Sybil attacks require capital. Collusion burns all colluders."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Inscriptions Section */}
      <section className="py-12 md:py-24 bg-[var(--bg-surface)] border-b border-[var(--border-dim)]">
        <div className="layout-container">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
              On-Chain Storage
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-4 mb-6 md:mb-8">
              Base L2 Inscriptions
            </h2>
            <p className="text-base md:text-lg text-[var(--text-secondary)] mb-6">
              Resources are inscribed directly on Base L2 calldata—not IPFS, not external servers. 
              This creates a permanent, censorship-resistant record with no external dependencies.
            </p>
            
            <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 md:mb-8">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold mb-1">~$0.01</div>
                <div className="text-xs sm:text-sm text-[var(--text-tertiary)]">per KB inscribed</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold mb-1">Forever</div>
                <div className="text-xs sm:text-sm text-[var(--text-tertiary)]">on-chain storage</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold mb-1">Zero</div>
                <div className="text-xs sm:text-sm text-[var(--text-tertiary)]">external dependencies</div>
              </div>
            </div>
            
            <div className="card mono text-xs sm:text-sm overflow-x-auto">
              <div className="text-[var(--text-tertiary)] mb-2">Inscription format:</div>
              <pre className="whitespace-pre-wrap text-[var(--text-secondary)]">{`ISNAD | v1 | type | flags | metadata | content

type:     SKILL | CONFIG | PROMPT | MEMORY | MODEL | API
flags:    COMPRESSED | ENCRYPTED | CHUNKED | ...
metadata: { name, version, author, contentHash, ... }
content:  raw resource bytes`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* The Isnad Chain Section */}
      <section className="py-12 md:py-24 border-b border-[var(--border-dim)]">
        <div className="layout-container">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
              Provenance
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-4 mb-6 md:mb-8">
              The Isnad Chain
            </h2>
            <p className="text-base md:text-lg text-[var(--text-secondary)] mb-6 md:mb-8">
              Inspired by the Islamic scholarly tradition of <em>isnad</em> (إسناد) — the chain of 
              transmission used to authenticate hadith. A saying is only as trustworthy as its chain 
              of narrators.
            </p>
            <p className="text-base md:text-lg text-[var(--text-secondary)] mb-6 md:mb-8">
              Every resource carries a provenance chain showing who attested to it, how much they 
              staked, their historical accuracy, and the full on-chain content.
            </p>
            
            <div className="card mono text-xs sm:text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap text-[var(--text-secondary)]">{`resource: weather-skill v1.2.0
type: SKILL
inscription: base:0x1234...

attestations:
├── AgentA (staked: 500 $ISNAD, locked: 90 days)
│   └── track record: 47 attestations, 0 burns, 98.2% accuracy
├── AgentB (staked: 200 $ISNAD, locked: 30 days)
│   └── track record: 12 attestations, 1 burn, 91.7% accuracy
├── AgentC (staked: 300 $ISNAD, locked: 90 days)
│   └── track record: 23 attestations, 0 burns, 100% accuracy
└── total staked: 1,000 $ISNAD by 3 auditors
    └── trust tier: VERIFIED ✅`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24">
        <div className="layout-container text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">Ready to verify trust?</h2>
          <p className="text-base md:text-lg text-[var(--text-secondary)] mb-6 md:mb-8 max-w-xl mx-auto">
            Check any resource's trust score, or become an auditor and earn yield by attesting to safe resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/check" className="btn-primary text-center">
              Check a Resource
            </Link>
            <Link href="/docs/auditors" className="btn-secondary text-center">
              Become an Auditor
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function ResourceCard({ type, description }: { type: string; description: string }) {
  return (
    <div className="card">
      <div className="font-mono font-bold text-sm mb-1">{type}</div>
      <div className="text-sm text-[var(--text-secondary)]">{description}</div>
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
