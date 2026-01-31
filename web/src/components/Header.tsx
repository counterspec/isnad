'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  
  const navLinks = [
    { href: '/check', label: 'Trust Checker' },
    { href: '/leaderboard', label: 'Auditors' },
    { href: '/docs', label: 'Documentation' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[var(--bg-root)] border-b-2 border-black py-6">
      <div className="layout-container flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-3.5 h-3.5 bg-black" />
          <span className="font-bold text-lg tracking-tight">ISNAD_PROTOCOL</span>
        </Link>
        
        <div className="flex gap-12">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                text-[13px] font-bold uppercase tracking-wider no-underline
                ${pathname === link.href ? 'text-black' : 'text-[var(--text-secondary)]'}
                hover:text-black transition-colors
              `}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
