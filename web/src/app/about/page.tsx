export default function AboutPage() {
  return (
    <div className="py-16">
      <div className="layout-container">
        <section className="mb-16 max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">About ISNAD</h1>
          
          <div className="prose prose-lg">
            <h2 className="text-2xl font-bold mt-8 mb-4">The Name</h2>
            <p className="text-[var(--text-secondary)] mb-6">
              <strong>Isnad</strong> (إسناد) comes from the Islamic scholarly tradition — it's the chain 
              of transmission used to authenticate hadith (sayings of the Prophet). A hadith is only 
              as trustworthy as its chain of narrators. Each narrator must be verified for integrity, 
              memory, and connection to the previous link.
            </p>
            <p className="text-[var(--text-secondary)] mb-6">
              We apply this ancient wisdom to modern AI provenance. A resource is only as trustworthy 
              as its chain of auditors — and unlike traditional isnad, we can see exactly how much 
              each auditor has at stake.
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-4">The Problem We Solve</h2>
            <p className="text-[var(--text-secondary)] mb-6">
              AI agents are proliferating. They increasingly rely on shared resources—skills, 
              configurations, prompts, memory, models—from untrusted sources. A single compromised 
              resource can exfiltrate credentials, corrupt data, manipulate behavior, or compromise 
              entire systems.
            </p>
            <p className="text-[var(--text-secondary)] mb-6">
              Yet there is no standardized way to assess trust before consumption. Manual code review 
              doesn't scale. Central approval processes create bottlenecks. Reputation scores are gameable.
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-4">Our Solution</h2>
            <p className="text-[var(--text-secondary)] mb-6">
              <strong>$ISNAD</strong> introduces a decentralized trust layer where auditors stake tokens 
              to attest to resource safety. Malicious resources burn stakes; clean resources earn yield. 
              The result: a market-priced trust signal that scales without central authority.
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-4">On-Chain Inscriptions</h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Unlike IPFS-based approaches that require pinning services and external infrastructure, 
              ISNAD inscribes resources directly on <strong>Base L2 calldata</strong>:
            </p>
            <ul className="space-y-2 text-[var(--text-secondary)] mb-6 list-disc pl-6">
              <li><strong>~$0.01 per KB</strong> to inscribe</li>
              <li><strong>Permanent storage</strong> — content lives on-chain forever</li>
              <li><strong>Censorship-resistant</strong> — no external dependencies</li>
              <li><strong>Verifiable</strong> — transaction hash proves content</li>
            </ul>
            <p className="text-[var(--text-secondary)] mb-6">
              Both the resource content AND the attestations live on-chain together. No IPFS pinning, 
              no servers to maintain, no single points of failure.
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-4">Resource Types</h2>
            <p className="text-[var(--text-secondary)] mb-4">
              ISNAD supports attestation for any content-addressable AI resource:
            </p>
            <div className="card mb-6">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-[var(--border-dim)]">
                    <td className="py-2 font-mono font-bold">SKILL</td>
                    <td className="py-2 text-[var(--text-secondary)]">Executable code packages, tools, API integrations</td>
                  </tr>
                  <tr className="border-b border-[var(--border-dim)]">
                    <td className="py-2 font-mono font-bold">CONFIG</td>
                    <td className="py-2 text-[var(--text-secondary)]">Agent configurations, gateway settings, capabilities</td>
                  </tr>
                  <tr className="border-b border-[var(--border-dim)]">
                    <td className="py-2 font-mono font-bold">PROMPT</td>
                    <td className="py-2 text-[var(--text-secondary)]">System prompts, personas, behavioral instructions</td>
                  </tr>
                  <tr className="border-b border-[var(--border-dim)]">
                    <td className="py-2 font-mono font-bold">MEMORY</td>
                    <td className="py-2 text-[var(--text-secondary)]">Knowledge bases, context files, RAG documents</td>
                  </tr>
                  <tr className="border-b border-[var(--border-dim)]">
                    <td className="py-2 font-mono font-bold">MODEL</td>
                    <td className="py-2 text-[var(--text-secondary)]">Fine-tunes, LoRAs, model adapters</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono font-bold">API</td>
                    <td className="py-2 text-[var(--text-secondary)]">External service attestations, endpoint integrity</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[var(--text-secondary)] mb-6">
              Future resource types can be added via governance without protocol upgrades.
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-4">Principles</h2>
            <ul className="space-y-3 text-[var(--text-secondary)]">
              <li><strong>Skin in the game:</strong> Auditors risk real value. False attestations have consequences.</li>
              <li><strong>Self-selecting expertise:</strong> Only confident auditors stake. The market filters for competence.</li>
              <li><strong>Permanently verifiable:</strong> Everything on-chain. No trust in external infrastructure.</li>
              <li><strong>Future-proof:</strong> Extensible resource types, versioned protocol, governance upgrades.</li>
              <li><strong>Attack resistant:</strong> Sybil attacks require capital. Collusion burns all colluders.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-12 mb-4">Links</h2>
            <ul className="space-y-2">
              <li>
                <a href="https://github.com/counterspec/isnad" className="underline">GitHub</a>
                <span className="text-[var(--text-tertiary)]"> — Source code, whitepaper, discussion</span>
              </li>
              <li>
                <a href="https://twitter.com/isnad_protocol" className="underline">Twitter/X</a>
                <span className="text-[var(--text-tertiary)]"> — Updates and announcements</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
