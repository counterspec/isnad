'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { keccak256, toBytes } from 'viem';
import Link from 'next/link';
import { 
  useTokenBalance, 
  useTokenAllowance, 
  useTokenApproval, 
  useStake,
  useAuditorTotalStake,
  useAuditorAttestations,
  LOCK_MULTIPLIERS 
} from '@/hooks/useStaking';
import { useAttestation } from '@/hooks/useISNAD';
import { api, TrustInfo, formatTokenAmount } from '@/lib/api';

export default function StakePage() {
  const { address, isConnected } = useAccount();
  const { balance, isLoading: balanceLoading, refetch: refetchBalance } = useTokenBalance(address);
  const { allowance, refetch: refetchAllowance } = useTokenAllowance(address);
  const { totalStake } = useAuditorTotalStake(address);
  const { attestationIds, refetch: refetchAttestations } = useAuditorAttestations(address);
  
  const { approve, isPending: approvePending, isConfirming: approveConfirming, isSuccess: approveSuccess } = useTokenApproval();
  const { stake, isPending: stakePending, isConfirming: stakeConfirming, isSuccess: stakeSuccess, error: stakeError } = useStake();

  const [resourceInput, setResourceInput] = useState('');
  const [amount, setAmount] = useState('');
  const [lockDuration, setLockDuration] = useState(30);
  const [resourceInfo, setResourceInfo] = useState<TrustInfo | null>(null);
  const [resourceHash, setResourceHash] = useState<`0x${string}` | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [step, setStep] = useState<'lookup' | 'approve' | 'stake' | 'success'>('lookup');

  // Refresh data after successful operations
  useEffect(() => {
    if (approveSuccess) {
      refetchAllowance();
    }
  }, [approveSuccess, refetchAllowance]);

  useEffect(() => {
    if (stakeSuccess) {
      refetchBalance();
      refetchAttestations();
      setStep('success');
    }
  }, [stakeSuccess, refetchBalance, refetchAttestations]);

  const handleLookup = async () => {
    if (!resourceInput.trim()) return;
    
    setLookupLoading(true);
    try {
      let hash = resourceInput.trim();
      if (!hash.startsWith('0x')) {
        hash = keccak256(toBytes(resourceInput.trim()));
      }
      setResourceHash(hash as `0x${string}`);
      
      const data = await api.getTrust(hash);
      setResourceInfo(data);
      
      if (data.resource) {
        setStep('approve');
      }
    } catch (err) {
      console.error('Lookup error:', err);
      setResourceInfo(null);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleApprove = () => {
    if (!amount) return;
    approve(amount);
  };

  const handleStake = () => {
    if (!resourceHash || !amount) return;
    stake(resourceHash, amount, lockDuration);
  };

  const needsApproval = Number(amount) > allowance;
  const canStake = Number(amount) > 0 && Number(amount) <= balance && !needsApproval;

  if (!isConnected) {
    return (
      <div className="py-16">
        <div className="layout-container">
          <section className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Stake $ISNAD</h1>
            <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-2xl">
              Connect your wallet to stake tokens and create attestations.
            </p>
          </section>
          
          <div className="card text-center py-16">
            <p className="text-lg font-semibold mb-4">Connect Wallet to Continue</p>
            <p className="text-[var(--text-secondary)]">
              You need to connect a wallet with $ISNAD tokens to stake on resources.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="layout-container">
        {/* Header */}
        <section className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Stake $ISNAD</h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl">
            Stake tokens to attest to resource safety and earn yield.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Staking Form */}
          <div className="lg:col-span-2 space-y-6">
            {step === 'success' ? (
              <div className="card">
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">✓</div>
                  <h2 className="text-2xl font-bold mb-2">Attestation Created!</h2>
                  <p className="text-[var(--text-secondary)] mb-6">
                    Your stake has been locked for {lockDuration} days.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button 
                      onClick={() => {
                        setStep('lookup');
                        setResourceInput('');
                        setAmount('');
                        setResourceInfo(null);
                      }}
                      className="btn-secondary"
                    >
                      Stake Another
                    </button>
                    <Link href="/leaderboard" className="btn-primary">
                      View Leaderboard
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Step 1: Resource Lookup */}
                <div className="card">
                  <h2 className="text-xl font-bold mb-4">1. Find Resource</h2>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={resourceInput}
                      onChange={(e) => setResourceInput(e.target.value)}
                      placeholder="Enter hash, URL, or package name..."
                      className="flex-1 px-4 py-3 border-2 border-black font-mono text-sm focus:outline-none"
                      disabled={step !== 'lookup'}
                    />
                    <button 
                      onClick={handleLookup}
                      disabled={lookupLoading || !resourceInput.trim()}
                      className="btn-primary"
                    >
                      {lookupLoading ? 'Looking up...' : 'Lookup'}
                    </button>
                  </div>
                  
                  {resourceInfo && (
                    <div className="mt-6 pt-6 border-t border-[var(--border-dim)]">
                      {resourceInfo.resource ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-lg">{resourceInfo.resource.name || 'Unknown Resource'}</div>
                              <div className="text-sm text-[var(--text-tertiary)] font-mono">
                                {resourceInfo.resource.type} • {resourceInfo.resource.hash.slice(0, 16)}...
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{resourceInfo.trustTier}</div>
                              <div className="text-sm text-[var(--text-tertiary)]">
                                {formatTokenAmount(resourceInfo.trustScore)} staked
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-[var(--text-secondary)]">
                            {resourceInfo.attestations.length} existing attestation(s)
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="font-semibold text-[var(--status-yellow)]">Resource Not Inscribed</p>
                          <p className="text-sm text-[var(--text-secondary)] mt-1">
                            This resource hasn't been inscribed on ISNAD yet. You can still stake on its hash.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Step 2: Amount & Duration */}
                {(step === 'approve' || step === 'stake') && (
                  <div className="card">
                    <h2 className="text-xl font-bold mb-4">2. Set Stake Amount</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Amount ($ISNAD)</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="flex-1 px-4 py-3 border-2 border-black font-mono text-lg focus:outline-none"
                            min="0"
                            max={balance}
                          />
                          <button 
                            onClick={() => setAmount(balance.toString())}
                            className="btn-secondary text-sm"
                          >
                            MAX
                          </button>
                        </div>
                        <div className="text-sm text-[var(--text-tertiary)] mt-1">
                          Balance: {balanceLoading ? '...' : balance.toLocaleString()} $ISNAD
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Lock Duration</label>
                        <div className="grid grid-cols-2 gap-2">
                          {LOCK_MULTIPLIERS.map((option) => (
                            <button
                              key={option.days}
                              onClick={() => setLockDuration(option.days)}
                              className={`p-3 border-2 text-left transition-colors ${
                                lockDuration === option.days 
                                  ? 'border-black bg-black text-white' 
                                  : 'border-[var(--border-dim)] hover:border-black'
                              }`}
                            >
                              <div className="font-bold">{option.label}</div>
                              {option.multiplier > 1 && (
                                <div className="text-xs opacity-75">Higher yield</div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Approve & Stake */}
                {(step === 'approve' || step === 'stake') && amount && (
                  <div className="card">
                    <h2 className="text-xl font-bold mb-4">3. Confirm Transaction</h2>
                    
                    {needsApproval ? (
                      <div className="space-y-4">
                        <p className="text-[var(--text-secondary)]">
                          First, approve the staking contract to spend your tokens.
                        </p>
                        <button 
                          onClick={handleApprove}
                          disabled={approvePending || approveConfirming}
                          className="btn-primary w-full"
                        >
                          {approvePending ? 'Confirm in Wallet...' : 
                           approveConfirming ? 'Confirming...' : 
                           `Approve ${amount} $ISNAD`}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-[var(--bg-subtle)] p-4 rounded text-sm">
                          <div className="flex justify-between mb-2">
                            <span>Amount:</span>
                            <span className="font-mono">{amount} $ISNAD</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span>Lock Duration:</span>
                            <span>{lockDuration} days</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span>Resource:</span>
                            <span className="font-mono text-xs">{resourceHash?.slice(0, 16)}...</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-[var(--border-dim)]">
                            <span className="font-semibold">Unlocks:</span>
                            <span>{new Date(Date.now() + lockDuration * 86400000).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <button 
                          onClick={handleStake}
                          disabled={!canStake || stakePending || stakeConfirming}
                          className="btn-primary w-full"
                        >
                          {stakePending ? 'Confirm in Wallet...' : 
                           stakeConfirming ? 'Confirming...' : 
                           'Create Attestation'}
                        </button>
                        
                        {stakeError && (
                          <p className="text-sm text-red-600">
                            Error: {stakeError.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Stats */}
            <div className="card">
              <h3 className="font-bold mb-4">Your Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Balance</span>
                  <span className="font-mono">{balance.toLocaleString()} $ISNAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Total Staked</span>
                  <span className="font-mono">{totalStake.toLocaleString()} $ISNAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Active Attestations</span>
                  <span className="font-mono">{attestationIds.length}</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="card">
              <h3 className="font-bold mb-4">Resources</h3>
              <div className="space-y-2 text-sm">
                <Link href="/docs/auditors" className="block text-[var(--text-secondary)] hover:text-black underline">
                  → Becoming an Auditor
                </Link>
                <Link href="/docs/staking" className="block text-[var(--text-secondary)] hover:text-black underline">
                  → Staking Guide
                </Link>
                <Link href="/docs/slashing" className="block text-[var(--text-secondary)] hover:text-black underline">
                  → Slashing & Risks
                </Link>
              </div>
            </div>

            {/* Active Attestations */}
            {attestationIds.length > 0 && (
              <div className="card">
                <h3 className="font-bold mb-4">Your Attestations</h3>
                <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
                  {attestationIds.slice(0, 5).map((id) => (
                    <AttestationRow key={id} attestationId={id} />
                  ))}
                  {attestationIds.length > 5 && (
                    <p className="text-[var(--text-tertiary)] text-center pt-2">
                      +{attestationIds.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AttestationRow({ attestationId }: { attestationId: `0x${string}` }) {
  const { attestation, isLoading } = useAttestation(attestationId);
  
  if (isLoading || !attestation) {
    return <div className="py-2 text-[var(--text-tertiary)]">Loading...</div>;
  }
  
  const isExpired = attestation.lockUntil * 1000 < Date.now();
  
  return (
    <div className={`py-2 border-b border-[var(--border-dim)] last:border-0 ${attestation.slashed ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-center">
        <span className="font-mono text-xs">{attestationId.slice(0, 10)}...</span>
        <span className={`text-xs ${attestation.slashed ? 'text-red-600' : isExpired ? 'text-green-600' : ''}`}>
          {attestation.slashed ? 'SLASHED' : isExpired ? 'UNLOCKED' : `${attestation.lockDuration / 86400}d`}
        </span>
      </div>
      <div className="text-xs text-[var(--text-tertiary)]">
        {attestation.amount.toLocaleString()} $ISNAD
      </div>
    </div>
  );
}
