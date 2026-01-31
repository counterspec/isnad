import Link from 'next/link';

export default function DocsPage() {
  const sections = [
    {
      title: 'Getting Started',
      items: [
        { label: 'Introduction', href: '/docs/intro', description: 'What is $ISNAD and why it matters' },
        { label: 'Quick Start', href: '/docs/quickstart', description: 'Check your first skill in 2 minutes' },
        { label: 'Trust Tiers', href: '/docs/tiers', description: 'Understanding VERIFIED, AUDITED, and UNVERIFIED' },
      ]
    },
    {
      title: 'For Auditors',
      items: [
        { label: 'Becoming an Auditor', href: '/docs/auditors', description: 'Requirements and onboarding' },
        { label: 'Staking Guide', href: '/docs/staking', description: 'How to stake, lock periods, and yield' },
        { label: 'Detection & Slashing', href: '/docs/slashing', description: 'What triggers a burn and how to avoid it' },
      ]
    },
    {
      title: 'Technical',
      items: [
        { label: 'Smart Contracts', href: '/docs/contracts', description: 'On-chain architecture and addresses' },
        { label: 'API Reference', href: '/docs/api', description: 'Endpoints for trust lookups and audits' },
        { label: 'Integration Guide', href: '/docs/integration', description: 'Add trust checks to your agent' },
      ]
    },
  ];

  return (
    <div className="py-16">
      <div className="layout-container">
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl">
            Everything you need to understand, use, and build on the ISNAD protocol.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-4">
                {section.title}
              </h2>
              <div className="space-y-4">
                {section.items.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className="block card hover:border-[var(--text-secondary)] transition-colors no-underline"
                  >
                    <div className="font-bold mb-1">{item.label}</div>
                    <div className="text-sm text-[var(--text-secondary)]">{item.description}</div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <section className="mt-16 card bg-[var(--bg-subtle)]">
          <h3 className="text-lg font-bold mb-2">Can't find what you need?</h3>
          <p className="text-[var(--text-secondary)]">
            Check the <Link href="https://github.com/isnad" className="underline">GitHub repo</Link> for 
            the whitepaper, implementation details, and discussion.
          </p>
        </section>
      </div>
    </div>
  );
}
