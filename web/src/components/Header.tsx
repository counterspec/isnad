'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [showConnectors, setShowConnectors] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navLinks = [
    { href: '/about', label: 'About' },
    { href: '/check', label: 'Trust Checker' },
    { href: '/stake', label: 'Stake' },
    { href: '/leaderboard', label: 'Auditors' },
    { href: '/docs', label: 'Docs' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[var(--bg-root)] border-b-2 border-black py-4 md:py-6">
      <div className="layout-container flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-3.5 h-3.5 bg-black" />
          <span className="font-bold text-lg tracking-tight">ISNAD_PROTOCOL</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                text-[13px] font-bold uppercase tracking-wider no-underline
                ${pathname === link.href || pathname?.startsWith(link.href + '/') ? 'text-black' : 'text-[var(--text-secondary)]'}
                hover:text-black transition-colors
              `}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Wallet Connection - Desktop */}
          <div className="relative">
            {isConnected ? (
              <button
                onClick={() => disconnect()}
                className="btn-secondary text-xs py-2 px-3 font-mono"
                title="Click to disconnect"
              >
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowConnectors(!showConnectors)}
                  className="btn-primary text-xs py-2 px-4"
                >
                  Connect
                </button>
                {showConnectors && (
                  <div className="absolute right-0 top-full mt-2 bg-white border-2 border-black shadow-[4px_4px_0_0_black] z-50 min-w-[200px]">
                    {connectors.map((connector) => (
                      <button
                        key={connector.uid}
                        onClick={() => {
                          connect({ connector });
                          setShowConnectors(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-[var(--bg-subtle)] border-b border-[var(--border-dim)] last:border-0"
                      >
                        {connector.name}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 -mr-2"
          aria-label="Toggle menu"
        >
          <div className="w-6 h-5 flex flex-col justify-between">
            <span className={`block h-0.5 w-6 bg-black transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 w-6 bg-black transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-6 bg-black transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-black bg-[var(--bg-root)]">
          <div className="layout-container py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  block text-sm font-bold uppercase tracking-wider no-underline py-2
                  ${pathname === link.href || pathname?.startsWith(link.href + '/') ? 'text-black' : 'text-[var(--text-secondary)]'}
                `}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Wallet Connection - Mobile */}
            <div className="pt-4 border-t border-[var(--border-dim)]">
              {isConnected ? (
                <button
                  onClick={() => {
                    disconnect();
                    setMobileMenuOpen(false);
                  }}
                  className="btn-secondary text-xs py-2 px-3 font-mono w-full"
                >
                  {address?.slice(0, 6)}...{address?.slice(-4)} (Disconnect)
                </button>
              ) : (
                <div className="space-y-2">
                  {connectors.map((connector) => (
                    <button
                      key={connector.uid}
                      onClick={() => {
                        connect({ connector });
                        setMobileMenuOpen(false);
                      }}
                      className="btn-primary text-xs py-3 px-4 w-full"
                    >
                      Connect {connector.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
