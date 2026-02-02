'use client';

import { useState } from 'react';
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Find current page label for mobile nav
  const currentPage = sections.flatMap(s => s.items).find(i => i.href === pathname);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
      {/* Mobile Nav Toggle */}
      <div className="md:hidden border-b border-[var(--border-dim)] bg-[var(--bg-surface)] p-4">
        <button 
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="text-sm font-semibold">{currentPage?.label || 'Documentation'}</span>
          <span className="text-xs text-[var(--text-tertiary)]">{mobileNavOpen ? '▲' : '▼'}</span>
        </button>
        
        {mobileNavOpen && (
          <nav className="mt-4 space-y-4">
            {sections.map((section) => (
              <div key={section.title}>
                <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-2">
                  {section.title}
                </div>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={`block py-2 px-3 text-sm rounded transition-colors ${
                          pathname === item.href
                            ? 'bg-black text-white font-semibold'
                            : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        )}
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-[var(--border-dim)] bg-[var(--bg-surface)] p-6 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto hidden md:block shrink-0">
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
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-4xl">
        {children}
      </main>
    </div>
  );
}
