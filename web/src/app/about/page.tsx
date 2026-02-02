'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <HeroSection />
      <div className="layout-container py-16">
        <EditorialSection label="Etymology">
          <p className="text-lg text-[var(--text-secondary)] mb-6">
            <strong className="text-[var(--text-primary)]">Isnad</strong> (إسناد) comes from the Islamic scholarly tradition — 
            it's the chain of transmission used to authenticate hadith (sayings of the Prophet). A hadith is only 
            as trustworthy as its chain of narrators. Each narrator must be verified for integrity, 
            memory, and connection to the previous link.
          </p>
          <p className="text-lg text-[var(--text-secondary)]">
            We apply this ancient wisdom to modern AI provenance. A resource is only as trustworthy 
            as its chain of auditors — and unlike traditional isnad, we can see exactly how much 
            each auditor has at stake.
          </p>
        </EditorialSection>

        <EditorialSection label="The Problem">
          <p className="text-lg text-[var(--text-secondary)] mb-6">
            AI agents are proliferating. They increasingly rely on shared resources—skills, 
            configurations, prompts, memory, models—from untrusted sources. A single compromised 
            resource can exfiltrate credentials, corrupt data, manipulate behavior, or compromise 
            entire systems.
          </p>
          <p className="text-lg text-[var(--text-secondary)] mb-6">
            Yet there is no standardized way to assess trust before consumption:
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <ProblemCard approach="Manual code review" limitation="Doesn't scale; most agents can't audit" />
            <ProblemCard approach="Central approval" limitation="Bottleneck; single point of failure" />
            <ProblemCard approach="Reputation scores" limitation="Gameable; new authors can't bootstrap" />
            <ProblemCard approach="Sandboxing" limitation="Incomplete; many resources need real permissions" />
          </div>
          <p className="text-lg font-semibold text-[var(--text-primary)]">
            Without tooling, the answer to "Is this safe?" is always a guess.
          </p>
        </EditorialSection>

        <EditorialSection label="The Solution">
          <p className="text-lg text-[var(--text-secondary)] mb-6">
            <strong className="text-[var(--text-primary)]">$ISNAD</strong> introduces a decentralized trust layer where auditors stake tokens 
            to attest to resource safety. Malicious resources burn stakes; clean resources earn yield. 
            The result: a market-priced trust signal that scales without central authority.
          </p>
          <div className="space-y-4 mb-8">
            <StepCard number="1" title="Resources are inscribed" description="On Base L2 with content and metadata—permanent, censorship-resistant" />
            <StepCard number="2" title="Auditors review and stake" description="Stake $ISNAD tokens to attest to resource safety" />
            <StepCard number="3" title="Stakes are locked" description="For a time period (30-90 days)" />
            <StepCard number="4" title="If issues are detected" description="Jury deliberates, staked tokens are slashed" />
            <StepCard number="5" title="If resource remains clean" description="Auditors earn yield from reward pool" />
          </div>
        </EditorialSection>

        <EditorialSection label="On-Chain Inscriptions">
          <p className="text-lg text-[var(--text-secondary)] mb-6">
            Unlike IPFS-based approaches that require pinning services and external infrastructure, 
            ISNAD inscribes resources directly on <strong className="text-[var(--text-primary)]">Base L2 calldata</strong>:
          </p>
          <div className="grid grid-cols-3 gap-6 mb-8">
            <StatBlock value="~$0.01" label="per KB inscribed" />
            <StatBlock value="Forever" label="on-chain storage" />
            <StatBlock value="Zero" label="external dependencies" />
          </div>
          <div className="card font-mono text-sm">
            <div className="text-[var(--text-tertiary)] mb-2">Inscription format:</div>
            <pre className="whitespace-pre-wrap text-[var(--text-secondary)]">{`ISNAD | v1 | type | flags | metadata | content

type:     SKILL | CONFIG | PROMPT | MEMORY | MODEL | API
flags:    COMPRESSED | ENCRYPTED | CHUNKED | ...
metadata: { name, version, author, contentHash, ... }
content:  raw resource bytes`}</pre>
          </div>
        </EditorialSection>

        <EditorialSection label="Resource Types">
          <p className="text-lg text-[var(--text-secondary)] mb-6">
            ISNAD supports attestation for any content-addressable AI resource:
          </p>
          <div className="card overflow-hidden p-0 mb-6">
            <table className="w-full text-sm">
              <tbody>
                <ResourceTypeRow type="SKILL" description="Executable code packages, tools, API integrations" />
                <ResourceTypeRow type="CONFIG" description="Agent configurations, gateway settings, capabilities" />
                <ResourceTypeRow type="PROMPT" description="System prompts, personas, behavioral instructions" />
                <ResourceTypeRow type="MEMORY" description="Knowledge bases, context files, RAG documents" />
                <ResourceTypeRow type="MODEL" description="Fine-tunes, LoRAs, model adapters" />
                <ResourceTypeRow type="API" description="External service attestations, endpoint integrity" last />
              </tbody>
            </table>
          </div>
          <p className="text-[var(--text-secondary)]">
            Future resource types can be added via governance without protocol upgrades.
          </p>
        </EditorialSection>

        <EditorialSection label="Principles">
          <div className="space-y-6">
            <PrincipleCard title="Skin in the game" description="Auditors risk real value. False attestations have consequences." />
            <PrincipleCard title="Self-selecting expertise" description="Only confident auditors stake. The market filters for competence." />
            <PrincipleCard title="Permanently verifiable" description="Everything on-chain. No trust in external infrastructure." />
            <PrincipleCard title="Future-proof" description="Extensible resource types, versioned protocol, governance upgrades." />
            <PrincipleCard title="Attack resistant" description="Sybil attacks require capital. Collusion burns all colluders." />
          </div>
        </EditorialSection>

        <EditorialSection label="Links">
          <div className="space-y-3">
            <LinkRow href="https://github.com/counterspec/isnad" label="GitHub" description="Source code, whitepaper, discussion" />
            <LinkRow href="https://x.com/isnad_protocol" label="X / Twitter" description="Updates and announcements" />
            <LinkRow href="/docs" label="Documentation" description="Technical guides and API reference" />
          </div>
        </EditorialSection>
      </div>
    </>
  );
}

