'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sections = [
  {
    title: 'Getting Started',
    items: [
      { href: '/docs', label: 'Introduction' },
      { href: '/docs/quickstart', label: 'Quick Start' },
      { href: '/docs/tiers', label: 'Trust Tiers' },
    ]
  },
  {
    title: 'For Auditors',
    items: [
      { href: '/docs/auditors', label: 'Becoming an Auditor' },
      { href: '/docs/staking', label: 'Staking Guide' },
      { href: '/docs/slashing', label: 'Detection & Slashing' },
    ]
  },
  {
    title: 'Technical',
    items: [
      { href: '/docs/contracts', label: 'Smart Contracts' },
      { href: '/docs/api', label: 'API Reference' },
      { href: '/docs/integration', label: 'Integration Guide' },
    ]
  },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--border-dim)] bg-[var(--bg-surface)] p-6 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto hidden md:block">
        {sections.map((section) => (
          <div key={section.title} className="mb-6">
            <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-3">
              {section.title}
            </div>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block py-1.5 px-3 text-sm rounded transition-colors ${
                      pathname === item.href
                        ? 'bg-black text-white font-semibold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 max-w-4xl">
        {children}
      </main>
    </div>
  );
}
