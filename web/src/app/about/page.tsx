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
              We apply this ancient wisdom to modern code provenance. A skill is only as trustworthy 
              as its chain of auditors — and unlike traditional isnad, we can see exactly how much 
              each auditor has at stake.
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-4">The Problem We Solve</h2>
            <p className="text-[var(--text-secondary)] mb-6">
              AI agents are proliferating. They increasingly rely on shared skills, tools, and code 
              from untrusted sources. A single malicious skill can exfiltrate credentials, corrupt data, 
              or compromise entire systems.
            </p>
            <p className="text-[var(--text-secondary)] mb-6">
              Yet there is no standardized way to assess trust before installation. Manual code review 
              doesn't scale. Central approval processes create bottlenecks. Reputation scores are gameable.
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-4">Our Solution</h2>
            <p className="text-[var(--text-secondary)] mb-6">
              <strong>$ISNAD</strong> introduces a decentralized trust layer where auditors stake tokens 
              to vouch for code safety. Malicious code burns stakes; clean code earns yield. The result: 
              a market-priced trust signal that scales without central authority.
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-4">Principles</h2>
            <ul className="space-y-3 text-[var(--text-secondary)]">
              <li><strong>Skin in the game:</strong> Auditors risk real value. False vouches have consequences.</li>
              <li><strong>Self-selecting expertise:</strong> Only confident auditors stake. The market filters for competence.</li>
              <li><strong>Scalable trust:</strong> No central authority needed. Trust emerges from economic incentives.</li>
              <li><strong>Attack resistant:</strong> Sybil attacks require capital. Collusion burns all colluders.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-12 mb-4">Links</h2>
            <ul className="space-y-2">
              <li>
                <a href="https://github.com/isnad" className="underline">GitHub</a>
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