function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    let imageData: ImageData;

    const resize = () => {
      // Use lower resolution for performance, scale up with CSS
      const scale = 0.25;
      canvas.width = Math.floor(window.innerWidth * scale);
      canvas.height = Math.floor(window.innerHeight * 0.7 * scale);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      imageData = ctx.createImageData(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    // Rocaille shader adapted from @XorDev
    // https://x.com/XorDev/status/2015813875833225715
    const animate = () => {
      time += 0.02;
      const w = canvas.width;
      const h = canvas.height;
      const data = imageData.data;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          // Normalize coordinates (centered, aspect-corrected)
          const px = ((x * 2 - w) / h) * 0.3;
          const py = ((y * 2 - h) / h) * 0.3;

          // Accumulate color channels
          let r = 0, g = 0, b = 0, a = 0;

          for (let i = 1; i <= 10; i++) {
            let vx = px, vy = py;

            // Inner iteration - flow distortion
            for (let f = 1; f <= 9; f++) {
              const newVx = vx + Math.sin(vy * f + i + time) / f;
              const newVy = vy + Math.sin(vx * f + i + time) / f;
              vx = newVx;
              vy = newVy;
            }

            const len = Math.sqrt(vx * vx + vy * vy) + 0.001;
            const intensity = 1 / (6 * len);

            // Color channels offset by phase (golden palette)
            r += (Math.cos(i) + 1) * intensity;
            g += (Math.cos(i + 1) + 1) * intensity;
            b += (Math.cos(i + 2) + 1) * intensity;
            a += (Math.cos(i + 3) + 1) * intensity;
          }

          // Apply tanh-like compression and golden tint
          const tanh = (x: number) => Math.tanh(x * x);
          r = tanh(r) * 0.77;  // Gold: 197/255
          g = tanh(g) * 0.63;  // Gold: 160/255
          b = tanh(b) * 0.35;  // Gold: 89/255

          const idx = (y * w + x) * 4;
          data[idx] = Math.min(255, r * 255);
          data[idx + 1] = Math.min(255, g * 255);
          data[idx + 2] = Math.min(255, b * 255);
          data[idx + 3] = 180; // Semi-transparent
        }
      }

      ctx.putImageData(imageData, 0, 0);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section className="relative h-[70vh] flex flex-col justify-center items-center text-center border-b-2 border-black bg-white overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-75" />
      <div className="relative z-10">
        <div className="text-[180px] font-bold leading-none" style={{ color: '#C5A059', fontFamily: 'serif' }}>
          إسناد
        </div>
        <div className="font-mono text-sm tracking-[0.2em] uppercase mt-4 text-[var(--text-secondary)]">
          The Chain of Attribution
        </div>
      </div>
    </section>
  );
}

function EditorialSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="py-12 border-b border-[var(--border-dim)]">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12">
        <div className="text-sm font-bold uppercase tracking-widest text-[var(--text-primary)] md:sticky md:top-24 h-fit">
          {label}
          <div className="w-10 h-0.5 bg-[#C5A059] mt-2" />
        </div>
        <div>{children}</div>
      </div>
    </section>
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

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm text-[var(--text-tertiary)]">{label}</div>
    </div>
  );
}

function ResourceTypeRow({ type, description, last }: { type: string; description: string; last?: boolean }) {
  return (
    <tr className={last ? '' : 'border-b border-[var(--border-dim)]'}>
      <td className="py-3 px-4 font-mono font-bold">{type}</td>
      <td className="py-3 px-4 text-[var(--text-secondary)]">{description}</td>
    </tr>
  );
}

function PrincipleCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-l-2 border-black pl-4">
      <div className="font-bold mb-1">{title}</div>
      <div className="text-[var(--text-secondary)]">{description}</div>
    </div>
  );
}

function LinkRow({ href, label, description }: { href: string; label: string; description: string }) {
  return (
    <div>
      <Link href={href} className="underline font-semibold">{label}</Link>
      <span className="text-[var(--text-tertiary)]"> — {description}</span>
    </div>
  );
}
