'use client';

import { useStats } from '@/hooks/useStats';

export function StatsSection() {
  const { formatted, isLoading, error } = useStats();

  if (error) {
    return (
      <section className="py-16 bg-[var(--bg-surface)] border-b border-[var(--border-dim)]">
        <div className="layout-container">
          <div className="text-center text-[var(--text-tertiary)]">
            Unable to load stats
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-[var(--bg-surface)] border-b border-[var(--border-dim)]">
      <div className="layout-container">
        <div className="grid grid-cols-4 gap-8">
          <StatCard 
            label="Resources Attested" 
            value={isLoading ? '—' : formatted?.resources || '0'} 
          />
          <StatCard 
            label="Total Staked" 
            value={isLoading ? '—' : `${formatted?.totalStaked || '0'} $ISNAD`} 
          />
          <StatCard 
            label="Active Auditors" 
            value={isLoading ? '—' : formatted?.auditors || '0'} 
          />
          <StatCard 
            label="Attestations" 
            value={isLoading ? '—' : formatted?.attestations || '0'} 
          />
        </div>
      </div>
    </section>
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
