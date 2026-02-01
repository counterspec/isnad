/**
 * ISNAD Oracle Client - Submit flags to the oracle contract
 */

import { createPublicClient, createWalletClient, http, type Address, type Hash } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia, base } from 'viem/chains';
import { createHash } from 'crypto';
import type { AnalysisResult } from './analyzer.js';

// Contract ABIs (minimal for flagging)
const ORACLE_ABI = [
  {
    name: 'flagResource',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'resourceHash', type: 'bytes32' },
      { name: 'evidenceHash', type: 'bytes32' }
    ],
    outputs: [{ name: 'flagId', type: 'bytes32' }]
  },
  {
    name: 'minFlagDeposit',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }]
  }
] as const;

export interface OracleConfig {
  privateKey: string;
  oracleAddress: Address;
  network: 'testnet' | 'mainnet';
  rpcUrl?: string;
}

export interface FlagSubmission {
  resourceHash: Hash;
  evidenceHash: Hash;
  txHash: Hash;
  flagId: Hash;
}

/**
 * Create evidence package from analysis result
 */
export function createEvidencePackage(result: AnalysisResult): string {
  const evidence = {
    version: '1.0',
    scanner: '@isnad/scanner',
    timestamp: result.analyzedAt,
    resourceHash: result.resourceHash,
    contentHash: result.contentHash,
    riskScore: result.riskScore,
    riskLevel: result.riskLevel,
    confidence: result.confidence,
    findings: result.findings.map(f => ({
      id: f.patternId,
      severity: f.severity,
      category: f.category,
      line: f.line,
      match: f.match.substring(0, 100),
      context: f.context.substring(0, 200)
    })),
    summary: result.summary
  };

  return JSON.stringify(evidence, null, 2);
}

/**
 * Hash evidence package for on-chain storage
 */
export function hashEvidence(evidence: string): Hash {
  const hash = createHash('sha256').update(evidence).digest('hex');
  return `0x${hash}` as Hash;
}

/**
 * Submit flag to oracle contract
 */
export async function submitFlag(
  config: OracleConfig,
  result: AnalysisResult
): Promise<FlagSubmission> {
  const chain = config.network === 'mainnet' ? base : baseSepolia;
  const rpcUrl = config.rpcUrl || (config.network === 'mainnet' 
    ? 'https://mainnet.base.org'
    : 'https://sepolia.base.org');

  const account = privateKeyToAccount(config.privateKey as `0x${string}`);
  
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl)
  });

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(rpcUrl)
  });

  // Get minimum deposit
  const minDeposit = await publicClient.readContract({
    address: config.oracleAddress,
    abi: ORACLE_ABI,
    functionName: 'minFlagDeposit'
  });

  // Create and hash evidence
  const evidence = createEvidencePackage(result);
  const evidenceHash = hashEvidence(evidence);

  // Format resource hash
  const resourceHash = result.resourceHash.startsWith('0x') 
    ? result.resourceHash as Hash
    : `0x${result.resourceHash}` as Hash;

  // Submit flag transaction
  const txHash = await walletClient.writeContract({
    address: config.oracleAddress,
    abi: ORACLE_ABI,
    functionName: 'flagResource',
    args: [resourceHash as `0x${string}`, evidenceHash as `0x${string}`],
    value: minDeposit
  });

  // Wait for confirmation
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  
  // Extract flagId from logs (simplified - would need proper event parsing)
  const flagId = receipt.logs[0]?.topics[1] || txHash;

  return {
    resourceHash,
    evidenceHash,
    txHash,
    flagId: flagId as Hash
  };
}

/**
 * Check if we have enough balance to submit flag
 */
export async function checkBalance(config: OracleConfig): Promise<{
  address: Address;
  balance: bigint;
  minDeposit: bigint;
  canFlag: boolean;
}> {
  const chain = config.network === 'mainnet' ? base : baseSepolia;
  const rpcUrl = config.rpcUrl || (config.network === 'mainnet' 
    ? 'https://mainnet.base.org'
    : 'https://sepolia.base.org');

  const account = privateKeyToAccount(config.privateKey as `0x${string}`);
  
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl)
  });

  const [balance, minDeposit] = await Promise.all([
    publicClient.getBalance({ address: account.address }),
    publicClient.readContract({
      address: config.oracleAddress,
      abi: ORACLE_ABI,
      functionName: 'minFlagDeposit'
    })
  ]);

  return {
    address: account.address,
    balance,
    minDeposit,
    canFlag: balance >= minDeposit
  };
}
